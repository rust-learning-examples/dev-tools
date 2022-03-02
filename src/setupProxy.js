const { createProxyMiddleware } = require('http-proxy-middleware')

const mockData = {
  'GET /api/users': {
    hello: 'world'
  }
}

module.exports = function(app) {
  app.use(
    process.env.REACT_APP_API_BASE_URL,
    // Mock middleware
    (req, res, next) => {
      const mockPath = `^${req.method} ${req.originalUrl}$`
      console.log('Request Mock URL:', req.method, req.originalUrl)
      for (const key in mockData) {
        if (new RegExp(mockPath, 'i').test(key)) {
          //res.json({hello: 'world'})
          res.send(mockData[key])
          return
        }
      }
      next()
    },
    // Proxy middleware
    createProxyMiddleware({
      target: 'http://localhost:8800',
      changeOrigin: true,
      //ws: true, // 配置ws跨域
      //secure: false, // https协议才设置
      //loglevel: 'debug',
      //rewrite: path => path.replace(/^\/api/, '')
    })
  )
}