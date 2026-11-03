import { CircleAlert, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Terjadi kesalahan",
  description,
  onRetry,
  retryLabel = "Coba kembali",
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-red-200 bg-red-50/60 px-6 py-10 text-center">
      <CircleAlert className="h-6 w-6 text-danger" aria-hidden />
      <p className="font-semibold text-ink">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm text-ink-soft">{description}</p>
      ) : null}
      {onRetry ? (
        <Button variant="danger" size="sm" className="mt-2" onClick={onRetry}>
          <RotateCcw className="h-4 w-4" aria-hidden />
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
