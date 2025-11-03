"use client";

import * as React from "react";
import Image from "next/image";

export function TopBar() {
  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-center border-b border-neutral-200 bg-surface shadow-sm px-6 py-3">
      <div className="flex items-center justify-center h-full">
        <Image
          src="/constructai.svg"
          alt="ConstructAI"
          width={300}
          height={56}
          className="h-full w-auto max-h-14"
          priority
          style={{ width: 'auto', height: '100%', maxHeight: '3.5rem' }}
        />
      </div>
    </header>
  );
}
