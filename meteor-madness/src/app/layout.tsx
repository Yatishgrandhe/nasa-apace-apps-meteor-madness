import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meteor Madness",
  description: "Professional Near Earth Objects monitoring system with AI analysis and 3D solar system visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove browser extension attributes that cause hydration mismatches
              (function() {
                if (typeof window !== 'undefined') {
                  const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                      mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                          // Remove common browser extension attributes
                          node.removeAttribute('bis_skin_checked');
                          node.removeAttribute('data-bis_skin_checked');
                          
                          // Remove from all child elements
                          const elements = node.querySelectorAll('*');
                          elements.forEach(function(el) {
                            el.removeAttribute('bis_skin_checked');
                            el.removeAttribute('data-bis_skin_checked');
                          });
                        }
                      });
                    });
                  });
                  
                  // Start observing when DOM is ready
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', function() {
                      observer.observe(document.body, { childList: true, subtree: true });
                    });
                  } else {
                    observer.observe(document.body, { childList: true, subtree: true });
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetBrainsMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
