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

    // Map TikTok Ads params → standard UTMs when utm_* aren't explicitly set
    const tiktokToUtm: Record<string, string> = {
      // source: placement or site tell us WHERE the ad ran
      utm_source: urlParams.get('utm_source') || urlParams.get('placement') || urlParams.get('site') || (ttclidFromUrl ? 'tiktok' : ''),
      // medium: type tells us the ad type (e.g. "feed", "in-feed")
      utm_medium: urlParams.get('utm_medium') || urlParams.get('type') || (ttclidFromUrl ? 'paid' : ''),
      // campaign: cname is the campaign name from TikTok
      utm_campaign: urlParams.get('utm_campaign') || urlParams.get('cname') || '',
      // term: adset or adid for ad-group level tracking
      utm_term: urlParams.get('utm_term') || urlParams.get('adset') || urlParams.get('adid') || urlParams.get('cck') || '',
      // content: adname is the creative/ad name
      utm_content: urlParams.get('utm_content') || urlParams.get('adname') || urlParams.get('search') || '',
    };

    // Also capture extra TikTok params that don't map to UTMs
    const extraKeys = ['adid', 'adname', 'adset', 'cname', 'domain', 'placement', 'search', 'site', 'type', 'cck', 'tiktok_clid', 'xgo'] as const;
    extraKeys.forEach(k => {
      const v = urlParams.get(k);
      if (v && v !== `__${k.toUpperCase()}__` && !v.startsWith('__')) {
        sessionStorage.setItem(`tt_${k}`, v);
        localStorage.setItem(`tt_${k}`, v);
        setCookie(`tt_${k}`, v);
      }
    });

    // Persist resolved UTMs in sessionStorage, localStorage AND cookies
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
    utmKeys.forEach(k => {
      const resolved = tiktokToUtm[k];
      // Only persist non-empty values that aren't TikTok placeholders like __CAMPAIGN_NAME__
      if (resolved && !resolved.startsWith('__')) {
        sessionStorage.setItem(k, resolved);
        localStorage.setItem(k, resolved);
        setCookie(k, resolved);
      }
    });

    const getUtm = (k: string) => {
      const val = sessionStorage.getItem(k) || localStorage.getItem(k) || getCookie(k) || '';
      // Filter out TikTok placeholder macros that weren't replaced
      return val.startsWith('__') ? '' : val;
    };

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

  // Map TikTok Ads params → standard UTMs
  const tiktokToUtm: Record<string, string> = {
    utm_source: urlParams.get('utm_source') || urlParams.get('placement') || urlParams.get('site') || (ttclidFromUrl ? 'tiktok' : ''),
    utm_medium: urlParams.get('utm_medium') || urlParams.get('type') || (ttclidFromUrl ? 'paid' : ''),
    utm_campaign: urlParams.get('utm_campaign') || urlParams.get('cname') || '',
    utm_term: urlParams.get('utm_term') || urlParams.get('adset') || urlParams.get('adid') || urlParams.get('cck') || '',
    utm_content: urlParams.get('utm_content') || urlParams.get('adname') || urlParams.get('search') || '',
  };

  const extraKeys = ['adid', 'adname', 'adset', 'cname', 'domain', 'placement', 'search', 'site', 'type', 'cck', 'tiktok_clid', 'xgo'] as const;
  extraKeys.forEach(k => {
    const v = urlParams.get(k);
    if (v && v !== `__${k.toUpperCase()}__` && !v.startsWith('__')) {
      sessionStorage.setItem(`tt_${k}`, v);
      localStorage.setItem(`tt_${k}`, v);
      setCookie(`tt_${k}`, v);
    }
  });

  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
  utmKeys.forEach(k => {
    const resolved = tiktokToUtm[k];
    if (resolved && !resolved.startsWith('__')) {
      sessionStorage.setItem(k, resolved);
      localStorage.setItem(k, resolved);
      setCookie(k, resolved);
    }
  });

  const getUtm = (k: string) => {
    const val = sessionStorage.getItem(k) || localStorage.getItem(k) || getCookie(k) || '';
    return val.startsWith('__') ? '' : val;
  };

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
