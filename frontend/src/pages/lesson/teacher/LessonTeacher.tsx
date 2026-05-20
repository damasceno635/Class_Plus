import { useState } from "react";
import { Plus, BookOpen, Clock, Trash2, Pencil } from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

type Aula = {
  id: number;
  disciplina: string;
  turma: string;
  data: string;
  horario: string;
  conteudo: string;
  objetivos: string;
  atividades: string;
};

const mockAulas: Aula[] = [
  {
    id: 1,
    disciplina: "Matemática",
    turma: "2º Ano A",
    data: "2026-05-20",
    horario: "08:00",
    conteudo: "Equações do 2º grau",
    objetivos: "Compreender resolução de equações",
    atividades: "Exercícios + revisão"
  }
];

export default function LessonProfessor() {
  const [aulas, setAulas] = useState(mockAulas);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Roteiro de Aula</h1>
              <p className="text-slate-500 dark:text-slate-400">Planejamento pedagógico do professor</p>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl"
            >
              <Plus size={18} /> Nova Aula
            </button>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {aulas.map((aula) => (
              <div key={aula.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between mb-4">
                  <BookOpen className="text-blue-600" />
                  <div className="flex gap-2">
                    <button className="p-2 rounded-xl bg-amber-500 text-white"><Pencil size={16} /></button>
                    <button className="p-2 rounded-xl bg-red-600 text-white"><Trash2 size={16} /></button>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{aula.disciplina}</h2>
                <p className="text-slate-500 mt-1">{aula.turma}</p>
                <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <p><strong>Data:</strong> {aula.data}</p>
                  <p className="flex items-center gap-2"><Clock size={16} /> {aula.horario}</p>
                  <p><strong>Conteúdo:</strong> {aula.conteudo}</p>
                  <p><strong>Objetivos:</strong> {aula.objetivos}</p>
                  <p><strong>Atividades:</strong> {aula.atividades}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>

      {open && <ModalNovaAula onClose={() => setOpen(false)} />}
    </div>
  );
}

function ModalNovaAula({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Novo Roteiro</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Disciplina" />
          <Input label="Turma" />
          <Input label="Data" type="date" />
          <Input label="Horário" type="time" />
        </div>

        <div className="mt-4 space-y-4">
          <Textarea label="Conteúdo da aula" />
          <Textarea label="Objetivos" />
          <Textarea label="Atividades" />
          <Textarea label="Observações" />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-5 py-3 rounded-2xl border">Cancelar</button>
          <button className="px-5 py-3 rounded-2xl bg-blue-600 text-white">Salvar</button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, type = "text" }: { label: string; type?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-700 dark:text-white">{label}</label>
      <input type={type} className="p-4 rounded-2xl border dark:bg-slate-800 dark:text-white" />
    </div>
  );
}

function Textarea({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-700 dark:text-white">{label}</label>
      <textarea rows={4} className="p-4 rounded-2xl border dark:bg-slate-800 dark:text-white" />
    </div>
  );
}
