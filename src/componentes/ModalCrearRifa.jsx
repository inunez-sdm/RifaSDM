export default function ModalCrearRifa({
  abierto,
  nombre,
  descripcion,
  duracion,
  onCambiarNombre,
  onCambiarDescripcion,
  onCambiarDuracion,
  onCrear,
  onCerrar,
}) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo oscuro */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onCerrar}
      />

      {/* Contenido del modal */}
      <div className="relative w-full max-w-md mx-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100">
        <h2 className="text-lg font-semibold mb-2">
          Crear nueva rifa
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Define el nombre, una breve descripción y la duración de la animación.
        </p>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block mb-1 text-slate-300">
              Nombre de la rifa
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => onCambiarNombre(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ej: Rifa aniversario SDM"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-300">
              Descripción (opcional)
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => onCambiarDescripcion(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-300">
              Duración de la animación (segundos)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={duracion}
              onChange={(e) => onCambiarDuracion(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-5">
          <button
            type="button"
            onClick={onCerrar}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onCrear}
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            Crear rifa
          </button>
        </div>
      </div>
    </div>
  );
}
