"use client";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const SIZES = {
  sm: 32,
  md: 48,
  lg: 72,
};

export function RunClubLogo({ size = "md", showText = true }: LogoProps) {
  const px = SIZES[size];
  return (
    <div className="flex flex-col items-center gap-1">
      <Image
        src="/logo.svg"
        alt="RunClub Panama"
        width={px}
        height={Math.round(px * 1.32)}
        priority
      />
      {showText && (
        <span
          className="font-normal tracking-wide text-white"
          style={{ fontSize: size === "lg" ? 18 : size === "md" ? 14 : 11 }}
        >
          Panamá
        </span>
      )}
    </div>
  );
}
