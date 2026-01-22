import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import heroBanner from "@/assets/hero-banner.jpg";
import { products, categories, colection } from "@/data/company.js";
import { BannerCarousel } from "@/components/BannerCarousel";


const Index = () => {
  const prods = JSON.parse(localStorage.getItem("products")) ?? products;
  const featuredProducts = prods.slice(0,4);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        {/* <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src='http://sistema.innosystem.com.br/files/logos/189_catalogo.jpg'
              alt="Banner principal"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
          </div>

          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">
                {colection.title}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-light">
                {colection.description}
              </p>
              <div className="flex gap-4">
                <Button size="lg" asChild>
                  <Link to="/products">Ver Produtos</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/contact">Entre em Contato</Link>
                </Button>
              </div>
            </div>
          </div>
        </section> */}
        <BannerCarousel/>
        {/* Featured Products Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl text-primary font-light tracking-tight mb-4">
                Produtos em Destaque
              </h2>
              <p className="text-lg text-muted-foreground">
                Seleção especial das peças mais procuradas
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={String(product.id)}
                  image={product.image}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                  quantity={product.quantity}
                  category={product.category}
                />
              ))}
            </div>

            <div className="text-center mt-12">
              <Button size="lg" variant="outline" asChild>
                <Link to="/products">Ver Todos os Produtos</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-primary-gradient opacity-90 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
                Categorias
              </h2>
              <p className="text-lg ">
                Explore nossa seleção por categoria
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category}
                  to="/products"
                  // className="group relative aspect-square rounded-lg overflow-hidden shadow-elegant hover:shadow-hover transition-smooth"
                  className="px-4 py-2 rounded-full text-sm border transition  hover:bg-white/20 text-center justify-center"

                >
                  {/* <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" /> */}
                  {/* <div className="absolute inset-0 flex items-center justify-center"> */}
                    {/* <h3 className="text-xl md:text-2xl font-light text-primary-foreground"> */}
                      {category}
                    {/* </h3> */}
                  {/* </div> */}
                </Link>
              //   <button
              //   key={category}

              //   className=
              //     "px-4 py-2 rounded-full text-sm border transition bg-muted text-muted-foreground hover:bg-accent/10"
                
              // >
              //   {category}
              // </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
