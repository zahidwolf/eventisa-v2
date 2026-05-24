import QRCode from "qrcode";

export async function qrDataToImageSrc(qrData: string): Promise<string> {
  if (!qrData) return "";
  if (qrData.startsWith("data:image")) return qrData;
  return QRCode.toDataURL(qrData, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 280,
  });
}
