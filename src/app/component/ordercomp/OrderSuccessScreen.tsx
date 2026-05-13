"use client";
import { useState } from "react";
import { CheckCircle, Star, X, ChevronRight, Package } from "lucide-react";
import ReviewModal from "../reviewcomp/ReviewModal";
import { useRouter } from "next/navigation";

interface OrderItem {
  productId: string;
  nameEng: string;
  image: string;
  quantity: number;
  finalPrice: number;
  currency: string;
}

interface Props {
  orderNumber: string;
  orderId: string;
  orderItems: OrderItem[];
  onClose: () => void;
}

export default function OrderSuccessScreen({
  orderNumber, orderId, orderItems, onClose,
}: Props) {
  const router = useRouter();
  const [showReview,      setShowReview]      = useState(false);
  const [reviewProduct,   setReviewProduct]   = useState<OrderItem | null>(null);
  const [reviewedIds,     setReviewedIds]     = useState<Set<string>>(new Set());
  const [reviewDismissed, setReviewDismissed] = useState(false);
  const sym = orderItems[0]?.currency?.includes("$") ? "$" : "৳";

  const handleReviewProduct = (item: OrderItem) => {
    setReviewProduct(item);
    setShowReview(true);
  };

  const handleReviewDone = (productId: string) => {
    setReviewedIds((prev) => new Set([...prev, productId]));
    setShowReview(false);
    setReviewProduct(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg space-y-4">

          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Order Placed!</h1>
            <p className="text-gray-500 text-sm mt-1">Thank you for your purchase</p>
            <div className="mt-3 inline-flex items-center gap-2 bg-purple-50 rounded-xl px-4 py-2">
              <Package className="w-4 h-4 text-purple-500" />
              <span className="text-purple-700 font-bold text-sm">{orderNumber}</span>
            </div>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              We'll contact you to confirm your order. You'll receive updates via email.
            </p>
          </div>

          {/* Review Prompt Card */}
          {!reviewDismissed && orderItems.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">How was your experience?</p>
                    <p className="text-xs text-gray-500 mt-0.5">Your review helps other buyers</p>
                  </div>
                </div>
                <button
                  onClick={() => setReviewDismissed(true)}
                  className="w-7 h-7 rounded-full hover:bg-gray-200 flex items-center justify-center transition text-gray-400"
                  title="Skip review"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 py-3 space-y-2">
                {orderItems.map((item) => {
                  const isReviewed = reviewedIds.has(item.productId);
                  return (
                    <div key={item.productId}
                      className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">

                      {/* Product image */}
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.image
                          ? <img src={item.image} alt={item.nameEng} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-300" /></div>
                        }
                      </div>

                      {/* Product name */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 line-clamp-1">{item.nameEng}</p>
                        <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                      </div>

                      {/* Review button */}
                      {isReviewed ? (
                        <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Reviewed
                        </div>
                      ) : (
                        <button
                          onClick={() => handleReviewProduct(item)}
                          className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition"
                        >
                          <Star className="w-3 h-3 fill-amber-400" />
                          Rate
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Skip all */}
              <div className="px-5 pb-4">
                <button
                  onClick={() => setReviewDismissed(true)}
                  className="w-full text-xs text-gray-400 hover:text-gray-600 transition py-1"
                >
                  Skip for now — maybe later
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => router.push("/orders")}
              className="w-full py-3 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition text-gray-600"
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReview && reviewProduct && (
        <ReviewModal
          orderId={orderId}
          product={reviewProduct}
          onSubmit={() => handleReviewDone(reviewProduct.productId)}
          onClose={() => {
            setShowReview(false);
            setReviewProduct(null);
          }}
        />
      )}
    </>
  );
}