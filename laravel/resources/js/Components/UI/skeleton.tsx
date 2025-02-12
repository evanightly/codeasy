import { ny } from "@/Lib/Utils"

function Skeleton({
   className,
   ...props
}: React.HTMLAttributes<HTMLDivElement>) {
   return (
      <div
         className={ny("bg-primary/10 animate-pulse rounded-md", className)}
         {...props}
      />
   )
}

export { Skeleton }
