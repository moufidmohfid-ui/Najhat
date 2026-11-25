// lib/prompts/doc-types.ts

export const DOC_TYPE_RULES: Record<string, string> = {
  cv: `
- Target French/English: European CV style, reverse chronological, action
  verbs, no full sentences with "I", no photo/age/marital status unless
  in the source.
- Standard section names: Expérience professionnelle, Formation,
  Compétences, Langues, Centres d'intérêt.
- Algerian degrees: Licence, Master, Ingénieur d'État, Doctorat,
  Baccalauréat (keep the stream: Sciences expérimentales, etc.).
- Keep job titles accurate; do not upgrade seniority.`,

  motivation_letter: `
- French format: sender block, recipient block, place and date, "Objet :",
  salutation (Madame, Monsieur,), 3-4 paragraphs (hook, profile,
  motivation for this company, closing), formula de politesse.
- English: cover letter, "Dear Hiring Manager,", "Yours sincerely,".
- Arabic: formal letter with basmala-free professional opening,
  "الموضوع:", "تحية طيبة وبعد،", closing "وتقبلوا فائق الاحترام والتقدير".`,

  admin_request: `
- Use rigid official formulas. French: "Objet : Demande de ...",
  "J'ai l'honneur de solliciter de votre bienveillance...",
  "Veuillez agréer, Madame, Monsieur, l'expression de mes salutations
  distinguées."
- Arabic: "الموضوع: طلب ..."، "يشرفني أن أتقدم إلى سيادتكم..."،
  keep reference numbers and file numbers exactly.`,

  university_doc: `
- Transcripts, certificates, attestations: keep every course name,
  credit (ECTS/coefficient), grade and mention exactly.
- Grading: keep original scale (e.g. 14.50/20) and add the scale in
  notes if absent. Never convert grades.
- Mentions: Passable, Assez bien, Bien, Très bien.`,

  contract: `
- Legal precision over style. Preserve clause numbering and defined
  terms consistently throughout.
- Do not simplify legal wording. Flag ambiguous clauses in notes.
- Add note: legal documents may require a sworn translation.`,

  technical: `
- Preserve units, part numbers, codes, formulas and tables unchanged.
- Use consistent ISO/industry terminology; do not translate code or
  command names. Keep abbreviations, expand on first use if standard.`,
};
