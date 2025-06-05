import { motion } from "framer-motion";
export default function HomeCliente() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <h1 className="text-3xl font-bold text-blue-700 mb-4">Bem-vindo ao BarberPro!</h1>
      <p>Escolha um serviço ou agende seu horário.</p>
      <div className="mt-6 flex gap-4">
        <a
          href="https://wa.me/5599999999999?text=Olá!%20Gostaria%20de%20agendar%20um%20horário%20na%20BarberPro."
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow"
        >
          Agendar via WhatsApp
        </a>
        <button className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded shadow">
          Gerar QR Code Pix
        </button>
      </div>
    </motion.div>
  );
} 