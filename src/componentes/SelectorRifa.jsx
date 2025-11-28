import { useState } from "react";
import ModalCrearRifa from "./ModalCrearRifa.jsx";

export default function SelectorRifa({
  rifas,
  idRifaSeleccionada,
  onSeleccionarRifa,
  onCrearRifa,
  soloCrearEnConfiguracion = false,
}) {
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [nombreNueva, setNombreNueva] = useState("");
  const [descripcionNueva, setDescripcionNueva] = useState("");
  const [duracionNueva, setDuracionNueva] = useState(5);

  const handleCambioSeleccion = (e) => {
    const id = e.target.value || null;
    onSeleccionarRifa && onSeleccionarRifa(id);
  };

  function limpiarFormulario() {
    setNombreNueva("");
    setDescripcionNueva("");
    setDuracionNueva(5);
  }

  function crearRifaDesdeModal() {
    if (!onCrearRifa) return;
    const nombreLimpio = nombreNueva.trim();
    if (!nombreLimpio) return;

    onCrearRifa({
      nombre: nombreLimpio,
      descripcion: descripcionNueva,
      duracionGiroSegundos: duracionNueva || 5,
    });

    limpiarFormulario();
    setMostrarModalCrear(false);
  }

  return (
    <>
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
        {soloCrearEnConfiguracion && (
          <button
            type="button"
            onClick={() => setMostrarModalCrear(true)}
            className="mt-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            Nueva rifa
          </button>
        )}
      </div>

      {/* Modal para crear rifa */}
      <ModalCrearRifa
        abierto={mostrarModalCrear}
        nombre={nombreNueva}
        descripcion={descripcionNueva}
        duracion={duracionNueva}
        onCambiarNombre={setNombreNueva}
        onCambiarDescripcion={setDescripcionNueva}
        onCambiarDuracion={setDuracionNueva}
        onCrear={crearRifaDesdeModal}
        onCerrar={() => {
          setMostrarModalCrear(false);
          limpiarFormulario();
        }}
      />
    </>
  );
}
