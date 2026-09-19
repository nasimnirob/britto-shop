import { useEffect, useRef } from "react";
import { Parallax } from "react-parallax";

const PageCover = ({ img, tittle, description }) => {
  const parallaxRef = useRef(null);

  // useEffect(() => {
  //   // force a re-render or recalculation on mount
  //   setTimeout(() => {
  //     window.dispatchEvent(new Event("resize"));
  //   }, 500);
  // }, []);

  return (
    <Parallax
      ref={parallaxRef}
      blur={{ min: -20, max: 20 }}
      bgImage={img}
      bgImageAlt={tittle}
      strength={300}
    >
      {/* <div className="hero" style={{ height: "600px" }}> */}
      <div className="hero h-screen" >
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content text-neutral-content text-center flex-col lg:flex-row lg:gap-9 gap-2">
          <div className="lg:max-w-2xl max-w-md px-0 lg:px-16 bg-white/10 backdrop-blur-sm rounded-sm">
            <h1 className="mb-4 mt-16 lg:text-5xl text-4xl font-bold text-orange-500 uppercase">
              {tittle}
            </h1>
            <p className="mb-10 text-[14px]">{description}</p>
          </div>
        </div>
      </div>
    </Parallax>
  );
};

export default PageCover;




