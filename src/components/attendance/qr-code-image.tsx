"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrCodeImage({
  value,
  size = 288,
  label,
}: {
  value: string;
  size?: number;
  label: string;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setSrc(null);
    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      errorCorrectionLevel: "M",
    })
      .then((dataUrl) => {
        if (live) setSrc(dataUrl);
      })
      .catch(() => {
        if (live) setSrc(null);
      });
    return () => {
      live = false;
    };
  }, [value, size]);

  if (!src) {
    return <div style={{ width: size, height: size }} className="animate-pulse rounded-card bg-surface-blue/70" aria-hidden />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={label}
      width={size}
      height={size}
      className="rounded-card border border-surface-soft bg-white"
    />
  );
}
