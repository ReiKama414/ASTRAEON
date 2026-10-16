/** Resolve public/ asset paths against Vite `base` (e.g. `/ASTRAEON/` on GitHub Pages). */
export const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
