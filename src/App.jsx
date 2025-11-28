import { useEffect, useMemo, useState } from "react";
import SelectorRifa from "./componentes/SelectorRifa.jsx";
import GestionRifa from "./componentes/GestionRifa.jsx";
import GestionParticipantes from "./componentes/GestionParticipantes.jsx";
import GestionPremios from "./componentes/GestionPremios.jsx";
import Ruleta from "./componentes/Ruleta.jsx";
import TablaGanadores from "./componentes/TablaGanadores.jsx";

// =========================
// Constantes y utilidades
// =========================

const CLAVE_LOCAL = "rifas_tombola_v2";

function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
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

/**
 * Helper para actualizar una rifa específica dentro del arreglo
 */
function actualizarRifaEnLista(rifas, idRifa, transformador) {
  return rifas.map((r) => (r.id === idRifa ? transformador(r) : r));
}

// =========================
// Componente principal
// =========================

export default function App() {
  // Estado base
  const [rifas, setRifas] = useState([]);
  const [idRifaSeleccionada, setIdRifaSeleccionada] = useState(null);

  // Estado del sorteo actual
  const [estaGirando, setEstaGirando] = useState(false);
  const [idParticipanteCandidato, setIdParticipanteCandidato] = useState(null);
  const [idPremioEnJuego, setIdPremioEnJuego] = useState(null);

  // Vista: sorteo / configuración
  const [vistaActual, setVistaActual] = useState("principal");

  //Collapse
  const [menuColapsado, setMenuColapsado] = useState(false);

  // =========================
  // Efectos: carga y persistencia
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
  // Selectores derivados
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
      (acc, p) => (!p.eliminado ? acc + (p.cantidadRestante || 0) : acc),
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
  // Acciones sobre rifas
  // =========================

  function crearRifa({ nombre, descripcion, duracionGiroSegundos }) {
    const nuevaRifa = {
      id: generarId(),
      nombre: nombre.trim(),
      descripcion: (descripcion || "").trim(),
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
      actualizarRifaEnLista(prev, rifaSeleccionada.id, (r) => ({
        ...r,
        ...parcial,
      }))
    );
  }

function eliminarRifa(idRifa) {
  setRifas((prev) => prev.filter((r) => r.id !== idRifa));

  // Si borraste la rifa seleccionada, cambia selección
  if (idRifaSeleccionada === idRifa) {
    setIdRifaSeleccionada(null);
    setIdParticipanteCandidato(null);
    setIdPremioEnJuego(null);
  }
}



  function finalizarRifaManual() {
    if (!rifaSeleccionada) return;
    actualizarRifa({ estado: "finalizada" });
  }

  // =========================
  // Acciones sobre participantes
  // =========================

  function agregarParticipante(nombre) {
    if (!rifaSeleccionada) return;
    const limpio = nombre.trim();
    if (!limpio) return;

    const nuevo = {
      id: generarId(),
      nombre: limpio,
      esGanador: false,
      eliminado: false,
      creadoEn: new Date().toISOString(),
    };

    setRifas((prev) =>
      actualizarRifaEnLista(prev, rifaSeleccionada.id, (r) => ({
        ...r,
        participantes: [...r.participantes, nuevo],
      }))
    );
  }

  function eliminarParticipante(idParticipante) {
    if (!rifaSeleccionada) return;

    setRifas((prev) =>
      actualizarRifaEnLista(prev, rifaSeleccionada.id, (r) => ({
        ...r,
        participantes: r.participantes.map((p) =>
          p.id === idParticipante ? { ...p, eliminado: true } : p
        ),
      }))
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
      actualizarRifaEnLista(prev, rifaSeleccionada.id, (r) => ({
        ...r,
        participantes: [...r.participantes, ...nuevos],
      }))
    );
  }

  // =========================
  // Acciones sobre premios
  // =========================

  function agregarPremio({ titulo, descripcion, orden, cantidad }) {
    if (!rifaSeleccionada) return;

    const tituloLimpio = titulo.trim();
    const cantidadNum = Number(cantidad);

    if (!tituloLimpio || !cantidadNum || cantidadNum <= 0) return;

    const nuevo = {
      id: generarId(),
      titulo: tituloLimpio,
      descripcion: (descripcion || "").trim(),
      orden: orden ? Number(orden) : null,
      cantidadTotal: cantidadNum,
      cantidadRestante: cantidadNum,
      eliminado: false,
      creadoEn: new Date().toISOString(),
    };

    setRifas((prev) =>
      actualizarRifaEnLista(prev, rifaSeleccionada.id, (r) => ({
        ...r,
        premios: [...r.premios, nuevo],
      }))
    );
  }

  function actualizarPremio(idPremio, parcial) {
    if (!rifaSeleccionada) return;

    setRifas((prev) =>
      actualizarRifaEnLista(prev, rifaSeleccionada.id, (r) => ({
        ...r,
        premios: r.premios.map((p) =>
          p.id === idPremio ? { ...p, ...parcial } : p
        ),
      }))
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
    if (!rifaSeleccionada || !puedeGirar()) return;

    const duracionMs = (rifaSeleccionada.duracionGiroSegundos || 5) * 1000;
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
      const premioSeleccionado = premiosLibres[0]; // no cambia de premio hasta agotarlo

      setIdParticipanteCandidato(participanteSeleccionado.id);
      setIdPremioEnJuego(premioSeleccionado.id);
      setEstaGirando(false);
    }, duracionMs);
  }

  function confirmarCandidatoComoGanador() {
    if (!rifaSeleccionada || !idParticipanteCandidato || !idPremioEnJuego)
      return;

    setRifas((prev) =>
      actualizarRifaEnLista(prev, rifaSeleccionada.id, (r) => {
        const nuevosParticipantes = r.participantes.map((p) =>
          p.id === idParticipanteCandidato ? { ...p, esGanador: true } : p
        );

        const nuevosPremios = r.premios.map((p) => {
          if (p.id !== idPremioEnJuego) return p;
          const restanteActual = p.cantidadRestante ?? p.cantidadTotal ?? 0;
          const nuevaCantidad = Math.max(restanteActual - 1, 0);

          return { ...p, cantidadRestante: nuevaCantidad };
        });

        const nuevoGanador = {
          id: generarId(),
          participanteId: idParticipanteCandidato,
          premioId: idPremioEnJuego,
          creadoEn: new Date().toISOString(),
        };

        const nuevosGanadores = [...r.ganadores, nuevoGanador];

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
      actualizarRifaEnLista(prev, rifaSeleccionada.id, (r) => ({
        ...r,
        participantes: r.participantes.map((p) =>
          p.id === idParticipanteCandidato ? { ...p, eliminado: true } : p
        ),
      }))
    );

    setIdParticipanteCandidato(null);
    setIdPremioEnJuego(null);
  }

  // =========================
  // Render
  // =========================

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        {/* MENÚ LATERAL */}
        <aside
  className={`
    ${menuColapsado ? "w-16" : "w-56 md:w-64"}
    border-r border-slate-800 bg-slate-950/80 px-4 py-6 flex flex-col gap-6 transition-all duration-300
  `}
>
<button
  onClick={() => setMenuColapsado(!menuColapsado)}
  className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 transition group"
  title={menuColapsado ? "Expandir menú" : "Colapsar menú"}
>
  <span className={`${menuColapsado ? "rotate-45 translate-y-0" : "-translate-y-2"} absolute block h-0.5 w-5 bg-slate-300 transition-all duration-300`} />
  <span className={`${menuColapsado ? "opacity-0" : "opacity-100"} absolute block h-0.5 w-5 bg-slate-300 transition-all duration-300`} />
  <span className={`${menuColapsado ? "-rotate-45 translate-y-0" : "translate-y-2"} absolute block h-0.5 w-5 bg-slate-300 transition-all duration-300`} />
</button>


  {/* TITULO */}
  {!menuColapsado && (
    <div>
      <div className="text-xs font-bold uppercase tracking-[0.25em] text-white">
        Panel administrativo
      </div>
    </div>
  )}

  {/* NAVEGACIÓN */}
  <nav className="flex flex-col gap-1 text-sm py-6">
    <button
      onClick={() => setVistaActual("principal")}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition ${
        vistaActual === "principal"
          ? "bg-blue-600/80 text-white shadow-lg shadow-blue-500/30"
          : "bg-slate-900/70 text-slate-300 hover:bg-slate-800"
      }`}
    >
      <span>🎰</span>
      {!menuColapsado && <span>Sorteo</span>}
    </button>

    <button
      onClick={() => setVistaActual("configuracion")}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition ${
        vistaActual === "configuracion"
          ? "bg-indigo-600/80 text-white shadow-lg shadow-indigo-500/30"
          : "bg-slate-900/70 text-slate-300 hover:bg-slate-800"
      }`}
    >
      <span>⚙️</span>
      {!menuColapsado && <span>Configuración</span>}
    </button>
  </nav>

  {/* INFORMACIÓN DE RIFA SELECCIONADA */}
  {!menuColapsado && (
    <div className="mt-auto text-[11px] text-slate-500">
      <p>
        Rifa seleccionada:
        <br />
        <span className="text-slate-200 font-semibold">
          {rifaSeleccionada ? rifaSeleccionada.nombre : "Ninguna"}
        </span>
      </p>

      {rifaSeleccionada && (
        <p className="mt-1">
          Estado:{" "}
          <span
            className={
              rifaSeleccionada.estado === "finalizada"
                ? "text-emerald-400"
                : "text-blue-400"
            }
          >
            {rifaSeleccionada.estado}
          </span>
        </p>
      )}
    </div>
  )}
</aside>


        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1">
          <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {vistaActual === "principal"
                    ? "Vista Principal"
                    : "Configuración de rifas"}
                </h1>
                <p className="text-slate-400 text-sm">
                  {vistaActual === "principal"
                    ? "Selecciona una rifa y corre la ruleta."
                    : "Configura la rifa, los participantes y los premios antes de iniciar."}
                </p>
              </div>

             <SelectorRifa
              rifas={rifas}
              idRifaSeleccionada={idRifaSeleccionada}
              onSeleccionarRifa={(id) => {
                setIdRifaSeleccionada(id);
                setIdParticipanteCandidato(null);
                setIdPremioEnJuego(null);
              }}
              onCrearRifa={crearRifa}
              soloCrearEnConfiguracion={vistaActual === "configuracion"}
            />
            </header>


            {!rifaSeleccionada ? (
              <div className="border border-dashed border-slate-700 rounded-2xl p-6 text-center text-slate-400">
                Crea tu rifa o seleciona una en el selector para comenzar.
              </div>
            ) : vistaActual === "configuracion" ? (
              // =========================
              // VISTA CONFIGURACIÓN
              // =========================
              <main className="grid md:grid-cols-2 gap-6 items-start">
                <section className="space-y-4">
                  

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
                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-6 space-y-3 text-xs 0">
                    <h2 className="text-lg font-semibold">
                      Resumen de configuración
                    </h2>
                    <p className="text-sm text-slate-400">
                      Participantes activos:{" "}
                      <span className="font-semibold text-slate-100">
                        {participantesDisponibles.length}
                      </span>
                    </p>
                    <p className="text-sm text-slate-400">
                      Tipos de premios activos:{" "}
                      <span className="font-semibold text-slate-100">
                        {premiosDisponibles.length}
                      </span>
                    </p>
                    <p className="text-sm text-slate-400">
                      Unidades de premio restantes:{" "}
                      <span className="font-semibold text-slate-100">
                        {totalUnidadesPremioRestantes}
                      </span>
                    </p>
                    <p className="mt-2 text-sm">
                      Cuando termines de configurar todo, ve a{" "}
                      <span className=" font-semibold">
                        Sorteo
                      </span>{" "}
                      desde el menú lateral para iniciar los giros.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            "¿Seguro que deseas eliminar esta rifa? Esta acción no se puede deshacer."
                          )
                        ) {
                          eliminarRifa(rifaSeleccionada.id);
                        }
                      }}
                      className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-red-600 hover:bg-red-500 text-white"
                    >
                      🗑️ Eliminar rifa
                    </button>

                  </div>

                  <TablaGanadores
                    rifa={rifaSeleccionada}
                    participantes={rifaSeleccionada.participantes}
                    premios={rifaSeleccionada.premios}
                  />
                </section>
              </main>
            ) : (
              // =========================
              // VISTA PRINCIPAL (SORTEO)
              // =========================
              <main className="grid md:grid-cols-2 gap-6 items-start">
                <section className="space-y-4">
                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-6 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
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

                    <div className="flex flex-row gap-2">
                      <button
                        onClick={iniciarGiro}
                        disabled={!puedeGirar()}
                        className={`px-4 py-1 rounded-full text-sm font-semibold transition transform ${
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
                              className="px-4 py-1 rounded-full text-sm font-semibold bg-red-900 hover:bg-red-700"
                            >
                              Repetir (descartar participante)
                            </button>
                            <button
                              onClick={confirmarCandidatoComoGanador}
                              className="px-4 py-1 rounded-full text-sm font-semibold bg-emerald-600 hover:bg-emerald-500"
                            >
                              Confirmar ganador
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

                    <div className="text-sm text-slate-500 space-y-1">
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
                </section>

                <section className="space-y-4">
                  <TablaGanadores
                    rifa={rifaSeleccionada}
                    participantes={rifaSeleccionada.participantes}
                    premios={rifaSeleccionada.premios}
                  />
                </section>
              </main>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
