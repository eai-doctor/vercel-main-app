import { X, Stethoscope } from "lucide-react";
import Fields from '../fields';

function LoginModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,18,40,0.72)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "modalIn 0.28s cubic-bezier(.22,1,.36,1) both" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#2C3B8D,#277cc4,#0ba9ea)" }} />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors rounded-full p-1 hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="px-8 pb-8 pt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#2C3B8D,#277cc4)" }}>
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Clinician Portal</p>
          </div>
          <Fields />
        </div>
      </div>
    </div>
  );
}

export default LoginModal;