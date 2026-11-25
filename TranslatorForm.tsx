function printPdf() {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(
    `<html dir="${dirOf(target)}"><body style="font-family:sans-serif;white-space:pre-wrap;padding:32px;line-height:1.7">${esc(result.translation)}</body></html>`
  );
  w.document.close();
  w.print();
}
