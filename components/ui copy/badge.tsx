import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "secondary";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
          {
            "bg-blue-100 text-blue-800": variant === "default",
            "bg-green-100 text-green-800": variant === "success",
            "bg-orange-100 text-orange-800": variant === "warning",
            "bg-red-100 text-red-800": variant === "destructive",
            "bg-gray-100 text-gray-800": variant === "secondary",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };

