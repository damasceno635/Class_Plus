import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Tag,
  Trash2,
  Pencil,
  X,
  Calendar as CalendarIcon,
  Info,
} from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../contexts/AuthContext";

/* ===================================================== */
/* TYPES & INTERFACES                                    */
/* ===================================================== */

type TipoEvento = "academic" | "administrative" | "holiday" | "meeting";

interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data: string; // Formato YYYY-MM-DD
  tipo: TipoEvento;
  horarioInicio: string;
  horarioFim: string;
}

/* ===================================================== */
/* MOCK INITIAL DATA                                     */
/* ===================================================== */

const MOCK_EVENTOS: Evento[] = [
  {
    id: "1",
    titulo: "Conselho de Classe - 1º Bimestre",
    descricao: "Reunião deliberativa com todos os professores e coordenadores pedagógicos.",
    data: "2026-05-22",
    tipo: "meeting",
    horarioInicio: "14:00",
    horarioFim: "17:30",
  },
  {
    id: "2",
    titulo: "Início das Provas Bimestrais",
    descricao: "Aplicação das avaliações oficiais do Ensino Médio e Fundamental.",
    data: "2026-05-25",
    tipo: "academic",
    horarioInicio: "07:30",
    horarioFim: "12:00",
  },
  {
    id: "3",
    titulo: "Feriado Nacional",
    descricao: "Recesso escolar institucional devido ao feriado nacional.",
    data: "2026-05-01",
    tipo: "holiday",
    horarioInicio: "00:00",
    horarioFim: "23:59",
  },
  {
    id: "4",
    titulo: "Renovação de Bolsas de Estudo",
    descricao: "Prazo limite para entrega da documentação socioeconômica na secretaria.",
    data: "2026-05-15",
    tipo: "administrative",
    horarioInicio: "08:00",
    horarioFim: "18:00",
  },
];

const tipoStylesMap: Record<TipoEvento, { bg: string; text: string; label: string; dot: string }> = {
  academic: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-600",
    label: "Académico",
  },
  administrative: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-400",
    dot: "bg-purple-600",
    label: "Administrativo",
  },
  holiday: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
    dot: "bg-green-600",
    label: "Feriado",
  },
  meeting: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-600",
    label: "Reunião",
  },
};

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

/* ===================================================== */
/* MAIN COMPONENT                                        */
/* ===================================================== */

