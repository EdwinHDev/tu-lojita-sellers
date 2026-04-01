import * as React from "react"

/**
 * Hook to detect the Tailwind xl breakpoint (1280px).
 * Returns true if the screen width is at least 1280px.
 */
export function useIsXl() {
  const [isXl, setIsXl] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Check if we are in the browser
    if (typeof window === "undefined") return

    const mql = window.matchMedia("(min-width: 1280px)")
    
    // Set initial value
    setIsXl(mql.matches)

    const onChange = () => {
      setIsXl(mql.matches)
    }

    // Modern API
    mql.addEventListener("change", onChange)
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isXl
}
