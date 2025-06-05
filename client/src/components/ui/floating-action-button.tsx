import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function FloatingActionButton({ 
  onClick, 
  className, 
  children = <Plus className="w-8 h-8" />
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl z-50",
        "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
        "transition-all duration-300 transform hover:scale-110",
        "hidden md:flex items-center justify-center",
        className
      )}
    >
      {children}
    </Button>
  );
}
