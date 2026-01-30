import { useState } from "react";
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { company } from "@/assets/data.js";
import WhatsAppIcon from "@/components/WhatsAppIcon";
const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Erro",
        description: "Por favor, insira um e-mail válido.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Mensagem enviada!",
      description: "Entraremos em contato em breve.",
    });

    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4 ">
              Entre em Contato
            </h1>
            <p className="text-lg text-muted-foreground">
              Estamos aqui para ajudar você
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="bg-card p-8 rounded-lg shadow-elegant">
              <h2 className="text-2xl font-light tracking-tight mb-6">
                Envie sua Mensagem
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    placeholder="Como podemos ajudar você?"
                    rows={6}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full">
                  Enviar Mensagem
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-muted p-8 rounded-lg">
                <h2 className="text-2xl font-light tracking-tight mb-6">
                  Informações de Contato
                </h2>

                <div className="space-y-6">
                  {company.address && (<div className="flex items-start gap-4">
                    <div className="bg-background p-3 rounded-lg">
                      <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Endereço</h3>
                      <p className="text-sm text-muted-foreground">
                        {company.address}
                      </p>
                    </div>
                  </div>)}

                  {company.phone && (<div className="flex items-start gap-4">
                    <div className="bg-background p-3 rounded-lg">
                      <Phone className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Telefone</h3>
                      <p className="text-sm text-muted-foreground">
                        {company.phone}<br />
                        {company.openingHours}
                      </p>
                    </div>
                  </div>)}

                  {company.email && (<div className="flex items-start gap-4">
                    <div className="bg-background p-3 rounded-lg">
                      <Mail className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">E-mail</h3>
                      <p className="text-sm text-muted-foreground">
                        {company.email}
                      </p>
                    </div>
                  </div>)}
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-card p-8 rounded-lg shadow-elegant">
                <h3 className="text-xl font-light tracking-tight mb-4">
                  Redes Sociais
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Siga-nos nas redes sociais para ficar por dentro das novidades
                </p>

                <div className="flex gap-4">
                 { company.instagram && ( <a
                    href={company.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted p-4 rounded-lg hover:bg-accent transition-smooth flex items-center justify-center"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>)}
                  {company.facebook && (<a
                    href={company.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted p-4 rounded-lg hover:bg-accent transition-smooth flex items-center justify-center"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-6 w-6" />
                  </a>)}
                  {company.youtube && (<a
                    href={company.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted p-4 rounded-lg hover:bg-accent transition-smooth flex items-center justify-center"
                    aria-label="Youtube"
                  >
                    <Youtube className="h-6 w-6" />
                  </a>)}
                  { company.whatsapp && (<a
                    href={company.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted p-4 rounded-lg hover:bg-accent transition-smooth flex items-center justify-center"
                    aria-label="WhatsApp"
                  >
                    <WhatsAppIcon className="h-6 w-6" />
                  </a>)}
                  { company.twitter && (<a
                    href={company.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted p-4 rounded-lg hover:bg-accent transition-smooth flex items-center justify-center"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-6 w-6" />
                  </a>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
