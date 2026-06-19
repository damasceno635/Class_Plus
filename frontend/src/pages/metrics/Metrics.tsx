import { useAuth } from "../../contexts/AuthContext";

// Importações dos componentes específicos de cada nível de acesso
import AdminMetrics from "./admin/AdminMetrics";
import CoordinatorMetrics from "./coordinator/CoordinatorMetrics";
import TeacherMetrics from "./teacher/TeacherMetrics";
import StudentMetrics from "./student/StudentMetrics";

export default function Metrics() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.cargo) {
    case "admin":
      return <AdminMetrics />;
    case "coordinator":
      return <CoordinatorMetrics />;
    case "teacher":
      return <TeacherMetrics />;
    case "student":
      return <StudentMetrics />;
    default:
      return <div className="p-8 text-center font-bold text-red-500">Perfil não autorizado a acessar este painel.</div>;
  }
}