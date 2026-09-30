import { createContext, useContext, useEffect, useState } from "react";
import useProducts from "../Hooks/useProducts";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { products } = useProducts();

    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem("cart");

        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Latest product price দিয়ে old cart update
    useEffect(() => {
        if (!products?.length || !cartItems.length) {
            return;
        }

        setCartItems((currentItems) => {
            let hasChanged = false;

            const updatedItems = currentItems.map((item) => {
                const product = products.find(
                    (product) =>
                        product._id === item.productId
                );

                if (!product) {
                    return item;
                }

                // Selected variant
                const variant = product.variants?.find(
                    (variant) =>
                        String(variant.colorId) ===
                        String(item.colorId)
                );

                // Selected size
                const sizeData = variant?.sizes?.find(
                    (size) =>
                        String(size.sizeId) ===
                        String(item.sizeId)
                );

                // Variant + size price
                const latestPrice =
                    Number(
                        sizeData?.price?.sellingPrice
                    ) ||
                    Number(
                        product.price?.sellingPrice
                    ) ||
                    0;

                const latestMrp =
                    Number(
                        sizeData?.price?.mrp
                    ) ||
                    Number(
                        product.price?.mrp
                    ) ||
                    0;

                const latestStock =
                    Number(sizeData?.stock) || 0;

                if (
                    item.price !== latestPrice ||
                    item.mrp !== latestMrp ||
                    item.stock !== latestStock
                ) {
                    hasChanged = true;

                    return {
                        ...item,
                        price: latestPrice,
                        mrp: latestMrp,
                        stock: latestStock,
                    };
                }

                return item;
            });

            return hasChanged
                ? updatedItems
                : currentItems;
        });
    }, [products]);

    useEffect(() => {
        localStorage.setItem(
            "cart",
            JSON.stringify(cartItems)
        );
    }, [cartItems]);

    // Add to cart
    const addToCart = (productData) => {
        setCartItems((currentItems) => {
            const existingIndex = currentItems.findIndex(
                (item) =>
                    item.cartId === productData.cartId
            );

            if (existingIndex !== -1) {
                const updatedItems = [...currentItems];

                const existingItem =
                    updatedItems[existingIndex];

                const newQuantity =
                    existingItem.quantity +
                    productData.quantity;

                if (
                    productData.stock &&
                    newQuantity > productData.stock
                ) {
                    alert(
                        `Only ${productData.stock} items available`
                    );

                    return currentItems;
                }

                updatedItems[existingIndex] = {
                    ...existingItem,

                    // নতুন price-ও update হবে
                    price: productData.price,
                    mrp: productData.mrp,
                    stock: productData.stock,

                    quantity: newQuantity,
                };

                return updatedItems;
            }

            return [
                ...currentItems,
                productData,
            ];
        });
    };

    // Remove item
    const removeFromCart = (cartId) => {
        setCartItems((currentItems) =>
            currentItems.filter(
                (item) => item.cartId !== cartId
            )
        );
    };

    // Increase quantity
    const increaseQuantity = (cartId) => {
        setCartItems((currentItems) =>
            currentItems.map((item) => {
                if (item.cartId !== cartId) {
                    return item;
                }

                if (
                    item.stock &&
                    item.quantity >= item.stock
                ) {
                    return item;
                }

                return {
                    ...item,
                    quantity: item.quantity + 1,
                };
            })
        );
    };

    // Decrease quantity
    const decreaseQuantity = (cartId) => {
        setCartItems((currentItems) =>
            currentItems.map((item) => {
                if (item.cartId !== cartId) {
                    return item;
                }

                if (item.quantity <= 1) {
                    return item;
                }

                return {
                    ...item,
                    quantity: item.quantity - 1,
                };
            })
        );
    };

    // Direct quantity update
    const updateQuantity = (cartId, quantity) => {
        setCartItems((currentItems) =>
            currentItems.map((item) => {
                if (item.cartId !== cartId) {
                    return item;
                }

                const newQuantity = Math.max(
                    1,
                    Math.min(
                        Number(quantity),
                        item.stock ||
                        Number(quantity)
                    )
                );

                return {
                    ...item,
                    quantity: newQuantity,
                };
            })
        );
    };

    // Clear cart
    const clearCart = () => {
        setCartItems([]);
    };

    const totalItems = cartItems.reduce(
        (total, item) =>
            total + item.quantity,
        0
    );

    const totalPrice = cartItems.reduce(
        (total, item) =>
            total +
            item.price * item.quantity,
        0
    );

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error(
            "useCart must be used inside CartProvider"
        );
    }

    return context;
};





