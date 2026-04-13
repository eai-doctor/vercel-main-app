      export default function SystemStatus() {
        
        return (<footer className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur px-5 py-2 rounded-full shadow-xl border border-slate-100 flex items-center gap-2 pointer-events-auto">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">System Status: Online</span>
        </div>
      </footer>)
      }