import { useState } from "react";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginFields() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { adminLogin } = useAuth();

  const handleSubmit = async (e) => {
    console.log("handleSubmit")
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await adminLogin(formData.email, formData.password);

      if (res.status != 200) {
        if (data.requires_verification) {
          window.location.href = `/verify-email?email=${encodeURIComponent(formData.email)}`;
          return;
        }
        setError(data.error || "Login failed");
        return;
      }

      window.location.replace("/admin/dashboard");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-2xl text-gray-800 font-semibold mb-2">Admin Sign In</h2>
        <p className="text-gray-500 text-sm">Access restricted to administrators only</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">Email</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin@example.com"
              className="pl-11 h-12 border-gray-300 focus:border-[#277cc4] focus:ring-[#277cc4]"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
              className="pl-11 pr-12 h-12 border-gray-300 focus:border-[#277cc4] focus:ring-[#277cc4]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-12 bg-gradient-to-r from-[#2C3B8D] to-[#277cc4] hover:from-[#1f2a63] hover:to-[#1d5d94] text-white text-base font-medium"
        >
          {submitting ? "Signing in..." : "Sign In"}
        </Button>

        <p className="text-center text-xs text-gray-400 mt-2">
          Not an admin?{" "}
          <a href="/clinic-login" className="text-[#277cc4] hover:text-[#2C3B8D] transition-colors">
            Go to Clinic Portal
          </a>
        </p>
      </form>
    </>
  );
}