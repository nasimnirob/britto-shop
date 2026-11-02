import SectionTittle from "../../../Component/SectionTittle/SectionTittle";
import { useNavigate } from "react-router-dom";
import { fbqTrack } from "../../../Hooks/fbPixel";
import useCategories from "../../../Hooks/useCategories";

const Category = () => {
  const { categories, categoriesLoading } = useCategories();
  const navigate = useNavigate();

  // console.log("categories:", categories);

  // API response:
  // {
  //   success: true,
  //   data: [...]
  // }
  const productTypes = Array.isArray(categories)
    ? categories
    : categories?.data || [];

  const allSubCategories = productTypes?.flatMap((type) =>
    (type.categories || []).flatMap((category) =>
      (category.subCategories || []).map((subCategory) => ({
        ...subCategory,
        productTypeSlug: type.slug,
        categorySlug: category.slug,
      }))
    )
  );

  // console.log("productTypes:", productTypes);
  // console.log("allSubCategories:", allSubCategories);

  if (categoriesLoading) {
    return (
      <section>
        <SectionTittle
          subHeading="from 10am to 12pm"
          heading="TOP CATEGORIES"
        />

        <div className="grid lg:grid-cols-7 grid-cols-2 md:grid-cols-4 sm:grid-cols-3 gap-4 md:px-6 px-4 py-2">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div
              key={idx}
              className="h-[150px] rounded-md bg-gray-200 dark:bg-[#252728] animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionTittle
        subHeading="from 10am to 12pm"
        heading="TOP CATEGORIES"
      />

      <div className="max-w-screen">
        <div
          className="overflow-x-auto scrollbar-hide grid lg:grid-cols-7 grid-cols-2 md:grid-cols-4 sm:grid-cols-3 gap-4 md:px-6 px-4 py-2"
          role="list"
        >
          {allSubCategories.map((category) => (
            <div
              key={`${category.productTypeSlug}-${category.categorySlug}-${category.slug}`}
              onClick={() => {
                fbqTrack("ViewCategory", {
                  content_category: category.name,
                });

                navigate(
                  `/category/${category.productTypeSlug}/${category.categorySlug}/${category.slug}`
                );
              }}
              className="bg-gray-100 relative cursor-pointer flex items-center justify-center rounded-md overflow-hidden shrink-0 hover:shadow-sm hover:shadow-orange-500 hover:scale-105 duration-700 transition-transform"
              role="listitem"
            >
              <img
                src={category.image || "/placeholder.jpg"}
                alt={`${category.name} category`}
                className="w-full h-[150px] lg:h-[180px] object-cover brightness-75"
              />

              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 right-0 text-white bg-black/20 backdrop-blur-xl flex items-center justify-center text-sm font-poppins text-center py-0.5">
                  <span className="w-full">
                    {category.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Category;



// import SectionTittle from "../../../Component/SectionTittle/SectionTittle";
// import { useNavigate } from "react-router-dom";
// import { fbqTrack } from "../../../Hooks/fbPixel";
// import useCategories from "../../../Hooks/useCategories";

// const Category = () => {
//   const { categories, categoriesLoading } = useCategories();
//   const navigate = useNavigate();

//   console.log(categories)

//   const productTypes = categories?.[0]?.productTypes || [];

//   const allSubCategories = productTypes.flatMap((type) =>
//     type.categories.flatMap((category) =>
//       category.subCategories.map((subCategory) => ({
//         ...subCategory,
//         productTypeSlug: type.slug,
//         categorySlug: category.slug,
//       }))
//     )
//   );

//   if (categoriesLoading) {
//     return (
//       <section>
//         <SectionTittle
//           subHeading="from 10am to 12pm"
//           heading="TOP CATEGORIES"
//         />

//         <div className="grid lg:grid-cols-7 grid-cols-2 md:grid-cols-4 sm:grid-cols-3 gap-4 md:px-6 px-4 py-2">
//           {Array.from({ length: 7 }).map((_, idx) => (
//             <div
//               key={idx}
//               className="h-[150px] rounded-md bg-gray-200 dark:bg-[#252728] animate-pulse"
//             />
//           ))}
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section>
//       <SectionTittle
//         subHeading="from 10am to 12pm"
//         heading="TOP CATEGORIES"
//       />

//       <div className="max-w-screen">
//         <div className="overflow-x-auto scrollbar-hide grid lg:grid-cols-7 grid-cols-2 md:grid-cols-4 sm:grid-cols-3 gap-4 md:px-6 px-4 py-2"
//           role="list"
//         >
//           {allSubCategories.map((category) => (
//             <div
//               key={`${category.productTypeSlug}-${category.categorySlug}-${category.slug}`}
//               onClick={() => {
//                 fbqTrack("ViewCategory", {
//                   content_category: category.name,
//                 });

//                 navigate(
//                   `/category/${category.productTypeSlug}/${category.categorySlug}/${category.slug}`
//                 );
//               }}
//               className="bg-gray-100 relative cursor-pointer flex items-center justify-center rounded-md overflow-hidden shrink-0 hover:shadow-sm hover:shadow-orange-500 hover:scale-105 duration-700 transition-transform"
//               role="listitem"
//             >
//               <img
//                 src={category.image}
//                 alt={`${category.name} category`}
//                 className="w-full h-[150px] lg:h-[180px] object-cover brightness-75"
//               />

//               <div className="absolute inset-0">
//                 <div className="absolute top-0 left-0 right-0 text-white bg-black/20 backdrop-blur-xl flex items-center justify-center text-sm font-poppins text-center py-0.5">
//                   <span className="w-full">
//                     {category.name}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Category;




// import SectionTittle from "../../../Component/SectionTittle/SectionTittle";
// import { SlArrowRight, SlArrowLeft } from "react-icons/sl";
// import { useNavigate } from "react-router-dom";
// import { fbqTrack } from "../../../Hooks/fbPixel";
// import useCategories from "../../../Hooks/useCategories";


// const Category = () => {
//   const {categories, categoriesLoading} = useCategories();

  
//   console.log(categories)
  
//   const categorie = categories[0]?.productTypes
//   console.log(categorie)

//   const allSubCategories = categorie?.flatMap(type =>
//         type.categories.flatMap(category => category.subCategories)
//   );

//   console.log(allSubCategories);


//   const navigate = useNavigate();
  
  


//   return (
//     <section>
//       <SectionTittle subHeading="from 10am to 12pm" heading="TOP CATEGORIES" />

//       <div className=" max-w-screen ">
        

//         <div
          
//           className="overflow-x-auto scrollbar-hide grid  lg:grid-cols-7 grid-cols-2 md:grid-cols-4 sm:grid-cols-3 gap-4 md:px-6 px-4 py-2 justify-between flex-row"
//           role="list"
//         >
//           {allSubCategories?.map((category, idx) => (
//             <div
//               key={idx}
//               onClick={() => {
//                 fbqTrack("ViewCategory", {
//                   content_category: category.name,
//                 });
//                 navigate(`/category/${category.slug}`);
//               }}
//               className=" bg-gray-100 relative cursor-pointer flex gap-0 lg:max-w-screen lg:max-h-[200px] items-center justify-center rounded-md overflow-hidden shrink-0 hover:shadow-sm  hover:shadow-orange-500 hover:scale-105 duration-700 transition-transform"
//               role="listitem"  
//             >     
//               <img
//                 src={category?.image}
//                 alt={`${category?.name} category`}
//                 className="lg:w-[1224px] w-[300px] h-[150px]  border-blue-500 lg:h-[500px] object-cover brightness-75"
//               />
//               <div className="absolute left-1/2 -translate-x-1/2 w-full h-full">
//                 <div className="fixed top-0 right-0  left-0 text-white bg-black/20 backdrop-blur-xl flex items-center text-sm font-poppins text-center">
//                   <span className="w-full">{category.name}</span>
//                 </div>
//               </div>
//             </div>
//            ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Category;