// import { createContext, useContext, useEffect, useState } from "react";

// const CartContext = createContext();

// export const CartProvider = ({ children }) => {
//     const [cartItems, setCartItems] = useState(() => {
//         const savedCart = localStorage.getItem("cart");

//         return savedCart ? JSON.parse(savedCart) : [];
//     });

//     useEffect(() => {
//         localStorage.setItem(
//             "cart",
//             JSON.stringify(cartItems)
//         );
//     }, [cartItems]);

//     // Add to cart
//     const addToCart = (productData) => {
//         setCartItems((currentItems) => {
//             const existingIndex = currentItems.findIndex(
//                 (item) =>
//                     item.cartId === productData.cartId
//             );

//             if (existingIndex !== -1) {
//                 const updatedItems = [...currentItems];

//                 const existingItem =
//                     updatedItems[existingIndex];

//                 const newQuantity =
//                     Number(existingItem.quantity) +
//                     Number(productData.quantity);

//                 if (
//                     productData.stock &&
//                     newQuantity > productData.stock
//                 ) {
//                     alert(
//                         `Only ${productData.stock} items available`
//                     );

//                     return currentItems;
//                 }

//                 updatedItems[existingIndex] = {
//                     ...existingItem,

//                     // Quantity যোগ হবে
//                     quantity: newQuantity,

//                     // নতুন price update হবে
//                     price: productData.price,

//                     // নতুন MRP update হবে
//                     mrp: productData.mrp,

//                     // নতুন stock update হবে
//                     stock: productData.stock,
//                 };

//                 return updatedItems;
//             }

//             // নতুন product হলে সরাসরি add
//             return [...currentItems, productData];
//         });
//     };

//     // Remove item
//     const removeFromCart = (cartId) => {
//         setCartItems((currentItems) =>
//             currentItems.filter(
//                 (item) => item.cartId !== cartId
//             )
//         );
//     };

//     // Increase quantity
//     const increaseQuantity = (cartId) => {
//         setCartItems((currentItems) =>
//             currentItems.map((item) => {
//                 if (item.cartId !== cartId) {
//                     return item;
//                 }

//                 if (
//                     item.stock &&
//                     item.quantity >= item.stock
//                 ) {
//                     return item;
//                 }

//                 return {
//                     ...item,
//                     quantity:
//                         Number(item.quantity) + 1,
//                 };
//             })
//         );
//     };

//     // Decrease quantity
//     const decreaseQuantity = (cartId) => {
//         setCartItems((currentItems) =>
//             currentItems.map((item) => {
//                 if (item.cartId !== cartId) {
//                     return item;
//                 }

//                 if (item.quantity <= 1) {
//                     return item;
//                 }

//                 return {
//                     ...item,
//                     quantity:
//                         Number(item.quantity) - 1,
//                 };
//             })
//         );
//     };

//     // Direct quantity update
//     const updateQuantity = (
//         cartId,
//         quantity
//     ) => {
//         setCartItems((currentItems) =>
//             currentItems.map((item) => {
//                 if (item.cartId !== cartId) {
//                     return item;
//                 }

//                 const newQuantity = Math.max(
//                     1,
//                     Math.min(
//                         Number(quantity),
//                         item.stock ||
//                         Number(quantity)
//                     )
//                 );

//                 return {
//                     ...item,
//                     quantity: newQuantity,
//                 };
//             })
//         );
//     };

//     // Clear cart
//     const clearCart = () => {
//         setCartItems([]);
//     };

//     // Total items
//     const totalItems = cartItems.reduce(
//         (total, item) =>
//             total + Number(item.quantity || 0),
//         0
//     );

//     // Total price
//     const totalPrice = cartItems.reduce(
//         (total, item) =>
//             total +
//             Number(item.price || 0) *
//             Number(item.quantity || 0),
//         0
//     );

//     const value = {
//         cartItems,
//         addToCart,
//         removeFromCart,
//         increaseQuantity,
//         decreaseQuantity,
//         updateQuantity,
//         clearCart,
//         totalItems,
//         totalPrice,
//     };

