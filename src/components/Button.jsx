const GradientButton = ({ onClick, children }) => 
    <button
        onClick={onClick}
        className="flex items-center space-x-2 px-4 py-2 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white rounded-lg hover:opacity-90 transition-all"
    >
        {children}
    </button>

const GradientHomeButton = () => 
    <a
        href="/"
        className="cursor-pointer flex items-center space-x-2 px-4 py-2 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white rounded-lg hover:opacity-90 transition-all shadow-md btn-glow"
        title="Go to Home"
        >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="font-medium">Home</span>
    </a>

export {
    GradientButton,
    GradientHomeButton
}