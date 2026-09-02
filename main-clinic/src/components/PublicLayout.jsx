import { useEffect, useState } from "react";

import LoginModal from "@/pages/public/clinic-join/modal/login";
import { headerMenus } from "@/pages/public/clinic-join/constant";
import Header from "@/pages/public/clinic-join/component/header";

function PublicLayoutInner({children, mode}) {
 const [modalOpen, setModalOpen] = useState(mode === "login" || new URLSearchParams(window.location.search).get("mode") === "login"); // mode = login, scrolling
  return (
    <div className="min-h-screen bg-[#f8fafd]" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <LoginModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <Header headerMenus={headerMenus} setModalOpen={setModalOpen} /> 
      {children}
    </div>
  );
}

export default function PublicLayout({ children ,mode }) {
  return (
    <PublicLayoutInner mode={mode}>
      {children}
    </PublicLayoutInner>
  );
}