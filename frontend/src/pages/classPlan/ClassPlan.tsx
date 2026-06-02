import { useAuth } from "../../contexts/AuthContext";

// Importações atualizadas apontando para as novas subpastas
import AdminClassPlan from "./admin/AdminClassPlan";
import SecretaryClassPlan from "./secretary/SecretaryClassPlan";
import CoordinatorClassPlan from "./coordinator/CoordinatorClassPlan";
import TeacherClassPlan from "./teacher/TeacherClassPlan";
import StudentClassPlan from "./student/StudentClassPlan";

export default function ClassPlan() {
  const { user } = useAuth();

  if (!user) return null;

  // Ele renderiza o componente correto dependendo do cargo
  switch (user.cargo) {
    case "admin":
      return <AdminClassPlan />;
    case "secretary":
      return <SecretaryClassPlan />;
    case "coordinator":
      return <CoordinatorClassPlan />;
    case "teacher":
      return <TeacherClassPlan />;
    case "student":
      return <StudentClassPlan />;
    default:
      // Fallback de segurança caso o cargo não seja reconhecido
      return <div>Perfil não autorizado.</div>;
  }
}