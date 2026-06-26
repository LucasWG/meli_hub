(function () {
	'use strict';

	if (window.MeliToolsToolbarInit) return;
	window.MeliToolsToolbarInit = true;

	const Utils = {
		showToast: (msg, type = 'info') => {
			let container = document.getElementById('mt-toast-container');
			if (!container) {
				container = document.createElement('div');
				container.id = 'mt-toast-container';
				Object.assign(container.style, { position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: '9999999', display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'none' });
				document.body.appendChild(container);
			}
			const toast = document.createElement('div');
			Object.assign(toast.style, { background: '#111827', color: '#fff', padding: '12px 20px', borderRadius: '8px', fontFamily: 'sans-serif', fontSize: '14px', transition: 'all 0.3s', opacity: '0', transform: 'translateY(10px)', borderLeft: `4px solid ${type === 'success' ? '#10b981' : '#3b82f6'}` });
			toast.textContent = msg;
			container.appendChild(toast);
			requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; });
			setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
		},
		copy: async (text, label) => {
			try { await navigator.clipboard.writeText(text); Utils.showToast(`${label} copiado: ${text}`, 'success'); }
			catch (e) {
				const tx = document.createElement('textarea'); tx.value = text; tx.style.cssText = 'position:fixed;opacity:0;'; document.body.appendChild(tx); tx.select(); document.execCommand('copy'); tx.remove();
				Utils.showToast(`${label} copiado: ${text}`, 'success');
			}
		},
		extractIds: text => { const m = text.match(/\b\d{11}\b/g); return m ? [...new Set(m)] : []; }
	};

	const CSS = `
        .mt-copy-btn { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; margin-left: 6px; border: none; background: transparent; color: #9ca3af; cursor: pointer; opacity: 0; transition: 0.2s; vertical-align: middle; }
        *:hover > .mt-copy-btn { opacity: 0.5; }
        .mt-copy-btn:hover { opacity: 1 !important; color: #2563eb; background: #eff6ff; border-radius: 4px; }
        .mt-toolbar-box { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-top: 1px solid #e5e7eb; padding: 12px 24px; z-index: 99998; display: flex; justify-content: space-between; font-family: sans-serif; box-shadow: 0 -4px 6px rgba(0,0,0,0.05); }
        .mt-tb-btn { background: transparent; border: none; color: #6b7280; font-size: 13px; font-weight: 500; cursor: pointer; padding: 6px 12px; border-radius: 6px; transition: 0.2s; display: flex; align-items: center; gap: 6px; }
        .mt-tb-btn:hover { background: #f3f4f6; color: #111827; }
        .mt-tb-btn--primary { color: #2563eb; background: #eff6ff; }
        .mt-stealth-active .mt-toolbar-box, .mt-stealth-active .mt-copy-btn { display: none !important; }
    `;

	function injectCSS() {
		if (!document.getElementById('mt-toolbar-css')) {
			const style = document.createElement('style'); style.id = 'mt-toolbar-css'; style.textContent = CSS; document.head.appendChild(style);
		}
	}

	function addCopyButtons() {
		const els = document.querySelectorAll('h1, h2, span, p, td, .package-detail__header, [class*="package"] [class*="title"]');
		els.forEach(el => {
			if (el.closest('.mt-toolbar-box, #mt-toast-container, .mt-copy-btn')) return;
			const text = el.textContent.trim();
			const ids = Utils.extractIds(text);
			if (ids.length > 0 && ids[0] === text && !el.querySelector('.mt-copy-btn') && !el.parentElement.querySelector('.mt-copy-btn')) {
				const btn = document.createElement('button');
				btn.className = 'mt-copy-btn';
				btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
				btn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); Utils.copy(ids[0], 'ID'); };
				el.style.position = el.style.position || 'relative';
				el.appendChild(btn);
			}
		});
	}

	function renderToolbar(id) {
		if (document.getElementById('mt-id-toolbar')) return;
		const tb = document.createElement('div');
		tb.id = 'mt-id-toolbar';
		tb.className = 'mt-toolbar-box';
		tb.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                <span style="color:#6b7280; font-size:13px; font-weight:500;">📦 Pacote</span>
                <span style="font-weight:600; font-family:monospace; font-size:14px; background:#f3f4f6; padding:4px 8px; border-radius:4px;">${id}</span>
                <button class="mt-tb-btn mt-tb-btn--primary" id="tb-copy">Copiar ID</button>
            </div>
            <div style="display:flex; gap:12px;">
                <button class="mt-tb-btn" id="tb-bo">🔗 Backoffice</button>
                <button class="mt-tb-btn" id="tb-audit">📋 Audit-Trail</button>
            </div>
        `;
		document.body.appendChild(tb);
		tb.querySelector('#tb-copy').onclick = () => Utils.copy(id, 'ID');
		tb.querySelector('#tb-bo').onclick = () => window.open(`https://shipping-bo.adminml.com/sauron/shipments/shipment/${id}`, '_blank');
		tb.querySelector('#tb-audit').onclick = () => window.open(`https://envios.adminml.com/logistics/audit-trail/search?shipment_id=${id}`, '_blank');
	}

	function checkRoute() {
		const match = window.location.href.match(/(\d{11})/);
		if (match) {
			renderToolbar(match[1]);
			setTimeout(addCopyButtons, 1000);
		} else {
			const tb = document.getElementById('mt-id-toolbar');
			if (tb) tb.remove();
		}
	}

	injectCSS();
	checkRoute();
	window.addEventListener('meli-hub:route-change', () => setTimeout(checkRoute, 800));

	// Observer para botões de cópia dinâmicos
	let debounce;
	new MutationObserver(() => {
		clearTimeout(debounce);
		debounce = setTimeout(addCopyButtons, 1500);
	}).observe(document.body, { childList: true, subtree: true });

})();
