"use client";

import { useState } from "react";
import { QrCode } from "lucide-react";
import QRCode from "qrcode";

/** Downloads a print-ready PNG QR code for `url`. */
export default function QrDownload({ url, filename, label }: { url: string; filename: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  const download = async () => {
    setBusy(true);
    try {
      const href = await QRCode.toDataURL(url, { width: 1024, margin: 2, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } });
      const a = document.createElement("a");
      a.href = href;
      a.download = `${filename}.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  };
  return (
    <button
      type="button"
      disabled={busy}
      onClick={download}
      title={`Download QR (PNG): ${url}`}
      aria-label={`Download QR code for ${url}`}
      className={label ? "inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10" : "rounded-full p-2 hover:bg-white/10"}
    >
      <QrCode className="h-4 w-4" />
      {label}
    </button>
  );
}
