import pkg from '../../package.json';
import defaultMappings from '../next/lib/mappings';
import KeyPad from './components/KeyPad.svelte';

document.title = [pkg.description, pkg.version].join(' v');

new KeyPad({
  target: document.getElementById('application'),
  props: {
    mappings: defaultMappings,
  },
});
