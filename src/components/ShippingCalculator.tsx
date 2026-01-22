import React, { useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { ShoppingBag, Truck } from 'lucide-react'; // ou qualquer ícone que esteja usando
import { toast } from './ui/use-toast'; // ajuste conforme a lib de toast que você está usando


type ShippingInfo = {
  address: string;
  city: string;
  state: string;
  price: number;
  estimatedDays: number;
};

const ShippingCalculator: React.FC = () => {
  const [cep, setCep] = useState('');
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };
  
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    setCep(e.target.value);
    e.target.value.length >= 8 && calculateShipping(e.target.value)
  };

  const calculateShipping = async (cepValue: string) => {
    setIsCalculatingShipping(true);
    try {
      const cleanCep = cepValue.replace(/\D/g, '');
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        throw new Error('CEP não encontrado');
      }

      const availableCities = [
        "Belo Horizonte", "Contagem", "Ribeirão das Neves", "Santa Luzia", "Vespasiano",
        "Sabará", "Esmeralda", "Betim", "Ibirite", "Nova Lima", "Pedro Leopoldo",
        "São José da Lapa", "Lagoa Santa", "Nova Contagem"
      ];

      const freeCities = [
        "Belo Horizonte", "Contagem", "Ribeirão das Neves", "Santa Luzia", "Vespasiano"
      ];

      const shippingPrice = freeCities.includes(data.localidade) ? 0 : 100;
      const estimatedDays = availableCities.includes(data.localidade) ? 1 : 365;

      setShippingInfo({
        address: `${data.logradouro}, ${data.bairro}`,
        city: data.localidade,
        state: data.uf,
        price: shippingPrice,
        estimatedDays: estimatedDays,
      });

      toast({
        title: "Frete calculado!",
        description: `Entrega em ${estimatedDays} dia útil por ${new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(shippingPrice)}`,
      });

    } catch (error) {
      toast({
        title: "Erro ao calcular frete",
        description: "Verifique o CEP e tente novamente.",
        variant: "destructive",
      });
      setShippingInfo(null);
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  return (
    <div className="bg-muted/30 rounded-xl p-6 space-y-4">
      <h4 className="font-semibold text-foreground flex items-center gap-2">
        <Truck className="w-5 h-5" />
        Calcular Frete
      </h4>

      <div className="space-y-3">
        <div>
          <Label htmlFor="cep">CEP de entrega</Label>
          <Input
            id="cep"
            type="text"
            value={cep}
            onChange={handleCepChange}
            onBlur={() => cep.length >= 8 && calculateShipping(cep)}
            placeholder="00000-000"
            maxLength={9}
            className="mt-1"
          />
        </div>

        {isCalculatingShipping && (
          <div className="text-sm text-muted-foreground">
            Calculando frete...
          </div>
        )}

        {shippingInfo && (
          <div className="bg-background/50 rounded-lg p-4 space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Entregar em:</span>
              <div className="font-medium text-foreground">
                {shippingInfo.address}
              </div>
              <div className="font-medium text-foreground">
                {shippingInfo.city} - {shippingInfo.state}
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <div>
                <div className="text-sm text-muted-foreground">Valor do frete</div>
                { (shippingInfo.price > 0) ? ( <div className="font-semibold text-accent">
                  {formatPrice(shippingInfo.price)}
                </div>) : (
                    <div className="font-semibold text-green-700">
                        Grátis
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Prazo</div>
                <div className="font-semibold text-foreground">
                  {shippingInfo.estimatedDays} dia útil
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingCalculator;
