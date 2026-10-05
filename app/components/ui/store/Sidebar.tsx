"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

type SidebarTheme = {
  backgroundColor: string;
  activeTabColor: string;
  borderColor: string;
  textColor: string;
  surfaceColor: string;
};

type SidebarProps = {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collapsed?: boolean;
  backgroundColor?: string;
  activeTabColor?: string;
  borderColor?: string;
  textColor?: string;
  surfaceColor?: string;
};

const SidebarThemeContext = createContext<SidebarTheme>({
  backgroundColor: "var(--background)",
  activeTabColor: "var(--brand)",
  borderColor: "var(--border)",
  textColor: "var(--text-primary)",
  surfaceColor: "var(--surface)",
});

export const useSidebarTheme = () => useContext(SidebarThemeContext);

export default function Sidebar({
  children,
  open,
  onOpenChange,
  collapsed = false,
  backgroundColor = "var(--background)",
  activeTabColor = "var(--brand)",
  borderColor = "var(--border)",
  textColor = "var(--text-primary)",
  surfaceColor = "var(--surface)",
}: SidebarProps) {
  const theme = useMemo(
    () => ({
      backgroundColor,
      activeTabColor,
      borderColor,
      textColor,
      surfaceColor,
    }),
    [
      backgroundColor,
      activeTabColor,
      borderColor,
      textColor,
      surfaceColor,
    ]
  );

  return (
    <SidebarThemeContext.Provider value={theme}>
      <>
        {/* Mobile Backdrop */}
        <div
          className={`
            fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden
            transition-opacity duration-300
            ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
          `}
          onClick={() => onOpenChange(false)}
        />

        {/* Sidebar */}
        <aside
          className={`
            fixed left-0 top-0 z-50 h-screen w-72 border-r
            transition-transform duration-300 ease-in-out
            ${open ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 ${collapsed ? "lg:w-16" : "lg:w-72"}
          `}
          style={{
            backgroundColor,
            borderColor,
          }}
        >

          {children}
        </aside>
      </>
    </SidebarThemeContext.Provider>
  );
}
