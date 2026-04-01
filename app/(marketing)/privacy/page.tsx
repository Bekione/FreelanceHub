export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-32 max-w-3xl">
      <h1 className="text-4xl md:text-5xl font-bold mb-8">
        Privacy <span className="text-gradient-primary">Policy</span>
      </h1>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <p>Last updated: April 2026</p>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            1. Data Collection
          </h2>
          <p>
            When you register for FreelanceHub, we collect basic profile
            information (such as your name and email address) to create your
            account and securely authenticate your identity. Onboarding surveys
            capture broad workflow preferences to improve your platform
            experience.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            2. Data Security
          </h2>
          <p>
            All critical application data—ranging from client portfolios to
            invoice transactions—is encrypted securely. We never sell your
            freelance metrics, invoice data, or project details to third-party
            data brokers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            3. Third-Party Integrations
          </h2>
          <p>
            We may integrate with external providers (like Google for single
            sign-on authentication). Any data shared with these providers
            strictly adheres to their respective privacy agreements and is
            scoped exclusively to what is technically required for application
            functionality.
          </p>
        </section>
      </div>
    </div>
  );
}
