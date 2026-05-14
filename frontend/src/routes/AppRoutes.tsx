import { Routes, Route } from "react-router-dom";

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

import Relatorio from "../pages/relatorios/Relatorio";

import Backup from "../pages/backup/Backup"; 
import Profile from "../pages/profile/Profile";

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
      <Route path="/relatorios" element={<Relatorio />} />
      <Route path="/backup" element={<Backup />} /> 
    </Routes>
  );
}