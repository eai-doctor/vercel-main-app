export default function FeatureCard({ icon, title, description, onClick, disabled, requiresAuth, isAuthenticated, onRequireAuth, }) {

  const handleClick = () => {
    if (disabled) return;

    if (requiresAuth && !isAuthenticated) {
      onRequireAuth?.(); 
      return;
    }

    onClick?.();
  };

  return (
    <div
      onClick={!disabled ? handleClick : undefined}
      className={`group rounded-2xl p-8 shadow-md transition-all duration-300
        ${
          disabled
            ? "bg-gray-100 cursor-not-allowed opacity-60"
            : "bg-white hover:shadow-xl hover:-translate-y-1 cursor-pointer"
        }`}
    >
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div
          className={`w-16 h-16 rounded-xl flex items-center justify-center transition
          ${disabled ? "bg-gray-200" : "bg-blue-50 group-hover:scale-110"}`}
        >
          {icon}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-center mb-2 text-gray-800">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-center text-gray-500">
        {description}
      </p>

      {/* Disabled Label */}
      {disabled && (
        <p className="text-xs text-center text-gray-400 mt-4">
          Coming soon
        </p>
      )}

      {/* Auth Required Label */}
      {requiresAuth && !disabled && (
        <p className="text-xs text-center text-blue-500 mt-4">
          Login required
        </p>
      )}
    </div>
  );
}