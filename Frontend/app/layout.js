import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { neobrutalism } from "@clerk/themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Servd - AI Recipes Platform",
  description: "AI-powered recipe platform for developers",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        theme: neobrutalism,
      }}
    >
      <html lang="en">
        <body className={`${inter.className}`}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <footer className="py-8 px-4 border-t">
            <div className="max-w-6xl mx-auto flex justify-center items-center">
              <p className="text-stone-500 text-sm">
                Made with love by Sanjeet Sharma
              </p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
