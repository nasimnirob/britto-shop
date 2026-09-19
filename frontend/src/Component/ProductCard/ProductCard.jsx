import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const { _id, name, thumbnail, price, rating } = product;

    return (
        <Link to={`/product/${_id}`} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
            <figure className="aspect-[4/5] overflow-hidden">
                <img src={thumbnail} alt={name} className="w-full h-full object-cover" />
            </figure>

            <div className="card-body p-3 gap-1">
                <h3 className="text-sm font-medium line-clamp-2">{name}</h3>

                <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-primary">৳{price.sellingPrice}</span>
                    {price.discountPercent > 0 && (
                        <span className="text-xs text-gray-400 line-through">৳{price.mrp}</span>
                    )}
                </div>

                {rating?.count > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span>⭐ {rating.average}</span>
                        <span>({rating.count})</span>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ProductCard;