import { useTranslation } from 'react-i18next';

function Demographics({ data, setData }) {
  const { demographics } = data;
  const { t } = useTranslation(['triage', 'common']);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="font-semibold text-[#1e293b] text-2xl">Who is the patient?</h3>
        <p className="text-sm text-[#64748b]">We only need the basics to help with CTAS sorting.</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#475569]">
          Age
        </label>

        <input
          type="number"
          min="0"
          max="120"
          value={demographics.age || ""}
          onChange={(e) =>
            setData(prev => ({
              ...prev,
              demographics: { ...prev.demographics, age: e.target.value }
            }))
          }
          placeholder="Age"
          className="w-full border border-[rgba(15,23,42,0.1)] rounded-lg px-4 py-3 focus:outline-none focus:border-[#3b82f6]"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#475569]">
          Sex
        </label>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" },
          ].map((sex) => (
            <button
              key={sex.value}
              type="button"
              onClick={() =>
                setData(prev => ({
                  ...prev,
                  demographics: { ...prev.demographics, sex: sex.value }
                }))
              }
              className={`py-3 px-4 rounded-lg font-medium transition-all
                ${
                  demographics.sex === sex.value
                    ? "bg-[#2C3B8D] text-white shadow-sm"
                    : "bg-[#f8fafc] border border-[rgba(15,23,42,0.1)] text-[#475569] hover:border-[rgba(59,130,246,0.4)]"
                }
              `}
            >
              {sex.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Demographics;
