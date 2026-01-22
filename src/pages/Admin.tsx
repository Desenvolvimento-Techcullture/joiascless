import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload } from "lucide-react";
import { products } from "@/data/company.js";

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
import { Pencil, Trash2, Plus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ProductForm {
  name: string;
  price: string;
  category: string;
  image: string;
  description: string;
  sizes: string;
}

const Admin = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  let  prods = products;

  const saverProds = localStorage.getItem("products");
  if (saverProds) {
     prods = ( JSON.parse(saverProds));
  }
  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    price: "",
    category: "",
    image: "",
    description: "",
    sizes: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
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
      category: product.category,
      image: product.image,
      description: product.description || "",
      sizes: product.sizes ? product.sizes.join(", ") : "",
    });
    setEditingId(product.id);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo de imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // const { error: uploadError } = await supabase.storage
      //   .from("product-images")
      //   .upload(filePath, file);

      // if (uploadError) throw uploadError;

      // const { data: { publicUrl } } = supabase.storage
      //   .from("product-images")
      //   .getPublicUrl(filePath);

      // setFormData({ ...formData, image: publicUrl });

      toast({
        title: "Imagem enviada",
        description: "A imagem foi enviada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar imagem",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image,
      description: formData.description || null,
      sizes: formData.sizes
        ? formData.sizes.split(",").map((s) => s.trim())
        : null,
    };

    try {
      if (editingId) {
        // const { error } = await supabase
        //   .from("products")
        //   .update(productData)
        //   .eq("id", editingId);

        // if (error) throw error;

        const index = prods.findIndex( p => p.id == editingId);
        prods[index] = {...prods[index], ...productData };

        toast({
          title: "Produto atualizado",
          description: "O produto foi atualizado com sucesso.",
        });
      } else {
        // const { error } = await supabase.from("prods").insert([productData]);
        prods.push( { id: (prods.length + 1) , ...productData } );

        // if (error) throw error;

        toast({
          title: "Produto criado",
          description: "O produto foi criado com sucesso.",
        });
      }
      // Salva o conteudo
      localStorage.setItem("products", JSON.stringify(prods));
      // refetch();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este produto?")) return;

    try {
      // const { error } = await supabase.from("products").delete().eq("id", id);
      const index = prods.findIndex( p => p.id == id);
      prods.splice(index,1);
      
      // Salva o conteudo
      localStorage.setItem("products", JSON.stringify(prods));
      // if (error) throw error;

      toast({
        title: "Produto deletado",
        description: "O produto foi deletado com sucesso.",
      });

      // refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex flex-col">
  //       <Header />
  //       <main className="flex-grow container mx-auto px-4 py-24">
  //         <div className="text-center">Carregando...</div>
  //       </main>
  //       <Footer />
  //     </div>
  //   );
  // }
 const handleimg = (id) => {
  // alert('produto em formulario  ' + formData.name);

    const index = prods.findIndex( p => p.id == id);
        prods[index] = {...prods[index], 
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        sizes: formData.sizes
        ? formData.sizes.split(",").map((s) => s.trim())
        : null,
      };
      // setEditingId(id);

      // Salva o conteudo
      localStorage.setItem("products", JSON.stringify(prods));
    
 }
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Administração de Produtos</h1>
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
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Preço</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="image-upload">Upload de Imagem</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isUploading}
                          onClick={() => document.getElementById("image-upload")?.click()}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Escolher Imagem
                            </>
                          )}
                        </Button>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        {formData.image && (
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="h-16 w-16 object-cover rounded-md"
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="image">Ou insira a URL da Imagem</Label>
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) =>
                          setFormData({ ...formData, image: e.target.value })
                        }
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sizes">Tamanhos (separados por vírgula)</Label>
                    <Input
                      id="sizes"
                      value={formData.sizes}
                      onChange={(e) =>
                        setFormData({ ...formData, sizes: e.target.value })
                      }
                      placeholder="P, M, G, GG"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
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

          <div className="grid gap-4">
            {prods?.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-24 h-24 object-contain rounded-md"
                            onClick={ () => handleimg(product.id)}

                      />
                      <div>
                        <CardTitle>{product.name}</CardTitle>
                        <CardDescription className="mt-2">
                          {product.category} • R$ {product.price.toFixed(2)}
                        </CardDescription>
                        {product.sizes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Tamanhos: {product.sizes.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
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
