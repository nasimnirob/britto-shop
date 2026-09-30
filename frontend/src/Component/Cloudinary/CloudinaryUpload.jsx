// import React, { useRef, useState } from "react";
// import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
// import toast from "react-hot-toast";

// const CloudinaryUpload = ({
//     value = "",
//     onChange,
//     label = "Upload Image",
//     accept = "image/jpeg,image/png,image/webp",
//     maxSizeMB = 5,
//     disabled = false,
// }) => {
//     const inputRef = useRef(null);

//     const [uploading, setUploading] = useState(false);
//     const [dragActive, setDragActive] = useState(false);

//     const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
//     const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

//     const uploadToCloudinary = async (file) => {
//         if (!cloudName || !uploadPreset) {
//             throw new Error(
//                 "Cloudinary configuration is missing. Check your .env file."
//             );
//         }

//         const maxSize = maxSizeMB * 1024 * 1024;

//         if (file.size > maxSize) {
//             throw new Error(`Image size must be less than ${maxSizeMB}MB.`);
//         }

//         if (!file.type.startsWith("image/")) {
//             throw new Error("Please select a valid image file.");
//         }

//         const formData = new FormData();

//         formData.append("file", file);
//         formData.append("upload_preset", uploadPreset);

//         const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

//         const response = await fetch(uploadUrl, {
//             method: "POST",
//             body: formData,
//         });

//         const data = await response.json();

//         if (!response.ok) {
//             throw new Error(
//                 data?.error?.message || "Cloudinary image upload failed."
//             );
//         }

//         return data.secure_url;
//     };

//     const handleFile = async (file) => {
//         if (!file || uploading || disabled) return;

//         try {
//             setUploading(true);

//             const imageUrl = await uploadToCloudinary(file);

//             onChange?.(imageUrl);

//             toast.success("Image uploaded successfully.");
//         } catch (error) {
//             console.error("Cloudinary upload error:", error);

//             toast.error(error.message || "Image upload failed.");
//         } finally {
//             setUploading(false);
//         }
//     };

//     const handleFileChange = (event) => {
//         const file = event.target.files?.[0];

//         if (file) {
//             handleFile(file);
//         }

//         event.target.value = "";
//     };

//     const handleDrop = (event) => {
//         event.preventDefault();

//         setDragActive(false);

//         if (disabled || uploading) return;

//         const file = event.dataTransfer.files?.[0];

//         if (file) {
//             handleFile(file);
//         }
//     };

//     const handleDragOver = (event) => {
//         event.preventDefault();

//         if (!disabled && !uploading) {
//             setDragActive(true);
//         }
//     };

//     const handleDragLeave = (event) => {
//         event.preventDefault();

//         setDragActive(false);
//     };

//     const handleRemove = () => {
//         if (uploading || disabled) return;

//         onChange?.("");

//         toast.success("Image removed.");
//     };

//     return (
//         <div className="w-full">
//             {label && (
//                 <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
//                     {label}
//                 </label>
//             )}

//             {value ? (
//                 <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5">
//                     <div className="aspect-video w-full">
//                         <img
//                             src={value}
//                             alt="Uploaded"
//                             className="h-full w-full object-cover"
//                         />
//                     </div>

//                     <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-black/60 p-3 backdrop-blur-sm">
//                         <button
//                             type="button"
//                             onClick={() => inputRef.current?.click()}
//                             disabled={uploading || disabled}
//                             className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
//                         >
//                             <Upload size={16} />
//                             Change
//                         </button>

//                         <button
//                             type="button"
//                             onClick={handleRemove}
//                             disabled={uploading || disabled}
//                             className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
//                         >
//                             <Trash2 size={16} />
//                             Remove
//                         </button>
//                     </div>
//                 </div>
//             ) : (
//                 <button
//                     type="button"
//                     onClick={() => inputRef.current?.click()}
//                     onDragOver={handleDragOver}
//                     onDragLeave={handleDragLeave}
//                     onDrop={handleDrop}
//                     disabled={uploading || disabled}
//                     className={`
//             flex
//             min-h-[220px]
//             w-full
//             flex-col
//             items-center
//             justify-center
//             rounded-xl
//             border-2
//             border-dashed
//             px-6
//             py-8
//             text-center
//             transition
//             ${dragActive
//                             ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
//                             : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10"
//                         }
//             ${uploading || disabled
//                             ? "cursor-not-allowed opacity-60"
//                             : "cursor-pointer"
//                         }
//           `}
//                 >
//                     {uploading ? (
//                         <>
//                             <Loader2
//                                 size={38}
//                                 className="mb-3 animate-spin text-blue-500"
//                             />

