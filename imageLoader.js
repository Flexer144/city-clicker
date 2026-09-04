export default function customImageLoader({ src }) {
  if (src.startsWith('/')) {
    return '.' + src;
  }
  return src;
}