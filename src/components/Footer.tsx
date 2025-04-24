export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
            <div className="mt-4 space-y-4">
              <a href="#features" className="text-base text-gray-500 hover:text-gray-900 block">
                Features
              </a>
              <a href="#pricing" className="text-base text-gray-500 hover:text-gray-900 block">
                Pricing
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
            <div className="mt-4 space-y-4">
              <a href="#about" className="text-base text-gray-500 hover:text-gray-900 block">
                About
              </a>
              <a href="#blog" className="text-base text-gray-500 hover:text-gray-900 block">
                Blog
              </a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
            <div className="mt-4 space-y-4">
              <a href="#privacy" className="text-base text-gray-500 hover:text-gray-900 block">
                Privacy
              </a>
              <a href="#terms" className="text-base text-gray-500 hover:text-gray-900 block">
                Terms
              </a>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Social</h3>
            <div className="mt-4 space-y-4">
              <a href="https://twitter.com" className="text-base text-gray-500 hover:text-gray-900 block">
                Twitter
              </a>
              <a href="https://github.com" className="text-base text-gray-500 hover:text-gray-900 block">
                GitHub
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} SaaS Template. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}