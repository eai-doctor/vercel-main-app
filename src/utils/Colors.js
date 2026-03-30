
const relevanceColor = (level) => {
  switch (level) {
    case "high":
      return "text-red-600 font-semibold";
    case "moderate":
      return "text-yellow-600 font-medium";
    case "low":
      return "text-[#64748b]";
    default:
      return "text-gray-400";
  }
};

export {
    relevanceColor
}