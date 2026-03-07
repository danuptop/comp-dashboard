"use client";

import { useState, useCallback, useRef } from "react";

/* ══════════════════════════════════════════════════════════════════
   TRANSCRIPT PRIVACY SCRUBBER
   Client-side PII removal tool — no data ever leaves the browser.
   ══════════════════════════════════════════════════════════════════ */

// PII patterns to detect and scrub
const PII_PATTERNS: { name: string; pattern: RegExp; replacement: string }[] = [
  // Email addresses
  { name: "email", pattern: /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g, replacement: "[EMAIL REDACTED]" },
  // Phone numbers (various formats)
  { name: "phone", pattern: /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, replacement: "[PHONE REDACTED]" },
  // SSN
  { name: "ssn", pattern: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g, replacement: "[SSN REDACTED]" },
  // URLs
  { name: "url", pattern: /https?:\/\/[^\s,)]+/g, replacement: "[URL REDACTED]" },
  // LinkedIn / social media profile URLs (without http)
  { name: "social", pattern: /\b(?:linkedin\.com|twitter\.com|x\.com|facebook\.com|instagram\.com|github\.com)\/[^\s,)]+/gi, replacement: "[SOCIAL PROFILE REDACTED]" },
  // Social media handles
  { name: "handle", pattern: /(?:^|\s)@[A-Za-z0-9_]{2,30}\b/g, replacement: " [HANDLE REDACTED]" },
  // Dates of birth patterns (MM/DD/YYYY, DD-MM-YYYY, etc.)
  { name: "dob", pattern: /\b(?:0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])[\/\-](?:19|20)\d{2}\b/g, replacement: "[DATE REDACTED]" },
  // Street addresses (number + street name)
  { name: "address", pattern: /\b\d{1,5}\s+(?:[A-Z][a-z]+\s?){1,4}(?:Street|St|Avenue|Ave|Boulevard|Blvd|Drive|Dr|Lane|Ln|Road|Rd|Court|Ct|Way|Place|Pl|Circle|Cir)\b\.?/gi, replacement: "[ADDRESS REDACTED]" },
  // ZIP codes (US)
  { name: "zip", pattern: /\b\d{5}(?:-\d{4})?\b/g, replacement: "[ZIP REDACTED]" },
  // Credit card numbers
  { name: "cc", pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, replacement: "[CARD NUMBER REDACTED]" },
  // IP addresses
  { name: "ip", pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, replacement: "[IP REDACTED]" },
];

type RedactionEntry = {
  original: string;
  replacement: string;
  patternName: string;
  index: number;
};

type CustomName = { id: number; value: string };

function scrubTranscript(
  text: string,
  customNames: string[]
): { scrubbed: string; redactions: RedactionEntry[] } {
  const redactions: RedactionEntry[] = [];
  let result = text;

  // First pass: custom names (case-insensitive whole word)
  for (const name of customNames) {
    if (!name.trim()) continue;
    const escaped = name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const namePattern = new RegExp(`\\b${escaped}\\b`, "gi");
    result = result.replace(namePattern, (match, offset) => {
      const replacement = "[NAME REDACTED]";
      redactions.push({ original: match, replacement, patternName: "custom_name", index: offset });
      return replacement;
    });
  }

  // Second pass: regex patterns
  for (const { name, pattern, replacement } of PII_PATTERNS) {
    // Reset the regex lastIndex
    const freshPattern = new RegExp(pattern.source, pattern.flags);
    result = result.replace(freshPattern, (match, ...args) => {
      const offset = typeof args[args.length - 2] === "number" ? args[args.length - 2] : 0;
      redactions.push({ original: match, replacement, patternName: name, index: offset });
      return replacement;
    });
  }

  return { scrubbed: result, redactions };
}

