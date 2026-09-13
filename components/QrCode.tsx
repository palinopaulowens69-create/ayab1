'use client';

import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';

export function QrCode({ value, size = 220 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: { dark: '#1B1A1E', light: '#FFFFFF' },
    }).catch(() => setError(true));
  }, [value, size]);

  if (error) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed border-line text-[13px] text-ink/50"
        style={{ width: size, height: size }}
      >
        Couldn&apos;t render QR code
      </div>
    );
  }

  return <canvas ref={canvasRef} width={size} height={size} className="rounded-lg" />;
}
