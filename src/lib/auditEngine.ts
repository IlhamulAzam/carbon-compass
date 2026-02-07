export interface AuditIssue {
  type: "major" | "minor";
  title: string;
  description: string;
  section?: string;
  suggested_fix?: string;
}

export interface AuditResult {
  issues: AuditIssue[];
  summary: string;
  analyzedFiles: string[];
}

export async function runAudit(files: File[]): Promise<AuditResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`${supabaseUrl}/functions/v1/run-audit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please wait a moment and try again.");
    }
    if (response.status === 402) {
      throw new Error("AI usage limit reached. Please add credits to continue.");
    }
    throw new Error(errorData.error || `Audit failed with status ${response.status}`);
  }

  const data = await response.json();
  return {
    issues: data.issues || [],
    summary: data.summary || "Analysis complete.",
    analyzedFiles: data.analyzedFiles || files.map((f) => f.name),
  };
}
