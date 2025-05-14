import { cn } from "@/lib/utils/formatting";

type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

const CardFooter = ({ className, ...props }: CardFooterProps) => (
  <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
);

export { CardFooter };
