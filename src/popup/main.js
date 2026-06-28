// @ts-check

const domainEl = /** @type {HTMLElement} */ (document.getElementById('domain'));
const countRow = /** @type {HTMLElement} */ (document.getElementById('count-row'));
const countEl = /** @type {HTMLElement} */ (document.getElementById('cookie-count'));
const btnCopy = /** @type {HTMLButtonElement} */ (document.getElementById('btn-copy'));
const btnDownload = /** @type {HTMLButtonElement} */ (document.getElementById('btn-download'));
const toast = /** @type {HTMLElement} */ (document.getElementById('toast'));
const emptyEl = /** @type {HTMLElement} */ (document.getElementById('empty'));

/**
 * @param {chrome.cookies.Cookie} cookie
 * @returns {string}
 */
function cookieToNetscapeLine(cookie) {
  const domain = cookie.domain.startsWith('.') ? cookie.domain : `.${cookie.domain}`;
  const includeSubdomains = cookie.domain.startsWith('.') ? 'TRUE' : 'FALSE';
  const secure = cookie.secure ? 'TRUE' : 'FALSE';
  const expiry = cookie.expirationDate ? Math.floor(cookie.expirationDate) : 0;
  return [domain, includeSubdomains, cookie.path, secure, expiry, cookie.name, cookie.value].join(
    '\t',
  );
}

/**
 * @param {chrome.cookies.Cookie[]} cookies
 * @returns {string}
 */
function toCookiesTxt(cookies) {
  const lines = [
    '# Netscape HTTP Cookie File',
    '# https://curl.se/docs/http-cookies.html',
    '',
    ...cookies.map(cookieToNetscapeLine),
  ];
  return lines.join('\n');
}

/** @param {string} text */
function showToast(text) {
  toast.textContent = text;
  setTimeout(() => {
    toast.textContent = '';
  }, 2000);
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;

  let hostname = '';
  try {
    hostname = new URL(tab.url).hostname;
  } catch {
    return;
  }

  domainEl.textContent = hostname;
  console.log(hostname);

  const cookies = await chrome.cookies.getAll({ url: tab.url });
  console.log(cookies);

  if (cookies.length === 0) {
    emptyEl.hidden = false;
    return;
  }

  countEl.textContent = String(cookies.length);
  countRow.hidden = false;
  btnCopy.disabled = false;
  btnDownload.disabled = false;

  const content = toCookiesTxt(cookies);

  btnCopy.addEventListener('click', async () => {
    await navigator.clipboard.writeText(content);
    showToast('Copied to clipboard!');
  });

  btnDownload.addEventListener('click', () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cookies.txt';
    a.click();
    URL.revokeObjectURL(url);
  });
}

init();
