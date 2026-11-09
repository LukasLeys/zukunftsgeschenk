import QRCode from "qrcode";

export async function qrSvg(text: string, opts: { margin?: number; color?: string } = {}) {
  return QRCode.toString(text, { type: "svg", errorCorrectionLevel: "M", margin: opts.margin ?? 1, color: { dark: opts.color ?? "#2a1f2d", light: "#ffffff" } });
}
export async function qrPng(text: string, width = 480) {
  return QRCode.toBuffer(text, { type: "png", errorCorrectionLevel: "M", margin: 2, width });
}
export function qrMatrix(text: string) {
  const q = QRCode.create(text, { errorCorrectionLevel: "M" });
  return { size: q.modules.size, get: (x: number, y: number) => q.modules.get(y, x) === 1 };
}
