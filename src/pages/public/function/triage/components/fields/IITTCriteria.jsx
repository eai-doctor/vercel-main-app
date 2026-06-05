import { useState } from "react";
import { useTranslation } from "react-i18next";

// Section colour coding matches IITT colours
const SECTION_STYLES = {
  red: {
    header: "bg-red-600 text-white",
    border: "border-red-200",
    chip: "bg-red-50 border border-red-200 text-red-800 hover:bg-red-100",
    chipSelected: "bg-red-600 text-white border-red-600",
    badge: "bg-red-100 text-red-700",
  },
  yellow: {
    header: "bg-yellow-400 text-gray-900",
    border: "border-yellow-200",
    chip: "bg-yellow-50 border border-yellow-200 text-yellow-900 hover:bg-yellow-100",
    chipSelected: "bg-yellow-400 text-gray-900 border-yellow-400",
    badge: "bg-yellow-100 text-yellow-800",
  },
  trauma: {
    header: "bg-gray-700 text-white",
    border: "border-gray-200",
    chip: "bg-gray-50 border border-gray-200 text-gray-800 hover:bg-gray-100",
    chipSelected: "bg-gray-700 text-white border-gray-700",
    badge: "bg-gray-100 text-gray-700",
  },
};

const SECTION_TITLE_KEYS = {
  airway_breathing: "Airway & Breathing",
  circulation: "Circulation",
  disability: "Disability",
  other: "Other",
};

function CriterionChip({ item, selected, onToggle, style }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(item.key)}
      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
        selected ? style.chipSelected : style.chip
      }`}
    >
      <span className="flex items-center gap-2">
        <span className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          selected ? "bg-white border-white" : "border-current opacity-40"
        }`}>
          {selected && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </span>
        {item.label}
      </span>
    </button>
  );
}

