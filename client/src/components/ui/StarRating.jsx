import { Star } from "lucide-react";

export default function StarRating({ rating = 0, size = 14 }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rounded ? "fill-gold text-gold" : "text-nude"}
        />
      ))}
    </div>
  );
}
