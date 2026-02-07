export interface AuditIssue {
  type: "major" | "minor";
  title: string;
  description: string;
  section?: string;
}

export interface AuditResult {
  issues: AuditIssue[];
  summary: string;
  analyzedFiles: string[];
}

const PDD_ISSUES: AuditIssue[] = [
  {
    type: "major",
    title: "Baseline Emissions Calculation Error",
    description:
      "The baseline emissions in Section 4.2 do not align with the methodology requirements. Recalculation using updated grid emission factors is needed.",
    section: "4.2",
  },
  {
    type: "major",
    title: "Incomplete Additionality Demonstration",
    description:
      "The investment analysis does not include sensitivity analysis for key financial parameters as required by the methodology.",
    section: "5.1",
  },
  {
    type: "minor",
    title: "Missing Monitoring Frequency",
    description:
      "The monitoring plan does not specify the frequency of data collection for parameter EF_grid.",
    section: "7.3",
  },
  {
    type: "minor",
    title: "Stakeholder Consultation Documentation Gap",
    description:
      "Records of stakeholder consultation are referenced but not appended to the PDD.",
    section: "6.1",
  },
  {
    type: "minor",
    title: "Project Boundary Clarification Needed",
    description:
      "The spatial boundary of the project activity is described in text but lacks a georeferenced map.",
    section: "3.2",
  },
];

const CALC_ISSUES: AuditIssue[] = [
  {
    type: "major",
    title: "Emission Factor Source Not Cited",
    description:
      "Grid emission factors used in the spreadsheet do not reference the approved source (e.g., IGES or national grid database).",
  },
  {
    type: "major",
    title: "Leakage Emissions Underestimated",
    description:
      "Leakage calculations appear to exclude upstream fuel displacement effects required by the methodology.",
  },
  {
    type: "minor",
    title: "Rounding Error in Net Reductions",
    description:
      "Net emission reductions are rounded before summation, which may introduce a cumulative error of up to 2%.",
  },
  {
    type: "minor",
    title: "Vintage Year Mismatch",
    description:
      "Calculation file references 2023 emission factors, but the crediting period starts in 2024.",
  },
];

const METHODOLOGY_ISSUES: AuditIssue[] = [
  {
    type: "major",
    title: "Methodology Version Mismatch",
    description:
      "The PDD references methodology version 12.0 but the latest approved version is 15.0. Applicability must be re-assessed.",
  },
  {
    type: "minor",
    title: "Applicability Condition Not Explicitly Addressed",
    description:
      "Condition 3(b) regarding grid-connected generation is not explicitly addressed in the applicability section.",
  },
];

const GENERIC_ISSUES: AuditIssue[] = [
  {
    type: "minor",
    title: "Document Formatting Inconsistency",
    description:
      "Section numbering is inconsistent across uploaded documents, which may cause confusion during validation.",
  },
  {
    type: "minor",
    title: "Cross-Reference Verification Needed",
    description:
      "Several cross-references between documents could not be automatically verified. Manual review recommended.",
  },
];

function classifyFile(name: string): "pdd" | "calc" | "methodology" | "generic" {
  const lower = name.toLowerCase();
  if (lower.includes("pdd") || lower.includes("project design") || lower.includes("project_design"))
    return "pdd";
  if (
    lower.includes("calc") ||
    lower.includes("spread") ||
    lower.includes("emission") ||
    lower.endsWith(".xlsx") ||
    lower.endsWith(".xls") ||
    lower.endsWith(".csv")
  )
    return "calc";
  if (lower.includes("method") || lower.includes("acm") || lower.includes("ams"))
    return "methodology";
  return "generic";
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

export function analyzeDocuments(files: File[]): AuditResult {
  const analyzedFiles = files.map((f) => f.name);
  const allIssues: AuditIssue[] = [];

  for (const file of files) {
    const category = classifyFile(file.name);
    switch (category) {
      case "pdd":
        allIssues.push(...pickRandom(PDD_ISSUES, 2 + Math.floor(Math.random() * 2)));
        break;
      case "calc":
        allIssues.push(...pickRandom(CALC_ISSUES, 1 + Math.floor(Math.random() * 2)));
        break;
      case "methodology":
        allIssues.push(...pickRandom(METHODOLOGY_ISSUES, 1 + Math.floor(Math.random() * 1)));
        break;
      default:
        allIssues.push(...pickRandom(GENERIC_ISSUES, 1));
    }
  }

  // Deduplicate by title
  const seen = new Set<string>();
  const unique = allIssues.filter((issue) => {
    if (seen.has(issue.title)) return false;
    seen.add(issue.title);
    return true;
  });

  const majorCount = unique.filter((i) => i.type === "major").length;
  const minorCount = unique.filter((i) => i.type === "minor").length;

  const summary =
    unique.length === 0
      ? "No issues were identified. The documents appear to meet compliance requirements."
      : `Identified ${unique.length} issue${unique.length > 1 ? "s" : ""} (${majorCount} major, ${minorCount} minor) across ${files.length} document${files.length > 1 ? "s" : ""}.`;

  return { issues: unique, summary, analyzedFiles };
}
