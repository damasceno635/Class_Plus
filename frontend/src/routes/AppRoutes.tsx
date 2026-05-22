import { Routes, Route, Navigate } from "react-router-dom";

// Importação do hook de autenticação para controle de acesso

import { useAuth } from "../contexts/AuthContext";
import type { Cargo } from "../contexts/AuthContext";

// Login e Dashboard
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard"; 

// Perfil
import Profile from "../pages/profile/Profile";

// Alunos
import Students from "../pages/students/Students";
import StudentsNew from "../pages/students/StudentsNew";
import StudentsView from "../pages/students/StudentsView" 
import StudentsEdit from "../pages/students/StudentsEdit";

// Funcionários
import AdminEmployees from "../pages/employees/Employees";
import AdminEmployeesNew from "../pages/employees/EmployeesNew";
import AdminEmployeesEdit from "../pages/employees/EmployeesEdit";
import AdminEmployeesView from "../pages/employees/EmployeesView";

// Roteiro de Aula
import ClassPlan from "../pages/classPlan/ClassPlan";

// Calendário Escolar
import Calendar from "../pages/calendar/Calendar";

// Desempenho Acadêmico
import Metrics from "../pages/metrics/Metrics";

// Requisições
import Requests from "../pages/requests/Requests";

// Financeiro
import Finance from "../pages/finance/Finance";

// Relatórios
import Declarations from "../pages/declaration/Declarations";

// Backup
import Backup from "../pages/backup/Backup";

// Interface atualizada para aceitar controle de cargos
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Cargo[]; // Opcional: se não enviar, qualquer usuário logado pode acessar
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();
  
  // 1. Se não estiver logado, vai para o Login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. Se a rota exigir cargos específicos e o usuário atual não tiver permissão
  if (allowedRoles && !allowedRoles.includes(user.cargo)) {
    // Redireciona para o painel principal seguro dele
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rota Pública */}
      <Route path="/" element={<Login />} />

      {/* Rotas Protegidas Gerais (Acessíveis por qualquer nível logado) */}
      <Route path="/dashboard" element={ <ProtectedRoute> <Dashboard /> </ProtectedRoute> } />
      
      {/* Rotas de Alunos (Acessíveis por Admin e Secretaria) */}
      <Route path="/alunos" element={ <ProtectedRoute allowedRoles={["admin", "secretary", "coordinator"]}> <Students /> </ProtectedRoute> } />
      <Route path="/alunos/novo" element={ <ProtectedRoute allowedRoles={["admin", "secretary"]}> <StudentsNew /> </ProtectedRoute> } />
      <Route path="/alunos/editar/:id" element={ <ProtectedRoute allowedRoles={["admin", "secretary"]}> <StudentsEdit /> </ProtectedRoute> } />
      <Route path="/alunos/visualizar/:id" element={ <ProtectedRoute allowedRoles={["admin", "secretary", "coordinator", "teacher"]}> <StudentsView /> </ProtectedRoute> } />
      
      <Route path="/perfil" element={<ProtectedRoute> <Profile /> </ProtectedRoute>} />

      <Route path="/roteiro-aula" element={<ProtectedRoute> <ClassPlan /> </ProtectedRoute>} />
      
      <Route path="/calendario" element={<ProtectedRoute> <Calendar /> </ProtectedRoute>} />

      <Route path="/desempenho" element={<ProtectedRoute> <Metrics /> </ProtectedRoute>} />
      
      <Route path="/requisicoes" element={<ProtectedRoute> <Requests /> </ProtectedRoute>} />

      <Route path="/financeiro" element={<ProtectedRoute> <Finance /></ProtectedRoute>} />

      <Route path="/relatorios" element={<ProtectedRoute> <Declarations /> </ProtectedRoute>} />

      <Route path="/backup" element={<ProtectedRoute> <Backup /> </ProtectedRoute>} />

      {/* ===================================================== */}
      {/* CONTROLE DE NÍVEL PARA FUNCIONÁRIOS                  */}
      {/* ===================================================== */}
      
      <Route 
        path="/funcionarios" 
        element={ 
          <ProtectedRoute allowedRoles={["admin", "secretary"]}> 
            <AdminEmployees /> 
          </ProtectedRoute> 
        } 
      />
      
      {/* CADASTRO: Apenas Administrador */}
      <Route 
        path="/funcionarios/novo" 
        element={ 
          <ProtectedRoute allowedRoles={["admin"]}> 
            <AdminEmployeesNew /> 
          </ProtectedRoute> 
        } 
      />
      
      {/* EDIÇÃO: Apenas Administrador */}
      <Route 
        path="/funcionarios/editar/:id" 
        element={ 
          <ProtectedRoute allowedRoles={["admin"]}> 
            <AdminEmployeesEdit /> 
          </ProtectedRoute> 
        } 
      />
      
      {/* DETALHES/FICHA: Admin e Secretário podem ver */}
      <Route 
        path="/funcionarios/visualizar/:id" 
        element={ 
          <ProtectedRoute allowedRoles={["admin", "secretary"]}> 
            <AdminEmployeesView /> 
          </ProtectedRoute> 
        } 
      />
      
      {/* Rota Coringa para capturar URLs não encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}