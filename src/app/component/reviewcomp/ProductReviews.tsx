"use client";
import { useState, useEffect } from "react";
import { Star, ThumbsUp, ThumbsDown, ChevronDown } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Review {
  _id: string;
  rating: number;
  title: string;
  body: string;
  reviewerName: string;
  isVerifiedBuyer: boolean;
  isHelpful: number;
  isNotHelpful: number;
  createdAt: string;
}

interface ReviewData {
  total: number;
  avgRating: number;
  distribution: Record<string, number>;
  data: Review[];
}

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "w-6 h-6" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s}
          className={`${cls} ${s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [data,    setData]    = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort,    setSort]    = useState("newest");
  const [page,    setPage]    = useState(1);
  const [helpful, setHelpful] = useState<Record<string, boolean | null>>({});

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API}/reviews/product/${productId}?sort=${sort}&page=${page}&limit=5`);
        const json = await res.json();
        if (json.success) setData(json);
      } catch {}
      finally { setLoading(false); }
    };
    fetchReviews();
  }, [productId, sort, page]);

  const markHelpful = async (reviewId: string, isHelpful: boolean) => {
    if (helpful[reviewId] !== undefined) return; // already voted
    try {
      await fetch(`${API}/reviews/${reviewId}/helpful`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpful: isHelpful }),
      });
      setHelpful((prev) => ({ ...prev, [reviewId]: isHelpful }));
      // Refresh
      const res  = await fetch(`${API}/reviews/product/${productId}?sort=${sort}&page=${page}&limit=5`);
      const json = await res.json();
      if (json.success) setData(json);
    } catch {}
  };

  if (loading && !data) {
    return (
      <div className="mt-9 space-y-3 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-24" />
        ))}
      </div>
    );
  }

  if (!data || data.total === 0) {
    return (
      <div className="mt-9 border border-slate-200 rounded-xl p-8 text-center">
        <Star className="w-10 h-10 text-gray-200 fill-gray-200 mx-auto mb-3" />
        <p className="font-semibold text-gray-600">No reviews yet</p>
        <p className="text-sm text-gray-400 mt-1">Be the first to review this product</p>
      </div>
    );
  }

  const maxDist = Math.max(...Object.values(data.distribution), 1);

  return (
    <div className="mt-9">

      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-6 border border-slate-200 rounded-xl p-6 mb-6">

        {/* Average */}
        <div className="flex flex-col items-center justify-center sm:w-40 flex-shrink-0">
          <p className="text-5xl font-bold text-gray-800">{data.avgRating}</p>
          <StarDisplay rating={Math.round(data.avgRating)} size="lg" />
          <p className="text-xs text-gray-400 mt-1">{data.total} reviews</p>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = data.distribution[star] || 0;
            const pct   = Math.round((count / maxDist) * 100);
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12 flex-shrink-0">
                  <span className="text-xs font-medium text-gray-600">{star}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">{data.total} Reviews</h3>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs outline-none appearance-none bg-white focus:ring-2 focus:ring-amber-200"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {/* Review list */}
      <div className="space-y-4">
        {data.data.map((review) => (
          <div key={review._id} className="border border-slate-200 rounded-xl p-5">

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {review.reviewerName?.[0]?.toUpperCase() || "A"}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">{review.reviewerName}</p>
                    {review.isVerifiedBuyer && (
                      <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">
                        ✓ Verified Buyer
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400">{formatDate(review.createdAt)}</p>
                </div>
              </div>
              <StarDisplay rating={review.rating} />
            </div>

            {/* Content */}
            {review.title && (
              <p className="mt-3 font-semibold text-gray-800 text-sm">{review.title}</p>
            )}
            {review.body && (
              <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{review.body}</p>
            )}

            {/* Helpful */}
            <div className="mt-4 flex items-center gap-3 pt-3 border-t border-gray-50">
              <p className="text-xs text-gray-400">Was this helpful?</p>
              <button
                onClick={() => markHelpful(review._id, true)}
                disabled={helpful[review._id] !== undefined}
                className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition ${
                  helpful[review._id] === true
                    ? "bg-green-100 border-green-200 text-green-700"
                    : "border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600"
                } disabled:opacity-60`}
              >
                <ThumbsUp className="w-3 h-3" />
                Yes ({review.isHelpful})
              </button>
              <button
                onClick={() => markHelpful(review._id, false)}
                disabled={helpful[review._id] !== undefined}
                className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition ${
                  helpful[review._id] === false
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500"
                } disabled:opacity-60`}
              >
                <ThumbsDown className="w-3 h-3" />
                No ({review.isNotHelpful})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      {data.data.length < data.total && (
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={loading}
          className="mt-5 w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
        >
          {loading
            ? "Loading..."
            : <><ChevronDown className="w-4 h-4" /> Load More Reviews</>
          }
        </button>
      )}
    </div>
  );
}