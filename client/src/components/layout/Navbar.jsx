import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, User, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";

const links = [
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

  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const handleLogout = async () => {
    setAccountOpen(false);
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur border-b border-nude/40">
      <div className="border-b border-nude/40 bg-charcoal text-ivory text-center text-[11px] tracking-luxe uppercase py-2 px-4">
        Free shipping on all orders over $75
      </div>

      <nav className="container-luxe flex items-center justify-between h-20">
        <button
          className="lg:hidden text-charcoal"
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

        <ul className="hidden lg:flex items-center gap-10 text-sm uppercase tracking-luxe text-charcoal-soft">
          {links.map((link) => (
            <li key={link.label}>
              <Link to={link.href} className="hover:text-rose transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

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

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-charcoal/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-ivory p-6 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-display tracking-luxe text-charcoal">
                LUMÉA
              </span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X size={22} className="text-charcoal" />
              </button>
            </div>
            <ul className="flex flex-col gap-6 text-sm uppercase tracking-luxe text-charcoal-soft">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className="hover:text-rose transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/wishlist"
                  onClick={() => setOpen(false)}
                  className="hover:text-rose transition-colors"
                >
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  onClick={() => setOpen(false)}
                  className="hover:text-rose transition-colors"
                >
                  Bag {cartCount > 0 && `(${cartCount})`}
                </Link>
              </li>
              {isAuthenticated ? (
                <>
                  <li>
                    <Link
                      to="/account"
                      onClick={() => setOpen(false)}
                      className="hover:text-rose transition-colors"
                    >
                      My Account
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/account/orders"
                      onClick={() => setOpen(false)}
                      className="hover:text-rose transition-colors"
                    >
                      My Orders
                    </Link>
                  </li>
                  {isAuthenticated && user?.role === "ADMIN" && (
                    <li>
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="hover:text-rose transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        handleLogout();
                      }}
                      className="hover:text-rose transition-colors"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="hover:text-rose transition-colors"
                  >
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
