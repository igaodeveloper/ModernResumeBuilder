export default function Perfil() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-700 mb-2">Meu Perfil</h2>
      <p>Veja e edite suas informações pessoais.</p>
      <div className="mt-4 p-4 bg-blue-50 rounded shadow">
        <span className="font-semibold text-blue-700">Cashback acumulado:</span> <span className="text-green-600 font-bold">R$ 25,00</span>
      </div>
      <button className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow">
        Cortar de novo com o mesmo barbeiro
      </button>
    </div>
  );
} 