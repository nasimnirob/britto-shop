import { NavLink } from "react-router-dom";
import { Scrollbars } from "react-custom-scrollbars-2";
import { useState } from "react";

function CategorySidebar({ categories }) {
  const [showScrollbar, setShowScrollbar] = useState(false);

  return (
    <div
      className="category-sidebar h-full w-full"
      onMouseEnter={() => setShowScrollbar(true)}
      onMouseLeave={() => setShowScrollbar(false)}
    >
      <Scrollbars
        autoHide={false}

        renderTrackVertical={({ style, ...props }) => (
          <div
            {...props}
            style={{
              ...style,
              width: "8px",
              right: "1px",
              top: "2px",
              bottom: "2px",
              borderRadius: "9999px",
              opacity: showScrollbar ? 1 : 0,
              visibility: showScrollbar
                ? "visible"
                : "hidden",
              transition:
                "opacity 0.2s ease, visibility 0.2s ease",
              zIndex: 20,
            }}
          />
        )}

        renderThumbVertical={({ style, ...props }) => (
          <div
            {...props}
            style={{
              ...style,
              width: "6px",
              marginLeft: "1px",
              borderRadius: "9999px",
              backgroundColor: "#9ca3af",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "#4b5563";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "#9ca3af";
            }}
          />
        )}

        renderView={({ style, ...props }) => (
          <div
            {...props}
            style={{
              ...style,
              overflowX: "hidden",
            }}
          />
        )}
      >



        <div className="font-poppins">

          {/* <h2 className="text-xl font-semibold mb-4">
            Categories
          </h2> */}

          {categories?.[0]?.productTypes?.map((type) => (
            <div key={type.slug} className="mb-5">


              <h3 className="text-lg font-semibold mb-2">
                {type.type}
              </h3>


              <div className="pl-3 space-y-3">

                {type.categories?.map((category) => (
                  <div key={category.slug}>

                    {/* <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {category?.category}
                    </h4> */}

                    <div className="pl-3 flex flex-col gap-1">

                      {category.subCategories?.map((subCategory) => (
                        <NavLink
                          key={subCategory}
                          to={`/category/${type.slug}/${category.slug}/${subCategory
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          className="
                                  text-sm
                                  text-gray-500
                                  dark:text-gray-400
                                  hover:text-orange-500
                                  transition-colors
                                "
                        >
                          {subCategory}
                        </NavLink>
                      ))}

                    </div>

                  </div>
                ))}

              </div>

            </div>
          ))}

        </div>
      </Scrollbars>
    </div>
  );
}

export default CategorySidebar;





// import { NavLink } from "react-router-dom";
// import { Scrollbars } from "react-custom-scrollbars-2";
// import { useState } from "react";

// function CategorySidebar({ MainCategory }) {
//     const [showScrollbar, setShowScrollbar] = useState(false);

//     return (
//         <div
//             className="category-sidebar h-full w-full"
//             onMouseEnter={() => setShowScrollbar(true)}
//             onMouseLeave={() => setShowScrollbar(false)}
//         >
//             <Scrollbars
//                 autoHide={false}

//                 renderTrackVertical={({ style, ...props }) => (
//                     <div
//                         {...props}
//                         style={{
//                             ...style,
//                             width: "8px",
//                             right: "1px",
//                             top: "2px",
//                             bottom: "2px",
//                             borderRadius: "9999px",
//                             opacity: showScrollbar ? 1 : 0,
//                             visibility: showScrollbar
//                                 ? "visible"
//                                 : "hidden",
//                             transition:
//                                 "opacity 0.2s ease, visibility 0.2s ease",
//                             zIndex: 20,
//                         }}
//                     />
//                 )}

//                 renderThumbVertical={({ style, ...props }) => (
//                     <div
//                         {...props}
//                         style={{
//                             ...style,
//                             width: "6px",
//                             marginLeft: "1px",
//                             borderRadius: "9999px",
//                             backgroundColor: "#9ca3af",
//                             transition: "background-color 0.2s ease",
//                         }}
//                         onMouseEnter={(e) => {
//                             e.currentTarget.style.backgroundColor =
//                                 "#4b5563";
//                         }}
//                         onMouseLeave={(e) => {
//                             e.currentTarget.style.backgroundColor =
//                                 "#9ca3af";
//                         }}
//                     />
//                 )}

//                 renderView={({ style, ...props }) => (
//                     <div
//                         {...props}
//                         style={{
//                             ...style,
//                             overflowX: "hidden",
//                         }}
//                     />
//                 )}
//             >
//                 <div className="flex flex-col text-base font-poppins text-black dark:text-gray-300">
//                     {MainCategory.map((category, index) => (
//                         <NavLink
//                             key={index}
//                             to={`/category/${category.toLowerCase()}`}
//                             className={({ isActive }) =>
//                                 `py-3 px-4 ${
//                                     isActive
//                                         ? "text-orange-500"
//                                         : "hover:text-orange-400"
//                                 }`
//                             }
//                         >
//                             {category}
//                         </NavLink>
//                     ))}
//                 </div>
//             </Scrollbars>
//         </div>
//     );
// }

// export default CategorySidebar;
