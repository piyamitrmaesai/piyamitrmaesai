(() => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/admin/sw.js', {scope:'/admin/'}).catch(console.error));
  }

  let deferredPrompt = null;
  const createButton = (label, handler) => {
    if (document.getElementById('pcrc-install-app')) return;
    const btn = document.createElement('button');
    btn.id = 'pcrc-install-app';
    btn.type = 'button';
    btn.textContent = label;
    btn.setAttribute('aria-label', label);
    Object.assign(btn.style, {
      position:'fixed', right:'14px', bottom:'14px', zIndex:'2147483647',
      border:'0', borderRadius:'999px', padding:'11px 16px', cursor:'pointer',
      background:'#FFC107', color:'#03275B', fontWeight:'800', fontFamily:'system-ui,sans-serif',
      boxShadow:'0 6px 22px rgba(0,0,0,.24)'
    });
    btn.addEventListener('click', handler);
    document.body.appendChild(btn);
  };

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    if (!isStandalone) createButton('ติดตั้ง P.C.R.C. Admin', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      document.getElementById('pcrc-install-app')?.remove();
    });
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    document.getElementById('pcrc-install-app')?.remove();
  });

  // iPhone/iPad do not expose beforeinstallprompt. Give a compact helper link instead.
  const ua = navigator.userAgent || '';
  const isiOS = /iphone|ipad|ipod/i.test(ua);
  if (isiOS && !isStandalone) {
    window.addEventListener('load', () => setTimeout(() => createButton('วิธีติดตั้งบน iPhone', () => {
      window.location.href = '/admin/install.html';
    }), 1800));
  }
})();
