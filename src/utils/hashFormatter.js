export default function hashFormatter(chain) {
  if (typeof chain !== 'string') {
    return '';
  }
  return chain.slice(0, 3) + '...' + chain.slice(chain.length - 5, chain.length);
}
