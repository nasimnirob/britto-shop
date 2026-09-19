import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Thumbs } from "swiper/modules";

import "swiper/css";
import "swiper/css/thumbs";

import img3 from "../../../assets/banner/Web-Cover-2026--Panjabi.jpeg";
import img5 from "../../../assets/banner/pp.jpeg";

const images = ['https://i.ibb.co.com/zWs5rhyD/cc9973b9183688b983c16e1891dcceb0.jpg', 'https://i.ibb.co.com/zWs5rhyD/cc9973b9183688b983c16e1891dcceb0.jpg'];

const Banner = () => {
    const swiperRef = useRef(null);
    const clickTimeRef = useRef([]);
    const [initAnim, setInitAnim] = useState(true);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const restoreSpeedRef = useRef(null);


    const getDynamicSpeed = () => {
        const now = Date.now();
        clickTimeRef.current = clickTimeRef.current.filter(t => now - t < 1000);
        const count = clickTimeRef.current.length;

        if (count === 0) return 700;
        if (count <= 2) return 400;
        if (count <= 5) return 100;
        return 100;
    };

    const handleClick = (dir) => {
        clickTimeRef.current.push(Date.now());
        const speed = getDynamicSpeed();

        const swiper = swiperRef.current;
        if (!swiper) return;

        swiper.params.speed = speed;
        swiper.autoplay.stop();

        if (dir === "next") swiper.slideNext(speed);
        else swiper.slidePrev(speed);

        if (restoreSpeedRef.current) clearTimeout(restoreSpeedRef.current);

        restoreSpeedRef.current = setTimeout(() => {
            if (swiperRef.current) {
                swiperRef.current.params.speed = 700;
            }
        }, 1000);

        setTimeout(() => {
            swiper.autoplay.start();
        }, 4000);
    };

    return (
        <div className="w-full">
            <div className="relative group overflow-hidden">

                <div
                    className={initAnim ? "animate-slide-in-down" : ""}
                    onAnimationEnd={() => setInitAnim(false)}
                >
                    <Swiper
                        modules={[Autoplay, Thumbs]}
                        loop={true}
                        speed={900}
                        autoplay={{
                            delay: 4000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        thumbs={{ swiper: thumbsSwiper }}
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper;
                        }}
                        className="w-full"
                    >
                        {images.map((img, i) => (
                            <SwiperSlide key={i}>
                                <img
                                    className="w-full object-cover h-[20vh] sm:h-[40vh] md:h-[50vh] lg:h-[60vh] xl:h-[70vh] 2xl:h-[75vh]"
                                    src={img}
                                    alt={`slide-${i}`}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                <div
                    onClick={() => handleClick("prev")}
                    className="select-none absolute left-5 top-1/2 -translate-y-1/2 z-30
                    bg-black/80 text-white px-4 py-2 rounded-sm cursor-pointer
                    opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                    ❮
                </div>
                <div
                    onClick={() => handleClick("next")}
                    className="select-none absolute right-5 top-1/2 -translate-y-1/2 z-30
                    bg-black/80 text-white px-4 py-2 rounded-sm cursor-pointer
                    opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                    ❯
                </div>
            </div>

            {/*           
            <Swiper
                modules={[Thumbs]}
                onSwiper={setThumbsSwiper}
                slidesPerView={4}
                spaceBetween={10}
                watchSlidesProgress={true}
                className="mt-3 max-w-xl mx-auto px-2"
            >
                {images.map((img, i) => (
                    <SwiperSlide key={i}>
                        <img
                            className="w-full h-20 object-cover cursor-pointer border-2 border-transparent 
                            opacity-60 hover:opacity-100 transition-all duration-200
                            [.swiper-slide-thumb-active_&]:opacity-100 
                            [.swiper-slide-thumb-active_&]:border-blue-500"
                            src={img}
                            alt={`thumb-${i}`}
                        />
                    </SwiperSlide>
                ))}
            </Swiper> */}

            <Swiper
                modules={[Thumbs]}
                watchSlidesProgress={true}
                onSwiper={setThumbsSwiper}
                slidesPerView="auto"
                spaceBetween={10}
                centeredSlides={true}
                className="mt-2 w-full"
            >
                {images.map((img, i) => (
                    <SwiperSlide key={i} style={{ width: "12px" }}>
                        <img
                            src={img}
                            alt={`thumb-${i}`}
                            className="w-full object-cover h-1 cursor-pointer
                opacity-50 transition-all duration-300
                [.swiper-slide-thumb-active_&]:opacity-100
                [.swiper-slide-thumb-active_&]:ring-1
                [.swiper-slide-thumb-active_&]:ring-black"
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Banner;