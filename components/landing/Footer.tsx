import { AppLogo } from "@/components/app-logo";
import Link from "next/link";
import packageJson from "@/package.json";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";

interface FooterProps {
  lang: Locale;
  dict: Dictionary["footer"];
}

export default function Footer({ lang, dict }: FooterProps) {
  const columns = [
    {
      title: dict.product,
      links: [
        { name: dict.features, href: "/#features" },
        { name: dict.pricing, href: "/#pricing" },
        { name: dict.dashboardPreview, href: "/#dashboard-preview" },
      ],
    },
    {
      title: dict.resources,
      links: [
        { name: dict.changelog, href: `/${lang}/changelog` },
        { name: dict.status, href: `/${lang}/status` },
        { name: dict.contact, href: "/#contact" },
      ],
    },
    {
      title: dict.legal,
      links: [
        { name: dict.privacy, href: `/${lang}/privacy` },
        { name: dict.terms, href: `/${lang}/terms` },
      ],
    },
  ];
  return (
    <footer className="border-t border-foreground/6 py-16">
      <div className="container px-6 xl:px-[120px] mx-auto">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <AppLogo />
            <p className="text-sm text-muted-foreground mt-4 max-w-xs">
              {dict.slogan}
            </p>
            <div className="flex gap-4 mt-6">
              {/* X */}
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="X"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Bluesky */}
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Bluesky"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.785 2.627 3.6 3.476 6.168 3.125-4.468.676-8.014 2.909-4.546 6.438 3.734 3.295 5.665-.593 6.754-3.293.143-.354.217-.683.259-.876.042.193.116.522.259.876 1.089 2.7 3.02 6.588 6.754 3.293 3.468-3.529-.078-5.762-4.546-6.438 2.568.351 5.383-.498 6.168-3.125.246-.828.624-5.79.624-6.479 0-.688-.139-1.86-.902-2.203-.659-.3-1.664-.621-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" />
                </svg>
              </a>
              {/* GitHub */}
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith("/#") ? (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 pt-8 border-t border-foreground/6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            FreelanceHub v{packageJson.version}
          </p>
          <LanguageSwitcher currentLocale={lang} dropUp />
          <p className="text-sm text-muted-foreground">
            {dict.madeBy}{" "}
            <a
              href="https://github.com/bekione"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground underline underline-offset-4 decoration-primary/50 transition-colors"
            >
              Bereket Kinfe
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
