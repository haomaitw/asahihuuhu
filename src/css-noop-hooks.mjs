// ESM loader hooks — return an empty module for any .css/.scss import.
// Registered at Node.js startup to handle CSS files that external packages
// (e.g. react-image-crop, @payloadcms/ui) try to import at runtime.
export function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('.css') || specifier.endsWith('.scss')) {
    return { shortCircuit: true, url: 'data:text/javascript,export default {}' }
  }
  return nextResolve(specifier, context)
}

export function load(url, context, nextLoad) {
  if (url.startsWith('data:text/javascript,export default {}')) {
    return { shortCircuit: true, format: 'module', source: 'export default {}' }
  }
  return nextLoad(url, context)
}
