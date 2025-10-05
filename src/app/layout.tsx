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
  title: "NEOWatch - Asteroid Impact Predictor",
  description: "Professional Near Earth Objects monitoring system with AI analysis and real-time threat assessment",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: "NEOWatch - Asteroid Impact Predictor",
    description: "Professional Near Earth Objects monitoring system with AI analysis and real-time threat assessment",
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a1a2e" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove browser extension attributes that cause hydration mismatches
              (function() {
                // Remove attributes immediately and aggressively
                function removeExtensionAttributes() {
                  const allElements = document.querySelectorAll('*');
                  allElements.forEach(function(el) {
                    el.removeAttribute('bis_skin_checked');
                    el.removeAttribute('data-bis_skin_checked');
                    // Remove from any existing elements
                    if (el.hasAttribute('bis_skin_checked')) {
                      el.removeAttribute('bis_skin_checked');
                    }
                    if (el.hasAttribute('data-bis_skin_checked')) {
                      el.removeAttribute('data-bis_skin_checked');
                    }
                  });
                }
                
                // Remove attributes immediately
                removeExtensionAttributes();
                
                // Remove attributes as soon as possible
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', removeExtensionAttributes);
                } else {
                  removeExtensionAttributes();
                }
                
                // Set up aggressive observer for dynamic content
                if (typeof window !== 'undefined') {
                  const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                      // Handle attribute changes
                      if (mutation.type === 'attributes') {
                        const target = mutation.target;
                        if (target.nodeType === 1) {
                          if (target.hasAttribute('bis_skin_checked')) {
                            target.removeAttribute('bis_skin_checked');
                          }
                          if (target.hasAttribute('data-bis_skin_checked')) {
                            target.removeAttribute('data-bis_skin_checked');
                          }
                        }
                      }
                      
                      // Handle added nodes
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
                  
                  // Start observing with all mutation types
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', function() {
                      observer.observe(document.body, { 
                        childList: true, 
                        subtree: true, 
                        attributes: true,
                        attributeFilter: ['bis_skin_checked', 'data-bis_skin_checked']
                      });
                    });
                  } else {
                    observer.observe(document.body, { 
                      childList: true, 
                      subtree: true, 
                      attributes: true,
                      attributeFilter: ['bis_skin_checked', 'data-bis_skin_checked']
                    });
                  }
                }
                
                // Also run on window load and periodically
                window.addEventListener('load', removeExtensionAttributes);
                setInterval(removeExtensionAttributes, 1000);
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
