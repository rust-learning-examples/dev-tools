import { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'
import Home from '../views/home'
import NotFound from '../views/404'
import Login from '../views/login'

export default defineRoutes([
  { path: '404', element: <NotFound /> },
  { path: 'login', element: <Login /> },
  { path: 'home', element: <Home /> },
  // 路由懒加载
  { path: 'settings', component: () => import('../views/settings'),
    children: [
      { index: true, component: () => import('../views/settings/default') },
      { path: 'menus', component: () => import('../views/settings/menus') },
      { path: 'roles', component: () => import('../views/settings/roles') },
      { path: '*', element: <Navigate replace to="" /> },
    ]
  },
  { path: 'clipboardHistories', component: () => import('../views/clipboardHistories') },
  { path: '/', extract: true, element: <Navigate replace to="/home" /> },
  { path: '*', element: <Navigate replace to="/404" /> },
])

export function defineRoutes(routes) {
  const iterateUseRoute = (route) => {
    if (route.children) {
      route.children = route.children.map(route => iterateUseRoute(route))
    }
    if (typeof route.component === 'function') {
      const item = { component: lazy(route.component) }
      //delete route.component
      route.element = (
        <Suspense fallback={ <div>路由加载中...</div> }>
          <item.component />
        </Suspense>
      )
    }
    return route
  }
  return routes.map(route => iterateUseRoute(route))
}