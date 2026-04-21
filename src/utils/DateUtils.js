const formatDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString() : "—";

const getTodayString = () => new Date().toISOString().split('T')[0];

export {
    formatDate,
    getTodayString
}