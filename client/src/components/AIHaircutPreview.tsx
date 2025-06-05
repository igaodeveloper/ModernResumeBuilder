import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera, Sparkles, Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const haircutStyles = [
  { id: "low-fade", name: "Low Fade", description: "Corte clássico com degradê baixo", overlay: "/haircuts/low-fade.png" },
  { id: "buzz-cut", name: "Buzz Cut", description: "Corte máquina bem baixo", overlay: "/haircuts/buzz-cut.png" },
  { id: "classic-comb", name: "Classic Comb Over", description: "Penteado clássico lateral", overlay: "/haircuts/classic-comb.png" },
  { id: "pompadour", name: "Pompadour", description: "Topete moderno e estiloso", overlay: "/haircuts/pompadour.png" },
  { id: "undercut", name: "Undercut", description: "Lateral raspada, topo longo", overlay: "/haircuts/undercut.png" },
  { id: "crew-cut", name: "Crew Cut", description: "Corte militar elegante", overlay: "/haircuts/crew-cut.png" }
];

interface AIHaircutPreviewProps {
  trigger?: React.ReactNode;
}

export function AIHaircutPreview({ trigger }: AIHaircutPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewResult, setPreviewResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const processPreview = () => {
    if (!selectedImage || !selectedStyle) return;

    setIsProcessing(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      // Create a canvas to combine the images
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original image
        ctx?.drawImage(img, 0, 0);
        
        // Add a subtle overlay effect to simulate haircut
        if (ctx) {
          ctx.globalAlpha = 0.7;
          ctx.fillStyle = '#1B3D6D';
          ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4);
          
          // Add text overlay
          ctx.globalAlpha = 1;
          ctx.fillStyle = 'white';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Prévia do Corte', canvas.width / 2, 30);
          
          const style = haircutStyles.find(s => s.id === selectedStyle);
          if (style) {
            ctx.font = '16px Arial';
            ctx.fillText(style.name, canvas.width / 2, 55);
          }
        }
        
        setPreviewResult(canvas.toDataURL());
        setIsProcessing(false);
        
        toast({
          title: "Prévia gerada!",
          description: "Veja como ficaria o seu novo corte.",
        });
      };
      
      img.src = selectedImage;
    }, 3000);
  };

  const downloadPreview = () => {
    if (!previewResult) return;
    
    const link = document.createElement('a');
    link.download = 'meu-novo-corte-barberpro.jpg';
    link.href = previewResult;
    link.click();
  };

  const sharePreview = () => {
    if (navigator.share && previewResult) {
      // Convert data URL to blob for sharing
      fetch(previewResult)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'meu-corte-barberpro.jpg', { type: 'image/jpeg' });
          navigator.share({
            title: 'Meu novo corte na BarberPro',
            text: 'Veja como vai ficar meu novo visual!',
            files: [file]
          });
        });
    } else {
      toast({
        title: "Compartilhar não disponível",
        description: "Use o botão de download para salvar a imagem.",
      });
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setSelectedStyle(null);
    setPreviewResult(null);
    setIsProcessing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) reset();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-primary to-accent text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            Prévia com IA
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Prévia do Corte com IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!selectedImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/20">
                <CardContent className="p-8">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Envie sua foto</h3>
                  <p className="text-muted-foreground mb-4">
                    Faça upload de uma selfie para ver como ficaria com diferentes cortes
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Camera className="w-4 h-4 mr-2" />
                    Escolher Foto
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {selectedImage && !previewResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Sua foto</h3>
                  <img
                    src={selectedImage}
                    alt="Sua foto"
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={reset}
                    className="mt-2 w-full"
                  >
                    Trocar foto
                  </Button>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Escolha o estilo</h3>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {haircutStyles.map((style) => (
                      <Card
                        key={style.id}
                        className={`cursor-pointer transition-all ${
                          selectedStyle === style.id
                            ? "ring-2 ring-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedStyle(style.id)}
                      >
                        <CardContent className="p-3 text-center">
                          <Badge
                            variant={selectedStyle === style.id ? "default" : "secondary"}
                            className="mb-2 text-xs"
                          >
                            {style.name}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {style.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={processPreview}
                  disabled={!selectedStyle || isProcessing}
                  className="bg-gradient-to-r from-primary to-accent text-white"
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 mr-2"
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar Prévia
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {previewResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-3">Seu novo visual!</h3>
                <img
                  src={previewResult}
                  alt="Prévia do corte"
                  className="mx-auto max-w-full h-auto rounded-lg border shadow-lg"
                />
              </div>

              <div className="flex gap-3 justify-center">
                <Button onClick={downloadPreview} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </Button>
                <Button onClick={sharePreview} variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
                <Button onClick={reset}>
                  Tentar outro estilo
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}