import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmojiFeedbackProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: number;
    service: { name: string };
    barber: { user: { firstName: string; lastName: string } };
  };
  onSubmit?: (rating: number, comment?: string) => void;
}

const emojiRatings = [
  { emoji: "😍", label: "Excelente", value: 5, color: "text-green-600" },
  { emoji: "😊", label: "Muito Bom", value: 4, color: "text-blue-600" },
  { emoji: "😐", label: "Regular", value: 3, color: "text-yellow-600" },
  { emoji: "😕", label: "Ruim", value: 2, color: "text-orange-600" },
  { emoji: "😠", label: "Péssimo", value: 1, color: "text-red-600" }
];

export function EmojiFeedback({ isOpen, onClose, appointment, onSubmit }: EmojiFeedbackProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (selectedRating === null) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      onSubmit?.(selectedRating, comment.trim() || undefined);
      
      toast({
        title: "Avaliação enviada!",
        description: "Obrigado pelo seu feedback. Ele nos ajuda a melhorar sempre!",
      });

      setIsSubmitting(false);
      onClose();
      reset();
    }, 1000);
  };

  const reset = () => {
    setSelectedRating(null);
    setComment("");
  };

  const selectedEmoji = emojiRatings.find(r => r.value === selectedRating);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        reset();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Como foi seu atendimento?</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Info */}
          <Card className="bg-gradient-to-r from-blue-50 to-red-50">
            <CardContent className="p-4 text-center">
              <p className="font-medium">{appointment.service.name}</p>
              <p className="text-sm text-muted-foreground">
                com {appointment.barber.user.firstName} {appointment.barber.user.lastName}
              </p>
            </CardContent>
          </Card>

          {/* Emoji Rating */}
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              Toque no emoji que representa sua experiência:
            </p>
            
            <div className="flex justify-center gap-4">
              {emojiRatings.map((rating) => (
                <motion.button
                  key={rating.value}
                  onClick={() => setSelectedRating(rating.value)}
                  className={`relative p-2 rounded-full transition-all ${
                    selectedRating === rating.value
                      ? "bg-primary/10 ring-2 ring-primary"
                      : "hover:bg-muted"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span
                    className="text-4xl block"
                    animate={selectedRating === rating.value ? { 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {rating.emoji}
                  </motion.span>
                  
                  {selectedRating === rating.value && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
                    >
                      <span className={`text-xs font-medium ${rating.color}`}>
                        {rating.label}
                      </span>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Selected Rating Display */}
          <AnimatePresence>
            {selectedRating && selectedEmoji && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-2xl">{selectedEmoji.emoji}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < selectedRating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className={`font-medium ${selectedEmoji.color}`}>
                  {selectedEmoji.label}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Optional Comment */}
          {selectedRating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium">
                  Quer nos contar mais? (opcional)
                </label>
              </div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Compartilhe sua experiência..."
                className="resize-none"
                rows={3}
              />
            </motion.div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                reset();
              }}
              className="flex-1"
            >
              Pular
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={selectedRating === null || isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 mr-2"
                >
                  <Star className="w-4 h-4" />
                </motion.div>
              ) : (
                "Enviar Avaliação"
              )}
            </Button>
          </div>

          {/* Motivational Message */}
          {selectedRating && selectedRating >= 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-3 bg-green-50 rounded-lg border border-green-200"
            >
              <p className="text-sm text-green-800">
                Que bom que você gostou! 🎉 Compartilhe sua experiência com seus amigos!
              </p>
            </motion.div>
          )}

          {selectedRating && selectedRating <= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-3 bg-red-50 rounded-lg border border-red-200"
            >
              <p className="text-sm text-red-800">
                Sentimos muito pela experiência. Vamos trabalhar para melhorar! 🙏
              </p>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}