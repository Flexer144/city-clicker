import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Construction of the Century",
  description: "Строительный кликер",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        {/* Подключение Yandex Games SDK */}
        <script src="/sdk.js"></script>
        {/* Моментальная инициализация до запуска React */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function initSDK() {
                  if (typeof YaGames !== "undefined") {
                    YaGames.init().then(function(ysdk) {
                      window.ysdk = ysdk;
                      if (ysdk.features && ysdk.features.LoadingAPI) {
                        ysdk.features.LoadingAPI.ready();
                      }
                    }).catch(console.error);
                  }
                }
                if (typeof YaGames !== "undefined") {
                  initSDK();
                } else {
                  var s = document.querySelector('script[src="/sdk.js"]');
                  if (s) s.addEventListener("load", initSDK);
                  window.addEventListener("load", initSDK);
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}