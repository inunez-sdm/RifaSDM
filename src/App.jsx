import { useEffect, useMemo, useState } from "react";
import SelectorRifa from "./componentes/SelectorRifa.jsx";
import GestionRifa from "./componentes/GestionRifa.jsx";
import GestionParticipantes from "./componentes/GestionParticipantes.jsx";
import GestionPremios from "./componentes/GestionPremios.jsx";
import Ruleta from "./componentes/Ruleta.jsx";
import TablaGanadores from "./componentes/TablaGanadores.jsx";

const CLAVE_LOCAL = "rifas_tombola_v2";

function generarId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
  );
}

function cargarRifasIniciales() {
  try {
    const texto = localStorage.getItem(CLAVE_LOCAL);
    if (!texto) return [];
    return JSON.parse(texto);
  } catch (e) {
    console.error("Error al leer rifas de localStorage", e);
    return [];
  }
}

function guardarRifas(rifas) {
  try {
    localStorage.setItem(CLAVE_LOCAL, JSON.stringify(rifas));
  } catch (e) {
    console.error("Error al guardar rifas en localStorage", e);
  }
}

export default function App() {
  const [rifas, setRifas] = useState([]);
  const [idRifaSeleccionada, setIdRifaSeleccionada] = useState(null);

  const [estaGirando, setEstaGirando] = useState(false);
  const [idParticipanteCandidato, setIdParticipanteCandidato] = useState(null);
  const [idPremioEnJuego, setIdPremioEnJuego] = useState(null);

  // =========================
  // Carga inicial y guardado
  // =========================
  useEffect(() => {
    const iniciales = cargarRifasIniciales();
    setRifas(iniciales);
    if (iniciales.length > 0) {
      setIdRifaSeleccionada(iniciales[0].id);
    }
  }, []);

  useEffect(() => {
    guardarRifas(rifas);
  }, [rifas]);

  // =========================
  // Derivados
  // =========================
  const rifaSeleccionada = useMemo(
    () => rifas.find((r) => r.id === idRifaSeleccionada) || null,
    [rifas, idRifaSeleccionada]
  );

  const participantesDisponibles = useMemo(() => {
    if (!rifaSeleccionada) return [];
    return rifaSeleccionada.participantes.filter(
      (p) => !p.esGanador && !p.eliminado
    );
  }, [rifaSeleccionada]);

  const premiosDisponibles = useMemo(() => {
    if (!rifaSeleccionada) return [];
    return rifaSeleccionada.premios
      .filter((p) => (p.cantidadRestante || 0) > 0 && !p.eliminado)
      .sort((a, b) => (a.orden || 0) - (b.orden || 0));
  }, [rifaSeleccionada]);

  const totalUnidadesPremioRestantes = useMemo(() => {
    if (!rifaSeleccionada) return 0;
    return rifaSeleccionada.premios.reduce(
      (acc, p) =>
        !p.eliminado ? acc + (p.cantidadRestante || 0) : acc,
      0
    );
  }, [rifaSeleccionada]);

  const participanteCandidatoActual = useMemo(() => {
    if (!rifaSeleccionada || !idParticipanteCandidato) return null;
    return rifaSeleccionada.participantes.find(
      (p) => p.id === idParticipanteCandidato
    );
  }, [rifaSeleccionada, idParticipanteCandidato]);

  const premioEnJuegoActual = useMemo(() => {
    if (!rifaSeleccionada || !idPremioEnJuego) return null;
    return rifaSeleccionada.premios.find((p) => p.id === idPremioEnJuego);
  }, [rifaSeleccionada, idPremioEnJuego]);

  // =========================
  // Acciones de rifa
  // =========================
  function crearRifa({ nombre, descripcion, duracionGiroSegundos }) {
    const nuevaRifa = {
      id: generarId(),
      nombre,
      descripcion: descripcion || "",
      duracionGiroSegundos: Number(duracionGiroSegundos) || 5,
      estado: "activa", // borrador | activa | finalizada
      participantes: [],
      premios: [],
      ganadores: [],
      creadaEn: new Date().toISOString(),
    };

    setRifas((prev) => [...prev, nuevaRifa]);
    setIdRifaSeleccionada(nuevaRifa.id);
    setIdParticipanteCandidato(null);
    setIdPremioEnJuego(null);
  }

  function actualizarRifa(parcial) {
    if (!rifaSeleccionada) return;
    setRifas((prev) =>
      prev.map((r) =>
        r.id === rifaSeleccionada.id ? { ...r, ...parcial } : r
      )
    );
  }

  // =========================
  // Participantes
  // =========================
  function agregarParticipante(nombre) {
    if (!rifaSeleccionada || !nombre.trim()) return;
    const nuevo = {
      id: generarId(),
      nombre: nombre.trim(),
      esGanador: false,
      eliminado: false,
      creadoEn: new Date().toISOString(),
    };
    setRifas((prev) =>
      prev.map((r) =>
        r.id === rifaSeleccionada.id
          ? { ...r, participantes: [...r.participantes, nuevo] }
          : r
      )
    );
  }

  function eliminarParticipante(idParticipante) {
    if (!rifaSeleccionada) return;
    setRifas((prev) =>
      prev.map((r) =>
        r.id === rifaSeleccionada.id
          ? {
              ...r,
              participantes: r.participantes.map((p) =>
                p.id === idParticipante ? { ...p, eliminado: true } : p
              ),
            }
          : r
      )
    );
  }

  function agregarLoteParticipantes(textoPegado) {
    if (!rifaSeleccionada) return;
    const lineas = textoPegado
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lineas.length === 0) return;

    const nuevos = lineas.map((nombre) => ({
      id: generarId(),
      nombre,
      esGanador: false,
      eliminado: false,
      creadoEn: new Date().toISOString(),
    }));

    setRifas((prev) =>
      prev.map((r) =>
        r.id === rifaSeleccionada.id
          ? { ...r, participantes: [...r.participantes, ...nuevos] }
          : r
      )
    );
  }

  // =========================
  // Premios
  // =========================
  function agregarPremio({ titulo, descripcion, orden, cantidad }) {
    if (!rifaSeleccionada || !titulo.trim()) return;

    const cantidadNum = Number(cantidad);
    if (!cantidadNum || cantidadNum <= 0) return;

    const nuevo = {
      id: generarId(),
      titulo: titulo.trim(),
      descripcion: (descripcion || "").trim(),
      orden: orden ? Number(orden) : null,
      cantidadTotal: cantidadNum,
      cantidadRestante: cantidadNum,
      eliminado: false,
      creadoEn: new Date().toISOString(),
    };

    setRifas((prev) =>
      prev.map((r) =>
        r.id === rifaSeleccionada.id
          ? { ...r, premios: [...r.premios, nuevo] }
          : r
      )
    );
  }

  function actualizarPremio(idPremio, parcial) {
    if (!rifaSeleccionada) return;
    setRifas((prev) =>
      prev.map((r) =>
        r.id === rifaSeleccionada.id
          ? {
              ...r,
              premios: r.premios.map((p) =>
                p.id === idPremio ? { ...p, ...parcial } : p
              ),
            }
          : r
      )
    );
  }

  function eliminarPremio(idPremio) {
    actualizarPremio(idPremio, { eliminado: true });
  }

  // =========================
  // Lógica de giro
  // =========================
  function puedeGirar() {
    if (!rifaSeleccionada) return false;
    if (rifaSeleccionada.estado === "finalizada") return false;
    if (participantesDisponibles.length === 0) return false;
    if (premiosDisponibles.length === 0) return false;
    if (estaGirando) return false;
    if (idParticipanteCandidato || idPremioEnJuego) return false; // hay candidato pendiente
    return true;
  }

  function iniciarGiro() {
    if (!rifaSeleccionada) return;
    if (!puedeGirar()) return;

    const duracionMs = (rifaSeleccionada.duracionGiroSegundos || 5) * 1000;

    // Snapshot de disponibles en el momento del giro
    const participantesLibres = participantesDisponibles;
    const premiosLibres = premiosDisponibles;

    if (participantesLibres.length === 0 || premiosLibres.length === 0) return;

    setEstaGirando(true);
    setIdParticipanteCandidato(null);
    setIdPremioEnJuego(null);

    setTimeout(() => {
      const indiceAleatorio = Math.floor(
        Math.random() * participantesLibres.length
      );
      const participanteSeleccionado = participantesLibres[indiceAleatorio];
      const premioSeleccionado = premiosLibres[0]; // No cambia de premio hasta que se agote

      setIdParticipanteCandidato(participanteSeleccionado.id);
      setIdPremioEnJuego(premioSeleccionado.id);
      setEstaGirando(false);
    }, duracionMs);
  }

  function confirmarCandidatoComoGanador() {
    if (!rifaSeleccionada || !idParticipanteCandidato || !idPremioEnJuego)
      return;

    setRifas((prev) =>
      prev.map((r) => {
        if (r.id !== rifaSeleccionada.id) return r;

        // Participantes
        const nuevosParticipantes = r.participantes.map((p) =>
          p.id === idParticipanteCandidato ? { ...p, esGanador: true } : p
        );

        // Premios (restar 1 unidad al premio en juego)
        const nuevosPremios = r.premios.map((p) => {
          if (p.id !== idPremioEnJuego) return p;
          const restanteActual = p.cantidadRestante ?? p.cantidadTotal ?? 0;
          const nuevaCantidad = Math.max(restanteActual - 1, 0);
          return {
            ...p,
            cantidadRestante: nuevaCantidad,
          };
        });

        const nuevoGanador = {
          id: generarId(),
          participanteId: idParticipanteCandidato,
          premioId: idPremioEnJuego,
          creadoEn: new Date().toISOString(),
        };

        const nuevosGanadores = [...r.ganadores, nuevoGanador];

        // ¿Quedan unidades de algún premio?
        const quedanUnidades = nuevosPremios.some(
          (p) => (p.cantidadRestante || 0) > 0 && !p.eliminado
        );

        return {
          ...r,
          participantes: nuevosParticipantes,
          premios: nuevosPremios,
          ganadores: nuevosGanadores,
          estado: quedanUnidades ? r.estado : "finalizada",
        };
      })
    );

    setIdParticipanteCandidato(null);
    setIdPremioEnJuego(null);
  }

  function descartarCandidatoYRepetir() {
    if (!rifaSeleccionada || !idParticipanteCandidato) return;

    setRifas((prev) =>
      prev.map((r) => {
        if (r.id !== rifaSeleccionada.id) return r;

        const nuevosParticipantes = r.participantes.map((p) =>
          p.id === idParticipanteCandidato ? { ...p, eliminado: true } : p
        );

        // El premio en juego NO se toca (no se entregó)

        return {
          ...r,
          participantes: nuevosParticipantes,
        };
      })
    );

    setIdParticipanteCandidato(null);
    setIdPremioEnJuego(null);
  }

  function finalizarRifaManual() {
    if (!rifaSeleccionada) return;
    actualizarRifa({ estado: "finalizada" });
  }

  // =========================
  // Render
  // =========================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Rifa electrónica SDM
            </h1>
            <p className="text-slate-400 text-sm">
              Gestiona rifas, premios y colaboradores fácil y simple.
            </p>
          </div>
          <SelectorRifa
            rifas={rifas}
            idRifaSeleccionada={idRifaSeleccionada}
            onSeleccionarRifa={setIdRifaSeleccionada}
            onCrearRifa={crearRifa}
          />
        </header>

        {rifaSeleccionada ? (
          <main className="grid md:grid-cols-2 gap-6 items-start">
            <section className="space-y-4">
              <GestionRifa rifa={rifaSeleccionada} onActualizar={actualizarRifa} />

              <GestionParticipantes
                participantes={rifaSeleccionada.participantes}
                onAgregar={agregarParticipante}
                onAgregarLote={agregarLoteParticipantes}
                onEliminar={eliminarParticipante}
              />

              <GestionPremios
                premios={rifaSeleccionada.premios}
                onAgregar={agregarPremio}
                onActualizar={actualizarPremio}
                onEliminar={eliminarPremio}
              />
            </section>

            <section className="space-y-4">
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-lg">
                      Máquina tragamonedas
                    </h2>
                    {premioEnJuegoActual && (
                      <p className="text-xs text-slate-400">
                        Premio en juego:{" "}
                        <span className="text-slate-100 font-semibold">
                          {premioEnJuegoActual.titulo}
                        </span>{" "}
                        (
                        {premioEnJuegoActual.cantidadRestante} de{" "}
                        {premioEnJuegoActual.cantidadTotal} restantes)
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                        rifaSeleccionada.estado === "finalizada"
                          ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700/60"
                          : "bg-blue-900/60 text-blue-300 border border-blue-700/60"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                      {rifaSeleccionada.estado === "finalizada"
                        ? "Finalizada"
                        : "Activa"}
                    </span>
                    <span className="text-slate-500">
                      Giro: {rifaSeleccionada.duracionGiroSegundos}s
                    </span>
                  </div>
                </div>

                <Ruleta
                  nombres={participantesDisponibles.map((p) => p.nombre)}
                  estaGirando={estaGirando}
                  participanteCandidato={participanteCandidatoActual}
                />

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={iniciarGiro}
                    disabled={!puedeGirar()}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition transform ${
                      puedeGirar()
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:scale-105 shadow-lg shadow-blue-500/30"
                        : "bg-slate-700 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {estaGirando ? "Girando..." : "Iniciar giro"}
                  </button>

                  {rifaSeleccionada.estado !== "finalizada" &&
                    !estaGirando &&
                    participanteCandidatoActual && (
                      <>
                        <button
                          onClick={descartarCandidatoYRepetir}
                          className="px-4 py-2 rounded-full text-sm font-semibold bg-slate-800 hover:bg-slate-700"
                        >
                          Repetir (descartar participante)
                        </button>
                        <button
                          onClick={confirmarCandidatoComoGanador}
                          className="px-4 py-2 rounded-full text-sm font-semibold bg-emerald-600 hover:bg-emerald-500"
                        >
                          Confirmar ganador y entregar premio
                        </button>
                      </>
                    )}

                  {rifaSeleccionada.estado !== "finalizada" &&
                    premiosDisponibles.length === 0 &&
                    rifaSeleccionada.ganadores.length > 0 && (
                      <button
                        onClick={finalizarRifaManual}
                        className="px-4 py-2 rounded-full text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 transition"
                      >
                        Finalizar rifa y mostrar resultados
                      </button>
                    )}
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <p>
                    Participantes disponibles:{" "}
                    <span className="font-semibold text-slate-300">
                      {participantesDisponibles.length}
                    </span>
                    {" · "}
                    Tipos de premios activos:{" "}
                    <span className="font-semibold text-slate-300">
                      {premiosDisponibles.length}
                    </span>
                    {" · "}
                    Unidades de premio restantes:{" "}
                    <span className="font-semibold text-slate-300">
                      {totalUnidadesPremioRestantes}
                    </span>
                  </p>
                </div>
              </div>

              <TablaGanadores
                rifa={rifaSeleccionada}
                participantes={rifaSeleccionada.participantes}
                premios={rifaSeleccionada.premios}
              />
            </section>
          </main>
        ) : (
          <div className="border border-dashed border-slate-700 rounded-2xl p-6 text-center text-slate-400">
            Crea tu primera rifa para comenzar.
          </div>
        )}
      </div>
    </div>
  );
}
