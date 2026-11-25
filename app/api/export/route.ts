import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
export const runtime = "nodejs";

function runs(line: string, rtl: boolean) {
  return line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((p) =>
    p.startsWith("**")
      ? new TextRun({ text: p.slice(2, -2), bold: true, rightToLeft: rtl })
      : new TextRun({ text: p, rightToLeft: rtl })
  );
}

export async function POST(req: Request) {
  const { markdown, format, lang } = await req.json().catch(() => ({}));
  if (format !== "docx" || typeof markdown !== "string" || markdown.length > 20000)
    return Response.json({ error: "invalid" }, { status: 400 });

  const rtl = lang === "ar";
  const children = markdown.split("\n").map((raw: string) => {
    const l = raw.trimEnd();
    if (l.startsWith("## ")) return new Paragraph({ heading: HeadingLevel.HEADING_2, bidirectional: rtl, children: runs(l.slice(3), rtl) });
    if (l.startsWith("# ")) return new Paragraph({ heading: HeadingLevel.HEADING_1, bidirectional: rtl, children: runs(l.slice(2), rtl) });
    if (/^[-*] /.test(l)) return new Paragraph({ bullet: { level: 0 }, bidirectional: rtl, children: runs(l.slice(2), rtl) });
    return new Paragraph({ bidirectional: rtl, children: runs(l, rtl) });
  });

  const buf = await Packer.toBuffer(new Document({ sections: [{ children }] }));
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": 'attachment; filename="wathaiqi.docx"',
    },
  });
}
