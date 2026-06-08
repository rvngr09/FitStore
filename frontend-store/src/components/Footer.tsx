export default function Footer() {
  return (
    <footer className="bg-secondary text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">FitStore</h3>
            <p className="text-sm">Your one-stop shop for premium fitness gear, supplements, and apparel.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/products" className="hover:text-primary transition">All Products</a></li>
              <li><a href="/cart" className="hover:text-primary transition">Cart</a></li>
              <li><a href="/account/orders" className="hover:text-primary transition">My Orders</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Email: support@fitstore.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>Cash on Delivery Only</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          &copy; {new Date().getFullYear()} FitStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
