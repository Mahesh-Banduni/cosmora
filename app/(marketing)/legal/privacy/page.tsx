import type { Metadata } from "next";
import { LegalPage } from "@/app/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Cosmora handles account data, lead database information, SMTP credentials, email tracking data and your rights over personal data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      active="/legal/privacy"
      title="Privacy Policy"
      description="What we collect, why we collect it, who we share it with, and how to exercise your rights. We do not sell personal data, and we do not send email on your behalf."
      updated="1 October 2026"
      sections={[
        {
          id: "summary",
          title: "Summary",
          body: (
            <>
              <p>
                Cosmora processes a small amount of data to operate the service:
                your account details, the leads and contacts in our curated
                database, the email activity your campaigns generate, and the
                encrypted SMTP credentials you connect.
              </p>
              <p>
                We do not sell personal data. We do not use your SMTP
                credentials for anything other than sending the campaigns you
                queue. And we do not read or process the content of your lead
                database beyond the queries your own ICPs generate.
              </p>
            </>
          ),
        },
        {
          id: "what-we-collect",
          title: "What we collect",
          body: (
            <>
              <p>We collect the following categories of data:</p>
              <ul className="ml-scale-md-5 list-disc flex flex-col gap-scale-sm-3">
                <li>
                  <span className="font-medium text-[var(--text-primary)]">
                    Account data
                  </span>{" "}
                  &mdash; your name, email address, password hash and, if you
                  provide one, your organization name.
                </li>
                <li>
                  <span className="font-medium text-[var(--text-primary)]">
                    Lead database data
                  </span>{" "}
                  &mdash; company and contact records held in our curated
                  database, including business contact details. This is data we
                  curate rather than data you provide.
                </li>
                <li>
                  <span className="font-medium text-[var(--text-primary)]">
                    ICP and campaign data
                  </span>{" "}
                  &mdash; the profiles you describe, the leads you unlock and
                  save, and the email content you create.
                </li>
                <li>
                  <span className="font-medium text-[var(--text-primary)]">
                    Campaign activity data
                  </span>{" "}
                  &mdash; send timestamps, delivery status, bounces, opens,
                  clicks, replies and unsubscriptions, linked to the message and
                  the contact it was sent to.
                </li>
                <li>
                  <span className="font-medium text-[var(--text-primary)]">
                    SMTP credentials
                  </span>{" "}
                  &mdash; the server, port, username and password of the sending
                  accounts you connect, stored encrypted at rest.
                </li>
                <li>
                  <span className="font-medium text-[var(--text-primary)]">
                    Technical data
                  </span>{" "}
                  &mdash; session identifiers and security logs needed to keep
                  accounts secure and to maintain an audit trail of
                  administrative actions.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "why",
          title: "Why we process it",
          body: (
            <>
              <p>We process this data on the following bases:</p>
              <ul className="ml-scale-md-5 list-disc flex flex-col gap-scale-sm-3">
                <li>
                  To provide the service &mdash; matching your ICPs against the
                  lead database, unlocking leads you select, composing your
                  emails, and sending campaigns through your connected SMTP
                  account.
                </li>
                <li>
                  To operate and secure the platform &mdash; authenticating you,
                  enforcing role-based access, and preventing abuse.
                </li>
                <li>
                  To meet legal obligations &mdash; including suppression and
                  unsubscribe handling, which we are required to honour.
                </li>
                <li>
                  To contact you about your account or the service. We do not
                  send marketing email without your consent.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "sharing",
          title: "Who we share it with",
          body: (
            <>
              <p>
                We share data only with the service providers that run the
                platform: database and object storage hosting, the AI provider
                that converts your ICP descriptions into filters and drafts
                emails, and authentication infrastructure. Each of these
                processes data on our instructions and is bound by contract.
              </p>
              <p>
                We may also disclose data where required by law, to respond to
                valid legal process, or to protect the rights and safety of
                ourselves, our users or the public.
              </p>
              <p>
                Email delivery passes through your own SMTP provider and the
                recipient&rsquo;s mail server. We do not sell, rent or trade
                personal data, and we do not share it for others&rsquo;
                marketing.
              </p>
            </>
          ),
        },
        {
          id: "tracking",
          title: "Email tracking and your obligations",
          body: (
            <>
              <p>
                Outbound email includes an open pixel and a click redirect
                keyed to a tracking token, which record when a message is opened
                or a link is clicked. That information is visible to the
                recipient&rsquo;s mail client and some clients block images, so
                open counts are an estimate rather than a certainty.
              </p>
              <p>
                Every message includes an unsubscribe link. Unsubscribing
                suppresses the address permanently, and we re-check the
                suppression list at send time.
              </p>
            </>
          ),
        },
        {
          id: "security",
          title: "Security and retention",
          body: (
            <>
              <p>
                SMTP passwords are encrypted at rest and are never exposed in
                the interface. Access to lead contact details is enforced
                server-side and re-checked on every read, not only when a page
                loads. Administrative actions are recorded in an audit log.
              </p>
              <p>
                We retain account and campaign data while your account is
                active. When an account is deleted we remove or anonymise
                personal data, except where retention is required by law or
                needed to honour a suppression.
              </p>
            </>
          ),
        },
        {
          id: "your-rights",
          title: "Your rights",
          body: (
            <>
              <p>
                Depending on where you live, you may have the right to access
                the personal data we hold about you, to correct it, to have it
                erased, to restrict or object to how we process it, and to
                data portability.
              </p>
              <p>
                You can export or update much of your own data directly from
                your workspace settings. For anything else, contact us and we
                will action the request within the period the applicable law
                requires.
              </p>
            </>
          ),
        },
        {
          id: "cookies",
          title: "Cookies and sessions",
          body: (
            <>
              <p>
                We use a session cookie to keep you signed in and to protect
                administrative routes. We do not run advertising or cross-site
                tracking cookies.
              </p>
            </>
          ),
        },
        {
          id: "changes-privacy",
          title: "Changes to this policy",
          body: (
            <>
              <p>
                If we make a material change to this policy, we will update the
                date at the top of this page and notify you in-product or by
                email before the change takes effect.
              </p>
            </>
          ),
        },
        {
          id: "contact-privacy",
          title: "Contact",
          body: (
            <>
              <p>
                Privacy questions and data requests can be sent to{" "}
                <a
                  href="mailto:privacy@cosmora.dev"
                  className="font-medium text-[var(--text-primary)] underline underline-offset-4"
                >
                  privacy@cosmora.dev
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