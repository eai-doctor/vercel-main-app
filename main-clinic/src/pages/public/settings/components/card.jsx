const Card = ({ children, tone = 'default' }) => {
  const toneCls = {
    default: 'border-[rgba(15,23,42,0.1)]',
    info: 'border-blue-200',
    danger: 'border-2 border-red-200',
  }[tone];

  return (
    <div className={`bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] overflow-hidden ${toneCls}`}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, tone = 'default' }) => {
  const toneCls = {
    default: 'border-b border-[rgba(15,23,42,0.08)]',
    info: 'border-b border-blue-100 bg-blue-50 text-blue-700',
    danger: 'border-b border-red-100 bg-red-50 text-red-700',
  }[tone];

  return (
    <div className={`px-6 py-4 ${toneCls}`}>
      <h2 className="text-lg font-semibold">{children}</h2>
    </div>
  );
};


export {
    Card,
    CardHeader,
}