export default function Calendar() {
  const { user } = useAuth();
  const isAdmin = user?.cargo === "admin";

  // Estados do Controle de Datas
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // Iniciando em Maio de 2026 conforme mocks
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date(2026, 4, 21).toISOString().split("T")[0] // Dia atual padrão baseado no contexto do projeto
  );

  // Estados dos Eventos
  const [eventos, setEventos] = useState<Evento[]>(MOCK_EVENTOS);
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);

  // Estados dos Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Evento | null>(null);

  // Estados do Formulário
  const [formTitulo, setFormTitulo] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTipo, setFormTipo] = useState<TipoEvento>("academic");
  const [formInicio, setFormInicio] = useState("08:00");
  const [formFim, setFormFim] = useState("09:00");

  const ano = currentDate.getFullYear();
  const mes = currentDate.getMonth();

  // Cálculos Calendário Vanilla
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();

  // Navegação de Meses
  const handlePrevMonth = () => setCurrentDate(new Date(ano, mes - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(ano, mes + 1, 1));

  // Agrupamento de eventos por data para renderização rápida no Grid
  const eventosPorData = useMemo(() => {
    const mapa: Record<string, Evento[]> = {};
    eventos.forEach((ev) => {
      if (!mapa[ev.data]) mapa[ev.data] = [];
      mapa[ev.data].push(ev);
    });
    return mapa;
  }, [eventos]);

  // Eventos do dia selecionado lateral/inferior
  const eventosDoDiaSelecionado = useMemo(() => {
    return eventosPorData[selectedDateStr] || [];
  }, [eventosPorData, selectedDateStr]);

  // Abrir modal para Criar
  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormTitulo("");
    setFormDescricao("");
    setFormDate(selectedDateStr);
    setFormTipo("academic");
    setFormInicio("08:00");
    setFormFim("09:00");
    setIsFormModalOpen(true);
  };

  // Abrir modal para Editar
  const handleOpenEdit = (evento: Evento, e: React.MouseEvent) => {
    e.stopPropagation(); // Previne abrir o modal de visualização comum
    setEditingEvent(evento);
    setFormTitulo(evento.titulo);
    setFormDescricao(evento.descricao);
    setFormDate(evento.data);
    setFormTipo(evento.tipo);
    setFormInicio(evento.horarioInicio);
    setFormFim(evento.horarioFim);
    setIsFormModalOpen(true);
  };

  // Salvar formulário (Criação ou Edição)
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim() || !formDate) return;

    if (editingEvent) {
      // Editar
      setEventos((prev) =>
        prev.map((ev) =>
          ev.id === editingEvent.id
            ? {
                ...ev,
                titulo: formTitulo,
                descricao: formDescricao,
                data: formDate,
                tipo: formTipo,
                horarioInicio: formInicio,
                horarioFim: formFim,
              }
            : ev
        )
      );
    } else {
      // Criar
      const novo: Evento = {
        id: String(Date.now()),
        titulo: formTitulo,
        descricao: formDescricao,
        data: formDate,
        tipo: formTipo,
        horarioInicio: formInicio,
        horarioFim: formFim,
      };
      setEventos((prev) => [...prev, novo]);
    }

    setIsFormModalOpen(false);
    setEditingEvent(null);
  };

  // Excluir Evento
  const handleDeleteEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Deseja realmente remover este evento do calendário?")) {
      setEventos((prev) => prev.filter((ev) => ev.id !== id));
      if (selectedEvent?.id === id) setSelectedEvent(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full min-w-0 flex flex-col lg:flex-row gap-6">
          
          {/* SEÇÃO DA ESQUERDA: GRID DO CALENDÁRIO */}
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            
            {/* Topo do Controle Mensal */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CalendarIcon className="text-blue-600" size={24} />
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                  {MESES[mes]} <span className="text-slate-400 font-medium">{ano}</span>
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {DIAS_SEMANA.map((d, index) => (
                <div
                  key={d}
                  className={`text-xs font-bold uppercase tracking-wider py-2 ${
                    index === 0 || index === 6
                      ? "text-red-500 opacity-80"
                      : "text-slate-400"
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Grid dos Dias */}
            <div className="grid grid-cols-7 gap-1.5 md:gap-2 flex-1">
              {/* Espaços vazios do início do mês */}
              {Array.from({ length: primeiroDiaSemana }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="min-h-[70px] md:min-h-[100px] bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl opacity-40"
                />
              ))}

              {/* Dias ativos do mês */}
              {Array.from({ length: diasNoMes }).map((_, i) => {
                const diaNum = i + 1;
                const diaStr = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(diaNum).padStart(2, "0")}`;
                const eventosDoDia = eventosPorData[diaStr] || [];
                const isSelected = selectedDateStr === diaStr;

                return (
                  <button
                    key={`day-${diaNum}`}
                    onClick={() => setSelectedDateStr(diaStr)}
                    className={`
                      min-h-[75px] md:min-h-[110px] p-2 rounded-2xl flex flex-col justify-between items-start transition-all border text-left cursor-pointer relative group
                      ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-sm ring-1 ring-blue-500"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700"
                      }
                    `}
                  >
                    <span
                      className={`text-sm font-bold px-1.5 py-0.5 rounded-lg ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {diaNum}
                    </span>

                    {/* Lista interna de badges de eventos para desktop */}
                    <div className="w-full space-y-1 mt-1 hidden md:block overflow-hidden flex-1">
                      {eventosDoDia.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md truncate ${tipoStylesMap[ev.tipo].bg} ${tipoStylesMap[ev.tipo].text}`}
                        >
                          {ev.titulo}
                        </div>
                      ))}
                      {eventosDoDia.length > 2 && (
                        <div className="text-[9px] font-medium text-slate-400 dark:text-slate-500 pl-1">
                          + {eventosDoDia.length - 2} eventos
                        </div>
                      )}
                    </div>

                    {/* Indicadores de bolinha para mobile */}
                    <div className="flex gap-1 mt-1 md:hidden w-full justify-center">
                      {eventosDoDia.map((ev) => (
                        <span
                          key={ev.id}
                          className={`w-1.5 h-1.5 rounded-full ${tipoStylesMap[ev.tipo].dot}`}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SEÇÃO DA DIREITA: AGENDA DO DIA SELECIONADO */}
          <div className="w-full lg:w-96 flex flex-col gap-4">
            
            {/* Bloco Header Lateral */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Agenda do Dia</h3>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">
                    {selectedDateStr.split("-")[2]}/{selectedDateStr.split("-")[1]}/{selectedDateStr.split("-")[0]}
                  </p>
                </div>

                {isAdmin && (
                  <button
                    onClick={handleOpenCreate}
                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition shadow-md flex items-center justify-center cursor-pointer"
                    title="Adicionar Evento para este dia"
                  >
                    <Plus size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Listagem de cards de eventos */}
            <div className="flex-1 min-h-[300px] bg-white dark:bg-slate-900 rounded-3xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3 overflow-y-auto max-h-[500px] lg:max-h-none custom-scrollbar">
              {eventosDoDiaSelecionado.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                  <Info size={32} className="opacity-40 mb-2" />
                  <p className="text-sm font-medium">Nenhum compromisso marcado para este dia.</p>
                </div>
              ) : (
                eventosDoDiaSelecionado.map((ev) => {
                  const style = tipoStylesMap[ev.tipo];
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="group border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/20 transition-all cursor-pointer flex flex-col justify-between gap-3 relative"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                            {style.label}
                          </span>
                          
                          {/* Ações rápidas exclusivas do Admin */}
                          {isAdmin && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => handleOpenEdit(ev, e)}
                                className="p-1 text-slate-400 hover:text-yellow-500 rounded-md transition"
                                title="Editar"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={(e) => handleDeleteEvent(ev.id, e)}
                                className="p-1 text-slate-400 hover:text-red-500 rounded-md transition"
                                title="Excluir"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>

                        <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {ev.titulo}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <Clock size={14} className="text-slate-400" />
                        <span>{ev.horarioInicio} às {ev.horarioFim}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>

        {/* ===================================================== */}
        {/* MODAL: FORMULÁRIO (CRIAR / EDITAR)                    */}
        {/* ===================================================== */}
        {isFormModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  {editingEvent ? "Editar Evento" : "Criar Novo Evento"}
                </h3>
                <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveEvent} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Título do Evento *</label>
                  <input
                    type="text"
                    required
                    value={formTitulo}
                    onChange={(e) => setFormTitulo(e.target.value)}
                    placeholder="Ex: Reunião Pedagógica Inicial"
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Data *</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Categoria *</label>
                    <select
                      value={formTipo}
                      onChange={(e) => setFormTipo(e.target.value as TipoEvento)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="academic">Académico</option>
                      <option value="administrative">Administrativo</option>
                      <option value="holiday">Feriado</option>
                      <option value="meeting">Reunião</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Início *</label>
                    <input
                      type="time"
                      required
                      value={formInicio}
                      onChange={(e) => setFormInicio(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Término *</label>
                    <input
                      type="time"
                      required
                      value={formFim}
                      onChange={(e) => setFormFim(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Descrição / Notas complementares</label>
                  <textarea
                    rows={3}
                    value={formDescricao}
                    onChange={(e) => setFormDescricao(e.target.value)}
                    placeholder="Adicione observações importantes para quem visualizar este evento..."
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-md text-sm cursor-pointer"
                  >
                    {editingEvent ? "Atualizar Evento" : "Salvar Evento"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {/* MODAL: DETALHES (GERAL PARA TODOS OS CARGOS)           */}
        {/* ===================================================== */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase mb-2 ${tipoStylesMap[selectedEvent.tipo].bg} ${tipoStylesMap[selectedEvent.tipo].text}`}>
                    {tipoStylesMap[selectedEvent.tipo].label}
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    {selectedEvent.titulo}
                  </h3>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 text-slate-700 dark:text-slate-300 mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Clock size={16} className="text-slate-400" />
                  <span>Horário:</span>
                  <span className="text-slate-800 dark:text-white font-bold">{selectedEvent.horarioInicio} às {selectedEvent.horarioFim}</span>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Tag size={16} className="text-slate-400" />
                  <span>Data Execução:</span>
                  <span className="text-slate-800 dark:text-white font-bold">
                    {selectedEvent.data.split("-")[2]}/{selectedEvent.data.split("-")[1]}/{selectedEvent.data.split("-")[0]}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-sm leading-relaxed">
                  <p className="font-medium text-slate-400 text-xs uppercase tracking-wider mb-1">Descrição</p>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    {selectedEvent.descricao || "Nenhuma descrição adicional anexada a este evento."}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      setSelectedEvent(null);
                      handleOpenEdit(selectedEvent, e);
                    }}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-xl transition"
                  >
                    Editar Informações
                  </button>
                )}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-semibold hover:opacity-90 transition text-xs"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}