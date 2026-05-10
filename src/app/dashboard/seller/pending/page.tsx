export default function SellerPending() {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-8 max-w-md text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="text-xl font-bold text-gray-800">Verification Pending</h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Your seller account is under review. Our team will verify your business
          details within <b>24–48 hours</b>. You'll receive an email once approved.
        </p>
        <div className="mt-6 bg-amber-50 rounded-xl p-4 text-left space-y-2">
          {["Submit business info ✅", "Admin reviews (in progress) ⏳", "Email confirmation", "Start listing products"].map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                i < 2 ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                {i + 1}
              </div>
              <span className={i < 2 ? "text-amber-800 font-medium" : "text-gray-400"}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}