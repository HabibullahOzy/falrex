"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Send, Loader2, CheckCircle, Package } from "lucide-react";
import { cartHeaders } from "../../../../lib/cartHelpers";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Props {
  orderId: string;
  product: {
    productId: string;
    nameEng: string;
    image: string;
  };
  onSubmit: () => void;
  onClose: () => void;
}

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

const QUICK_TAGS = [
  "Great quality", "Fast delivery", "As described",
  "Good packaging", "Highly recommend", "Value for money",
  "Excellent supplier", "Will order again",
];

export default function ReviewModal({ orderId, product, onSubmit, onClose }: Props) {
  const [rating,       setRating]       = useState(0);
  const [hoverRating,  setHoverRating]  = useState(0);
  const [title,        setTitle]        = useState("");
  const [body,         setBody]         = useState("");
  const [name,         setName]         = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [done,         setDone]         = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("Please select a rating"); return; }

    setLoading(true); setError("");

    // Build body text with tags
    const fullBody = [
      ...selectedTags,
      body.trim(),
    ].filter(Boolean).join(". ");

    try {
      const res = await fetch(`${API}/reviews`, {
        method:      "POST",
        headers:     cartHeaders(),
        credentials: "include",
        body: JSON.stringify({
          orderId,
          productId:    product.productId,
          rating,
          title:        title.trim(),
          body:         fullBody,
          reviewerName: name.trim() || "Anonymous",
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setDone(true);
      setTimeout(() => { onSubmit(); }, 1800);
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally { setLoading(false); }
  };

  const displayRating = hoverRating || rating;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1,    opacity: 1, y: 0 }}
          exit={{    scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >

          {/* ── Success state ── */}
          {done ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
              >
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              </motion.div>
              <h2 className="text-xl font-bold text-gray-800">Thank You!</h2>
              <p className="text-gray-500 text-sm mt-2">
                Your review has been submitted successfully.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 text-sm">Rate Your Purchase</h2>
                    <p className="text-[10px] text-gray-400">Optional — share your experience</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-5">

                {/* Product info */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                    {product.image
                      ? <img src={product.image} alt={product.nameEng} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-300" /></div>
                    }
                  </div>
                  <p className="text-xs font-semibold text-gray-700 line-clamp-2 flex-1">
                    {product.nameEng}
                  </p>
                </div>

                {/* Star rating */}
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    How would you rate this product?
                    <span className="text-red-500 ml-1">*</span>
                  </p>

                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-9 h-9 transition-colors ${
                            star <= displayRating
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-200 fill-gray-200"
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>

                  {displayRating > 0 && (
                    <motion.p
                      key={displayRating}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm font-semibold text-amber-600"
                    >
                      {RATING_LABELS[displayRating]}
                    </motion.p>
                  )}
                </div>

                {/* Quick tags */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Quick highlights (optional)</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-[11px] px-3 py-1.5 rounded-full border font-medium transition ${
                          selectedTags.includes(tag)
                            ? "bg-amber-500 border-amber-500 text-white"
                            : "bg-white border-gray-200 text-gray-600 hover:border-amber-300"
                        }`}
                      >
                        {selectedTags.includes(tag) ? "✓ " : ""}{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Review Title (optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summarize your experience..."
                    maxLength={100}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-300 outline-none"
                  />
                </div>

                {/* Review body */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Detailed Review (optional)
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Share your experience with this product. Quality, delivery, packaging..."
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-300 outline-none resize-none"
                  />
                  <p className="text-[10px] text-gray-400 text-right mt-1">{body.length}/500</p>
                </div>

                {/* Reviewer name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Your Name (optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Anonymous"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-300 outline-none"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-xs">
                    {error}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    disabled={loading || rating === 0}
                    className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <><Send className="w-4 h-4" /> Submit Review</>
                    }
                  </button>
                </div>

                {/* Privacy note */}
                <p className="text-[10px] text-gray-400 text-center">
                  Reviews are public and help other buyers make informed decisions.
                </p>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}