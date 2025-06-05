import { cn } from "@/lib/utils";
import { Check, Clock, X } from "lucide-react";

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "completed" | "scheduled" | "cancelled";
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const statusIcons = {
  completed: Check,
  scheduled: Clock,
  cancelled: X,
};

const statusColors = {
  completed: "bg-green-100 text-green-600",
  scheduled: "bg-blue-100 text-blue-600",
  cancelled: "bg-red-100 text-red-600",
};

const statusTextColors = {
  completed: "text-green-600",
  scheduled: "text-blue-600",
  cancelled: "text-red-600",
};

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {items.map((item, index) => {
        const Icon = statusIcons[item.status];
        const isLast = index === items.length - 1;
        
        return (
          <div key={item.id} className="flex items-start space-x-4">
            <div className="relative">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                statusColors[item.status]
              )}>
                <Icon className="w-6 h-6" />
              </div>
              {!isLast && (
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-border" />
              )}
            </div>
            
            <div className="flex-1 pb-6 border-b border-border last:border-b-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.date}</p>
                </div>
                <span className={cn(
                  "text-sm font-medium capitalize",
                  statusTextColors[item.status]
                )}>
                  {item.status}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
