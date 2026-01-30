import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
  } from "react";

import { useAuthFetch } from "@/hooks/use-auth-fetch";

  
  export interface Product {
    id: number;
    images: string[];
    name: string;
    price: number;
    category: string;
    description: string;
    quantity: number;
    sizes: string[];
    highlight: boolean;
  }
  
  interface ProductContextType {
    products: Product[];
    categories: string[];
    loading: boolean;
    error: string | null;
    reloadProducts: () => void;
    addProduct: (product: Omit<Product, "id">) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    removeProduct: (id: number) => Promise<void>;
  }
  
  const ProductContext = createContext<ProductContextType | undefined>(undefined);
  

  
  export function ProductProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { authFetch } = useAuthFetch();
    const [categories, setCategories] = useState([]);

  
    // Fetch inicial
    async function fetchProducts() {
      try {
        // setLoading(true);
        // setError(null);
  
        // const response = await authFetch({url:'produtos/'});
        
        const data: Product[] = await authFetch({url:'produtos/'});
        
        
        if (!data) throw new Error("Erro ao buscar produtos");
        setCategories([...new Set(data.map(product => product.category))]);
        setProducts(data);
      } catch {
        setError("Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    }
  
    useEffect(() => {
      fetchProducts();
    }, []);
  
    // Adicionar produto via API
    async function addProduct(product: Omit<Product, "id">) {
      try {
        setLoading(true);
      
        // if (!response.ok) throw new Error("Erro ao adicionar produto");
  
        const response = await  authFetch({url:'produtos/', method: 'POST', body: product});

        setProducts((prev) => [...prev, response.reg]);
      } catch {
        setError("Erro ao adicionar produto");
      } finally {
        setLoading(false);
      }
    }
  
   
  
    async function updateProduct(product: Product) {
        try {
          setLoading(true);
      
                // if (!res.ok) throw new Error("Erro ao atualizar produto");
      
          const updatedProduct: Product =  await  authFetch({url:`produtos/${product.id}/`, method: "PUT", body: product});

          // Cria um novo array e novos objetos para forçar render
          setProducts((prev) =>
            prev.map((p) =>
              p.id === product.id ? { ...product } : { ...p }
            )
          );


        } catch {
          setError("Erro ao atualizar produto");
        } finally {
          setLoading(false);
        }
      }
      
    // Remover produto via API
    async function removeProduct(id: number) {
      try {
        setLoading(true);
        console.log(id);
        const response =   await  authFetch({url:`produtos/${id}`, method: 'DELETE'});

           // if (!response.ok) throw new Error("Erro ao remover produto");
        // const index = productsData.findIndex((p) => p.id == id);
    // productsData.splice(index, 1);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } catch {
        setError("Erro ao remover produto");
      } finally {
        setLoading(false);
      }
    }
  
    return (
      <ProductContext.Provider
        value={{
          products,
          categories,
          loading,
          error,
          reloadProducts: fetchProducts,
          addProduct,
          updateProduct,
          removeProduct,
        }}
      >
        {children}
      </ProductContext.Provider>
    );
  }
  
  // Hook customizado
  export function useProduct() {
    const context = useContext(ProductContext);
    if (!context)
      throw new Error("useProduct deve ser usado dentro de ProductProvider");
    return context;
  }
  