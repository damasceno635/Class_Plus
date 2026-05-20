import { useState } from "react";
import { TrendingUp, Calendar, BookOpen, Award, Download, Eye, CheckCircle } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

// Dados mockados do aluno logado (exemplo: Maria Silva)
const alunoData = {
  nome: "Maria Silva",
  matricula: "2024001",
  turma: "2º Ano A",
  mediaGeral: 8.4,
  frequencia: "94%",
  ranking: "5º lugar",
};

const notasPorBimestre = [
  { bimestre: "1º", matematica: 8.5, portugues: 9.0, ciencia: 7.5, historia: 8.0 },
  { bimestre: "2º", matematica: 8.0, portugues: 8.5, ciencia: 8.0, historia: 8.5 },
  { bimestre: "3º", matematica: 9.0, portugues: 9.5, ciencia: 8.5, historia: 9.0 },
  { bimestre: "4º", matematica: 9.5, portugues: 9.0, ciencia: 9.0, historia: 9.5 },
];

const desempenhoDisciplinas = [
  { subject: "Matemática", value: 8.8, fullMark: 10 },
  { subject: "Português", value: 9.0, fullMark: 10 },
  { subject: "Ciências", value: 8.2, fullMark: 10 },
  { subject: "História", value: 8.7, fullMark: 10 },
  { subject: "Geografia", value: 8.5, fullMark: 10 },
  { subject: "Inglês", value: 9.2, fullMark: 10 },
];

const boletim = [
  { disciplina: "Matemática", nota1: 8.5, nota2: 8.0, nota3: 9.0, nota4: 9.5, media: 8.8, faltas: 2 },
  { disciplina: "Português", nota1: 9.0, nota2: 8.5, nota3: 9.5, nota4: 9.0, media: 9.0, faltas: 1 },
  { disciplina: "Ciências", nota1: 7.5, nota2: 8.0, nota3: 8.5, nota4: 9.0, media: 8.2, faltas: 3 },
  { disciplina: "História", nota1: 8.0, nota2: 8.5, nota3: 9.0, nota4: 9.5, media: 8.7, faltas: 2 },
];

export default function DesempenhoStudent() {
  const [bimestreSelecionado, setBimestreSelecionado] = useState("4º");

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Cabeçalho */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Meu Desempenho</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Acompanhe suas notas, frequência e evolução</p>
          </div>

          {/* Cards de resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border"><div className="flex justify-between"><span className="text-slate-500">Média Geral</span><TrendingUp className="text-blue-500"/></div><p className="text-2xl font-bold mt-2">{alunoData.mediaGeral}</p></div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border"><div className="flex justify-between"><span className="text-slate-500">Frequência</span><Calendar className="text-green-500"/></div><p className="text-2xl font-bold mt-2">{alunoData.frequencia}</p></div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border"><div className="flex justify-between"><span className="text-slate-500">Disciplinas</span><BookOpen className="text-purple-500"/></div><p className="text-2xl font-bold mt-2">8</p></div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border"><div className="flex justify-between"><span className="text-slate-500">Ranking</span><Award className="text-yellow-500"/></div><p className="text-2xl font-bold mt-2">{alunoData.ranking}</p></div>
          </div>

          {/* Gráficos */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border">
              <h2 className="text-lg font-bold mb-2">Evolução das Notas</h2>
              <div className="h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={notasPorBimestre}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="bimestre"/><YAxis domain={[6,10]}/><Tooltip/><Legend/><Line type="monotone" dataKey="matematica" stroke="#2563eb"/><Line type="monotone" dataKey="portugues" stroke="#10b981"/><Line type="monotone" dataKey="ciencia" stroke="#f59e0b"/><Line type="monotone" dataKey="historia" stroke="#ef4444"/></LineChart></ResponsiveContainer></div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border">
              <h2 className="text-lg font-bold mb-2">Desempenho por Disciplina</h2>
              <div className="h-72"><ResponsiveContainer width="100%" height="100%"><RadarChart cx="50%" cy="50%" outerRadius="80%" data={desempenhoDisciplinas}><PolarGrid/><PolarAngleAxis dataKey="subject"/><PolarRadiusAxis domain={[0,10]}/><Radar name="Aluno" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6}/><Tooltip/></RadarChart></ResponsiveContainer></div>
            </div>
          </div>

          {/* Boletim */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border mb-8">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Boletim Escolar 2026</h2><button className="flex items-center gap-2 text-blue-600"><Download size={18}/> Baixar</button></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[700px]"><thead><tr className="border-b"><th className="text-left py-3">Disciplina</th><th className="text-center">1º Bim</th><th className="text-center">2º Bim</th><th className="text-center">3º Bim</th><th className="text-center">4º Bim</th><th className="text-center">Média</th><th className="text-center">Faltas</th><th>Situação</th></tr></thead><tbody>{boletim.map(item => (<tr key={item.disciplina} className="border-b"><td className="py-3 font-medium">{item.disciplina}</td><td className="text-center">{item.nota1}</td><td className="text-center">{item.nota2}</td><td className="text-center">{item.nota3}</td><td className="text-center">{item.nota4}</td><td className="text-center font-bold text-blue-600">{item.media}</td><td className="text-center">{item.faltas}</td><td className="text-center"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${item.media >= 7 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.media >= 7 ? 'Aprovado' : 'Recuperação'}</span></td></tr>))}</tbody></table></div>
          </div>

          {/* Dica de estudo */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-800"><div className="flex items-start gap-3"><CheckCircle className="text-blue-600 mt-1"/><div><h3 className="font-semibold text-blue-800 dark:text-blue-300">Dica de estudo</h3><p className="text-sm text-blue-700 dark:text-blue-200">Sua disciplina com maior potencial de melhoria é Ciências. Revise os conteúdos de ecossistemas e pratique exercícios.</p></div></div></div>
        </main>
        <Footer />
      </div>
    </div>
  );
}