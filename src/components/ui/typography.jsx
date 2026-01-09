import * as React from "react";
import { cn } from "@/lib/utils";

const Typography = React.forwardRef(({ className, variant = "body1", component, color = "inherit", align = "inherit", gutterBottom = false, noWrap = false, ...props }, ref) => {
  // Mapowanie wariantów MUI na klasy Tailwind
  const getVariantClasses = (variant) => {
    switch (variant) {
      case "h1":
        return "text-6xl font-black leading-none tracking-tight";
      case "h2":
        return "text-5xl font-extrabold";
      case "h3":
        return "text-4xl font-extrabold";
      case "h4":
        return "text-3xl font-bold";
      case "h5":
        return "text-2xl font-semibold";
      case "h6":
        return "text-xl font-semibold";
      case "subtitle1":
        return "text-lg font-medium";
      case "subtitle2":
        return "text-base font-medium";
      case "body1":
        return "text-base leading-relaxed";
      case "body2":
        return "text-sm leading-normal";
      case "caption":
        return "text-xs";
      case "overline":
        return "text-xs uppercase tracking-wider";
      case "button":
        return "text-sm font-bold uppercase tracking-wide";
      default:
        return "text-base";
    }
  };

  // Mapowanie kolorów MUI
  const getColorClasses = (color) => {
    switch (color) {
      case "primary":
        return "text-mui-primary";
      case "secondary":
        return "text-mui-secondary";
      case "textPrimary":
        return "text-mui-text-primary";
      case "textSecondary":
        return "text-mui-text-secondary";
      case "error":
        return "text-destructive";
      case "warning":
        return "text-yellow-500";
      case "info":
        return "text-blue-500";
      case "success":
        return "text-green-500";
      case "inherit":
        return "";
      default:
        return "";
    }
  };

  // Mapowanie wyrównania tekstu
  const getAlignClasses = (align) => {
    switch (align) {
      case "left":
        return "text-left";
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      case "justify":
        return "text-justify";
      case "inherit":
        return "";
      default:
        return "";
    }
  };

  // Określenie domyślnego komponentu na podstawie wariantu
  const getDefaultComponent = (variant) => {
    if (variant.startsWith("h")) return variant;
    if (variant.includes("subtitle")) return "h6";
    if (variant === "button") return "span";
    return "p";
  };

  const Component = component || getDefaultComponent(variant);

  return <Component className={cn(getVariantClasses(variant), getColorClasses(color), getAlignClasses(align), gutterBottom && "mb-4", noWrap && "truncate", className)} ref={ref} {...props} />;
});
Typography.displayName = "Typography";

export { Typography };
