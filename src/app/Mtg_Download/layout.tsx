import { Ubuntu } from "next/font/google";

// Fuente de esta sección: Ubuntu, la de la interfaz clásica de Linux Mint
const fuenteUbuntu = Ubuntu({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--fuente-mint",
});

export default function LayoutMtg({ children }: { children: React.ReactNode }) {
  return <div className={`${fuenteUbuntu.variable} escritorio-mint`}>{children}</div>;
}
