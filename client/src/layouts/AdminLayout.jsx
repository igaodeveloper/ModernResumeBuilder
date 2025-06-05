import { Outlet, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserTie, FaCut, FaUsers, FaCalendarAlt, FaMoneyBill, FaCog, FaHome } from "react-icons/fa";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <FaHome /> },
  { to: "/admin/barbeiros", label: "Barbeiros", icon: <FaUserTie /> },
  { to: "/admin/servicos", label: "Serviços", icon: <FaCut /> },
  { to: "/admin/clientes", label: "Clientes", icon: <FaUsers /> },
  { to: "/admin/agenda", label: "Agenda", icon: <FaCalendarAlt /> },
  { to: "/admin/financeiro", label: "Financeiro", icon: <FaMoneyBill /> },
  { to: "/admin/configuracoes", label: "Configurações", icon: <FaCog /> },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-white">
      <aside className="w-64 bg-blue-700 text-white flex flex-col shadow-lg">
        <div className="h-20 flex items-center justify-center border-b border-blue-800">
          <span className="text-2xl font-bold text-white">BarberPro</span>
        </div>
        <nav className="flex-1 py-6">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center px-6 py-3 rounded-l-full transition-colors ${
                      isActive ? "bg-white text-blue-700 font-bold" : "hover:bg-blue-800 hover:text-white"
                    }`
                  }
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 p-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.3 }}>
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
} 