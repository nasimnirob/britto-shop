import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const useSizes = (group = "") => {
    const [sizes, setSizes] = useState([]);
    const [sizesLoading, setSizesLoading] = useState(true);
    const [sizesError, setSizesError] = useState(null);

    const fetchSizes = useCallback(async () => {
        setSizesLoading(true);
        setSizesError(null);

        try {
            const params = {};

            if (group) {
                params.group = group;
            }

            const res = await axios.get(
                `${API_BASE_URL}/sizes`,
                {
                    params,
                }
            );

            setSizes(res.data || []);
        } catch (err) {
            console.error(err);

            setSizesError(
                err?.response?.data?.message ||
                "Failed to fetch sizes"
            );

            setSizes([]);
        } finally {
            setSizesLoading(false);
        }
    }, [group]);

    useEffect(() => {
        fetchSizes();
    }, [fetchSizes]);

    const addSize = async (data) => {
        try {
            const res = await axios.post(
                `${API_BASE_URL}/sizes`,
                data
            );

            await fetchSizes();

            return res.data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const updateSize = async (id, data) => {
        try {
            const res = await axios.patch(
                `${API_BASE_URL}/sizes/${id}`,
                data
            );

            await fetchSizes();

            return res.data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const deleteSize = async (id) => {
        try {
            const res = await axios.delete(
                `${API_BASE_URL}/sizes/${id}`
            );

            setSizes((prev) =>
                prev.filter(
                    (size) => size._id !== id
                )
            );

            return res.data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    return {
        sizes,
        sizesLoading,
        sizesError,
        addSize,
        updateSize,
        deleteSize,
        refetch: fetchSizes,
    };
};

export default useSizes;
