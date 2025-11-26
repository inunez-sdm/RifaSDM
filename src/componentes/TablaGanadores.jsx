function formatearFechaISO(iso) {
  try {
    const fecha = new Date(iso);
    return fecha.toLocaleString();
  } catch {
    return iso;
  }
}

export default function TablaGanadores({ rifa, participantes, premios }) {
  const ganadoresDetallados = rifa.ganadores.map((g, indice) => {
    const participante = participantes.find((p) => p.id === g.participanteId);
    const premio = premios.find((p) => p.id === g.premioId);
    return {
      numero: indice + 1,
      nombreParticipante: participante?.nombre || "Desconocido",
      tituloPremio: premio?.titulo || "Premio",
      fecha: formatearFechaISO(g.creadoEn),
    };
  });

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Ganadores</h2>
        {rifa.estado === "finalizada" && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
            Rifa finalizada
          </span>
        )}
      </div>

      <div className="max-h-60 overflow-y-auto text-xs border border-slate-800 rounded-xl">
        {ganadoresDetallados.length === 0 ? (
          <div className="px-3 py-2 text-slate-500">
            Aún no hay ganadores.
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-slate-900 sticky top-0">
              <tr className="text-[10px] text-slate-400">
                <th className="px-2 py-1 text-left">#</th>
                <th className="px-2 py-1 text-left">Participante</th>
                <th className="px-2 py-1 text-left">Premio</th>
                <th className="px-2 py-1 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {ganadoresDetallados.map((g) => (
                <tr key={g.numero} className="border-t border-slate-800">
                  <td className="px-2 py-1">{g.numero}</td>
                  <td className="px-2 py-1">{g.nombreParticipante}</td>
                  <td className="px-2 py-1">{g.tituloPremio}</td>
                  <td className="px-2 py-1">{g.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
