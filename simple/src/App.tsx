import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTransaction } from "@/contexts/TransactionContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { WarningPanel } from "@/features/transaction-payload-builder/components/WarningPanel";
import { PayloadPreview } from "@/features/transaction-payload-builder/components/PayloadPreview";

const NAV_ITEMS = [
  { to: "/source", label: "📥 تراکنش مبدأ" },
  { to: "/mapping", label: "🗺️ نگاشت" },
  { to: "/", label: "📤 خروجی", exact: true },
];

export default function AppLayout() {
  const location = useLocation();
  const {
    result,
    isSubmitting,
    submitStatus,
    handleTransform,
    handleSubmit,
  } = useTransaction();

  const isHome = location.pathname === "/";

  return (
    <div
      className="min-h-screen p-4 font-sans md:p-8"
      style={{ background: "var(--color-surface-raw)" }}
    >
      <div className="mx-auto max-w-6xl space-y-8">
        {/* ── Header + Theme Toggle ── */}
        <header
          className="flex items-center justify-between border-b pb-6"
          style={{ borderColor: "var(--color-border-subtle-raw)" }}
        >
          <div>
            <h1 className="text-3xl font-black" style={{ color: "var(--color-text-primary-raw)" }}>
              مبدل Payload تراکنش
            </h1>
            <p className="mt-2" style={{ color: "var(--color-text-secondary-raw)" }}>
              تراکنش‌های خام را به کدهای API نگاشت کنید.
            </p>
          </div>
          <ThemeToggle />
        </header>

        {/* ── Navigation Tabs ── */}
        <nav className="flex gap-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                [
                  "rounded-full px-5 py-2 text-sm font-bold transition-all",
                  isActive
                    ? "text-white shadow-md"
                    : "",
                ].join(" ")
              }
              style={({ isActive }) =>
                isActive
                  ? { background: "var(--color-accent-raw)", color: "#fff" }
                  : {
                      background: "var(--color-surface-card-raw)",
                      color: "var(--color-text-secondary-raw)",
                      border: "1px solid var(--color-border-subtle-raw)",
                    }
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* ── Page Content (Source / Mapping) ── */}
        <Outlet />

        {/* ── Transform Button (visible on home page) ── */}
        {isHome && (
          <div className="flex justify-center">
            <button
              onClick={handleTransform}
              className="rounded-full px-12 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
              style={{
                background: "var(--color-accent-raw)",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              پردازش و تبدیل
            </button>
          </div>
        )}

        {/* ── Results (visible on home page) ── */}
        {isHome && result && (
          <div className="space-y-8" style={{ animation: "fadeSlideIn 0.5s ease" }}>
            <WarningPanel warnings={result.warnings} />
            <PayloadPreview payload={result.payload} />

            {/* ── Submit Section ── */}
            <div
              className="flex flex-col items-center gap-4 rounded-2xl border p-6"
              style={{
                background: "var(--color-surface-card-raw)",
                borderColor: "var(--color-border-card-raw)",
              }}
            >
              <h4 className="font-bold" style={{ color: "var(--color-text-primary-raw)" }}>
                ارسال به API مقصد
              </h4>
              <button
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-10 py-3 font-bold text-white transition-colors disabled:opacity-50 md:w-auto"
                style={{
                  background: isSubmitting
                    ? "var(--color-text-muted-raw)"
                    : "var(--color-success-raw)",
                }}
              >
                {isSubmitting ? "در حال ارسال..." : "تایید و ارسال نهایی"}
              </button>

              {submitStatus && (
                <div
                  className="text-sm font-medium"
                  style={{
                    color:
                      submitStatus.type === "success"
                        ? "var(--color-success-raw)"
                        : "var(--color-error-raw)",
                  }}
                >
                  {submitStatus.msg}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Empty state on home page ── */}
        {isHome && !result && (
          <div
            className="flex flex-col items-center gap-4 rounded-2xl border p-12 text-center"
            style={{
              background: "var(--color-surface-card-raw)",
              borderColor: "var(--color-border-card-raw)",
            }}
          >
            <div className="text-5xl">🚀</div>
            <h3 className="text-xl font-bold" style={{ color: "var(--color-text-primary-raw)" }}>
              آمادهٔ تبدیل
            </h3>
            <p style={{ color: "var(--color-text-secondary-raw)" }}>
              ابتدا تراکنش مبدأ و نگاشت فیلدها را در تب‌های بالا وارد کنید،
              سپس روی دکمه «پردازش و تبدیل» کلیک کنید.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
