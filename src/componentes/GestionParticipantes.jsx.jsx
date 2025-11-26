import { useState } from "react";

export default function GestionParticipantes({
  participantes,
  onAgregar,
  onAgregarLote,
  onEliminar,
}) {
  const [nombre, setNombre] = useState("");
  const [textoPegado, setTextoPegado] = useState("");

  function manejarAgregar(e) {
    e.preventDefault();
    if (!nombre.trim()) return;
    onAgregar(nombre);
    setNombre("");
  }

  function manejarAgregarLote(e) {
    e.preventDefault();
    if (!textoPegado.trim()) return;
    onAgregarLote(textoPegado);
    setTextoPegado("");
  }

  const visibles = participantes.filter((p) => !p.eliminado);

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
      <h2 className="text-sm font-semibold">Participantes</h2>

      <form
        onSubmit={manejarAgregar}
        className="flex flex-col sm:flex-row gap-2"
      >
        <input
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-sm outline-none"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del participante"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700"
        >
          Agregar
        </button>
      </form>

      <details className="text-xs text-slate-400">
        <summary className="cursor-pointer mb-1">
          Agregar varios participantes (uno por línea)
        </summary>
        <form onSubmit={manejarAgregarLote} className="space-y-2 mt-2">
          <textarea
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs outline-none resize-none"
            rows={4}
            value={textoPegado}
            onChange={(e) => setTextoPegado(e.target.value)}
            placeholder={"Ej:\nJuan Pérez\nMaría López\nCarlos García"}
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700"
          >
            Agregar lista
          </button>
        </form>
      </details>

      <div className="max-h-40 overflow-y-auto border border-slate-800 rounded-xl text-xs">
        {visibles.length === 0 ? (
          <div className="px-3 py-2 text-slate-500">
            Sin participantes. Agrega al menos uno.
          </div>
        ) : (
          <ul className="divide-y divide-slate-800">
            {visibles.map((p, indice) => (
              <li
                key={p.id}
                className="px-3 py-1.5 flex items-center justify-between gap-2"
              >
                <span className="truncate">
                  <span className="text-slate-500 mr-1">
                    #{indice + 1}
                  </span>
                  {p.nombre}
                  {p.esGanador && (
                    <span className="ml-2 text-emerald-400">
                      (ganador)
                    </span>
                  )}
                </span>
                {!p.esGanador && (
                  <button
                    onClick={() => onEliminar(p.id)}
                    className="text-[10px] text-red-400 hover:text-red-300"
                  >
                    Quitar
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
