import logoImage from "/images/logo.png";
import AdminRegisterFields from './fields';

export default function AdminRegister() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2C3B8D] via-[#277cc4] to-[#0ba9ea] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src={logoImage} alt="E-AI Doctor Logo" className="w-48 h-24" />
          </div>
          <h1 className="text-white text-3xl font-semibold mb-2">E-AI Doctor</h1>
          <p className="text-white/80 text-sm mt-2">Admin Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <AdminRegisterFields />
        </div>
      </div>
    </div>
  );
}