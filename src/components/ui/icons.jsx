import React from "react";

// All icons follow IT web template style:
// viewBox="0 0 48 48", fill="none", stroke="currentColor", strokeWidth="1.5"
// Clean medical-grade line art

export function HospitalIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="8" y="12" width="32" height="28" rx="2" />
      <path d="M18 12V8h12v4" />
      <path d="M24 22v8M20 26h8" />
      <path d="M16 40v-8h6v8M26 40v-8h6v8" />
    </svg>
  );
}

export function UserIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="24" cy="16" r="8" />
      <path d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16" />
    </svg>
  );
}

export function StethoscopeIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 8v12a10 10 0 0020 0V8" />
      <circle cx="34" cy="30" r="4" />
      <path d="M34 34v4a8 8 0 01-16 0v-2" />
      <line x1="10" y1="8" x2="18" y2="8" />
      <line x1="30" y1="8" x2="38" y2="8" />
    </svg>
  );
}

export function BooksIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="6" y="28" width="36" height="8" rx="1" />
      <rect x="8" y="20" width="32" height="8" rx="1" />
      <rect x="10" y="12" width="28" height="8" rx="1" />
    </svg>
  );
}

export function SettingsIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="24" cy="24" r="8" />
      <path d="M24 4v6M24 38v6M4 24h6M38 24h6M10.1 10.1l4.2 4.2M33.7 33.7l4.2 4.2M37.9 10.1l-4.2 4.2M14.3 33.7l-4.2 4.2" />
    </svg>
  );
}

export function ChatIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 10h32a2 2 0 012 2v20a2 2 0 01-2 2H16l-8 6V12a2 2 0 012-2z" />
      <path d="M16 20h16M16 26h10" strokeLinecap="round" />
    </svg>
  );
}

export function DnaIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16 6c0 10 16 10 16 20s-16 10-16 20" />
      <path d="M32 6c0 10-16 10-16 20s16 10 16 20" />
      <line x1="14" y1="16" x2="34" y2="16" />
      <line x1="14" y1="32" x2="34" y2="32" />
      <line x1="16" y1="24" x2="32" y2="24" />
    </svg>
  );
}

export function AlertIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Shield shape */}
      <path d="M24 4L8 12v12c0 10.5 6.8 20.3 16 24 9.2-3.7 16-13.5 16-24V12L24 4z" strokeLinejoin="round" />
      {/* Medical cross */}
      <path d="M24 17v14M17 24h14" strokeLinecap="round" />
    </svg>
  );
}

export function MicrophoneIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="16" y="6" width="16" height="24" rx="8" />
      <path d="M10 24a14 14 0 0028 0" />
      <line x1="24" y1="38" x2="24" y2="44" />
      <line x1="16" y1="44" x2="32" y2="44" strokeLinecap="round" />
    </svg>
  );
}

export function AiIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Chat bubble */}
      <path d="M8 10h32a2 2 0 012 2v20a2 2 0 01-2 2H28l-6 6v-6H8a2 2 0 01-2-2V12a2 2 0 012-2z" strokeLinejoin="round" />
      {/* Heartbeat/pulse line inside bubble */}
      <path d="M12 22h6l2-5 3 10 3-10 2 5h8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Small dot accents */}
      <circle cx="14" cy="17" r="1" fill="currentColor" stroke="none" />
      <circle cx="34" cy="17" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CalendarIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="6" y="10" width="36" height="32" rx="2" />
      <line x1="6" y1="20" x2="42" y2="20" />
      <line x1="16" y1="6" x2="16" y2="14" />
      <line x1="32" y1="6" x2="32" y2="14" />
      <rect x="14" y="26" width="6" height="4" rx="0.5" />
      <rect x="26" y="26" width="6" height="4" rx="0.5" />
      <rect x="14" y="34" width="6" height="4" rx="0.5" />
    </svg>
  );
}

export function SearchIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="22" cy="22" r="14" />
      <line x1="32" y1="32" x2="42" y2="42" strokeLinecap="round" />
    </svg>
  );
}

export function ImageIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="6" y="8" width="36" height="32" rx="2" />
      <circle cx="16" cy="18" r="4" />
      <path d="M6 34l10-10 8 8 6-6 12 12" strokeLinejoin="round" />
    </svg>
  );
}

export function DocumentIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M28 6H12a2 2 0 00-2 2v32a2 2 0 002 2h24a2 2 0 002-2V16L28 6z" />
      <path d="M28 6v10h10" />
      <line x1="16" y1="24" x2="32" y2="24" strokeLinecap="round" />
      <line x1="16" y1="30" x2="32" y2="30" strokeLinecap="round" />
      <line x1="16" y1="36" x2="24" y2="36" strokeLinecap="round" />
    </svg>
  );
}

