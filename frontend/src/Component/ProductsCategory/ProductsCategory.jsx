// import { NavLink } from "react-router-dom";
// import UseProducts from "../../Hooks/UseProducts";
// import ProductsItem from "../Shared/ProductsItem/ProductsItem";


// const ProductsCategory = ({data}) => {
//   // const [data] = UseProducts();
//   const filterPopularData = data.filter(item => item.category === 'Popular')
//             console.log(filterPopularData)
  
//   const category = data[0]?.category
//   console.log(category)

//   return (
//     <div>
//         <section>
//           <div className="grid lg:grid-cols-2 grid-cols-1 lg:gap-5 gap-2 my-5 mx-4 lg:mx-5 dark:text-white">
//             {
//               data.map(data => (
//                 <ProductsItem key={data._id} data={data} >

//                 </ProductsItem>
//               ))
//             }
//           </div>
//         </section>
//         <NavLink to={`/orders/${data[0]?.category}`} className="my-16 text-center items-center flex justify-center">

//           <button className="btn btn-outline border-b-2 text-orange-500 border-0 flex items-center text-center text-">Find More Products</button>
//         </NavLink>
//     </div>
//   );
// };

// export default ProductsCategory;

import React from 'react'

function ProductsCategory() {
  return (
    <div>ProductsCategory</div>
  )
}

export default ProductsCategory
