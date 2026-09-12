import Image from "next/image";

/** Purple squircle mark — public/mark.png, provenance in public/BRAND-ASSETS.md. */
export function Mark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return <Image src="/mark.png" alt="" width={size} height={size} className={className} priority />;
}
