import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SmartReminderProps {
  appointment?: {
    id: number;
    appointmentDate: string;
    service: { name: string };
    barber: { user: { firstName: string } };
  };
}

export function SmartReminder({ appointment }: SmartReminderProps) {
  const [showReminder, setShowReminder] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [locationPermission, setLocationPermission] = useState<string>("prompt");
  const { toast } = useToast();

  // BarberPro location (mock coordinates)
  const barbershopLocation = { lat: -23.5505, lng: -46.6333 }; // São Paulo center

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Distance in meters
  };

  const checkLocationAndTime = () => {
    if (!appointment) return;

    const appointmentTime = new Date(appointment.appointmentDate);
    const now = new Date();
    const timeDiff = (appointmentTime.getTime() - now.getTime()) / (1000 * 60); // minutes

    // Check if appointment is within 30-60 minutes
    if (timeDiff > 10 && timeDiff <= 60) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const dist = calculateDistance(
            userLat, userLng, 
            barbershopLocation.lat, barbershopLocation.lng
          );
          
          setDistance(dist);
          
          // Show reminder if within 1km
          if (dist <= 1000) {
            setShowReminder(true);
            
            // Show notification if supported
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("BarberPro", {
                body: `Você está a apenas ${Math.round(dist)}m da BarberPro. Seu corte é em ${Math.round(timeDiff)} minutos!`,
                icon: "/icon-192.png"
              });
            }
          }
        },
        (error) => {
          console.log("Geolocation error:", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    }
  };

  const requestLocationPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      setLocationPermission(result.state);
      
      if (result.state === 'granted') {
        checkLocationAndTime();
      } else if (result.state === 'prompt') {
        navigator.geolocation.getCurrentPosition(
          () => {
            setLocationPermission('granted');
            checkLocationAndTime();
          },
          () => setLocationPermission('denied')
        );
      }
    } catch (error) {
      console.log("Permission check error:", error);
    }
  };

  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          toast({
            title: "Notificações ativadas",
            description: "Você receberá lembretes quando estiver próximo da barbearia.",
          });
        }
      });
    }
  };

  useEffect(() => {
    if (appointment && locationPermission === 'granted') {
      const interval = setInterval(checkLocationAndTime, 60000); // Check every minute
      checkLocationAndTime(); // Check immediately
      return () => clearInterval(interval);
    }
  }, [appointment, locationPermission]);

  useEffect(() => {
    requestLocationPermission();
    requestNotificationPermission();
  }, []);

  const openMaps = () => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${barbershopLocation.lat},${barbershopLocation.lng}&travelmode=walking`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <AnimatePresence>
      {showReminder && appointment && (
        <Dialog open={showReminder} onOpenChange={setShowReminder}>
          <DialogContent className="sm:max-w-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-primary bg-gradient-to-r from-blue-50 to-red-50">
                <CardContent className="p-6 text-center space-y-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <MapPin className="w-12 h-12 text-primary mx-auto" />
                  </motion.div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-2">
                      Você está pertinho!
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Você está a apenas <span className="font-bold text-primary">
                        {distance ? `${Math.round(distance)}m` : 'poucos metros'}
                      </span> da BarberPro.
                    </p>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-secondary" />
                        <span className="font-medium">
                          {appointment.service.name} com {appointment.barber.user.firstName}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(appointment.appointmentDate).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={openMaps}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Abrir Maps
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowReminder(false)}
                      className="flex-1"
                    >
                      OK
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}