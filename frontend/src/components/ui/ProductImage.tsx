"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductImage({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  const [failed, setFailed] = useState(false);
  return failed || !src ? (
    <span role="img" aria-label={alt} className="text-5xl">☕</span>
  ) : (
    <Image src={src} alt={alt} fill sizes={sizes} className="object-cover transition-transform duration-300 hover:scale-105" onError={() => setFailed(true)} />
  );
}
