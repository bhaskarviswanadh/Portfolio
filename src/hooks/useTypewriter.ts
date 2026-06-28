import { useState, useEffect } from "react";

/**
 * Types out `text` one character at a time.
 * @param text      The full string to type
 * @param speed     Ms per character (default 55ms)
 * @param delay     Ms before typing starts (default 0)
 */
export function useTypewriter(text: string, speed = 55, delay = 0) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let timer: ReturnType<typeof setTimeout>;

    const start = () => {
      let i = 0;
      const tick = () => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i < text.length) timer = setTimeout(tick, speed);
      };
      timer = setTimeout(tick, speed);
    };

    const delayTimer = setTimeout(start, delay);
    return () => {
      clearTimeout(delayTimer);
      clearTimeout(timer);
    };
  }, [text, speed, delay]);

  return displayed;
}
