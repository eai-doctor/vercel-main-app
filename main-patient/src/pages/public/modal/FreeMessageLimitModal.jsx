import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AiIcon, CheckCircleIcon, XCircleIcon } from '@/components/ui/icons';
import { useAuthModal } from '@/context/AuthModalContext';

export default function FreeMessageLimitModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();

  if (!isOpen) return null;

  const benefits = [
    'Unlimited health consultations',
    'Save your consultation history',
    'Upload and analyze lab reports',
    'AI-generated health summaries',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">

        {/* Header */}
        <div className="relative bg-[#2C3B8D] px-6 pt-8 pb-10 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center
              rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <XCircleIcon className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
            <AiIcon className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-[22px] font-bold text-white mb-1">
            You've used your free messages
          </h2>
          <p className="text-white/60 text-[13px]">
            Sign in to continue your health consultation
          </p>

          {/* Wave bottom */}
          <div className="absolute -bottom-px left-0 right-0">
            <svg viewBox="0 0 400 20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-5 fill-white">
              <path d="M0,10 C100,20 300,0 400,10 L400,20 L0,20 Z" />
            </svg>
          </div>
        </div>

        {/* Benefits */}
        <div className="px-6 pt-6 pb-2">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-400 mb-3">
            What you get with a free account
          </p>
          <ul className="space-y-2.5">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#eef2ff] flex items-center justify-center shrink-0">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-[#2C3B8D]" />
                </div>
                <span className="text-[13px] text-slate-700">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-2.5">
          <button
            onClick={() => { onClose(); openLogin({ step: "register" }); }}
            className="w-full py-3 rounded-xl bg-[#2C3B8D] hover:bg-[#233070] text-white
              text-[14px] font-semibold transition-colors"
          >
            Create Free Account
          </button>
          <button
            onClick={() => { onClose(); openLogin(); }}
            className="w-full py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700
              border border-slate-200 text-[14px] font-semibold transition-colors"
          >
            Sign In
          </button>
          <p className="text-center text-[11px] text-slate-400 pt-1">
            No credit card required · Free forever
          </p>
        </div>

      </div>
    </div>
  );
}