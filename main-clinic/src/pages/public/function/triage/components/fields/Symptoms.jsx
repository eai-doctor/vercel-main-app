import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const FALLBACK_GROUPS = [
  {
    title: "Breathing / circulation",
    items: [
      { key: "airway_issue", label: "Can't breathe well / airway blocked" },
      { key: "short_breath", label: "Breathing is hard" },
      { key: "blue_lips", label: "Blue lips or face" },
      { key: "chest_pain", label: "Chest pain or pressure" },
      { key: "severe_bleeding", label: "Heavy bleeding" },
    ],
  },
  {
    title: "Brain / body",
    items: [
      { key: "unresponsive", label: "Not waking up / not responding" },
      { key: "stroke_signs", label: "Face droop, arm weakness, speech trouble" },
      { key: "severe_headache", label: "Sudden severe headache" },
      { key: "confused", label: "Very confused" },
      { key: "seizure_now", label: "Seizure right now" },
    ],
  },
  {
    title: "Pain / injury",
    items: [
      { key: "moderate_belly_pain", label: "Belly pain" },
      { key: "injury_needs_stitches", label: "Cut or wound" },
      { key: "major_trauma", label: "Bad fall or crash" },
      { key: "eye_injury", label: "Eye injury or vision change" },
      { key: "ear_severe_pain", label: "Severe ear pain" },
    ],
  },
  {
    title: "Fever / infection / other",
    items: [
      { key: "fever_chills", label: "Fever with chills" },
      { key: "fever_stiff_neck", label: "Fever with stiff neck" },
      { key: "rash_spreading", label: "Rash spreading" },
      { key: "animal_bite", label: "Animal bite" },
      { key: "sexual_assault", label: "Sexual assault" },
    ],
  },
];

function normalizeGroups(schema) {
  if (!schema?.adult) return FALLBACK_GROUPS;
  const adult = schema.adult;
  const titles = schema.meta?.section_titles || {};
  const groups = [];
  Object.entries(adult).forEach(([section, items]) => {
    if (Array.isArray(items)) {
      groups.push({
        title: titles[section] || section.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        items: items.map((item) => ({ key: item.key, label: item.label })),
      });
    }
  });
  return groups.length > 0 ? groups : FALLBACK_GROUPS;
}

function Symptoms({ data, setData, schema }) {
  const { t } = useTranslation(["triage", "common"]);
  const { triage } = data;
  const groups = useMemo(() => normalizeGroups(schema), [schema]);

  const toggleItem = (key) => {
    setData((prev) => {
      const current = prev.triage?.symptoms || [];
      const next = current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
      return {
        ...prev,
        triage: {
          ...prev.triage,
          symptoms: next,
          chief_complaint: prev.triage?.chief_complaint || key,
        },
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-[#1e293b] text-center">
          {t("triage:fields.chiefComplaint", "What is the main problem?")}
        </h2>
        <p className="text-sm text-[#64748b] text-center">
          Pick the closest everyday description. You can add more than one if needed.
        </p>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.title} className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#f8fafc] p-4">
            <h3 className="text-sm font-semibold text-[#334155] mb-3">{group.title}</h3>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => {
                const active = triage?.symptoms?.includes(item.key) || triage?.chief_complaint === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleItem(item.key)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all border ${
                      active
                        ? "bg-[#2C3B8D] text-white border-[#2C3B8D]"
                        : "bg-white text-[#475569] border-[rgba(15,23,42,0.1)] hover:border-[rgba(59,130,246,0.4)]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-[rgba(15,23,42,0.15)] p-4">
        <label className="block text-sm font-medium text-[#475569] mb-2">Other words the patient uses</label>
        <input
          value={triage?.chief_complaint_text || ""}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              triage: { ...prev.triage, chief_complaint_text: e.target.value },
            }))
          }
          placeholder="Example: stomach ache, dizzy, tired, won't stop crying"
          className="w-full border border-[rgba(15,23,42,0.1)] rounded-lg px-4 py-3 focus:outline-none focus:border-[#3b82f6]"
        />
      </div>
    </div>
  );
}

export default Symptoms;
