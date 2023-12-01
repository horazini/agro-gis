import { createContext, useContext, useState } from "react";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

interface ThemeContextProps {
  theme: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      "useThemeContext debe ser utilizado dentro de ThemeProvider"
    );
  }
  return context;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Checkeal apreferencia de tema en el sistema o explorador
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  // Chekea si el usuario ya configuró un modo previamente
  const isModeSettedInBrowser = localStorage.getItem("theme") !== null;

  let settedMode = false;

  if (isModeSettedInBrowser === true) {
    settedMode = localStorage.getItem("theme") === "true";
  } else {
    settedMode = prefersDarkMode;
    localStorage.setItem("theme", String(prefersDarkMode));
  }

  // Variabel de estado que define el tema
  const [theme, setTheme] = useState<boolean>(settedMode);

  // Cambiar el tema al valor opuesto
  const toggleTheme = () => {
    if (localStorage.getItem("theme") === "true") {
      localStorage.setItem("theme", "false");
    } else {
      localStorage.setItem("theme", "true");
    }
    setTheme((prevTheme) => !prevTheme);
  };

  const defaultTheme = createTheme({
    palette: {
      mode: theme ? "dark" : "light",
    },
  });

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <MuiThemeProvider theme={defaultTheme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
