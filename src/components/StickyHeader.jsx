/*
    StickyHeader.jsx
    This component provides a consistent header with a gradient top border, title, subtitle, and navigation buttons.
    It is designed to be used across different pages of the application to maintain a cohesive look and feel.
*/

const StickyHeader = ({ title, subtitle, children }) =>
    <header className="mt-[3px] bg-white/95 backdrop-blur-[20px] border-b border-[rgba(15,23,42,0.1)] shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gradient">
                {title}
              </h1>
              <p className="text-sm text-[#475569] mt-1">{subtitle}</p>
            </div>
            <div className="flex sm:flex-row items-center space-x-4 mt-3 sm:mt-0">
             {children}
            </div>
          </div>
        </div>
      </header> 

export default StickyHeader;