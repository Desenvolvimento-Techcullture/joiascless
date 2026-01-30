import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"

import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Upload,
  Pencil,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import { useProduct } from "@/contexts/ProductContext";
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
import { Order, Customer, ProductForm } from "@/lib/types";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

const Admin = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { products, addProduct, updateProduct, removeProduct, reloadProducts, loading, error } = useProduct();
  const { authFetch, loading: loadingFetch, error: fetchError } = useAuthFetch();

  const [activeTab, setActiveTab] = useState<"products" | "orders" | "customers">(
    "products"
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // ===== Autenticação =====
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // ===== Dados =====
  // const savedProds = localStorage.getItem("products");
  // if (savedProds) productsData = JSON.parse(savedProds);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await authFetch<Order[]>({ url: "orders/" });
      setOrders(data);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const data = await authFetch<Customer[]>({ url: "customers/" });

      setCustomers(data);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
    } finally {
      setLoadingCustomers(false);
    }
  };

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
    highlight: false,
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
      highlight: false,
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
      highlight: product.highlight,
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

  const handleSubmitProduct = async (e: React.FormEvent) => {
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
      highlight: formData.highlight,
    };

    if (editingId) {
      const index = products.findIndex((p) => p.id == parseInt(editingId));

      const resp = await updateProduct({ id: parseInt(editingId), ...productData });

      toast({ title: "Produto atualizado", description: "Produto atualizado com sucesso!" });
    } else {
      addProduct({ ...productData });

      toast({ title: "Produto criado", description: "Produto criado com sucesso!" });
    }

    // localStorage.setItem("products", JSON.stringify(productsData));
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteProduct = (id: string) => {
    if (!confirm("Deseja realmente deletar este produto?")) return;
    const index = products.findIndex((p) => p.id == parseInt(id));
    products.splice(index, 1);
    // localStorage.setItem("products", JSON.stringify(initialProducts));
    removeProduct(parseInt(id));
    toast({ title: "Produto deletado", description: "Produto deletado com sucesso!" });
  };

  const handleConfirmOrder = (order) => {
    if (!confirm(`Deseja confirmar o pedido ${order.id}?`)) return;

    order.items.forEach( el => {
     const estoque = products.find( it => it.id = el.id );
     updateProduct({...estoque, quantity: (estoque.quantity - el.quantity )});  
    } );
    order.status = 'finalizado';
    authFetch({ url: `orders/${order.id}`, method: 'PUT', body: order })

    toast({ title: "Pedido Confirmado", description: `O pedido ${order.id} foi confirmado com sucesso`});

  };
  
  // ===== Filtragem produtos =====
  const filteredProducts = products.filter((product) => {
    const term = search.toLowerCase();
    return product.name?.toLowerCase().includes(term) || product.category?.toLowerCase().includes(term);
  });


  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    } else if (activeTab === "customers") {
      fetchCustomers();
    }
  }, [activeTab]);
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
                <div className="flex items-center justify-between mb-6 gap-4">

                  {/* Pesquisa */}
                  <Input placeholder="Pesquisar por nome ou categoria..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-md " />

                  <DialogTrigger asChild>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">

                      <Button onClick={resetForm}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Produto
                      </Button>
                    </div>
                  </DialogTrigger>
                </div>

                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingId ? "Editar Produto" : "Novo Produto"}</DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleSubmitProduct} className="space-y-4 overflow-y-auto max-h-[75vh] pr-2">
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
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label>Destaque</Label>
                        <p className="text-sm text-muted-foreground">
                          Marcar este produto como destaque
                        </p>
                      </div>

                      <Switch
                        checked={formData.highlight}
                        onCheckedChange={(value) => {
                          setFormData(prev => {
                            const updated = { ...prev, highlight: value }

                            return updated
                          })
                        }}
                      />

                    </div>

                    <div>
                      <Label>Tamanhos</Label>
                      <Input value={formData.sizes} onChange={e => setFormData({ ...formData, sizes: e.target.value })} placeholder="12,13,14..." />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                      <Button type="submit"  disabled={loading}>{loading ? "Enviando...":( editingId ? "Atualizar" : "Criar")}</Button>
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
                          <Button size="icon" variant="destructive" onClick={() => handleDeleteProduct(String(product.id))}><Trash2 className="h-4 w-4" /></Button>
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

              {loadingOrders ? (
                <p>Carregando pedidos...</p>
              ) : fetchError ? (
                <p className="text-red-600">{fetchError}</p>
              ) : orders.length === 0 ? (
                <p>Nenhum pedido encontrado.</p>
              ) : (
                orders
                .sort((a, b) => b.id - a.id)
                .map((order) => (
                  <Card key={order.id} className="mb-4">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Pedido #{order.id}</CardTitle>
                        <CardDescription>
                          Cliente: {order.customer.name}
                        </CardDescription>
                        <p>Total: R$ {order.total.toFixed(2)}</p>
                      </div>
                
                      <div className="flex flex-col items-end gap-2">
                        <span>Status: {order.status || 'pendente'}</span>
                      {
                        (order.status == 'pendente') && (

                          <Button
                          onClick={() => handleConfirmOrder(order)}
                          variant="outline"
                          >
                          Confirmar pedido
                        </Button>
                          )
                        }
                      </div>
                    </div>
                  </CardHeader>
                </Card>
                
                ))
              )}
            </div>
          )}


          {activeTab === "customers" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Clientes</h2>

              {loadingCustomers ? (
                <p>Carregando clientes...</p>
              ) : fetchError ? (
                <p className="text-red-600">{fetchError}</p>
              ) : customers.length === 0 ? (
                <p>Nenhum cliente encontrado.</p>
              ) : (
                customers.map((customer) => (
                  <Card key={customer.name} className="mb-4">
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
                ))
              )}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
