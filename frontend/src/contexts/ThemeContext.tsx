import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface ThemeContextProps {
  darkMode: boolean;
  toggleTheme: () => void;
  profileImage: string;
  setProfileImage: (image: string) => void;
}

const ThemeContext =
  createContext<ThemeContextProps>(
    {} as ThemeContextProps
  );

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [darkMode, setDarkMode] =
    useState(() => {
      const storedTheme =
        localStorage.getItem("theme");

      return storedTheme === "dark";
    });

  const [profileImage, setProfileImage] =
    useState(() => {
      return (
        localStorage.getItem(
          "profileImage"
        ) || ""
      );
    });

  useEffect(() => {
    const root =
      window.document.documentElement;

    if (darkMode) {
      root.classList.add("dark");

      localStorage.setItem(
        "theme",
        "dark"
      );
    } else {
      root.classList.remove("dark");

      localStorage.setItem(
        "theme",
        "light"
      );
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(
      "profileImage",
      profileImage
    );
  }, [profileImage]);

  function toggleTheme() {
    setDarkMode((prev) => !prev);
  }

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleTheme,
        profileImage,
        setProfileImage,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}