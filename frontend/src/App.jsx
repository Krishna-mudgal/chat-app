import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login';
import Signup from './pages/Signup';
import Channel from './pages/Channel';
import Profile from './components/Profile';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "login",
    element: <Login />
  },
  {
    path: "signup",
    element: <Signup />
  },
  {
    path: "channels",
    element: <Channel />
  },
  {
    path: "profile",
    element: <Profile />
  }
])

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App
