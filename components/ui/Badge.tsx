"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gold-primary text-bg-primary shadow hover:bg-gold-primary/80",
        secondary:
          "border-transparent bg-bg-elevated text-text-primary hover:bg-bg-elevated/80",
        success: "border-transparent bg-success/20 text-success hover:bg-success/30",
        destructive:
          "border-transparent bg-error/20 text-error hover:bg-error/30",
        warning:
          "border-transparent bg-warning/20 text-warning hover:bg-warning/30",
        outline: "text-text-primary border-bg-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
