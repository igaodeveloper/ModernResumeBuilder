import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import DashboardAdmin from "@/pages/admin/DashboardAdmin";
import Barbeiros from "@/pages/admin/Barbeiros";
import Servicos from "@/pages/admin/Servicos";
import Clientes from "@/pages/admin/Clientes";
import Agenda from "@/pages/admin/Agenda";
import Financeiro from "@/pages/admin/Financeiro";
import Configuracoes from "@/pages/admin/Configuracoes";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="dashboard" element={<DashboardAdmin />} />
        <Route path="barbeiros" element={<Barbeiros />} />
        <Route path="servicos" element={<Servicos />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="financeiro" element={<Financeiro />} />
        <Route path="configuracoes" element={<Configuracoes />} />
        <Route path="" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
} 