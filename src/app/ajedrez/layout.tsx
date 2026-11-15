import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./ajedrez.css";

export const metadata: Metadata = {
  title: "Torneo de ajedrez",
  description: "Clasificación, rondas y cuadro final del torneo de ajedrez",
};

const fuente = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export default function LayoutAjedrez({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={`ajedrez ${fuente.className}`}>{children}</div>;
}
