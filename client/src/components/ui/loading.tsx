import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loading({ size = "md", className }: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "border-2 border-muted-foreground/20 border-t-primary rounded-full animate-spin",
          sizeClasses[size]
        )}
      />
    </div>
  );
}

interface LoadingPageProps {
  message?: string;
  className?: string;
}

export function LoadingPage({ message = "Loading...", className }: LoadingPageProps) {
  return (
    <div className={cn("min-h-screen flex flex-col items-center justify-center p-4", className)}>
      <Loading size="lg" className="mb-4" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
