import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { IcpBuilderForm } from "@/app/components/dashboard/IcpBuilderForm";

export const dynamic = "force-dynamic";

export default function NewIcpPage() {
  return (
    <>
      <PageHeader
        title="New ICP"
        description="Describe your ideal customer in plain language, then review the filters AI derives from it."
        breadcrumb={[
          { label: "My ICPs", href: "/dashboard/icps" },
          { label: "New" },
        ]}
      />

      <IcpBuilderForm />
    </>
  );
}