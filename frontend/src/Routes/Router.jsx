import { createBrowserRouter, Navigate, replace } from "react-router-dom";
import MainLayout from "../Layout/MainLayout";
import AdminMainLayout from '../Dashboard/layout/AdminMainLayout'
import Error from "../Pages/Error";
import Home from "../Pages/Home/Home/Home";
import Login from "../Pages/Login/Login";
import Register from "../Pages/Register/Register";
import Product from "../Pages/Products/Products/Shop";
import Cart from "../Pages/Cart/Cart/Cart";
import Wishlist from "../Pages/Wishlist/Wishlist/Wishlist";
import Orders from "../Pages/Orders/Orders/Orders";
import OurCategory from "../Pages/OurCategories/OurCategory/OurCategory";
import ProductDetails from "../Component/Product/ProductDetails";
import Dashboard from "../Dashboard/Pages/Dashboard";
import User from "../Dashboard/Pages/User";
import MainContent from "../Dashboard/component/MainContent";
import SiteSettings from "../Dashboard/Pages/SiteSettings";
import Profile from "../Pages/UsersAccount/UsersAccounts/Profile";
import Checkout from "../Pages/Checkout/Checkout";





const Router = createBrowserRouter([
    {
        id: "root",
        path: '/',
        element: <MainLayout />,
        errorElement: <Error />,
        children: [
            {
                path: '/',
                errorElement: <Error />,
                element: <Home />
            },
            {
                path: '/shop',
                errorElement: <Error />,
                element: <Product />,
                // loader: ()=> fetch('/products.json')
            },
            {
                path: '/cart',
                errorElement: <Error />,
                element: <Cart />
            },
            {
                path: '/wishlist',
                errorElement: <Error />,
                element: <Wishlist />
            },
            {
                path: '/category/:productType/:category/:subCategory',
                errorElement: <Error />,
                element: <OurCategory />
            },
            // {
            //     path: '/category/:category',
            //     errorElement: <Error />,
            //     element: <OurCategory />
            // },
            {
                path: '/orders/:category',
                errorElement: <Error />,
                element: <Orders />
            },
            // {
            //     path: '/orders',
            //     errorElement: <Error />,
            //     element: <Navigate to="/orders/electronic" replace />,
            // },

            {
                path: '/login',
                errorElement: <Error />,
                element: <Login />
            }
            ,
            {
                path: '/register',
                errorElement: <Error />,
                element: <Register />
            }
            ,
            {
                path: '/product/:id',
                errorElement: <Error />,
                element: <ProductDetails />
            }
            ,
            {
                path: '/checkout',
                errorElement: <Error />,
                element: <Checkout />
            }
            ,
            {
                path: '/profile',
                errorElement: <Error />,
                element: <Profile />
            }
            ,

        ]

    },
    {
        path: '/admin',
        element: <AdminMainLayout />,
        errorElement: <Error />,
        children: [
            {
                path: '/admin/dashboard',
                errorElement: <Error />,
                element: <Dashboard></Dashboard>
            },
            {
                path: '/admin',
                errorElement: <Error />,
                element: <MainContent></MainContent>
            },
            {
                path: '/admin/user',
                errorElement: <Error />,
                element: <User></User>
            }
            ,
            {
                path: '/admin/sitesettings',
                errorElement: <Error />,
                element: <SiteSettings></SiteSettings>
            }
        ]
    },
])
export default Router;