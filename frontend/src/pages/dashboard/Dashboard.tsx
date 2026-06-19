import { useAuth } from "../../contexts/AuthContext";
import AdminDashboard from "./admin/AdminDashboard";
import SecretaryDashboard from "./secretary/SecretaryDashboard";
import CoordinatorDashboard from "./coordinator/CoordinatorDashboard";
import TeacherDashboard from "./teacher/TeacherDashboard";
import StudentDashboard from "./student/StudentDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  // Ele renderiza o componente correto dependendo do cargo
  switch (user.cargo) {
    case "admin":
      return <AdminDashboard />;
    case "secretary":
      return <SecretaryDashboard />;
    case "coordinator":
      return <CoordinatorDashboard />;
    case "teacher":
      return <TeacherDashboard />;
    case "student":
      return <StudentDashboard />;
    default:
      // Fallback de segurança caso o cargo não seja reconhecido
      return <div>Perfil não autorizado.</div>;
  }
}