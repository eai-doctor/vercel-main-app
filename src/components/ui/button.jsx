import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        // 페이지의 primaryBtn → #2C3B8D 계열
        default:
          "bg-[#2C3B8D] text-white shadow-sm hover:bg-[#1f2a63] focus-visible:ring-[#2C3B8D]",
        // 페이지의 dangerBtn → red-600 계열
        destructive:
          "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
        // 페이지의 ghostBtn → gray-100 계열
        ghost:
          "bg-gray-100 text-[#475569] hover:bg-gray-200 focus-visible:ring-gray-400",
        outline:
          "border border-gray-300 bg-white text-[#475569] hover:bg-gray-50 focus-visible:ring-[#2C3B8D]",
        link: "text-[#2C3B8D] underline-offset-4 hover:underline",
      },
      size: {
        default: "px-5 py-2.5",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      cursor: "pointer",
    },
  }
);

function Button({ className, variant, size, asChild = false, ...rest }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...rest}
    />
  );
}

export { Button, buttonVariants };