import Navbar from "@/components/Navbar";
import { FileText, Calendar, CheckCircle2 } from "lucide-react";

const Reports = () => {
  const reports = [
    {
      id: 1,
      name: "Solar Farm Project - Kenya",
      date: "Feb 3, 2026",
      status: "completed",
      issues: 2,
    },
    {
      id: 2,
      name: "Reforestation Initiative - Brazil",
      date: "Jan 28, 2026",
      status: "completed",
      issues: 0,
    },
    {
      id: 3,
      name: "Wind Energy Project - India",
      date: "Jan 15, 2026",
      status: "completed",
      issues: 1,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 pt-28 pb-20">
        <div className="mb-10 animate-fade-in">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Audit Reports
          </h1>
          <p className="mt-2 text-muted-foreground">
            View and manage your pre-audit reports.
          </p>
        </div>

        <div className="space-y-4 animate-fade-in-up">
          {reports.map((report) => (
            <div
              key={report.id}
              className="group cursor-pointer rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-foreground/10 hover:shadow-soft-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{report.name}</h3>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {report.date}
                      </span>
                      {report.issues === 0 ? (
                        <span className="flex items-center gap-1 text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          No issues
                        </span>
                      ) : (
                        <span className="text-warning">{report.issues} issues found</span>
                      )}
                    </div>
                  </div>
                </div>

                <button className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground opacity-0 transition-all duration-200 hover:bg-muted group-hover:opacity-100">
                  View Report
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Reports;
