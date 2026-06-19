import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";

// Importações dos painéis específicos
import AdminRequests from "./admin/AdminRequests";
import CoordinatorRequests from "./coordinator/CoordinatorRequests";
import SecretaryRequests from "./secretary/SecretaryRequests";
import TeacherRequests from "./teacher/TeacherRequests";
import StudentRequests from "./student/StudentRequests";

export default function Requests() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.cargo) {
    case "admin":
      return <AdminRequests />;
    case "coordinator":
      return <CoordinatorRequests />;
    case "secretary":
      return <SecretaryRequests />;
    case "teacher":
      return <TeacherRequests />;
    case "student":
      return <StudentRequests />;
    default:
      // Proteção de segurança
      return <Navigate to="/dashboard" replace />;
  }
}