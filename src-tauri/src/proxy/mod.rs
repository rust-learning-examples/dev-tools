#![forbid(unsafe_code)]
use axum::{
    http::{
        // StatusCode,
        Method,
        Request,
        Response,
        uri::Uri,
        HeaderValue,
        header,
    },
    // body::{Body},
    response::{IntoResponse, Redirect},
    routing,
    Router,
    extract::{Extension, Path, Query},
};
use tower_http::cors::{self, CorsLayer};
use hyper::{client::{Client, HttpConnector}, Body};
use hyper_tls::HttpsConnector;
use serde_json::{Value};
use std::net::SocketAddr;
use regex::Regex;

use std::sync::Mutex;
// use std::convert::TryFrom;

lazy_static::lazy_static! {
    static ref SERVER_CONFIG_CELL: Mutex<Option<Value>> = Mutex::new(None);
}

pub fn update_server_config_cell(value: Value) {
    *SERVER_CONFIG_CELL.lock().unwrap() = Some(value);
}

pub async fn start_reverse_proxy_server() -> Result<(), &'static str> {
    if SERVER_CONFIG_CELL.lock().unwrap().is_none() {
        return Err("no config");
    }

    let mut port: u16 = 3999;
    if let Some(config) = &*SERVER_CONFIG_CELL.lock().unwrap() {
        port = config["port"].as_u64().unwrap() as u16;
    }

    // let clinet = Client::new(); // only support http
    let https = HttpsConnector::new();
    let client = Client::builder().build::<_, Body>(https);

    // build our application with a route
    let app = Router::new()
        // `GET /` goes to `root`
        .route("/redirect/*__origin__", routing::any(redirect_handler))
        .route("/proxy/*__origin__", routing::any(proxy_handler))
        .layer(
            // see https://docs.rs/tower-http/latest/tower_http/cors/index.html
            // for more details
            CorsLayer::new()
                .allow_methods(vec![Method::GET, Method::POST, Method::PUT, Method::PATCH, Method::DELETE])
                .allow_origin(cors::Any)
                .allow_headers(vec![header::HeaderName::from_bytes(b"*").unwrap()])
                .allow_credentials(false)
        )
        .layer(Extension(client));

    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    match axum::Server::bind(&addr)
        .http1_preserve_header_case(true)
        .http1_title_case_headers(true)
        .serve(app.into_make_service())
        .await {
        Ok(_) => Ok(()),
        _ => Err("Failed to start service")
    }
}

async fn redirect_handler(Path(origin): Path<String>, Query(_params): Query<Value>, req: Request<Body>) -> impl IntoResponse {
    // println!("get_handler called {:?}, req: {:?}", params, req);
    let origin = origin.strip_prefix("/").unwrap();
    let target_uri = get_full_url(&origin, &req);
    // println!("uri: {:?}", target_uri);
    Redirect::temporary(target_uri)
    // (StatusCode::OK, origin)
}

// https://github.com/tokio-rs/axum/blob/main/examples/reverse-proxy/src/main.rs
async fn proxy_handler(Path(origin): Path<String>, Extension(client): Extension<Client<HttpsConnector<HttpConnector>, Body>>, mut req: Request<Body>) -> Response<Body> {
    let origin = origin.strip_prefix("/").unwrap();
    let target_uri = get_full_url(origin, &req);
    *req.uri_mut() = target_uri.clone();
    // 自定义追加header, 解决目标接口跨域限制
    req.headers_mut().insert(header::HOST, HeaderValue::from_str(target_uri.host().unwrap()).unwrap());
    client.request(req).await.unwrap()
}

fn get_full_url(origin: &str, req: &Request<Body>) -> Uri {
    let mut origin = origin.to_string();
    // 计算final_origin
    if let Some(config) = &*SERVER_CONFIG_CELL.lock().unwrap() {
        let data = config["data"].as_array().unwrap();
        for item in data.iter() {
            let target = item["target"].as_str().unwrap();
            let final_target = item["finalTarget"].as_str().unwrap();
            let regex = Regex::new(&target).unwrap();
            if regex.is_match(&origin) {
                origin = regex.replace_all(&origin, final_target).to_string();
                break;
            }
        }
    }

    let cur_uri = req.uri();
    let mut full_url = origin.to_owned();
    if let Some(raw_query) = cur_uri.query() {
        full_url.push_str("?");
        full_url.push_str(raw_query);
    }
    full_url.parse().unwrap()
}

