import { useState, useEffect, useRef } from "react";

/**
 * Typewriter effect: displays text progressively even if it arrives all at once.
 * speed: ms per character (~8ms matches Claude.ai feel)
 */
export function useTypewriter(
  fullText: string,
  isComplete: boolean,
  speed: number = 8
) {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const textRef = useRef("");

  useEffect(() => {
    if (!fullText || !isComplete) {
      // Reset when not complete or no text
      indexRef.current = 0;
      textRef.current = "";
      setDisplayed("");
      setIsDone(false);
      return;
    }

    // If text changed (new message), reset
    if (textRef.current !== fullText) {
      indexRef.current = 0;
      textRef.current = fullText;
      setDisplayed("");
      setIsDone(false);
    }

    const tick = () => {
      if (indexRef.current >= fullText.length) {
        setDisplayed(fullText);
        setIsDone(true);
        return;
      }

      // Chunks of 2-5 chars for natural feel
      const chunkSize = Math.floor(Math.random() * 4) + 2;
      const nextIndex = Math.min(indexRef.current + chunkSize, fullText.length);
      setDisplayed(fullText.slice(0, nextIndex));
      indexRef.current = nextIndex;

      // Faster on whitespace, slower on punctuation
      const nextChar = fullText[indexRef.current];
      let delay = speed;
      if (nextChar === " " || nextChar === "\n") delay = speed / 2;
      else if (nextChar === "." || nextChar === "," || nextChar === ";") delay = speed * 3;

      timerRef.current = setTimeout(tick, delay);
    };

    timerRef.current = setTimeout(tick, speed);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [fullText, isComplete, speed]);

  return { displayed, isDone };
}
