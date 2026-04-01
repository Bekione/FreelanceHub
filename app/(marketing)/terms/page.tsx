export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-32 max-w-3xl">
      <h1 className="text-4xl md:text-5xl font-bold mb-8">
        Terms of <span className="text-gradient-primary">Service</span>
      </h1>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <p>Last updated: April 2026</p>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using FreelanceHub, you agree to be bound by these
            Terms of Service. If you disagree with any part of these terms, you
            may not access our service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            2. User Accounts
          </h2>
          <p>
            You are responsible for safeguarding the password and credentials
            used to access FreelanceHub. You agree not to disclose your password
            to any third party and to take sole responsibility for any
            activities or actions under your account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            3. Acceptable Use
          </h2>
          <p>
            FreelanceHub is exclusively meant to organize your freelance
            contracts, invoices, and clientele. You may not use the platform for
            any illegal or unauthorized purpose, nor may you, in the use of the
            Service, violate any laws in your jurisdiction.
          </p>
        </section>
      </div>
    </div>
  );
}
