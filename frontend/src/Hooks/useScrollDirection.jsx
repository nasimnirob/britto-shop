import { useEffect, useState } from "react";

export default function useScrollDirection() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    let lastScroll = window.scrollY;

    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll <= 0) {
        setShow(true);
      } else if (currentScroll > lastScroll) {
        // নিচে scroll
        setShow(false);
      } else {
        // উপরে scroll
        setShow(true);
      }

      lastScroll = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return show;
}