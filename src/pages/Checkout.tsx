import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Package, Truck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { freeCities, availableCities, company, API_BASE_URL } from "@/assets/data.js";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

const checkoutSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  document: z.string().min(11, "CPF/CNPJ deve ter pelo menos 11 dígitos").optional(),
  documentType: z.enum(["cpf", "cnpj"]).optional(),
  deliveryMethod: z.string().min(1, "Selecione uma forma de entrega"),
  cep: z.string().optional(),
  address: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  shippingCity: z.string().optional(),
  paymentMethod: z.string().min(1, "Selecione uma forma de pagamento"),
  observations: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingInfo, setShippingInfo] = useState({ available: true, cost: 0, days: 1, isFree: false });
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const whatsapp = company.whatsapp;
  const { authFetch } = useAuthFetch();

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      document: "",
      documentType: "cpf",
      deliveryMethod: "",
      cep: "",
      address: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      shippingCity: "",
      paymentMethod: "",
      observations: "",
    },
  });



  const calculateShipping = (city: string) => {
    if (!city) return { available: false, cost: 0, days: 1, isFree: false };

    const normalizedCity = city.trim().toLowerCase();
    const normalizedFreeCities = freeCities.map(c => c.toLowerCase());
    const normalizedAvailableCities = availableCities.map(c => c.toLowerCase());

    if (!normalizedAvailableCities.includes(normalizedCity)) {
      return { available: false, cost: 0, days: 1, isFree: false };
    }

    if (normalizedCity === "roca") {
      return { available: true, cost: 30, days: 1, isFree: false };
    }

    if (normalizedFreeCities.includes(normalizedCity)) {
      return { available: true, cost: 0, days: 1, isFree: true };
    }

    return { available: true, cost: 100, days: 1, isFree: false };
  };

  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        form.setValue("city", data.localidade);
        form.setValue("state", data.uf);
        form.setValue("address", data.logradouro || "");
        form.setValue("neighborhood", data.bairro || "");

        // Calcular frete automaticamente baseado na cidade
        const shipping = calculateShipping(data.localidade);
        setShippingInfo(shipping);
        setShippingCost(shipping.cost);
        form.setValue("shippingCity", data.localidade);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setIsLoadingCep(false);
    }
  };

  useEffect(() => {
    const city = form.watch("shippingCity");
    const shipping = calculateShipping(city || "");
    setShippingInfo(shipping);
    setShippingCost(shipping.cost);
  }, [form.watch("shippingCity")]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getFinalTotal = () => {
    return getTotalPrice() + shippingCost;
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const generateWhatsAppMessage = (data: CheckoutForm) => {
    let message = "🛒 *NOVO PEDIDO*\n\n";

    message += "📋 *PRODUTOS:*\n";
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   Quantidade: ${item.quantity}\n`;
      message += `   Preço unitário: ${formatPrice(item.price)}\n`;
      message += `   Subtotal: ${formatPrice(item.price * item.quantity)}\n\n`;
    });

    message += `💰 *SUBTOTAL: ${formatPrice(getTotalPrice())}*\n`;
    message += `🚚 *FRETE: ${shippingCost === 0 ? 'GRÁTIS' : formatPrice(shippingCost)}*\n`;
    message += `💰 *TOTAL FINAL: ${formatPrice(getFinalTotal())}*\n\n`;

    message += "👤 *DADOS DO CLIENTE:*\n";
    message += `Nome: ${data.name}\n`;
    message += `Telefone: ${data.phone}\n`;
    if (data.email) message += `Email: ${data.email}\n`;
    message += `${data.documentType?.toUpperCase()}: ${data.document}\n\n`;

    message += "🚚 *ENTREGA:*\n";
    message += `Método: ${data.deliveryMethod}\n`;
    if (data.shippingCity) {
      message += `Cidade para entrega: ${data.shippingCity}\n`;
      message += `Prazo: ${shippingInfo.days} dia(s)\n`;
    }
    if (data.address) {
      message += `Endereço: ${data.address}, ${data.number}\n`;
      if (data.complement) message += `Complemento: ${data.complement}\n`;
      message += `${data.neighborhood}, ${data.city} - ${data.state}\n`;
      message += `CEP: ${data.cep}\n`;
    }

    message += `\n💳 *PAGAMENTO:* ${data.paymentMethod}\n`;

    if (data.observations) {
      message += `\n📝 *OBSERVAÇÕES:* ${data.observations}\n`;
    }

    return message;
  };
  // Função para salvar clientes no localStorage
  const saveCustomer = async (customer: CheckoutForm) => {

      // localStorage.setItem('customers', JSON.stringify(customers));
      const response = await authFetch({ url:'customers/', method: 'POST', body: customer});
    
  };

  // Função para salvar pedidos no localStorage
  const saveOrder = async (customer: CheckoutForm) => {
    const storedOrders = localStorage.getItem('orders');

    const orders = storedOrders ? JSON.parse(storedOrders) : [];
    const order = {
      id: Date.now(), // ID único
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        document: customer.document,
        documentType: customer.documentType,
      },
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      shipping: {
        method: customer.deliveryMethod,
        city: customer.shippingCity,
        address: customer.address,
        number: customer.number,
        complement: customer.complement,
        neighborhood: customer.neighborhood,
        state: customer.state,
        cep: customer.cep,
        cost: shippingCost,
      },
      paymentMethod: customer.paymentMethod,
      observations: customer.observations,
      subtotal: getTotalPrice(),
      total: getFinalTotal(),
      date: new Date().toISOString(),
      status: 'pendente',
    };

    orders.push(order);
    // localStorage.setItem('orders', JSON.stringify(orders));
    const response = await authFetch({ url:'orders/', method: 'POST', body: order});
  };

  const onSubmit = (data: CheckoutForm) => {
    // Salvar cliente e pedido
    saveCustomer(data);
    saveOrder(data);
  
    // Gerar mensagem para WhatsApp
    const message = generateWhatsAppMessage(data);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `${whatsapp}?text=${encodedMessage}`;
  
    window.open(whatsappUrl, '_blank');
    clearCart();
    navigate('/');
  };
  

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Carrinho vazio</h2>
            <p className="text-muted-foreground mb-4">
              Adicione produtos ao carrinho antes de finalizar o pedido.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Continuar comprando
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Finalizar Pedido
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Dados Pessoais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="secondary" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        1
                      </Badge>
                      Seus dados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Insira o seu nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Celular</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="seu_email@provedor.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="documentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de documento</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cpf">CPF</SelectItem>
                                <SelectItem value="cnpj">CNPJ</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="document"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF/CNPJ</FormLabel>
                            <FormControl>
                              <Input placeholder="000.000.000-00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Entrega e Frete */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="secondary" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        2
                      </Badge>
                      <Truck className="w-5 h-5" />
                      Entrega e Frete
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="deliveryMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Escolha a forma de entrega</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a forma de entrega" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Entrega">Entrega</SelectItem>
                              <SelectItem value="Retirada">Retirada</SelectItem>
                              <SelectItem value="A combinar">A combinar</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("deliveryMethod") === "Entrega" && (
                      <>
                        {/* Endereço para Entrega */}
                        <div className="space-y-4 pt-4 border-t">
                          <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                            Endereço para entrega
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="cep"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CEP</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="00000-000"
                                      {...field}
                                      disabled={isLoadingCep}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        const cep = e.target.value.replace(/\D/g, '');
                                        if (cep.length === 8) {
                                          fetchAddressByCep(cep);
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  {isLoadingCep && (
                                    <p className="text-sm text-muted-foreground">
                                      Buscando endereço...
                                    </p>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cidade</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Cidade" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Endereço</FormLabel>
                                <FormControl>
                                  <Input placeholder="Rua, Avenida..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="number"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Número</FormLabel>
                                  <FormControl>
                                    <Input placeholder="123" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="complement"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Complemento</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Apto, Bloco..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="neighborhood"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Bairro</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Bairro" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estado</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o estado" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="SP">São Paulo</SelectItem>
                                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                                    <SelectItem value="MG">Minas Gerais</SelectItem>
                                    <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                                    {/* Adicione outros estados conforme necessário */}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        {/* Cálculo de Frete */}
                        <div className="space-y-4 pt-4 border-t">
                          <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                            Calcule o frete
                          </h4>
                          <FormField
                            control={form.control}
                            name="shippingCity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cidade para entrega</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Digite sua cidade"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e);
                                      const shipping = calculateShipping(e.target.value);
                                      setShippingInfo(shipping);
                                      setShippingCost(shipping.cost);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {form.watch("shippingCity") && (
                            <div className="p-4 bg-muted rounded-lg space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Valor do frete:</span>
                                <span className={`font-bold ${shippingInfo.isFree ? 'text-green-600' : ''}`}>
                                  {shippingInfo.isFree ? 'GRÁTIS' : formatPrice(shippingInfo.cost)}
                                </span>
                              </div>
                              {shippingInfo.available && (<div className="flex justify-between items-center">
                                <span className="font-medium">Prazo de entrega:</span>
                                <span className="font-bold">{shippingInfo.days} dia(s)</span>
                              </div>)}

                              {!shippingInfo.available && (
                                <p className="text-sm text-red-600 mt-2">
                                  Desculpe, não entregamos nessa cidade!
                                </p>
                              )}
                              {shippingInfo.isFree && (
                                <p className="text-sm text-green-600 mt-2">
                                  🎉 Sua cidade tem frete grátis!
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Pagamento */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="secondary" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        3
                      </Badge>
                      <CreditCard className="w-5 h-5" />
                      Como gostaria de pagar?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Forma de pagamento</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a forma de pagamento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pix">Pix</SelectItem>
                              <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                              <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                              <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="observations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações (opcional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Adicione observações sobre seu pedido..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Button type="submit" className="w-full h-12 text-lg">
                  Finalizar Pedido no WhatsApp
                </Button>
              </form>
            </Form>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Resumo do pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-muted-foreground">
                          Qtd: {item.quantity} × {formatPrice(item.price)}
                        </div>
                      </div>
                      <div className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({getTotalItems()} itens)</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Frete</span>
                    <span className={shippingInfo.isFree ? 'text-green-600' : ''}>
                      {shippingInfo.isFree ? 'GRÁTIS' : formatPrice(shippingCost)}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(getFinalTotal())}</span>
                </div>

                {/* Cupom de desconto */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Código do cupom"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="text-sm"
                    />
                    <Button variant="outline" size="sm">
                      Aplicar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;