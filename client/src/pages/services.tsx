import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { Clock, MessageCircle } from "lucide-react";
import { Service } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

interface ServicesProps {
  onBookService: (serviceId: number) => void;
}

const categories = [
  { id: "all", label: "Todos os Serviços" },
  { id: "haircuts", label: "Cortes de Cabelo" },
  { id: "beard-care", label: "Cuidados com a Barba" },
  { id: "packages", label: "Pacotes" },
  { id: "styling", label: "Estilização" },
];

export default function Services({ onBookService }: ServicesProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { user } = useAuth();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["/api/services", selectedCategory !== "all" ? selectedCategory : null],
    queryFn: async () => {
      const url = selectedCategory === "all" 
        ? "/api/services" 
        : `/api/services?category=${selectedCategory}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch services");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="text-center space-y-4">
            <div className="h-10 bg-muted rounded w-1/3 mx-auto"></div>
            <div className="h-6 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
          <div className="flex justify-center gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded w-24"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-foreground mb-4">Nossos Serviços</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Serviços profissionais de barbearia feitos para o seu estilo
        </p>
      </motion.div>

      {/* Filter Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap justify-center gap-4 mb-8"
      >
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className={
              selectedCategory === category.id
                ? "bg-primary hover:bg-primary/90"
                : ""
            }
          >
            {category.label}
          </Button>
        ))}
      </motion.div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service: Service, index: number) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="overflow-hidden card-hover h-full">
              <div className="relative">
                <img
                  src={service.imageUrl || "/placeholder-service.jpg"}
                  alt={service.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-service.jpg";
                  }}
                />
                <Badge
                  variant="secondary"
                  className="absolute top-4 right-4 bg-primary text-primary-foreground"
                >
                  R$ {(typeof service.price === 'number' ? service.price : Number(service.price)).toFixed(2)}
                </Badge>
              </div>
              
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{service.name}</h3>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{service.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {service.duration} min
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onBookService(service.id)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Agendar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const price = typeof service.price === 'number' ? service.price : Number(service.price);
                        const message = `Olá! Gostaria de agendar um(a) ${service.name} na BarberPro. Serviço: ${service.name} (${service.duration} min) - R$ ${price.toFixed(2)}`;
                        const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
                        window.open(whatsappUrl, '_blank');
                      }}
                      className="p-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {services.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground text-lg">
            Nenhum serviço encontrado nesta categoria.
          </p>
        </motion.div>
      )}
    </div>
  );
}
