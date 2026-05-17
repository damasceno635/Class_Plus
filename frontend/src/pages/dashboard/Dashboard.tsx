/*import { useAuth } from "../../contexts/AuthContext";
import DashboardAdmin from "./admin/DashboardAdmin";
import DashboardSecretary from "./secretary/DashboardSecretary";
import DashboardCoordinator from "./coordinator/DashboardCoordinator";
import DashboardTeacher from "./teacher/DashboardTeacher";
import DashboardStudent from "./student/DashboardStudent";

export default function Dashboard() {
  const { user } = useAuth();

  // Roteamento baseado no cargo
  switch (user?.cargo) {
    case "admin":
      return <DashboardAdmin />;
    case "secretário(a)":
      return <DashboardSecretary />;
    case "coordenador(a)":
      return <DashboardCoordinator />;
    case "professor(a)":
      return <DashboardTeacher />;
    case "aluno(a)":
      return <DashboardStudent />;
    default:
      return <DashboardAdmin />; // Fallback
  }
}*/

// Dashboard.tsx com lazy loading
import { lazy, Suspense } from 'react';
import { useAuth } from "../../contexts/AuthContext";

const DashboardAdmin = lazy(() => import('./admin/DashboardAdmin'));
const DashboardSecretary = lazy(() => import('./secretary/DashboardSecretary'));
const DashboardCoordinator = lazy(() => import('./coordinator/DashboardCoordinator'));
const DashboardTeacher = lazy(() => import('./teacher/DashboardTeacher'));
const DashboardStudent = lazy(() => import('./student/DashboardStudent'));
// ... outros imports

export default function Dashboard() {
  const { user } = useAuth();
  
  const getDashboard = () => {
    switch (user?.cargo) {
      case "admin": return <DashboardAdmin />;
      case "secretário(a)": return <DashboardSecretary />;
      case "coordenador(a)": return <DashboardCoordinator />;
      case "professor(a)": return <DashboardTeacher />;
      case "aluno(a)": return <DashboardStudent />;
      default: return <DashboardAdmin />;
    }
  };

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>}>
      {getDashboard()}
    </Suspense>
  );
}