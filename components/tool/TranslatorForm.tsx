"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { parseResult } from "@/lib/parse-result";

const DOC_TYPES = ["cv","motivation_letter","admin_request","university_doc","contract","technical"];
const LANGS = ["ar","fr","en"];
const TONES = ["formal","administrative","academic","professional"];
type Tab = "translation" | "notes" | "tips";

export default function TranslatorForm({ initial }: { initial?: { docType?: string; text?: string } }) {
  const t = useTranslations("tool");
  const uiLang = useLocale();
  const [docType, setDocType] = useState(initial?.docType ?? "cv");
  const [source, setSource] = useState("ar");
  const [target, setTarget] = useState("fr");
  const [tone, setTone] = useState("formal");
  const [text, setText] = useState(initial?.text ?? "");
  const [raw, setRaw] = useState("");
  const [tab, setTab] = useState<Tab>("translation");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const result = parseResult(raw);
  const dirOf = (l: string) => (l === "ar" ? "rtl" : "ltr");

  async function onFile(f?: File) {
    if (!f) return;
    setError("");
    const fd = new FormData(); fd.append("file", f);
    const r = await fetch("/api/extract", { method: "POST", body: fd });
    const j = await r.json();
    r.ok ? setText(j.text) : setError(t("errFile"));
  }

  async function run(mode: "TRANSLATE" | "TRANSLATE_AND_REFINE") {
    if (text.trim().length < 10) return setError(t("errShort"));
    if (source === target) return setError(t("errSame"));
    setError(""); setRaw(""); setTab("translation"); setLoading(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, source, target, uiLang, docType, tone, mode }),
      });
      if (res.status === 429) throw new Error(t("errLimit"));
      if (!res.ok || !res.body) throw new Error(t("errGeneric"));
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setRaw((p) => p + dec.decode(value, { stream: true }));
      }
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }

  async function copy() {
    await navigator.clipboard.writeText(result[tab]);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  async function download(format: "docx" | "pdf") {
    const r = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markdown: result.translation, format, lang: target }),
    });
    if (!r.ok) return setError(t("errGeneric"));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(await r.blob());
    a.download = `wathaiqi.${format}`; a.click();
  }

  const sel = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base";
  const Select = ({ v, set, opts, ns }: { v: string; set: (s: string) => void; opts: string[]; ns: string }) => (
    <select className={sel} value={v} onChange={(e) => set(e.target.value)}>
      {opts.map((o) => <option key={o} value={o}>{t(`${ns}.${o}`)}</option>)}
    </select>
  );

  return (
    <section className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <label className="space-y-1 text-sm font-medium">{t("docType")}
          <Select v={docType} set={setDocType} opts={DOC_TYPES} ns="docTypes" /></label>
        <label className="space-y-1 text-sm font-medium">{t("tone")}
          <Select v={tone} set={setTone} opts={TONES} ns="tones" /></label>
        <label className="space-y-1 text-sm font-medium">{t("from")}
          <Select v={source} set={setSource} opts={LANGS} ns="langs" /></label>
        <label className="space-y-1 text-sm font-medium">{t("to")}
          <Select v={target} set={setTarget} opts={LANGS} ns="langs" /></label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <textarea
            dir={dirOf(source)} value={text} maxLength={8000}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("placeholder")}
            className="h-72 w-full rounded-lg border border-slate-300 p-3 text-base"
          />
          <div className="flex items-center justify-between text-sm text-slate-500">
            <label className="cursor-pointer rounded-lg border border-dashed border-slate-400 px-3 py-2">
              {t("upload")}
              <input type="file" hidden accept=".pdf,.docx" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
            <span>{text.length}/8000</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex gap-1 overflow-x-auto">
            {(["translation", "notes", "tips"] as Tab[]).map((k) => (
              <button key={k} onClick={() => setTab(k)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm ${tab === k ? "bg-emerald-600 text-white" : "bg-slate-100"}`}>
                {t(`tabs.${k}`)}
              </button>
            ))}
          </div>
          <div dir={tab === "translation" ? dirOf(target) : dirOf(uiLang)}
               className="h-72 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-300 bg-slate-50 p-3">
            {result[tab] || (loading ? t("loading") : t("emptyResult"))}
          </div>
          {result.translation && !loading && (
            <div className="flex flex-wrap gap-2">
              <button onClick={copy} className="rounded-lg bg-slate-800 px-4 py-2 text-white">{copied ? "✓" : t("copy")}</button>
              <button onClick={() => download("docx")} className="rounded-lg border px-4 py-2">DOCX</button>
              <button onClick={() => download("pdf")} className="rounded-lg border px-4 py-2">PDF</button>
            </div>
          )}
        </div>
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button disabled={loading} onClick={() => run("TRANSLATE")}
          className="flex-1 rounded-lg bg-emerald-600 py-3 text-lg font-semibold text-white disabled:opacity-50">{t("translate")}</button>
        <button disabled={loading} onClick={() => run("TRANSLATE_AND_REFINE")}
          className="flex-1 rounded-lg bg-slate-900 py-3 text-lg font-semibold text-white disabled:opacity-50">{t("refine")}</button>
      </div>
      <p className="text-center text-xs text-slate-500">{t("disclaimer")}</p>
    </section>
  );
}