//                             <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
//                                 Uploading image...
//                             </p>

//                             <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
//                                 Please wait
//                             </p>
//                         </>
//                     ) : (
//                         <>
//                             <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
//                                 <ImagePlus size={24} />
//                             </div>

//                             <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
//                                 Click to upload or drag & drop
//                             </p>

//                             <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
//                                 JPG, PNG or WebP · Max {maxSizeMB}MB
//                             </p>
//                         </>
//                     )}
//                 </button>
//             )}

//             <input
//                 ref={inputRef}
//                 type="file"
//                 accept={accept}
//                 onChange={handleFileChange}
//                 className="hidden"
//                 disabled={uploading || disabled}
//             />
//         </div>
//     );
// };

// export default CloudinaryUpload;



import React, { useEffect, useRef, useState } from "react";
import { ImagePlus, X, Upload, Check } from "lucide-react";
import toast from "react-hot-toast";

const UPLOAD_WIDGET_SCRIPT =
    "https://upload-widget.cloudinary.com/latest/global/all.js";

const MEDIA_LIBRARY_SCRIPT =
    "https://media-library.cloudinary.com/global/all.js";

const loadScript = (src, id) => {
    return new Promise((resolve, reject) => {
        const existingScript = document.getElementById(id);

        if (existingScript) {
            if (window.cloudinary) {
                resolve();
                return;
            }

            existingScript.addEventListener("load", resolve);
            existingScript.addEventListener("error", reject);
            return;
        }

        const script = document.createElement("script");

        script.id = id;
        script.src = src;
        script.async = true;

        script.onload = () => resolve();
        script.onerror = () =>
            reject(new Error("Failed to load Cloudinary script."));

        document.body.appendChild(script);
    });
};

