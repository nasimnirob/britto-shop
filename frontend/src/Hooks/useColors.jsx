// import { useState, useEffect, useCallback } from "react";
// import axios from "axios";

// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// const useColors = () => {
//     const [colors, setColors] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const fetchColors = useCallback(async () => {
//         setLoading(true);
//         try {
//             const res = await axios.get(`${API_BASE_URL}/colors`);
//             setColors(res.data);
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchColors();
//     }, [fetchColors]);

//     const addColor = async (data) => {
//         await axios.post(`${API_BASE_URL}/colors`, data);
//         await fetchColors();
//     };

//     const updateColor = async (id, data) => {
//         await axios.patch(`${API_BASE_URL}/colors/${id}`, data);
//         await fetchColors();
//     };

//     const deleteColor = async (id) => {
//         await axios.delete(`${API_BASE_URL}/colors/${id}`);
//         setColors((prev) => prev.filter((c) => c._id !== id));
//     };

//     return { colors, loading, addColor, updateColor, deleteColor };
// };

// export default useColors;





import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const useColors = () => {
    const [colors, setColors] = useState([]);
    const [colorsLoading, setColorsLoading] = useState(true);
    const [colorsError, setColorsError] = useState(null);

    const fetchColors = useCallback(async () => {
        setColorsLoading(true);
        setColorsError(null);

        try {
            const res = await axios.get(
                `${API_BASE_URL}/colors`
            );

            setColors(res.data || []);
        } catch (err) {
            console.error(err);

            setColorsError(
                err?.response?.data?.message ||
                "Failed to fetch colors"
            );

            setColors([]);
        } finally {
            setColorsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchColors();
    }, [fetchColors]);

    const addColor = async (data) => {
        try {
            const res = await axios.post(
                `${API_BASE_URL}/colors`,
                data
            );

            await fetchColors();

            return res.data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const updateColor = async (id, data) => {
        try {
            const res = await axios.patch(
                `${API_BASE_URL}/colors/${id}`,
                data
            );

            await fetchColors();

            return res.data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const deleteColor = async (id) => {
        try {
            const res = await axios.delete(
                `${API_BASE_URL}/colors/${id}`
            );

            setColors((prev) =>
                prev.filter(
                    (color) => color._id !== id
                )
            );

            return res.data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    return {
        colors,
        colorsLoading,
        colorsError,
        addColor,
        updateColor,
        deleteColor,
        refetch: fetchColors,
    };
};

export default useColors;
