import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "@radix-ui/react-icons"
import * as React from "react"

import { ny } from "@/Lib/Utils"

const Checkbox = React.forwardRef<
   React.ElementRef<typeof CheckboxPrimitive.Root>,
   React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
   <CheckboxPrimitive.Root
      ref={ref}
      className={ny(
         "border-primary focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground peer size-4 shrink-0 rounded-sm border shadow focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
         className,
      )}
      {...props}
   >
      <CheckboxPrimitive.Indicator
         className={ny("flex items-center justify-center text-current")}
      >
         <CheckIcon className="size-4" />
      </CheckboxPrimitive.Indicator>
   </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
