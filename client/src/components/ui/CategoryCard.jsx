import { Link } from "react-router-dom";

export default function CategoryCard({ category }) {
  const { name, image, count } = category;

  return (
    <Link to={`/shop?category=${name}`} className="group block text-center">
      <div className="relative overflow-hidden rounded-full aspect-square bg-cream mx-auto max-w-[220px]">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-charcoal/0 transition-colors duration-300 group-hover:bg-charcoal/10" />
      </div>
      <h3 className="mt-4 text-lg text-charcoal font-medium">{name}</h3>
      <p className="text-xs uppercase tracking-luxe text-nude-dark">
        {count}
      </p>
    </Link>
  );
}
