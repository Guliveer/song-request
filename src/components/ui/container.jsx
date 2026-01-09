import * as React from "react";
import { cn } from "@/lib/utils";

const Container = React.forwardRef(({ className, maxWidth = "lg", disableGutters = false, fixed = false, ...props }, ref) => {
  const getMaxWidthClass = (maxWidth) => {
    switch (maxWidth) {
      case "xs":
        return "max-w-xs";
      case "sm":
        return "max-w-sm";
      case "md":
        return "max-w-md";
      case "lg":
        return "max-w-4xl";
      case "xl":
        return "max-w-6xl";
      case "2xl":
        return "max-w-7xl";
      case false:
        return "";
      default:
        return "max-w-4xl";
    }
  };

  return <div className={cn("w-full mx-auto", !disableGutters && "px-4 sm:px-6 lg:px-8", !fixed && getMaxWidthClass(maxWidth), fixed && "max-w-none", className)} ref={ref} {...props} />;
});
Container.displayName = "Container";

export { Container };
