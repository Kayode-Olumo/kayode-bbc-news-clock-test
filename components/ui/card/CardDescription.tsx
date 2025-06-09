import { cn } from "@/lib/utils/formatting";

type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

const CardDescription = ({ className, ...props }: CardDescriptionProps) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);

export { CardDescription };
