export default function Historico() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-700 mb-2">Histórico de Cortes</h2>
      <p>Veja seus cortes, barbeiros e avaliações anteriores.</p>
      <div className="mt-4 p-4 bg-white rounded shadow">
        <div className="mb-2 font-semibold">Avaliação do último corte:</div>
        <div className="flex gap-2 text-2xl mb-1">
          <span role="img" aria-label="Excelente">😍</span>
          <span role="img" aria-label="Bom">😊</span>
          <span role="img" aria-label="Regular">😐</span>
          <span role="img" aria-label="Ruim">😕</span>
        </div>
        <textarea className="w-full border rounded p-2" placeholder="Deixe um comentário sobre o corte..."></textarea>
        <button className="mt-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded shadow">Enviar Avaliação</button>
      </div>
    </div>
  );
} 