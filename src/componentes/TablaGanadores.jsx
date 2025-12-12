
export default function TablaGanadores({
  rifa,
  participantes,
  premios,
  onExportar, // función que viene desde App
}) {
  if (!rifa) return null;

  const ganadoresDetallados = rifa.ganadores.map((g, indice) => {
    const participante = participantes.find(
      (p) => p.id === g.participanteId
    );
    const premio = premios.find((p) => p.id === g.premioId);
    const fecha = g.creadoEn ? new Date(g.creadoEn) : null;

    return {
      numero: indice + 1,
      codigo: participante?.codigo || "",
      nombre: participante?.nombre || "Desconocido",
      departamento: participante?.departamento || "",
      lugar: participante?.lugar || "",
      posicion: participante?.posicion || "",
      premio: premio?.titulo || "Sin premio",
      fechaTexto: fecha ? fecha.toLocaleDateString() : "",
      horaTexto: fecha ? fecha.toLocaleTimeString() : "",
    };
  });

  const puedeExportar =
    rifa.estado === "finalizada" && ganadoresDetallados.length > 0;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Ganadores de la rifa
          </h2>
          <p className="text-[11px] text-slate-400">
            {rifa.nombre}
          </p>
        </div>

        {puedeExportar && onExportar && (
          <button
            type="button"
            onClick={onExportar}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-[#ffd34e]/50 text-xs font-semibold bg-[#141821] text-white hover:bg-gradient-to-r from-[#ffd34e] to-[#f8c537] hover:text-black shadow-[0_0_25px_rgba(0,0,0,0.55)]"
          >
            📤 Exportar resultados (CSV)
          </button>
        )}
      </div>

      {ganadoresDetallados.length === 0 ? (
        <p className="text-xs text-slate-500">
          Aún no hay ganadores registrados para esta rifa.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-[11px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-200">
                <th className="px-3 py-2 border-b border-slate-700">N°</th>
                <th className="px-3 py-2 border-b border-slate-700">
                  Código
                </th>
                <th className="px-3 py-2 border-b border-slate-700">
                  Participante
                </th>
                <th className="px-3 py-2 border-b border-slate-700">
                  Departamento
                </th>
                <th className="px-3 py-2 border-b border-slate-700">
                  Sucursal
                </th>
                <th className="px-3 py-2 border-b border-slate-700">
                  Posición
                </th>
                <th className="px-3 py-2 border-b border-slate-700">
                  Premio
                </th>
                <th className="px-3 py-2 border-b border-slate-700">
                  Fecha
                </th>
                <th className="px-3 py-2 border-b border-slate-700">
                  Hora
                </th>
              </tr>
            </thead>
            <tbody>
              {ganadoresDetallados.map((g) => (
                <tr
                  key={g.numero}
                  className="hover:bg-slate-800/50 text-slate-100"
                >
                  <td className="px-3 py-1.5 border-b border-slate-800">
                    {g.numero}
                  </td>
                  <td className="px-3 py-1.5 border-b border-slate-800">
                    {g.codigo}
                  </td>
                  <td className="px-3 py-1.5 border-b border-slate-800">
                    {g.nombre}
                  </td>
                  <td className="px-3 py-1.5 border-b border-slate-800">
                    {g.departamento}
                  </td>
                  <td className="px-3 py-1.5 border-b border-slate-800">
                    {g.lugar}
                  </td>
                  <td className="px-3 py-1.5 border-b border-slate-800">
                    {g.posicion}
                  </td>
                  <td className="px-3 py-1.5 border-b border-slate-800">
                    {g.premio}
                  </td>
                  <td className="px-3 py-1.5 border-b border-slate-800">
                    {g.fechaTexto}
                  </td>
                  <td className="px-3 py-1.5 border-b border-slate-800">
                    {g.horaTexto}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
