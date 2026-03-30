const formatDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString() : "—";

export {
    formatDate
}