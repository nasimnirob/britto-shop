const SelectedPreview = ({
    image,
    colorName,
    sizeName,
    sellingPrice,
    mrp,
    currency = "TK",
    onImageClick,
}) => {
    const hasColor = Boolean(colorName);
    const hasSize = Boolean(sizeName);
    const discount =
        mrp > 0 && sellingPrice < mrp
            ? Math.round(((mrp - sellingPrice) / mrp) * 100)
            : 0;

    return (
        <div className="w-full max-w-[200px] bg-white dark:bg-[#252728] border border-[#E1E4E7] dark:border-[#3B3D3E] rounded-[6px] overflow-hidden shadow-sm">
            <div
                onClick={onImageClick}
                className="w-full h-[200px] bg-[#F5F5F5] dark:bg-[#1E1F20] flex items-center justify-center cursor-pointer"
            >
                <img
                    src={image}
                    alt="selected"
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="px-4 py-4 text-center font-poppins">
                <p className="text-[13px] text-gray-500 dark:text-gray-400">
                    You&apos;ve selected:
                </p>

                {(hasSize || hasColor) && (
                    <h3 className="text-[17px] font-medium mt-1 text-black dark:text-[#E2E5E9] leading-snug">
                        {hasSize && <>Size: {sizeName}</>}
                        {hasSize && hasColor && (
                            <span className="mx-2 text-gray-400">•</span>
                        )}
                        {hasColor && <>Color: {colorName}</>}
                    </h3>
                )}

                <div className="flex items-center justify-center gap-2 mt-3">
                    <span className="text-[22px] font-bold text-[#E53935]">
                        {sellingPrice} {currency}
                    </span>
                    {mrp > sellingPrice && (
                        <span className="text-[15px] text-gray-400 line-through">
                            {mrp} {currency}
                        </span>
                    )}
                </div>

                {discount > 0 && (
                    <p className="text-[12px] text-green-600 mt-1">
                        {discount}% OFF
                    </p>
                )}
            </div>
        </div>
    );
};

export default SelectedPreview;