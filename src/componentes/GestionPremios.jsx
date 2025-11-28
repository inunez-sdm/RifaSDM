import { useState } from "react";

export default function GestionPremios({
  premios,
  onAgregar,
  onActualizar,
  onEliminar,
}) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [orden, setOrden] = useState("");
  const [cantidad, setCantidad] = useState("");

  function manejarAgregar(e) {
    e.preventDefault();
    if (!titulo.trim()) return;
    onAgregar({ titulo, descripcion, orden, cantidad });
    setTitulo("");
    setDescripcion("");
    setOrden("");
    setCantidad("");
  }

  const visibles = premios.filter((p) => !p.eliminado);

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
      <h2 className="text-sm font-semibold">Premios</h2>

      <form
        onSubmit={manejarAgregar}
        className="grid grid-cols-1 sm:grid-cols-6 gap-2 text-xs"
      >
        <div className="sm:col-span-2">
          <input
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 outline-none"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Nombre del premio"
          />
        </div>

        <div className="sm:col-span-2">
          <input
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 outline-none"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción (opcional)"
          />
        </div>

        <div>
          <input
            type="number"
            min={1}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 outline-none"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            placeholder="Cantidad"
          />
        </div>

        <div>
          <input
            type="number"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 outline-none"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            placeholder="Orden"
          />
        </div>
        {/* */}
        <div className="sm:col-span-6 flex justify-end">
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-semibold"
          >
            Agregar premio
          </button>
        </div>
      </form>

      <div className="max-h-40 overflow-y-auto text-xs border border-slate-800 rounded-xl">
        {visibles.length === 0 ? (
          <div className="px-3 py-2 text-slate-500">Sin premios.</div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-slate-900 sticky top-0">
              <tr className="text-[10px] text-slate-400">
                <th className="px-2 py-1 text-left">Premio</th>
                <th className="px-2 py-1 text-left">Cant.</th>
                <th className="px-2 py-1 text-left">Orden</th>
                <th className="px-2 py-1 text-left">Estado</th>
                <th className="px-2 py-1"></th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((p) => {
                const restante = p.cantidadRestante ?? p.cantidadTotal ?? 0;
                const total = p.cantidadTotal ?? restante;
                const agotado = restante === 0;
                const enUso = restante < total;

                return (
                  <tr key={p.id} className="border-t border-slate-800">
                    <td className="px-2 py-1">
                      <div className="font-medium">{p.titulo}</div>
                      {p.descripcion && (
                        <div className="text-[10px] text-slate-400">
                          {p.descripcion}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-1 text-[11px]">
                      {restante} / {total}
                    </td>
                    <td className="px-2 py-1 text-[11px]">
                      {p.orden ?? "-"}
                    </td>
                    <td className="px-2 py-1 text-[11px]">
                      {agotado ? (
                        <span className="text-emerald-400">Agotado</span>
                      ) : (
                        <span className="text-blue-400">Con unidades</span>
                      )}
                    </td>
                    <td className="px-2 py-1 text-right">
                      {!enUso && (
                        <button
                          onClick={() => onEliminar(p.id)}
                          className="text-[10px] text-red-400 hover:text-red-300"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
