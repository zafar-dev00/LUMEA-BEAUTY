import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import Button from "../../components/ui/Button";
import { adminProductService } from "../../services/adminProductService";
import { adminCategoryService } from "../../services/adminCategoryService";
import { useToast } from "../../context/ToastContext";

const inputClasses =
  "w-full border border-charcoal/20 bg-ivory px-4 py-2.5 text-sm focus:outline-none focus:border-rose";
const labelClasses = "block text-xs uppercase tracking-luxe text-charcoal mb-2";

const EMPTY_FORM = {
  name: "",
  brand: "",
  category: "",
  subcategory: "",
  description: "",
  shortDescription: "",
  price: "",
  originalPrice: "",
  discountPercentage: "",
  stock: "",
  sku: "",
  thumbnail: "",
  images: "",
  shades: "",
  sizes: "",
  ingredients: "",
  benefits: "",
  howToUse: "",
  skinType: "",
  tags: "",
  isFeatured: false,
  isBestSeller: false,
  isNew: false,
};

// Backend stores several fields as arrays of strings; the form edits them as
// comma-separated text for simplicity, converting at the load/submit boundary.
const arrayFields = ["shades", "sizes", "ingredients", "benefits", "skinType", "tags"];

function docToForm(doc) {
  const form = { ...EMPTY_FORM };
  Object.keys(EMPTY_FORM).forEach((key) => {
    if (arrayFields.includes(key)) {
      form[key] = (doc[key] || []).join(", ");
    } else if (key === "images") {
      form.images = (doc.images || []).join("\n");
    } else if (typeof EMPTY_FORM[key] === "boolean") {
      form[key] = Boolean(doc[key]);
    } else {
      form[key] = doc[key] ?? "";
    }
  });
  return form;
}

