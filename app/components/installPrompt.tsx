"use client";

import { useEffect, useState } from "react";

// const DISMISS_KEY = "install_prompt_dismissed_at";
// const DISMISS_COOLDOWN_DAYS = 14;

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed? Don't show anything, ever.
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Respect a recent dismissal.
    // const dismissedAt = localStorage.getItem(DISMISS_KEY);
    // if (dismissedAt) {
    //   const daysSince =
    //     (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
    //   if (daysSince < DISMISS_COOLDOWN_DAYS) return;
    // }

    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    if (ios) {
      // Safari never fires beforeinstallprompt — show our own card immediately.
      setVisible(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    // localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }

  async function install() {
    if (!prompt) return;
    prompt.prompt();
    // const { outcome } = await prompt.userChoice;
    // if (outcome === "accepted" || outcome === "dismissed") {
    // // Either way, don't nag again this cooldown window.
    //  localStorage.setItem(DISMISS_KEY, String(Date.now()));
    // }
    await prompt.userChoice;
    setPrompt(null);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm
                 flex items-center gap-3 rounded-none border-2 border-black/10 dark:border-white/10
                 bg-white dark:bg-[#242424] shadow-lg px-4 py-3"
    >
      <i className="bx bx-arrow-to-bottom-stroke text-[1.7rem] text-[#256F5C] shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="font-bold leading-tight">Install Exchango</p>
        <p className="text-sm text-black/55 dark:text-gray-300 leading-tight mt-1">
          {isIOS
            ? "Tap Share → Add to Home Screen"
            : "Quick access, right from your home screen"}
        </p>
      </div>

      {!isIOS && (
        <button
          onClick={install}
          className="text-sm font-bold text-white bg-[#256F5C] px-3 py-1.5 rounded-none shrink-0
                     hover:opacity-90 transition-opacity cursor-pointer"
        >
          Install
        </button>
      )}

      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="text-black/40 dark:text-gray-500 hover:text-black/70 dark:hover:text-gray-300 shrink-0 cursor-pointer"
      >
        <i className="bx bx-x text-[1.5rem]" />
      </button>
    </div>
  );
}
