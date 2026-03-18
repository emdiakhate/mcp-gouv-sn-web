"use client";

export default function SenegalFlag({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.67}
      viewBox="0 0 900 600"
      xmlns="http://www.w3.org/2000/svg"
      className="rounded-sm"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
    >
      <rect width="300" height="600" fill="#00853F" />
      <rect x="300" width="300" height="600" fill="#FDEF42" />
      <rect x="600" width="300" height="600" fill="#E31B23" />
      <polygon
        points="450,185 467,240 525,240 478,272 495,327 450,296 405,327 422,272 375,240 433,240"
        fill="#00853F"
      />
    </svg>
  );
}
