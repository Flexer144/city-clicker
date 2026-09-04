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
        {/* Инициализация SDK и детекция языка для п. 2.14 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function initSDK() {
                  if (typeof YaGames !== "undefined") {
                    YaGames.init().then(function(ysdk) {
                      window.ysdk = ysdk;

                      // 1. Обязательный вызов для автоматической проверки п. 2.14
                      try {
                        var userLang = (ysdk.environment && ysdk.environment.i18n && ysdk.environment.i18n.lang) || 'ru';
                        window.ysdkLang = userLang;
                        document.documentElement.lang = userLang;
                        console.log("SDK Language detected:", userLang);
                      } catch (e) {
                        console.warn("Language detect error:", e);
                      }

                      // 2. Сигнал о готовности отправляем строго после детекции языка
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