import { Home, Trophy, History, User, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import "../styles/SidebarNew.css";

export default function SidebarDesktop({ onToggleSidebar }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(true);

  const toggle = () => {
    setOpen(!open);
    onToggleSidebar(!open);
  };

  return (
    <aside className={`sidebar ${open ? "open" : "collapsed"}`}>
      <button className="menu-btn" onClick={toggle}>
        <Menu size={20} />
      </button>

      <div className="sidebar-links">
        <Link to="/app/home" className={pathname.includes("home") ? "active" : ""}>
          <Home /> {open && "Inicio"}
        </Link>

        <Link to="/app/ranking" className={pathname.includes("ranking") ? "active" : ""}>
          <Trophy /> {open && "Ranking"}
        </Link>

        <Link to="/app/historical" className={pathname.includes("historical") ? "active" : ""}>
          <History /> {open && "Historial"}
        </Link>

        <Link to="/app/profile" className={pathname.includes("profile") ? "active" : ""}>
          <User /> {open && "Perfil"}
        </Link>
      </div>
    </aside>
  );
}
