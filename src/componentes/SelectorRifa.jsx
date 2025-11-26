import { useState } from "react";

export default function SelectorRifa({
  rifas,
  idRifaSeleccionada,
  onSeleccionarRifa,
  onCrearRifa,
}) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [duracion, setDuracion] = useState(5);

  function manejarCrear(e) {
    e.preventDefault();
    if (!nombre.trim()) return;
    onCrearRifa({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      duracionGiroSegundos: Number(duracion) || 5,
    });
    setNombre("");
    setDescripcion("");
    setDuracion(5);
    setMostrarFormulario(false);
  }

  return (
    <div className="flex flex-col items-end gap-2 w-full md:w-auto">
      <div className="flex items-center gap-2 w-full md:w-auto">
        <select
          className="flex-1 md:flex-none min-w-[220px] bg-slate-900 border border-slate-700 rounded-full px-3 py-2 text-sm outline-none"
          value={idRifaSeleccionada || ""}
          onChange={(e) => onSeleccionarRifa(e.target.value)}
        >
          {rifas.length === 0 && <option value="">Sin rifas</option>}
          {rifas.map((rifa) => (
            <option key={rifa.id} value={rifa.id}>
              {rifa.nombre}
              {rifa.estado === "finalizada" ? " (finalizada)" : ""}
            </option>
          ))}
        </select>

        <button
          onClick={() => setMostrarFormulario((v) => !v)}
          className="px-3 py-2 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-600"
        >
          {mostrarFormulario ? "Cancelar" : "Nueva rifa"}
        </button>
      </div>

      {mostrarFormulario && (
        <form
          onSubmit={manejarCrear}
          className="bg-slate-900 border border-slate-700 rounded-2xl p-4 w-full md:w-[340px] space-y-3"
        >
          <h2 className="text-sm font-semibold">Crear nueva rifa</h2>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Nombre</label>
            <input
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-sm outline-none"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Rifa de Navidad 2025"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Descripción</label>
            <textarea
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-sm outline-none resize-none"
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Información opcional de la rifa"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">
              Duración del giro (segundos)
            </label>
            <input
              type="number"
              min={2}
              max={30}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-sm outline-none"
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full mt-1 px-3 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400"
          >
            Guardar rifa
          </button>
        </form>
      )}
    </div>
  );
}
