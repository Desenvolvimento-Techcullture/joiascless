import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, Pencil, Trash2, Plus } from "lucide-react";
import { products } from "@/data/company.js";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ProductForm {
  name: string;
  price: string;
  quantity: string;
  category: string;
  image: string;
  description: string;
  sizes: string;
}

const Admin = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState("");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  let prods = products;
  const savedProds = localStorage.getItem("products");
  if (savedProds) {
    prods = JSON.parse(savedProds);
  }

  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    price: "",
    quantity: "",
    category: "",
    image: "",
    description: "",
    sizes: "",
  });

  const filteredProducts = prods.filter((product) => {
    const term = search.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term)
    );
  });

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      quantity: "",
      category: "",
      image: "",
      description: "",
      sizes: "",
    });
    setEditingId(null);
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      category: product.category,
      image: product.image,
      description: product.description || "",
      sizes: product.sizes ? product.sizes.join(", ") : "",
    });
    setEditingId(product.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      quantity: parseFloat(formData.quantity),
      category: formData.category,
      image: formData.image,
      description: formData.description || null,
      sizes: formData.sizes
        ? formData.sizes.split(",").map((s) => s.trim())
        : null,
    };

    if (editingId) {
      const index = prods.findIndex((p) => p.id == editingId);
      prods[index] = { ...prods[index], ...productData };

      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso.",
      });
    } else {
      prods.push({ id: prods.length + 1, ...productData });

      toast({
        title: "Produto criado",
        description: "O produto foi criado com sucesso.",
      });
    }

    localStorage.setItem("products", JSON.stringify(prods));
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este produto?")) return;

    const index = prods.findIndex((p) => p.id == id);
    prods.splice(index, 1);

    localStorage.setItem("products", JSON.stringify(prods));

    toast({
      title: "Produto deletado",
      description: "O produto foi deletado com sucesso.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Administração de Produtos
              </h1>
              <p className="text-muted-foreground">
                Gerencie os produtos da sua loja
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Produto
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Editar Produto" : "Novo Produto"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingId
                      ? "Atualize as informações do produto"
                      : "Adicione um novo produto à loja"}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Nome</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Preço</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label>Estoque</Label>
                      <Input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Categoria</Label>
                    <Input
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label>Imagem (URL)</Label>
                    <Input
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Descrição</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Tamanhos</Label>
                    <Input
                      value={formData.sizes}
                      onChange={(e) =>
                        setFormData({ ...formData, sizes: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingId ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* PESQUISA */}
          <Input
            placeholder="Pesquisar por nome ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md mb-6"
          />

          {filteredProducts.length === 0 && (
            <p className="text-muted-foreground">
              Nenhum produto encontrado.
            </p>
          )}

          <div className="grid gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <div className="flex justify-between">
                    <div className="flex gap-4">
                      <img
                        src={product.image}
                        className="w-24 h-24 object-contain rounded"
                      />
                      <div>
                        <CardTitle>{product.name}</CardTitle>
                        <CardDescription>
                          {product.category} • R$ {product.price.toFixed(2)}
                        </CardDescription>
                        <p className="text-sm">
                          Estoque: {product.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {product.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {product.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;