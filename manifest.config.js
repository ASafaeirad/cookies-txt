import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

export default defineManifest({
  manifest_version: 3,
  name: 'Cookies.txt: Export cookies in txt format for yt-dlp',
  short_name: 'Cookies.txt',
  version: pkg.version,
  description: pkg.description,
  icons: {
    48: 'public/logo.png',
  },
  action: {
    default_title: 'Cookies.txt',
    default_icon: {
      48: 'public/logo.png',
    },
    default_popup: 'src/popup/index.html',
  },
  permissions: ['cookies', 'activeTab'],
  host_permissions: ['<all_urls>'],
});
