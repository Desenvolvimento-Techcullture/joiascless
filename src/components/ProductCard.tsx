import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

interface ProductCardProps {
  id: string;
  image: string;
  name: string;
  price: number;
  category: string;
}

const ProductCard = ({ id, image, name, price, category }: ProductCardProps) => {
  const navigate = useNavigate();

  return (
    <div 
      className="group relative overflow-hidden rounded-lg bg-card transition-smooth hover:shadow-hover cursor-pointer"
      onClick={() => navigate(`/product/${id}`)}
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-contain transition-smooth group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{category}</p>
          <h3 className="text-base font-medium mt-1">{name}</h3>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-lg font-light">
            R$ {price.toFixed(2).replace(".", ",")}
          </p>
          <Button 
            size="sm" 
            variant="default" 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${id}`);
            }}
          >
            Ver Detalhes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
