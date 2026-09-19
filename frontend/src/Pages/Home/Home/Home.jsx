import React from "react";
import Banner from "../Banner/Banner";
import Cover from "../../../Component/Shared/Cover";
import Category from "../Category/Category";
import Feature from "../Feature/Feature";
import { Helmet } from "react-helmet-async";

import ProductsCategory from "../../../Component/ProductsCategory/ProductsCategory";
import SectionTittle from "../../../Component/SectionTittle/SectionTittle";
import useProducts from "../../../Hooks/useProducts";
import useCategory from "../../../Hooks/useCategories";
import Footer from "../../../Component/Shared/Footer";

const Home = () => {
  // const [data] = UseProducts();
  // const popularData = data.filter((item) => item.category === "Popular");
  const {products} = useProducts();
  const {categories} = useCategory();
  console.log(products)
  console.log(categories)

  return (
    <div className="">
      <Helmet>
        <title>Britto Shop | Home</title>
      </Helmet>


      <div className="relative left-1/2 w-screen -translate-x-1/2 ">
        <Banner />
        {/* <Category /> */}
      </div>


      <div className="">
        <SectionTittle subHeading='Popular Product' heading='Our Popular Products' ></SectionTittle>
        {/* <div class="flex text-center justify-center text-white font-semibold">
        <p class="bg-blue-500 w-48 h-9 py-1 text-xl  [clip-path:polygon(10%_0%,100%_0%,90%_100%,0%_100%)] mr-[-40px]">
          Buy Now
        </p>
        <p class="bg-yellow-500 w-48 h-9 py-1 text-xl [clip-path:polygon(10%_0%,100%_0%,90%_100%,0%_100%)]">
          Add to Cart
        </p>
      </div> */}
        <div className="mt-10">
          {/* <ProductsCategory data={popularData}></ProductsCategory> */}
        </div>

        <Feature></Feature>
        <div className="">
          <Cover />
        </div>
      </div>
          <Footer></Footer>
    </div>
  );
};

export default Home;
