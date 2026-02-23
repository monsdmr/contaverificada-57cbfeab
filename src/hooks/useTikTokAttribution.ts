import { useEffect, useState } from 'react';

interface TikTokAttribution {
  ttclid: string | null;
  pageUrl: string;
  pageReferrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1')}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days = 30) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function useTikTokAttribution(): TikTokAttribution {
  const [attribution, setAttribution] = useState<TikTokAttribution>({
    ttclid: null,
    pageUrl: '',
    pageReferrer: '',
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmTerm: '',
    utmContent: '',
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ttclidFromUrl = urlParams.get('ttclid');

    if (ttclidFromUrl) {
      sessionStorage.setItem('ttclid', ttclidFromUrl);
      localStorage.setItem('ttclid', ttclidFromUrl);
      setCookie('ttclid', ttclidFromUrl);
    }

    const storedTtclid =
      sessionStorage.getItem('ttclid') ||
      localStorage.getItem('ttclid') ||
      getCookie('ttclid');

    // Persist UTMs in sessionStorage, localStorage AND cookies so they survive the entire funnel
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
    utmKeys.forEach(k => {
      const v = urlParams.get(k);
      if (v) {
        sessionStorage.setItem(k, v);
        localStorage.setItem(k, v);
        setCookie(k, v);
      }
    });

    const getUtm = (k: string) =>
      sessionStorage.getItem(k) || localStorage.getItem(k) || getCookie(k) || '';

    setAttribution({
      ttclid: storedTtclid,
      pageUrl: window.location.href,
      pageReferrer: document.referrer || '',
      utmSource: getUtm('utm_source'),
      utmMedium: getUtm('utm_medium'),
      utmCampaign: getUtm('utm_campaign'),
      utmTerm: getUtm('utm_term'),
      utmContent: getUtm('utm_content'),
    });
  }, []);

  return attribution;
}

export function getTikTokAttribution(): TikTokAttribution {
  const urlParams = new URLSearchParams(window.location.search);
  const ttclidFromUrl = urlParams.get('ttclid');

  if (ttclidFromUrl) {
    sessionStorage.setItem('ttclid', ttclidFromUrl);
    localStorage.setItem('ttclid', ttclidFromUrl);
    setCookie('ttclid', ttclidFromUrl);
  }

  const storedTtclid =
    sessionStorage.getItem('ttclid') ||
    localStorage.getItem('ttclid') ||
    getCookie('ttclid');

  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
  utmKeys.forEach(k => {
    const v = urlParams.get(k);
    if (v) {
      sessionStorage.setItem(k, v);
      localStorage.setItem(k, v);
      setCookie(k, v);
    }
  });

  const getUtm = (k: string) =>
    sessionStorage.getItem(k) || localStorage.getItem(k) || getCookie(k) || '';

  return {
    ttclid: storedTtclid,
    pageUrl: window.location.href,
    pageReferrer: document.referrer || '',
    utmSource: getUtm('utm_source'),
    utmMedium: getUtm('utm_medium'),
    utmCampaign: getUtm('utm_campaign'),
    utmTerm: getUtm('utm_term'),
    utmContent: getUtm('utm_content'),
  };
}
