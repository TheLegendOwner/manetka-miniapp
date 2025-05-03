import "../app/globals.css";
import { Aboreto, ABeeZee } from "next/font/google";
import type { Metadata } from "next";

const aboreto = Aboreto({ subsets: ["latin"], weight: ["400"] });
const abeezee = ABeeZee({ subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
  title: "MANETKA Wallet",
  description: "All reward tokens in one place with MANETKA WALLET",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${aboreto.className} ${abeezee.className}`}>{children}</body>
    </html>
  );
}
