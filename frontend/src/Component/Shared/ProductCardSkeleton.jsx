const ProductCardSkeleton = () => {
  return (
    <div className="card shadow-md  ">
      <div className="bg-gray-300 dark:bg-gray-700 h-56 w-full rounded-t"></div>

      <div className="card-body">
        <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>

        <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mt-2"></div>

        <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded mt-4"></div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;