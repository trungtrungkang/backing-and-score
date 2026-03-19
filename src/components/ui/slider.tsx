import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & { tooltipFormatter?: (value: number) => string, variant?: "default" | "loop" }
>(({ className, tooltipFormatter, variant = "default", ...props }, ref) => {
  const values = props.value ?? props.defaultValue ?? [0];
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex touch-none select-none items-center",
        "data-[orientation=horizontal]:w-full",
        "data-[orientation=vertical]:flex-col data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className={cn(
        "relative grow overflow-hidden rounded-full",
        variant === "loop" ? "bg-transparent border border-amber-500/20" : "bg-zinc-700/50",
        "data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:w-full",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2"
      )}>
        <SliderPrimitive.Range className={cn(
          "absolute pointer-events-none",
          variant === "loop" ? "bg-amber-500/30" : "bg-blue-500",
          "data-[orientation=horizontal]:h-full",
          "data-[orientation=vertical]:w-full"
        )} />
      </SliderPrimitive.Track>
      {values.map((val, i) => (
        <SliderPrimitive.Thumb key={i} className={cn(
          "group/thumb block h-5 w-5 rounded-full border bg-white ring-offset-background shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative",
          variant === "loop" ? "border-amber-400 focus-visible:ring-amber-500" : "border-blue-400 focus-visible:ring-blue-500"
        )}>
          {tooltipFormatter && (
            <div className={cn(
              "absolute rounded-md px-2 py-1 text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] border pointer-events-none whitespace-nowrap z-50",
              variant === "loop" ? "bg-amber-600 border-amber-500" : "bg-zinc-800 border-zinc-700",
              "opacity-0 scale-95 group-hover/thumb:opacity-100 group-hover/thumb:scale-100 group-focus/thumb:opacity-100 group-focus/thumb:scale-100 group-active/thumb:opacity-100 group-active/thumb:scale-100",
              props.orientation === 'vertical' 
                ? "left-full ml-4 top-1/2 -translate-y-1/2" 
                : "bottom-full mb-4 left-1/2 -translate-x-1/2"
            )}>
              {tooltipFormatter(val)}
              {/* Tiny arrow pointer */}
              <div className={cn(
                "absolute w-2 h-2 rotate-45",
                variant === "loop" ? "bg-amber-600 border-amber-500" : "bg-zinc-800 border-zinc-700",
                props.orientation === 'vertical'
                  ? "left-[-5px] top-1/2 -translate-y-1/2 border-b border-l"
                  : "bottom-[-5px] left-1/2 -translate-x-1/2 border-b border-r"
              )} />
            </div>
          )}
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  );
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
