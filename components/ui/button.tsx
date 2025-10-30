import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-wide transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-transparent",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_18px_rgba(10,126,224,0.18)]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/30",
        outline:
          "border border-[#152b4a]/70 bg-transparent text-foreground hover:border-primary/60 hover:text-primary",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-foreground hover:bg-[#0a1a34]",
        link: "text-primary underline-offset-4 hover:underline",
        neon: "bg-gradient-to-r from-[#0a73c8] via-[#2f2d8c] to-[#602a8f] text-white shadow-[0_12px_35px_rgba(12,34,82,0.38)] hover:shadow-[0_14px_42px_rgba(12,34,82,0.45)] hover:saturate-125",
        glass:
          "border border-[#162d4f]/70 bg-[#040a19]/85 text-white backdrop-blur hover:bg-[#0a1830]",
      },
      size: {
        default: "h-11 px-8",
        sm: "h-9 px-6 text-xs",
        lg: "h-12 px-10 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
