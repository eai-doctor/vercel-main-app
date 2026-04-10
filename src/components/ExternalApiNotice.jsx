import {  AlertIcon } from "@/components/ui/icons";

export default function ExternalApiNotice({ subject, service, onDismiss }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
          <AlertIcon className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-amber-800 mb-1">
            {subject} — Law 25 / PIPEDA
          </p>
          <p className="text-[12px] text-amber-700 leading-relaxed">
            This feature transmits your search query to an external server operated by{" "}
            <strong>{service}</strong>. Only search terms are sent. Do not enter any
            patient-identifying information (name, MRN, date of birth, etc.) in the
            search field. Query history may be retained by the external server.
          </p>
          <p className="text-[11px] text-amber-600 mt-1.5 font-semibold">
            ⚠ Do not enter patient names, MRNs, dates of birth, or any personal health
            information into the search field.
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-amber-400 hover:text-amber-600 text-[20px] leading-none shrink-0 mt-0.5"
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}