function formToPayload(form) {
  const payload = { ...form };
  arrayFields.forEach((key) => {
    payload[key] = form[key]
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  });
  payload.images = form.images
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);

  payload.price = Number(form.price);
  payload.stock = Number(form.stock);
  payload.originalPrice = form.originalPrice ? Number(form.originalPrice) : null;
  payload.discountPercentage = form.discountPercentage ? Number(form.discountPercentage) : 0;

  return payload;
}

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Product name is required";
  if (!form.brand.trim()) errors.brand = "Brand is required";
  if (!form.category.trim()) errors.category = "Category is required";
  if (!form.description.trim()) errors.description = "Description is required";
  if (!form.price || Number(form.price) <= 0) errors.price = "Enter a valid price";
  if (form.stock === "" || Number(form.stock) < 0) errors.stock = "Enter a valid stock quantity";
  if (!form.sku.trim()) errors.sku = "SKU is required";
  if (!form.thumbnail.trim()) errors.thumbnail = "A thumbnail image URL is required";
  return errors;
}

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    adminCategoryService.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    setLoading(true);
    adminProductService
      .getProductById(id)
      .then((doc) => {
        if (!cancelled) setForm(docToForm(doc));
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || "Couldn't load this product.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const payload = formToPayload(form);
      if (isEdit) {
        await adminProductService.updateProduct(id, payload);
        showToast("Product updated successfully.");
      } else {
        await adminProductService.createProduct(payload);
        showToast("Product created successfully.");
      }
      navigate("/admin/products");
    } catch (err) {
      setSubmitError(err.message || "Something went wrong saving this product.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <AdminPageHeader title={isEdit ? "Edit Product" : "Add Product"} />
        <div className="h-64 animate-pulse bg-ivory border border-charcoal/10" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div>
        <AdminPageHeader title="Edit Product" />
        <p className="text-rose-dark">{loadError}</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-luxe text-charcoal-soft hover:text-rose mb-4"
      >
        <ChevronLeft size={14} /> Back to Products
      </Link>
      <AdminPageHeader
        title={isEdit ? "Edit Product" : "Add Product"}
        subtitle={isEdit ? "Update this product's details." : "Create a new product listing."}
      />

      {submitError && (
        <div className="mb-6 bg-rose/10 border border-rose text-rose-dark text-sm px-4 py-3">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="max-w-3xl space-y-8">
        {/* Basics */}
        <section className="bg-ivory border border-charcoal/10 p-5 sm:p-6 space-y-5">
          <h2 className="text-sm uppercase tracking-luxe text-charcoal">Basics</h2>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="pf-name" className={labelClasses}>Product Name</label>
              <input id="pf-name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={inputClasses}
              />
              {errors.name && <p className="mt-1 text-xs text-rose-dark">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="pf-brand" className={labelClasses}>Brand</label>
              <input id="pf-brand"
                value={form.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
                className={inputClasses}
              />
              {errors.brand && <p className="mt-1 text-xs text-rose-dark">{errors.brand}</p>}
            </div>
            <div>
              <label htmlFor="pf-category" className={labelClasses}>Category</label>
              <input id="pf-category"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                list="category-options"
                className={inputClasses}
              />
              <datalist id="category-options">
                {categories.map((c) => (
                  <option key={c._id} value={c.name} />
                ))}
              </datalist>
              {errors.category && <p className="mt-1 text-xs text-rose-dark">{errors.category}</p>}
            </div>
            <div>
              <label htmlFor="pf-subcategory" className={labelClasses}>Subcategory</label>
              <input id="pf-subcategory"
                value={form.subcategory}
                onChange={(e) => handleChange("subcategory", e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label htmlFor="pf-description" className={labelClasses}>Description</label>
            <textarea id="pf-description"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              className={inputClasses}
            />
            {errors.description && <p className="mt-1 text-xs text-rose-dark">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="pf-shortDescription" className={labelClasses}>Short Description</label>
            <input id="pf-shortDescription"
              value={form.shortDescription}
              onChange={(e) => handleChange("shortDescription", e.target.value)}
              maxLength={200}
              className={inputClasses}
            />
          </div>
        </section>

        {/* Pricing & stock */}
        <section className="bg-ivory border border-charcoal/10 p-5 sm:p-6 space-y-5">
          <h2 className="text-sm uppercase tracking-luxe text-charcoal">Pricing &amp; Stock</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label htmlFor="pf-price" className={labelClasses}>Price (₹)</label>
              <input id="pf-price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
                className={inputClasses}
              />
              {errors.price && <p className="mt-1 text-xs text-rose-dark">{errors.price}</p>}
            </div>
            <div>
              <label htmlFor="pf-originalPrice" className={labelClasses}>Original Price (₹)</label>
              <input id="pf-originalPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.originalPrice}
                onChange={(e) => handleChange("originalPrice", e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="pf-discountPercentage" className={labelClasses}>Discount %</label>
              <input id="pf-discountPercentage"
                type="number"
                min="0"
                max="100"
                value={form.discountPercentage}
                onChange={(e) => handleChange("discountPercentage", e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="pf-stock" className={labelClasses}>Stock</label>
              <input id="pf-stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
                className={inputClasses}
              />
              {errors.stock && <p className="mt-1 text-xs text-rose-dark">{errors.stock}</p>}
            </div>
            <div>
              <label htmlFor="pf-sku" className={labelClasses}>SKU</label>
              <input id="pf-sku"
                value={form.sku}
                onChange={(e) => handleChange("sku", e.target.value)}
                className={inputClasses}
              />
              {errors.sku && <p className="mt-1 text-xs text-rose-dark">{errors.sku}</p>}
            </div>
          </div>
        </section>

        {/* Images */}
        <section className="bg-ivory border border-charcoal/10 p-5 sm:p-6 space-y-5">
          <h2 className="text-sm uppercase tracking-luxe text-charcoal">Images</h2>
          <div>
            <label htmlFor="pf-thumbnail" className={labelClasses}>Thumbnail URL</label>
            <input id="pf-thumbnail"
              value={form.thumbnail}
              onChange={(e) => handleChange("thumbnail", e.target.value)}
              className={inputClasses}
              placeholder="https://..."
            />
            {errors.thumbnail && <p className="mt-1 text-xs text-rose-dark">{errors.thumbnail}</p>}
          </div>
          <div>
            <label htmlFor="pf-images" className={labelClasses}>Gallery Images (one URL per line)</label>
            <textarea id="pf-images"
              value={form.images}
              onChange={(e) => handleChange("images", e.target.value)}
              rows={3}
              className={inputClasses}
              placeholder="https://...&#10;https://..."
            />
          </div>
        </section>

        {/* Product metadata */}
        <section className="bg-ivory border border-charcoal/10 p-5 sm:p-6 space-y-5">
          <h2 className="text-sm uppercase tracking-luxe text-charcoal">Product Details</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="pf-shades" className={labelClasses}>Shades (comma-separated)</label>
              <input id="pf-shades"
                value={form.shades}
                onChange={(e) => handleChange("shades", e.target.value)}
                className={inputClasses}
                placeholder="Ivory, Beige, Almond"
              />
            </div>
            <div>
              <label htmlFor="pf-sizes" className={labelClasses}>Sizes (comma-separated)</label>
              <input id="pf-sizes"
                value={form.sizes}
                onChange={(e) => handleChange("sizes", e.target.value)}
                className={inputClasses}
                placeholder="30ml, 50ml, 100ml"
              />
            </div>
            <div>
              <label htmlFor="pf-skinType" className={labelClasses}>Skin Type (comma-separated)</label>
              <input id="pf-skinType"
                value={form.skinType}
                onChange={(e) => handleChange("skinType", e.target.value)}
                className={inputClasses}
                placeholder="Dry, Oily, Combination"
              />
            </div>
            <div>
              <label htmlFor="pf-tags" className={labelClasses}>Tags (comma-separated)</label>
              <input id="pf-tags"
                value={form.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
                className={inputClasses}
                placeholder="vegan, cruelty-free"
              />
            </div>
          </div>
          <div>
            <label htmlFor="pf-ingredients" className={labelClasses}>Ingredients (comma-separated)</label>
            <textarea id="pf-ingredients"
              value={form.ingredients}
              onChange={(e) => handleChange("ingredients", e.target.value)}
              rows={2}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="pf-benefits" className={labelClasses}>Benefits (comma-separated)</label>
            <textarea id="pf-benefits"
              value={form.benefits}
              onChange={(e) => handleChange("benefits", e.target.value)}
              rows={2}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="pf-howToUse" className={labelClasses}>How to Use</label>
            <textarea id="pf-howToUse"
              value={form.howToUse}
              onChange={(e) => handleChange("howToUse", e.target.value)}
              rows={3}
              className={inputClasses}
            />
          </div>
        </section>

        {/* Flags */}
        <section className="bg-ivory border border-charcoal/10 p-5 sm:p-6">
          <h2 className="text-sm uppercase tracking-luxe text-charcoal mb-4">Visibility</h2>
          <div className="flex flex-wrap gap-6">
            {[
              ["isFeatured", "Featured"],
              ["isBestSeller", "Bestseller"],
              ["isNew", "New Arrival"],
            ].map(([field, label]) => (
              <label key={field} className="flex items-center gap-2 text-sm text-charcoal-soft cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[field]}
                  onChange={(e) => handleChange(field, e.target.checked)}
                  className="h-4 w-4 accent-rose"
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" size="lg" disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
