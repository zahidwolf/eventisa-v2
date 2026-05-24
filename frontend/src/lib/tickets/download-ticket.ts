/** Download a QR / image data URL as a PNG file. */
export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/** Open the browser print dialog (user can save as PDF). */
export function printTicketElement(element: HTMLElement) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=480,height=720");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Ticket</title>
        <style>
          body { font-family: system-ui, sans-serif; margin: 24px; color: #111; }
          img { display: block; margin: 16px auto; max-width: 280px; }
          h1 { font-size: 1.25rem; margin: 0 0 8px; }
          p { margin: 4px 0; font-size: 14px; color: #444; }
        </style>
      </head>
      <body>${element.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
