import { useEffect } from "react";

const SITE_NAME = "LUMÉA BEAUTY";
const DEFAULT_DESCRIPTION =
  "LUMÉA BEAUTY — premium clean cosmetics & skincare.";

/**
 * Sets the document title (and optionally the meta description) for the
 * current page, restoring the previous values on unmount. Deliberately not
 * using a library like react-helmet — a single-page title update doesn't
 * need one, and the project avoids adding dependencies where a few lines
 * of plain React will do.
 */
export function usePageTitle(title, description) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Premium Clean Cosmetics`;

    const metaDescription = document.querySelector('meta[name="description"]');
    const previousDescription = metaDescription?.getAttribute("content");
    if (metaDescription) {
      metaDescription.setAttribute("content", description || DEFAULT_DESCRIPTION);
    }

    return () => {
      document.title = previousTitle;
      if (metaDescription && previousDescription) {
        metaDescription.setAttribute("content", previousDescription);
      }
    };
  }, [title, description]);
}
