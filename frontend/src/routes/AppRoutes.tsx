import { Routes, Route } from "react-router-dom";

import Profile from "../pages/profile/Profile";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";

import Alunos from "../pages/alunos/Alunos";
import NovoAluno from "../pages/alunos/NovoAluno";
import VisualizarAluno from "../pages/alunos/VisualizarAluno";
import EditarAluno from "../pages/alunos/EditarAluno";

import Funcionarios from "../pages/funcionarios/Funcionarios";
import NovoFuncionario from "../pages/funcionarios/NovoFuncionario";
import VisualizarFuncionario from "../pages/funcionarios/VisualizarFuncionario";
import EditarFuncionario from "../pages/funcionarios/EditarFuncionario";

import Desempenho from "../pages/academic/Desempenho";
import Financeiro from "../pages/financial/Financeiro";
import RoteiroAula from "../pages/lesson/RoteiroAula";
import Calendario from "../pages/calendar/Calendario";
import Requisicoes from "../pages/requests/Requisicoes";
import Relatorios from "../pages/relate/Relatorios";
import Backup from "../pages/backup/Backup";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/perfil" element={<Profile />} />
      <Route path="/alunos" element={<Alunos />} />
      <Route path="/alunos/novo" element={<NovoAluno />} />
      <Route path="/alunos/:id" element={<VisualizarAluno />} />
      <Route path="/alunos/:id/editar" element={<EditarAluno />} />
      <Route path="/funcionarios" element={<Funcionarios />} />
      <Route path="/funcionarios/novo" element={<NovoFuncionario />} />
      <Route path="/funcionarios/:id" element={<VisualizarFuncionario />} />
      <Route path="/funcionarios/:id/editar" element={<EditarFuncionario />} />
      <Route path="/desempenho" element={<Desempenho />} />
      <Route path="/financeiro" element={<Financeiro />} />
      <Route path="/roteiro-aula" element={<RoteiroAula />} />
      <Route path="/calendario" element={<Calendario />} />
      <Route path="/requisicoes" element={<Requisicoes />} />
      <Route path="/reports" element={<Relatorios />} />
      <Route path="/backup" element={<Backup />} /> 
    </Routes>
  );
}