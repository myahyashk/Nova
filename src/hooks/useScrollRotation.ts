import { useState, useEffect } from 'react';

export function useScrollRotation(speed = 0.5) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      setRotation((prev) => prev + delta * speed);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return rotation;
}
