import type { Metadata } from "next";
import "./styles.css";
import "./extras.css";

export const metadata: Metadata = { title: "ROLL / Private visual diary", description: "A private visual archive", manifest: "/manifest.webmanifest", appleWebApp: { capable: true, title: "ROLL 日记" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
