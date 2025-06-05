import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Copy, Check, QrCode, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  serviceName: string;
  customerName: string;
  appointmentDetails: string;
}

export function QRPaymentModal({
  isOpen,
  onClose,
  amount,
  serviceName,
  customerName,
  appointmentDetails
}: QRPaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"later" | "whatsapp" | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const pixCode = `00020126580014BR.GOV.BCB.PIX0136${Math.random().toString(36).substr(2, 32)}520400005303986540${amount}5802BR5925BARBERPRO BARBEARIA LTDA6009SAO PAULO62070503***63041D41`;

  const handleWhatsAppPayment = () => {
    const message = `Hi! I'd like to confirm my booking and receive the payment QR Code.\n\nBooking Details:\n- Service: ${serviceName}\n- Customer: ${customerName}\n- ${appointmentDetails}\n- Amount: R$ ${amount}\n\nPlease send me the Pix QR Code for payment.`;
    
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp opened",
      description: "Complete your payment through WhatsApp to confirm your booking.",
    });
    
    onClose();
  };

  const handlePayLater = () => {
    toast({
      title: "Booking confirmed",
      description: "You can pay at the barbershop. See you soon!",
    });
    onClose();
  };

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast({
        title: "PIX code copied",
        description: "You can now paste it in your banking app.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please select and copy the code manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Payment Options
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!paymentMethod && (
            <>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">Total: R$ {amount}</p>
                <p className="text-sm text-muted-foreground">Choose your payment method</p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setPaymentMethod("whatsapp")}
                  className="w-full h-16 bg-green-500 hover:bg-green-600 text-white"
                >
                  <MessageCircle className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Pay via WhatsApp</div>
                    <div className="text-sm opacity-90">Get QR code through WhatsApp</div>
                  </div>
                </Button>

                <Button
                  onClick={handlePayLater}
                  variant="outline"
                  className="w-full h-16"
                >
                  <div className="text-left">
                    <div className="font-semibold">Pay at the barbershop</div>
                    <div className="text-sm text-muted-foreground">Cash or card on arrival</div>
                  </div>
                </Button>
              </div>
            </>
          )}

          {paymentMethod === "whatsapp" && (
            <div className="space-y-4">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Secure Payment</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Click below to open WhatsApp and receive your personalized PIX QR Code for secure payment.
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button
                  onClick={handleWhatsAppPayment}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Open WhatsApp for Payment
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Or use this sample PIX code:</p>
                  <div className="relative">
                    <code className="block p-3 bg-muted rounded text-xs break-all">
                      {pixCode}
                    </code>
                    <Button
                      onClick={copyPixCode}
                      size="sm"
                      variant="ghost"
                      className="absolute top-1 right-1"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => setPaymentMethod(null)}
                  variant="ghost"
                  className="w-full"
                >
                  Back to payment options
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}