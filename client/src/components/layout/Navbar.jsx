import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Search, User, Heart, ShoppingBag, ArrowRight, Home } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";

const links = [
  { label: "Home", href: "/#hero", isHome: true },
  { label: "Skincare", href: "/shop?category=Skincare" },
  { label: "Makeup", href: "/shop?category=Makeup" },
  { label: "Fragrance", href: "/shop?category=Fragrance" },
  { label: "Haircare", href: "/shop?category=Haircare" },
  { label: "Sale", href: "/shop" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-close menu drawer and dropdowns on route changes
  useEffect(() => {
    setOpen(false);
    setAccountOpen(false);
  }, [location.pathname, location.search]);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const handleHomeClick = (e) => {
    e.preventDefault();
    setOpen(false);

    if (location.pathname === "/") {
      const heroEl = document.getElementById("hero") || document.querySelector("main") || document.body;
      heroEl.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }
  };

  const handleLogout = async () => {
    setAccountOpen(false);
    setOpen(false);
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur border-b border-nude/40">
      <div className="border-b border-nude/40 bg-charcoal text-ivory text-center text-[11px] tracking-luxe uppercase py-2 px-4">
        Free shipping on all orders over $75
      </div>

      <nav className="container-luxe flex items-center justify-between h-20">
        <button
          className="lg:hidden text-charcoal p-1 focus:outline-none"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <Link
          to="/"
          className="text-2xl sm:text-3xl font-display tracking-luxe text-charcoal mx-auto lg:mx-0"
        >
          LUMÉA
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="hidden lg:flex items-center gap-10 text-sm uppercase tracking-luxe text-charcoal-soft">
          {links.map((link) => (
            <li key={link.label}>
              {link.isHome ? (
                <button
                  type="button"
                  onClick={handleHomeClick}
                  className="uppercase tracking-luxe hover:text-rose transition-colors"
                >
                  {link.label}
                </button>
              ) : (
                <Link to={link.href} className="hover:text-rose transition-colors">
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Action icons */}
        <div className="flex items-center gap-4 text-charcoal">
          <Link
            to="/shop"
            aria-label="Search products"
            className="hidden sm:block hover:text-rose transition-colors"
          >
            <Search size={19} />
          </Link>
          <div className="hidden sm:block relative" ref={accountRef}>
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  aria-label="Account"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen((o) => !o)}
                  className="hover:text-rose transition-colors"
                >
                  <User size={19} />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-full mt-3 w-52 bg-ivory border border-charcoal/10 shadow-xl py-2 z-50">
                    <p className="px-4 py-2 text-xs uppercase tracking-luxe text-nude-dark truncate">
                      Hi, {user?.name?.split(" ")[0] || "there"}
                    </p>
                    <Link
                      to="/account"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 text-sm text-charcoal-soft hover:text-rose hover:bg-cream transition-colors"
                    >
                      My Account
                    </Link>
                    <Link
                      to="/account/orders"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 text-sm text-charcoal-soft hover:text-rose hover:bg-cream transition-colors"
                    >
                      My Orders
                    </Link>
                    {user?.role === "ADMIN" && (
                      <Link
                        to="/admin"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2 text-sm text-charcoal-soft hover:text-rose hover:bg-cream transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-charcoal-soft hover:text-rose hover:bg-cream transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" aria-label="Login" className="block hover:text-rose transition-colors">
                <User size={19} />
              </Link>
            )}
          </div>
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="hidden sm:block relative hover:text-rose transition-colors"
          >
            <Heart size={19} />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose text-[10px] text-ivory">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            aria-label="Bag"
            className="relative hover:text-rose transition-colors"
          >
            <ShoppingBag size={19} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose text-[10px] text-ivory">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Full-Screen Mobile Drawer System */}
      {open && (
        <div className="fixed inset-0 z-[999] lg:hidden">
          {/* Opaque dark backdrop */}
          <div
            className="fixed inset-0 bg-charcoal/70 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Solid Drawer Container */}
          <div className="relative z-10 flex flex-col justify-between h-full w-[85%] max-w-xs !bg-[#faf8f5] p-6 shadow-2xl overflow-y-auto">
            <div>
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-5 border-b border-charcoal/10">
                <span className="text-xl font-display tracking-luxe text-charcoal">
                  LUMÉA
                </span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="p-1 text-charcoal hover:text-rose transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Navigation List */}
              <ul className="flex flex-col gap-4 py-6 text-sm uppercase tracking-luxe text-charcoal-soft font-normal">
                {/* Dedicated Home / Hero Button */}
                <li>
                  <button
                    type="button"
                    onClick={handleHomeClick}
                    className="flex items-center gap-2.5 w-full text-left py-1 text-charcoal hover:text-rose transition-colors"
                  >
                    <Home size={16} />
                    <span>Home</span>
                  </button>
                </li>

                {links
                  .filter((item) => !item.isHome)
                  .map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        onClick={() => setOpen(false)}
                        className="block py-1 hover:text-rose transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}

                <li className="pt-3 border-t border-charcoal/10">
                  <Link
                    to="/wishlist"
                    onClick={() => setOpen(false)}
                    className="block py-1 hover:text-rose transition-colors"
                  >
                    Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cart"
                    onClick={() => setOpen(false)}
                    className="block py-1 hover:text-rose transition-colors"
                  >
                    Bag {cartCount > 0 && `(${cartCount})`}
                  </Link>
                </li>

                {isAuthenticated ? (
                  <>
                    <li className="pt-3 border-t border-charcoal/10">
                      <Link
                        to="/account"
                        onClick={() => setOpen(false)}
                        className="block py-1 hover:text-rose transition-colors"
                      >
                        My Account
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/account/orders"
                        onClick={() => setOpen(false)}
                        className="block py-1 hover:text-rose transition-colors"
                      >
                        My Orders
                      </Link>
                    </li>
                    {user?.role === "ADMIN" && (
                      <li>
                        <Link
                          to="/admin"
                          onClick={() => setOpen(false)}
                          className="block py-1 hover:text-rose transition-colors"
                        >
                          Admin Dashboard
                        </Link>
                      </li>
                    )}
                    <li>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full text-left py-1 uppercase tracking-luxe hover:text-rose transition-colors"
                      >
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <li className="pt-3 border-t border-charcoal/10">
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="block py-1 hover:text-rose transition-colors"
                    >
                      Login
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Bottom Action Button */}
            <div className="pt-5 border-t border-charcoal/10 mt-auto">
              <Link
                to="/shop"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-charcoal text-ivory text-xs uppercase tracking-widest font-medium hover:bg-rose transition-colors text-center"
              >
                <span>Explore Shop</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}