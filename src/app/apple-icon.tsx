// App- und Messenger-Symbol (180 × 180). Gleiches Geschenk wie icon.svg, auf Rosa.
import { ImageResponse } from "next/og";
import { C } from "./_og/render";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: C.rosa }}>
        <svg width="132" height="132" viewBox="0 0 40 40">
          <rect x="4" y="15" width="32" height="22" rx="4" fill={C.pink} />
          <rect x="17" y="15" width="6" height="22" fill={C.gelb} />
          <rect x="4" y="21" width="32" height="5" fill={C.gelb} />
          <path d="M11 13l9-8.5 9 8.5" fill="none" stroke={C.pink} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    size,
  );
}
