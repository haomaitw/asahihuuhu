'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export function PageTransition() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 1000);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-paper-50 pointer-events-none animate-page-overlay"
      aria-hidden
    >
      <Image
        src="/asahi/logo-black.svg"
        alt=""
        width={140}
        height={64}
        className="animate-logo-breathe"
        priority
      />
    </div>
  );
}
