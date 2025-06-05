import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  className?: string;
  service?: string;
  customerName?: string;
  selectedTime?: string;
  phoneNumber?: string;
}

export function WhatsAppButton({ 
  className, 
  service = "",
  customerName = "",
  selectedTime = "",
  phoneNumber = "5511999999999"
}: WhatsAppButtonProps) {
  const handleWhatsAppClick = () => {
    let message = "Hello! I'd like to book a haircut at BarberPro.";
    
    if (service) {
      message += ` Service: ${service}.`;
    }
    
    if (customerName) {
      message += ` Customer: ${customerName}.`;
    }
    
    if (selectedTime) {
      message += ` Preferred time: ${selectedTime}.`;
    }
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={handleWhatsAppClick}
          className={cn(
            "fixed bottom-24 right-8 w-14 h-14 rounded-full shadow-2xl z-40",
            "bg-green-500 hover:bg-green-600 text-white",
            "transition-all duration-300 transform hover:scale-110",
            "md:bottom-8 md:right-24",
            className
          )}
        >
          <MessageCircle className="w-7 h-7" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>Schedule via WhatsApp</p>
      </TooltipContent>
    </Tooltip>
  );
}