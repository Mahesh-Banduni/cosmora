import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { Card } from "@/app/components/dashboard/Card";
import {
  CreateCategoryTrigger,
  CategoriesTable,
  type AdminCategory,
} from "@/app/components/admin/CategoriesManager";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { companies: true } } },
    orderBy: { name: "asc" },
  });

  const rows: AdminCategory[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    color: category.color,
    companyCount: category._count.companies,
  }));

  return (
    <>
      <PageHeader
        title="Categories"
        description="Group companies so leads can be filtered and reported on."
        actions={<CreateCategoryTrigger />}
      />

      <Card>
        <CategoriesTable categories={rows} />
      </Card>
    </>
  );
}
