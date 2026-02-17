import { useEffect, useState } from 'react';

interface TikTokAttribution {
  ttclid: string | null;
  pageUrl: string;
  pageReferrer: string;
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

    setAttribution({
      ttclid: storedTtclid,
      pageUrl: window.location.href,
      pageReferrer: document.referrer || '',
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

  return {
    ttclid: storedTtclid,
    pageUrl: window.location.href,
    pageReferrer: document.referrer || '',
  };
}
