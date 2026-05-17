"use client";
import { useCompare } from "../../context/CompareContext";
import { GitCompare, Check, X } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  product: any;
  variant?: "icon" | "text" | "full";
}

export default function CompareButton({ product, variant = "full" }: Props) {
  const { addToCompare, removeFromCompare, isInCompare, canAdd } = useCompare();
  const added = isInCompare(product._id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (added) removeFromCompare(product._id);
    else        addToCompare(product);
  };

  if (variant === "icon") {
    return (
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        disabled={!added && !canAdd}
        title={added ? "Remove from compare" : canAdd ? "Add to compare" : "Max 4 products"}
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition
                    border font-bold text-xs
                    ${added
                      ? "bg-purple-600 border-purple-600 text-white"
                      : canAdd
                        ? "bg-white border-gray-200 text-gray-500 hover:border-purple-400 hover:text-purple-600"
                        : "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
                    }`}
      >
        {added ? <Check className="w-3.5 h-3.5" /> : <GitCompare className="w-3.5 h-3.5" />}
      </motion.button>
    );
  }

  if (variant === "text") {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        disabled={!added && !canAdd}
        className={`text-xs font-semibold flex items-center gap-1 transition
                    ${added
                      ? "text-purple-600"
                      : canAdd
                        ? "text-gray-500 hover:text-purple-600"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
      >
        {added
          ? <><Check className="w-3 h-3" /> Added</>
          : <><GitCompare className="w-3 h-3" /> Compare</>
        }
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      disabled={!added && !canAdd}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold
                  border transition
                  ${added
                    ? "bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
                    : canAdd
                      ? "bg-white border-gray-200 text-gray-700 hover:border-purple-400 hover:text-purple-600"
                      : "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
                  }`}
    >
      {added
        ? <><Check className="w-3.5 h-3.5" /> Added to Compare</>
        : <><GitCompare className="w-3.5 h-3.5" /> Compare</>
      }
    </motion.button>
  );
}