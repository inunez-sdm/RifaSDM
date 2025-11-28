import { useEffect, useRef, useState } from "react";

export default function Ruleta({
  nombres,
  estaGirando,
  participanteCandidato,
}) {
  const [nombreVisible, setNombreVisible] = useState("");
  const intervaloRef = useRef(null);

  useEffect(() => {
    // Cuando empieza a girar: mostrar nombres aleatorios
    if (estaGirando && nombres.length > 0) {
      if (intervaloRef.current) clearInterval(intervaloRef.current);

      intervaloRef.current = setInterval(() => {
        const indice = Math.floor(Math.random() * nombres.length);
        setNombreVisible(nombres[indice]);
      }, 90);
    }

    // Cuando termina de girar y ya hay un candidato seleccionado
    if (!estaGirando && participanteCandidato) {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
        intervaloRef.current = null;
      }
      setNombreVisible(participanteCandidato.nombre);
    }

    // Si no hay nombres ni candidato
    if (!estaGirando && !participanteCandidato && nombres.length === 0) {
      setNombreVisible("");
    }

    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
        intervaloRef.current = null;
      }
    };
  }, [estaGirando, nombres, participanteCandidato]);

  const hayNombres = nombres.length > 0 || participanteCandidato;

  return (
    <div className="relative">
      <div className="mx-auto max-w-xs bg-slate-950 border border-slate-800 rounded-2xl px-4 py-6 flex flex-col items-center gap-4 shadow-inner shadow-black/60">
        <div className="text-[18px] uppercase tracking-[0.25em] text-slate-500">
          Sorteo electrónico
        </div>

        <div className="relative w-full h-20 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 flex items-center justify-center">
          <div className="absolute inset-y-0 left-0 right-0 pointer-events-none bg-gradient-to-b from-slate-900 via-transparent to-slate-900 opacity-80" />
          <div
            className={`relative z-10 text-center px-4 text-4xl font-semibold ${
              estaGirando ? "animate-pulse" : ""
            }`}
          >
            {hayNombres ? (
              <span className="truncate inline-block max-w-full">
                {nombreVisible || "..."}
              </span>
            ) : (
              <span className="text-slate-500 text-lg">
                Agrega colaboradores para comenzar
              </span>
            )}
          </div>
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-center pointer-events-none">
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500/70 to-transparent" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-[14px] text-slate-500">
          <span
            className={`w-2 h-2 rounded-full ${
              estaGirando ? "bg-amber-400 animate-ping" : "bg-slate-600"
            }`}
          />
          {estaGirando ? "Girando..." : "Lista para girar"}
        </div>
      </div>
    </div>
  );
}
