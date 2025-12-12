import { useEffect, useMemo, useState } from "react";
import SelectorRifa from "./componentes/SelectorRifa.jsx";
//import GestionRifa from "./componentes/GestionRifa.jsx";
import GestionParticipantes from "./componentes/GestionParticipantes.jsx";
import GestionPremios from "./componentes/GestionPremios.jsx";
import Ruleta from "./componentes/Ruleta.jsx";
import TablaGanadores from "./componentes/TablaGanadores.jsx";
import ModalConfirmacion from "./componentes/ModalConfirmacion.jsx";
import ModalGanador from "./componentes/ModalGanador.jsx";
import logoNavidad from "./assets/logo-navidad-sdm-2025.png";

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

function escaparCsv(valor) {
  const texto = (valor ?? "").toString().replace(/"/g, '""');
  return `"${texto}"`;
}

function exportarResultadosRifa(rifa, participantes, premios) {
  if (!rifa || !rifa.ganadores || rifa.ganadores.length === 0) {
    return;
  }

  const encabezados = [
    "N°",
    "Código",
    "Nombre del participante",
    "Departamento",
    "Sucursal",
    "Posición",
    "Premio",
    "Fecha",
    "Hora",
  ];

  const filas = rifa.ganadores.map((g, indice) => {
    const participante = participantes.find((p) => p.id === g.participanteId);
    const premio = premios.find((p) => p.id === g.premioId);
    const fecha = g.creadoEn ? new Date(g.creadoEn) : null;

    return [
      indice + 1,
      participante?.codigo || "",
      participante?.nombre || "Desconocido",
      participante?.departamento || "",
      participante?.lugar || "",
      participante?.posicion || "",
      premio?.titulo || "Sin premio",
      fecha ? fecha.toLocaleDateString() : "",
      fecha ? fecha.toLocaleTimeString() : "",
    ];
  });

  const lineas = [encabezados, ...filas].map((cols) =>
    cols.map(escaparCsv).join(";")
  );

  const contenido = lineas.join("\r\n");

  // 👇 BOM para que Excel detecte UTF-8 y respete acentos
  const BOM = "\uFEFF";

  const blob = new Blob([BOM + contenido], {
    type: "text/csv;charset=utf-8;",
  });

  const nombreLimpio =
    (rifa.nombre || "rifa").toLowerCase().replace(/[^a-z0-9]+/gi, "_");

  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.setAttribute("download", `resultados_${nombreLimpio || "rifa"}.csv`);
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

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

  // Collapse menú lateral
  const [menuColapsado, setMenuColapsado] = useState(false);

  // Modal eliminar rifa
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);

  // Modal ganador
  const [mostrarModalGanador, setMostrarModalGanador] = useState(false);
  const [ganadorReciente, setGanadorReciente] = useState(null);

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

  function agregarParticipante(entrada) {
    if (!rifaSeleccionada) return;

    const base =
      typeof entrada === "string" ? { nombre: entrada } : entrada || {};

    const nombreLimpio = base.nombre?.trim();
    if (!nombreLimpio) return;

    const nuevo = {
      id: generarId(),
      nombre: nombreLimpio,
      codigo: base.codigo?.trim() || "",
      departamento: base.departamento?.trim() || "",
      lugar: base.lugar?.trim() || "",
      posicion: base.posicion?.trim() || "",
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
      codigo: "",
      departamento: "",
      lugar: "",
      posicion: "",
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

    function agregarLotePremios(filas) {
    if (!rifaSeleccionada) return;
    if (!Array.isArray(filas) || filas.length === 0) return;

    const nuevos = filas
      .map((f) => {
        const titulo = (f.titulo ?? "").toString().trim();
        const descripcion = (f.descripcion ?? "").toString().trim();
        const cantidadNum = Number(f.cantidad);
        const ordenNum =
          f.orden === "" || f.orden === null || f.orden === undefined
            ? null
            : Number(f.orden);

        if (!titulo) return null;
        if (!cantidadNum || cantidadNum <= 0) return null;

        return {
          id: generarId(),
          titulo,
          descripcion,
          orden: Number.isFinite(ordenNum) ? ordenNum : null,
          cantidadTotal: cantidadNum,
          cantidadRestante: cantidadNum,
          eliminado: false,
          creadoEn: new Date().toISOString(),
        };
      })
      .filter(Boolean);

    if (nuevos.length === 0) return;

    setRifas((prev) =>
      actualizarRifaEnLista(prev, rifaSeleccionada.id, (r) => ({
        ...r,
        premios: [...r.premios, ...nuevos],
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
    if (idParticipanteCandidato || idPremioEnJuego) return false;
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
      const premioSeleccionado = premiosLibres[0];

      setIdParticipanteCandidato(participanteSeleccionado.id);
      setIdPremioEnJuego(premioSeleccionado.id);
      setEstaGirando(false);
      setMostrarModalGanador(true);
      setGanadorReciente(participanteSeleccionado);
    }, duracionMs);
  }

  function confirmarCandidatoComoGanador() {
    if (!rifaSeleccionada || !idParticipanteCandidato || !idPremioEnJuego) return;

    setRifas((prev) =>
      prev.map((r) => {
        if (r.id !== rifaSeleccionada.id) return r;

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
    setMostrarModalGanador(false);
  }

  function descartarCandidatoYRepetir() {
    if (!rifaSeleccionada || !idParticipanteCandidato) return;

    setRifas((prev) =>
      prev.map((r) => {
        if (r.id !== rifaSeleccionada.id) return r;

        const nuevosParticipantes = r.participantes.map((p) =>
          p.id === idParticipanteCandidato ? { ...p, eliminado: true } : p
        );

        return { ...r, participantes: nuevosParticipantes };
      })
    );

    setIdParticipanteCandidato(null);
    setIdPremioEnJuego(null);
    setMostrarModalGanador(false);
  }

  // =========================
  // Render
  // =========================

  return (
    <div className="min-h-screen bg-[#f7d96f] text-slate-100">
      <div className="flex min-h-screen">
        {/* MENÚ LATERAL */}
        <aside
          className={`
            bg-[#0f1115] border-r border-black/50
            px-2 md:px-4 py-4 md:py-6
            flex flex-col gap-4 md:gap-6
            shadow-[15px_0_45px_rgba(0,0,0,0.7)]
            transition-all duration-300
            ${menuColapsado ? "w-12 md:w-16" : "w-56 md:w-64"}
          `}
        >
          {/* HEADER DEL PANEL + BOTÓN HAMBURGUESA (DENTRO DEL PANEL) */}
          <div className="flex items-center justify-between">
            {!menuColapsado && (
              <div className="text-[9px] md:text-xs font-bold uppercase tracking-[0.30em] text-slate-100">
                Panel administrativo
              </div>
            )}

            <button
              type="button"
              onClick={() => setMenuColapsado((prev) => !prev)}
              className="
                inline-flex items-center justify-center
                w-10 h-10
                rounded-2xl
                bg-[#141821]
                border border-[#ffd34e]/50
                text-[#ffd34e]
                shadow-[0_0_18px_rgba(0,0,0,0.55)]
                hover:bg-[#191d27]
              "
              aria-label={menuColapsado ? "Mostrar panel" : "Ocultar panel"}
              title={menuColapsado ? "Mostrar panel" : "Ocultar panel"}
            >
              <span className="text-lg leading-none">
                {menuColapsado ? "☰" : "✕"}
              </span>
            </button>
          </div>

          {/* CONTENIDO DEL PANEL (solo cuando NO está colapsado) */}
          {!menuColapsado && (
            <>
              <nav className="flex flex-col gap-1 text-sm py-6">
                <button
                  onClick={() => setVistaActual("principal")}
                  className={`flex items-center justify-between px-3 py-2 rounded-2xl text-left transition-all ${
                    vistaActual === "principal"
                      ? "bg-[#141821] text-[#ffd34e] border border-[#ffd34e]/50 shadow-[0_0_18px_rgba(0,0,0,0.55)]"
                      : "bg-[#141821] text-slate-200 hover:bg-[#191d27]"
                  }`}
                >
                  <span>Sorteo</span>
                </button>

                <button
                  onClick={() => setVistaActual("configuracion")}
                  className={`flex items-center justify-between px-3 py-2 rounded-2xl text-left transition-all mt-1 ${
                    vistaActual === "configuracion"
                      ? "bg-[#141821] text-[#ffd34e] border border-[#ffd34e]/50 shadow-[0_0_18px_rgba(0,0,0,0.55)]"
                      : "bg-[#141821] text-slate-200 hover:bg-[#191d27]"
                  }`}
                >
                  <span>Configuración</span>
                </button>
              </nav>

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
                    <span className="text-[#ffd34e]">{rifaSeleccionada.estado}</span>
                  </p>
                )}
              </div>
            </>
          )}
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1">
          <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            <header
              className={`
                flex flex-col md:flex-row md:items-center md:justify-between gap-4
                rounded-3xl border px-4 py-4 md:px-6 md:py-5
                ${
                  vistaActual === "principal"
                    ? "bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 border-amber-400/60 text-slate-900 shadow-[0_22px_60px_rgba(0,0,0,0.35)]"
                    : "bg-slate-900/80 border-slate-800 text-slate-100"
                }
              `}
            >
              {vistaActual === "principal" ? (
                <div className="flex items-center gap-4 md:gap-6">
                  <img
                    src={logoNavidad}
                    alt="Fiesta de Navidad SDM 2025"
                    className="w-28 md:w-40 lg:w-48 drop-shadow-[0_15px_40px_rgba(0,0,0,0.45)]"
                  />
                  <div className="space-y-1">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight">
                      Sorteo Fiesta de Navidad SDM 2025
                    </h1>
                    <p className="text-xs md:text-sm text-slate-800/80 max-w-xl">
                      Selecciona la rifa, corre la ruleta y descubre quiénes serán los
                      ganadores de nuestra celebración navideña.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    Configuración de rifas
                  </h1>
                  <p className="text-slate-400 text-sm">
                    Configura la rifa, los participantes y los premios antes de iniciar.
                  </p>
                </div>
              )}

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
                    onAgregarLote={agregarLotePremios}
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
                      <span className="font-semibold">Sorteo</span>{" "}
                      desde el menú lateral para iniciar.
                    </p>

                    <div className="flex flex-wrap gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => setMostrarModalEliminar(true)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-[#ffd34e]/50 text-xs font-semibold bg-[#141821] text-white hover:bg-gradient-to-r from-[#ffd34e] to-[#f8c537] hover:text-black shadow-[0_0_25px_rgba(0,0,0,0.55)]"
                      >
                        🗑️ Eliminar rifa
                      </button>
                    </div>
                  </div>

                  <TablaGanadores
                    rifa={rifaSeleccionada}
                    participantes={rifaSeleccionada.participantes}
                    premios={rifaSeleccionada.premios}
                    onExportar={() =>
                      exportarResultadosRifa(
                        rifaSeleccionada,
                        rifaSeleccionada.participantes,
                        rifaSeleccionada.premios
                      )
                    }
                  />
                </section>
              </main>
            ) : (
              <main className="flex flex-col items-center gap-6 w-full">
                <section className="w-full space-y-4">
                  <div className="w-full bg-[#1a1d24] text-[#ffd34e] border border-[#ffd34e]/50 rounded-[32px] p-6 md:p-8 shadow-[0_28px_80px_rgba(0,0,0,0.85)]">
                    <div className="flex items-start justify-between">
                      <div />
                      <div className="flex flex-col items-end gap-1 text-xs">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${
                            rifaSeleccionada.estado === "finalizada"
                              ? " text-slate-300 border border-[#ffd34e]/50"
                              : "bg-[#1a1d24] text-slate-300 border border-[#ffd34e]/50"
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                          {rifaSeleccionada.estado === "finalizada"
                            ? "Finalizada"
                            : "Activa"}
                        </span>
                      </div>
                    </div>

                    <Ruleta
                      nombres={participantesDisponibles.map((p) => p.nombre)}
                      estaGirando={estaGirando}
                      participanteCandidato={participanteCandidatoActual}
                    />

                    <div className="mt-5 flex flex-col items-center gap-3">
                      <div className="flex flex-wrap justify-center gap-">
                        <button
                          onClick={iniciarGiro}
                          disabled={!puedeGirar()}
                          className={`px-7 py-2.5 rounded-full text-sm font-semibold transition-transform ${
                            puedeGirar()
                              ? "bg-gradient-to-r from-[#ffd34e] to-[#f8c537] text-black shadow-[0_0_25px_rgba(0,0,0,0.55)] hover:scale-[1.03]"
                              : "bg-[#343847] text-slate-400 cursor-not-allowed"
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
                                className="px-4 py-2 rounded-full text-sm font-semibold bg-[#1f2937] text-slate-200 hover:bg-[#111827] border border-slate-600/60"
                              >
                                Repetir (descartar participante)
                              </button>
                              <button
                                onClick={confirmarCandidatoComoGanador}
                                className="px-4 py-2 rounded-full text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_18px_rgba(16,185,129,0.45)]"
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
                              className="px-4 py-2 rounded-full text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                              Finalizar rifa y mostrar resultados
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </section>
              </main>
            )}
          </div>
        </div>
      </div>

      <ModalConfirmacion
        abierto={mostrarModalEliminar && !!rifaSeleccionada}
        titulo="Eliminar rifa"
        mensaje={
          rifaSeleccionada
            ? `¿Seguro que deseas eliminar la rifa "${rifaSeleccionada.nombre}"?\nEsta acción no se puede deshacer.`
            : "¿Seguro que deseas eliminar esta rifa?"
        }
        textoConfirmar="Sí, eliminar"
        textoCancelar="Cancelar"
        onConfirmar={() => {
          if (rifaSeleccionada) {
            eliminarRifa(rifaSeleccionada.id);
          }
          setMostrarModalEliminar(false);
        }}
        onCerrar={() => setMostrarModalEliminar(false)}
      />

      <ModalGanador
        visible={
          mostrarModalGanador &&
          !!participanteCandidatoActual &&
          !!premioEnJuegoActual
        }
        participante={participanteCandidatoActual}
        premio={premioEnJuegoActual}
        onConfirmar={confirmarCandidatoComoGanador}
        onDescartar={descartarCandidatoYRepetir}
      />
    </div>
  );
}

