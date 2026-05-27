import { useState, useCallback } from "react";
import { jsPDF } from "jspdf";
import Navbar from '../../../src/components/Navbar'
import Footer from '../../../src/components/Footer'

const GOALS = [
  { id: "found", label: "I want clients to find me when they ask AI about my services" },
  { id: "trusted", label: "I want AI to recommend me over competitors" },
  { id: "answered", label: "I want AI to answer common client questions using my content" },
  { id: "all", label: "All of the above" },
];

const gradeColor = (g: string | undefined) => {
  if (!g) return "#666";
  if (g.startsWith("A")) return "#4ade80";
  if (g.startsWith("B")) return "#c8f135";
  if (g.startsWith("C")) return "#ffaa00";
  return "#ff4444";
};

const LOADING_STEPS = [
  "Fetching page content",
  "Checking AI discoverability signals",
  "Analysing question-answer coverage",
  "Grading structured data & schema",
  "Generating your report",
];

interface Finding {
  type: "pass" | "issue" | "warning";
  text: string;
}

interface Section {
  name: string;
  grade: string;
  analysis: string;
  findings: Finding[];
}

interface Report {
  overall_grade: string;
  overall_summary: string;
  executive_summary: string;
  sections: Section[];
}

export default function Page() {
  const [step, setStep] = useState(0);
  const [vertical, setVertical] = useState("");
  const [goal, setGoal] = useState<string | null>(null);
  const [searchIntent, setSearchIntent] = useState("");
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(-1);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({});

  const toggleSection = (i: number) =>
    setOpenSections((p) => ({ ...p, [i]: !p[i] }));

  const restart = () => {
    setStep(0); setVertical(""); setGoal(null); setSearchIntent("");
    setUrl(""); setEmail(""); setLoading(false);
    setLoadStep(-1); setReport(null); setError(null);
    setOpenSections({});
  };

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    setLoadStep(0);

    // Animate loading steps while the server does the work
    const stepTimer = setInterval(() => {
      setLoadStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 3000);

    try {
      const res = await fetch("/api/ai-search-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vertical, goal, searchIntent, url }),
      });

      clearInterval(stepTimer);

      if (!res.ok) {
        let message = "Server error";
        try {
          const err = await res.json();
          message = err.error || message;
        } catch {
          message = res.status === 504 ? "The audit took too long. Try a smaller site or a specific page URL instead of the homepage." : `Server returned ${res.status}`;
        }
        throw new Error(message);
      }

      const parsed = await res.json();
      setReport(parsed);
      setLoading(false);
    } catch (err) {
      clearInterval(stepTimer);
      setLoading(false);
      setError(`Something went wrong running the audit. ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const downloadPdf = useCallback(() => {
    if (!report) return;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = 20;

    const checkPage = (need: number) => {
      if (y + need > doc.internal.pageSize.getHeight() - 15) {
        doc.addPage();
        y = 20;
      }
    };

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(41, 171, 0);
    doc.text("BOOKABLE — AI SEARCH AUDIT", margin, y);
    y += 8;

    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30);
    doc.text("AI Search Readiness Report", margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(url, margin, y);
    y += 12;

    // Overall grade
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text(`Overall Grade: ${report.overall_grade}`, margin, y);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(report.overall_summary, margin + 55, y);
    y += 10;

    // Executive summary
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const summaryLines = doc.splitTextToSize(report.executive_summary, contentW);
    checkPage(summaryLines.length * 5 + 5);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 5 + 8;

    // Sections
    for (const section of report.sections) {
      checkPage(40);

      // Section header
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageW - margin, y);
      y += 6;

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(section.name, margin, y);
      doc.setTextColor(...(section.grade.startsWith("A") ? [74, 222, 128] as const : section.grade.startsWith("B") ? [100, 160, 30] as const : section.grade.startsWith("C") ? [200, 140, 0] as const : [220, 50, 50] as const));
      doc.text(section.grade, pageW - margin - 10, y);
      y += 7;

      // Analysis
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const analysisLines = doc.splitTextToSize(section.analysis, contentW);
      checkPage(analysisLines.length * 4 + 5);
      doc.text(analysisLines, margin, y);
      y += analysisLines.length * 4 + 4;

      // Findings
      for (const f of section.findings) {
        const icon = f.type === "pass" ? "\u2713" : f.type === "issue" ? "\u2717" : "!";
        const color: [number, number, number] = f.type === "pass" ? [74, 222, 128] : f.type === "issue" ? [255, 68, 68] : [255, 170, 0];
        const findingLines = doc.splitTextToSize(f.text, contentW - 10);
        checkPage(findingLines.length * 4 + 4);

        doc.setTextColor(...color);
        doc.setFont("helvetica", "bold");
        doc.text(icon, margin + 1, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text(findingLines, margin + 8, y);
        y += findingLines.length * 4 + 3;
      }

      y += 4;
    }

    // Footer
    checkPage(15);
    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Generated by Bookable — www.bookable.online/resources/ai-search-audit", margin, y);

    doc.save(`ai-search-audit-${new URL(url).hostname}.pdf`);
  }, [report, url]);

  const styles = {
    root: { background: "#0a0a0a", color: "#f0f0f0", fontFamily: "'Montserrat', sans-serif", minHeight: "100vh", padding: "40px 24px", fontSize: 12 } as const,
    container: { maxWidth: 640, margin: "0 auto" } as const,
    badge: { display: "inline-block", background: "#c8f135", color: "#000", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" as const, padding: "4px 10px", marginBottom: 20, fontWeight: 600 },
    h1: { fontSize: 32, fontWeight: 600, lineHeight: 1.2, marginBottom: 12, letterSpacing: "-0.02em" },
    h1accent: { color: "#29ab00", fontStyle: "italic" as const },
    subtitle: { color: "#888", fontSize: 16, lineHeight: 1.7, maxWidth: 480, marginBottom: 40 },
    card: { background: "#111", border: "1px solid #2a2a2a", padding: 32, marginBottom: 16 },
    stepLabel: { fontSize: 12, color: "#555", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 },
    stepDot: (s: number, cur: number) => ({ width: 6, height: 6, borderRadius: "50%", background: s < cur ? "#8aaa22" : s === cur ? "#c8f135" : "#2a2a2a" }),
    questionLabel: { fontSize: 16, fontWeight: 500, lineHeight: 1.3, marginBottom: 20, letterSpacing: "-0.01em" },
    optionBtn: (sel: boolean) => ({
      width: "100%", background: sel ? "rgba(200,241,53,0.06)" : "#1a1a1a",
      border: sel ? "1px solid #c8f135" : "1px solid #2a2a2a",
      color: sel ? "#c8f135" : "#999", padding: "12px 16px",
      textAlign: "left" as const, cursor: "pointer", fontFamily: "inherit",
      fontSize: 12, marginBottom: 8, display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s",
    }),
    optionMarker: () => ({ width: 16, height: 16, border: "1px solid currentColor", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, flexShrink: 0 }),
    input: { width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#f0f0f0", padding: "12px 16px", fontFamily: "inherit", fontSize: 12, outline: "none", marginBottom: 12, boxSizing: "border-box" as const },
    navRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
    btnPrimary: (dis: boolean) => ({ background: dis ? "#333" : "#c8f135", color: dis ? "#666" : "#000", border: "none", padding: "12px 24px", fontFamily: "inherit", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, cursor: dis ? "not-allowed" : "pointer" }),
    btnGhost: { background: "transparent", border: "1px solid #2a2a2a", color: "#666", padding: "12px 20px", fontFamily: "inherit", fontSize: 12, cursor: "pointer" },
    sectionCard: { background: "#111", border: "1px solid #2a2a2a", marginBottom: 8 },
    sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", cursor: "pointer" },
    sectionName: { fontSize: 12, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#888" },
    sectionBody: { padding: "0 20px 20px", borderTop: "1px solid #2a2a2a" },
    finding: (t: string) => ({
      fontSize: 12, padding: "8px 12px", borderLeft: `2px solid ${t === "pass" ? "#4ade80" : t === "issue" ? "#ff4444" : "#ffaa00"}`,
      background: t === "pass" ? "rgba(74,222,128,0.04)" : t === "issue" ? "rgba(255,68,68,0.04)" : "rgba(255,170,0,0.04)",
      color: "#aaa", marginBottom: 6, lineHeight: 1.6,
    }),
    summaryBox: { background: "#1a1a1a", border: "1px solid #2a2a2a", padding: 20, marginBottom: 24, fontSize: 12, color: "#aaa", lineHeight: 1.75 },
    overallGrade: { display: "inline-flex", alignItems: "center", gap: 12, background: "#1a1a1a", border: "1px solid #2a2a2a", padding: "10px 16px", marginTop: 16 },
    errorBox: { background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.3)", padding: "16px 20px", color: "#ff8888", fontSize: 12, lineHeight: 1.6 },
  };

  return (
    <>
      <Navbar />
      <div style={styles.root}>
        <div style={styles.container}>
          <div style={{ marginBottom: 40 }}>
            <div style={styles.badge}>Bookable — Free Tool</div>
            <h1 style={styles.h1}>Is your site <span style={styles.h1accent}>AI-ready?</span></h1>
            <p style={styles.subtitle}>Google indexes your page. AI answers the question. If your site doesn't answer questions, AI finds someone who does.</p>
          </div>

          {/* LOADING */}
          {loading && (
            <div style={styles.card}>
              <div style={{ textAlign: "center", paddingBottom: 16 }}>
                <div style={{ ...styles.questionLabel, marginBottom: 6 }}>Auditing your site</div>
                <div style={{ color: "#555", fontSize: 12, marginBottom: 24 }}>{url}</div>
                <div style={{ width: "100%", height: 2, background: "#2a2a2a", marginBottom: 24 }}>
                  <div style={{ height: "100%", background: "#c8f135", width: `${((loadStep + 1) / 5) * 100}%`, transition: "width 0.4s ease" }} />
                </div>
              </div>
              {LOADING_STEPS.map((s, i) => (
                <div key={i} style={{ fontSize: 12, color: i < loadStep ? "#8aaa22" : i === loadStep ? "#c8f135" : "#333", display: "flex", gap: 10, alignItems: "center", marginBottom: 8, transition: "color 0.3s" }}>
                  <span>{i < loadStep ? "\u2713" : i === loadStep ? "\u203A" : "\u00B7"}</span>{s}
                </div>
              ))}
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div style={styles.card}>
              <div style={styles.errorBox}>{error}</div>
              <div style={{ marginTop: 24 }}><button style={styles.btnGhost} onClick={restart}>&larr; Start again</button></div>
            </div>
          )}

          {/* REPORT */}
          {!loading && !error && report && (
            <div>
              <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid #2a2a2a" }}>
                <div style={{ fontSize: 12, color: "#555", marginBottom: 6, letterSpacing: "0.05em" }}>{url}</div>
                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>AI Search Readiness Report</div>
                <div style={styles.overallGrade}>
                  <span style={{ fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>Overall</span>
                  <span style={{ fontSize: 18, fontWeight: 600, color: gradeColor(report.overall_grade) }}>{report.overall_grade}</span>
                  <span style={{ color: "#666", fontSize: 12 }}>{report.overall_summary}</span>
                </div>
              </div>
              <div style={styles.summaryBox}>{report.executive_summary}</div>
              {report.sections?.map((s, i) => (
                <div key={i} style={styles.sectionCard}>
                  <div style={styles.sectionHeader} onClick={() => toggleSection(i)}>
                    <span style={styles.sectionName}>{s.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 16, fontWeight: 500, color: gradeColor(s.grade) }}>{s.grade}</span>
                      <span style={{ color: "#555", fontSize: 12 }}>{openSections[i] ? "\u25B2" : "\u25BC"}</span>
                    </div>
                  </div>
                  {openSections[i] && (
                    <div style={styles.sectionBody}>
                      <p style={{ color: "#888", fontSize: 12, lineHeight: 1.75, marginTop: 16, marginBottom: 12 }}>{s.analysis}</p>
                      {s.findings?.map((f, j) => (
                        <div key={j} style={styles.finding(f.type)}>{f.text}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #2a2a2a", display: "flex", gap: 12, alignItems: "center" }}>
                <button style={styles.btnGhost} onClick={restart}>&larr; Audit another site</button>
                <button style={styles.btnPrimary(false)} onClick={downloadPdf}>Download PDF</button>
              </div>
            </div>
          )}

          {/* FORM STEPS */}
          {!loading && !error && !report && (
            <div style={styles.card}>
              <div style={styles.stepLabel}>
                {[0, 1, 2, 3, 4].map((i) => <div key={i} style={styles.stepDot(i, step)} />)}
                <span>Step {step + 1} of 5</span>
              </div>

              {step === 0 && (
                <>
                  <div style={styles.questionLabel}>What type of business are you?</div>
                  <input style={styles.input} type="text" placeholder="e.g. Mortgage broker, Yoga teacher, Accountant" value={vertical} onChange={(e) => setVertical(e.target.value)} />
                  <p style={{ color: "#555", fontSize: 12, marginTop: -4, marginBottom: 12 }}>Keep it simple, like "Mortgage broker", or "Yoga teacher"</p>
                  <div style={styles.navRow}>
                    <span />
                    <button style={styles.btnPrimary(!vertical.trim())} disabled={!vertical.trim()} onClick={() => setStep(1)}>Continue &rarr;</button>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div style={styles.questionLabel}>What do you most want AI search to do for your business?</div>
                  {GOALS.map((g) => (
                    <button key={g.id} style={styles.optionBtn(goal === g.id)} onClick={() => setGoal(g.id)}>
                      <span style={styles.optionMarker()}>{goal === g.id ? "\u2713" : ""}</span>
                      {g.label}
                    </button>
                  ))}
                  <div style={styles.navRow}>
                    <button style={styles.btnGhost} onClick={() => setStep(0)}>&larr; Back</button>
                    <button style={styles.btnPrimary(!goal)} disabled={!goal} onClick={() => setStep(2)}>Continue &rarr;</button>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div style={styles.questionLabel}>What would you want a potential client to find when they search for you?</div>
                  <input style={styles.input} type="text" placeholder="e.g. Best mortgage rates in Manchester, Beginner yoga classes near me" value={searchIntent} onChange={(e) => setSearchIntent(e.target.value)} />
                  <p style={{ color: "#555", fontSize: 12, marginTop: -4, marginBottom: 12 }}>Think about what a client would type into ChatGPT or Google when looking for someone like you</p>
                  <div style={styles.navRow}>
                    <button style={styles.btnGhost} onClick={() => setStep(1)}>&larr; Back</button>
                    <button style={styles.btnPrimary(!searchIntent.trim())} disabled={!searchIntent.trim()} onClick={() => setStep(3)}>Continue &rarr;</button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div style={styles.questionLabel}>Enter the website you want Bookable to create a report on</div>
                  <input style={styles.input} type="url" placeholder="https://yourwebsite.com" value={url} onChange={(e) => setUrl(e.target.value)} />
                  <div style={styles.navRow}>
                    <button style={styles.btnGhost} onClick={() => setStep(2)}>&larr; Back</button>
                    <button style={styles.btnPrimary(!url)} disabled={!url} onClick={() => setStep(4)}>Continue &rarr;</button>
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <div style={styles.questionLabel}>Email where you want me to send your report</div>
                  <input style={styles.input} type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <div style={styles.navRow}>
                    <button style={styles.btnGhost} onClick={() => setStep(3)}>&larr; Back</button>
                    <button style={styles.btnPrimary(!email)} disabled={!email} onClick={runAudit}>Run my audit &rarr;</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
