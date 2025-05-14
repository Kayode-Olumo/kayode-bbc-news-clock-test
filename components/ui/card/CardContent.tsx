import { cn } from "@/lib/utils/formatting";

type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

const CardContent = ({ className, ...props }: CardContentProps) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);

export { CardContent };
