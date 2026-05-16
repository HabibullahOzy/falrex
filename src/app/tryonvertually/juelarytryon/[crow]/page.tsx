import CrownTryon from "../crowntryon/page";
// import ProductDetails from "../productdetails/page";

// ── Fetch all product IDs at BUILD TIME ────────────────────────────────────
export async function generateStaticParams() {
  try {
    const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product`);
    const json = await res.json();
    
    return (json.data || []).map((product: { _id: string }) => ({
      crow: product._id.toString(),
    }));
  } catch {
    return []; // return empty if backend unreachable at build time
  }
}

// ── Fetch single product ───────────────────────────────────────────────────
async function getProduct(crow: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/${crow}`, {
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
  params: Promise<{ crow: string }>;
}) {

  
const { crow } = await params;
const product = await getProduct(crow);

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500 text-lg font-semibold">
        ❌ Product not found
      </div>
    );
  }

  return <CrownTryon product={product} />;
}