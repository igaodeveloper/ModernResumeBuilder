import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart, Plus, Minus, Package, Truck, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "pomade" | "shampoo" | "beard" | "tools";
  inStock: boolean;
  recommended?: boolean;
}

const products: Product[] = [
  {
    id: 1,
    name: "Pomada Modeladora Premium",
    description: "Fixação forte com brilho natural, ideal para penteados clássicos",
    price: 45.90,
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&h=200&fit=crop",
    category: "pomade",
    inStock: true,
    recommended: true
  },
  {
    id: 2,
    name: "Shampoo Barber Professional",
    description: "Limpeza profunda com óleos naturais, para todos os tipos de cabelo",
    price: 32.90,
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&h=200&fit=crop",
    category: "shampoo",
    inStock: true
  },
  {
    id: 3,
    name: "Óleo para Barba Premium",
    description: "Hidrata e amacia a barba, com fragrância amadeirada",
    price: 39.90,
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=200&h=200&fit=crop",
    category: "beard",
    inStock: true,
    recommended: true
  },
  {
    id: 4,
    name: "Kit Pente + Escova Profissional",
    description: "Ferramentas essenciais para o cuidado diário do cabelo",
    price: 67.90,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop",
    category: "tools",
    inStock: true
  },
  {
    id: 5,
    name: "Cera Modeladora Matte",
    description: "Acabamento fosco com fixação flexível para looks modernos",
    price: 38.90,
    image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop",
    category: "pomade",
    inStock: false
  },
  {
    id: 6,
    name: "Balm Pós-Barba Hidratante",
    description: "Acalma e hidrata a pele após o barbear",
    price: 29.90,
    image: "https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?w=200&h=200&fit=crop",
    category: "beard",
    inStock: true
  }
];

interface CartItem extends Product {
  quantity: number;
}

interface ShopProps {
  onProductRecommendation?: (productId: number) => void;
}

export function Shop({ onProductRecommendation }: ShopProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("pickup");
  const { toast } = useToast();

  const categories = [
    { id: "all", label: "Todos", icon: Package },
    { id: "pomade", label: "Pomadas", icon: Package },
    { id: "shampoo", label: "Shampoos", icon: Package },
    { id: "beard", label: "Barba", icon: Package },
    { id: "tools", label: "Ferramentas", icon: Package }
  ];

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao carrinho`,
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return newQuantity === 0 
            ? null 
            : { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const processOrder = () => {
    setShowCheckout(false);
    setCart([]);
    
    toast({
      title: "Pedido confirmado!",
      description: deliveryMethod === "delivery" 
        ? "Seus produtos serão entregues em até 2 dias úteis"
        : "Seus produtos estarão prontos para retirada em 1 hora",
    });

    // Trigger product recommendation for future appointments
    cart.forEach(item => {
      if (item.recommended) {
        onProductRecommendation?.(item.id);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Loja BarberPro</h2>
          <p className="text-muted-foreground">Produtos profissionais para o seu cuidado</p>
        </div>
        
        <Button
          onClick={() => setShowCart(true)}
          className="relative bg-primary hover:bg-primary/90"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Carrinho
          {cartItemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center">
              {cartItemCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              <Icon className="w-4 h-4 mr-2" />
              {category.label}
            </Button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                {product.recommended && (
                  <Badge className="absolute top-2 left-2 bg-secondary">
                    Recomendado
                  </Badge>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive">Esgotado</Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    R$ {product.price.toFixed(2)}
                  </span>
                  
                  <Button
                    size="sm"
                    onClick={() => addToCart(product)}
                    disabled={!product.inStock}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Carrinho de Compras</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Seu carrinho está vazio</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          R$ {item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">Total:</span>
                    <span className="text-lg font-bold text-primary">
                      R$ {cartTotal.toFixed(2)}
                    </span>
                  </div>
                  
                  <Button
                    onClick={() => {
                      setShowCart(false);
                      setShowCheckout(true);
                    }}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Finalizar Pedido
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Pedido</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-3">Forma de recebimento:</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border rounded cursor-pointer">
                  <input
                    type="radio"
                    name="delivery"
                    value="pickup"
                    checked={deliveryMethod === "pickup"}
                    onChange={(e) => setDeliveryMethod(e.target.value as any)}
                  />
                  <MapPin className="w-4 h-4" />
                  <div>
                    <p className="font-medium">Retirar na loja</p>
                    <p className="text-sm text-muted-foreground">Pronto em 1 hora - Grátis</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 border rounded cursor-pointer">
                  <input
                    type="radio"
                    name="delivery"
                    value="delivery"
                    checked={deliveryMethod === "delivery"}
                    onChange={(e) => setDeliveryMethod(e.target.value as any)}
                  />
                  <Truck className="w-4 h-4" />
                  <div>
                    <p className="font-medium">Entrega em casa</p>
                    <p className="text-sm text-muted-foreground">2 dias úteis - R$ 12,90</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                {deliveryMethod === "delivery" && (
                  <div className="flex justify-between">
                    <span>Entrega:</span>
                    <span>R$ 12,90</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base">
                  <span>Total:</span>
                  <span className="text-primary">
                    R$ {(cartTotal + (deliveryMethod === "delivery" ? 12.90 : 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={processOrder}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Confirmar Pedido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}