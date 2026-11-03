import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ApartmentHub — Community, made simple",
  description: "The calm, clear workspace for apartment communities.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-IN"><body>{children}</body></html>;
}
