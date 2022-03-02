import { Routes, Route, Link } from 'react-router-dom'
import routes from './routes'
import './App.scss';

function App() {
  return (
    <>
      {/*header*/}
      <div>
        header
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/settings">Settings</Link></li>
        </ul>
        <hr/>
      </div>
      <Routes>
        { routes.map(route => (
          <Route key={route.path} {...route}>
            { route.children?.map(route => <Route key={route.path || 'index'} {...route}></Route>) }
          </Route>
        )) },
      </Routes>
      {/*footer*/}
      <div>
        <hr/>
        footer
      </div>
    </>
  );
}

export default App;
