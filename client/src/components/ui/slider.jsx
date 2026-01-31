import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
      <SliderPrimitive.Range className="absolute h-full bg-blue-600 dark:bg-blue-500" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-blue-600 dark:border-blue-500 bg-white dark:bg-gray-900 ring-2 ring-blue-500/20 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-shadow" />
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-blue-600 dark:border-blue-500 bg-white dark:bg-gray-900 ring-2 ring-blue-500/20 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-shadow" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }