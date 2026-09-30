import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    X,
    Upload,
    Image as ImageIcon,
    Check,
    Search,
    Loader2,
    Plus,
    Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const CLOUDINARY_CLOUD_NAME =
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const CLOUDINARY_UPLOAD_PRESET =
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const MediaLibrary = ({
    value = [],
    onChange,
    multiple = true,
    maxFiles = 20,
    buttonText = "Select Images",
}) => {
    const [open, setOpen] = useState(false);

    const [activeTab, setActiveTab] = useState("library");

    const [media, setMedia] = useState([]);

    const [selectedImages, setSelectedImages] = useState(
        Array.isArray(value) ? value : value ? [value] : []
    );

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(false);

    const [uploading, setUploading] = useState(false);

    const [nextCursor, setNextCursor] = useState(null);

    const [dragActive, setDragActive] = useState(false);

    const fileInputRef = useRef(null);

    // -----------------------------------
    // Sync value from parent
    // -----------------------------------

    useEffect(() => {
        setSelectedImages(
            Array.isArray(value)
                ? value
                : value
                    ? [value]
                    : []
        );
    }, [value]);

    // -----------------------------------
    // Fetch media
    // -----------------------------------

    const fetchMedia = async ({
        cursor = null,
        append = false,
    } = {}) => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            params.set("limit", "40");

            if (cursor) {
                params.set("next_cursor", cursor);
            }

            const response = await fetch(
                `${API_URL}/media?${params.toString()}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to load media"
                );
            }

            setMedia((prev) =>
                append
                    ? [...prev, ...(data.resources || [])]
                    : data.resources || []
            );

            setNextCursor(data.next_cursor || null);
        } catch (error) {
            console.error(error);

            toast.error(
                error.message || "Failed to load media library"
            );
        } finally {
            setLoading(false);
        }
    };

    // -----------------------------------
    // Load library when opened
    // -----------------------------------

    useEffect(() => {
        if (!open) return;

        fetchMedia();
    }, [open]);

    // -----------------------------------
    // Filter media
    // -----------------------------------

    const filteredMedia = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return media;
        }

        return media.filter((item) => {
            return (
                item.public_id
                    ?.toLowerCase()
                    .includes(keyword) ||
                item.display_name
                    ?.toLowerCase()
                    .includes(keyword)
            );
        });
    }, [media, search]);

    // -----------------------------------
    // Upload single file
    // -----------------------------------

    const uploadFile = async (file) => {
        if (!file) return null;

        // File type validation
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error(
                `${file.name}: Only JPG, PNG and WebP are allowed`
            );

            return null;
        }

        // 10MB limit
        if (file.size > 10 * 1024 * 1024) {
            toast.error(
                `${file.name}: Maximum file size is 10MB`
            );

            return null;
        }

        const formData = new FormData();

        formData.append("file", file);

        formData.append(
            "upload_preset",
            CLOUDINARY_UPLOAD_PRESET
        );

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error?.message ||
                    "Cloudinary upload failed"
                );
            }

            return data;
        } catch (error) {
            console.error(error);

            toast.error(
                `${file.name}: ${error.message || "Upload failed"
                }`
            );

            return null;
        }
    };

    // -----------------------------------
    // Upload files
    // -----------------------------------

    const handleFiles = async (files) => {
        const fileList = Array.from(files || []);

        if (!fileList.length) return;

        try {
            setUploading(true);

            const results = [];

            for (const file of fileList) {
                const result = await uploadFile(file);

                if (result) {
                    results.push(result);
                }
            }

            if (!results.length) {
                return;
            }

            toast.success(
                `${results.length} image${results.length > 1 ? "s" : ""
                } uploaded successfully`
            );

            // Refresh library
            await fetchMedia();

            // Automatically switch to library
            setActiveTab("library");
        } finally {
            setUploading(false);
        }
    };

    // -----------------------------------
    // File input
    // -----------------------------------

    const handleFileInput = (event) => {
        const files = event.target.files;

        handleFiles(files);

        event.target.value = "";
    };

    // -----------------------------------
    // Drag events
    // -----------------------------------

    const handleDragEnter = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setDragActive(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setDragActive(false);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setDragActive(true);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setDragActive(false);

        const files = event.dataTransfer.files;

        handleFiles(files);
    };

    // -----------------------------------
    // Select image
    // -----------------------------------

    const toggleImage = (url) => {
        if (multiple) {
            setSelectedImages((prev) => {
                const exists = prev.includes(url);

                if (exists) {
                    return prev.filter(
                        (item) => item !== url
                    );
                }

                if (prev.length >= maxFiles) {
                    toast.error(
                        `Maximum ${maxFiles} images allowed`
                    );

                    return prev;
                }

                return [...prev, url];
            });

            return;
        }

        setSelectedImages([url]);
    };

    // -----------------------------------
    // Check selected
    // -----------------------------------

    const isSelected = (url) => {
        return selectedImages.includes(url);
    };

    // -----------------------------------
    // Add selected images
    // -----------------------------------

    const handleAddToProduct = () => {
        if (!selectedImages.length) {
            toast.error("Please select at least one image");

            return;
        }

        if (multiple) {
            onChange(selectedImages);
        } else {
            onChange(selectedImages[0] || "");
        }

        setOpen(false);
    };

    // -----------------------------------
    // Remove selected image
    // -----------------------------------

    const removeSelected = (url) => {
        setSelectedImages((prev) =>
            prev.filter((item) => item !== url)
        );
    };

    // -----------------------------------
    // Load more
    // -----------------------------------

    const handleLoadMore = () => {
        if (!nextCursor || loading) return;

        fetchMedia({
            cursor: nextCursor,
            append: true,
        });
    };

    return (
        <>
            {/* =============================== */}
            {/* OPEN MEDIA BUTTON */}
            {/* =============================== */}

            <button
                type="button"
                onClick={() => setOpen(true)}
                className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-gray-700
                    transition
                    hover:bg-gray-50
                "
            >
                <ImageIcon size={17} />

                {buttonText}
            </button>

            {/* =============================== */}
            {/* MODAL */}
            {/* =============================== */}

            {open && (
                <div
                    className="
                        fixed
                        inset-0
                        z-[9999]
                        flex
                        items-center
                        justify-center
                        bg-black/60
                        p-4
                        backdrop-blur-sm
                    "
                >
                    <div
                        className="
                            flex
                            h-[90vh]
                            w-full
                            max-w-6xl
                            flex-col
                            overflow-hidden
                            rounded-2xl
                            bg-white
                            shadow-2xl
                        "
                    >
                        {/* =============================== */}
                        {/* HEADER */}
                        {/* =============================== */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                border-b
                                border-gray-200
                                px-5
                                py-4
                            "
                        >
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Select Media
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    Upload or reuse images from your media library
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="
                                    rounded-full
                                    p-2
                                    text-gray-500
                                    transition
                                    hover:bg-gray-100
                                    hover:text-gray-900
                                "
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* =============================== */}
                        {/* TABS */}
                        {/* =============================== */}

                        <div
                            className="
                                flex
                                items-center
                                gap-6
                                border-b
                                border-gray-200
                                px-5
                            "
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setActiveTab("upload")
                                }
                                className={`
                                    relative
                                    flex
                                    items-center
                                    gap-2
                                    py-3
                                    text-sm
                                    font-medium
                                    ${activeTab === "upload"
                                        ? "text-gray-900"
                                        : "text-gray-500"
                                    }
                                `}
                            >
                                <Upload size={17} />

                                Upload Files

                                {activeTab === "upload" && (
                                    <span
                                        className="
                                            absolute
                                            bottom-0
                                            left-0
                                            right-0
                                            h-0.5
                                            bg-gray-900
                                        "
                                    />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setActiveTab("library")
                                }
                                className={`
                                    relative
                                    flex
                                    items-center
                                    gap-2
                                    py-3
                                    text-sm
                                    font-medium
                                    ${activeTab === "library"
                                        ? "text-gray-900"
                                        : "text-gray-500"
                                    }
                                `}
                            >
                                <ImageIcon size={17} />

                                Media Library

                                {activeTab === "library" && (
                                    <span
                                        className="
                                            absolute
                                            bottom-0
                                            left-0
                                            right-0
                                            h-0.5
                                            bg-gray-900
                                        "
                                    />
                                )}
                            </button>
                        </div>

                        {/* =============================== */}
                        {/* BODY */}
                        {/* =============================== */}

                        <div className="min-h-0 flex-1 overflow-y-auto">
                            {/* ================================= */}
                            {/* UPLOAD TAB */}
                            {/* ================================= */}

                            {activeTab === "upload" && (
                                <div className="flex h-full items-center justify-center p-8">
                                    <div
                                        onDragEnter={handleDragEnter}
                                        onDragLeave={handleDragLeave}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        className={`
                                            flex
                                            w-full
                                            max-w-2xl
                                            flex-col
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            border-2
                                            border-dashed
                                            p-16
                                            text-center
                                            transition
                                            ${dragActive
                                                ? "border-gray-900 bg-gray-50"
                                                : "border-gray-300 bg-gray-50/50"
                                            }
                                        `}
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2
                                                    size={42}
                                                    className="animate-spin text-gray-700"
                                                />

                                                <p className="mt-4 text-sm font-medium text-gray-800">
                                                    Uploading images...
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    Please wait
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <div
                                                    className="
                                                        flex
                                                        h-16
                                                        w-16
                                                        items-center
                                                        justify-center
                                                        rounded-full
                                                        bg-white
                                                        shadow-sm
                                                    "
                                                >
                                                    <Upload
                                                        size={28}
                                                        className="text-gray-700"
                                                    />
                                                </div>

                                                <h3 className="mt-5 text-base font-semibold text-gray-900">
                                                    Drag & drop images here
                                                </h3>

                                                <p className="mt-2 text-sm text-gray-500">
                                                    or choose images from your computer
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        fileInputRef.current?.click()
                                                    }
                                                    className="
                                                        mt-6
                                                        inline-flex
                                                        items-center
                                                        gap-2
                                                        rounded-lg
                                                        bg-gray-900
                                                        px-5
                                                        py-2.5
                                                        text-sm
                                                        font-medium
                                                        text-white
                                                        transition
                                                        hover:bg-gray-800
                                                    "
                                                >
                                                    <Plus size={17} />

                                                    Choose Files
                                                </button>

                                                <p className="mt-4 text-xs text-gray-400">
                                                    JPG, PNG, WebP • Maximum 10MB
                                                    per image
                                                </p>
                                            </>
                                        )}

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            multiple
                                            className="hidden"
                                            onChange={handleFileInput}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ================================= */}
                            {/* LIBRARY TAB */}
                            {/* ================================= */}

                            {activeTab === "library" && (
                                <div className="p-5">
                                    {/* Search */}

                                    <div className="mb-5 flex items-center gap-3">
                                        <div
                                            className="
                                                relative
                                                w-full
                                                max-w-md
                                            "
                                        >
                                            <Search
                                                size={17}
                                                className="
                                                    absolute
                                                    left-3
                                                    top-1/2
                                                    -translate-y-1/2
                                                    text-gray-400
                                                "
                                            />

                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) =>
                                                    setSearch(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Search media..."
                                                className="
                                                    w-full
                                                    rounded-lg
                                                    border
                                                    border-gray-300
                                                    py-2.5
                                                    pl-10
                                                    pr-4
                                                    text-sm
                                                    outline-none
                                                    focus:border-gray-500
                                                "
                                            />
                                        </div>

                                        <div className="ml-auto text-sm text-gray-500">
                                            {selectedImages.length} selected
                                        </div>
                                    </div>

                                    {/* Loading */}

                                    {loading && media.length === 0 ? (
                                        <div
                                            className="
                                                flex
                                                min-h-[300px]
                                                items-center
                                                justify-center
                                            "
                                        >
                                            <Loader2
                                                size={32}
                                                className="animate-spin text-gray-500"
                                            />
                                        </div>
                                    ) : filteredMedia.length === 0 ? (
                                        <div
                                            className="
                                                flex
                                                min-h-[300px]
                                                flex-col
                                                items-center
                                                justify-center
                                                text-center
                                            "
                                        >
                                            <ImageIcon
                                                size={45}
                                                className="text-gray-300"
                                            />

                                            <p className="mt-4 text-sm font-medium text-gray-700">
                                                No images found
                                            </p>

                                            <p className="mt-1 text-xs text-gray-400">
                                                Upload an image to your media library
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* IMAGE GRID */}

                                            <div
                                                className="
                                                    grid
                                                    grid-cols-2
                                                    gap-3
                                                    sm:grid-cols-3
                                                    md:grid-cols-4
                                                    lg:grid-cols-5
                                                    xl:grid-cols-6
                                                "
                                            >
                                                {filteredMedia.map(
                                                    (item) => {
                                                        const selected =
                                                            isSelected(
                                                                item.secure_url
                                                            );

                                                        return (
                                                            <button
                                                                type="button"
                                                                key={
                                                                    item.asset_id
                                                                }
                                                                onClick={() =>
                                                                    toggleImage(
                                                                        item.secure_url
                                                                    )
                                                                }
                                                                className={`
                                                                    group
                                                                    relative
                                                                    aspect-square
                                                                    overflow-hidden
                                                                    rounded-xl
                                                                    border-2
                                                                    bg-gray-100
                                                                    ${selected
                                                                        ? "border-gray-900"
                                                                        : "border-transparent"
                                                                    }
                                                                `}
                                                            >
                                                                <img
                                                                    src={
                                                                        item.secure_url
                                                                    }
                                                                    alt={
                                                                        item.display_name ||
                                                                        "Media"
                                                                    }
                                                                    className="
                                                                        h-full
                                                                        w-full
                                                                        object-cover
                                                                        transition
                                                                        duration-200
                                                                        group-hover:scale-105
                                                                    "
                                                                />

                                                                {/* Overlay */}

                                                                <div
                                                                    className={`
                                                                        absolute
                                                                        inset-0
                                                                        transition
                                                                        ${selected
                                                                            ? "bg-black/20"
                                                                            : "bg-black/0 group-hover:bg-black/10"
                                                                        }
                                                                    `}
                                                                />

                                                                {/* Selected */}

                                                                {selected && (
                                                                    <div
                                                                        className="
                                                                            absolute
                                                                            right-2
                                                                            top-2
                                                                            flex
                                                                            h-7
                                                                            w-7
                                                                            items-center
                                                                            justify-center
                                                                            rounded-full
                                                                            bg-gray-900
                                                                            text-white
                                                                        "
                                                                    >
                                                                        <Check
                                                                            size={
                                                                                16
                                                                            }
                                                                            strokeWidth={
                                                                                3
                                                                            }
                                                                        />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    }
                                                )}
                                            </div>

                                            {/* Load More */}

                                            {nextCursor && (
                                                <div className="mt-6 flex justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleLoadMore
                                                        }
                                                        disabled={
                                                            loading
                                                        }
                                                        className="
                                                            inline-flex
                                                            items-center
                                                            gap-2
                                                            rounded-lg
                                                            border
                                                            border-gray-300
                                                            bg-white
                                                            px-5
                                                            py-2.5
                                                            text-sm
                                                            font-medium
                                                            text-gray-700
                                                            hover:bg-gray-50
                                                            disabled:cursor-not-allowed
                                                            disabled:opacity-50
                                                        "
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <Loader2
                                                                    size={
                                                                        16
                                                                    }
                                                                    className="animate-spin"
                                                                />

                                                                Loading...
                                                            </>
                                                        ) : (
                                                            "Load More"
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* =============================== */}
                        {/* FOOTER */}
                        {/* =============================== */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                border-t
                                border-gray-200
                                bg-white
                                px-5
                                py-4
                            "
                        >
                            <div className="text-sm text-gray-500">
                                {selectedImages.length > 0
                                    ? `${selectedImages.length} image${selectedImages.length > 1
                                        ? "s"
                                        : ""
                                    } selected`
                                    : "No images selected"}
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="
                                        rounded-lg
                                        border
                                        border-gray-300
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-medium
                                        text-gray-700
                                        hover:bg-gray-50
                                    "
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleAddToProduct}
                                    disabled={
                                        selectedImages.length === 0
                                    }
                                    className="
                                        rounded-lg
                                        bg-gray-900
                                        px-5
                                        py-2.5
                                        text-sm
                                        font-medium
                                        text-white
                                        hover:bg-gray-800
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    Add to Product
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MediaLibrary;