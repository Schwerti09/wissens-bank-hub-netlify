(function(){
  const $ = (q, el=document) => el.querySelector(q);

  // Cookie consent
  const banner = $('#cookie');
  const accept = $('#cookie-accept');
  const decline = $('#cookie-decline');
  const key = 'wb_cookie_consent_v1';
  const state = localStorage.getItem(key);
  if (!state && banner) banner.style.display = 'block';
  function setConsent(val){ localStorage.setItem(key, val); if (banner) banner.style.display = 'none'; }
  if (accept) accept.addEventListener('click', () => setConsent('accepted'));
  if (decline) decline.addEventListener('click', () => setConsent('declined'));

  // Security Check
  const form = $('#sec-form');
  const input = $('#sec-target');
  const out = $('#sec-out');
  const btn = $('#sec-btn');

  async function runCheck(){
    if (!input || !out) return;
    const target = (input.value || '').trim();
    if (!target) return;

    if (btn){ btn.textContent = 'Prüfe…'; btn.disabled = true; }
    out.innerHTML = '';

    try{
      const res = await fetch('/api/security-check', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ target })
      });
      const data = await res.json();
      if(!res.ok || !data.ok) throw new Error(data.error || 'Fehler');

      const cls = data.vulnerable ? (data.riskScore >= 4 ? 'bad' : 'warn') : 'ok';
      const title = data.vulnerable ? '⚠️ Hardening sofort' : '✅ Schnellcheck ok';
      const ul = (data.checklist || []).map(x => `<li>${escapeHtml(x)}</li>`).join('');

      out.innerHTML = `
        <div class="result ${cls}">
          <h3>${title}</h3>
          <div class="small">Risiko-Score: <b>${data.riskScore}/5</b> • ${escapeHtml(data.privacy || '')}</div>
          <p class="small" style="margin-top:8px">${escapeHtml(data.message || '')}</p>
          <ul>${ul}</ul>
        </div>
      `;
    }catch(e){
      out.innerHTML = `<div class="result bad"><h3>Fehler</h3><p class="small">${escapeHtml(e.message || 'Unbekannt')}</p></div>`;
    }finally{
      if (btn){ btn.textContent = 'Kostenlos prüfen'; btn.disabled = false; }
    }
  }

  if(form) form.addEventListener('submit', (e)=>{ e.preventDefault(); runCheck(); });
  if(btn) btn.addEventListener('click', (e)=>{ e.preventDefault(); runCheck(); });

  // Lead capture
  const leadForm = $('#lead-form');
  const leadEmail = $('#lead-email');
  const leadConsent = $('#lead-consent');
  const leadOut = $('#lead-out');

  async function submitLead(){
    if(!leadEmail || !leadOut || !leadConsent) return;
    const email = (leadEmail.value || '').trim();
    const consent = !!leadConsent.checked;
    leadOut.textContent = '';
    try{
      const res = await fetch('/api/lead', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email, consent, topic:'security' })
      });
      const data = await res.json();
      if(!res.ok || !data.ok) throw new Error(data.error || 'Fehler');
      leadOut.textContent = data.message || 'Danke!';
    }catch(e){
      leadOut.textContent = e.message || 'Fehler';
    }
  }
  if(leadForm) leadForm.addEventListener('submit', (e)=>{ e.preventDefault(); submitLead(); });

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }
})();
