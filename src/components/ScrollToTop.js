import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const location = useLocation();
  const isMobile = window.matchMedia("(max-width: 600px)").matches; // Adjust breakpoint as needed

  useEffect(() => {
    if (isMobile) {
      console.log("Route changed:", location.pathname); // Debug
      window.scrollTo({
        top: 0,
        behavior: "smooth", 
      });
      document.documentElement.scrollTo(0, 0);
    }
  }, [location]); // Triggers on route change

  return null; // No UI for this component
};

export default ScrollToTop;
