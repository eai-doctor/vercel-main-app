import LanguageSwitcher from "@/components/LanguageSwitcher";
import ProfileDropdown from "@/components/ProfileDropdown";
import { useAuth } from "@/context/AuthContext";
import logoImage from "/images/logo.png";


/* ---------------- Header ---------------- */
function Header({ handleOnSignInBtnClick }) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* -------- Left (Logo) -------- */}
        <div className="flex items-center gap-3">
          <img
            src={logoImage}
            alt="logo"
            className="w-12 h-12 object-contain"
          />
          {/* <h1 className="text-lg font-extrabold text-[#2C3B8D]">
            E-AI Doctor
          </h1> */}
        </div>

        {/* -------- Right -------- */}
        <div className="flex items-center gap-3">
          
          {/* Language Switcher */}
          <LanguageSwitcher /> {/* :contentReference[oaicite:0]{index=0} */}

          {/* Auth 영역 */}
          {user ? (
            <ProfileDropdown /> /* :contentReference[oaicite:1]{index=1} */
          ) : (
            <Button
              onClick={handleOnSignInBtnClick}
              className="bg-[#2C3B8D] hover:bg-[#1f2a63] text-white"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;