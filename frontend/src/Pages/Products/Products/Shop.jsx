// import { Helmet } from "react-helmet-async";
// import PageCover from "../../../Component/Shared/PageCover";
// import productImg from "../../../assets/products/product-bg.jpg";
// import ClothingImg from "../../../assets/products/Clothing-bg.jpg";
// import electronicImg from "../../../assets/products/electronic-bg.jpg";
// import sportImg from "../../../assets/products/sport-bg.jpg";
// import SectionTittle from "../../../Component/SectionTittle/SectionTittle";
// import { useEffect, useState } from "react";
// import UseProducts from "../../../Hooks/UseProducts";
// import ProductsCategory from "../../../Component/ProductsCategory/productsCategory";
// import { useTranslation } from "react-i18next";
// // import { useLoaderData } from "react-router-dom";

// const Shop = () => {
//   const { t } = useTranslation();
//   const [data] = UseProducts();
//   const popularData = data.filter((item) => item.category === "Popular");
//   const ClothingData = data.filter((item) => item.category === "Clothing");
//   const ElectronicsData = data.filter(
//     (item) => item.category === "Electronics"
//   );
//   const HomeKitchenData = data.filter(
//     (item) => item.category === "Home & Kitchen"
//   );
//   const SportsData = data.filter((item) => item.category === "Sports");
//   const KitchenData = data.filter((item) => item.category === "Kitchen");
//   const ToysData = data.filter((item) => item.category === "Toys");
//   const BeautyData = data.filter((item) => item.category === "Beauty");

//   return (
//     <div>
//       <div>
//         <Helmet>
//           <title>
//             {t("Britto Shop")} | {t("Products")}
//           </title>
//         </Helmet>

//         <PageCover
//           img={productImg}
//           tittle={t("Our Products")}
//           description={t(
//             "Explore our wide range of premium products designed to meet all your needs with quality and style."
//           )}
//         />

//         <SectionTittle
//           subHeading={t("Don't miss")}
//           heading={t("Todays Offer")}
//         />
//         <ProductsCategory data={popularData} />

//         <PageCover
//           img={ClothingImg}
//           tittle={t("Clothing")}
//           description={t(
//             "Trendy and comfortable apparel for every style and season."
//           )}
//         />
//         <ProductsCategory data={ClothingData} />

//         <PageCover
//           img={electronicImg}
//           tittle={t("Electronics")}
//           description={t(
//             "Latest gadgets and smart devices to power your digital lifestyle."
//           )}
//         />
//         <ProductsCategory data={ElectronicsData} />

//         <PageCover
//           img={sportImg}
//           tittle={t("Sports")}
//           description={t(
//             "Gear up with top-quality equipment and apparel for every sport and fitness need."
//           )}
//         />
//         <ProductsCategory data={SportsData} />

//         <PageCover
//           img={sportImg}
//           tittle={t("Kitchen")}
//           description={t(
//             "Cook smart with quality tools and modern kitchen essentials."
//           )}
//         />
//         <ProductsCategory data={KitchenData} />

//         <PageCover
//           img={sportImg}
//           tittle={t("Toys")}
//           description={t(
//             "Fun, educational, and safe toys for children of all ages."
//           )}
//         />
//         <ProductsCategory data={ToysData} />

//         <PageCover
//           img={sportImg}
//           tittle={t("Beauty")}
//           description={t(
//             "High-quality beauty and personal care products to enhance your natural glow."
//           )}
//         />
//         <ProductsCategory data={BeautyData} />
//       </div>
//     </div>
//   );
// };

// export default Shop;


import { useState } from 'react';
import ProductCard from '../../../Component/ProductCard/ProductCard';
import useCategories from '../../../Hooks/useCategories';
import useProducts from '../../../Hooks/useProducts';


const Shop = () => {
    const [activeType, setActiveType] = useState('Men');
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeSubCategory, setActiveSubCategory] = useState(null);

    const { categories, loading: categoriesLoading } = useCategories();

    const { products, loading, error } = useProducts({
        productType: activeType,
        category: activeCategory || undefined,
        subCategory: activeSubCategory || undefined,
        page: 1,
        limit: 20,
    });

    // this productType-এর category/subCategory tree বের করা হচ্ছে sidebar দেখানোর জন্য
    const activeTypeData = categories.find((c) => c.type === activeType);

    const handleTypeChange = (type) => {
        setActiveType(type);
        setActiveCategory(null);
        setActiveSubCategory(null);
    };

    const handleCategoryChange = (category) => {
        setActiveCategory(category === activeCategory ? null : category);
        setActiveSubCategory(null);
    };

    const handleSubCategoryChange = (subCategory) => {
        setActiveSubCategory(subCategory === activeSubCategory ? null : subCategory);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">

            {/* productType tabs: Men / Women / Teens / Kids / Sports */}
            <div className="tabs tabs-boxed mb-6 w-fit text-black">
                <button className={`tab ${activeType === 'Men' ? 'tab-active' : ''}`} onClick={() => handleTypeChange('Men')}>
                    Men
                </button>
                <button className={`tab ${activeType === 'Women' ? 'tab-active' : ''}`} onClick={() => handleTypeChange('Women')}>
                    Women
                </button>
                <button className={`tab ${activeType === 'Teens' ? 'tab-active' : ''}`} onClick={() => handleTypeChange('Teens')}>
                    Teens
                </button>
                <button className={`tab ${activeType === 'Kids' ? 'tab-active' : ''}`} onClick={() => handleTypeChange('Kids')}>
                    Kids
                </button>
                <button className={`tab ${activeType === 'Sports' ? 'tab-active' : ''}`} onClick={() => handleTypeChange('Sports')}>
                    Sports
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                {/* sidebar: নির্বাচিত productType-এর category + subCategory */}
                <aside className="md:col-span-1">
                    {categoriesLoading ? (
                        <p className="text-sm text-gray-400">Loading categories...</p>
                    ) : (
                        activeTypeData?.categories.map((cat) => (
                            <div key={cat.category} className="mb-4">
                                <button
                                    onClick={() => handleCategoryChange(cat.category)}
                                    className={`font-semibold block mb-1 ${
                                        activeCategory === cat.category ? 'text-primary' : 'text-gray-700'
                                    }`}
                                >
                                    {cat.category}
                                </button>

                                {activeCategory === cat.category && (
                                    <ul className="pl-3 space-y-1">
                                        {cat.subCategories.map((sub) => (
                                            <li key={sub}>
                                                <button
                                                    onClick={() => handleSubCategoryChange(sub)}
                                                    className={`text-sm ${
                                                        activeSubCategory === sub ? 'text-primary font-medium' : 'text-gray-500'
                                                    }`}
                                                >
                                                    {sub}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))
                    )}
                </aside>

                {/* product grid */}
                <main className="md:col-span-3">
                    {loading && <p>Loading products...</p>}
                    {error && <p className="text-error">{error}</p>}

                    {!loading && !error && products.length === 0 && (
                        <p className="text-gray-400">No products found in this category.</p>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Shop;
