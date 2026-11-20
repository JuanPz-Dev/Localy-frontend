export function cloudinaryUrl(url: string, width = 800): string {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  // Evita aplicar la transformación dos veces
  if (/\/upload\/[^/]*(w_|f_auto|q_auto)/.test(url)) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`);
}
