import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { TagFilter } from "@/components/resources/TagFilter";

async function ResourceList({ tag }: { tag?: string }) {
  const resources = await prisma.resource.findMany({
    where: tag ? { tags: { hasSome: [tag] } } : undefined,
    orderBy: { createdAt: "asc" },
  });

  if (resources.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <div className="text-4xl mb-3">🔍</div>
        <p>No resources found for this topic.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {resources.map((r) => (
        <ResourceCard
          key={r.id}
          title={r.title}
          description={r.description}
          url={r.url}
          type={r.type}
          tags={r.tags}
        />
      ))}
    </div>
  );
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: { tag?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const tag = searchParams.tag;

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Wellness Resources</h1>
        <p className="text-slate-500 text-sm mt-1">
          Curated articles, videos, and tips to support your mental well-being at work.
        </p>
      </div>

      <Suspense fallback={null}>
        <TagFilter />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card h-48 bg-slate-100" />
            ))}
          </div>
        }
      >
        <ResourceList tag={tag} />
      </Suspense>
    </div>
  );
}
