import { Inter } from "next/font/google";
import "./globals.css";
import Topbar from "./components/Layout/Topbar";
import { Providers } from "./provider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <div className="fixed top-0 left-0 w-full z-50">
            <Topbar />
          </div>
          <div className="pt-16">
            <Providers>{children}</Providers>
          </div>
        </div>
      </body>
    </html>
  );
}
