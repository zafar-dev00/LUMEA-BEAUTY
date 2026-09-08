import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

  // Auto-close menu drawer and dropdowns on any route change
  useEffect(() => {
    setOpen(false);
    setAccountOpen(false);
  }, [location.pathname, location.search]);

  // Lock body scroll when drawer is active
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
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
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    <>
      <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur border-b border-nude/40">
        <div className="border-b border-nude/40 bg-charcoal text-ivory text-center text-[11px] tracking-luxe uppercase py-2 px-4">
          Free shipping on all orders over $75
        </div>

        <nav className="container-luxe flex items-center justify-between h-20">
          <button
            className="lg:hidden text-charcoal p-2 focus:outline-none"
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

          {/* Desktop links */}
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

          {/* Right actions */}
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
      </header>

      {/* Rendered via Portal directly into document.body to prevent parent overflow/backdrop-blur clipping */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
              height: "100dvh",
              zIndex: 99999,
              display: "flex",
            }}
          >
            {/* Backdrop overlay */}
            <div
              onClick={() => setOpen(false)}
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(2px)",
              }}
            />

            {/* Slide-out Solid Drawer */}
            <div
              style={{
                position: "relative",
                zIndex: 10,
                width: "82%",
                maxWidth: "320px",
                height: "100%",
                backgroundColor: "#FAF7F2",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "24px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
                overflowY: "auto",
              }}
            >
              <div>
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "18px",
                    borderBottom: "1px solid rgba(43, 38, 34, 0.15)",
                  }}
                >
                  <span className="text-2xl font-display tracking-luxe text-charcoal">
                    LUMÉA
                  </span>
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className="p-2 text-charcoal hover:text-rose transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Links list */}
                <ul className="flex flex-col gap-4 py-6 text-sm uppercase tracking-luxe text-charcoal font-medium">
                  <li>
                    <button
                      type="button"
                      onClick={handleHomeClick}
                      className="flex items-center gap-3 w-full text-left py-2 hover:text-rose transition-colors"
                    >
                      <Home size={18} className="text-charcoal" />
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
                          className="block py-2 hover:text-rose transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}

                  <li className="pt-3 border-t border-charcoal/10">
                    <Link
                      to="/wishlist"
                      onClick={() => setOpen(false)}
                      className="block py-2 hover:text-rose transition-colors"
                    >
                      Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/cart"
                      onClick={() => setOpen(false)}
                      className="block py-2 hover:text-rose transition-colors"
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
                          className="block py-2 hover:text-rose transition-colors"
                        >
                          My Account
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/account/orders"
                          onClick={() => setOpen(false)}
                          className="block py-2 hover:text-rose transition-colors"
                        >
                          My Orders
                        </Link>
                      </li>
                      {user?.role === "ADMIN" && (
                        <li>
                          <Link
                            to="/admin"
                            onClick={() => setOpen(false)}
                            className="block py-2 hover:text-rose transition-colors"
                          >
                            Admin Dashboard
                          </Link>
                        </li>
                      )}
                      <li>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="block w-full text-left py-2 uppercase tracking-luxe hover:text-rose transition-colors"
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
                        className="block py-2 hover:text-rose transition-colors"
                      >
                        Login
                      </Link>
                    </li>
                  )}
                </ul>
              </div>

              {/* Bottom Shop CTA Button */}
              <div
                style={{
                  paddingTop: "20px",
                  borderTop: "1px solid rgba(43, 38, 34, 0.15)",
                  marginTop: "auto",
                }}
              >
                <Link
                  to="/shop"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-charcoal text-ivory text-xs uppercase tracking-widest font-medium hover:bg-rose transition-colors text-center shadow"
                >
                  <span>Explore Shop</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}