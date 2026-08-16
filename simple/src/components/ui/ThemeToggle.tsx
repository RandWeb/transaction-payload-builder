import { useTheme, type ThemeMode } from "@/contexts/ThemeContext";

const MODES: { key: ThemeMode; label: string; icon: string }[] = [
  { key: "light", label: "روشن", icon: "☀️" },
  { key: "system", label: "خودکار", icon: "💻" },
  { key: "dark", label: "تاریک", icon: "🌙" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex rounded-full bg-white/60 p-0.5 shadow-inner ring-1 ring-inset ring-slate-200 backdrop-blur transition-colors dark:bg-slate-800/60 dark:ring-slate-700">
        {MODES.map((m) => {
          const active = theme === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setTheme(m.key)}
              title={m.label}
              className={[
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all duration-300",
                active
                  ? "bg-white text-slate-700 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                  : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300",
              ].join(" ")}
            >
              <span className="leading-none">{m.icon}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
