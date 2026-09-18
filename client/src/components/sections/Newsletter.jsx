import Button from "../ui/Button";

export default function Newsletter() {
  return (
    <section className="bg-nude/30 py-16 lg:py-20">
      <div className="container-luxe text-center max-w-xl mx-auto">
        <p className="text-xs uppercase tracking-luxe text-rose mb-3">
          Stay In The Glow
        </p>
        <h2 className="text-3xl sm:text-4xl text-charcoal">
          Join the LUMÉA Circle
        </h2>
        <p className="mt-3 text-charcoal-soft">
          Sign up for early access to new launches, exclusive offers, and
          beauty rituals.
        </p>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="w-full sm:w-80 bg-ivory border border-charcoal/20 px-5 py-3 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:outline-none focus:border-rose"
          />
          <Button type="submit" variant="primary" size="md">
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  );
}
