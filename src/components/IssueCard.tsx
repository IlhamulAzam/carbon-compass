import { AlertCircle, AlertTriangle, ChevronRight } from "lucide-react";

interface IssueCardProps {
  type: "major" | "minor";
  title: string;
  description: string;
  onViewDetails?: () => void;
}

const IssueCard = ({ type, title, description, onViewDetails }: IssueCardProps) => {
  const isMajor = type === "major";

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-200 hover:shadow-soft-md ${
        isMajor
          ? "border-destructive/20 bg-destructive/5"
          : "border-warning/20 bg-warning/5"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isMajor ? "bg-destructive/10" : "bg-warning/10"
          }`}
        >
          {isMajor ? (
            <AlertCircle className="h-5 w-5 text-destructive" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-warning" />
          )}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold uppercase tracking-wide ${
                isMajor ? "text-destructive" : "text-warning"
              }`}
            >
              {isMajor ? "Major Issue" : "Minor Issue"}
            </span>
          </div>
          <h4 className="text-base font-semibold text-foreground">{title}</h4>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>

      <button
        onClick={onViewDetails}
        className="mt-4 flex items-center gap-1 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
      >
        View Details
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
};

export default IssueCard;
