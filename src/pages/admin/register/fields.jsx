import { useState } from "react";
import { Lock, User, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import { authAdminReigster } from "@/api/authApi";

export default function AdminRegisterFields() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    admin_secret: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await authAdminReigster(formData);
      const data = await res.data;

      if (res.status != 201) {
        setError(data.error || "Registration failed");
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Admin Account Created</h3>
        <p className="text-gray-600 text-sm">
          A verification email has been sent. Please verify your email before logging in.
        </p>
        <a
          href="/admin/login"
          className="mt-4 inline-block text-[#277cc4] hover:text-[#2C3B8D] font-medium text-sm transition-colors"
        >
          Go to Admin Login →
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-[#2C3B8D] to-[#277cc4] rounded-full flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl text-gray-800 font-semibold mb-1">Admin Registration</h2>
        <p className="text-gray-500 text-sm">Authorized personnel only</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Admin Name"
              className="pl-11 h-12 border-gray-300 focus:border-[#277cc4] focus:ring-[#277cc4]"
              required
            />
          </div>
        </div>

        {/* Email */}
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

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Strong password"
              className="pl-11 pr-12 h-12 border-gray-300 focus:border-[#277cc4] focus:ring-[#277cc4]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Admin Secret Key */}
        <div className="space-y-2">
          <Label htmlFor="admin_secret" className="text-gray-700">Admin Secret Key</Label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="admin_secret"
              type={showSecret ? "text" : "password"}
              value={formData.admin_secret}
              onChange={(e) => setFormData({ ...formData, admin_secret: e.target.value })}
              placeholder="Enter admin secret key"
              className="pl-11 pr-12 h-12 border-gray-300 focus:border-[#277cc4] focus:ring-[#277cc4]"
              required
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            >
              {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-400">Contact your system administrator for this key.</p>
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
          {submitting ? "Creating Account..." : "Create Admin Account"}
        </Button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/admin/login" className="text-[#277cc4] hover:text-[#2C3B8D] font-medium transition-colors">
            Sign in
          </a>
        </p>
      </form>
    </>
  );
}