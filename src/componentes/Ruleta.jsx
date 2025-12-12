import { useEffect, useState } from "react";

export default function Ruleta({
  nombres = [],
  estaGirando,
  participanteCandidato, // objeto con { nombre, ... }
}) {
  const [indiceActual, setIndiceActual] = useState(0);

  // =========================
  // Animación de nombres
  // =========================
  useEffect(() => {
    if (!estaGirando || !nombres || nombres.length === 0) {
      return;
    }

    // Reiniciamos al comenzar un giro
    setIndiceActual(0);

    let idx = 0;
    const intervalo = setInterval(() => {
      // puedes usar secuencial o aleatorio
      // idx = (idx + 1) % nombres.length;
      idx = Math.floor(Math.random() * nombres.length);
      setIndiceActual(idx);
    }, 80); // velocidad del “slot”

    return () => clearInterval(intervalo);
  }, [estaGirando, nombres]);

  // =========================
  // Nombre a mostrar
  // =========================
  let nombreEnPantalla = "Agrega colaboradores para comenzar";
  let textoEstado = "Lista para configurar";

  if (!nombres || nombres.length === 0) {
    nombreEnPantalla = "Agrega colaboradores para comenzar";
    textoEstado = "Sin participantes";
  } else if (participanteCandidato) {
    nombreEnPantalla = participanteCandidato.nombre;
    textoEstado = "Ganador provisional";
  } else if (estaGirando) {
    nombreEnPantalla = nombres[indiceActual] || nombres[0];
    textoEstado = "Girando…";
  } else {
    nombreEnPantalla = "Lista para girar";
    textoEstado = "Preparado";
  }

  // =========================
  // Tamaño de texto dinámico según longitud del nombre
  // =========================
  const longitud = nombreEnPantalla?.length || 0;
  let claseTamanoNombre =
    "text-[clamp(1.1rem,2.4vw,1.8rem)] md:text-[clamp(1.3rem,2.2vw,2.1rem)]";

  if (longitud > 35) {
    claseTamanoNombre =
      "text-[clamp(1rem,2.1vw,1.5rem)] md:text-[clamp(1.1rem,1.9vw,1.7rem)]";
  }
  if (longitud > 55) {
    claseTamanoNombre =
      "text-[clamp(0.9rem,1.8vw,1.3rem)] md:text-[clamp(1rem,1.6vw,1.4rem)]";
  }

  return (
    <div className="relative w-full flex items-center justify-center py-8">
      {/* “Marco” tipo pantalla */}
      <div
        className="relative w-full max-w-[1150px] mx-auto 
        bg-slate-900/80 border border-slate-700/80 rounded-3xl 
        px-6 md:px-10 py-6 shadow-[0_0_60px_rgba(15,23,42,0.9)] overflow-hidden"
      >
        {/* Brillo superior */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-16 bg-gradient-to-b from-bg-slate-900/70 via-transparent to-transparent blur-2xl" />

        {/* Título */}
        <p className="text-center text-[11px] md:text-xs tracking-[0.25em] uppercase text-slate-400 mb-4">
          Sorteo electrónico
        </p>

        {/* “Slot” donde va el nombre */}
        <div
          className="relative w-full bg-slate-950/80 text-[#ffd34e] 
          border border-[#ffd34e]/50 rounded-2xl 
          px-4 md:px-8 py-4 md:py-6 
          flex items-center justify-center overflow-hidden"
        >
          {/* Borde luminoso animado */}
          <div className="absolute inset-0 rounded-2xl border border-blue-500/10 pointer-events-none" />

          <div className="relative z-10 w-full flex justify-center">
            <p
              className={`mx-auto font-semibold leading-snug text-[#ffd34e] whitespace-nowrap ${claseTamanoNombre}`}
            >
              {nombreEnPantalla}
            </p>
          </div>

          {/* Sombra inferior */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-950 bg-slate-900/70 to-transparent" />
        </div>

        {/* Estado / leyenda */}
        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] ${
              estaGirando
                ? "border-[#ffd34e]/50 text-slate-300 "
                : participanteCandidato
                ? "border-[#ffd34e]/50 text-slate-300 "
                : "border-[#ffd34e]/50 text-slate-300"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                estaGirando
                  ? "bg-yellow-400 animate-ping"
                  : participanteCandidato
                  ? "bg-yellow-400"
                  : "bg-yellow-500"
              }`}
            />
            {textoEstado}
          </span>
        </div>
      </div>
    </div>
  );
}
