const variants = {
  primary:
    "bg-charcoal text-ivory hover:bg-charcoal-soft border border-charcoal",
  secondary:
    "bg-transparent text-charcoal border border-charcoal hover:bg-charcoal hover:text-ivory",
  rose: "bg-rose text-ivory hover:bg-rose-dark border border-rose",
  outlineLight:
    "bg-transparent text-ivory border border-ivory/70 hover:bg-ivory hover:text-charcoal",
};

const sizes = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-sm",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  as: Tag = "button",
  className = "",
  ...props
}) {
  return (
    <Tag
      className={`inline-flex items-center justify-center gap-2 uppercase tracking-luxe font-medium transition-colors duration-300 cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
