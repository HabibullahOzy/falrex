

// app/component/category/[slug]/page.tsx
import { notFound } from "next/navigation";
import CategoryProductsClient from "./CategoryProductsClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getCategory(slug: string) {
  try {
    if (!slug || slug === "undefined") return null;

    // Convert slug → name: "consumer-electronics" → "consumer electronics"
    // const name = slug.replace(/-/g, " ");

    // This hits your Category model, not Product model
    const res = await fetch(
      `${API}/product/category/${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    );
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!slug || slug === "undefined") notFound();

  const category = await getCategory(slug);
  if (!category) notFound();

  return <CategoryProductsClient category={category} />;
}