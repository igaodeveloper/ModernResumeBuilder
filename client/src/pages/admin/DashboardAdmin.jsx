import { motion } from "framer-motion";
export default function DashboardAdmin() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <h1 className="text-3xl font-bold text-blue-700 mb-4">Dashboard do Administrador</h1>
      <p>Bem-vindo ao painel de controle da sua barbearia!</p>
    </motion.div>
  );
} 