const CloudinaryUpload = ({
    value = [],
    onChange,
    multiple = true,
    maxFiles = 10,
    folder = "products",

    label = "Product Images",
    buttonText = "Add Images",

    acceptedFormats = ["jpg", "jpeg", "png", "webp"],
}) => {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("upload");

    const [selectedImages, setSelectedImages] = useState([]);

    const [widgetReady, setWidgetReady] = useState(false);
    const [loading, setLoading] = useState(false);

    const uploadWidgetRef = useRef(null);
    const mediaLibraryRef = useRef(null);

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    /*
     * Normalize value
     *
     * Single:
     * value = "https://..."
     *
     * Multiple:
     * value = ["https://...", "https://..."]
     */
    const normalizedValue = multiple
        ? Array.isArray(value)
            ? value
            : value
                ? [value]
                : []
        : value
            ? [value]
            : [];

    /*
     * Load Cloudinary scripts
     */
    useEffect(() => {
        if (!open) return;

        let cancelled = false;

        const loadCloudinary = async () => {
            try {
                setLoading(true);

                await loadScript(UPLOAD_WIDGET_SCRIPT, "cloudinary-upload-widget");

                await loadScript(
                    MEDIA_LIBRARY_SCRIPT,
                    "cloudinary-media-library-widget"
                );

                if (!cancelled) {
                    setWidgetReady(true);
                }
            } catch (error) {
                console.error(error);
                toast.error("Cloudinary widget load failed.");
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadCloudinary();

        return () => {
            cancelled = true;
        };
    }, [open]);

    /*
     * Open modal
     */
    const handleOpen = () => {
        setSelectedImages(normalizedValue);
        setActiveTab("upload");
        setOpen(true);
    };

    /*
     * Close modal
     */
    const handleClose = () => {
        setOpen(false);
        setActiveTab("upload");
        setSelectedImages([]);
    };

    /*
     * Add image to selected list
     */
    const addImage = (url) => {
        if (!url) return;

        setSelectedImages((prev) => {
            if (!multiple) {
                return [url];
            }

            if (prev.includes(url)) {
                return prev;
            }

            if (prev.length >= maxFiles) {
                toast.error(`You can select maximum ${maxFiles} images.`);
                return prev;
            }

            return [...prev, url];
        });
    };

    /*
     * Remove selected image
     */
    const removeImage = (index) => {
        setSelectedImages((prev) =>
            prev.filter((_, imageIndex) => imageIndex !== index)
        );
    };

    /*
     * Create Upload Widget
     */
    const createUploadWidget = () => {
        if (!window.cloudinary) {
            toast.error("Cloudinary is not ready.");
            return;
        }

        if (!cloudName || !uploadPreset) {
            toast.error("Cloudinary environment variables are missing.");
            return;
        }

        if (uploadWidgetRef.current) {
            return uploadWidgetRef.current;
        }

        const widget = window.cloudinary.createUploadWidget(
            {
                cloudName,
                uploadPreset,

                multiple,

                maxFiles: multiple ? maxFiles : 1,

                folder,

                sources: ["local", "camera"],

                clientAllowedFormats: acceptedFormats,

                maxFileSize: 5 * 1024 * 1024,

                resourceType: "image",

                showAdvancedOptions: false,

                cropping: false,

                styles: {
                    palette: {
                        window: "#ffffff",
                        windowBorder: "#d1d5db",
                        tabIcon: "#374151",
                        menuIcons: "#374151",
                        textDark: "#111827",
                        textLight: "#ffffff",
                        link: "#2563eb",
                        action: "#f59e0b",
                        inactiveTabIcon: "#6b7280",
                        error: "#dc2626",
                        inProgress: "#2563eb",
                        complete: "#16a34a",
                        sourceBg: "#f9fafb",
                    },
                },
            },

            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);

                    toast.error(
                        error?.statusText ||
                        error?.message ||
                        "Cloudinary upload failed."
                    );

                    return;
                }

                if (!result) return;

                /*
                 * Upload successful
                 */
                if (result.event === "success") {
                    const secureUrl = result.info?.secure_url;

                    if (!secureUrl) return;

                    addImage(secureUrl);

                    toast.success("Image uploaded successfully.");
                }
            }
        );

        uploadWidgetRef.current = widget;

        return widget;
    };

    /*
     * Open Upload Widget
     */
    useEffect(() => {
        if (!open) return;
        if (!widgetReady) return;
        if (activeTab !== "upload") return;

        const widget = createUploadWidget();

        if (!widget) return;

        /*
         * We don't open Cloudinary's own modal here.
         * Instead user clicks the upload area below.
         */
    }, [open, widgetReady, activeTab]);

    /*
     * Open upload widget
     */
    const handleUploadClick = () => {
        const widget = createUploadWidget();

        if (!widget) return;

        widget.open();
    };

    /*
     * Create Media Library
     */
    const openMediaLibrary = async () => {
        if (!window.cloudinary) {
            toast.error("Cloudinary is not ready.");
            return;
        }

        if (!cloudName) {
            toast.error("Cloudinary cloud name is missing.");
            return;
        }

        try {
            setLoading(true);

            /*
             * Destroy old instance if needed
             */
            if (mediaLibraryRef.current) {
                try {
                    mediaLibraryRef.current.hide();
                } catch (error) {
                    console.warn(error);
                }

                mediaLibraryRef.current = null;
            }

            const mediaLibrary = window.cloudinary.createMediaLibrary(
                {
                    cloud_name: cloudName,

                    multiple,

                    max_files: multiple ? maxFiles : 1,

                    search: {
                        expression: "resource_type:image",
                    },

                    folder: {
                        path: folder,
                        resource_type: "image",
                    },
                },
                {
                    insertHandler: (data) => {
                        const assets = data?.assets || [];

                        if (!assets.length) return;

                        assets.forEach((asset) => {
                            const url =
                                asset.secure_url ||
                                asset.url ||
                                asset.delivery_url ||
                                "";

                            if (url) {
                                addImage(url);
                            }
                        });

                        toast.success(
                            assets.length === 1
                                ? "Image selected from Media Library."
                                : `${assets.length} images selected.`
                        );
                    },
                }
            );

            mediaLibraryRef.current = mediaLibrary;

            mediaLibrary.show();
        } catch (error) {
            console.error("Media Library error:", error);

            toast.error("Could not open Media Library.");
        } finally {
            setLoading(false);
        }
    };

    /*
     * Save selected images
     */
    const handleAddToGallery = () => {
        if (!selectedImages.length) {
            toast.error("Please select at least one image.");
            return;
        }

        if (multiple) {
            onChange?.(selectedImages);
        } else {
            onChange?.(selectedImages[0] || "");
        }

        toast.success(
            multiple
                ? `${selectedImages.length} image${selectedImages.length > 1 ? "s" : ""
                } added.`
                : "Image added."
        );

        handleClose();
    };

    /*
     * Cleanup
     */
    useEffect(() => {
        return () => {
            try {
                uploadWidgetRef.current?.destroy?.();
            } catch (error) {
                console.warn(error);
            }

            try {
                mediaLibraryRef.current?.hide?.();
            } catch (error) {
                console.warn(error);
            }
        };
    }, []);

    return (
        <>
            {/* =========================
          MAIN FIELD
      ========================= */}

            <div className="w-full">
                {label && (
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                        {label}
                    </label>
                )}

                {/* Existing images */}
                {normalizedValue.length > 0 && (
                    <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {normalizedValue.map((image, index) => (
                            <div
                                key={`${image}-${index}`}
                                className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-white/5"
                            >
                                <img
                                    src={image}
                                    alt={`Product ${index + 1}`}
                                    className="h-full w-full object-cover"
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        const updated = normalizedValue.filter(
                                            (_, imageIndex) => imageIndex !== index
                                        );

                                        onChange?.(multiple ? updated : "");
                                    }}
                                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-500"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add button */}
                <button
                    type="button"
                    onClick={handleOpen}
                    className="flex min-h-[150px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center transition hover:border-gray-400 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10"
                >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-gray-200">
                        <ImagePlus size={24} />
                    </div>

                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {buttonText}
                    </span>

                    <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Upload new images or choose from Media Library
                    </span>
                </button>
            </div>

            {/* =========================
          MODAL
      ========================= */}

            {open && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#1c1c1d]">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-white/10">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Select Images
                                </h2>

                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Upload new images or select existing images.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="px-5 pt-5">
                            <div className="flex w-full rounded-md bg-gray-100 p-1 dark:bg-white/5">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("upload")}
                                    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition ${activeTab === "upload"
                                            ? "bg-white text-gray-900 shadow-sm dark:bg-white/10 dark:text-white"
                                            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                        }`}
                                >
                                    <Upload size={16} />
                                    Upload Files
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab("library");

                                        /*
                                         * Open Cloudinary Media Library
                                         */
                                        setTimeout(() => {
                                            openMediaLibrary();
                                        }, 100);
                                    }}
                                    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition ${activeTab === "library"
                                            ? "bg-white text-gray-900 shadow-sm dark:bg-white/10 dark:text-white"
                                            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                        }`}
                                >
                                    <ImagePlus size={16} />
                                    Media Library
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="min-h-0 flex-1 overflow-y-auto p-5">
                            {activeTab === "upload" && (
                                <div className="flex min-h-[360px] flex-col">
                                    {/* Upload area */}
                                    <button
                                        type="button"
                                        onClick={handleUploadClick}
                                        disabled={loading || !widgetReady}
                                        className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
                                    >
                                        {loading || !widgetReady ? (
                                            <>
                                                <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-gray-800 dark:border-white/10 dark:border-t-white" />

                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    Loading Cloudinary...
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-gray-300">
                                                    <ImagePlus size={32} />
                                                </div>

                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                    Drag & drop files here
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                    or{" "}
                                                    <span className="font-medium text-blue-600 dark:text-blue-400">
                                                        click to browse
                                                    </span>
                                                </p>

                                                <p className="mt-3 text-xs text-gray-400">
                                                    JPG, JPEG, PNG, WebP · Max 5MB each
                                                </p>
                                            </>
                                        )}
                                    </button>

                                    {/* Newly selected/uploaded images */}
                                    {selectedImages.length > 0 && (
                                        <div className="mt-5">
                                            <div className="mb-3 flex items-center justify-between">
                                                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                                                    Selected Images
                                                </h3>

                                                <span className="text-xs text-gray-500">
                                                    {selectedImages.length}
                                                    {multiple ? ` / ${maxFiles}` : ""}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                                                {selectedImages.map((image, index) => (
                                                    <div
                                                        key={`${image}-${index}`}
                                                        className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-white/10"
                                                    >
                                                        <img
                                                            src={image}
                                                            alt={`Selected ${index + 1}`}
                                                            className="h-full w-full object-cover"
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-500"
                                                        >
                                                            <X size={14} />
                                                        </button>

                                                        <div className="absolute bottom-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                                                            <Check size={13} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "library" && (
                                <div className="flex min-h-[360px] items-center justify-center">
                                    <div className="text-center">
                                        <ImagePlus
                                            size={42}
                                            className="mx-auto mb-4 text-gray-400"
                                        />

                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            Cloudinary Media Library
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Select existing images from your Cloudinary account.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={openMediaLibrary}
                                            className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                                        >
                                            Open Media Library
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-5 py-4 dark:border-white/10">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {selectedImages.length > 0
                                    ? `${selectedImages.length} image${selectedImages.length > 1 ? "s" : ""
                                    } selected`
                                    : "No images selected"}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/10"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleAddToGallery}
                                    disabled={!selectedImages.length}
                                    className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Add to Gallery
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CloudinaryUpload;