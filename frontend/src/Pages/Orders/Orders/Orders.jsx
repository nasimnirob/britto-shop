// import { useEffect, useState } from "react";
// import OrderCard from "../../../Component/OrderCard/OrderCard";
// import PageCover from "../../../Component/Shared/PageCover";
// import UseProducts from "../../../Hooks/UseProducts";
// import orderimg from "../../../assets/Orders/imgorder.jpg";

// import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
// import { useParams, useNavigate } from "react-router-dom";
// import useCategory from "../../../Hooks/useCategory";

// const Orders = () => {
//   const [data] = UseProducts();
//   const uniqueCategory = useCategory();
//   console.log(uniqueCategory)
//   const { category } = useParams(); // get category from URL
//   const navigate = useNavigate();

//   const [tabIndex, setTabIndex] = useState(0);

//   // Sync tabIndex with URL
//   useEffect(() => {
//     const index = uniqueCategory.findIndex((c) => c.toLowerCase() === category?.toLowerCase());
//     if (index !== -1) {
//       setTabIndex(index);
//     }
//   }, [category, uniqueCategory]);

//   // Update URL on tab change
//   const handleTabSelect = (index) => {
//     setTabIndex(index);
//     navigate(`/orders/${uniqueCategory[index].toLowerCase()}`);
//   };

//   return (
//     <div>
//       {/* <PageCover
//         img={orderimg}
//         tittle="প্রোডাক্ট অর্ডার"
//         description="আপনার পছন্দের পণ্য অর্ডার করুন সহজেই। অর্ডারের অগ্রগতি ট্র্যাক করুন এবং সময়মতো ডেলিভারি পান।"
//       /> */}

//       <div className="my- mx- lg:text-lg border-none dark:text-white ">
//         <Tabs selectedIndex={tabIndex} onSelect={handleTabSelect}>
//           <TabList className="flex text-[10px] md:text-[20px] md:py-5 py-3  lg:text-lg lg:gap-10 md:gap-5 gap-1 lg:py-10 justify-center items-center dark:text-white text-black ">
//             {uniqueCategory.map((category, index) => (
//               <Tab
//                 key={index}
//                 className={`cursor-pointer lg:px-3 md:px-2 sm:px-3 -space-x-28 py-2 text-sm md:text-base lg:text-lg 
//                   focus:outline-none focus:ring-0 
//                   border-b-2 transition-colors duration-300
//                   ${
//                     tabIndex === index
//                       ? "border-orange-500 text-orange-500"
//                       : "border-transparent hover:border-orange-300 text-black dark:text-white"
//                   }`}
//               >
//                 {category}
//               </Tab>
//             ))}
//           </TabList>

//           {uniqueCategory.map((cat, index) => (
//             <TabPanel key={index}>
//               <OrderCard products={data.filter((item) => item.category === cat)} />
//             </TabPanel>
//           ))}
//         </Tabs>
//       </div>
//     </div>
//   );
// };

// export default Orders;


import React from 'react'

function Orders() {
  return (
    <div>Orders</div>
  )
}

export default Orders