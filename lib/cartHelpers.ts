const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Get or create a guest session ID
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem("cart_session_id");
  if (!sid) {
    sid = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("cart_session_id", sid);
  }
  return sid;
}

export function cartHeaders() {
  return {
    "Content-Type":   "application/json",
    "x-session-id":   getSessionId(),
  };
}

export async function fetchCart() {
  const res  = await fetch(`${API}/cart`, { headers: cartHeaders(), credentials: "include" });
  const json = await res.json();
  return json.data;
}

export async function addToCart(productId: string, quantity = 1, variation = {}) {
  const res = await fetch(`${API}/cart/add`, {
    method:      "POST",
    headers:     cartHeaders(),
    credentials: "include",
    body: JSON.stringify({ productId, quantity, variation }),
  });
  return res.json();
}

export async function updateCartItem(itemId: string, quantity: number) {
  const res = await fetch(`${API}/cart/item/${itemId}`, {
    method:      "PUT",
    headers:     cartHeaders(),
    credentials: "include",
    body: JSON.stringify({ quantity }),
  });
  return res.json();
}

export async function removeCartItem(itemId: string) {
  const res = await fetch(`${API}/cart/item/${itemId}`, {
    method:      "DELETE",
    headers:     cartHeaders(),
    credentials: "include",
  });
  return res.json();
}

export async function clearCart() {
  const res = await fetch(`${API}/cart/clear`, {
    method:      "DELETE",
    headers:     cartHeaders(),
    credentials: "include",
  });
  return res.json();
}

export async function placeOrder(payload: {
  fromCart?: boolean;
  items?: { productId: string; quantity: number; variation?: any }[];
  shipping: any;
  paymentMethod?: string;
  notes?: string;
}) {
  const res = await fetch(`${API}/orders`, {
    method:      "POST",
    headers:     cartHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  console.log(res)
  return res.json();
}