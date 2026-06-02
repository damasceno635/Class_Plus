import {
  LayoutDashboard,
  GraduationCap,
  Users,
  FileBarChart,
  LineChart,
  DollarSign,
  BookOpen,
  CalendarDays,
  ClipboardList,
  DatabaseBackup,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useState } from "react";
import type { ReactNode } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import type { Cargo } from "../../contexts/AuthContext";

interface MenuItem {
  label: string;
  icon: ReactNode;
  path: string;
  roles: Cargo[];
}

export default function Sidebar() {
  // ESTADO PERSISTENTE DO SIDEBAR
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  function toggleSidebar() {
    const newValue = !collapsed;

    setCollapsed(newValue);

    localStorage.setItem(
      "sidebar-collapsed",
      JSON.stringify(newValue)
    );
  }

  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
      roles: ["admin", "secretary", "coordinator", "teacher", "student"],
    },
    {
      label: "Alunos",
      icon: <GraduationCap size={20} />,
      path: "/alunos",
      roles: ["admin", "secretary", "coordinator"],
    },
    {
      label: "Funcionários",
      icon: <Users size={20} />,
      path: "/funcionarios",
      roles: ["admin", "secretary"],
    },
    {
      label: "Roteiro de Aula",
      icon: <BookOpen size={20} />,
      path: "/roteiro-aula",
      roles: ["admin", "secretary", "coordinator", "teacher", "student"],
    },
    {
      label: "Calendário Escolar",
      icon: <CalendarDays size={20} />,
      path: "/calendario",
      roles: ["admin", "secretary", "coordinator", "teacher", "student"],
    },
    {
      label: "Desempenho Acadêmico",
      icon: <LineChart size={20} />,
      path: "/desempenho",
      roles: ["admin", "coordinator", "teacher", "student"],
    },
    {
      label: "Requisições",
      icon: <ClipboardList size={20} />,
      path: "/requisicoes",
      roles: ["admin", "secretary", "coordinator", "teacher", "student"],
    },
    {
      label: "Financeiro",
      icon: <DollarSign size={20} />,
      path: "/financeiro",
      roles: ["admin", "secretary", "student"],
    },
    {
      label: "Relatórios",
      icon: <FileBarChart size={20} />,
      path: "/relatorios",
      roles: ["admin", "secretary", "coordinator"],
    },
    {
      label: "Backup",
      icon: <DatabaseBackup size={20} />,
      path: "/backup",
      roles: ["admin"],
    },
  ];

  const filteredMenus = menuItems.filter((item) =>
    item.roles.includes(user.cargo)
  );

  return (
    <aside
      className={`
        ${collapsed ? "w-20" : "w-72"}
        sticky
        top-0
        h-screen
        flex-shrink-0
        bg-slate-900
        text-white
        p-4
        transition-all
        duration-300
        flex
        flex-col
        z-20
      `}
    >
      {/* TOPO */}
      <div className="flex items-center justify-between mt-2 mb-8 px-2">
        {!collapsed && (
          <div>
            <h1 className="text-3xl font-bold text-blue-500">
              Class+
            </h1>
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className="
            p-2
            rounded-lg
            hover:bg-slate-800
            transition-colors
          "
        >
          {collapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* MENU */}
      <nav className="flex flex-col gap-2 overflow-y-auto custom-scrollbar">
        {filteredMenus.map((item) => {
          const isActive = location.pathname.startsWith(item.path);

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : ""}
              className={`
                flex
                items-center
                gap-4
                p-3
                rounded-xl
                transition-all
                w-full
                ${
                  collapsed ? "justify-center" : ""
                }

                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>

              {!collapsed && (
                <span className="text-sm font-medium truncate">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}