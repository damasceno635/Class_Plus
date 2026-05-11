import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";

import Alunos from "../pages/alunos/Alunos";
import NovoAluno from "../pages/alunos/NovoAluno.tsx";

import Funcionarios from "../pages/funcionarios/Funcionarios";
import NovoFuncionario from "../pages/funcionarios/NovoFuncionario.tsx";

import Profile from "../pages/profile/Profile";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/perfil" element={<Profile />} />

      <Route path="/alunos" element={<Alunos />} />

      <Route path="/alunos/novo" element={<NovoAluno />} />

      <Route path="/funcionarios" element={<Funcionarios />} />

      <Route path="/funcionarios/novo" element={<NovoFuncionario />} />
    </Routes>
  );
}
