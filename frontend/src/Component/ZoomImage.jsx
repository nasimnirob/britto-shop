import { useRef } from "react";

const ZoomImage = ({ src, alt }) => {
  const imgRef = useRef();

  const handleMouseMove = (e) => {
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    imgRef.current.style.transformOrigin = `${x}% ${y}%`;
  };

  const handleMouseLeave = () => {
    imgRef.current.style.transformOrigin = 'center center';
  };

  return (
    <div className="overflow-hidden h-56 m-2 rounded-[3px] lg:h-72 md:h-48 w-full group relative">
      <img
        ref={imgRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-300 ease-out scale-100 group-hover:scale-150"
      />
    </div>
  );
};

export default ZoomImage;
