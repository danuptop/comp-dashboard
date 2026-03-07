"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/* ══════════════════════════════════════════════════════════════════
   TRANSCRIPT PRIVACY SCRUBBER
   Client-side PII removal — PayUP-style glassmorphism UI.
   ══════════════════════════════════════════════════════════════════ */

const PII_PATTERNS: { name: string; pattern: RegExp; replacement: string }[] = [
  { name: "email", pattern: /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g, replacement: "[EMAIL REDACTED]" },
  { name: "phone", pattern: /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, replacement: "[PHONE REDACTED]" },
  { name: "ssn", pattern: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g, replacement: "[SSN REDACTED]" },
  { name: "url", pattern: /https?:\/\/[^\s,)]+/g, replacement: "[URL REDACTED]" },
  { name: "social", pattern: /\b(?:linkedin\.com|twitter\.com|x\.com|facebook\.com|instagram\.com|github\.com)\/[^\s,)]+/gi, replacement: "[SOCIAL PROFILE REDACTED]" },
  { name: "handle", pattern: /(?:^|\s)@[A-Za-z0-9_]{2,30}\b/g, replacement: " [HANDLE REDACTED]" },
  { name: "dob", pattern: /\b(?:0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])[\/\-](?:19|20)\d{2}\b/g, replacement: "[DATE REDACTED]" },
  { name: "address", pattern: /\b\d{1,5}\s+(?:[A-Z][a-z]+\s?){1,4}(?:Street|St|Avenue|Ave|Boulevard|Blvd|Drive|Dr|Lane|Ln|Road|Rd|Court|Ct|Way|Place|Pl|Circle|Cir)\b\.?/gi, replacement: "[ADDRESS REDACTED]" },
  { name: "zip", pattern: /\b\d{5}(?:-\d{4})?\b/g, replacement: "[ZIP REDACTED]" },
  { name: "cc", pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, replacement: "[CARD NUMBER REDACTED]" },
  { name: "ip", pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, replacement: "[IP REDACTED]" },
];

type RedactionEntry = {
  original: string;
  replacement: string;
  patternName: string;
  index: number;
};

type NameEntry = { id: number; value: string };

function scrubTranscript(
  text: string,
  candidateNames: string[],
  interviewerSafe: string[]
): { scrubbed: string; redactions: RedactionEntry[] } {
  const redactions: RedactionEntry[] = [];
  let result = text;

  const safeSet = new Set(
    interviewerSafe.filter(Boolean).map((s) => s.trim().toLowerCase())
  );

  for (const name of candidateNames) {
    if (!name.trim()) continue;
    const escaped = name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const namePattern = new RegExp(`\\b${escaped}\\b`, "gi");
    result = result.replace(namePattern, (match, offset) => {
      const replacement = "[CANDIDATE REDACTED]";
      redactions.push({ original: match, replacement, patternName: "candidate_name", index: offset });
      return replacement;
    });
  }

  for (const { name, pattern, replacement } of PII_PATTERNS) {
    const freshPattern = new RegExp(pattern.source, pattern.flags);
    result = result.replace(freshPattern, (match, ...args) => {
      if (safeSet.has(match.trim().toLowerCase())) return match;
      const offset = typeof args[args.length - 2] === "number" ? args[args.length - 2] : 0;
      redactions.push({ original: match, replacement, patternName: name, index: offset });
      return replacement;
    });
  }

  return { scrubbed: result, redactions };
}

