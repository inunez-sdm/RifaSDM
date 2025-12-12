// src/componentes/ModalGanador.jsx
import { useMemo, useState } from "react";

const CONFETTI_TOTAL_MS = 4000;         // <-- aquí controlas cuánto dura visible el confeti
const CONFETTI_DELAY_MAX_S = 0.8;       // <-- más dispersión al inicio (antes 0.4)
const CONFETTI_MIN_DURATION_S = 3.2;    // <-- duración mínima por pieza
const CONFETTI_EXTRA_DURATION_S = 1.8;  // <-- duración extra aleatoria (total: 3.2 a 5.0 aprox)

export default function ModalGanador({
  visible,
  participante,
  premio,
  onConfirmar,
  onDescartar,

  // 👇 NUEVO
  discardConfig = {
    durationMs: 2000,
    message: "Participante descartado",
    emoji: "😔",
    shake: true,
  },
}) {
  const [modoAnimacion, setModoAnimacion] = useState("none"); // "none" | "confeti" | "triste"

  const confetiItems = useMemo(
    () =>
      Array.from({ length: 90 }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * CONFETTI_DELAY_MAX_S;
        const duration =
          CONFETTI_MIN_DURATION_S + Math.random() * CONFETTI_EXTRA_DURATION_S;

        const colores = ["#f97316", "#22c55e", "#0ea5e9", "#e11d48", "#facc15"];
        const color = colores[i % colores.length];
        const size = 6 + Math.random() * 6;

        return { left, delay, duration, color, size, id: i };
      }),
    []
  );

  if (!visible || !participante || !premio) return null;

  const botonesDeshabilitados = modoAnimacion !== "none";

  function handleConfirmarClick() {
    if (!onConfirmar || botonesDeshabilitados) return;
    setModoAnimacion("confeti");

    setTimeout(() => {
      onConfirmar();
      setModoAnimacion("none");
    }, CONFETTI_TOTAL_MS);
  }

  function handleDescartarClick() {
    if (!onDescartar || botonesDeshabilitados) return;

    setModoAnimacion("triste");

    setTimeout(() => {
      onDescartar();
      setModoAnimacion("none");
    }, discardConfig.durationMs);
  }


  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-sm">
      <div
        className={`
          relative w-full mx-4 
          max-w-4xl
          rounded-[26px] overflow-hidden
          bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950
          shadow-[0_40px_140px_rgba(15,23,42,0.95)]
          ${modoAnimacion === "triste" ? "modal-shake" : ""}
        `}
      >
        {/* Borde luminoso sutil */}
        <div className="pointer-events-none absolute inset-0 rounded-[26px] border border-white/7" />

        {/* Franja superior */}
        <div className="relative h-[5px] bg-gradient-to-r from-[#ffd34e] to-[#f8c537]" />

        {/* Confeti */}
        {modoAnimacion === "confeti" && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden z-20">
            {confetiItems.map((item) => (
              <div
                key={item.id}
                className="confeti-item"
                style={{
                  left: `${item.left}%`,
                  backgroundColor: item.color,
                  width: item.size,
                  height: item.size * 2,
                  animationDelay: `${item.delay}s`,
                  animationDuration: `${item.duration}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Overlay triste */}
        {modoAnimacion === "triste" && (
          <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/85">
            <div className="text-6xl mb-3">
              {discardConfig.emoji}
            </div>
            <p className="text-sm font-semibold text-slate-100 text-center px-4">
              {discardConfig.message}
            </p>
          </div>
        )}


        {/* CONTENIDO */}
        <div className="relative z-10 px-6 py-7 md:px-10 md:py-9 space-y-7">
          {/* HEADER CENTRADO */}
          <div className="flex flex-col items-center text-center space-y-3">
            <p className="text-[11px] tracking-[0.30em] uppercase text-slate-50">
              Ganador seleccionado
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#ffd34e] leading-snug break-words max-w-3xl">
              {participante.nombre}
            </h2>
          </div>

          {/* BLOQUE DE INFORMACIÓN ORGANIZADO */}
          <div className="grid lg:grid-cols-[1.2fr_0.05fr_1fr] gap-6 items-stretch">
            {/* Colaborador */}
            <div className="rounded-2xl bg-slate-950/80 border border-[#ffd34e]/50 px-5 py-4 text-xs text-slate-200 space-y-2 shadow-[0_22px_48px_rgba(15,23,42,0.85)]">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-300 mb-1">
                Datos del colaborador
              </p>

              <div className="space-y-1.5 text-[13px] leading-relaxed">
                {participante.codigo && (
                  <p>
                    <span className="font-semibold text-slate-300">
                      
                      Código:&nbsp;
                    </span>
                    <span className="text-[#ffd34e] ">
                    {participante.codigo}
                    </span>
                  </p>
                )}
                {participante.departamento && (
                  <p>
                    <span className="font-semibold text-slate-300">
                      Departamento:&nbsp;
                    </span>
                    <span className="text-[#ffd34e] ">
                    {participante.departamento}
                    </span>
                  </p>
                )}
                {participante.lugar && (
                  <p>
                    <span className="font-semibold text-slate-300">
                      Sucursal / Lugar:&nbsp;
                    </span>
                    <span className="text-[#ffd34e] ">
                    {participante.lugar}
                    </span>
                  </p>
                )}
                {participante.posicion && (
                  <p>
                    <span className="font-semibold text-slate-300">
                      Posición:&nbsp;
                    </span>
                    <span className="text-[#ffd34e] ">
                    {participante.posicion}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Separador visual en pantallas grandes */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="h-20 w-px bg-gradient-to-r from-[#ffd34e] to-[#f8c537]" />
            </div>

            {/* Premio */}
            <div className="rounded-2xl bg-slate-950/80 border border-[#ffd34e]/50  text-slate-200 px-5 py-4 text-xs space-y-2 ">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-300 mb-1">
                    Premio
                  </p>
                  <p className="text-sm md:text-base text-[#ffd34e] font-semibold leading-snug">
                    {premio.titulo}
                  </p>
                </div>

                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-950/70 border border-[#ffd34e] shadow-inner shadow-[#ffd34e]">
                  <span className="text-xl">🎁</span>
                </div>
              </div>

              {premio.descripcion && (
                <p className="mt-1 text-[11px] text-emerald-100/85 leading-relaxed">
                  {premio.descripcion}
                </p>
              )}

            </div>
          </div>

          {/* BOTONES ACCIÓN, CENTRADOS EN MOBILE / DERECHA EN DESKTOP */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 md:gap-3 pt-2">
            <button
              type="button"
              onClick={handleDescartarClick}
              disabled={botonesDeshabilitados}
              className={`w-full sm:w-auto px-4 py-2 rounded-full text-xs font-semibold border
                ${
                  botonesDeshabilitados
                    ? "border-slate-700 bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "border-slate-600 bg-slate-900/85 hover:bg-slate-800 text-slate-100 transition"
                }`}
            >
              Repetir (descartar participante)
            </button>
            <button
              type="button"
              onClick={handleConfirmarClick}
              disabled={botonesDeshabilitados}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-semibold
                ${
                  botonesDeshabilitados
                    ? "bg-emerald-700/70 text-white/70 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#ffd34e] to-[#f8c537] text-black shadow-[0_0_25px_rgba(0,0,0,0.55)] hover:scale-[1.03]"
                }`}
            >
              Confirmar ganador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
