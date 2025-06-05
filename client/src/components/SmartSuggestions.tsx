import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, Star, TrendingUp, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AppointmentWithDetails, Service, BarberWithUser } from "@shared/schema";

interface Suggestion {
  id: string;
  type: "service" | "barber" | "time" | "trending";
  title: string;
  description: string;
  action: string;
  data: any;
  priority: number;
}

interface SmartSuggestionsProps {
  appointments: AppointmentWithDetails[];
  services: Service[];
  barbers: BarberWithUser[];
  onSuggestionClick: (type: string, data: any) => void;
}

export function SmartSuggestions({ 
  appointments, 
  services, 
  barbers, 
  onSuggestionClick 
}: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const { user } = useAuth();

  const generateSuggestions = () => {
    const newSuggestions: Suggestion[] = [];

    // Analyze user's appointment history
    const completedAppointments = appointments.filter(apt => apt.status === "completed");
    const favoriteServices = analyzeFavoriteServices(completedAppointments);
    const favoriteBarbers = analyzeFavoriteBarbers(completedAppointments);
    const preferredTimes = analyzePreferredTimes(completedAppointments);

    // Suggestion 1: Favorite service available
    if (favoriteServices[0]) {
      const service = services.find(s => s.id === favoriteServices[0].serviceId);
      if (service) {
        newSuggestions.push({
          id: "favorite-service",
          type: "service",
          title: "Seu corte favorito disponível",
          description: `${service.name} está disponível hoje às 15:00`,
          action: "Agendar agora",
          data: { serviceId: service.id, suggestedTime: "15:00" },
          priority: 9
        });
      }
    }

    // Suggestion 2: Favorite barber has availability
    if (favoriteBarbers[0]) {
      const barber = barbers.find(b => b.id === favoriteBarbers[0].barberId);
      if (barber) {
        newSuggestions.push({
          id: "favorite-barber",
          type: "barber",
          title: `${barber.user.firstName} tem uma vaga amanhã`,
          description: "Seu barbeiro preferido está disponível de manhã",
          action: "Ver horários",
          data: { barberId: barber.id },
          priority: 8
        });
      }
    }

    // Suggestion 3: Time-based suggestion
    if (preferredTimes[0]) {
      newSuggestions.push({
        id: "preferred-time",
        type: "time",
        title: "Horário ideal disponível",
        description: `Você costuma cortar às ${preferredTimes[0].time}. Temos vagas!`,
        action: "Agendar",
        data: { preferredTime: preferredTimes[0].time },
        priority: 7
      });
    }

    // Suggestion 4: Trending service
    const trendingService = services.find(s => s.category === "packages");
    if (trendingService) {
      newSuggestions.push({
        id: "trending",
        type: "trending",
        title: "Pacote completo em alta",
        description: `${trendingService.name} - 40% dos clientes escolheram esta semana`,
        action: "Conhecer",
        data: { serviceId: trendingService.id },
        priority: 6
      });
    }

    // Suggestion 5: Time since last appointment
    if (completedAppointments.length > 0) {
      const lastAppointment = completedAppointments[0];
      const daysSinceLastCut = Math.floor(
        (Date.now() - new Date(lastAppointment.appointmentDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastCut >= 21) {
        newSuggestions.push({
          id: "time-for-cut",
          type: "service",
          title: "Hora de um novo corte?",
          description: `Já fazem ${daysSinceLastCut} dias desde seu último corte`,
          action: "Agendar",
          data: { reminder: true },
          priority: 10
        });
      }
    }

    // Sort by priority and take top 3
    setSuggestions(newSuggestions.sort((a, b) => b.priority - a.priority).slice(0, 3));
  };

  const analyzeFavoriteServices = (appointments: AppointmentWithDetails[]) => {
    const serviceCount: { [key: number]: number } = {};
    appointments.forEach(apt => {
      serviceCount[apt.serviceId] = (serviceCount[apt.serviceId] || 0) + 1;
    });
    
    return Object.entries(serviceCount)
      .map(([serviceId, count]) => ({ serviceId: parseInt(serviceId), count }))
      .sort((a, b) => b.count - a.count);
  };

  const analyzeFavoriteBarbers = (appointments: AppointmentWithDetails[]) => {
    const barberCount: { [key: number]: number } = {};
    appointments.forEach(apt => {
      barberCount[apt.barberId] = (barberCount[apt.barberId] || 0) + 1;
    });
    
    return Object.entries(barberCount)
      .map(([barberId, count]) => ({ barberId: parseInt(barberId), count }))
      .sort((a, b) => b.count - a.count);
  };

  const analyzePreferredTimes = (appointments: AppointmentWithDetails[]) => {
    const timeCount: { [key: string]: number } = {};
    appointments.forEach(apt => {
      const time = new Date(apt.appointmentDate).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      timeCount[time] = (timeCount[time] || 0) + 1;
    });
    
    return Object.entries(timeCount)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => b.count - a.count);
  };

  useEffect(() => {
    if (appointments.length > 0 && services.length > 0 && barbers.length > 0) {
      generateSuggestions();
    }
  }, [appointments, services, barbers]);

  useEffect(() => {
    if (suggestions.length > 1) {
      const interval = setInterval(() => {
        setCurrentSuggestionIndex((prev) => (prev + 1) % suggestions.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [suggestions.length]);

  const getIcon = (type: string) => {
    switch (type) {
      case "service":
        return <Sparkles className="w-5 h-5" />;
      case "barber":
        return <Star className="w-5 h-5" />;
      case "time":
        return <Clock className="w-5 h-5" />;
      case "trending":
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "service":
        return "text-primary";
      case "barber":
        return "text-secondary";
      case "time":
        return "text-accent";
      case "trending":
        return "text-green-600";
      default:
        return "text-muted-foreground";
    }
  };

  if (suggestions.length === 0) {
    return null;
  }

  const currentSuggestion = suggestions[currentSuggestionIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-r from-blue-50 via-white to-red-50 border-primary/20 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Sugestões Inteligentes
            <Badge variant="secondary" className="ml-auto text-xs">
              IA
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSuggestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className={`${getTypeColor(currentSuggestion.type)} mt-1`}>
                  {getIcon(currentSuggestion.type)}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">
                    {currentSuggestion.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {currentSuggestion.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Button
                      size="sm"
                      onClick={() => onSuggestionClick(currentSuggestion.type, currentSuggestion.data)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {currentSuggestion.action}
                    </Button>
                    
                    {suggestions.length > 1 && (
                      <div className="flex gap-1">
                        {suggestions.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSuggestionIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentSuggestionIndex
                                ? "bg-primary"
                                : "bg-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}