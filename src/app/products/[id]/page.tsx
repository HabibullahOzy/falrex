// app/products/[id]/page.tsx
import ProductDetails from "../productdetails/page";

// ── Fetch all product IDs at BUILD TIME ────────────────────────────────────
export async function generateStaticParams() {
  try {
    const res  = await fetch("http://localhost:5000/product");
    const json = await res.json();
    
    return (json.data || []).map((product: { _id: string }) => ({
      id: product._id.toString(),
    }));
  } catch {
    return []; // return empty if backend unreachable at build time
  }
}

// ── Fetch single product ───────────────────────────────────────────────────
async function getProduct(id: string) {
  try {
    const res = await fetch(`http://localhost:5000/product/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

// ── Page ──────────────────────────────────────────────────────────────────
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  
const { id } = await params;
const product = await getProduct(id);

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500 text-lg font-semibold">
        ❌ Product not found
      </div>
    );
  }

  return <ProductDetails product={product} />;
}
