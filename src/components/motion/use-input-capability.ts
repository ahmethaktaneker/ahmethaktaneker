"use client";

import { useEffect, useState } from "react";

export type InputCapability = {
  reducedMotion: boolean;
  isTouch: boolean;
};

export function useInputCapability(): InputCapability {
  const [capability, setCapability] = useState<InputCapability>({
    reducedMotion: false,
    isTouch: false,
  });

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");

    const sync = () =>
      setCapability({ reducedMotion: reduce.matches, isTouch: coarse.matches });

    sync();
    reduce.addEventListener("change", sync);
    coarse.addEventListener("change", sync);
    return () => {
      reduce.removeEventListener("change", sync);
      coarse.removeEventListener("change", sync);
    };
  }, []);

  return capability;
}
