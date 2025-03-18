export default function Footer() {
    return (
      <footer className="bg-black border-t border-green-500 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-green-400">&copy; {new Date().getFullYear()} GOLD GAMING. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <a href="#" className="text-white hover:text-green-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-white hover:text-green-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-white hover:text-green-400 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    );
  }