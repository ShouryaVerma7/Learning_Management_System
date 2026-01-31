import { createContext, useContext, useEffect, useState } from "react"

const ThemeProviderContext = createContext()

export function ThemeProvider({
  children,
  defaultTheme = "light", // CHANGE: Default to light
  storageKey = "lms-ui-theme",
  ...props
}) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey)
      if (saved === 'light' || saved === 'dark') return saved
      return defaultTheme
    }
    return defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement
    const body = window.document.body
    
    // Remove all theme classes
    root.classList.remove("light", "dark")
    body.classList.remove("light", "dark")
    
    let appliedTheme = theme
    if (theme === "system") {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      appliedTheme = systemPrefersDark ? "dark" : "light"
    }

    // Apply theme classes
    root.classList.add(appliedTheme)
    body.classList.add(appliedTheme)
    
    // Store in localStorage
    localStorage.setItem(storageKey, theme)
    
    // Set CSS variables explicitly for light mode
    if (appliedTheme === 'light') {
      document.documentElement.style.setProperty('--background', '0 0% 100%')
      document.documentElement.style.setProperty('--foreground', '222.2 84% 4.9%')
    }
    
    // Dispatch theme change event
    const event = new CustomEvent('theme-change', { detail: appliedTheme })
    window.dispatchEvent(event)
    
  }, [theme, storageKey])

  const value = {
    theme,
    setTheme: (newTheme) => {
      setTheme(newTheme)
    },
    isDark: theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  
  return context
}