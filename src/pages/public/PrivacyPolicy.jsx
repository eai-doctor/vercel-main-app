import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components";
import { Printer, ArrowLeft, FileText, Download, Shield, FileSearch } from "lucide-react";

const DOCUMENTS = [
  {
    key: "pia",
    filename: "PIA.pdf",
    icon: FileSearch,
    color: "#2C3B8D",
    bgColor: "#EEF0FA",
  },
  {
    key: "breach",
    filename: "PRIVACY_INCIDENT_BREACH_RESPONSE_POLICY.pdf",
    icon: Shield,
    color: "#0F6E56",
    bgColor: "#E1F5EE",
  },
  {
    key: "policy",
    filename: "PRIVACY_POLICY.pdf",
    icon: FileText,
    color: "#993C1D",
    bgColor: "#FAECE7",
  },
];

function DocumentCard({ doc, t }) {
  const Icon = doc.icon;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `/${doc.filename}`;
    link.download = doc.filename;
    link.click();
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {/* Icon Badge */}
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: doc.bgColor }}
        >
          <Icon size={20} style={{ color: doc.color }} />
        </div>

        {/* Text */}
        <div>
          <p className="font-medium text-[#1e293b] text-sm leading-snug">
            {t(`documents.${doc.key}.title`)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {t(`documents.${doc.key}.desc`)}
          </p>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors flex-shrink-0 ml-4"
      >
        <Download size={13} />
        {t("documents.downloadBtn")}
      </button>
    </div>
  );
}

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
          <h1 className="text-3xl font-semibold text-[#1e293b]">{t("title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("subtitle")}</p>
        </div>

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
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2C3B8D] hover:bg-[#1f2a63] text-white font-medium transition-colors"
          >
            <Printer size={16} />
            {t("download")}
          </button>
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="max-w-4xl mx-auto px-6 pb-16 space-y-10">

        {/* ...existing sections... */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("summary.title")}</h2>
          <p>{t("summary.body")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("scope.title")}</h2>
          <ul className="list-disc pl-6 space-y-2">
            {t("scope.items", { returnObjects: true }).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("purpose.title")}</h2>
          <ul className="list-disc pl-6 space-y-2">
            {t("purpose.items", { returnObjects: true }).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("ai.title")}</h2>
          <p>{t("ai.body")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("thirdParty.title")}</h2>
          <ul className="list-disc pl-6 space-y-2">
            {t("thirdParty.items", { returnObjects: true }).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("rights.title")}</h2>
          <ul className="list-disc pl-6 space-y-2">
            {t("rights.items", { returnObjects: true }).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">{t("officer.title")}</h2>
          <p><strong>{t("officer.nameLabel")}:</strong> {t("officer.name")}</p>
          <p><strong>{t("officer.emailLabel")}:</strong> {t("officer.email")}</p>
        </section>

        {/* ✅ Security Documents Section */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-[#1e293b]">
              {t("documents.title")}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {t("documents.subtitle")}
            </p>
          </div>

          <div className="space-y-3">
            {DOCUMENTS.map((doc) => (
              <DocumentCard key={doc.key} doc={doc} t={t} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}