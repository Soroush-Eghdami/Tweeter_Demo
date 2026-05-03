export const scrollFunction = (setIsScrolled: (arg0: boolean) => void) => {
  return () => {
    if (window.scrollY > 250) {
      setIsScrolled(true);
    } else if (window.scrollY < 200) {
      setIsScrolled(false);
    }
  };
};

export const observerFunction = (setIconBottom: (arg0: number) => void) => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        const footerHeight = entry.boundingClientRect.height;
        setIconBottom(footerHeight + 100);
      } else {
        setIconBottom(28);
      }
    },
    { threshold: 0, rootMargin: "0px" },
  );

  return observer;
};
