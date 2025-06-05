import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Repeat, Calendar, Clock, User, Scissors } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AppointmentWithDetails } from "@shared/schema";

interface RebookButtonProps {
  lastAppointment?: AppointmentWithDetails;
  onSuccess?: () => void;
}

export function RebookButton({ lastAppointment, onSuccess }: RebookButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const rebookMutation = useMutation({
    mutationFn: async () => {
      if (!lastAppointment || !user) throw new Error("Dados insuficientes");

      // Calculate next available slot (example: same day next week)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(
        new Date(lastAppointment.appointmentDate).getHours(),
        new Date(lastAppointment.appointmentDate).getMinutes(),
        0,
        0
      );

      return apiRequest("POST", "/api/appointments", {
        customerId: user.id,
        barberId: lastAppointment.barberId,
        serviceId: lastAppointment.serviceId,
        appointmentDate: nextWeek.toISOString(),
        totalPrice: lastAppointment.totalPrice,
        status: "scheduled",
        notes: "Reagendamento automático do último corte"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/appointments`] });
      setShowConfirmation(false);
      toast({
        title: "Agendamento realizado!",
        description: "Seu horário foi marcado com sucesso para a próxima semana.",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Erro ao agendar",
        description: "Não foi possível repetir o agendamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  if (!lastAppointment) {
    return null;
  }

  const nextAvailableDate = new Date();
  nextAvailableDate.setDate(nextAvailableDate.getDate() + 7);
  nextAvailableDate.setHours(
    new Date(lastAppointment.appointmentDate).getHours(),
    new Date(lastAppointment.appointmentDate).getMinutes(),
    0,
    0
  );

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setShowConfirmation(true)}
          className="w-full bg-gradient-to-r from-primary to-accent text-white shadow-lg"
          size="lg"
        >
          <Repeat className="w-5 h-5 mr-2" />
          Repetir Último Agendamento
        </Button>
      </motion.div>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Repeat className="w-5 h-5 text-primary" />
              Confirmar Reagendamento
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="bg-gradient-to-r from-blue-50 to-red-50 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-primary" />
                  <span className="font-medium">Serviço:</span>
                  <Badge variant="secondary">{lastAppointment.service.name}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="font-medium">Barbeiro:</span>
                  <span className="text-sm">
                    {lastAppointment.barber.user.firstName} {lastAppointment.barber.user.lastName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-medium">Nova data:</span>
                  <span className="text-sm">
                    {nextAvailableDate.toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long'
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-medium">Horário:</span>
                  <span className="text-sm">
                    {nextAvailableDate.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <Badge className="bg-green-100 text-green-800">
                      R$ {lastAppointment.totalPrice}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Atenção:</strong> Este agendamento será feito para o mesmo horário da próxima semana. 
                Caso não esteja disponível, entraremos em contato para ajustar.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => rebookMutation.mutate()}
                disabled={rebookMutation.isPending}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {rebookMutation.isPending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 mr-2"
                  >
                    <Repeat className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Repeat className="w-4 h-4 mr-2" />
                )}
                {rebookMutation.isPending ? "Agendando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}