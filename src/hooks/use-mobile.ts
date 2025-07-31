import * as React from "react"

/**
 * Mobile Detection Hook
 * 
 * Custom React hook that detects whether the current viewport is mobile-sized.
 * Uses the standard mobile breakpoint of 768px and responds to window resize events.
 */

/**
 * Mobile breakpoint threshold in pixels
 * Viewports below this width are considered mobile
 */
const MOBILE_BREAKPOINT = 768

/**
 * Hook to detect if the current viewport is mobile-sized
 * 
 * Uses window.matchMedia for efficient media query monitoring and
 * automatically updates when the viewport size changes.
 * 
 * @returns {boolean} true if viewport is mobile-sized, false otherwise
 * 
 * @example
 * const isMobile = useIsMobile();
 * return (
 *   <div className={isMobile ? "mobile-layout" : "desktop-layout"}>
 *     Content
 *   </div>
 * );
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Create media query for mobile breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Handler for viewport changes
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Listen for media query changes
    mql.addEventListener("change", onChange)
    
    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Cleanup listener on unmount
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Return boolean (handle undefined case during SSR)
  return !!isMobile
}