export function PillIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="14" y="4" width="20" height="40" rx="10" />
      <line x1="14" y1="24" x2="34" y2="24" />
      <circle cx="24" cy="14" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BookOpenIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M24 12c-4-4-10-4-18-4v30c8 0 14 0 18 4" />
      <path d="M24 12c4-4 10-4 18-4v30c-8 0-14 0-18 4" />
      <line x1="24" y1="12" x2="24" y2="42" />
    </svg>
  );
}

export function MicroscopeIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="22" cy="14" r="6" />
      <path d="M22 20v12" />
      <path d="M16 32h12" />
      <path d="M28 14l6-6" strokeLinecap="round" />
      <path d="M10 42h28" strokeLinecap="round" />
      <path d="M18 32v10M26 32v10" />
    </svg>
  );
}

export function UsersIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="18" cy="16" r="6" />
      <path d="M4 40c0-7.732 6.268-14 14-14s14 6.268 14 14" />
      <circle cx="34" cy="14" r="5" />
      <path d="M36 26c4.418 0 8 4.477 8 10" />
    </svg>
  );
}

export function ClipboardIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M30 8h4a2 2 0 012 2v30a2 2 0 01-2 2H14a2 2 0 01-2-2V10a2 2 0 012-2h4" />
      <rect x="18" y="4" width="12" height="8" rx="1" />
      <line x1="18" y1="22" x2="30" y2="22" strokeLinecap="round" />
      <line x1="18" y1="28" x2="30" y2="28" strokeLinecap="round" />
      <line x1="18" y1="34" x2="24" y2="34" strokeLinecap="round" />
    </svg>
  );
}

export function WarningIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="24" cy="24" r="18" />
      <line x1="24" y1="16" x2="24" y2="28" strokeLinecap="round" />
      <circle cx="24" cy="34" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MailIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="10" width="40" height="28" rx="2" />
      <path d="M4 14l20 12 20-12" />
    </svg>
  );
}

export function CheckCircleIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="24" cy="24" r="18" />
      <path d="M16 24l6 6 10-12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function XCircleIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="24" cy="24" r="18" />
      <path d="M16 16l16 16M32 16L16 32" strokeLinecap="round" />
    </svg>
  );
}

export function LightbulbIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 34v4a6 6 0 0012 0v-4" />
      <path d="M18 34c-4-2-8-7-8-14a14 14 0 0128 0c0 7-4 12-8 14" />
      <line x1="18" y1="38" x2="30" y2="38" />
      <line x1="24" y1="6" x2="24" y2="4" strokeLinecap="round" />
    </svg>
  );
}

export function PlusCircleIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="24" cy="24" r="18" />
      <line x1="24" y1="16" x2="24" y2="32" strokeLinecap="round" />
      <line x1="16" y1="24" x2="32" y2="24" strokeLinecap="round" />
    </svg>
  );
}

export function UploadIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 32v6a2 2 0 002 2h28a2 2 0 002-2v-6" />
      <line x1="24" y1="28" x2="24" y2="8" strokeLinecap="round" />
      <path d="M16 16l8-8 8 8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ClockIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="24" cy="24" r="18" />
      <path d="M24 14v10l7 4" strokeLinecap="round" />
    </svg>
  );
}

export function ClipboardListIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M30 8h4a2 2 0 012 2v30a2 2 0 01-2 2H14a2 2 0 01-2-2V10a2 2 0 012-2h4" />
      <rect x="18" y="4" width="12" height="8" rx="1" />
      <circle cx="18" cy="22" r="1.5" fill="currentColor" stroke="none" />
      <line x1="24" y1="22" x2="32" y2="22" strokeLinecap="round" />
      <circle cx="18" cy="28" r="1.5" fill="currentColor" stroke="none" />
      <line x1="24" y1="28" x2="32" y2="28" strokeLinecap="round" />
      <circle cx="18" cy="34" r="1.5" fill="currentColor" stroke="none" />
      <line x1="24" y1="34" x2="32" y2="34" strokeLinecap="round" />
    </svg>
  );
}

export function ChartIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="6" y1="40" x2="42" y2="40" />
      <rect x="10" y="24" width="6" height="16" rx="1" />
      <rect x="21" y="14" width="6" height="26" rx="1" />
      <rect x="32" y="20" width="6" height="20" rx="1" />
    </svg>
  );
}

export function BookIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 40V10a4 4 0 014-4h22a2 2 0 012 2v28" />
      <path d="M10 40a4 4 0 014-4h24v4a0 0 0 010H14a4 4 0 00-4 0z" />
      <line x1="18" y1="14" x2="30" y2="14" strokeLinecap="round" />
      <line x1="18" y1="20" x2="26" y2="20" strokeLinecap="round" />
    </svg>
  );
}

export function ScanIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 012-2h2" />
      <path d="M17 3h2a2 2 0 012 2v2" />
      <path d="M21 17v2a2 2 0 01-2 2h-2" />
      <path d="M7 21H5a2 2 0 01-2-2v-2" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  );
}