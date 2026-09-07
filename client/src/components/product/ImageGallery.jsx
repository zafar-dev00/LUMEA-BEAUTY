import { useState } from "react";

export default function ImageGallery({ images, name, badge }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative overflow-hidden bg-cream aspect-square">
        <img
          src={images[active]}
          alt={`${name} — view ${active + 1}`}
          className="h-full w-full object-cover"
        />
        {badge && (
          <span className="absolute left-4 top-4 bg-charcoal text-ivory text-[10px] uppercase tracking-luxe px-3 py-1">
            {badge}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={`aspect-square overflow-hidden bg-cream border transition-colors ${
                i === active
                  ? "border-charcoal"
                  : "border-transparent hover:border-nude-dark"
              }`}
            >
              <img
                src={img}
                alt={`${name} thumbnail ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
