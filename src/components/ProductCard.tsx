import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { ProductCarousel } from "@/components/ProductCarousel";



interface ProductCardProps {
  id: string;
  image: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
}

const ProductCard = ({
  id,
  image,
  name,
  description,
  price,
  quantity,
  category,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const isOutOfStock = quantity < 1 ;


  return (
    <div
      className={`group relative overflow-hidden rounded-lg bg-card transition-smooth hover:shadow-hover cursor-pointer ${isOutOfStock ? "opacity-80" : ""
        }`}
      onClick={() => {
        if (!isOutOfStock) {
          navigate(`/product/${id}`);
        }
      }}
    >
      {/* Faixa Esgotado */}
      {isOutOfStock && (
        <div className="absolute top-4 left-[-40px] z-10 rotate-[-45deg] bg-red-600 text-white text-xs font-semibold px-12 py-1">
          ESGOTADO
        </div>
      )}

      {/* Image */}
      <div className="aspect-square overflow-hidden bg-muted relative">
        <img
          src={image}
          alt={name}
          className={`h-full w-full object-contain transition-smooth ${isOutOfStock ? "grayscale" : "group-hover:scale-105"
            }`}
        />
        {/* <ProductCarousel/> */}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-base font-medium mt-1">{name}</h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {description}
          </p>
          {/* <p> Quantidade: {quantity}</p> */}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-lg font-light">
            R$ {price.toFixed(2).replace(".", ",")}
          </p>
          {/* 
          <Button
            size="sm"
            variant="default"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              if (!isOutOfStock) {
                navigate(`/product/${id}`);
              }
            }}
          >
            {isOutOfStock ? "Indisponível" : "Ver Detalhes"}
          </Button> */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    size="sm"
                    variant="default"
                    disabled={isOutOfStock}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isOutOfStock) {
                        navigate(`/product/${id}`);
                      }
                    }}
                  >
                    {isOutOfStock ? "Indisponível" : "Ver Detalhes"}
                  </Button>
                </span>
              </TooltipTrigger>

              {isOutOfStock && (
                <TooltipContent>
                  <p>Produto indisponível</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

        </div>
      </div>
    </div>
  );
};

export default ProductCard;
