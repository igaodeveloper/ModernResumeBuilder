import { cn } from "@/lib/utils";

interface BarberPoleProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "w-4 h-6",
  md: "w-8 h-12",
  lg: "w-12 h-20",
  xl: "w-20 h-32",
};

export function BarberPole({ className, size = "md" }: BarberPoleProps) {
  return (
    <div
      className={cn(
        "barber-pole rounded-full shadow-lg",
        sizeClasses[size],
        className
      )}
    />
  );
}
