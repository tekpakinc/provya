"use client";

import { useEffect, useState } from "react";

type InstallChoice = { outcome: "accepted" | "dismissed" };
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<InstallChoice> };

const DISMISS_KEY = "provya-install-dismissed";
const WEEK = 7 * 24 * 60 * 60 * 1000;

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [instructions, setInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone) return;
    const dismissed = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (Date.now() - dismissed < WEEK) return;
    const appleMobile = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(appleMobile);
    const timer = window.setTimeout(() => setVisible(true), 1800);
    const beforeInstall = (event: Event) => { event.preventDefault(); setDeferred(event as InstallEvent); setVisible(true); };
    const installed = () => { setVisible(false); setDeferred(null); };
    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", installed);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    return () => { window.clearTimeout(timer); window.removeEventListener("beforeinstallprompt", beforeInstall); window.removeEventListener("appinstalled", installed); };
  }, []);

  async function install() {
    if (!deferred) { setInstructions(true); return; }
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setVisible(false);
    setDeferred(null);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }

  if (!visible) return null;
  return <aside className="install-card" aria-label="Install PROVya">
    <img src="/brand/provya-logo-v2.png" alt="" />
    <div><b>Put PROVya on your home screen</b><p>{instructions ? (isIOS ? <>Tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.</> : <>Open your browser menu and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</>) : "Open your private records like an app—no app store needed."}</p></div>
    {!instructions && <button className="install-action" onClick={install}>{deferred ? "Install" : "Show me how"}</button>}
    {instructions && <button className="install-action" onClick={dismiss}>Got it</button>}
    <button className="install-close" onClick={dismiss} aria-label="Dismiss install suggestion">×</button>
  </aside>;
}
