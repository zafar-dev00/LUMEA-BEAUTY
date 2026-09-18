import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import { usePageTitle } from "../hooks/usePageTitle";

const inputClasses =
  "w-full h-12 border border-charcoal/20 bg-ivory px-4 text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-rose transition-colors";

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

      const loggedInUser =
        mode === "otp"
          ? await verifyOtp({ email: form.email.trim(), otp: form.otp })
          : await login({ email: form.email.trim(), password: form.password });
      if (loggedInUser) navigate(redirectTo, { replace: true });
    } catch {
      // Error handled by AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-ivory min-h-[calc(100vh-130px)] flex flex-col">
      <div className="bg-cream py-10 sm:py-12 border-b border-nude/30">
        <div className="container-luxe text-center px-4">
          <p className="text-[11px] uppercase tracking-luxe text-rose mb-2 font-medium">
            Welcome Back
          </p>
          <h1 className="text-3xl sm:text-5xl font-display text-charcoal">Log In</h1>
        </div>
      </div>

      <div className="container-luxe flex-1 py-10 sm:py-16 px-4 flex justify-center items-start">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="w-full max-w-md flex flex-col gap-6"
        >
          {error && (
            <div className="bg-rose/10 border border-rose/30 text-rose-dark text-xs sm:text-sm px-4 py-3 leading-relaxed">
              {error}
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 border-b border-charcoal/15">
            <button
              type="button"
              onClick={() => {
                setMode("otp");
                setOtpRequested(false);
                clearError();
              }}
              className={`pb-3 text-xs uppercase tracking-luxe transition-colors ${
                mode === "otp"
                  ? "border-b-2 border-rose text-rose font-medium"
                  : "text-charcoal-soft hover:text-charcoal"
              }`}
            >
              Email OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("password");
                setOtpRequested(false);
                clearError();
              }}
              className={`pb-3 text-xs uppercase tracking-luxe transition-colors ${
                mode === "password"
                  ? "border-b-2 border-rose text-rose font-medium"
                  : "text-charcoal-soft hover:text-charcoal"
              }`}
            >
              Password
            </button>
          </div>

          {/* Email Input Field */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-xs uppercase tracking-luxe text-charcoal font-medium"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              className={inputClasses}
            />
            {fieldErrors.email && (
              <p className="text-xs text-rose-dark mt-0.5">{fieldErrors.email}</p>
            )}
          </div>

          {/* OTP Code Field */}
          {mode === "otp" && otpRequested && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="otp"
                className="text-xs uppercase tracking-luxe text-charcoal font-medium"
              >
                Email Code
              </label>
              <input
                id="otp"
                name="otp"
                value={form.otp}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit code"
                autoComplete="one-time-code"
                className={`${inputClasses} tracking-widest text-center text-base`}
              />
              {fieldErrors.otp && (
                <p className="text-xs text-rose-dark mt-0.5">{fieldErrors.otp}</p>
              )}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    clearError();
                    try {
                      await requestOtp(form.email.trim());
                    } catch {
                      /* surfaced via context */
                    }
                  }}
                  className="text-xs text-rose hover:text-rose-dark transition-colors underline underline-offset-4"
                >
                  Resend code
                </button>
              </div>
            </div>
          )}

          {/* Password Field */}
          {mode === "password" && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs uppercase tracking-luxe text-charcoal font-medium"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-nude-dark hover:text-rose p-1 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-rose-dark mt-0.5">{fieldErrors.password}</p>
              )}
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-12 uppercase tracking-luxe text-xs"
              disabled={submitting}
            >
              {submitting
                ? "Please wait..."
                : mode === "otp" && !otpRequested
                ? "Send login code"
                : "Log In"}
            </Button>
          </div>

          <p className="text-center text-xs sm:text-sm text-charcoal-soft pt-1">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-rose hover:text-rose-dark font-medium underline underline-offset-4"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}