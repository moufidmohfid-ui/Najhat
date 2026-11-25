export function parseResult(raw: string) {
  const grab = (n: number) =>
    raw.match(new RegExp(`## ${n}\\.[^\\n]*\\n([\\s\\S]*?)(?=\\n## [123]\\.|$)`))?.[1].trim() ?? "";
  return { translation: grab(1), notes: grab(2), tips: grab(3) };
}