/* ── 3D Tilt Card ─────────────────────────────────────────────── */
function GlassCard({
  children,
  className = "",
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`scrub-glass-panel transition-transform duration-300 ease-out ${glow ? "scrub-glow-border" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────── */
export default function ScrubberPage() {
  const [inputText, setInputText] = useState("");
  const [scrubbedText, setScrubbedText] = useState("");
  const [redactions, setRedactions] = useState<RedactionEntry[]>([]);
  const [candidateNames, setCandidateNames] = useState<NameEntry[]>([{ id: 1, value: "" }]);
  const [interviewerNames, setInterviewerNames] = useState<NameEntry[]>([{ id: 100, value: "" }]);
  const [hasRun, setHasRun] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nextNameId = useRef(2);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleScrub = useCallback(() => {
    const candidates = candidateNames.map((n) => n.value).filter(Boolean);
    const safe = interviewerNames.map((n) => n.value).filter(Boolean);
    const { scrubbed, redactions: r } = scrubTranscript(inputText, candidates, safe);
    setScrubbedText(scrubbed);
    setRedactions(r);
    setHasRun(true);
  }, [inputText, candidateNames, interviewerNames]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === "string") setInputText(text);
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  const handleDownload = useCallback(() => {
    const blob = new Blob([scrubbedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scrubbed-transcript.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [scrubbedText]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(scrubbedText);
  }, [scrubbedText]);

  const addEntry = (setter: React.Dispatch<React.SetStateAction<NameEntry[]>>) => {
    setter((prev) => [...prev, { id: nextNameId.current++, value: "" }]);
  };

  const removeEntry = (setter: React.Dispatch<React.SetStateAction<NameEntry[]>>, id: number) => {
    setter((prev) => (prev.length <= 1 ? prev : prev.filter((n) => n.id !== id)));
  };

  const updateEntry = (setter: React.Dispatch<React.SetStateAction<NameEntry[]>>, id: number, value: string) => {
    setter((prev) => prev.map((n) => (n.id === id ? { ...n, value } : n)));
  };

  const handleReset = () => {
    setInputText("");
    setScrubbedText("");
    setRedactions([]);
    setHasRun(false);
    setCandidateNames([{ id: 1, value: "" }]);
    setInterviewerNames([{ id: 100, value: "" }]);
  };

  const redactionSummary = redactions.reduce<Record<string, number>>((acc, r) => {
    acc[r.patternName] = (acc[r.patternName] || 0) + 1;
    return acc;
  }, {});

  const PATTERN_LABELS: Record<string, string> = {
    candidate_name: "Candidate Names",
    email: "Emails",
    phone: "Phone Numbers",
    ssn: "SSNs",
    url: "URLs",
    social: "Social Profiles",
    handle: "Social Handles",
    dob: "Dates",
    address: "Addresses",
    zip: "ZIP Codes",
    cc: "Card Numbers",
    ip: "IP Addresses",
  };

  return (
    <div className="scrub-page relative min-h-screen overflow-hidden">
      {/* ── Floating Background Orbs ──────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="scrub-orb scrub-orb-1" />
        <div className="scrub-orb scrub-orb-2" />
        <div className="scrub-orb scrub-orb-3" />
      </div>

      <div className="relative z-10 max-w-[1100px] mx-auto px-6 md:px-16 py-12">
        {/* ── Back Link ──────────────────────────────────────── */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-[#8B7BB5] transition-colors text-sm mb-16 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">&larr;</span>
          Back to Dashboard
        </a>

        {/* ══════════════════════════════════════════════════════
            HERO SECTION
            ══════════════════════════════════════════════════════ */}
        <div
          className={`text-center mb-24 transition-all duration-1000 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="scrub-glow-text text-[#8B7BB5] font-mono text-xs lg:text-sm tracking-[0.25em] mb-6 uppercase font-bold">
            Privacy-First Transcript Processing
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
            Interview
            <br />
            <span className="scrub-gradient-text">Transcript Scrubber</span>
          </h1>
          <p className="text-white/50 text-lg md:text-xl max-w-[620px] mx-auto leading-relaxed">
            Remove <span className="text-white font-medium">candidate personal data</span> while
            preserving interviewer info. 100% client-side &mdash; nothing leaves your browser.
          </p>
        </div>

        {/* ── Privacy Policy ──────────────────────────────────── */}
        <div
          className={`flex justify-center mb-16 transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <button
            onClick={() => setShowPolicy(!showPolicy)}
            className="scrub-glass-button px-6 py-3 rounded-xl text-sm font-semibold group"
          >
            <span className="text-[#8B7BB5] group-hover:text-white transition-colors">
              {showPolicy ? "Hide" : "View"} Data Privacy Policy
            </span>
          </button>
        </div>

        {showPolicy && (
          <div className="scrub-fade-in mb-16">
            <GlassCard className="rounded-3xl p-8 md:p-12 max-w-[800px] mx-auto" glow>
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_20%_10%,rgba(107,91,149,0.15),transparent_50%)]" />
              <h2 className="text-xl font-bold text-white mb-6 relative">Our Data Privacy Commitment</h2>
              <p className="text-white/50 text-sm mb-6 relative">
                We are 100% committed to the following data privacy policy:
              </p>
              <ul className="space-y-4 text-sm relative">
                {[
                  "All personal data will be scrubbed before we feed it to the LLM",
                  "No personal data will be processed in the building of the coach",
                  "No personal data will be saved to any internal databases",
                  "No personal data will be shared with anyone outside of the Up Top organization",
                  "All transcripts will be deleted upon completion of the project",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-[#00FF94] mt-0.5 font-bold text-lg leading-none">&#10003;</span>
                    <span className="italic text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-white/35 text-xs mt-8 leading-relaxed relative">
                This tool runs entirely in your browser &mdash; zero data leaves your device.
              </p>
            </GlassCard>
          </div>
        )}

        {/* ── Security Badge ──────────────────────────────────── */}
        <div
          className={`flex justify-center mb-20 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="inline-flex items-center gap-4 rounded-2xl px-6 py-4 border border-[#00FF94]/20 bg-[#00FF94]/[0.04] backdrop-blur-sm">
            <div className="w-3 h-3 rounded-full bg-[#00FF94] scrub-pulse-dot" />
            <div>
              <div className="text-xs font-bold text-[#00FF94] tracking-wide uppercase">100% Client-Side Processing</div>
              <div className="text-[0.7rem] text-white/40 mt-0.5">
                Your transcript never leaves this page. All scrubbing happens in JavaScript.
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            HOW IT WORKS
            ══════════════════════════════════════════════════════ */}
        <div
          className={`mb-20 transition-all duration-700 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="flex justify-center mb-10">
            <div className="h-px w-full max-w-[600px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Identify", desc: "Enter candidate names and interviewer info to separate who gets scrubbed vs. preserved." },
              { step: "02", title: "Scrub", desc: "Our engine detects emails, phones, addresses, SSNs, URLs, and custom names automatically." },
              { step: "03", title: "Export", desc: "Review the redacted transcript, then copy or download the clean version to share." },
            ].map((s, i) => (
              <GlassCard key={s.step} className="rounded-2xl p-6 md:p-8 relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#6B5B95]/[0.06] to-transparent" />
                <div
                  className="text-[4rem] font-black text-white/[0.04] absolute top-2 right-4 leading-none"
                  style={{ animationDelay: `${i * 200}ms` }}
                >
                  {s.step}
                </div>
                <div className="relative">
                  <div className="text-[#8B7BB5] font-mono text-xs tracking-widest mb-3 uppercase">Step {s.step}</div>
                  <h3 className="text-white text-lg font-bold mb-2">{s.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            CANDIDATE vs INTERVIEWER PANELS
            ══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Candidate — SCRUB */}
          <GlassCard className="rounded-3xl p-6 md:p-8 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,51,51,0.08),transparent_55%)]" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF3333] scrub-pulse-dot" />
                <span className="text-[#FF3333] font-mono text-xs tracking-[0.15em] uppercase font-bold">
                  Candidate Info &mdash; Will Be Scrubbed
                </span>
              </div>
              <p className="text-white/40 text-sm mb-5">
                Add the candidate&apos;s name, email, phone, or any personal details to redact.
              </p>
              <div className="flex flex-col gap-2.5 mb-4">
                {candidateNames.map((n) => (
                  <div key={n.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={n.value}
                      onChange={(e) => updateEntry(setCandidateNames, n.id, e.target.value)}
                      placeholder="e.g. John Smith"
                      className="scrub-input flex-1"
                    />
                    {candidateNames.length > 1 && (
                      <button
                        onClick={() => removeEntry(setCandidateNames, n.id)}
                        className="text-white/30 hover:text-[#FF3333] transition-colors text-lg leading-none px-2"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => addEntry(setCandidateNames)}
                className="scrub-glass-button px-4 py-2 rounded-lg text-xs font-semibold text-[#FF3333]/80 hover:text-[#FF3333]"
              >
                + Add Name
              </button>
            </div>
          </GlassCard>

          {/* Interviewer — PRESERVE */}
          <GlassCard className="rounded-3xl p-6 md:p-8 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,255,148,0.06),transparent_55%)]" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00FF94] scrub-pulse-dot" />
                <span className="text-[#00FF94] font-mono text-xs tracking-[0.15em] uppercase font-bold">
                  Interviewer Info &mdash; Will Be Kept
                </span>
              </div>
              <p className="text-white/40 text-sm mb-5">
                Add interviewer names, emails, or other info that should NOT be redacted.
              </p>
              <div className="flex flex-col gap-2.5 mb-4">
                {interviewerNames.map((n) => (
                  <div key={n.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={n.value}
                      onChange={(e) => updateEntry(setInterviewerNames, n.id, e.target.value)}
                      placeholder="e.g. Sarah from Up Top"
                      className="scrub-input flex-1"
                    />
                    {interviewerNames.length > 1 && (
                      <button
                        onClick={() => removeEntry(setInterviewerNames, n.id)}
                        className="text-white/30 hover:text-[#FF3333] transition-colors text-lg leading-none px-2"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => addEntry(setInterviewerNames)}
                className="scrub-glass-button px-4 py-2 rounded-lg text-xs font-semibold text-[#00FF94]/80 hover:text-[#00FF94]"
              >
                + Add Name
              </button>
            </div>
          </GlassCard>
        </div>

        {/* ══════════════════════════════════════════════════════
            TRANSCRIPT INPUT
            ══════════════════════════════════════════════════════ */}
        <GlassCard className="rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(107,91,149,0.08),transparent_60%)]" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#8B7BB5] font-mono text-xs tracking-[0.15em] uppercase font-bold">
                Paste or Upload Transcript
              </span>
              <div className="flex gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.csv,.vtt,.srt,.doc,.rtf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="scrub-glass-button px-4 py-2 rounded-lg text-xs font-semibold text-white/50 hover:text-white"
                >
                  Upload File
                </button>
              </div>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={"Paste your interview transcript here...\n\nExample:\nSarah (Interviewer): Hi John, thanks for coming in today.\nJohn Smith: Sure! Reach me at john.smith@email.com or 555-123-4567.\n\nCandidate data gets scrubbed. Interviewer data stays intact."}
              className="scrub-textarea"
              rows={10}
            />
            {inputText.length > 0 && (
              <div className="text-white/25 text-xs font-mono mt-2">
                {inputText.length.toLocaleString()} characters
              </div>
            )}
          </div>
        </GlassCard>

        {/* ── Action Buttons ──────────────────────────────────── */}
        <div className="flex flex-wrap gap-4 mb-16 justify-center">
          <button
            onClick={handleScrub}
            disabled={!inputText.trim()}
            className="scrub-cta-button group disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Scrub Transcript
            </span>
          </button>
          {hasRun && (
            <button
              onClick={handleReset}
              className="scrub-glass-button px-8 py-3.5 rounded-2xl text-sm font-semibold text-white/50 hover:text-white"
            >
              Reset
            </button>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════
            RESULTS
            ══════════════════════════════════════════════════════ */}
        {hasRun && (
          <div className="scrub-fade-in">
            {/* Divider */}
            <div className="flex justify-center mb-16">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-[#6B5B95]/40 to-transparent" />
            </div>

            {/* Redaction Summary */}
            <GlassCard className="rounded-3xl p-6 md:p-10 mb-8 relative overflow-hidden" glow>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(107,91,149,0.12),transparent_50%)]" />
              <div className="relative">
                <h3 className="scrub-glow-text text-[#8B7BB5] font-mono text-xs tracking-[0.2em] uppercase font-bold mb-6">
                  Redaction Summary
                </h3>
                {redactions.length === 0 ? (
                  <p className="text-white/50 text-sm">
                    No personal information detected. The transcript appears clean &mdash; please review manually.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-3 mb-8">
                      {Object.entries(redactionSummary).map(([key, count]) => (
                        <div
                          key={key}
                          className="rounded-2xl border border-[#6B5B95]/25 bg-gradient-to-b from-[#6B5B95]/10 to-[#6B5B95]/5 px-5 py-3 text-center"
                        >
                          <div className="text-[0.6rem] text-white/40 uppercase tracking-widest font-mono mb-1">
                            {PATTERN_LABELS[key] || key}
                          </div>
                          <div className="text-xl font-bold text-[#8B7BB5]">{count}</div>
                        </div>
                      ))}
                      <div className="rounded-2xl border border-[#00FF94]/25 bg-gradient-to-b from-[#00FF94]/10 to-[#00FF94]/5 px-5 py-3 text-center">
                        <div className="text-[0.6rem] text-white/40 uppercase tracking-widest font-mono mb-1">
                          Total
                        </div>
                        <div className="text-xl font-bold text-[#00FF94]">{redactions.length}</div>
                      </div>
                    </div>

                    <details className="text-sm">
                      <summary className="cursor-pointer text-white/40 hover:text-white/70 transition-colors mb-4 font-mono text-xs tracking-wide">
                        View all redacted items ({redactions.length})
                      </summary>
                      <div className="rounded-2xl p-5 max-h-[250px] overflow-y-auto space-y-2 bg-black/30 border border-white/5">
                        {redactions.map((r, i) => (
                          <div key={i} className="flex items-center gap-3 text-xs">
                            <span className="font-mono px-2 py-0.5 rounded-md bg-[#6B5B95]/15 text-[#8B7BB5] uppercase tracking-wide font-bold text-[0.65rem]">
                              {PATTERN_LABELS[r.patternName] || r.patternName}
                            </span>
                            <span className="text-[#FF3333]/70 line-through">{r.original}</span>
                            <span className="text-white/20">&rarr;</span>
                            <span className="text-[#00FF94]/70">{r.replacement}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </>
                )}
              </div>
            </GlassCard>

            {/* Scrubbed Output */}
            <GlassCard className="rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#00FF94]/[0.03] to-transparent" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#00FF94] font-mono text-xs tracking-[0.15em] uppercase font-bold">
                    Scrubbed Transcript
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCopy}
                      className="scrub-glass-button px-4 py-2 rounded-lg text-xs font-semibold text-white/50 hover:text-white"
                    >
                      Copy
                    </button>
                    <button
                      onClick={handleDownload}
                      className="scrub-glass-button px-4 py-2 rounded-lg text-xs font-semibold text-[#00FF94]/70 hover:text-[#00FF94] border-[#00FF94]/20 hover:border-[#00FF94]/40"
                    >
                      Download .txt
                    </button>
                  </div>
                </div>
                <textarea
                  readOnly
                  value={scrubbedText}
                  className="scrub-textarea"
                  rows={10}
                />
              </div>
            </GlassCard>

            <p className="text-white/30 text-xs text-center leading-relaxed max-w-[600px] mx-auto">
              Please review the scrubbed transcript carefully. Automated scrubbing targets candidate
              data only &mdash; interviewer info is preserved. Add more candidate details above and re-run if needed.
            </p>
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────── */}
        <footer className="text-center mt-32 pb-16">
          <div className="flex justify-center mb-8">
            <div className="h-px w-48 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
          <div className="flex items-center justify-center gap-4 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Up Top Search" className="w-8 h-8 rounded-lg opacity-60" />
            <span className="text-white/30 text-xs font-semibold tracking-[0.2em] uppercase">
              Up Top Search
            </span>
          </div>
          <p className="text-white/20 text-[0.65rem] font-mono tracking-wide">
            Interview Transcript Privacy Scrubber
          </p>
        </footer>
      </div>
    </div>
  );
}
