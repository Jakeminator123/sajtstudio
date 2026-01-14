/**
 * Global window type extensions
 */

interface Window {
  __didStatus?: 'pending' | 'loaded' | 'error' | 'disabled';
}
