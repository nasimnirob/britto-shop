import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ------------------------------------------------------------
// Helper: Auth headers
// ------------------------------------------------------------
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

// ------------------------------------------------------------
// Helper: Fetch wrapper
// ------------------------------------------------------------
const handleResponse = async (response) => {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(
            data?.message || `Request failed with status ${response.status}`
        );
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
};

// ============================================================
// MAIN HOOK
// ============================================================
const useBundleProducts = (options = {}) => {
    const {
        autoFetch = true,
        initialFilters = {
            search: '',
            isActive: 'true',
            page: 1,
            limit: 10,
        },
    } = options;

    // ----------------------------------------------------------
    // LIST STATE
    // ----------------------------------------------------------
    const [bundles, setBundles] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });
    const [filters, setFilters] = useState(initialFilters);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ----------------------------------------------------------
    // SINGLE BUNDLE STATE
    // ----------------------------------------------------------
    const [singleBundle, setSingleBundle] = useState(null);
    const [singleLoading, setSingleLoading] = useState(true);
    const [singleError, setSingleError] = useState(null);

    // ----------------------------------------------------------
    // MUTATION STATE
    // ----------------------------------------------------------
    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // ==========================================================
    // 1. GET /bundle-products — LIST
    // ==========================================================
    const fetchBundles = useCallback(
        async (customFilters = {}) => {
            const activeFilters = { ...filters, ...customFilters };

            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();

                if (activeFilters.search)
                    params.append('search', activeFilters.search);

                if (activeFilters.isActive !== undefined)
                    params.append('isActive', activeFilters.isActive);

                if (activeFilters.page)
                    params.append('page', activeFilters.page);

                if (activeFilters.limit)
                    params.append('limit', activeFilters.limit);

                const response = await fetch(
                    `${API_BASE_URL}/bundle-products?${params.toString()}`,
                    {
                        method: 'GET',
                        headers: getAuthHeaders(),
                    }
                );

                const data = await handleResponse(response);

                setBundles(data.bundles || []);
                setPagination(
                    data.pagination || {
                        total: data.total || 0,
                        page: data.page || 1,
                        limit: data.limit || 10,
                        totalPages: data.totalPages || 0,
                    }
                );

                return data;
            } catch (err) {
                console.error('fetchBundles error:', err);
                setError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [filters]
    );

    // ==========================================================
    // 2. GET /bundle-products/:id — SINGLE BY ID
    // ==========================================================
    const fetchBundleById = useCallback(async (id) => {
        if (!id) {
            setSingleError('Bundle ID is required');
            return null;
        }

        setSingleLoading(true);
        setSingleError(null);

        try {
            const response = await fetch(
                `${API_BASE_URL}/bundle-products/${id}`,
                {
                    method: 'GET',
                    headers: getAuthHeaders(),
                }
            );

            const data = await handleResponse(response);

            setSingleBundle(data.bundle);
            return data.bundle;
        } catch (err) {
            console.error('fetchBundleById error:', err);
            setSingleError(err.message);
            throw err;
        } finally {
            setSingleLoading(false);
        }
    }, []);

    // ==========================================================
    // 3. GET /bundle-products — FIND BY SLUG (search + detail)
    // ==========================================================
    // const fetchBundleBySlug = useCallback(async (slug) => {
    //     if (!slug) {
    //         setSingleError('Bundle slug is required');
    //         return null;
    //     }

    //     setSingleLoading(true);
    //     setSingleError(null);

    //     try {
    //         // ---- Step 1: Search by slug (include all status) ----
    //         const params = new URLSearchParams({
    //             search: slug,
    //             isActive: 'all',
    //             limit: 50,
    //         });

    //         const listRes = await fetch(
    //             `${API_BASE_URL}/bundle-products?${params.toString()}`,
    //             {
    //                 method: 'GET',
    //                 headers: getAuthHeaders(),
    //             }
    //         );

    //         const listData = await handleResponse(listRes);

    //         const target = String(slug).trim().toLowerCase();

    //         const found = (listData.bundles || []).find(
    //             (b) => String(b.slug).trim().toLowerCase() === target
    //         );

    //         if (!found) {
    //             throw new Error('Bundle not found');
    //         }

    //         // ---- Step 2: Fetch full details (populated) ----
    //         const detailRes = await fetch(
    //             `${API_BASE_URL}/bundle-products/${found._id}`,
    //             {
    //                 method: 'GET',
    //                 headers: getAuthHeaders(),
    //             }
    //         );

    //         const detailData = await handleResponse(detailRes);

    //         setSingleBundle(detailData.bundle);
    //         return detailData.bundle;
    //     } catch (err) {
    //         console.error('fetchBundleBySlug error:', err);
    //         setSingleError(err.message);
    //         throw err;
    //     } finally {
    //         setSingleLoading(false);
    //     }
    // }, []);

    const fetchBundleBySlug = useCallback(async (slug) => {
        if (!slug) {
            setSingleError('Bundle slug is required');
            return null;
        }

        setSingleLoading(true);
        setSingleError(null);

        try {
            // ✅ SINGLE API call — fast!
            const res = await fetch(
                `${API_BASE_URL}/bundle-products/slug/${slug}`,
                { method: 'GET', headers: getAuthHeaders() }
            );

            const data = await handleResponse(res);

            setSingleBundle(data.bundle);
            return data.bundle;
        } catch (err) {
            console.error('fetchBundleBySlug error:', err);
            setSingleError(err.message);
            throw err;
        } finally {
            setSingleLoading(false);
        }
    }, []);

    // ==========================================================
    // 4. POST /bundle-products — CREATE
    // ==========================================================
    const createBundle = useCallback(
        async (payload) => {
            setCreating(true);
            setError(null);

            try {
                const response = await fetch(
                    `${API_BASE_URL}/bundle-products`,
                    {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify(payload),
                    }
                );

                const data = await handleResponse(response);

                await fetchBundles();

                return data;
            } catch (err) {
                console.error('createBundle error:', err);
                setError(err.message);
                throw err;
            } finally {
                setCreating(false);
            }
        },
        [fetchBundles]
    );

    // ==========================================================
    // 5. PATCH /bundle-products/:id — UPDATE
    // ==========================================================
    const updateBundle = useCallback(
        async (id, payload) => {
            if (!id) throw new Error('Bundle ID is required');

            setUpdating(true);
            setError(null);

            try {
                const response = await fetch(
                    `${API_BASE_URL}/bundle-products/${id}`,
                    {
                        method: 'PATCH',
                        headers: getAuthHeaders(),
                        body: JSON.stringify(payload),
                    }
                );

                const data = await handleResponse(response);

                if (singleBundle?._id === id) {
                    setSingleBundle(data.bundle);
                }

                await fetchBundles();

                return data.bundle;
            } catch (err) {
                console.error('updateBundle error:', err);
                setError(err.message);
                throw err;
            } finally {
                setUpdating(false);
            }
        },
        [fetchBundles, singleBundle]
    );

    // ==========================================================
    // 6. DELETE /bundle-products/:id — SOFT DELETE
    // ==========================================================
    const deleteBundle = useCallback(
        async (id) => {
            if (!id) throw new Error('Bundle ID is required');

            setDeleting(true);
            setError(null);

            try {
                const response = await fetch(
                    `${API_BASE_URL}/bundle-products/${id}`,
                    {
                        method: 'DELETE',
                        headers: getAuthHeaders(),
                    }
                );

                const data = await handleResponse(response);

                setBundles((prev) =>
                    prev.filter((b) => String(b._id) !== String(id))
                );

                if (String(singleBundle?._id) === String(id)) {
                    setSingleBundle(null);
                }

                return data;
            } catch (err) {
                console.error('deleteBundle error:', err);
                setError(err.message);
                throw err;
            } finally {
                setDeleting(false);
            }
        },
        [singleBundle]
    );

    // ==========================================================
    // HELPERS
    // ==========================================================
    const updateFilters = useCallback((newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    }, []);

    const resetError = useCallback(() => setError(null), []);
    const resetSingleError = useCallback(() => setSingleError(null), []);
    const resetSingleBundle = useCallback(() => setSingleBundle(null), []);

    // ==========================================================
    // AUTO FETCH (list) on filter change
    // ==========================================================
    useEffect(() => {
        if (autoFetch) {
            fetchBundles();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.page, filters.limit, filters.search, filters.isActive]);

    // ==========================================================
    // RETURN
    // ==========================================================
    return {
        // ---- list ----
        bundles,
        pagination,
        filters,
        loading,
        error,

        // ---- single ----
        singleBundle,
        singleLoading,
        singleError,

        // ---- mutation flags ----
        creating,
        updating,
        deleting,

        // ---- methods ----
        fetchBundles,
        fetchBundleById,
        fetchBundleBySlug,   // ⬅️ নতুন যোগ হয়েছে
        createBundle,
        updateBundle,
        deleteBundle,

        // ---- helpers ----
        updateFilters,
        resetError,
        resetSingleError,
        resetSingleBundle,
        setFilters,
        setSingleBundle,
    };
};

export default useBundleProducts;