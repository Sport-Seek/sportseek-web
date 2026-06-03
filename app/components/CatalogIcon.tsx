"use client";
/* eslint-disable @next/next/no-img-element */

const getInitials = (label: string) =>
  label
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export const getCatalogIconSrc = (iconUrl?: string | null, logoSvg?: string | null) => {
  const trimmedIconUrl = iconUrl?.trim();
  if (trimmedIconUrl) {
    return trimmedIconUrl;
  }

  const trimmedLogoSvg = logoSvg?.trim();
  if (
    trimmedLogoSvg &&
    (trimmedLogoSvg.startsWith("<svg") ||
      (trimmedLogoSvg.startsWith("<?xml") && trimmedLogoSvg.includes("<svg")))
  ) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(trimmedLogoSvg)}`;
  }

  return null;
};

type Props = {
  accessibilityLabel: string;
  iconUrl?: string | null;
  logoSvg?: string | null;
  className?: string;
  size?: number;
};

export default function CatalogIcon({
  accessibilityLabel,
  iconUrl,
  logoSvg,
  className,
  size,
}: Props) {
  const src = getCatalogIconSrc(iconUrl, logoSvg);
  const initials = getInitials(accessibilityLabel || "Sport");
  const style = size ? { width: size, height: size } : undefined;
  const baseClassName = `inline-flex items-center justify-center ${className ?? ""}`.trim();

  if (src) {
    return (
      <span className={baseClassName} style={style}>
        <img
          src={src}
          alt={accessibilityLabel}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      </span>
    );
  }

  return (
    <span
      className={`${baseClassName} text-[10px] font-semibold uppercase`}
      style={style}
      aria-label={accessibilityLabel}
    >
      {initials}
    </span>
  );
}
