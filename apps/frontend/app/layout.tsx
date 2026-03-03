import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeSettings } from "../components/ThemeSettings";

export const metadata: Metadata = {
  title: "Cheat Meal",
  description: "Spend your last calories wisely.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var root=document.documentElement;var themeKey="cm_theme";var themeRaw=localStorage.getItem(themeKey);var theme=(themeRaw==="light"||themeRaw==="dark")?themeRaw:"dark";if(theme==="dark"){root.classList.add("dark");}else{root.classList.remove("dark");}var accentKey="cm_accent";var accentRaw=localStorage.getItem(accentKey);var accents={classic:{accent:"16.0396039604 100% 60.3921568627%",h:"34",s:"62%",l:"52%",glowLight:"0.05",glowDark:"0.11"},focus:{accent:"217 55% 40%",h:"217",s:"55%",l:"40%",glowLight:"0.045",glowDark:"0.1"},balance:{accent:"152 34% 38%",h:"152",s:"34%",l:"38%",glowLight:"0.04",glowDark:"0.09"},stealth:{accent:"220 8% 26%",h:"220",s:"8%",l:"26%",glowLight:"0.03",glowDark:"0.06"}};var resolved=(accentRaw==="classic"||accentRaw==="focus"||accentRaw==="balance"||accentRaw==="stealth")?accentRaw:"classic";root.style.setProperty("--accent",accents[resolved].accent);root.style.setProperty("--accent-h",accents[resolved].h);root.style.setProperty("--accent-s",accents[resolved].s);root.style.setProperty("--accent-l",accents[resolved].l);root.style.setProperty("--accent-glow-alpha-light",accents[resolved].glowLight);root.style.setProperty("--accent-glow-alpha-dark",accents[resolved].glowDark);}catch(_){}})();`,
          }}
        />
      </head>
      <body className="theme-transition">
        <ThemeSettings />
        {children}
      </body>
    </html>
  );
}
