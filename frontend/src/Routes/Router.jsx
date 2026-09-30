import { createBrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "../Layout/MainLayout";
import AdminMainLayout from "../Dashboard/layout/AdminMainLayout";

import Error from "../Pages/Error";

import Home from "../Pages/Home/Home/Home";
import Login from "../Pages/Login/Login";
import Register from "../Pages/Register/Register";
import Cart from "../Pages/Cart/Cart/Cart";
import Wishlist from "../Pages/Wishlist/Wishlist/Wishlist";
import OurCategory from "../Pages/OurCategories/OurCategory/OurCategory";
import ProductDetails from "../Component/Product/ProductDetails";
import Profile from "../Pages/UsersAccount/UsersAccounts/Profile";
import Checkout from "../Pages/Checkout/Checkout";

// Dashboard
import Dashboard from "../Dashboard/Pages/Dashboard";
import Users from "../Dashboard/Pages/Users";
import Employees from "../Dashboard/Pages/Employees";
import Admin from "../Dashboard/Pages/Admin";

import Products from "../Dashboard/Pages/Products";
import BundleProducts from "../Dashboard/Pages/BundleProducts";

// Orders
import Orders from "../Dashboard/Pages/Orders";
import IncompleteOrders from "../Dashboard/Pages/IncompleteOrders";
import ReturnRequests from "../Dashboard/Pages/ReturnRequests";

// Catalog
import ProductTypes from "../Dashboard/Pages/ProductTypes";
import ProductCategories from "../Dashboard/Pages/ProductCategories";
import SubCategories from "../Dashboard/Pages/SubCategories";
import ProductColors from "../Dashboard/Pages/ProductColors";
import Sizes from "../Dashboard/Pages/Sizes";
import Tags from "../Dashboard/Pages/Tags";
import ProductFAQ from "../Dashboard/Pages/ProductFAQ";

// Marketing
import Campaigns from "../Dashboard/Pages/Campaigns";
import Discount from "../Dashboard/Pages/Discount";
import Coupons from "../Dashboard/Pages/Coupons";

// Settings
import Settings from "../Dashboard/Pages/Settings";
import ProductCreate from "../Dashboard/Pages/ProductCreate";
import ProductEdit from "../Dashboard/Pages/ProductEdit";
import SizeCharts from "../Dashboard/Pages/SizeCharts";


const Router = createBrowserRouter([
    // =========================
    // PUBLIC WEBSITE
    // =========================
    {
        id: "root",
        path: "/",
        element: <MainLayout />,
        errorElement: <Error />,
        children: [
            {
                index: true,
                element: <Home />,
            },

            {
                path: "cart",
                element: <Cart />,
            },

            {
                path: "wishlist",
                element: <Wishlist />,
            },

            {
                path: "category/:productType",
                element: <OurCategory />,
            },

            {
                path: "category/:productType/:category",
                element: <OurCategory />,
            },

            {
                path: "category/:productType/:category/:subCategory",
                element: <OurCategory />,
            },

            {
                path: "product/:id",
                element: <ProductDetails />,
            },

            {
                path: "login",
                element: <Login />,
            },

            {
                path: "register",
                element: <Register />,
            },

            {
                path: "checkout",
                element: <Checkout />,
            },

            {
                path: "profile",
                element: <Profile />,
            },
        ],
    },


    // =========================
    // ADMIN DASHBOARD
    // =========================
    {
        path: "/admin",
        element: <AdminMainLayout />,
        errorElement: <Error />,
        children: [

            // /admin
            {
                index: true,
                element: <Navigate to="dashboard" replace />,
            },


            // =========================
            // DASHBOARD
            // =========================
            {
                path: "dashboard",
                element: <Dashboard />,
            },


            // =========================
            // USERS
            // =========================
            {
                path: "users",
                element: <Users />,
            },

            {
                path: "users/customers",
                element: <Users />,
            },

            {
                path: "users/employees",
                element: <Employees />,
            },

            {
                path: "users/admins",
                element: <Admin />,
            },


            // =========================
            // PRODUCTS
            // =========================
            {
                path: "products",
                element: <Products />,
            },

            {
                path: "products/create",
                element: <ProductCreate />,
            },

            // {
            //     path: "products/:id",
            //     element: <ProductDetails />,
            // },

            {
                path: "products/:id/edit",
                element: <ProductEdit />,
            },

            {
                path: "bundle-products",
                element: <BundleProducts />,
            },


            // =========================
            // ORDERS
            // =========================
            {
                path: "orders",
                element: <Orders />,
            },

            {
                path: "orders/incomplete",
                element: <IncompleteOrders />,
            },

            {
                path: "orders/returns",
                element: <ReturnRequests />,
            },


            // =========================
            // CATALOG
            // =========================
            {
                path: "catalog/product-types",
                element: <ProductTypes />,
            },

            {
                path: "catalog/categories",
                element: <ProductCategories />,
            },

            {
                path: "catalog/sub-categories",
                element: <SubCategories />,
            },

            {
                path: "catalog/colors",
                element: <ProductColors />,
            },

            {
                path: "catalog/sizes",
                element: <Sizes />,
            },

            {
                path: "catalog/sizes-charts",
                element: <SizeCharts />,
            },

            {
                path: "catalog/tags",
                element: <Tags />,
            },

            {
                path: "catalog/product-faq",
                element: <ProductFAQ />,
            },


            // =========================
            // MARKETING
            // =========================
            {
                path: "marketing/campaigns",
                element: <Campaigns />,
            },

            {
                path: "marketing/discounts",
                element: <Discount />,
            },

            {
                path: "marketing/coupons",
                element: <Coupons />,
            },


            // =========================
            // SETTINGS
            // =========================
            {
                path: "settings",
                element: <Settings />,
            },
        ],
    },
]);

export default Router;



// import { createBrowserRouter } from "react-router-dom";
// import MainLayout from "../Layout/MainLayout";
// import AdminMainLayout from '../Dashboard/layout/AdminMainLayout'
// import Error from "../Pages/Error";
// import Home from "../Pages/Home/Home/Home";
// import Login from "../Pages/Login/Login";
// import Register from "../Pages/Register/Register";
// import Cart from "../Pages/Cart/Cart/Cart";
// import Wishlist from "../Pages/Wishlist/Wishlist/Wishlist";
// import OurCategory from "../Pages/OurCategories/OurCategory/OurCategory";
// import ProductDetails from "../Component/Product/ProductDetails";
// import Dashboard from "../Dashboard/Pages/Dashboard";
// import Users from "../Dashboard/Pages/Users";
// import Profile from "../Pages/UsersAccount/UsersAccounts/Profile";
// import Checkout from "../Pages/Checkout/Checkout";
// import Employees from "../Dashboard/Pages/Employees";
// import Admin from "../Dashboard/Pages/Admin";
// import Products from "../Dashboard/Pages/Products";
// import BundleProducts from "../Dashboard/Pages/BundleProducts";
// import Tags from "../Dashboard/Pages/Tags";
// import Campaigns from "../Dashboard/Pages/Campaigns";
// import Orders from "../Dashboard/Pages/Orders";
// import IncompleteOrders from "../Dashboard/Pages/IncompleteOrders";
// import ReturnRequests from "../Dashboard/Pages/ReturnRequests";
// import ProductFAQ from "../Dashboard/Pages/ProductFAQ";
// import ProductTypes from "../Dashboard/Pages/ProductTypes";
// import ProductCategories from "../Dashboard/Pages/ProductCategories";
// import ProductColors from "../Dashboard/Pages/ProductColors";
// import Sizes from "../Dashboard/Pages/Sizes";
// import Discount from "../Dashboard/Pages/Discount";
// import Coupons from "../Dashboard/Pages/Coupons";
// import Settings from "../Dashboard/Pages/Settings";
// import SubCategories from "../Dashboard/Pages/SubCategories";





// const Router = createBrowserRouter([
//     {
//         id: "root",
//         path: '/',
//         element: <MainLayout />,
//         errorElement: <Error />,
//         children: [
//             {
//                 path: '/',
//                 errorElement: <Error />,
//                 element: <Home />
//             },
//             {
//                 path: '/cart',
//                 errorElement: <Error />,
//                 element: <Cart />
//             },
//             {
//                 path: '/wishlist',
//                 errorElement: <Error />,
//                 element: <Wishlist />
//             },
//             {
//                 path: '/category/:productType',
//                 errorElement: <Error />,
//                 element: <OurCategory />
//             },
//             {
//                 path: '/category/:productType/:category',
//                 errorElement: <Error />,
//                 element: <OurCategory />
//             },
//             {
//                 path: '/category/:productType/:category/:subCategory',
//                 errorElement: <Error />,
//                 element: <OurCategory />
//             },
//             {
//                 path: '/login',
//                 errorElement: <Error />,
//                 element: <Login />
//             },
//             {
//                 path: '/register',
//                 errorElement: <Error />,
//                 element: <Register />
//             },
//             {
//                 path: '/product/:id',
//                 errorElement: <Error />,
//                 element: <ProductDetails />
//             },
//             {
//                 path: '/checkout',
//                 errorElement: <Error />,
//                 element: <Checkout />
//             },
//             {
//                 path: '/profile',
//                 errorElement: <Error />,
//                 element: <Profile />
//             },
//         ]

//     },
//     {
//         path: '/admin',
//         element: <AdminMainLayout />,
//         errorElement: <Error />,
//         children: [
//             {
//                 path: '/admin/dashboard',
//                 errorElement: <Error />,
//                 element: <Dashboard></Dashboard>
//             },
//             {
//                 path: '/admin/users',
//                 errorElement: <Error />,
//                 element: <Users></Users>
//             },
//             {
//                 path: '/admin/users/employees',
//                 errorElement: <Error />,
//                 element: <Employees></Employees>
//             },
//             {
//                 path: '/admin/users/admins',
//                 errorElement: <Error />,
//                 element: <Admin></Admin>
//             },


//             {
//                 path: '/admin/products',
//                 errorElement: <Error />,
//                 element: <Products></Products>
//             },
//             {
//                 path: '/admin/products/create',
//                 errorElement: <Error />,
//                 element: <Products></Products>
//             },
//             {
//                 path: '/admin/products/:id',
//                 errorElement: <Error />,
//                 element: <Products></Products>
//             },
//             {
//                 path: '/admin/products/:id/edit',
//                 errorElement: <Error />,
//                 element: <Products></Products>
//             },


//             {
//                 path: '/admin/bundle-products',
//                 errorElement: <Error />,
//                 element: <BundleProducts></BundleProducts>
//             },
//             {
//                 path: '/admin/campaigns',
//                 errorElement: <Error />,
//                 element: <Campaigns></Campaigns>
//             },
//             {
//                 path: '/admin/tags',
//                 errorElement: <Error />,
//                 element: <Tags></Tags>
//             },
//             {
//                 path: '/admin/orders',
//                 errorElement: <Error />,
//                 element: <Orders></Orders>
//             },
//             {
//                 path: '/admin/incomplete-orders',
//                 errorElement: <Error />,
//                 element: <IncompleteOrders></IncompleteOrders>
//             },
//             {
//                 path: '/admin/attributes/return-requests',
//                 errorElement: <Error />,
//                 element: <ReturnRequests></ReturnRequests>
//             },
//             {
//                 path: '/admin/attributes/product-faq',
//                 errorElement: <Error />,
//                 element: <ProductFAQ></ProductFAQ>
//             },
//             {
//                 path: '/admin/attributes/product-types',
//                 errorElement: <Error />,
//                 element: <ProductTypes></ProductTypes>
//             },
//             {
//                 path: '/admin/attributes/sub-categories',
//                 errorElement: <Error />,
//                 element: <SubCategories></SubCategories>
//             },
//             {
//                 path: '/admin/attributes/product-categories',
//                 errorElement: <Error />,
//                 element: <ProductCategories></ProductCategories>
//             },
//             {
//                 path: '/admin/attributes/product-colors',
//                 errorElement: <Error />,
//                 element: <ProductColors></ProductColors>
//             },
//             {
//                 path: '/admin/attributes/sizes',
//                 errorElement: <Error />,
//                 element: <Sizes></Sizes>
//             },
//             {
//                 path: '/admin/attributes/discount',
//                 errorElement: <Error />,
//                 element: <Discount></Discount>
//             },
//             {
//                 path: '/admin/attributes/coupons',
//                 errorElement: <Error />,
//                 element: <Coupons></Coupons>
//             },
//             {
//                 path: '/admin/settings',
//                 errorElement: <Error />,
//                 element: <Settings></Settings>
//             }
//         ]
//     },
// ])
// export default Router;





// {
//     path: '/admin',
//     errorElement: <Error />,
//     element: <MainContent></MainContent>
// },

// {
//             path: '/shop',
//             errorElement: <Error />,
//             element: <Product />,
// },

// {
// path: '/category/:category',
//     errorElement: <Error />,
//         element: <OurCategory />
// },
// {
// path: '/orders/:category',
//     errorElement: <Error />,
//         element: <MyOrders />
// },
// {
// path: '/orders',
//     errorElement: <Error />,
//         element: <Navigate to="/orders/electronic" replace />,
// },