export async function shareProduct(product) {
  const url = `${window.location.origin}/product/${product.id}`;
  if (navigator.share) {
    try {
      await navigator.share({
        title: product.name,
        text: `Check out ${product.name} on ShopEase!`,
        url,
      });
      return { success: true, message: "Shared successfully!" };
    } catch (err) {
      if (err.name === "AbortError") return null;
    }
  }

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      return { success: true, message: "Product link copied to clipboard!" };
    }
    // Fallback for older browsers
    const input = document.createElement("input");
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    return { success: true, message: "Product link copied to clipboard!" };
  } catch {
    return { success: false, message: "Could not copy link to clipboard" };
  }
}
