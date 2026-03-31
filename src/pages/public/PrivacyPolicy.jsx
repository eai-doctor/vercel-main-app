import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components";
import { Printer, ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  const { t } = useTranslation("privacy");
  const contentRef = useRef(null);

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      <Header />

      {/* Top Section */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-6 flex items-center justify-between">
        
        <div>
          <h1 className="text-3xl font-semibold text-[#1e293b]">
            {t("title")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("subtitle")}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">

          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={16} />
            {t("back")}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg 
            bg-[#2C3B8D] hover:bg-[#1f2a63] text-white 
            font-medium transition-colors"
          >
            <Printer size={16} />
            {t("download")}
          </button>

        </div>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="max-w-4xl mx-auto px-6 pb-16 space-y-10"
      >

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {t("summary.title")}
          </h2>
          <p>{t("summary.body")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {t("scope.title")}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            {t("scope.items", { returnObjects: true }).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {t("purpose.title")}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            {t("purpose.items", { returnObjects: true }).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {t("ai.title")}
          </h2>
          <p>{t("ai.body")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {t("thirdParty.title")}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            {t("thirdParty.items", { returnObjects: true }).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {t("rights.title")}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            {t("rights.items", { returnObjects: true }).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">
            {t("officer.title")}
          </h2>
          <p><strong>{t("officer.nameLabel")}:</strong> {t("officer.name")}</p>
          <p><strong>{t("officer.emailLabel")}:</strong> {t("officer.email")}</p>
        </section>

      </div>
    </div>
  );
}