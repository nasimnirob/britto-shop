import OrderCard from "../../../Component/OrderCard/OrderCard";
import useProducts from "../../../Hooks/useProducts";
import { Link, useParams, useNavigate } from "react-router-dom";
import useCategories from "../../../Hooks/useCategories";
import { IoHomeOutline } from "react-icons/io5";
import CategorySidebar from "../../../Component/CategorySidebar/CategorySidebar";

const OurCategory = () => {
  const { products = [] } = useProducts();
  const { categories = [] } = useCategories();

  const navigate = useNavigate();

  const { productType, category, subCategory } = useParams();

  // ========================================
  // 1. Find Product Type
  // ========================================

  const selectedProductType = categories?.data?.find(
    (type) =>
      type.slug?.toLowerCase() === productType?.toLowerCase()
  );

  // ========================================
  // 2. Find Category
  // ========================================

  const selectedCategory = selectedProductType?.categories?.find(
    (item) =>
      item.slug?.toLowerCase() === category?.toLowerCase()
  );

  // ========================================
  // 3. Find Sub Category
  // ========================================

  const selectedSubCategory =
    selectedCategory?.subCategories?.find(
      (item) =>
        item.slug?.toLowerCase() === subCategory?.toLowerCase()
    );

  // ========================================
  // 4. Product Type -> All Subcategories
  // Example:
  // /category/men's-collection
  // ========================================

  const allSubCategories =
    selectedProductType?.categories?.flatMap((categoryItem) =>
      categoryItem.subCategories?.map((subCategoryItem) => ({
        ...subCategoryItem,
        categorySlug: categoryItem.slug,
        categoryName: categoryItem.category,
        categoryId: categoryItem._id,
      })) || []
    ) || [];

  // ========================================
  // 5. Selected Category -> Subcategories
  // Example:
  // /category/men's-collection/topwear
  // ========================================

  const categorySubCategories =
    selectedCategory?.subCategories || [];

  // ========================================
  // 6. Products Filter
  // Example:
  // /category/men's-collection/topwear/jacket
  // ========================================

  const filteredProducts =
    selectedProductType?._id &&
      selectedCategory?._id &&
      selectedSubCategory?._id
      ? products.filter(
        (product) =>
          product.productTypeId === selectedProductType._id &&
          product.categoryId === selectedCategory._id &&
          product.subCategoryId === selectedSubCategory._id
      )
      : [];

  // ========================================
  // 7. Subcategory Card Component
  // ========================================

  const SubCategoryCard = ({
    item,
    categorySlug,
  }) => {
    return (
      <div
        key={item._id}
        onClick={() =>
          navigate(
            `/category/${productType}/${categorySlug}/${item.slug}`
          )
        }
        className="relative h-[150px] md:h-[180px] rounded-md overflow-hidden cursor-pointer bg-gray-100 hover:shadow-md hover:shadow-orange-500 hover:scale-[1.02] transition-all duration-300"
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover brightness-75"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">
              No Image
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 text-white bg-black/40 backdrop-blur-sm text-center py-2 text-sm font-poppins">
          {item.name}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">

      {/* ========================================
          Breadcrumb
      ======================================== */}

      <div className="w-full relative z-20 border-b dark:border-gray-700">
        <div className="flex items-center gap-1 max-w-[1524px] mx-auto py-2 px-3 text-gray-600 dark:text-gray-200 bg-gray-300/10 text-base font-poppins flex-wrap">

          <Link
            to="/"
            className="flex items-center justify-center gap-1 hover:text-black dark:hover:text-white"
          >
            <IoHomeOutline className="text-base" />
            Home
          </Link>

          <span>/</span>

          <span>
            Category
          </span>

          {selectedProductType && (
            <>
              <span>/</span>

              <span className="hover:text-black dark:hover:text-white capitalize">
                {selectedProductType.type.toLowerCase()}
              </span>
            </>
          )}

          {selectedCategory && (
            <>
              <span>/</span>

              <span className="hover:text-black dark:hover:text-white">
                {selectedCategory.category}
              </span>
            </>
          )}

          {selectedSubCategory && (
            <>
              <span>/</span>

              <span className="text-orange-400 font-thin">
                {selectedSubCategory.name}
              </span>
            </>
          )}

        </div>
      </div>

      {/* ========================================
          Main Content
      ======================================== */}

      <div className="max-w-[1524px] mx-auto px-2">

        <div className="flex gap-4 my-4">

          {/* Sidebar */}

          <aside
            className="
              text-black
              hidden md:block
              xl:w-[350px]
              lg:w-[300px]
              md:w-[300px]
              border-r
              dark:border-gray-800
              h-[var(--sidebar-height)]
              shrink-0
              overflow-y-auto
              sticky
              top-[var(--sidebar-top)]
              transition-all
              duration-300
              sidebar-scroll
            "
          >
            <CategorySidebar categories={categories} />
          </aside>

          {/* ========================================
              Main
          ======================================== */}

          <main className="flex-1">

            {/* ========================================
                CASE 1:
                Product Type only

                /category/men's-collection

                Show ALL subcategory cards
            ======================================== */}

            {productType && !category && !subCategory ? (

              <div>

                {allSubCategories.length > 0 ? (

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

                    {allSubCategories.map((item) => (

                      <SubCategoryCard
                        key={`${item.categorySlug}-${item.slug}`}
                        item={item}
                        categorySlug={item.categorySlug}
                      />

                    ))}

                  </div>

                ) : (

                  <div className="flex items-center justify-center min-h-[300px]">
                    <p className="text-gray-500 dark:text-gray-400">
                      No categories found.
                    </p>
                  </div>

                )}

              </div>

            ) : null}


            {/* ========================================
                CASE 2:
                Product Type + Category

                /category/men's-collection/topwear

                Show ONLY Topwear subcategory cards
            ======================================== */}

            {productType && category && !subCategory ? (

              <div>

                {categorySubCategories.length > 0 ? (

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

                    {categorySubCategories.map((item) => (

                      <SubCategoryCard
                        key={item._id}
                        item={item}
                        categorySlug={selectedCategory.slug}
                      />

                    ))}

                  </div>

                ) : (

                  <div className="flex items-center justify-center min-h-[300px]">
                    <p className="text-gray-500 dark:text-gray-400">
                      No subcategories found.
                    </p>
                  </div>

                )}

              </div>

            ) : null}


            {/* ========================================
                CASE 3:
                Product Type + Category + SubCategory

                /category/men's-collection/topwear/jacket

                Show Products
            ======================================== */}

            {productType && category && subCategory ? (

              filteredProducts.length > 0 ? (

                <OrderCard
                  products={filteredProducts}
                />

              ) : (

                <div className="flex items-center justify-center min-h-[300px]">
                  <p className="text-gray-500 dark:text-gray-400">
                    No products found in this category.
                  </p>
                </div>

              )

            ) : null}

          </main>

        </div>

      </div>

    </div>
  );
};

export default OurCategory;



// import OrderCard from "../../../Component/OrderCard/OrderCard";
// import useProducts from "../../../Hooks/useProducts";
// import { Link, useParams, useNavigate } from "react-router-dom";
// import useCategories from "../../../Hooks/useCategories";
// import { IoHomeOutline } from "react-icons/io5";
// import CategorySidebar from "../../../Component/CategorySidebar/CategorySidebar";

// const OurCategory = () => {
//   const { products = [] } = useProducts();
//   const { categories = [] } = useCategories();

//   console.log(products)
//   console.log(categories)

//   const navigate = useNavigate();

//   const { productType, category, subCategory } = useParams();

// // ========================================
// // 1. Find Product Type
// // ========================================

// const selectedProductType = categories?.data?.find(
//   (type) =>
//     type.slug?.toLowerCase() === productType?.toLowerCase()
// );


// // ========================================
// // 2. Find Category
// // ========================================

// const selectedCategory = selectedProductType?.categories?.find(
//   (item) =>
//     item.slug?.toLowerCase() === category?.toLowerCase()
// );


// // ========================================
// // 3. Find Sub Category
// // ========================================

// const selectedSubCategory =
//   selectedCategory?.subCategories?.find(
//     (item) =>
//       item.slug?.toLowerCase() === subCategory?.toLowerCase()
//   );


// // ========================================
// // 4. All Subcategories of Product Type
// // ========================================

// const allSubCategories =
//   selectedProductType?.categories?.flatMap((categoryItem) =>
//     categoryItem.subCategories?.map((subCategoryItem) => ({
//       ...subCategoryItem,

//       categorySlug: categoryItem.slug,

//       categoryName: categoryItem.category,

//       categoryId: categoryItem._id,
//     })) || []
//   ) || [];


// // ========================================
// // 5. Products Filter
// // ========================================

// const filteredProducts =
//   selectedProductType?._id &&
//   selectedCategory?._id &&
//   selectedSubCategory?._id
//     ? products.filter(
//         (product) =>
//           product.productTypeId === selectedProductType._id &&
//           product.categoryId === selectedCategory._id &&
//           product.subCategoryId === selectedSubCategory._id
//       )
//     : [];


//   return (
//     <div className="min-h-screen">

//       {/* Breadcrumb */}
//       <div className="w-full relative z-20 border-b dark:border-gray-700">
//         <div className="flex items-center gap-1 max-w-[1524px] mx-auto py-2 px-3 text-gray-600 dark:text-gray-200 bg-gray-300/10 text-base font-poppins flex-wrap">
//           <Link
//             to="/"
//             className="flex items-center justify-center gap-1 hover:text-black dark:hover:text-white">
//             <IoHomeOutline className="text-base" />
//             Home
//           </Link>

//           <span>/</span>

//           <span>
//             Category
//           </span>

//           {selectedProductType && (
//             <>
//               <span>/</span>

//               <span className="hover:text-black dark:hover:text-white ">
//                 {selectedProductType.type}
//               </span>
//             </>
//           )}

//           {selectedCategory && (
//             <>
//               <div className="hidden md:block">
//                 <span>/</span>

//               <span className="hover:text-black dark:hover:text-white">
//                 {selectedCategory.category}
//               </span>
//               </div>
//             </>
//           )}

//           {selectedSubCategory && (
//             <>
//               <span>/</span>

//               <span className="text-orange-400 font-thin">
//                 {selectedSubCategory.name}
//               </span>
//             </>
//           )}

//         </div>
//       </div>


//       <div className="max-w-[1524px] mx-auto px-2">

//         <div className="flex gap-4 my-4">

//           <aside
//             className="text-black hidden md:block xl:w-[350px] lg:w-[300px] md:w-[300px] border-r dark:border-gray-800 h-[var(--sidebar-height)] shrink-0 overflow-y-auto sticky top-[var(--sidebar-top)] transition-all duration-300 sidebar-scroll " >
//             <CategorySidebar categories={categories}/>
//           </aside>

//           <main className="flex-1">

//             {productType && !category && !subCategory ? (

//               <div>

//                 {/* <h1 className="text-black/70 p-1 text-xl md:text-2xl font-semibold text-end font-poppins">
//                   {selectedProductType?.type} Categories
//                 </h1> */}

//                 {allSubCategories.length > 0 ? (

//                   <div className=" grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

//                     {allSubCategories.map((item) => (

//                       <div
//                         key={`${item.categorySlug}-${item.slug}`}
//                         onClick={() =>
//                           navigate(
//                             `/category/${productType}/${item.categorySlug}/${item.slug}`
//                           )
//                         }
//                         className="relative h-[150px] md:h-[180px] rounded-md overflow-hidden cursor-pointer bg-gray-100 hover:shadow-md hover:shadow-orange-500 hover:scale-[1.02] transition-all duration-300">
//                         <img src={item.image} alt={item.name}
//                           className="w-full h-full object-cover brightness-75"
//                         />

//                         <div className="absolute bottom-0 left-0 right-0 text-white bg-black/40 backdrop-blur-sm text-center py-2 text-sm font-poppins">
//                           {item.name}
//                         </div>

//                       </div>

//                     ))}

//                   </div>

//                 ) : (

//                   <div className="flex items-center justify-center min-h-[300px]">
//                     <p className="text-gray-500 dark:text-gray-400">
//                       No categories found.
//                     </p>
//                   </div>

//                 )}

//               </div>

//             ) : (

//               filteredProducts.length > 0 ? (

//                 <OrderCard products={filteredProducts} />

//               ) : (

//                 <div className="flex items-center justify-center min-h-[300px]">
//                   <p className="text-gray-500 dark:text-gray-400">
//                     No products found in this category.
//                   </p>
//                 </div>

//               )

//             )}

//           </main>

//         </div>

//       </div>

//     </div>
//   );
// };

// export default OurCategory;

