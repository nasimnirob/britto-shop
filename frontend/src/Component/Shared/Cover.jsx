import React from 'react';

import { Parallax } from 'react-parallax';
import Banner from '../../assets/cover/banner.jpg'
import img2 from '../../assets/cover/istockphoto-1148925683-612x612.jpg'
import SectionTittle from '../SectionTittle/SectionTittle';


const Cover = () => {
    return (
        <>
            <Parallax
                blur={{ min: -30, max: 30 }}
                bgImage={Banner}
                bgImageAlt="A scenic background"

            >

                <div className='hero-overlay bg-opacity-60 bg-black pt-8 pb-0.5 h-44'>
                    <SectionTittle
                        subHeading={'Check it out'}
                        heading={'From Our Products'}
                    ></SectionTittle>
                </div>
                <div className='hero' style={{ height: '600px' }}>
                    <div className="hero-overlay bg-opacity-60 bg-black"></div>
                    <div className="hero-content text-neutral-content text-center flex-col lg:flex-row lg:gap-9 gap-2">
                        <img className='my-2 lg:my-0 lg:w-1/2 md:w-2/3 rounded transition-transform duration-300 transform hover:scale-105' src={img2} alt="" />
                        <div className="max-w-md">
                            <h1 className="mb-7 text-5xl font-bold text-orange-500">বৃত্ত শপ</h1>
                            <p className="mb-7">
                                আমরা মানসম্মত পণ্য ও সেবা দিয়ে থাকি গ্রাহকের সন্তুষ্টিকে অগ্রাধিকার দিয়ে। প্রতিদিনের প্রয়োজনীয় সবকিছু এক ছাদের নিচে।
                                <span>
                                    আমাদের এখানে আপনি পাবেন নিত্যপ্রয়োজনীয় পণ্য, গৃহস্থালি সামগ্রী, ফ্যাশন আইটেমসহ আরও অনেক কিছু। সাশ্রয়ী দামে সেরা পণ্য নিয়ে আমরা সবসময় প্রস্তুত।
                                </span>
                            </p>
                            <button className="btn btn-outline border-b-4 text-orange-500 border-0">Read More</button>
                        </div>
                    </div>
                </div>
            </Parallax>
        </>
    );
};

export default Cover;
