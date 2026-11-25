import { setRequestLocale, getTranslations } from "next-intl/server";
import TranslatorForm from "@/components/tool/TranslatorForm";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  const base = "https://wathaiqi.com";
  return {
    title: t("title"), description: t("desc"),
    alternates: {
      canonical: `${base}/${params.locale}`,
      languages: { ar: `${base}/ar`, fr: `${base}/fr`, en: `${base}/en`, "x-default": `${base}/fr` },
    },
  };
}

export default async function Home({
  params, searchParams,
}: { params: { locale: string }; searchParams: { type?: string; text?: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations("home");
  const ld = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    name: "Wathaiqi", applicationCategory: "BusinessApplication",
    operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "DZD" },
  };
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <header className="mx-auto max-w-3xl px-4 pt-8 text-center">
        <h1 className="text-2xl font-bold md:text-4xl">{t("h1")}</h1>
        <p className="mt-2 text-slate-600">{t("sub")}</p>
      </header>
      <TranslatorForm initial={{ docType: searchParams.type, text: searchParams.text }} />
    </main>
  );
}
