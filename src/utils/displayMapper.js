export function displayRecord(tab, rec) {
  const res = rec.resource || {};

  switch (tab) {
    case "Condition":
      return {
        primary: res.code?.text,
        secondary: res.clinicalStatus?.coding?.[0]?.code,
        date: res.onsetDateTime,
        notes: res.note?.[0]?.text,
      };
    default:
      return { primary: "Unknown" };
  }
}