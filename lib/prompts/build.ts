// lib/prompts/build.ts
import { BASE_SYSTEM_PROMPT } from "./system";
import { DOC_TYPE_RULES } from "./doc-types";
import { GLOSSARY_DZ } from "./glossary-dz";

export function buildSystemPrompt(p: {
  docType: keyof typeof DOC_TYPE_RULES;
  tone: "formal" | "administrative" | "academic" | "professional";
  mode: "TRANSLATE" | "TRANSLATE_AND_REFINE";
}) {
  return [
    BASE_SYSTEM_PROMPT,
    `# DOCUMENT TYPE RULES (${p.docType})\n${DOC_TYPE_RULES[p.docType]}`,
    GLOSSARY_DZ,
    `# CURRENT REQUEST SETTINGS\ntone: ${p.tone}\nmode: ${p.mode}`,
  ].join("\n\n");
}

export function buildUserMessage(p: {
  text: string; source: string; target: string; uiLang: string;
}) {
  return `source_lang: ${p.source}
target_lang: ${p.target}
ui_lang: ${p.uiLang}

<document>
${p.text}
</document>`;
}
