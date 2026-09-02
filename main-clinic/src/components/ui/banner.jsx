
const StatusBanner = ({ status }) => {
  if (!status) return null;
  const cls =
    status.type === 'success'
      ? 'bg-green-50 border-green-200 text-green-700'
      : 'bg-red-50 border-red-200 text-red-700';
  return (
    <div className={`px-4 py-3 rounded-lg text-sm border ${cls}`}>
      {status.message}
    </div>
  );
};

export {
    StatusBanner
}