import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { products, sizes } from "@/data/company.js";

const Products = () => {
  const [searchParams] = useSearchParams();
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const prods = JSON.parse(localStorage.getItem("products")) ?? products;
  const categories = [...new Set(prods.map(product => product.category))];

  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size]
    );
  };
  // Filtrar produtos baseado nos critérios selecionados
  const filteredProducts = useMemo(() => {
    return prods.filter((product) => {
      // Filtro de busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Filtro de categoria
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false;
      }

      // Filtro de preço
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      // 🆕 Filtro de tamanho
      if (selectedSizes.length > 0) {
        // Verifica se o produto possui pelo menos um dos tamanhos selecionados
        const hasSelectedSize = product.sizes?.some(size => selectedSizes.includes(size));
        if (!hasSelectedSize) return false;
      }

      return true;
    });
  }, [products, selectedCategories, selectedSizes, priceRange, searchTerm]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-light tracking-tight mb-2">Produtos</h1>
            <p className="text-muted-foreground">
              Explore nossa coleção completa
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-card p-6 rounded-lg shadow-elegant">
                {/* Categories */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-4">Categorias</h3>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center gap-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <Label
                          htmlFor={`category-${category}`}
                          className="text-sm cursor-pointer"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-4">Preço</h3>
                  <Slider
                    min={0}
                    max={1000}
                    step={50}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-4"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>R$ {priceRange[0]}</span>
                    <span>R$ {priceRange[1]}</span>
                  </div>
                </div>

                {/* Sizes */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-4">Tamanhos</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSizes.includes(size) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleSize(size)}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Reset Filters */}
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedSizes([]);
                    setPriceRange([0, 1000]);
                    setSearchTerm("");
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredProducts.length} produtos encontrados
                  {searchTerm && ` para "${searchTerm}"`}
                </p>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={String(product.id)}
                      image={product.image}
                      name={product.name}
                      price={product.price}
                      category={product.category}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    Nenhum produto encontrado com os filtros selecionados.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedSizes([]);
                      setPriceRange([0, 1000]);
                      setSearchTerm("");
                    }}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
