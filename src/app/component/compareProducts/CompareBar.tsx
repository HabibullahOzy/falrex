"use client";
import { useCompare } from "../../context/CompareContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, GitCompare, Trash2, ChevronRight } from "lucide-react";

function getCurrencySymbol(currency: string) {
  if (!currency) return "৳";
  if (currency.includes("$")) return "$";
  if (currency.includes("€")) return "€";
  return "৳";
}

export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const router = useRouter();

  return (
    <AnimatePresence>
      {compareList.length > 0 && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          exit={{   y: 120, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50
                     bg-white border-t border-gray-200 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
            <div className="flex items-center gap-3 overflow-x-auto">

              {/* Label */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center">
                  <GitCompare className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-gray-800">Compare</p>
                  <p className="text-[10px] text-gray-400">{compareList.length}/4 selected</p>
                </div>
              </div>

              <div className="w-px h-10 bg-gray-200 flex-shrink-0" />

              {/* Products */}
              <div className="flex items-center gap-2 flex-1 overflow-x-auto pb-1">
                {compareList.map((p) => {
                  const sym  = getCurrencySymbol(p.currency);
                  const disc = p.price && p.discount
                    ? Math.round(p.price * (1 - p.discount / 100)) : p.price;
                  const img  = p.images?.[0]?.url;

                  return (
                    <motion.div
                      key={p._id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1,   opacity: 1 }}
                      exit={{   scale: 0.8, opacity: 0 }}
                      className="relative flex-shrink-0 flex items-center gap-2
                                 bg-gray-50 border border-gray-200 rounded-xl
                                 px-3 py-2 min-w-[160px] max-w-[200px]"
                    >
                      {/* Image */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        {img
                          ? <img src={img} alt={p.nameEng}
                              className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-gray-200" />
                        }
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate leading-tight">
                          {p.nameEng}
                        </p>
                        <p className="text-[10px] text-purple-600 font-bold mt-0.5">
                          {sym} {disc?.toLocaleString()}
                        </p>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCompare(p._id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white
                                   rounded-full flex items-center justify-center hover:bg-red-600
                                   transition flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  );
                })}

                {/* Empty slots */}
                {Array.from({ length: Math.max(0, 2 - compareList.length) }).map((_, i) => (
                  <div key={`empty-${i}`}
                    className="flex-shrink-0 w-40 h-14 border-2 border-dashed border-gray-200
                               rounded-xl flex items-center justify-center">
                    <p className="text-[10px] text-gray-400">+ Add product</p>
                  </div>
                ))}
              </div>

              <div className="w-px h-10 bg-gray-200 flex-shrink-0" />

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={clearCompare}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-200
                             rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50
                             transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>

                <button
                  onClick={() => router.push("/compare")}
                  disabled={compareList.length < 2}
                  className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white
                             rounded-xl text-xs font-bold hover:bg-purple-700 transition
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  Compare Now
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}