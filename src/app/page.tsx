"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      router.replace("/reset-password" + hash);
      return;
    }
    if (hash && hash.includes("error=")) {
      router.replace("/reset-password" + hash);
      return;
    }
    router.replace("/landing");
  }, []);

  return null;
}
