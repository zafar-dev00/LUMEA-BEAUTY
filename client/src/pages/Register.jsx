import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import { usePageTitle } from "../hooks/usePageTitle";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,15}$/;

const inputClasses =
  "w-full border border-charcoal/20 bg-ivory px-4 py-3 text-sm focus:outline-none focus:border-rose";

export default function Register() {
  usePageTitle("Create an Account");
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!EMAIL_REGEX.test(form.email)) errs.email = "Enter a valid email address";
    if (!PHONE_REGEX.test(form.phone)) errs.phone = "Enter a valid phone number";
    if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (form.confirmPassword !== form.password)
      errs.confirmPassword = "Passwords do not match";
    if (!acceptedTerms) errs.terms = "You must accept the Terms & Conditions";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch {
      // error surfaced via context `error`
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-ivory">
      <div className="bg-cream py-12">
        <div className="container-luxe text-center">
          <p className="text-xs uppercase tracking-luxe text-rose mb-3">
            Join LUMÉA
          </p>
          <h1 className="text-4xl sm:text-5xl text-charcoal">Create an Account</h1>
        </div>
      </div>

      <div className="container-luxe py-12 lg:py-16 flex justify-center">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="w-full max-w-md space-y-5"
        >
          {error && (
            <div className="bg-rose/10 border border-rose text-rose-dark text-sm px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-xs uppercase tracking-luxe text-charcoal mb-2"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              className={inputClasses}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-rose-dark">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs uppercase tracking-luxe text-charcoal mb-2"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              className={inputClasses}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-rose-dark">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-xs uppercase tracking-luxe text-charcoal mb-2"
            >
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel"
              className={inputClasses}
            />
            {fieldErrors.phone && (
              <p className="mt-1 text-xs text-rose-dark">{fieldErrors.phone}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs uppercase tracking-luxe text-charcoal mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                className={`${inputClasses} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-nude-dark hover:text-rose"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-rose-dark">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs uppercase tracking-luxe text-charcoal mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                className={`${inputClasses} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-nude-dark hover:text-rose"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-dark">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <label className="flex items-start gap-3 text-sm text-charcoal-soft cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-rose"
            />
            I agree to the Terms &amp; Conditions
          </label>
          {fieldErrors.terms && (
            <p className="-mt-3 text-xs text-rose-dark">{fieldErrors.terms}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? "Creating account..." : "Register"}
          </Button>

          <p className="text-center text-sm text-charcoal-soft">
            Already have an account?{" "}
            <Link to="/login" className="text-rose hover:text-rose-dark">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
