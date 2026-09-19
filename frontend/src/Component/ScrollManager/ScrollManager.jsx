import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const ScrollManager = () => {
    const { pathname } = useLocation();

    // Previous route মনে রাখবে
    const previousPath = useRef(pathname);

    useEffect(() => {
        const previous = previousPath.current;

        // Route change হওয়ার আগে previous route-এর scroll position save
        if (previous !== pathname) {
            sessionStorage.setItem(
                `scroll-position:${previous}`,
                String(window.scrollY)
            );
        }

        // Current route-এর saved position
        const savedPosition = sessionStorage.getItem(
            `scroll-position:${pathname}`
        );

        // DOM render হওয়ার পরে restore
        requestAnimationFrame(() => {
            if (savedPosition !== null) {
                window.scrollTo({
                    top: Number(savedPosition),
                    left: 0,
                    behavior: "auto",
                });
            } else {
                // First visit
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: "auto",
                });
            }
        });

        previousPath.current = pathname;
    }, [pathname]);

    // Browser close/refresh করার আগে current position save
    useEffect(() => {
        const saveScrollPosition = () => {
            sessionStorage.setItem(
                `scroll-position:${pathname}`,
                String(window.scrollY)
            );
        };

        window.addEventListener("beforeunload", saveScrollPosition);

        return () => {
            window.removeEventListener("beforeunload", saveScrollPosition);
        };
    }, [pathname]);

    return null;
};

export default ScrollManager;