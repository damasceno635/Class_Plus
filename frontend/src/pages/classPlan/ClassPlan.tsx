import { useAuth } from "../../contexts/AuthContext";

// Importações atualizadas apontando para as novas subpastas
import AdminClassPlan from "./admin/AdminClassPlan";
import CoordinatorClassPlan from "./coordinator/CoordinatorClassPlan";
import TeacherClassPlan from "./teacher/TeacherClassPlan";

export default function ClassPlan() {
  const { user } = useAuth();

  if (!user) return null;

  // Ele renderiza o componente correto dependendo do cargo
  switch (user.cargo) {
    case "admin":
      return <AdminClassPlan />;
    case "coordinator":
      return <CoordinatorClassPlan />;
    case "teacher":
      return <TeacherClassPlan />;
    default:
      // Fallback de segurança caso o cargo não seja reconhecido
      return <div>Perfil não autorizado.</div>;
  }
}