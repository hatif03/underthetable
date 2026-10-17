import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

type Theme = "light" | "dark"
const KEY = "utt:theme"

function systemTheme(): Theme {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0e0e0d" : "#f5f5f2")
}

/** Light and dark, following the system until the visitor chooses. The choice is remembered on this device only. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme === "dark" ? "dark" : document.documentElement.dataset.theme === "light" ? "light" : systemTheme()))

  useEffect(() => apply(theme), [theme])

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark"
    setTheme(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // remembering the choice is a convenience
    }
  }

  return (
    <button type="button" className="pill lang theme" onClick={toggle} aria-label={theme === "dark" ? "Switch to the light theme" : "Switch to the dark theme"} title={theme === "dark" ? "Light theme" : "Dark theme"}>
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}
