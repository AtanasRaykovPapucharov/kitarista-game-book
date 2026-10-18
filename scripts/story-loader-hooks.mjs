// Lets plain Node resolve the app's "src/…" imports (the alias Vite uses).
const root = new URL('../', import.meta.url)

export async function resolve(specifier, context, next) {
  if (specifier.startsWith('src/')) {
    const path = specifier.endsWith('.js') ? specifier : `${specifier}.js`
    return next(new URL(path, root).href, context)
  }
  return next(specifier, context)
}
