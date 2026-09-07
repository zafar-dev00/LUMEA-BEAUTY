import { Camera, Globe, Mail } from "lucide-react";

const columns = [
  {
    title: "Shop",
    links: ["Skincare", "Makeup", "Fragrance", "Haircare", "Best Sellers"],
  },
  {
    title: "About",
    links: ["Our Story", "Ingredients", "Sustainability", "Careers"],
  },
  {
    title: "Support",
    links: ["Contact Us", "Shipping & Returns", "FAQs", "Track Order"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream">
      <div className="container-luxe py-16 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="text-2xl font-display tracking-luxe text-ivory">
            LUMÉA
          </h2>
          <p className="mt-4 text-sm text-cream/70 leading-relaxed max-w-xs">
            Clean, elegant beauty essentials crafted for the modern
            minimalist. Radiance, redefined.
          </p>
          <div className="flex items-center gap-4 mt-6">
            <a href="#" aria-label="Instagram" className="hover:text-rose transition-colors">
              <Camera size={18} />
            </a>
            <a href="#" aria-label="Website" className="hover:text-rose transition-colors">
              <Globe size={18} />
            </a>
            <a href="#" aria-label="Email" className="hover:text-rose transition-colors">
              <Mail size={18} />
            </a>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-xs uppercase tracking-luxe text-nude mb-5">
              {col.title}
            </h3>
            <ul className="space-y-3 text-sm text-cream/80">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-rose transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-cream/10">
        <div className="container-luxe py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/60 uppercase tracking-luxe">
          <p>© {new Date().getFullYear()} LUMÉA Beauty. All rights reserved.</p>
          <p>Crafted with care, worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
