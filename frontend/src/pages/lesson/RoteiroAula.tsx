import React, { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { Cargo } from "../../contexts/AuthContext";

const LessonAdmin = lazy(() => import("./admin/LessonAdmin"));
const LessonCoordinator = lazy(() => import("./coordinator/LessonCoordinator"));
const LessonTeacher = lazy(() => import("./teacher/LessonTeacher"));
const LessonSecretary = lazy(() => import("./secretary/LessonSecretary"));
const LessonStudent = lazy(() => import("./student/LessonStudent"));

export default function Lesson() {
  const { user } = useAuth();

  console.log("cargo:", user?.cargo);

  const lesson: Record<Cargo, React.ReactNode> = {
    admin: <LessonAdmin />,
    teacher: <LessonTeacher />,
    coordinator: <LessonCoordinator />,
    secretary: <LessonSecretary />,
    student: <LessonStudent />
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
      {lesson[user.cargo]}
    </Suspense>
  );
}