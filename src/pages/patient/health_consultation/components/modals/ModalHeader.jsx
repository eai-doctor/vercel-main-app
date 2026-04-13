  import {
  AiIcon, MicrophoneIcon, ClipboardIcon, LightbulbIcon,
  MailIcon, CheckCircleIcon, XCircleIcon, ClockIcon, UserIcon
} from '@/components/ui/icons';

const ModalHeader = ({ title, subtitle, badge, onClose }) => (
    <div className="flex items-center justify-between px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff] sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
          <AiIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
        </div>
        <div>
          <h2 className="text-[17px] font-semibold text-slate-800">{title}</h2>
          <div className="flex items-center gap-2">
            {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
            {badge && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D]">{badge}</span>}
          </div>
        </div>
      </div>
      <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
        <XCircleIcon className="w-5 h-5" />
      </button>
    </div>
  );

  export default ModalHeader;