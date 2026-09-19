
// import SectionTittle from "../../../Component/SectionTittle/SectionTittle";
// import { SlArrowRight, SlArrowLeft } from "react-icons/sl";
// import UseProducts from "../../../Hooks/UseProducts";
// import { useNavigate } from "react-router-dom";
// import { fbqTrack } from "../../../Hooks/fbPixel";
// import useCategory from "../../../Hooks/useCategory";

// const Category = () => {
//   const [products, productsLoading] = UseProducts();
//   const [categories, categoriesLoading] = useCategory();

  
//   console.log(categories)
  
//   const categorie = categories?.productTypes
//   console.log(categorie)

//   const navigate = useNavigate();
  
  


//   return (
//     <section>
//       <SectionTittle subHeading="from 10am to 12pm" heading="TOP CATEGORIES" />

//       <div className="relative max-w-screen ">
        

//         <div
          
//           className="overflow-x-auto scrollbar-hide grid  lg:grid-cols-7 grid-cols-2 md:grid-cols-4 sm:grid-cols-3 gap-4 md:px-6 px-4 py-2 justify-between flex-row"
//           role="list"
//         >
//           {categoriesToShow.map((category, idx) => (
//             <div
//               key={idx}
//               // onClick={() => navigate(`/category/${category.name}`)}
//               onClick={() => {
//                 fbqTrack("ViewCategory", {
//                   content_category: category.name,
//                 });
//                 navigate(`/category/${category.name}`);
//               }}
//               className=" bg-gray-100 relative flex gap-0 lg:max-w-screen lg:max-h-[200px] items-center justify-center rounded-md overflow-hidden shrink-0 hover:shadow-sm  hover:shadow-orange-500 hover:scale-105 duration-700 transition-transform"
//               role="listitem"  
//             >     
//               <img
//                 src={category.image}
//                 alt={`${category.name} category`}
//                 className="lg:w-[1224px] w-[300px] h-[150px]  border-blue-500 lg:h-[500px] object-cover brightness-75"
//               />
//               <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
//                 <button className="btn btn-outline p-6 border-b-4 border-yellow-600 text-white border-0 flex items-center text-2xl text-center">
//                   {category.name}
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Category;


import React from 'react'

function Category() {
  return (
    <div>Category</div>
  )
}

export default Category


// import SectionTittle from "../../../Component/SectionTittle/SectionTittle";
// import { SlArrowRight, SlArrowLeft } from "react-icons/sl";
// import UseProducts from "../../../Hooks/UseProducts";
// import { useNavigate } from "react-router-dom";
// import { fbqTrack } from "../../../Hooks/fbPixel";

// const Category = () => {
//   const [data] = UseProducts();
//   const navigate = useNavigate();

//   // 1. Get unique categories dynamically
//   const uniqueCategories = Array.from(
//     new Set(data.map((item) => item.category))
//   );

//   // 2. Map categories to objects with name + first product image
//   const categoriesToShow = uniqueCategories.map((categoryName) => {
//     const firstProduct = data.find((item) => item.category === categoryName);
//     return {
//       name: categoryName,
//       image: firstProduct
//         ? firstProduct.image
//         : "https://via.placeholder.com/200x300?text=No+Image",
//     };
//   });


//   return (
//     <section>
//       <SectionTittle subHeading="from 10am to 12pm" heading="TOP CATEGORIES" />

//       <div className="relative max-w-screen ">
        

//         <div
          
//           className="overflow-x-auto scrollbar-hide grid  lg:grid-cols-7 grid-cols-2 md:grid-cols-4 sm:grid-cols-3 gap-4 md:px-6 px-4 py-2 justify-between flex-row"
//           role="list"
//         >
//           {categoriesToShow.map((category, idx) => (
//             <div
//               key={idx}
//               // onClick={() => navigate(`/category/${category.name}`)}
//               onClick={() => {
//                 fbqTrack("ViewCategory", {
//                   content_category: category.name,
//                 });
//                 navigate(`/category/${category.name}`);
//               }}
//               className=" bg-gray-100 relative flex gap-0 lg:max-w-screen lg:max-h-[200px] items-center justify-center rounded-md overflow-hidden shrink-0 hover:shadow-sm  hover:shadow-orange-500 hover:scale-105 duration-700 transition-transform"
//               role="listitem"  
//             >     
//               <img
//                 src={category.image}
//                 alt={`${category.name} category`}
//                 className="lg:w-[1224px] w-[300px] h-[150px]  border-blue-500 lg:h-[500px] object-cover brightness-75"
//               />
//               <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
//                 <button className="btn btn-outline p-6 border-b-4 border-yellow-600 text-white border-0 flex items-center text-2xl text-center">
//                   {category.name}
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Category;
