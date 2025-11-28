import { useState } from "react";

export default function SelectorRifa({
  rifas,
  idRifaSeleccionada,
  onSeleccionarRifa,
  onCrearRifa, 
  soloCrearEnConfiguracion = false,
}) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombreNueva, setNombreNueva] = useState("");
  const [descripcionNueva, setDescripcionNueva] = useState("");
  const [duracionNueva, setDuracionNueva] = useState(5);
  


  const handleCambioSeleccion = (e) => {
    const id = e.target.value || null;
    onSeleccionarRifa && onSeleccionarRifa(id);
  };

  const handleCrearRifaRapida = (e) => {
    e.preventDefault();
    if (!onCrearRifa) return;

    const nombreLimpio = nombreNueva.trim();
    if (!nombreLimpio) return;

    onCrearRifa({
      nombre: nombreLimpio,
      descripcion: descripcionNueva,
      duracionGiroSegundos: duracionNueva || 5,
    });

    setNombreNueva("");
    setDescripcionNueva("");
    setDuracionNueva(5);
    setMostrarFormulario(false);
  };

  return (
    <div className="flex flex-row items-end gap-2">
      {/* Selector de rifa */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-400">Rifa:</label>
        <select
          value={idRifaSeleccionada || ""}
          onChange={handleCambioSeleccion}
          className="bg-slate-900 border border-slate-700 text-sm rounded-xl px-3 py-1.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecciona una rifa</option>
          {rifas.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </select>

      </div>

      {/* Botón "Nueva rifa" SOLO en Configuración */}
      {!soloCrearEnConfiguracion ? null : (
        <>
          {!mostrarFormulario ? (
            <button
              type="button"
              onClick={() => setMostrarFormulario(true)}
              className="mt-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Nueva rifa
            </button>
          ) : (
            <form
              onSubmit={handleCrearRifaRapida}
              className="mt-2 bg-slate-900 border border-slate-700 rounded-xl p-3 w-64 space-y-2 text-xs"
            >
              <div>
                <label className="block text-slate-400 mb-1">
                  Nombre de la rifa
                </label>
                <input
                  type="text"
                  value={nombreNueva}
                  onChange={(e) => setNombreNueva(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ej: Rifa aniversario SDM"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  value={descripcionNueva}
                  onChange={(e) => setDescripcionNueva(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">
                  Duración del giro (segundos)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={duracionNueva}
                  onChange={(e) => setDuracionNueva(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="px-2 py-1 rounded-full text-[11px] bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  Crear
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
