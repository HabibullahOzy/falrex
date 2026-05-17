"use client";
import { useState } from "react";
import { useCart } from "../../../context/CartContext";
import { placeOrder } from "../../../../../lib/cartHelpers";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import OrderSuccessScreen from "@/app/component/ordercomp/OrderSuccessScreen";
import Image from "next/image";

const COUNTRIES = ["Bangladesh (BD)", "China (CN)", "India (IN)", "United States (US)", "United Kingdom (GB)", "Other"];

const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-300 outline-none";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const sym = cart.items[0]?.currency?.includes("$") ? "$" : "৳";

  const [shipping, setShipping] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", postalCode: "", country: "", notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [lastOrderItems, setLastOrderItems] = useState<any[]>([]);

  const updateField = (field: string, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");

    try {
      const res = await placeOrder({
        fromCart: true,
        shipping,
        paymentMethod,
        notes: shipping.notes,
      });

      if (!res.success) throw new Error(res.message);

      setSuccess(res.data.orderNumber);
      setSuccessOrderId(res.data._id);
      setLastOrderItems(res.data.items || []);
      await clearCart();
    } catch (err: any) {
      setError(err.message || "Failed to place order");
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      // <div className="min-h-screen flex items-center justify-center px-4">
      //   <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
      //     <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      //     <h1 className="text-2xl font-bold text-gray-800">Order Placed!</h1>
      //     <p className="text-gray-500 mt-2 text-sm">Your order number is:</p>
      //     <p className="text-xl font-bold text-purple-600 mt-1">{success}</p>
      //     <p className="text-sm text-gray-400 mt-3 leading-relaxed">
      //       We'll contact you to confirm your order details. Thank you for shopping with us!
      //     </p>
      //     <button onClick={() => router.push("/")}
      //       className="mt-6 w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition">
      //       Continue Shopping
      //     </button>
      //   </div>
      // </div>

      <>
        <OrderSuccessScreen
          orderNumber={success}
          orderId={successOrderId ?? ""}
          orderItems={lastOrderItems}
          onClose={() => router.push("/")}
        />
      </>
    );
  }

  if (cart.items.length === 0) {
    router.push("/products/orderprocess/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Shipping Form */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-4">Shipping Information</h2>

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={shipping.firstName} required
                      onChange={(e) => updateField("firstName", e.target.value)}
                      placeholder="Habib" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                    <input type="text" value={shipping.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      placeholder="Ozy" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input type="email" value={shipping.email} required
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="you@example.com" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input type="tel" value={shipping.phone} required
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+8801XXXXXXXXX" className={inputCls} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={shipping.address} required
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="Street address" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={shipping.city} required
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="Dhaka" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Postal Code</label>
                    <input type="text" value={shipping.postalCode}
                      onChange={(e) => updateField("postalCode", e.target.value)}
                      placeholder="1200" className={inputCls} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select value={shipping.country} required
                      onChange={(e) => updateField("country", e.target.value)}
                      className={`${inputCls} appearance-none bg-white`}>
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
                    <textarea value={shipping.notes} rows={2}
                      onChange={(e) => updateField("notes", e.target.value)}
                      placeholder="Any special instructions..." className={inputCls} />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-4">Payment Method</h2>
                <div className="space-y-2">
                  {[
                    { value: "COD", label: "💵 Cash on Delivery", desc: "Pay when you receive" },
                    { value: "Bank", label: "🏦 Bank Transfer", desc: "Transfer to our bank account" },
                    { value: "bKash", label: "📱 bKash", desc: "Pay via bKash mobile banking" },
                  ].map((pm) => (
                    <label key={pm.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${paymentMethod === pm.value
                        ? "border-purple-400 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}>
                      <input type="radio" name="payment" value={pm.value} checked={paymentMethod === pm.value}
                        onChange={() => setPaymentMethod(pm.value)}
                        className="accent-purple-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{pm.label}</p>
                        <p className="text-xs text-gray-400">{pm.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-5">
                <h2 className="font-bold text-gray-800 mb-4">Order Summary</h2>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.image && <Image width={10} height={10} src={item.image} alt={item.nameEng} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 line-clamp-1">{item.nameEng}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        <p className="text-xs font-bold text-gray-800">
                          {sym} {(item.finalPrice * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{sym} {cart.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">To confirm</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span>{sym} {cart.subtotal.toLocaleString()}</span>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition disabled:opacity-50">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</>
                    : "Place Order"
                  }
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}