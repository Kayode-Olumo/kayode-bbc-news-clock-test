import { cn } from "@/lib/utils/formatting";

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

const CardHeader = ({ className, ...props }: CardHeaderProps) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);

export { CardHeader };
