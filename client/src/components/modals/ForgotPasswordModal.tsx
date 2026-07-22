import { createPortal } from "react-dom";
import { useState } from "react";
import { X, Mail, KeyRound, Loader2, CheckCircle2, ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../context/AuthContext";

type Step = "email" | "otp" | "reset";

interface ForgotPasswordModalProps {
  showModal: boolean;
  onClose: () => void;
  /**
   * Optional callback fired after the reset-password step successfully
   * updates the password. The page can use this to redirect to login.
   */
  onReset?: (email: string) => void;
}

const OTP_LENGTH = 6;
const MIN_PASSWORD_LENGTH = 6;

export default function ForgotPasswordModal({ showModal, onClose, onReset }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");

  // Password state
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const { sendOtpCode, verfiyOtpCode, resetPassword } = useAuth();

  // Reset internal state every time the modal closes
  const handleClose = () => {
    setStep("email");
    setEmail("");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError("");
    setLoading(false);
    onClose();
  };

  // Step 1: request OTP 
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);

    try {
      const data = await sendOtpCode(email);
      toast.success(data.message || "OTP sent to your email");
      setStep("otp");
    } catch (err: any) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP 
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.trim().length !== OTP_LENGTH) {
      setError(`Please enter the ${OTP_LENGTH}-digit code sent to your email.`);
      return;
    }
    if (!/^\d+$/.test(otp.trim())) {
      setError("OTP must contain digits only.");
      return;
    }
    setLoading(true);
    try {
      const data = await verfiyOtpCode(Number(otp), email);
      if (data?.success) {
        toast.success(data?.message || "OTP verified successfully");
        // Move to password reset step instead of closing the modal
        setStep("reset");
        setOtp("");
      } else {
        setError(data?.message || "Unable to verify OTP.");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid or expired OTP.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: enter new password 
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation — confirm password is for local comparison only
    if (!password) {
      setError("Please enter a new password.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const data = await resetPassword(password, email);
      toast.success(data?.message || "Password updated successfully");
      onReset?.(email.trim().toLowerCase());
      handleClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update password. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Convenience: keep the OTP input numeric and capped at OTP_LENGTH
  const handleOtpChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setOtp(cleaned);
  };

  if (!showModal) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-950 w-full max-w-md rounded-md shadow-lg overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {step !== "email" && (
              <button
                type="button"
                onClick={() => {
                  if (step === "reset") {
                    setStep("otp");
                  } else {
                    setStep("email");
                  }
                  setOtp("");
                  setError("");
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {step === "email" && "Forgot password"}
              {step === "otp" && "Enter verification code"}
              {step === "reset" && "Set a new password"}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => handleClose()}
            className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            {step === "email" &&
              "Enter the email address associated with your account and we'll send you a one-time verification code."}
            {step === "otp" && (
              <>
                We sent a {OTP_LENGTH}-digit code to{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">{email}</span>.
                Enter it below to continue.
              </>
            )}
            {step === "reset" && (
              <>
                Choose a new password for{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">{email}</span>.
                Make sure it's at least {MIN_PASSWORD_LENGTH} characters.
              </>
            )}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-md border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: email  */}
          {step === "email" && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    size={20}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@institution.ac.ke"
                    autoComplete="email"
                    autoFocus
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleClose()}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-800 rounded-md text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-500 disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send code"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Verification code
                </label>
                <div className="relative">
                  <KeyRound
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    size={20}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={otp}
                    onChange={(e) => handleOtpChange(e.target.value)}
                    placeholder="000000"
                    maxLength={OTP_LENGTH}
                    autoFocus
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono tracking-[0.4em] text-center text-lg"
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                  The code expires in 30 minutes. Check your spam folder if you don't see it.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setError("");
                  }}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-800 rounded-md text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Change email
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== OTP_LENGTH}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-500 disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Verify
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setError("");
                  setLoading(true);
                  try {
                    const data = await sendOtpCode(email);
                    toast.success(data?.message || "A new code has been sent");
                    setOtp("");
                  } catch {
                    setError("Failed to resend code.");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium transition-colors disabled:opacity-50"
              >
                Didn't get a code? Resend
              </button>
            </form>
          )}

          {/*  Step 3: set new password  */}
          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  New password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    autoFocus
                    required
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm password — local comparison only, never sent */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Confirm new password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    size={20}
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                    required
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && password === confirmPassword && !error && (
                  <p className="text-emerald-500 text-xs mt-2 ml-1">Passwords match</p>
                )}
                <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-1 ml-1">
                  Used for confirmation only — not sent to the server.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={() => {
                    setStep("otp");
                    setPassword("");
                    setConfirmPassword("");
                    setError("");
                  }}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-800 rounded-md text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-500 disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Reset password"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
