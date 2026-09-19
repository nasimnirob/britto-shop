import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Fetches the category tree: [{ type: "Men", categories: [{ category, subCategories: [] }] }, ...]
 */
const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
};

export default useCategories;


// import { useEffect, useState } from "react";


// const API_URL = import.meta.env.VITE_API_URL;


// const useCategories = () => {
//   const [categories, setCategories] = useState([]);
//   const [categoriesLoading, setCategoriesLoading] = useState(true);

//   // console.log(categories)

//   useEffect(() => {
//     const fetchCategories = async () => {

//       setCategoriesLoading(true);

//       try {
//         const response = await fetch(`${API_URL}/categories`)

//         if (!response.ok) {
//           throw new Error(
//             `Failed to fetch categories: ${response.status} ${response.statusText}`
//           );
//         }

//         console.log(response)
//         const categories = await response.json()
//         setCategories(categories[0]);

//       }
//       catch {
//         ((error) => {
//           console.error("Fetch Error:", error);
//         });

//       }
//       finally {
//         setCategoriesLoading(false);
//       }
//     }

//     fetchCategories();
//   }, [])

//   return [categories, categoriesLoading]
// }

// export default useCategories;


// Old Version
// import UseProducts from "./UseProducts";


// const useCategory = () => {
//     const [data] = UseProducts();
//     const uniqueCategory = [...new Set(data.map((item) => item.category))];
//     return uniqueCategory;
// };

// export default useCategory;