import { Link } from "react-router-dom";
import ZoomImage from "../ZoomImage";
import { TbCurrencyTaka } from "react-icons/tb";

const OrderCard = ({ products = [] }) => {
  return (
    <div className="mx-0 grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 grid-cols-2 gap-3 text-black dark:text-white">
      {products.map((product) => (
        <Link
          key={product._id}
          to={`/product/${product.slug}`}
          state={{ product }}
          className="
            card
            shadow-sm
            border
            dark:border-[#252728]
            dark:bg-[#222326]
            rounded-md
            overflow-hidden
            group
          "
        >
          {/* ================= IMAGE ================= */}
          <figure className="relative overflow-hidden">

            <ZoomImage
              src={product.thumbnail}
              alt={product.name}
            />

            {/* Discount */}
            {product.price?.discountPercent > 0 && (
              <p className="
                font-poppins
                text-xs
                absolute
                left-0
                top-0
                bg-[#ff0066]
                text-white
                rounded-br-md
                px-2
                py-1
              ">
                -{product.price.discountPercent}%
              </p>
            )}

            {/* Price */}
            <div className="
              font-poppins
              text-sm
              absolute
              right-0
              top-0
              bg-[#ff0066]
              text-white
              rounded-bl-md
              px-2
              py-1
              flex
              items-center
            ">
              <TbCurrencyTaka className="text-base" />
              {product.price?.sellingPrice}
            </div>

          </figure>


          {/* ================= CARD BODY ================= */}
          <div className="card-body p-3 text-center flex items-start">

            {/* Product Name */}
            <h2 className="
              text-sm
              md:text-base
              font-poppins
              font-medium
              flex
              w-full
              justify-center
              line-clamp-2
              min-h-[40px]
            ">
              {product.name}
            </h2>


            {/* Price */}
            <div className="w-full flex items-center justify-center gap-2 mt-1">

              <span className="
                text-base
                md:text-lg
                font-semibold
                flex
                items-center
              ">
                <TbCurrencyTaka />
                {product.price?.sellingPrice}
              </span>

              {product.price?.mrp > product.price?.sellingPrice && (
                <span className="
                  text-xs
                  md:text-sm
                  text-gray-400
                  line-through
                  flex
                  items-center
                ">
                  <TbCurrencyTaka />
                  {product.price?.mrp}
                </span>
              )}

            </div>


            {/* Rating */}
            {product.rating && (
              <div className="w-full flex justify-center items-center gap-1 text-sm mt-1">

                <span className="text-yellow-500">
                  ★
                </span>

                <span>
                  {product.rating.average}
                </span>

                <span className="text-gray-400">
                  ({product.rating.count})
                </span>

              </div>
            )}


            {/* Order Button */}
            <div className="card-actions justify-end w-full mt-2">

              <button
                type="button"
                className="
                  btn
                  bg-[#ff0066]
                  text-black
                  dark:text-white
                  w-full
                  text-sm
                  md:text-lg
                  dark:border-none
                  min-h-9
                  h-10
                  hover:bg-[#e6005c]
                "
              >
                Order Now
              </button>

            </div>

          </div>
        </Link>
      ))}
    </div>
  );
};

export default OrderCard;





// import { Link } from "react-router-dom";
// import ZoomImage from "../ZoomImage";
// import { TbCurrencyTaka } from "react-icons/tb";
// import ProductCardSkeleton from "../Shared/ProductCardSkeleton";


// const OrderCard = ({ products, loading }) => {
//   if (loading) {
//     return (
//       <div className="mx-2 grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-3">
//         {Array.from({ length: 8 }).map((_, index) => (
//           <ProductCardSkeleton key={index} />
//         ))}
//       </div>
//     );
//   }
//   console.log(products)
//   return (
//     <div className="mx-0 grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 grid-cols-2 gap-3 text-black dark:text-white ">
//       {products.map((product) => (
//         <Link
//           to={`/product/${product._id}`}
//           state={{ product }}
//           key={product._id}
//           className="card shadow-sm border dark:border-[#252728] dark:dark:bg-[#222326] rounded-md">
//           <figure className="relative">
//             <ZoomImage src={product.image} alt={product.name} />
//             <p className="font-poppins text-sm absolute right-0 top-0 bg-[#ff0066] text-white rounded-md p-1 flex items-center ">
//               <TbCurrencyTaka className="text-lg" />{product.price}
//               {/* TK {product.price}  */}
//             </p>
//           </figure>
//           <div className="card-body text-center flex items-start">
//             <h2 className="card-title text-md font-poppins flex w-full justify-center">{product.name}</h2>
//             <h1>SKU {product._id}</h1>
//             {/* <p className="text-start lg:py-1 py-1">{product.description}</p> */}
//             <div className="card-actions justify-end w-full">
//               <button className="btn bg-[#ff0066] text-black dark:text-white w-full text-lg dark:border-none">
//                 Order Now
//               </button>

//             </div>
//           </div>
//         </Link>
//       ))}
//     </div>
//   );
// };

// export default OrderCard;

