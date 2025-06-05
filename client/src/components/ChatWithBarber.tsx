import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Image, Circle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: "text" | "image";
  imageUrl?: string;
}

interface ChatWithBarberProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: number;
    barber: {
      user: {
        firstName: string;
        lastName: string;
        profileImageUrl?: string;
      };
    };
  };
}

export function ChatWithBarber({ isOpen, onClose, appointment }: ChatWithBarberProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderId: "barber",
      senderName: appointment.barber.user.firstName,
      message: "Olá! Estou preparado para o seu atendimento. Tem alguma preferência especial para o corte?",
      timestamp: new Date(Date.now() - 300000),
      type: "text"
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [barberOnline, setBarberOnline] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Simulate barber status changes
    const statusInterval = setInterval(() => {
      setBarberOnline(Math.random() > 0.3);
    }, 30000);

    return () => clearInterval(statusInterval);
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user.id.toString(),
      senderName: `${user.firstName} ${user.lastName}`,
      message: newMessage,
      timestamp: new Date(),
      type: "text"
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // Simulate barber response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const responses = [
          "Perfeito! Vou preparar tudo para você.",
          "Entendi! Que tal marcarmos alguns detalhes?",
          "Ótima escolha! Vai ficar excelente em você.",
          "Combinado! Te vejo em breve na barbearia.",
          "Show! Já separei os produtos que vamos usar."
        ];
        const barberResponse: Message = {
          id: (Date.now() + 1).toString(),
          senderId: "barber",
          senderName: appointment.barber.user.firstName,
          message: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          type: "text"
        };
        setMessages(prev => [...prev, barberResponse]);
      }, 2000);
    }, 1000);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "Por favor, escolha uma imagem menor que 5MB.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const message: Message = {
        id: Date.now().toString(),
        senderId: user.id.toString(),
        senderName: `${user.firstName} ${user.lastName}`,
        message: "Imagem de referência",
        timestamp: new Date(),
        type: "image",
        imageUrl
      };
      setMessages(prev => [...prev, message]);
      
      toast({
        title: "Imagem enviada",
        description: "Sua referência foi compartilhada com o barbeiro.",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md h-[600px] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage 
                src={appointment.barber.user.profileImageUrl}
                alt={appointment.barber.user.firstName}
              />
              <AvatarFallback>
                {appointment.barber.user.firstName[0]}{appointment.barber.user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {appointment.barber.user.firstName} {appointment.barber.user.lastName}
                </span>
                <Circle 
                  className={`w-3 h-3 ${
                    barberOnline ? "text-green-500 fill-green-500" : "text-gray-400 fill-gray-400"
                  }`}
                />
              </div>
              <Badge variant={barberOnline ? "default" : "secondary"} className="text-xs">
                {barberOnline ? "Online" : "Offline"}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${
                  message.senderId === user?.id.toString() ? "justify-end" : "justify-start"
                }`}
              >
                <Card className={`max-w-[80%] ${
                  message.senderId === user?.id.toString()
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}>
                  <CardContent className="p-3">
                    {message.type === "image" && message.imageUrl && (
                      <img
                        src={message.imageUrl}
                        alt="Referência"
                        className="max-w-full h-auto rounded-md mb-2"
                      />
                    )}
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === user?.id.toString()
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}>
                      {message.timestamp.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <Card className="bg-muted">
                <CardContent className="p-3">
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-muted-foreground rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-muted-foreground rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-muted-foreground rounded-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t pt-4">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="flex-1"
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image className="w-4 h-4" />
            </Button>
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}