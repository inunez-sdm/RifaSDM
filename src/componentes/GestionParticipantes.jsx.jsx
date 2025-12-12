import { useState } from "react";
import * as XLSX from "xlsx";

export default function GestionParticipantes({
  participantes,
  onAgregar,
  onAgregarLote,
  onEliminar,
}) {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [lugar, setLugar] = useState("");      // sucursal / lugar
  const [posicion, setPosicion] = useState(""); // posición / cargo
  const [textoLote, setTextoLote] = useState("");

  function handleAgregar(e) {
    e.preventDefault();
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio || !onAgregar) return;

    onAgregar({
      nombre: nombreLimpio,
      codigo: codigo.trim(),
      departamento: departamento.trim(),
      lugar: lugar.trim(),
      posicion: posicion.trim(),
    });

    setNombre("");
    setCodigo("");
    setDepartamento("");
    setLugar("");
    setPosicion("");
  }

  function handleAgregarLote(e) {
    e.preventDefault();
    if (!onAgregarLote || !textoLote.trim()) return;
    onAgregarLote(textoLote);
    setTextoLote("");
  }

  // CARGA DESDE EXCEL (ya funcionando, solo añadimos 'Codigo')
  async function handleCargarExcel(e) {
    const archivo = e.target.files?.[0];
    if (!archivo || !onAgregar) return;

    const reader = new FileReader();

    reader.onload = (evento) => {
      try {
        const datos = evento.target.result;
        const workbook = XLSX.read(datos, { type: "binary" });
        const nombreHoja = workbook.SheetNames[0];
        const hoja = workbook.Sheets[nombreHoja];
        const filas = XLSX.utils.sheet_to_json(hoja, { defval: "" });

        if (!Array.isArray(filas) || filas.length === 0) {
          alert("El archivo no tiene datos o no se pudo leer la hoja.");
          return;
        }

        filas.forEach((fila, idx) => {
          const nombre = String(
            fila.Nombre ||
              fila.nombre ||
              fila["Nombre del colaborador"] ||
              ""
          ).trim();

          if (!nombre) {
            console.log(`Fila ${idx + 2} sin nombre, se omite:`, fila);
            return;
          }

          const codigo = String(
            fila.Codigo ||
              fila.CÓDIGO ||
              fila.codigo ||
              fila.CODIGO ||
              ""
          ).trim();

          const departamento = String(
            fila.Departamento ||
              fila.departamento ||
              fila.DEPARTAMENTO ||
              ""
          ).trim();

          const lugar = String(
            fila.Sucursal ||
              fila.sucursal ||
              fila.SUCURSAL ||
              fila.Lugar ||
              fila.lugar ||
              ""
          ).trim();

          const posicion = String(
            fila.Posicion ||
              fila["Posición"] ||
              fila.posicion ||
              fila.POSICION ||
              fila.posición ||
              ""
          ).trim();

          onAgregar({
            nombre,
            codigo,
            departamento,
            lugar,
            posicion,
          });
        });
      } catch (err) {
        console.error("Error al leer el archivo de Excel:", err);
        alert(
          "No se pudo leer el archivo. Verifica que sea un Excel o CSV válido."
        );
      } finally {
        e.target.value = "";
      }
    };

    reader.readAsBinaryString(archivo);
  }

  const participantesActivos = participantes.filter((p) => !p.eliminado);

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-100">
          Participantes
        </h2>
        <span className="text-[11px] text-slate-400">
          Total:{" "}
          <span className="font-semibold text-slate-100">
            {participantesActivos.length}
          </span>
        </span>
      </div>

      {/* Formulario individual */}
      <form
        onSubmit={handleAgregar}
        className="grid md:grid-cols-2 gap-3 text-xs"
      >
        <div className="md:col-span-2">
          <label className="block mb-1 text-slate-300">
            Nombre del colaborador
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Ej: Juan Pérez García"
          />
        </div>

        <div>
          <label className="block mb-1 text-slate-300">Código</label>
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Ej: EMP-0001"
          />
        </div>

        <div>
          <label className="block mb-1 text-slate-300">Departamento</label>
          <input
            type="text"
            value={departamento}
            onChange={(e) => setDepartamento(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Ej: Ventas"
          />
        </div>

        <div>
          <label className="block mb-1 text-slate-300">
            Sucursal / Lugar
          </label>
          <input
            type="text"
            value={lugar}
            onChange={(e) => setLugar(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Ej: Sucursal Santo Domingo"
          />
        </div>

        <div>
          <label className="block mb-1 text-slate-300">
            Posición / Cargo
          </label>
          <input
            type="text"
            value={posicion}
            onChange={(e) => setPosicion(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Ej: Ejecutivo de Ventas"
          />
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-2xl border border-[#ffd34e]/50 text-xs font-semibold bg-[#141821] text-white hover:bg-gradient-to-r from-[#ffd34e] to-[#f8c537] hover:text-black shadow-[0_0_25px_rgba(0,0,0,0.55)]"
          >
            Añadir participante
          </button>
        </div>
      </form>

      {/* Lote por texto */}
      {/* 
      <div className="space-y-2 text-xs">
        <label className="block text-slate-300">
          Agregar varios nombres (uno por línea)
        </label>
        <textarea
          value={textoLote}
          onChange={(e) => setTextoLote(e.target.value)}
          rows={3}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder={"Ej:\nJuan Pérez\nMaría Gómez\nPedro Rodríguez"}
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleAgregarLote}
            className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100"
          >
            Agregar desde texto
          </button>
        </div>
      </div>

      */}

      {/* Carga desde Excel */}
      <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
        <label className="block text-slate-300">
          Cargar participantes desde Excel (.xlsx / .csv)
        </label>
        <p className="text-[11px] text-slate-400">
          Usa columnas con nombres:{" "}
          <span className="font-semibold text-slate-200">
            Nombre, Código, Departamento, Sucursal (o Lugar), Posición
          </span>
          .
        </p>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleCargarExcel}
          className="block w-full text-[11px] text-slate-300
                     file:mr-3 file:py-1.5 file:px-3
                     file:rounded-full file:border-0
                     file:text-[11px] file:font-semibold
                     file:bg-slate-800 file:text-slate-100
                     hover:file:bg-slate-700"
        />
      </div>

      {/* Lista de participantes */}
      <div className="border-t border-slate-800 pt-3 text-xs max-h-52 overflow-auto">
        {participantesActivos.length === 0 ? (
          <p className="text-slate-500 text-xs">
            Aún no hay participantes registrados.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {participantesActivos.map((p) => (
              <li
                key={p.id}
                className="flex items-start justify-between gap-2 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2"
              >
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-100">
                    {p.nombre}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {p.codigo && (
                      <>
                        <span className="font-semibold">Código: </span>
                        {p.codigo}
                        {" · "}
                      </>
                    )}
                    {p.departamento && (
                      <>
                        <span className="font-semibold">Depto: </span>
                        {p.departamento}
                        {" · "}
                      </>
                    )}
                    {p.lugar && (
                      <>
                        <span className="font-semibold">Sucursal: </span>
                        {p.lugar}
                        {" · "}
                      </>
                    )}
                    {p.posicion && (
                      <>
                        <span className="font-semibold">Posición: </span>
                        {p.posicion}
                      </>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onEliminar && onEliminar(p.id)}
                  className="text-[11px] text-red-400 hover:text-red-300"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
