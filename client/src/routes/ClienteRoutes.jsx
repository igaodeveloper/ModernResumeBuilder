import { Routes, Route, Navigate } from "react-router-dom";
import ClienteLayout from "@/layouts/ClienteLayout";
import HomeCliente from "@/pages/cliente/HomeCliente";
import Agendamento from "@/pages/cliente/Agendamento";
import Pagamento from "@/pages/cliente/Pagamento";
import Perfil from "@/pages/cliente/Perfil";
import Historico from "@/pages/cliente/Historico";

export default function ClienteRoutes() {
  return (
    <Routes>
      <Route element={<ClienteLayout />}>
        <Route path="home" element={<HomeCliente />} />
        <Route path="agendamento" element={<Agendamento />} />
        <Route path="pagamento" element={<Pagamento />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="historico" element={<Historico />} />
        <Route path="" element={<Navigate to="home" replace />} />
      </Route>
    </Routes>
  );
} 