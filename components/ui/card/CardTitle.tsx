import { cn } from "@/lib/utils/formatting";

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

const CardTitle = ({ className, ...props }: CardTitleProps) => (
  <h3
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
);

export { CardTitle };
