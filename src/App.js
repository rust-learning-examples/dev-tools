import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import routes from './routes'
import './App.scss';
import { Layout, Space, Button } from 'antd'

function App(props) {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <Layout>
      { ['/shortcutClipboardHistories'].indexOf(location.pathname) === -1 ? <Layout.Header>
        <Space>
          {
            [
              {path: '/clipboardHistories', name: '剪切板记录'},
              {path: '/scripts', name: '脚本'},
            ].map(route => (
              <Button key={route.path} size="small" type={location.pathname === route.path ? 'primary' : 'default'} onClick={() => navigate(route.path)}>
                {route.name}
              </Button>)
            )
          }
        </Space>
        {/*<ul>*/}
        {/*  <li><Link to="/">Home</Link></li>*/}
        {/*  <li><Link to="/login">Login</Link></li>*/}
        {/*  <li><Link to="/settings">Settings</Link></li>*/}
        {/*  <li><Link to="/clipboardHistories">剪切板记录</Link></li>*/}
        {/*  <li><Link to="/scripts">脚本</Link></li>*/}
        {/*</ul>*/}
      </Layout.Header> : null}
      <Layout.Content>
        <Routes>
          { routes.map(route => (
            <Route key={route.path} {...route}>
              { route.children?.map(route => <Route key={route.path || 'index'} {...route}></Route>) }
            </Route>
          )) },
        </Routes>
      </Layout.Content>
      {/*<Layout.Footer></Layout.Footer>*/}
    </Layout>
  );
}

export default App;
