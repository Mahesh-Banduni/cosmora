import type { Metadata } from "next";
import { LegalPage } from "@/app/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern use of Cosmora, including accounts, credits, acceptable use, your sending responsibilities and liability.",
};

export default function TermsPage() {
  return (
    <LegalPage
      active="/legal/terms"
      title="Terms of Service"
      description="These terms govern your use of Cosmora. They are written to be readable — if anything here is unclear, ask us before you rely on it."
      updated="1 October 2026"
      sections={[
        {
          id: "acceptance",
          title: "Acceptance of these terms",
          body: (
            <>
              <p>
                By creating an account or using Cosmora, you agree to these
                terms on behalf of yourself and, where you are acting for a
                company, on behalf of that company. If you do not agree, do
                not create an account.
              </p>
              <p>
                Your administrator&rsquo;s use of Cosmora to administer your
                organization is also governed by these terms.
              </p>
            </>
          ),
        },
        {
          id: "accounts",
          title: "Accounts and access",
          body: (
            <>
              <p>
                You are responsible for the accuracy of your account
                information, for the confidentiality of your credentials, and
                for all activity under your account. Tell us promptly if you
                suspect unauthorised access.
              </p>
              <p>
                You must be old enough to form a binding contract where you
                live, and you may not create an account on behalf of someone
                without their authority.
              </p>
            </>
          ),
        },
        {
          id: "credits",
          title: "Credits, plans and payment",
          body: (
            <>
              <p>
                Matching and scoring are free. Credits are spent only when you
                choose to unlock a lead&rsquo;s contact details. Credit packs are
                a one-time purchase and do not expire.
              </p>
              <p>
                Paid subscriptions renew at the end of each billing period until
                cancelled. You can cancel at any time; cancellation takes effect
                at the end of the current period and does not remove data you
                have already unlocked.
              </p>
              <p>
                We may change pricing with reasonable notice. If a change
                affects a subscription you have already paid for, we will apply
                it from your next renewal.
              </p>
            </>
          ),
        },
        {
          id: "acceptable-use",
          title: "Acceptable use",
          body: (
            <>
              <p>
                Cosmora exists to help you contact people who would reasonably
                expect to hear from you. You agree not to use it to send
                unsolicited or deceptive email, and not to use it to contact
                anyone who has unsubscribed or been suppressed.
              </p>
              <p>
                You also agree not to:
              </p>
              <ul className="ml-scale-md-5 list-disc flex flex-col gap-scale-sm-2">
                <li>Send on behalf of any third party without their consent.</li>
                <li>
                  Attempt to access the service, or the underlying lead
                  database, other than through the interface provided to you.
                </li>
                <li>
                  Scrape, export, resell or redistribute the lead database or any
                  portion of it.
                </li>
                <li>
                  Use the service to send content that is unlawful, or to
                  impersonate anyone.
                </li>
                <li>
                  Interfere with the service or attempt to gain elevated
                  privileges.
                </li>
              </ul>
              <p>
                We may suspend access where these terms are breached, and we
                will tell you why where we are able to.
              </p>
            </>
          ),
        },
        {
          id: "your-sending",
          title: "Your sending responsibilities",
          body: (
            <>
              <p>
                Cosmora provides the tools to prepare and queue email, but the
                sending is yours. You are solely responsible for the content of
                every message, for the accuracy of the contact data you use,
                and for complying with the laws and regulations that apply to
                you — including anti-spam and data protection law in the
                jurisdictions you send into.
              </p>
              <p>
                You are also responsible for the reputation of the domains and
                sending addresses you connect. We provide send limits, delays
                and suppression to reduce risk, but we cannot guarantee
                delivery or inbox placement, and we are not liable for damage to
                your sender reputation.
              </p>
            </>
          ),
        },
        {
          id: "intellectual-property",
          title: "Intellectual property",
          body: (
            <>
              <p>
                Cosmora, including its software, design, documentation and
                brand, belongs to us. You retain all rights in the content you
                create, including emails, templates and ICP definitions you
                write.
              </p>
              <p>
                The lead database and any data derived from it remain ours. Your
                use of the service does not grant you ownership of, or any
                licence to redistribute, that data beyond sending permitted
                outreach.
              </p>
            </>
          ),
        },
        {
          id: "termination",
          title: "Suspension and termination",
          body: (
            <>
              <p>
                You may stop using Cosmora at any time. We may suspend or
                terminate access where we reasonably believe these terms have
                been breached, where use presents a security or legal risk, or
                where required by law.
              </p>
              <p>
                On termination, your access ends and your data is handled in
                line with our retention commitments in the privacy policy.
                Unused credits are not refundable except where required by
                law.
              </p>
            </>
          ),
        },
        {
          id: "liability",
          title: "Disclaimers and liability",
          body: (
            <>
              <p>
                The service is provided on an &ldquo;as is&rdquo; and
                &ldquo;as available&rdquo; basis. To the fullest extent
                permitted by law we disclaim implied warranties, including
                fitness for a particular purpose.
              </p>
              <p>
                Neither party is liable for indirect, incidental or consequential
                loss, including lost profit, lost data or reputational harm. Our
                total liability to you for any claim arising from the service is
                limited to the greater of the amount you paid us in the twelve
                months before the claim, or fifty US dollars.
              </p>
              <p>
                Nothing in these terms limits liability that cannot be limited
                by law, including liability for fraud.
              </p>
            </>
          ),
        },
        {
          id: "changes",
          title: "Changes to these terms",
          body: (
            <>
              <p>
                We may update these terms as the product changes. The
                &ldquo;last updated&rdquo; date at the top of this page always
                reflects the current version, and material changes will be
                announced in-product or by email before they take effect.
              </p>
            </>
          ),
        },
        {
          id: "contact-terms",
          title: "Contact",
          body: (
            <>
              <p>
                Questions about these terms can be sent to{" "}
                <a
                  href="mailto:legal@cosmora.dev"
                  className="font-medium text-[var(--text-primary)] underline underline-offset-4"
                >
                  legal@cosmora.dev
                </a>
                .
              </p>
            </>
          ),
        },
      ]}
    />
  );
}