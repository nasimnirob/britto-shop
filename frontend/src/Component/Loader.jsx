import React from 'react';

const Loader = () => {
    return (
       <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex items-center gap-3 animate-pulse">

        <div className="w-14 h-14">
          <img
            src="/logo-icon.svg"
            alt="logo"
            className="w-full h-full object-contain"
          />
        </div>

        <h2 className="text-xl font-bold">
          SUNNAH SQUARE
        </h2>

      </div>
    </div>
    );
};

export default Loader;