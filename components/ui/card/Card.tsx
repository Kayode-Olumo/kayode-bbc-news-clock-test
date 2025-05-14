import { cn } from "@/lib/utils/formatting";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

const Card = ({ className, ...props }: CardProps) => (
  <div
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
);

export { Card };
