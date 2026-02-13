// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter,RouterProvider } from 'react-router'
import './index.css'
import App from './App.tsx'
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Users from './pages/Users.tsx'
import Products from './pages/Products.tsx'
import Orders from './pages/Orders.tsx'
import Categories from './pages/Categories.tsx'
import Brands from './pages/Brands.tsx'
import Banners from './pages/Banners.tsx'
import Invoices from './pages/Invoices.tsx'
import Account from './pages/Account.tsx'

const router=createBrowserRouter([
  {path:"/login",element:<Login/>},
  {path:"/register",element:<Register/>},
  {path:"/",element:<App/>,children:[
{
  index:true,
  path:"/dashboard",
  element:<Dashboard/>
},{
  path:"/dashboard/users",
  element:<Users/>
},{
  path:"/dashboard/products",
  element:<Products/>
},{
  path:"/dashboard/orders",
  element:<Orders/>
},{
  path:"/dashboard/categories",
  element:<Categories/>
},{
  path:"/dashboard/brands",
  element:<Brands/>
},{
  path:"/dashboard/banners",
  element:<Banners/>
},{
  path:"/dashboard/invoices",
  element:<Invoices/>
},{
  path:"/dashboard/accounts",
  element:<Account/>
},    
  ]}])

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router}/>
  // <StrictMode>
  //   <App />
  // </StrictMode>,
)
