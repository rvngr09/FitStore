interface OrderSummaryProps {
  subtotal: number;
  showButton?: boolean;
  buttonText?: string;
  onCheckout?: () => void;
  loading?: boolean;
}

export default function OrderSummary({
  subtotal,
  showButton = false,
  buttonText = 'Proceed to Checkout',
  onCheckout,
  loading = false,
}: OrderSummaryProps) {
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-3">
      <h3 className="font-semibold text-lg text-gray-900">Order Summary</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
        </div>
        {shipping > 0 && (
          <p className="text-xs text-gray-400">Free shipping on orders over $50</p>
        )}
        <div className="border-t pt-2 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {showButton && (
        <button
          onClick={onCheckout}
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : buttonText}
        </button>
      )}

      <p className="text-xs text-gray-400 text-center">Cash on Delivery — Pay when you receive</p>
    </div>
  );
}
