import { useState } from "react";

const TABS = ["Description", "Ingredients", "Benefits", "How to Use"];

export default function ProductInfoTabs({ product }) {
  const [tab, setTab] = useState(TABS[0]);

  return (
    <div className="mt-16">
      <div className="flex flex-wrap gap-6 sm:gap-10 border-b border-charcoal/10">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`pb-4 text-xs uppercase tracking-luxe transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-rose text-charcoal"
                : "border-transparent text-charcoal-soft hover:text-charcoal"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="py-8 max-w-2xl">
        {tab === "Description" && (
          <p className="text-sm text-charcoal-soft leading-relaxed">
            {product.description}
          </p>
        )}

        {tab === "Ingredients" && (
          <p className="text-sm text-charcoal-soft leading-relaxed">
            {product.ingredients}
          </p>
        )}

        {tab === "Benefits" && (
          <ul className="space-y-3">
            {product.benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-3 text-sm text-charcoal-soft"
              >
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-rose shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        )}

        {tab === "How to Use" && (
          <ol className="space-y-4">
            {product.howToUse.map((step, i) => (
              <li key={step} className="flex items-start gap-4 text-sm text-charcoal-soft">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-charcoal text-ivory text-xs">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
