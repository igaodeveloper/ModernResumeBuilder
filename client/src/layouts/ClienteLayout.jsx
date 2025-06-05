import { Outlet, NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHome, FaCalendarAlt, FaMoneyBill, FaUser } from "react-icons/fa";

const navItems = [
  { to: "/cliente/home", label: "Início", icon: <FaHome /> },
  { to: "/cliente/agendamento", label: "Agendar", icon: <FaCalendarAlt /> },
  { to: "/cliente/pagamento", label: "Pagamento", icon: <FaMoneyBill /> },
  { to: "/cliente/perfil", label: "Perfil", icon: <FaUser /> },
];

export default function ClienteLayout() {
  const location = useLocation();
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="h-16 flex items-center justify-center bg-blue-700 text-white shadow-md">
        <span className="text-xl font-bold">BarberPro</span>
      </header>
      <main className="flex-1 bg-gray-50 p-4 pb-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.3 }}>
          <Outlet />
        </motion.div>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-blue-200 shadow-lg flex justify-around py-2 z-50 md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center text-xs px-2 py-1 rounded transition-colors ${
                isActive || location.pathname === item.to ? "text-blue-700" : "text-gray-500 hover:text-blue-700"
              }`
            }
          >
            <span className="text-lg mb-1">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
} 