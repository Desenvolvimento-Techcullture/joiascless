import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Upload,
  Pencil,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import { products as initialProducts } from "@/data/company.js";
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
  images: string[];
  description: string;
  sizes: string;
}

interface Order {
  id: string;
  customer: string;
  total: number;
  status: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const Admin = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<"products" | "orders" | "customers">(
    "products"
  );

  // ===== Autenticação =====
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // ===== Dados =====
  let productsData = initialProducts;
  const savedProds = localStorage.getItem("products");
  if (savedProds) productsData = JSON.parse(savedProds);

  const savedOrders = localStorage.getItem("orders");

  const orders: Order[] = savedOrders
    ? JSON.parse(savedOrders)
    : [
      { id: "1", customer: "João Silva", total: 199.9, status: "Pendente" },
      { id: "2", customer: "Maria Oliveira", total: 349.5, status: "Enviado" },
    ];

  const savedCustomers = localStorage.getItem("customers");
  const customers: Customer[] = savedCustomers
    ? JSON.parse(savedCustomers)
    : [
      { id: "1", name: "João Silva", email: "joao@mail.com", phone: "99999-9999" },
      { id: "2", name: "Maria Oliveira", email: "maria@mail.com", phone: "98888-8888" },
    ];

  // ===== Estado produtos =====
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    price: "",
    quantity: "",
    category: "",
    images: [],
    description: "",
    sizes: "",
  });

  // ===== Funções utilitárias =====
  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      quantity: "",
      category: "",
      images: [],
      description: "",
      sizes: "",
    });
    setEditingId(null);
  };

  const handleEditProduct = (product: any) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      category: product.category,
      images: product.images || [],
      description: product.description || "",
      sizes: product.sizes ? product.sizes.join(", ") : "",
    });
    setEditingId(product.id);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith("image/")) {
        toast({ title: "Erro", description: "Selecione apenas imagens.", variant: "destructive" });
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Erro", description: "Máximo 5MB por imagem.", variant: "destructive" });
        continue;
      }

      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onload = () => {
          if (reader.result) newImages.push(reader.result as string);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    setFormData({ ...formData, images: [...formData.images, ...newImages] });
    toast({ title: "Imagens carregadas", description: "Sucesso!" });
  };

  const handleRemoveImage = (index: number) => {
    const updated = [...formData.images];
    updated.splice(index, 1);
    setFormData({ ...formData, images: updated });
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.images.length === 0) {
      toast({ title: "Erro", description: "Adicione ao menos uma imagem.", variant: "destructive" });
      return;
    }

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      quantity: parseFloat(formData.quantity),
      category: formData.category,
      images: formData.images,
      description: formData.description || null,
      sizes: formData.sizes
        ? formData.sizes.split(",").map((s) => s.trim())
        : null,
    };

    if (editingId) {
      const index = productsData.findIndex((p) => p.id == editingId);
      productsData[index] = { ...productsData[index], ...productData };
      toast({ title: "Produto atualizado", description: "Produto atualizado com sucesso!" });
    } else {
      productsData.push({ id: productsData.length + 1, ...productData });
      toast({ title: "Produto criado", description: "Produto criado com sucesso!" });
    }

    localStorage.setItem("products", JSON.stringify(productsData));
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteProduct = (id: string) => {
    if (!confirm("Deseja realmente deletar este produto?")) return;
    const index = productsData.findIndex((p) => p.id == id);
    productsData.splice(index, 1);
    localStorage.setItem("products", JSON.stringify(productsData));
    toast({ title: "Produto deletado", description: "Produto deletado com sucesso!" });
  };

  // ===== Filtragem produtos =====
  const filteredProducts = productsData.filter((product) => {
    const term = search.toLowerCase();
    return product.name.toLowerCase().includes(term) || product.category.toLowerCase().includes(term);
  });

  // ===== Render =====
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h1 className="text-4xl font-bold mb-2">Painel de Administração</h1>
          </div>

          {/* ===== Abas ===== */}
          <div className="flex gap-2 mb-6 border-b pb-2">
            <Button
              variant={activeTab === "products" ? "default" : "outline"}
              onClick={() => setActiveTab("products")}
            >
              Produtos
            </Button>
            <Button
              variant={activeTab === "orders" ? "default" : "outline"}
              onClick={() => setActiveTab("orders")}
            >
              Pedidos
            </Button>
            <Button
              variant={activeTab === "customers" ? "default" : "outline"}
              onClick={() => setActiveTab("customers")}
            >
              Clientes
            </Button>
          </div>

          {/* ===== Conteúdo da Aba ===== */}
          {activeTab === "products" && (
            <div>

              {/* Botão Novo Produto */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    {/* Pesquisa */}
                    <Input placeholder="Pesquisar por nome ou categoria..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-md " />
                    <Button onClick={resetForm}>
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Produto
                    </Button>
                  </div>
                </DialogTrigger>

                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingId ? "Editar Produto" : "Novo Produto"}</DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleSubmitProduct} className="space-y-4">
                    <div>
                      <Label>Nome</Label>
                      <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Preço</Label>
                        <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                      </div>
                      <div>
                        <Label>Estoque</Label>
                        <Input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} required />
                      </div>
                    </div>
                    <div>
                      <Label>Categoria</Label>
                      <Input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required />
                    </div>
                    {/* Upload múltiplas imagens */}
                    <div>
                      <Label htmlFor="image-upload">Upload de Imagens</Label>
                      <div className="flex items-center gap-4 flex-wrap">
                        <Button type="button" variant="outline" disabled={isUploading} onClick={() => document.getElementById("image-upload")?.click()}>
                          {isUploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" /> Escolher Imagens
                            </>
                          )}
                        </Button>
                        <input id="image-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                        <div className="flex gap-2 flex-wrap mt-2">
                          {formData.images.map((img, idx) => (
                            <div key={idx} className="relative">
                              <img src={img} alt={`Preview ${idx + 1}`} className="h-16 w-16 object-cover rounded-md" />
                              <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Ou insira URLs das imagens (uma por linha)</Label>
                      <Textarea value={formData.images.join("\n")} onChange={(e) => setFormData({ ...formData, images: e.target.value.split("\n").map(url => url.trim()).filter(Boolean) })} />
                    </div>

                    <div>
                      <Label>Descrição</Label>
                      <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>

                    <div>
                      <Label>Tamanhos</Label>
                      <Input value={formData.sizes} onChange={e => setFormData({ ...formData, sizes: e.target.value })} placeholder="12,13,14..." />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                      <Button type="submit">{editingId ? "Atualizar" : "Criar"}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {filteredProducts.length === 0 && <p className="text-muted-foreground">Nenhum produto encontrado.</p>}

              <div className="grid gap-4">
                {filteredProducts.map(product => (
                  <Card key={product.id}>
                    <CardHeader>
                      <div className="flex justify-between">
                        <div className="flex gap-4">
                          <img src={product.images[0]} className="w-24 h-24 object-contain rounded" />
                          <div>
                            <CardTitle>{product.name}</CardTitle>
                            <CardDescription>{product.category} • R$ {product.price.toFixed(2)}</CardDescription>
                            <p className="text-sm">Estoque: {product.quantity}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" variant="outline" onClick={() => handleEditProduct(product)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="destructive" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </CardHeader>
                    {product.description && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Pedidos</h2>
              {orders.map(order => (
                <Card key={order.id} className="mb-4">
                  <CardHeader>
                    <div className="flex justify-between ">
                      <div>
                        <CardTitle>Pedido #{order.id}</CardTitle>
                        <CardDescription>Cliente: {order.customer.name}</CardDescription>
                        <p>Total: R$ {order.total.toFixed(2)}</p>
                      </div>
                      <div>Status: {order.status}</div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "customers" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Clientes</h2>
              {customers.map(customer => (
                <Card key={customer.id} className="mb-4">
                  <CardHeader>
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>{customer.name}</CardTitle>
                        <CardDescription>Email: {customer.email}</CardDescription>
                        <p>Telefone: {customer.phone}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
