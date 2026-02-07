import { useState } from "react";
import Navbar from "@/components/Navbar";
import UploadPanel from "@/components/UploadPanel";
import AuditResults from "@/components/AuditResults";
import { runAudit, type AuditResult } from "@/lib/auditEngine";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [view, setView] = useState<"upload" | "results">("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  const handleRunAudit = async (files: File[]) => {
    setIsLoading(true);
    try {
      const result = await runAudit(files);
      setAuditResult(result);
      setView("results");
    } catch (error) {
      console.error("Audit error:", error);
      toast({
        title: "Audit Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setView("upload");
    setAuditResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="flex min-h-screen flex-col items-center justify-center px-6 pt-14">
        <div className="w-full py-20">
          <div className="flex flex-col items-center">
            {view === "upload" ? (
              <>
                <div className="mb-12 text-center animate-fade-in">
                  <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                    Carbon Credit Pre-Audit
                  </h1>
                  <p className="mt-4 text-lg text-muted-foreground">
                    Upload your project documents for automated compliance review.
                  </p>
                </div>
                <UploadPanel onRunAudit={handleRunAudit} isLoading={isLoading} />
              </>
            ) : (
              auditResult && <AuditResults result={auditResult} onBack={handleBack} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
