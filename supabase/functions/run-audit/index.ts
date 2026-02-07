import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const METHODOLOGY_CONTEXT = `You are an expert carbon credit pre-auditor specializing in JCM (Joint Crediting Mechanism) methodology PH_AM004: "Methane Emission Reduction by Water Management in Rice Paddy Fields" (Version 01.0).

Your job is to analyze uploaded PDD (Project Design Documents) and Excel calculation files against this methodology and its monitoring spreadsheet requirements.

## KEY METHODOLOGY RULES TO CHECK:

### Eligibility Criteria
1. Project field must be rice paddy that changes water regime from continuously flooded to single/multiple drainage, or single to multiple drainage
2. Farmers must not have conducted the target drainage type in past 2 years before project start
3. Drainage is fully completed when water level reaches 15cm below soil surface
4. Irrigation must be carried out within 2 days after drainage completion
5. Single/multiple drainage must not be required by local/national legislation

### Emission Sources & GHG Types
- Reference: CH4, N2O, CO2 (optional for pumps)
- Project: CH4, N2O, CO2 (drainage pumps required, irrigation optional)

### Key Formulas to Validate
- RE_p = RE_CH4,p + RE_N2O,p + RE_CO2,p
- PE_p = PE_CH4,p + PE_N2O,p + PE_CO2,p
- ER_p = (RE_p - PE_p) × (1 - Ud)

### CH4 Emission Calculations
Two options: Direct Measurement or Country Specific EF + Direct Measurement
- Direct: RE_CH4,s = Σ(EF_CH4,R,s,st × A_s,st × 10^-3 × GWP_CH4) OR Σ Σ(EF_CH4,R,s,d,st × D_s,st,f × A_s,st,f × 10^-3 × GWP_CH4)
- Country Specific: EF_CH4,R,s,d,st = EF_CH4,c,s,d × SF_R,w × SF_p × SF_o,s,st

### Key Constants
- GWP_CH4 = 28.0 tCO2e/tCH4
- GWP_N2O = 265 tCO2e/tN2O
- EF_CH4,c,s,d: 1.46 kg/ha/day (dry season), 2.95 kg/ha/day (wet season) in Philippines
- SF_R,w = 1 for continuous flooding
- SF_P,w = 0.55 (multiple drainage), 0.71 (single drainage)
- SF_p: 1.00 (non-flooded <180d), 0.89 (>180d), 2.41 (flooded >30d), 0.59 (>365d)
- CFOA: Straw <30d = 1.00, Straw >30d = 0.19, Compost = 0.17, FYM = 0.21, Green manure = 0.45
- SF_o,s,st = 1 + Σ(ROA_s,st,i × CFOA_i)

### N2O Calculations
- Direct measurement OR Emission Factor for Fertilizer
- EF_N2O,C = 0.003 kgN2O-N/kgN input (continuous flooding)
- EF_N2O,D = 0.005 kgN2O-N/kgN input (single/multiple drainage)
- N2O formula uses 44/28 conversion factor

### Uncertainty Deduction
- Direct Measurement: Ud_DM = 0.05 (every 3 years), 0.10 (every 4-5 years)
- Country Specific EF: Ud_EF = 0.15 (every 5 years)

### Monitoring Requirements (from Monitoring Spreadsheet)
Parameters to monitor ex post:
1. EF_CH4,R,s,st - Reference CH4 emission factor (kgCH4/ha/season) - Weekly
2. EF_CH4,P,s,st - Project CH4 emission factor (kgCH4/ha/season) - Weekly
3. A_s,st - Area of project fields (ha) - Once at beginning
4. EF_CH4,R,s,d,st - Reference CH4 per day (kgCH4/ha/day) - Weekly
5. EF_CH4,P,s,d,st - Project CH4 per day (kgCH4/ha/day) - Weekly
6. D_s,st,f - Total days in cropping season (days/season) - End of period
7. A_s,st,f - Area per field (ha) - Once at beginning
8. ROA_s,st,i - Organic amendment rates (t/ha) - End of period
9. EF_N2O,R,s,st - Reference N2O factor (kgN2O/ha/season) - Weekly
10. EF_N2O,P,s,st - Project N2O factor (kgN2O/ha/season) - Weekly
11-12. Q_N2O rates - N-input rates (kgN/ha/season) - Annual
13-14. Q_F fuel quantities (TJ/period) - End of period

### Stratification Parameters (Table 1)
- Water regime on-season: Continuously flooded (w1), Single Drainage (w2), Multiple Drainage (w3)
- Water regime pre-season: Flooded (p1), Short drainage <180d (p2), Long drainage ≥180d (p3)
- Soil type: Andosols (s1), Histosols (s2), Thionic soils (s3), Other soils (s4)
- Organic amendment type: Straw on-season (o1), Straw off-season (o2), Green manure (o3), FYM (o4), Compost (o5), None (o6)

## INSTRUCTIONS:
Analyze the uploaded documents and identify:
1. Mismatches between PDD claims and Excel calculations
2. Missing or incorrect parameters
3. Formula errors or wrong constants used
4. Missing monitoring parameters
5. Eligibility criteria not properly addressed
6. Stratification issues
7. Incorrect scaling factors or conversion factors
8. Missing uncertainty deduction
9. Any other compliance issues with JCM PH_AM004

For each issue, classify as "major" (affects emission reduction calculations or eligibility) or "minor" (documentation gaps, formatting, non-critical).`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const formData = await req.formData();
    const files: { name: string; content: string; type: string }[] = [];

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const buffer = await value.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );
        files.push({
          name: value.name,
          content: base64.substring(0, 50000), // Limit to avoid token overflow
          type: value.type,
        });
        console.log(`Received file: ${value.name} (${value.type}, ${value.size} bytes)`);
      }
    }

    if (files.length === 0) {
      return new Response(
        JSON.stringify({ error: "No files uploaded" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fileDescriptions = files
      .map(
        (f) =>
          `File: "${f.name}" (type: ${f.type})\nContent (base64, truncated): ${f.content.substring(0, 10000)}...`
      )
      .join("\n\n");

    const userPrompt = `Please analyze the following uploaded project documents against the JCM PH_AM004 methodology requirements. Identify all compliance issues, calculation mismatches, and documentation gaps.

${fileDescriptions}

Based on the file names, types, and any readable content, perform a thorough pre-audit analysis. If you cannot fully read the binary content, analyze based on what you can extract and flag areas that need manual verification.`;

    console.log("Calling AI gateway for audit analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: METHODOLOGY_CONTEXT },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_audit_findings",
              description:
                "Report the structured audit findings from analyzing the project documents against JCM PH_AM004 methodology.",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description:
                      "A 1-2 sentence summary of the overall audit findings.",
                  },
                  issues: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          enum: ["major", "minor"],
                          description: "Severity: major affects calculations/eligibility, minor is documentation gaps.",
                        },
                        title: {
                          type: "string",
                          description: "Short title of the issue (under 80 chars).",
                        },
                        section: {
                          type: "string",
                          description:
                            "The section or area where the issue was found (e.g., 'Section F.2 - CH4 Emissions', 'Excel - Sheet 3').",
                        },
                        description: {
                          type: "string",
                          description: "Detailed description of what is wrong.",
                        },
                        suggested_fix: {
                          type: "string",
                          description: "How to resolve the issue.",
                        },
                      },
                      required: ["type", "title", "section", "description", "suggested_fix"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["summary", "issues"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "report_audit_findings" },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI response received:", JSON.stringify(aiResponse).substring(0, 500));

    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      // Fallback: try to parse from content
      console.error("No tool call in response, returning raw response");
      return new Response(
        JSON.stringify({
          status: "completed",
          summary: "Analysis complete but structured extraction failed. Please review manually.",
          issues: [],
          analyzedFiles: files.map((f) => f.name),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const findings = JSON.parse(toolCall.function.arguments);
    console.log(`Found ${findings.issues?.length || 0} issues`);

    return new Response(
      JSON.stringify({
        status: "completed",
        summary: findings.summary,
        issues: findings.issues || [],
        analyzedFiles: files.map((f) => f.name),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("run-audit error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
