// import React from 'react';

// const RouteLoader = () => {
//     return (
        
//         <div className="route-loader">
//             <div className="logo-pulse">

//                 <div className="logo-dot">

//                     {/* SVG */}
//                     <svg viewBox="0 0 40 40" fill="none">
//                         <path
//                             d="M20 34C20 34 20 18 20 13"
//                             stroke="white"
//                             strokeWidth="2.5"
//                             strokeLinecap="round"
//                         />
//                         <path
//                             d="M20 13C18 9 11 7 9 10C12 12 16 13 20 13"
//                             stroke="white"
//                             strokeWidth="2"
//                             fill="none"
//                             strokeLinecap="round"
//                         />
//                         <path
//                             d="M20 13C22 9 29 7 31 10C28 12 24 13 20 13"
//                             stroke="white"
//                             strokeWidth="2"
//                             fill="none"
//                             strokeLinecap="round"
//                         />
//                         <path
//                             d="M20 16C15 13 10 13 9 16C13 16 17 16 20 16"
//                             stroke="white"
//                             strokeWidth="2"
//                             fill="none"
//                             strokeLinecap="round"
//                         />
//                         <path
//                             d="M20 16C25 13 30 13 31 16C27 16 23 16 20 16"
//                             stroke="white"
//                             strokeWidth="2"
//                             fill="none"
//                             strokeLinecap="round"
//                         />
//                         <path
//                             d="M17 34C18.5 31 21.5 31 23 34"
//                             stroke="white"
//                             strokeWidth="2"
//                             strokeLinecap="round"
//                         />
//                     </svg>

//                 </div>

//                 <span className="text-red-700 uppercase font-semibold tracking-wide">
//                     Britto Shop
//                 </span>

//             </div>
//         </div>
//     );
// };

// export default RouteLoader;



const RouteLoader = ({ loading }) => {
    return (
        <div 
          className="route-loader" 
          style={{ 
            opacity: loading ? 1 : 0, 
            transition: 'opacity 0.3s ease',
            pointerEvents: loading ? 'all' : 'none'
          }}
        >
            <div className="logo-pulse">
                <div className="logo-dot">
                    <svg viewBox="0 0 40 40" fill="none">
                        <path d="M20 34C20 34 20 18 20 13" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                        <path d="M20 13C18 9 11 7 9 10C12 12 16 13 20 13" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <path d="M20 13C22 9 29 7 31 10C28 12 24 13 20 13" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <path d="M20 16C15 13 10 13 9 16C13 16 17 16 20 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <path d="M20 16C25 13 30 13 31 16C27 16 23 16 20 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <path d="M17 34C18.5 31 21.5 31 23 34" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </div>
                <span className="text-red-700 uppercase font-semibold tracking-wide">
                    Britto Shop
                </span>
            </div>
        </div>
    );
};

export default RouteLoader;