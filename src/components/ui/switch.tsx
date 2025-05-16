
import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  size?: "default" | "sm"
  variant?: "default" | "success-danger"
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, size = "default", variant = "default", ...props }, ref) => {
  const sizeClasses = {
    default: "h-6 w-11",
    sm: "h-4 w-7"
  }
  
  const thumbSizeClasses = {
    default: "h-5 w-5 data-[state=checked]:translate-x-5",
    sm: "h-3 w-3 data-[state=checked]:translate-x-3.5"
  }
  
  const variantClasses = {
    default: "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
    "success-danger": "data-[state=checked]:bg-yard data-[state=unchecked]:bg-destructive"
  }

  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform",
          thumbSizeClasses[size]
        )}
      />
    </SwitchPrimitives.Root>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
