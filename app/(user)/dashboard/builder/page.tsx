import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { EmailBuilderStudio } from "@/app/components/email/EmailBuilderStudio";

export const dynamic = "force-dynamic";

export default function EmailBuilderPage() {
  return (
    <>
      <PageHeader
        title="Email builder"
        description="Create an email with AI, a visual block editor, or raw HTML — then preview it on desktop and mobile."
      />

      <EmailBuilderStudio />
    </>
  );
}