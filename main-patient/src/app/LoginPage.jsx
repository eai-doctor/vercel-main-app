import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
export default function LoginPage() {
  const {user,loading}=useAuth(); const {openLogin}=useAuthModal(); const navigate=useNavigate();
  useEffect(()=>{ if(!loading&&!user) openLogin({onSuccess:()=>navigate('/',{replace:true})}); },[loading,user,openLogin,navigate]);
  if(user) return <Navigate to="/" replace />;
  return <section className="p-12 text-center"><h1>Patient sign in</h1><button onClick={()=>openLogin({route:'/'})}>Sign In</button><p><a href="/">Return home</a></p></section>;
}
