import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export default function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();

  // Save scroll position continuously
  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem(
        `scroll:${location.pathname}`,
        window.scrollY.toString()
      );
    };

    window.addEventListener("scroll", saveScroll);

    return () => {
      saveScroll();
      window.removeEventListener("scroll", saveScroll);
    };
  }, [location.pathname]);

  // Restore / Reset scroll
  useEffect(() => {
    if (navigationType === "POP") {
      // Back / Forward
      const saved = sessionStorage.getItem(`scroll:${location.pathname}`);

      if (saved) {
        requestAnimationFrame(() => {
          window.scrollTo(0, Number(saved));
        });
      }
    } else {
      // Link navigation
      window.scrollTo(0, 0);
    }
  }, [location.pathname, navigationType]);

  return null;
}