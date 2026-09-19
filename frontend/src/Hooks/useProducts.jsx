import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Fetches a filtered/paginated product list from the backend and exposes
 * create/update/delete actions for the dashboard.
 *
 * Usage:
 *   const { products, loading, error, totalPages, addProduct, updateProduct, deleteProduct }
 *     = useProducts({ productType: 'Men', category: 'Topwear', page: 1, limit: 20 });
 */
const useProducts = (filters = {}) => {
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const {
        productType,
        category,
        subCategory,
        search,
        isFeatured,
        isNewArrival,
        page = 1,
        limit = 20,
    } = filters;

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = { page, limit };
            if (productType) params.productType = productType;
            if (category) params.category = category;
            if (subCategory) params.subCategory = subCategory;
            if (search) params.search = search;
            if (isFeatured !== undefined) params.isFeatured = isFeatured;
            if (isNewArrival !== undefined) params.isNewArrival = isNewArrival;

            const res = await axios.get(`${API_BASE_URL}/products`, { params });

            setProducts(res.data.products);
            setTotal(res.data.total);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    }, [productType, category, subCategory, search, isFeatured, isNewArrival, page, limit]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const addProduct = async (productData) => {
        const res = await axios.post(`${API_BASE_URL}/products`, productData);
        await fetchProducts();
        return res.data;
    };

    const updateProduct = async (id, updatedFields) => {
        const res = await axios.patch(`${API_BASE_URL}/products/${id}`, updatedFields);
        await fetchProducts();
        return res.data;
    };

    const deleteProduct = async (id) => {
        const res = await axios.delete(`${API_BASE_URL}/products/${id}`);
        setProducts((prev) => prev.filter((p) => p._id !== id)); // optimistic update
        return res.data;
    };

    return {
        products,
        total,
        totalPages,
        loading,
        error,
        refetch: fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
    };
};

export default useProducts;

// import React, { useEffect, useState } from 'react'

// const API_URL = import.meta.env.VITE_API_URL;

// const UseProducts = () => {
//     const [products, setProducts] = useState([]);
//     const [productsLoading, setProductsLoading] = useState(true);

//     // console.log(products)

//     useEffect(() =>{
//     const fetchProducts = async () =>{

//         setProductsLoading(true);

//         try{
//             const response = await fetch(`${API_URL}/products`)

//             if (!response.ok) {
//                throw new Error(
//                `Failed to fetch categories: ${response.status} ${response.statusText}`
//                  );
//               }

//             const products =await response.json();
//             setProducts(products)
            
            
//         }
        
//         catch{
//             ((error) => {
//             console.error("Fetch Error:", error);
//         });
//         }
//         finally{
//             setProductsLoading(false)
//         }
      
//     } 
    
//     fetchProducts();
//     }, [])
//   return [products, productsLoading]
// }

// export default UseProducts;







// Old Version

// import React, { useEffect, useState } from 'react';

// const UseProducts = () => {
//     const [data, setData] = useState([]);
//     const [loading, setLoading] = useState(true);
//         console.log(data);
//         useEffect(()=>{
//             fetch("/products.json")
//             .then(res => res.json())
//             .then(data => {
                
//                 setData(data);
//                 setLoading(false)
//             })
//         },[])
//         return [data, loading]
// };

// export default UseProducts;


// import { useEffect, useState } from 'react';

// const useProducts = () => {
//     const [data, setData] = useState([]);
//     const [loading, setLoading] = useState(true);

//     console.log(data);

//     useEffect(() => {
//         fetch('http://localhost:5000/products')
//             .then(res => res.json())
//             .then(data => {
//                 console.log("Full Data:", data);
//                 console.log("Products:", data.products);

//                 console.log(data.products);
//                 setLoading(false);
//             })
//             .catch(error => {
//                 console.error("Fetch Error:", error);
//                 setLoading(false);
//             });
//     }, []);

//     return [data, loading];
// };

// export default useProducts;
