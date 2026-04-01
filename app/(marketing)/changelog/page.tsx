export default function ChangelogPage() {
  return (
    <div className="container mx-auto py-32 max-w-3xl">
      <h1 className="text-4xl md:text-5xl font-bold mb-8">
        Change<span className="text-gradient-primary">log</span>
      </h1>

      <div className="space-y-12">
        <div className="relative pl-8 border-l border-foreground/10">
          <div className="absolute w-3 h-3 bg-primary rounded-full -left-[6.5px] top-1.5" />
          <h2 className="text-2xl font-semibold text-foreground">
            v1.0.0 — The Foundation
          </h2>
          <p className="text-sm font-medium text-primary mt-1 mb-4">
            April 2026
          </p>
          <ul className="space-y-2 text-muted-foreground list-disc list-inside">
            <li>
              Complete rewrite of FreelanceHub onto the Next.js 16 App Router.
            </li>
            <li>
              Introduced Prisma Postgres database backing for strict data schema
              validity.
            </li>
            <li>
              Implemented fully featured Invoice, Client, and Project CRUD
              operations.
            </li>
            <li>Launched sleek dark-mode glassmorphism landing page system.</li>
            <li>
              Integrated seamless authentication flows via Better-Auth
              (Credentials & Google OAuth).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
