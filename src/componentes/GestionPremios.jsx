import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";

export default function GestionPremios({
  premios,
  onAgregar,
  onActualizar,
  onEliminar,

  // 👇 NUEVO (recomendado): para agregar en lote desde Excel
  onAgregarLote,
}) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [orden, setOrden] = useState("");
  const [cantidad, setCantidad] = useState("");

  // Excel
  const fileRef = useRef(null);
  const [errorExcel, setErrorExcel] = useState("");
  const [infoExcel, setInfoExcel] = useState("");

  function manejarAgregar(e) {
    e.preventDefault();
    if (!titulo.trim()) return;
    onAgregar({ titulo, descripcion, orden, cantidad });
    setTitulo("");
    setDescripcion("");
    setOrden("");
    setCantidad("");
  }

  const visibles = useMemo(() => premios.filter((p) => !p.eliminado), [premios]);

  // =========================
  // Excel helpers
  // =========================
  function normalizarKey(s) {
    return (s ?? "")
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // quita acentos
  }

  function mapRowToPremio(row) {
    const entries = Object.entries(row || {});
    const get = (aliases) => {
      const found = entries.find(([k]) => aliases.includes(normalizarKey(k)));
      return found ? found[1] : "";
    };

    // headers aceptados
    const titulo = get([
      "nombre del premio",
      "titulo",
      "nombre",
      "premio",
    ])
      .toString()
      .trim();

    const descripcion = get([
      "descripcion",
      "descripcion (opcional)",
      "descripción",
      "descripción (opcional)",
    ])
      .toString()
      .trim();

    const cantidad = get(["cantidad", "qty"]);
    const orden = get(["orden", "order"]);

    return { titulo, descripcion, cantidad, orden };
  }

  async function handleExcelChange(e) {
    setErrorExcel("");
    setInfoExcel("");

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const wsName = wb.SheetNames[0];
      const ws = wb.Sheets[wsName];

      // defval "" para evitar undefined
      const json = XLSX.utils.sheet_to_json(ws, { defval: "" });

      if (!json || json.length === 0) {
        setErrorExcel("El archivo no tiene filas de datos.");
        e.target.value = "";
        return;
      }

      const filas = json.map(mapRowToPremio);

      // filtrar válidas
      const validas = filas.filter(
        (f) => f.titulo?.trim() && Number(f.cantidad) > 0
      );

      if (validas.length === 0) {
        setErrorExcel(
          "No se encontraron filas válidas. Verifica columnas: Nombre del premio, Cantidad, Orden (opcional), Descripción (opcional)."
        );
        e.target.value = "";
        return;
      }

      // Si existe onAgregarLote, úsalo (mejor). Si no, cae a onAgregar por fila.
      if (typeof onAgregarLote === "function") {
        onAgregarLote(validas);
      } else {
        validas.forEach((f) => onAgregar(f));
      }

      setInfoExcel(`Cargados ${validas.length} premio(s) desde Excel.`);
      e.target.value = ""; // permite cargar el mismo archivo otra vez
    } catch (err) {
      console.error(err);
      setErrorExcel("No pude leer el Excel. Asegúrate de que sea .xlsx válido.");
      e.target.value = "";
    }
  }

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

        {/* BOTONES */}
        <div className="sm:col-span-6 flex flex-wrap justify-end gap-2">
          {/* 👇 NUEVO: Cargar Excel */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="px-3 py-1.5 rounded-2xl border border-[#ffd34e]/50 text-xs font-semibold bg-[#141821] text-white hover:bg-gradient-to-r from-[#ffd34e] to-[#f8c537] hover:text-black shadow-[0_0_25px_rgba(0,0,0,0.55)]"
          >
            Cargar Excel
          </button>

          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelChange}
            className="hidden"
          />

          {/* Tu botón existente */}
          <button
            type="submit"
            className="px-3 py-1.5 rounded-2xl border border-[#ffd34e]/50 text-xs font-semibold bg-[#141821] text-white hover:bg-gradient-to-r from-[#ffd34e] to-[#f8c537] hover:text-black shadow-[0_0_25px_rgba(0,0,0,0.55)]"
          >
            Agregar premio
          </button>
        </div>

        {/* Mensajes Excel */}
        {errorExcel && (
          <div className="sm:col-span-6 text-[11px] text-red-200">
            {errorExcel}
          </div>
        )}
        {infoExcel && (
          <div className="sm:col-span-6 text-[11px] text-emerald-200">
            {infoExcel}
          </div>
        )}
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
