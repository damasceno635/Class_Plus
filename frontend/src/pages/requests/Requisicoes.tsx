import React, { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { Cargo } from "../../contexts/AuthContext";

const RequestsAdmin = lazy(() => import("./admin/RequestsAdmin"));
const RequestsSecretary = lazy(() => import("./secretary/RequestsSecretary"));
const RequestsCoordinator = lazy(() => import("./coordinator/RequestsCoordinator"));
const RequestsTeacher = lazy(() => import("./teacher/RequestsTeacher"));
const RequestsStudent = lazy(() => import("./student/RequestsStudent"));

export default function Requests() {
  const { user } = useAuth();

  console.log("cargo:", user?.cargo);

  const requests: Record<Cargo, React.ReactNode> = {
    admin: <RequestsAdmin />,
    secretary: <RequestsSecretary />,
    coordinator: <RequestsCoordinator />,
    teacher: <RequestsTeacher />,
    student: <RequestsStudent />
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      }
    >
      {requests[user.cargo]}
    </Suspense>
  );
}