export default function ScrubberPage() {
  const [inputText, setInputText] = useState("");
  const [scrubbedText, setScrubbedText] = useState("");
  const [redactions, setRedactions] = useState<RedactionEntry[]>([]);
  const [customNames, setCustomNames] = useState<CustomName[]>([{ id: 1, value: "" }]);
  const [hasRun, setHasRun] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nextNameId = useRef(2);

  const handleScrub = useCallback(() => {
    const names = customNames.map((n) => n.value).filter(Boolean);
    const { scrubbed, redactions: r } = scrubTranscript(inputText, names);
    setScrubbedText(scrubbed);
    setRedactions(r);
    setHasRun(true);
  }, [inputText, customNames]);

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

  const addNameField = () => {
    setCustomNames((prev) => [...prev, { id: nextNameId.current++, value: "" }]);
  };

  const removeNameField = (id: number) => {
    setCustomNames((prev) => (prev.length <= 1 ? prev : prev.filter((n) => n.id !== id)));
  };

  const updateNameField = (id: number, value: string) => {
    setCustomNames((prev) => prev.map((n) => (n.id === id ? { ...n, value } : n)));
  };

  const handleReset = () => {
    setInputText("");
    setScrubbedText("");
    setRedactions([]);
    setHasRun(false);
    setCustomNames([{ id: 1, value: "" }]);
  };

  const redactionSummary = redactions.reduce<Record<string, number>>((acc, r) => {
    acc[r.patternName] = (acc[r.patternName] || 0) + 1;
    return acc;
  }, {});

  const PATTERN_LABELS: Record<string, string> = {
    custom_name: "Names",
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
    <div className="max-w-[1100px] mx-auto px-8 md:px-16 py-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <a href="/" className="text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors text-sm">
          &larr; Back
        </a>
      </div>

      <h1
        className="text-[2.4rem] md:text-[3rem] font-black tracking-tight mb-4"
        style={{
          background: "linear-gradient(135deg, #7C5CFC, #B388FF)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Transcript Privacy Scrubber
      </h1>
      <p className="text-[var(--text-dim)] text-[1.05rem] mb-8 max-w-[700px] leading-relaxed">
        Remove personal data from your interview transcripts before sharing.
        Everything runs locally in your browser &mdash; <strong className="text-[var(--text)]">no data is ever sent to any server</strong>.
      </p>

      {/* Privacy Policy Toggle */}
      <button
        onClick={() => setShowPolicy(!showPolicy)}
        className="mb-10 px-5 py-3 rounded-xl text-[0.85rem] font-semibold transition-all"
        style={{
          background: showPolicy ? "rgba(124,92,252,0.2)" : "var(--card)",
          border: showPolicy ? "1px solid var(--accent)" : "1px solid var(--card-border)",
          color: showPolicy ? "var(--accent)" : "var(--text-dim)",
        }}
      >
        {showPolicy ? "Hide" : "View"} Data Privacy Policy
      </button>

      {showPolicy && (
        <div
          className="rounded-2xl p-10 mb-12"
          style={{
            background: "linear-gradient(135deg, rgba(85,52,167,0.2), rgba(124,92,252,0.08))",
            border: "1px solid var(--purple)",
          }}
        >
          <h2 className="text-[1.2rem] font-bold mb-6">Our Data Privacy Commitment</h2>
          <p className="text-[var(--text-dim)] text-[0.92rem] mb-5">
            We are 100% committed to the following data privacy policy:
          </p>
          <ul className="space-y-3 text-[0.92rem]">
            {[
              "All personal data will be scrubbed before we feed it to the LLM",
              "No personal data will be processed in the building of the coach",
              "No personal data will be saved to any internal databases",
              "No personal data will be shared with anyone outside of the Up Top organization",
              "All transcripts will be deleted upon completion of the project",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-[var(--green)] mt-0.5 font-bold">&#10003;</span>
                <span className="italic text-[var(--text)]">{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-[var(--text-dim)] text-[0.82rem] mt-8 leading-relaxed">
            This tool lets you verify and scrub transcripts yourself before uploading.
            It runs entirely in your browser &mdash; zero data leaves your device.
          </p>
        </div>
      )}

      {/* Security Badge */}
      <div
        className="flex items-center gap-4 rounded-xl px-6 py-4 mb-12"
        style={{
          background: "rgba(16,185,129,0.08)",
          border: "1px solid rgba(16,185,129,0.25)",
        }}
      >
        <div className="text-[1.4rem]">&#128274;</div>
        <div>
          <div className="text-[0.82rem] font-bold text-[var(--green)]">100% Client-Side Processing</div>
          <div className="text-[0.75rem] text-[var(--text-dim)]">
            Your transcript never leaves this page. All scrubbing happens in your browser using JavaScript. No network requests are made.
          </div>
        </div>
      </div>

      {/* Custom Names */}
      <div className="mb-8">
        <label className="block text-[0.75rem] font-bold uppercase tracking-[1.5px] text-[var(--text-dim)] mb-3">
          Names to Redact
        </label>
        <p className="text-[var(--text-dim)] text-[0.82rem] mb-4">
          Add the names of people mentioned in the transcript (interviewee, interviewer, references, etc.)
        </p>
        <div className="flex flex-wrap gap-3 mb-3">
          {customNames.map((n) => (
            <div key={n.id} className="flex items-center gap-2">
              <input
                type="text"
                value={n.value}
                onChange={(e) => updateNameField(n.id, e.target.value)}
                placeholder="e.g. John Smith"
                className="scrubber-input w-[200px]"
              />
              {customNames.length > 1 && (
                <button
                  onClick={() => removeNameField(n.id)}
                  className="text-[var(--text-dim)] hover:text-[var(--red)] transition-colors text-lg leading-none px-1"
                  title="Remove"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addNameField}
            className="px-4 py-2 rounded-lg text-[0.82rem] font-semibold transition-all"
            style={{
              background: "rgba(124,92,252,0.12)",
              border: "1px solid rgba(124,92,252,0.3)",
              color: "var(--accent)",
            }}
          >
            + Add Name
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-[0.75rem] font-bold uppercase tracking-[1.5px] text-[var(--text-dim)]">
            Paste or Upload Transcript
          </label>
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
              className="px-4 py-2 rounded-lg text-[0.78rem] font-semibold transition-all"
              style={{
                background: "var(--card)",
                border: "1px solid var(--card-border)",
                color: "var(--text-dim)",
              }}
            >
              Upload File
            </button>
          </div>
        </div>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={"Paste your interview transcript here...\n\nExample:\nInterviewer: Hi John, thanks for coming in today. Can you tell me about your experience at Acme Corp?\nJohn Smith: Sure! I've been working there since 2019. You can reach me at john.smith@email.com or 555-123-4567."}
          className="scrubber-textarea"
          rows={12}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[0.72rem] text-[var(--text-dim)]">
            {inputText.length > 0 ? `${inputText.length.toLocaleString()} characters` : ""}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-12">
        <button
          onClick={handleScrub}
          disabled={!inputText.trim()}
          className="px-8 py-3.5 rounded-xl text-[0.92rem] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: inputText.trim() ? "linear-gradient(135deg, #5534A7, #7C5CFC)" : "var(--card)",
            border: "1px solid var(--accent)",
            color: "#fff",
          }}
        >
          Scrub Transcript
        </button>
        {hasRun && (
          <button
            onClick={handleReset}
            className="px-6 py-3.5 rounded-xl text-[0.92rem] font-semibold transition-all"
            style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              color: "var(--text-dim)",
            }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Results */}
      {hasRun && (
        <div className="fade-in">
          {/* Redaction Summary */}
          <div
            className="rounded-2xl p-8 mb-8"
            style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
            }}
          >
            <h3 className="text-[0.82rem] font-bold uppercase tracking-[1.5px] text-[var(--accent)] mb-5">
              Redaction Summary
            </h3>
            {redactions.length === 0 ? (
              <p className="text-[var(--text-dim)] text-[0.88rem]">
                No personal information detected. The transcript appears clean, but please review it manually to be sure.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-3 mb-5">
                  {Object.entries(redactionSummary).map(([key, count]) => (
                    <div
                      key={key}
                      className="px-4 py-2 rounded-xl text-center"
                      style={{
                        background: "rgba(124,92,252,0.12)",
                        border: "1px solid rgba(124,92,252,0.25)",
                      }}
                    >
                      <div className="text-[0.62rem] text-[var(--text-dim)] uppercase tracking-[1px]">
                        {PATTERN_LABELS[key] || key}
                      </div>
                      <div className="text-[1.1rem] font-bold text-[var(--accent)]">{count}</div>
                    </div>
                  ))}
                  <div
                    className="px-4 py-2 rounded-xl text-center"
                    style={{
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.3)",
                    }}
                  >
                    <div className="text-[0.62rem] text-[var(--text-dim)] uppercase tracking-[1px]">
                      Total
                    </div>
                    <div className="text-[1.1rem] font-bold text-[var(--green)]">{redactions.length}</div>
                  </div>
                </div>

                {/* Redaction details */}
                <details className="text-[0.82rem]">
                  <summary className="cursor-pointer text-[var(--text-dim)] hover:text-[var(--text)] transition-colors mb-3">
                    View all redacted items ({redactions.length})
                  </summary>
                  <div
                    className="rounded-lg p-4 max-h-[200px] overflow-y-auto space-y-1.5"
                    style={{ background: "rgba(13,11,20,0.5)" }}
                  >
                    {redactions.map((r, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span
                          className="text-[0.7rem] px-2 py-0.5 rounded font-semibold uppercase"
                          style={{
                            background: "rgba(124,92,252,0.15)",
                            color: "var(--accent)",
                          }}
                        >
                          {PATTERN_LABELS[r.patternName] || r.patternName}
                        </span>
                        <span className="text-[var(--red)] line-through">{r.original}</span>
                        <span className="text-[var(--text-dim)]">&rarr;</span>
                        <span className="text-[var(--green)]">{r.replacement}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </>
            )}
          </div>

          {/* Scrubbed Output */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-[0.75rem] font-bold uppercase tracking-[1.5px] text-[var(--text-dim)]">
                Scrubbed Transcript
              </label>
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-lg text-[0.78rem] font-semibold transition-all"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--card-border)",
                    color: "var(--text-dim)",
                  }}
                >
                  Copy
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-lg text-[0.78rem] font-semibold transition-all"
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    border: "1px solid rgba(16,185,129,0.3)",
                    color: "var(--green)",
                  }}
                >
                  Download .txt
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={scrubbedText}
              className="scrubber-textarea"
              rows={12}
            />
          </div>

          <p className="text-[var(--text-dim)] text-[0.78rem] leading-relaxed">
            Please review the scrubbed transcript carefully before sharing. Automated scrubbing may miss
            context-specific personal information like nicknames, project names, or company-internal references.
            You can add additional names above and re-run the scrubber.
          </p>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center mt-24 pb-12">
        <div className="flex items-center justify-center gap-4 mb-4">
          <img src="/logo.png" alt="Up Top Search" className="w-10 h-10 rounded-lg" />
          <span className="text-[var(--text-dim)] text-sm font-semibold tracking-wide uppercase">
            Up Top Search
          </span>
        </div>
        <p className="text-[var(--text-dim)] text-xs">
          Interview Transcript Privacy Scrubber
        </p>
      </footer>
    </div>
  );
}
