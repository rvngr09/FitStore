import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-on-surface w-full py-xl border-t-4 border-primary mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-xl px-gutter max-w-container-max mx-auto">
        <div className="flex flex-col gap-6">
          <div className="font-display-lg-mobile text-display-lg-mobile text-primary-fixed uppercase leading-none">
            P+X
          </div>
          <p className="font-label-sm text-label-sm text-surface-variant opacity-80 uppercase max-w-xs">
            © 2024 PERFORMANCE+X. ENGINEERED FOR ELITE RESULTS.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <span className="font-label-sm text-label-sm text-primary-fixed uppercase tracking-widest border-b border-primary-fixed/30 pb-2 mb-2 w-full">Intel</span>
            <Link href="/" className="font-label-sm text-label-sm text-surface-variant opacity-80 hover:opacity-100 hover:text-primary-fixed transition-all uppercase">
              Support
            </Link>
            <Link href="/" className="font-label-sm text-label-sm text-surface-variant opacity-80 hover:opacity-100 hover:text-primary-fixed transition-all uppercase">
              Shipping & Returns
            </Link>
            <Link href="/" className="font-label-sm text-label-sm text-surface-variant opacity-80 hover:opacity-100 hover:text-primary-fixed transition-all uppercase">
              Wholesale
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-label-sm text-label-sm text-primary-fixed uppercase tracking-widest border-b border-primary-fixed/30 pb-2 mb-2 w-full">Legal</span>
            <Link href="/" className="font-label-sm text-label-sm text-surface-variant opacity-80 hover:opacity-100 hover:text-primary-fixed transition-all uppercase">
              Privacy Policy
            </Link>
            <Link href="/" className="font-label-sm text-label-sm text-surface-variant opacity-80 hover:opacity-100 hover:text-primary-fixed transition-all uppercase">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