function CriteriaSection({ title, color, subsections, criteria, selected, onToggle }) {
  const [open, setOpen] = useState(true);
  const style = SECTION_STYLES[color];
  const totalSelected = criteria.filter(k => selected.has(k)).length;

  return (
    <div className={`rounded-xl border ${style.border} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 font-bold text-sm ${style.header}`}
      >
        <span>{title}</span>
        <span className="flex items-center gap-2">
          {totalSelected > 0 && (
            <span className="bg-white/30 text-inherit px-2 py-0.5 rounded-full text-xs font-bold">
              {totalSelected} selected
            </span>
          )}
          <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {open && (
        <div className="p-4 space-y-4 bg-white">
          {subsections ? (
            Object.entries(subsections).map(([subKey, items]) => (
              <div key={subKey}>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-2 px-1 ${style.badge} inline-block rounded px-2 py-0.5`}>
                  {SECTION_TITLE_KEYS[subKey] || subKey}
                </p>
                <div className="space-y-1.5">
                  {items.map(item => (
                    <CriterionChip
                      key={item.key}
                      item={item}
                      selected={selected.has(item.key)}
                      onToggle={onToggle}
                      style={style}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-1.5">
              {criteria.map ? criteria.map(item => (
                <CriterionChip
                  key={item.key}
                  item={item}
                  selected={selected.has(item.key)}
                  onToggle={onToggle}
                  style={style}
                />
              )) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function IITTCriteria({ data, setData }) {
  const { t } = useTranslation(["triage", "common"]);
  const age = parseInt(data.demographics?.age || 18);
  const isPediatric = age < 12;

  // selected criteria as a Set for O(1) lookup
  const selected = new Set(data.iitt_criteria || []);

  const toggle = (key) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setData(prev => ({ ...prev, iitt_criteria: Array.from(next) }));
  };

  // Build flat list of all keys per section for count badge
  const allRedKeys = isPediatric ? [
    "unresponsive","stridor","respiratory_distress","central_cyanosis",
    "capillary_refill_gt3","weak_fast_pulse","heavy_bleeding","cold_extremities","dehydration_two_signs",
    "active_convulsions","altered_mental_status_red","hypoglycaemia",
    "infant_lt8days","infant_lt2months_fever","testicular_scrotal_pain","snake_bite","poisoning_ingestion","high_risk_trauma","threatened_limb",
  ] : [
    "unresponsive","stridor","respiratory_distress","central_cyanosis",
    "capillary_refill_gt3","weak_fast_pulse","heavy_bleeding","cold_extremities","severe_pallor_red",
    "active_convulsions","altered_mental_status_red",
    "eclampsia_or_obstetric_emergency","snake_bite","poisoning_ingestion","high_risk_trauma","threatened_limb",
  ];

  const allYellowKeys = isPediatric ? [
    "swelling_mouth_throat_neck","wheezing",
    "unable_to_feed_drink","vomits_everything","ongoing_diarrhoea","dehydration","severe_pallor_yellow",
    "restless_irritable_lethargic","severe_pain",
    "infant_8days_6months","malnutrition_wasting","trauma_burn_yellow","sexual_assault","urgent_surgical_diagnosis","new_rash_worsening","exposure_prophylaxis","pregnancy_yellow","headache_yellow",
  ] : [
    "swelling_mouth_throat_neck","wheezing",
    "unable_to_walk_unaided","severe_pallor_yellow","dehydration",
    "altered_mental_status_yellow","severe_pain",
    "trauma_burn_yellow","sexual_assault","urgent_surgical_diagnosis","new_rash_worsening","exposure_prophylaxis","pregnancy_yellow","headache_yellow",
  ];

  const traumaKeys = [
    "fall_twice_height","penetrating_trauma","crush_injury","polytrauma","bleeding_disorder_anticoagulation",
    "pregnant_trauma","high_speed_mvc","pedestrian_cyclist_hit","mvc_no_seatbelt","trapped_thrown_vehicle","death_in_same_vehicle",
  ];

  // Inline criteria definitions (avoids API call for form schema)
  const RED_SUBSECTIONS_ADULT = {
    airway_breathing: [
      { key: "unresponsive",         label: "Unresponsive" },
      { key: "stridor",              label: "Stridor (high-pitched breathing sound)" },
      { key: "respiratory_distress", label: "Signs of respiratory distress" },
      { key: "central_cyanosis",     label: "Central cyanosis (blue lips/tongue)" },
    ],
    circulation: [
      { key: "capillary_refill_gt3", label: "Capillary refill > 3 seconds" },
      { key: "weak_fast_pulse",      label: "Weak and fast pulse" },
      { key: "heavy_bleeding",       label: "Heavy / uncontrolled bleeding" },
      { key: "cold_extremities",     label: "Cold extremities" },
      { key: "severe_pallor_red",    label: "Severe pallor" },
    ],
    disability: [
      { key: "active_convulsions",        label: "Active convulsions / seizure" },
      { key: "altered_mental_status_red", label: "Altered mental status + stiff neck, hypothermia, or fever" },
    ],
    other: [
      { key: "eclampsia_or_obstetric_emergency", label: "Eclampsia or obstetric emergency" },
      { key: "snake_bite",                        label: "Snake bite" },
      { key: "poisoning_ingestion",               label: "Poisoning, ingestion, or dangerous chemical exposure" },
      { key: "high_risk_trauma",                  label: "High-risk trauma (see Trauma section)" },
      { key: "threatened_limb",                   label: "Threatened limb – pulseless OR painful + pale/weak/numb" },
    ],
  };

  const YELLOW_SUBSECTIONS_ADULT = {
    airway_breathing: [
      { key: "swelling_mouth_throat_neck", label: "Swelling / mass of mouth, throat, or neck" },
      { key: "wheezing",                   label: "Wheezing (no red criteria)" },
    ],
    circulation: [
      { key: "unable_to_walk_unaided", label: "Unable to walk unaided" },
      { key: "severe_pallor_yellow",   label: "Severe pallor (no red criteria)" },
      { key: "dehydration",            label: "Dehydration" },
    ],
    disability: [
      { key: "altered_mental_status_yellow", label: "Altered mental status (no red criteria)" },
      { key: "severe_pain",                  label: "Severe pain" },
    ],
    other: [
      { key: "trauma_burn_yellow",        label: "Trauma or burn (no red criteria)" },
      { key: "sexual_assault",            label: "Sexual assault" },
      { key: "urgent_surgical_diagnosis", label: "Known diagnosis requiring urgent surgical intervention" },
      { key: "new_rash_worsening",        label: "New rash worsening over hours or peeling" },
      { key: "exposure_prophylaxis",      label: "Exposure requiring time-sensitive prophylaxis (e.g. animal bite)" },
      { key: "pregnancy_yellow",          label: "Pregnancy (no red criteria)" },
      { key: "headache_yellow",           label: "Headache (no red criteria)" },
    ],
  };

  const RED_SUBSECTIONS_PED = {
    airway_breathing: [
      { key: "unresponsive",         label: "Unresponsive" },
      { key: "stridor",              label: "Stridor" },
      { key: "respiratory_distress", label: "Respiratory distress or central cyanosis" },
    ],
    circulation: [
      { key: "capillary_refill_gt3",  label: "Capillary refill > 3 seconds" },
      { key: "weak_fast_pulse",        label: "Weak and fast pulse" },
      { key: "heavy_bleeding",         label: "Heavy / uncontrolled bleeding" },
      { key: "cold_extremities",       label: "Cold extremities" },
      { key: "dehydration_two_signs",  label: "Dehydration: 2+ of (lethargy, sunken eyes, very slow skin pinch, drinks poorly)" },
    ],
    disability: [
      { key: "active_convulsions",        label: "Active convulsions" },
      { key: "altered_mental_status_red", label: "Altered mental status + stiff neck, hypothermia, or fever" },
      { key: "hypoglycaemia",             label: "Hypoglycaemia (if known)" },
    ],
    other: [
      { key: "infant_lt8days",          label: "Infant < 8 days old" },
      { key: "infant_lt2months_fever",  label: "Age < 2 months AND temp < 36°C or > 39°C" },
      { key: "testicular_scrotal_pain", label: "Acute testicular / scrotal pain or priapism" },
      { key: "snake_bite",              label: "Snake bite" },
      { key: "poisoning_ingestion",     label: "Poisoning, ingestion, or dangerous chemical exposure" },
      { key: "high_risk_trauma",        label: "High-risk trauma (see Trauma section)" },
      { key: "threatened_limb",         label: "Threatened limb" },
    ],
  };

  const YELLOW_SUBSECTIONS_PED = {
    airway_breathing: [
      { key: "swelling_mouth_throat_neck", label: "Swelling / mass of mouth, throat, or neck" },
      { key: "wheezing",                   label: "Wheezing (no red criteria)" },
    ],
    circulation: [
      { key: "unable_to_feed_drink",  label: "Unable to feed or drink" },
      { key: "vomits_everything",     label: "Vomits everything" },
      { key: "ongoing_diarrhoea",     label: "Ongoing diarrhoea" },
      { key: "dehydration",           label: "Dehydration (no red criteria)" },
      { key: "severe_pallor_yellow",  label: "Severe pallor (no red criteria)" },
    ],
    disability: [
      { key: "restless_irritable_lethargic", label: "Restless, continuously irritable, or lethargic" },
      { key: "severe_pain",                  label: "Severe pain" },
    ],
    other: [
      { key: "infant_8days_6months",      label: "Infant 8 days to 6 months old" },
      { key: "malnutrition_wasting",      label: "Malnutrition: visible severe wasting OR oedema of both feet" },
      { key: "trauma_burn_yellow",        label: "Trauma or burn (no red criteria)" },
      { key: "sexual_assault",            label: "Sexual assault" },
      { key: "urgent_surgical_diagnosis", label: "Known diagnosis requiring urgent surgical intervention" },
      { key: "new_rash_worsening",        label: "New rash worsening over hours or peeling" },
      { key: "exposure_prophylaxis",      label: "Exposure requiring time-sensitive prophylaxis (e.g. animal bite)" },
      { key: "pregnancy_yellow",          label: "Pregnancy (no red criteria)" },
      { key: "headache_yellow",           label: "Headache (no red criteria)" },
    ],
  };

  const TRAUMA_ITEMS = [
    { key: "fall_twice_height",               label: "Fall from twice the person's height" },
    { key: "penetrating_trauma",              label: "Penetrating trauma (bleeding controlled, not distal to knee/elbow)" },
    { key: "crush_injury",                    label: "Crush injury" },
    { key: "polytrauma",                      label: "Polytrauma (injuries in multiple body areas)" },
    { key: "bleeding_disorder_anticoagulation",label: "Bleeding disorder or on anticoagulation" },
    { key: "pregnant_trauma",                 label: "Pregnant (trauma context)" },
    { key: "high_speed_mvc",                  label: "High-speed motor vehicle crash" },
    { key: "pedestrian_cyclist_hit",          label: "Pedestrian or cyclist hit by vehicle" },
    { key: "mvc_no_seatbelt",                 label: "Motor vehicle crash without seatbelt" },
    { key: "trapped_thrown_vehicle",          label: "Trapped or thrown from vehicle (incl. motorcycle)" },
    { key: "death_in_same_vehicle",           label: "Other person in same vehicle died at scene" },
  ];

  const redSubsections   = isPediatric ? RED_SUBSECTIONS_PED    : RED_SUBSECTIONS_ADULT;
  const yellowSubsections = isPediatric ? YELLOW_SUBSECTIONS_PED : YELLOW_SUBSECTIONS_ADULT;

  const totalSelected = selected.size;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#1e293b]">Clinical Criteria</h2>
        <p className="text-sm text-[#64748b] mt-1">
          {isPediatric
            ? `Pediatric protocol (age < 12) — check all that apply`
            : `Adult protocol (age ≥ 12) — check all that apply`}
        </p>
        <p className="text-xs text-[#94a3b8] mt-0.5">
          Source: WHO / MSF / ICRC — Interagency Integrated Triage Tool
        </p>
      </div>

      {totalSelected > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
          <span className="text-blue-700 text-sm font-medium">{totalSelected} criterion{totalSelected !== 1 ? "a" : ""} selected</span>
          <button
            type="button"
            onClick={() => setData(prev => ({ ...prev, iitt_criteria: [] }))}
            className="ml-auto text-xs text-blue-500 hover:text-blue-700"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Red criteria */}
      <CriteriaSection
        title="🔴 Red Criteria — Immediate"
        color="red"
        subsections={redSubsections}
        criteria={allRedKeys}
        selected={selected}
        onToggle={toggle}
      />

      {/* Yellow criteria */}
      <CriteriaSection
        title="🟡 Yellow Criteria — Urgent"
        color="yellow"
        subsections={yellowSubsections}
        criteria={allYellowKeys}
        selected={selected}
        onToggle={toggle}
      />

      {/* High-risk trauma */}
      <CriteriaSection
        title="⚠️ High-Risk Trauma"
        color="trauma"
        subsections={null}
        criteria={TRAUMA_ITEMS}
        selected={selected}
        onToggle={toggle}
      />

      <p className="text-xs text-[#94a3b8] text-center">
        If no criteria apply, the patient will be assigned Green (low acuity).
      </p>
    </div>
  );
}

export default IITTCriteria;
