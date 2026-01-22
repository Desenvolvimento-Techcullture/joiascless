import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ShoppingBag, ChevronLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { products } from "@/data/company.js";


// Mock products data (em produção viria de uma API/banco de dados)


const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const prods = JSON.parse(localStorage.getItem("products")) ?? products;
 
  const product = prods.find((p) => p.id == id);

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-20 pb-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-2xl font-light mb-4">Produto não encontrado</h1>
            <Button onClick={() => navigate("/products")}>
              Voltar aos Produtos
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      return;
    }
    addToCart(product, selectedSize);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth mb-8"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar aos produtos
          </Link>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Image */}
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                  {product.category}
                </p>
                <h1 className="text-4xl font-light mb-4 text-gray-900 ">{product.name}</h1>
                <p className="text-3xl font-light text-primary">
                  R$ {product.price.toFixed(2).replace(".", ",")}
                </p>
              </div>

              {product.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">Selecione o tamanho:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        onClick={() => setSelectedSize(size)}
                        className="min-w-[60px]"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                  {!selectedSize && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selecione um tamanho para adicionar ao carrinho
                    </p>
                  )}
                </div>
              )}

              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleAddToCart}
                disabled={product.sizes && product.sizes.length > 0 && !selectedSize}
              >
                <ShoppingBag className="h-5 w-5" />
                Adicionar ao Carrinho
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProductDetail;
