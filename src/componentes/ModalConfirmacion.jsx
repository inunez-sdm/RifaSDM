export default function ModalConfirmacion({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  onConfirmar,
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
      <div className="relative w-full max-w-md mx-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 transform transition-all">
        <h2 className="text-lg font-semibold mb-2">{titulo}</h2>
        <p className="text-sm text-slate-300 mb-4 whitespace-pre-line">
          {mensaje}
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCerrar}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-600 hover:bg-red-500 text-white"
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
