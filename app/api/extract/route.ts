import mammoth from "mammoth";
import pdf from "pdf-parse";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const file = (await req.formData()).get("file") as File | null;
  if (!file || file.size > 5 * 1024 * 1024)
    return Response.json({ error: "size" }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer()); // في الذاكرة فقط
  const name = file.name.toLowerCase();
  let text = "";
  if (name.endsWith(".pdf")) text = (await pdf(buf)).text;
  else if (name.endsWith(".docx")) text = (await mammoth.extractRawText({ buffer: buf })).value;
  else return Response.json({ error: "type" }, { status: 400 });
  return Response.json({ text: text.trim() });
}
