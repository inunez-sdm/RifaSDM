export default function GestionRifa({ rifa, onActualizar }) {
  function manejarCambioNumero(e) {
    const valor = Number(e.target.value) || 1;
    onActualizar({ duracionGiroSegundos: valor });
  }

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
      <h2 className="text-sm font-semibold">Configuración de la rifa</h2>
      <p className="text-xs text-slate-400">
        {rifa.descripcion || "Sin descripción"}
      </p>

      <div className="space-y-1">
        <label className="text-xs text-slate-400">
          Duración de selección (segundos)
        </label>
        <input
          type="number"
          min={2}
          max={30}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-sm outline-none"
          value={rifa.duracionGiroSegundos}
          onChange={manejarCambioNumero}
        />
      </div>
    </div>
  );
}
