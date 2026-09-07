import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import { usePageTitle } from "../hooks/usePageTitle";

const inputClasses =
  "w-full border border-charcoal/20 bg-ivory px-4 py-3 text-sm focus:outline-none focus:border-rose";

export default function Login() {
  usePageTitle("Log In");
  const { login, requestOtp, verifyOtp, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [form, setForm] = useState({ email: "", password: "", otp: "" });
  const [mode, setMode] = useState("otp");
  const [otpRequested, setOtpRequested] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required";
    if (mode === "password" && !form.password) errs.password = "Password is required";
    if (mode === "otp" && otpRequested && !/^\d{6}$/.test(form.otp)) {
      errs.otp = "Enter the 6-digit code from your email";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (mode === "otp" && !otpRequested) {
        await requestOtp(form.email.trim());
        setOtpRequested(true);
        return;
      }

      const loggedInUser = mode === "otp"
        ? await verifyOtp({ email: form.email.trim(), otp: form.otp })
        : await login({ email: form.email.trim(), password: form.password });
      if (loggedInUser) navigate(redirectTo, { replace: true });
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
            Welcome Back
          </p>
          <h1 className="text-4xl sm:text-5xl text-charcoal">Log In</h1>
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

          <div className="flex border-b border-charcoal/15">
            <button
              type="button"
              onClick={() => { setMode("otp"); setOtpRequested(false); clearError(); }}
              className={`flex-1 pb-3 text-xs uppercase tracking-luxe ${mode === "otp" ? "border-b-2 border-rose text-rose" : "text-charcoal-soft"}`}
            >
              Email OTP
            </button>
            <button
              type="button"
              onClick={() => { setMode("password"); setOtpRequested(false); clearError(); }}
              className={`flex-1 pb-3 text-xs uppercase tracking-luxe ${mode === "password" ? "border-b-2 border-rose text-rose" : "text-charcoal-soft"}`}
            >
              Password
            </button>
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

          {mode === "otp" && otpRequested && (
            <div>
              <label htmlFor="otp" className="block text-xs uppercase tracking-luxe text-charcoal mb-2">
                Email code
              </label>
              <input
                id="otp"
                name="otp"
                value={form.otp}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                className={inputClasses}
              />
              {fieldErrors.otp && <p className="mt-1 text-xs text-rose-dark">{fieldErrors.otp}</p>}
              <button
                type="button"
                onClick={async () => {
                  clearError();
                  try { await requestOtp(form.email.trim()); } catch { /* surfaced via context */ }
                }}
                className="mt-2 text-xs text-rose hover:text-rose-dark"
              >
                Resend code
              </button>
            </div>
          )}

          {mode === "password" && <div>
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
                autoComplete="current-password"
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
          </div>}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? "Please wait..." : mode === "otp" && !otpRequested ? "Send login code" : "Log In"}
          </Button>

          <p className="text-center text-sm text-charcoal-soft">
            Don't have an account?{" "}
            <Link to="/register" className="text-rose hover:text-rose-dark">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
