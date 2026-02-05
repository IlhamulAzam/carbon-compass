import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import IssueCard from "./IssueCard";

interface AuditResultsProps {
  onBack: () => void;
}

const AuditResults = ({ onBack }: AuditResultsProps) => {
  const issues = [
    {
      type: "major" as const,
      title: "Baseline Emissions Calculation Error",
      description:
        "The baseline emissions in Section 4.2 do not align with the methodology requirements. Recalculation needed.",
    },
    {
      type: "minor" as const,
      title: "Missing Monitoring Frequency",
      description:
        "The monitoring plan does not specify the frequency of data collection for parameter EF_grid.",
    },
  ];

  const majorCount = issues.filter((i) => i.type === "major").length;
  const minorCount = issues.filter((i) => i.type === "minor").length;

  return (
    <div className="w-full max-w-2xl animate-fade-in-up">
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Upload
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Pre-Audit Report
        </h1>
        <p className="mt-2 text-muted-foreground">
          Review identified issues before proceeding with full verification.
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-border bg-muted/30 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
            <AlertTriangle className="h-6 w-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">{issues.length} Issues Found</p>
            <p className="text-sm text-muted-foreground">
              {majorCount} major · {minorCount} minor
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {issues.map((issue, index) => (
          <IssueCard
            key={index}
            type={issue.type}
            title={issue.title}
            description={issue.description}
            onViewDetails={() => console.log("View details:", issue.title)}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Button
          variant="outline"
          className="h-12 rounded-xl px-6 text-base font-medium"
          onClick={onBack}
        >
          Upload More Documents
        </Button>
        <Button className="h-12 rounded-xl px-6 text-base font-medium shadow-soft-md transition-all hover:shadow-soft-lg">
          Export Report
        </Button>
      </div>
    </div>
  );
};

export default AuditResults;
