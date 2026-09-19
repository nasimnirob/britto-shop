import OrderCard from "../../../Component/OrderCard/OrderCard";
import useProducts from "../../../Hooks/useProducts";
import { Link, useParams } from "react-router-dom";
import useCategories from "../../../Hooks/useCategories";
import { IoHomeOutline } from "react-icons/io5";
import CategorySidebar from "../../../Component/CategorySidebar/CategorySidebar";

const OurCategory = () => {
  const {products} = useProducts();
  const {categories} = useCategories();

  console.log(products)
  console.log(categories)

  

  const { productType, category, subCategory  } = useParams();
  console.log(productType, category, subCategory)

  const filteredProducts = products.filter((product) =>{
    const productTypeMatch = product?.productType?.toLowerCase() === productType?.toLowerCase();

    const categoryMatch =  product?.category?.toLowerCase() === category?.toLowerCase();

    const subCategoryMatch = product?.subCategory?.toLowerCase()?.replace(/\s+/g, "-") === subCategory?.toLowerCase();

    return productTypeMatch && categoryMatch && subCategoryMatch;
   }
  );

  return (
    <div className="min-h-screen">

      {/* Breadcrumb */}
      <div className="w-full relative z-20 border-b dark:border-gray-700">
        <div className="flex items-center gap-1 max-w-[1524px] mx-auto py-2 px-3 text-gray-600 dark:text-gray-200 bg-gray-300/10 text-base font-poppins">

          <Link
            to="/"
            className="flex items-center justify-center gap-1 hover:text-black dark:hover:text-white"
          >
            <IoHomeOutline className="text-base" />
            Home
          </Link>

          <span>/</span>

          <span className="hover:text-black dark:hover:text-white">
            Category
          </span>

          <span>/</span>

          {filteredProducts.length > 0 && (
            <span className="hover:text-black dark:hover:text-white">
              {filteredProducts[0]?.productType} /
            </span>
          )}
          {filteredProducts.length > 0 && (
            <span className="hover:text-black dark:hover:text-white">
              {filteredProducts[0]?.category} /
            </span>
          )}
          {filteredProducts.length > 0 && (
            <span className="hover:text-orange-500 text-orange-400 font-thin">
              {filteredProducts[0]?.subCategory}
            </span>
          )}

        </div>
      </div>


      {/* Main Content */}
      <div className="max-w-[1524px] mx-auto px-2">

        <div className="flex gap-4 my-4">

          {/* Sidebar */}

          <aside className="text-black hidden md:block xl:w-[350px] lg:w-[300px] md:w-[300px] border-r dark:border-gray-800 h-[var(--sidebar-height)] shrink-0 overflow-y-auto sticky top-[var(--sidebar-top)] transition-all duration-300 sidebar-scroll">
        
              <CategorySidebar
                categories={categories}
                
              />
           
          </aside>



          {/* Products */}
          <main className="flex-1">

              {filteredProducts.length > 0 ? (

               <OrderCard products={filteredProducts} />

               ) : (

                <div className="flex items-center justify-center min-h-[300px]">
                  <p className="text-gray-500 dark:text-gray-400">
                         No products found in this category.
                  </p>
                </div>

              )}
          </main>
        </div>

      </div>

    </div>
  );
};

export default OurCategory;



// Old Local Version

// import OrderCard from "../../../Component/OrderCard/OrderCard";
// import useProducts from "../../../Hooks/useProducts";
// import { Link, useParams } from "react-router-dom";
// import useCategory from "../../../Hooks/useCategory";
// import { IoHomeOutline } from "react-icons/io5";
// import CategorySidebar from "../../../Component/CategorySidebar/CategorySidebar";

// const OurCategory = () => {
//   const [data, loading] = useProducts();
//   const MainCategory = useCategory();

//   const { category } = useParams();

//   const filteredProducts = data.filter(
//     (item) =>
//       item.category?.toLowerCase() === category?.toLowerCase()
//   );

//   if (!loading && filteredProducts.length === 0) {
//     return (
//       <div className="text-center text-gray-500 py-10">
//         No products found in "{category}"
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen">

//       {/* Breadcrumb */}
//       <div className="w-full relative z-20 border-b dark:border-gray-700">
//         <div className="flex items-center gap-1 max-w-[1524px] mx-auto py-2 px-3 text-gray-600 dark:text-gray-200 bg-gray-300/10 text-base font-poppins">

//           <Link
//             to="/"
//             className="flex items-center justify-center gap-1 hover:text-black dark:hover:text-white"
//           >
//             <IoHomeOutline className="text-base" />
//             Home
//           </Link>

//           <span>/</span>

//           <span className="hover:text-black dark:hover:text-white">
//             Category
//           </span>

//           <span>/</span>

//           {!loading && filteredProducts.length > 0 && (
//             <span className="hover:text-orange-500 text-orange-400 font-thin">
//               {filteredProducts[0].category}
//             </span>
//           )}

//         </div>
//       </div>


//       {/* Main Content */}
//       <div className="max-w-[1524px] mx-auto px-2">

//         <div className="flex gap-4 my-4">

//           {/* Sidebar */}

//           <aside className="hidden md:block xl:w-[350px] lg:w-[300px] md:w-[300px] border-r dark:border-gray-800 h-[var(--sidebar-height)] shrink-0 overflow-y-auto sticky top-[var(--sidebar-top)] transition-all duration-300 sidebar-scroll">
        
//               <CategorySidebar
//                 MainCategory={MainCategory}
//                 filteredProducts={filteredProducts}
//               />
           
//           </aside>



//           {/* Products */}
//           <main

//           >
//             <OrderCard
//               products={filteredProducts}
//               loading={loading}
//             />
//           </main>

//         </div>

//       </div>

//     </div>
//   );
// };

// export default OurCategory;