//     return (
//         <CartContext.Provider value={value}>
//             {children}
//         </CartContext.Provider>
//     );
// };

// export const useCart = () => {
//     const context = useContext(CartContext);

//     if (!context) {
//         throw new Error(
//             "useCart must be used inside CartProvider"
//         );
//     }

//     return context;
// };




// import { createContext, useContext, useEffect, useState } from "react";

// const CartContext = createContext();

// export const CartProvider = ({ children }) => {
//     const [cartItems, setCartItems] = useState(() => {
//         const savedCart = localStorage.getItem("cart");

//         return savedCart ? JSON.parse(savedCart) : [];
//     });

//     useEffect(() => {
//         localStorage.setItem("cart", JSON.stringify(cartItems));
//     }, [cartItems]);

//     // Add to cart
//     const addToCart = (productData) => {
//         setCartItems((currentItems) => {
//             const existingIndex = currentItems.findIndex(
//                 (item) => item.cartId === productData.cartId
//             );

//             if (existingIndex !== -1) {
//                 const updatedItems = [...currentItems];

//                 const existingItem = updatedItems[existingIndex];

//                 const newQuantity =
//                     existingItem.quantity + productData.quantity;

//                 if (
//                     productData.stock &&
//                     newQuantity > productData.stock
//                 ) {
//                     alert(
//                         `Only ${productData.stock} items available`
//                     );

//                     return currentItems;
//                 }

//                 updatedItems[existingIndex] = {
//                     ...existingItem,
//                     quantity: newQuantity,
//                 };

//                 return updatedItems;
//             }

//             return [...currentItems, productData];
//         });
//     };

//     // Remove item
//     const removeFromCart = (cartId) => {
//         setCartItems((currentItems) =>
//             currentItems.filter(
//                 (item) => item.cartId !== cartId
//             )
//         );
//     };

//     // Increase quantity
//     const increaseQuantity = (cartId) => {
//         setCartItems((currentItems) =>
//             currentItems.map((item) => {
//                 if (item.cartId !== cartId) {
//                     return item;
//                 }

//                 if (
//                     item.stock &&
//                     item.quantity >= item.stock
//                 ) {
//                     return item;
//                 }

//                 return {
//                     ...item,
//                     quantity: item.quantity + 1,
//                 };
//             })
//         );
//     };

//     // Decrease quantity
//     const decreaseQuantity = (cartId) => {
//         setCartItems((currentItems) =>
//             currentItems.map((item) => {
//                 if (item.cartId !== cartId) {
//                     return item;
//                 }

//                 if (item.quantity <= 1) {
//                     return item;
//                 }

//                 return {
//                     ...item,
//                     quantity: item.quantity - 1,
//                 };
//             })
//         );
//     };

//     // Direct quantity update
//     const updateQuantity = (cartId, quantity) => {
//         setCartItems((currentItems) =>
//             currentItems.map((item) => {
//                 if (item.cartId !== cartId) {
//                     return item;
//                 }

//                 const newQuantity = Math.max(
//                     1,
//                     Math.min(
//                         Number(quantity),
//                         item.stock || Number(quantity)
//                     )
//                 );

//                 return {
//                     ...item,
//                     quantity: newQuantity,
//                 };
//             })
//         );
//     };

//     // Clear cart
//     const clearCart = () => {
//         setCartItems([]);
//     };

//     // Total items
//     const totalItems = cartItems.reduce(
//         (total, item) => total + item.quantity,
//         0
//     );

//     // Total price
//     const totalPrice = cartItems.reduce(
//         (total, item) =>
//             total + item.price * item.quantity,
//         0
//     );

//     const value = {
//         cartItems,
//         addToCart,
//         removeFromCart,
//         increaseQuantity,
//         decreaseQuantity,
//         updateQuantity,
//         clearCart,
//         totalItems,
//         totalPrice,
//     };

//     return (
//         <CartContext.Provider value={value}>
//             {children}
//         </CartContext.Provider>
//     );
// };

// export const useCart = () => {
//     const context = useContext(CartContext);

//     if (!context) {
//         throw new Error(
//             "useCart must be used inside CartProvider"
//         );
//     }

//     return context;
// };