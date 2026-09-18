import Button from "../ui/Button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div className="container-luxe grid grid-cols-1 lg:grid-cols-2 items-center gap-10 py-16 lg:py-24">
        <div className="order-2 lg:order-1 text-center lg:text-left">
          <p className="text-xs uppercase tracking-luxe text-rose mb-4">
            New Season Collection
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-tight text-charcoal">
            Radiance, <span className="italic text-rose">Redefined.</span>
          </h1>
          <p className="mt-6 text-charcoal-soft max-w-md mx-auto lg:mx-0 leading-relaxed">
            Discover clean, luxurious beauty essentials formulated with
            premium ingredients — designed to enhance your natural glow.
          </p>
          <div className="mt-8 flex items-center justify-center lg:justify-start gap-4">
            <Button as="a" href="#featured" variant="primary" size="lg">
              Shop Now
            </Button>
            <Button as="a" href="#categories" variant="secondary" size="lg">
              Explore
            </Button>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="aspect-[4/5] w-full max-w-md mx-auto overflow-hidden rounded-[2rem] bg-blush">
            <img
              src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1000&auto=format&fit=crop"
              alt="LUMÉA Beauty hero product flatlay"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
