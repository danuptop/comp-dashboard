import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Pay Up — Compensation intelligence by Up Top Search";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const root = process.cwd();
  const [spectral, inter, interMedium, mark] = await Promise.all([
    readFile(join(root, "src/app/_fonts/Spectral-Regular.ttf")),
    readFile(join(root, "src/app/_fonts/Inter-Regular.ttf")),
    readFile(join(root, "src/app/_fonts/Inter-Medium.ttf")),
    readFile(join(root, "public/mark.png")),
  ]);
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#12110F",
          color: "#F3EEE6",
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <img src={markSrc} width={56} height={56} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Spectral", fontSize: 30, letterSpacing: 1 }}>Up Top Search</div>
            <div style={{ fontSize: 15, letterSpacing: 5, color: "#C4B5FD", fontWeight: 500 }}>PAY UP</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 15, letterSpacing: 5, color: "#C4B5FD", fontWeight: 500 }}>COMPENSATION INTELLIGENCE</div>
          <div style={{ fontFamily: "Spectral", fontSize: 76, lineHeight: 1.05, marginTop: 22, letterSpacing: -1.5, maxWidth: 1000 }}>
            What AI and crypto employers actually post.
          </div>
          <div style={{ width: 44, height: 1, background: "#C4B5FD", marginTop: 28 }} />
          <div style={{ fontSize: 24, color: "#A39B90", marginTop: 24, maxWidth: 900, lineHeight: 1.4 }}>
            Source-linked pay ranges, a labelled compensation model, and package math that keeps base, bonus, equity, and token value apart.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: "#7A7368" }}>
          <div>payup.uptopsearch.com</div>
          <div>Deep-tech talent agency · Since 2020</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Spectral", data: spectral, weight: 400, style: "normal" },
        { name: "Inter", data: inter, weight: 400, style: "normal" },
        { name: "Inter", data: interMedium, weight: 500, style: "normal" },
      ],
    },
  );
}
