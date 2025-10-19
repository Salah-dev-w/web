/*
  Single-file interactive Hacker CV updated to blur background when password modal is open
  Key change
  - When showing passwordModal or elevatedModal we add class modal-blur to #matrix-wrap and .container
  - When closing modals we remove that class
*/

    lucide.createIcons();

document.querySelectorAll('#contact a').forEach(link => {
  const coded = link.getAttribute('data-coded');
  const real = link.getAttribute('data-real');

  link.addEventListener('mouseenter', () => {
    link.textContent = real;
  });

  link.addEventListener('mouseleave', () => {
    link.textContent = coded;
  });
});
/* =========================
   Utilities
   ========================= */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* =========================
   Initial Elements
   ========================= */
const loader = $('#loader');
const progressBar = $('#progressBar');
const skull = $('#skull');
const app = $('#app');
const matrixWrap = $('#matrix-wrap');
const container = document.querySelector('.container');
const matrixCanvas = document.getElementById('matrix');
const ctx = matrixCanvas.getContext('2d');
const nameType = $('#nameType');
const flickerInput = $('#flickerInput');
const passwordModal = $('#passwordModal');
const openPassword = $('#openPassword');
const submitPass = $('#submitPass');
const elevatedModal = $('#elevatedModal');
const elevatedInput = $('#elevatedInput');
const submitElevated = $('#submitElevated');
const contactHidden = $('#contactHidden');
const sysLog = $('#sysLog');
const clearLog = $('#clearLog');
const toggleStealthBtn = $('#toggleStealth');
const accessibilityToggle = $('#accessibilityToggle');
const leftPanel = $('#leftPanel');
const mainContent = $('#mainContent');
const customCursor = $('#customCursor');

/* =========================
   Accessibility
   ========================= */
accessibilityToggle.addEventListener('change', (e)=>{
  if(e.target.checked){
    document.documentElement.classList.add('high-contrast');
    log('accessibility high contrast enabled');
    document.documentElement.style.setProperty('--reduced-motion','1');
  } else {
    document.documentElement.classList.remove('high-contrast');
    document.documentElement.style.setProperty('--reduced-motion','0');
    log('accessibility high contrast disabled');
  }
});

/* =========================
   Fake system logs
   ========================= */
function log(txt){
  const time = new Date().toLocaleTimeString();
  const entry = document.createElement('div');
  entry.textContent = `[${time}] ${txt}`;
  sysLog.appendChild(entry);
  sysLog.scrollTop = sysLog.scrollHeight;
}
clearLog.addEventListener('click', ()=> sysLog.innerHTML = '');
log('init system checks');
log('loading modules: ui, matrix, auth');
log('detecting GPU capabilities');
log('secure context established');

/* =========================
   LOADER behavior
   ========================= */
(function startLoader(){
  const delayMs = 5000 + Math.random()*5000; // 3-5s random
  const start = performance.now();
  let last = start;
  function tick(now){
    const elapsed = now - start;
    const t = Math.min(1, elapsed / delayMs);
    const eased = 1 - Math.pow(1 - t, 2);
    const pct = Math.floor(eased * 100);
    progressBar.style.width = pct + '%';
    loader.setAttribute('aria-busy', t<1);
    if(Math.random() < 0.005) skull.classList.add('glitch');
    if(Math.random() < 0.02) skull.classList.remove('glitch');
    if(t < 1){
      requestAnimationFrame(tick);
      last = now;
    } else {
      skull.classList.add('glitch');
      setTimeout(()=> loader.classList.add('shake'), 80);
      setTimeout(finishLoading, 420);
    }
  }
  requestAnimationFrame(tick);
})();

function finishLoading(){
  loader.style.display = 'none';
  app.classList.add('visible');
  app.setAttribute('aria-hidden','false');
  log('ui ready');
  initMatrix();
  setTimeout(()=> {
    $$('.fade-slide').forEach((el,i)=>setTimeout(()=>el.classList.add('in'), i*80));
    playTypewriter();
  }, 200);
  setTimeout(()=> openPasswordModal(), 700);
}

/* =========================
   MATRIX BACKGROUND
   ========================= */
let matrixW, matrixH, columns, drops, animId;
const katakana = 'アイウエオカ0サタナハマヤラワン1';
function initMatrix(){
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  const fontSize = 18;
  columns = Math.floor(matrixW / fontSize);
  drops = new Array(columns).fill(0);
  function frame(){
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0,0,matrixW,matrixH);
    ctx.font = '18px monospace';
    for(let i=0;i<columns;i++){
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      const char = Math.random() < 0.15 ? katakana.charAt(Math.floor(Math.random()*katakana.length)) : (Math.random() < 0.5 ? '1' : '0');
      ctx.fillStyle = `rgba(255,27,45,${Math.min(1, 0.9 - drops[i]/(matrixH/fontSize*0.7))})`;
      ctx.fillText(char, x, y);
      if(y > matrixH * (0.6 + Math.random()*0.2) && Math.random() > 0.995){
        drops[i] = 0;
      } else {
        drops[i]++;
      }
    }
    animId = requestAnimationFrame(frame);
  }
  animId = requestAnimationFrame(frame);
}
function resizeCanvas(){
  matrixW = matrixCanvas.width = window.innerWidth;
  matrixH = matrixCanvas.height = window.innerHeight;
}


// CUSTOM CURSOR FIXED
// =========================
const cursor = document.querySelector('#customCursor');
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
  item.addEventListener('mouseenter', () => {
    cursor.classList.add('blink');
  });
  item.addEventListener('mouseleave', () => {
    cursor.classList.remove('blink');
  });
});

// =========================
// CUSTOM CURSOR FIXED
// =========================
document.body.classList.add('hide-native-cursor');
let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
customCursor.style.left = mouseX + 'px';
customCursor.style.top = mouseY + 'px';

// تحريك المؤشر بدون تداخل مع translate px
window.addEventListener('mousemove', (e)=>{
  mouseX = e.clientX;
  mouseY = e.clientY;
  // نستخدم left/top لتحديد موقع المؤشر و transform فقط للتمركز
  customCursor.style.left = mouseX + 'px';
  customCursor.style.top = mouseY + 'px';
  customCursor.style.transform = 'translate(-50%, -50%)';
});

// اختياري: إخفاء المؤشر عند الخروج من نافذة المتصفح
document.addEventListener('mouseleave', () => { customCursor.style.opacity = '0'; });
document.addEventListener('mouseenter', (e) => {
  customCursor.style.opacity = '1';
  mouseX = e.clientX;
  mouseY = e.clientY;
  customCursor.style.left = mouseX + 'px';
  customCursor.style.top = mouseY + 'px';
});
/* =========================
   NAME TYPEWRITER
   ========================= */
function playTypewriter(){
  const text = 'SAIDA CH';
  const charset = 'アイウエオカサタナハマヤラワンabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ/*-+&$!#01';
  let i = 0;
  nameType.textContent = '';


    function createFlickerChar(targetChar){
  const span = document.createElement('span');
  span.style.fontFamily = 'monospace';
  span.style.fontSize = '24px';
  span.style.minWidth = '12px';
  span.style.display = 'inline-block';
  nameType.appendChild(span);

  const interimColor = '#ff7f7f'; // اللون أثناء الوميض
  const finalColor = 'var(--red)'; // اللون عند الاستقرار
  const shadowColor = '0 0 8px rgba(255,27,45,0.6)';

  function flickerCycle(){
    const startTime = performance.now();
    const duration = 800 + Math.random()*800; // مدة الوميض قبل الاستقرار
    let nextChange = startTime;

    function flicker(now){
      if(now >= startTime + duration){
        span.textContent = targetChar;
        span.style.color = finalColor;
        span.style.textShadow = shadowColor;
        // ابقاء الاسم ثابت 5 ثواني قبل اعادة دورة
        setTimeout(flickerCycle, 5000);
        return;
      }
      if(now >= nextChange){
        const r = charset.charAt(Math.floor(Math.random()*charset.length));
        span.textContent = r;
        span.style.color = interimColor; // اللون المؤقت
        nextChange = now + 100 + Math.random()*100;
      }
      requestAnimationFrame(flicker);
    }
    requestAnimationFrame(flicker);
  }

  flickerCycle();
}

  function step(){
    if(i < text.length){
      createFlickerChar(text[i++]);
      setTimeout(step, 120 + Math.random()*80);
    } else {
      nameType.classList.add('glow');
      setTimeout(()=>{
        nameType.classList.remove('glow');
        nameType.classList.add('glitch');
        setTimeout(()=> nameType.classList.remove('glitch'), 420);
      }, 800);
    }
  }
  step();
}

/* =========================
   NAVIGATION
   ========================= */
$$('.nav-item').forEach(it=>{
  it.addEventListener('click', ()=> navigateTo(it.dataset.target));
});
function navigateTo(id){
  const el = document.getElementById(id);
  if(el){
    el.scrollIntoView({behavior:'smooth',block:'start'});
    log(`navigated to ${id}`);
  }
}
document.addEventListener('keydown',(e)=>{
  if(e.key === 'ArrowDown'){ window.scrollBy({top:200,behavior:'smooth'}); }
  if(e.key === 'ArrowUp'){ window.scrollBy({top:-200,behavior:'smooth'}); }
  if(e.key === 'Enter'){
    if(passwordModal.style.display !== 'none') {
      submitPass.click();
    } else {
      window.scrollBy({top:400,behavior:'smooth'});
    }
  }

});

/* =========================
   PASSWORD FLICKER INPUT
   ========================= */
const flickerCharset = '!@#$%^&*()-_=+[]{}<>/\\|?~abcdefghijklmnopqrstuvwxyz0123456789';
const minFlickerTime = 350;
const maxFlickerTime = 900;
const jitterIntervalMean = 30;
let activeChars = [];
let flickerRAF;
let typedPassword = '';

function createFlickerChar(targetChar){
  const span = document.createElement('span');
  span.style.fontFamily = 'monospace';
  span.style.fontSize = '16px';
  span.style.color = '#ddd';
  span.style.minWidth = '10px';
  span.style.display = 'inline-block';
  span.setAttribute('aria-hidden','true');
  const now = performance.now();
  const duration = minFlickerTime + Math.random() * (maxFlickerTime - minFlickerTime);
  const obj = {
    span,
    targetChar,
    startTime: now,
    settleTime: now + duration,
    nextChange: now + Math.random() * jitterIntervalMean
  };
  activeChars.push(obj);
  flickerInput.appendChild(span);
  return obj;
}

function flickerLoop(now){
  for(let i = activeChars.length -1; i >=0; i--){
    const c = activeChars[i];
    if(now >= c.settleTime){
      c.span.textContent = c.targetChar;
      c.span.style.color = 'var(--red)';
      c.span.style.textShadow = '0 0 8px rgba(255,27,45,0.6)';
      activeChars.splice(i,1);
      continue;
    }
    if(now >= c.nextChange){
      const r = flickerCharset.charAt(Math.floor(Math.random()*flickerCharset.length));
      c.span.textContent = r;
      c.nextChange = now + jitterIntervalMean + (Math.random()*jitterIntervalMean);
    }
  }
  if(activeChars.length > 0) flickerRAF = requestAnimationFrame(flickerLoop);
  else flickerRAF = null;
}

/* Handle keyboard input when modal open */
function openPasswordModal(){
  passwordModal.style.display = 'block';
  passwordModal.setAttribute('aria-hidden','false');
  flickerInput.innerHTML = '';
  typedPassword = '';
  // add blur to everything behind modal
  matrixWrap.classList.add('modal-blur');
  container.classList.add('modal-blur');
  setTimeout(()=> document.addEventListener('keydown', passwordKeyHandler), 10);
}

function closeModals(){
  passwordModal.style.display = 'none';
  elevatedModal.style.display = 'none';
  passwordModal.setAttribute('aria-hidden','true');
  elevatedModal.setAttribute('aria-hidden','true');
  document.removeEventListener('keydown', passwordKeyHandler);
  // remove blur when modals closed
  matrixWrap.classList.remove('modal-blur');

}

document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'f') {
    container.classList.remove('modal-blur')
  }
})
function passwordKeyHandler(e){
  
  if(e.key === 'Backspace'){
    const last = flickerInput.lastChild;
    if(last) last.remove();
    typedPassword = typedPassword.slice(0, -1);
    return;
  }
  if(e.key.length === 1 && typedPassword.length < 32){
    createFlickerChar(e.key);
    typedPassword += e.key;
    if(!flickerRAF) flickerRAF = requestAnimationFrame(flickerLoop);
  }
  if(e.key === 'Enter'){ attemptPasswordSubmit(); }
}

function attemptPasswordSubmit(){
  if(activeChars.length > 0){
    log('waiting for characters to settle');
    setTimeout(checkTypedPassword, maxFlickerTime + 50);
  } else checkTypedPassword();
}

function checkTypedPassword(){
  const pass = typedPassword;
  if(pass === 'hacker'){
    log('auth success regular');
    passwordModal.style.display = 'none';
    // remove blur when unlocked
    matrixWrap.classList.remove('modal-blur');
    container.classList.remove('modal-blur');
    showCV();
  } else {
    log('auth failed for ' + pass);
    passwordModal.animate([{transform:'translateY(0)'},{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'translateY(0)'}],{duration:400});
    setTimeout(()=> {
      flickerInput.innerHTML = ''; typedPassword = '';
    }, 420);
  }
}
submitPass.addEventListener('click', attemptPasswordSubmit);

/* Elevated reveal handling with blur when elevated modal open */
$('#openPassword').addEventListener('click', openPasswordModal);
$('#openPassword').addEventListener('contextmenu', (e)=>{ e.preventDefault(); openElevated(); });

function openElevated(){
  elevatedModal.style.display = 'block';
  elevatedModal.setAttribute('aria-hidden','false');
  elevatedInput.focus();
  // add blur behind elevated modal as well
  matrixWrap.classList.add('modal-blur');
  container.classList.add('modal-blur');
}
submitElevated.addEventListener('click', ()=>{
  const val = elevatedInput.value.trim();
  if(val === 'root'){
    log('elevated access granted');
    elevatedModal.style.display = 'none';
    contactHidden.style.display = 'block';
    // remove blur after reveal
    matrixWrap.classList.remove('modal-blur');
    container.classList.remove('modal-blur');
    log('contact revealed');
  } else {
    log('elevated access denied');
    elevatedModal.animate([{transform:'scale(1)'},{transform:'scale(0.98)'},{transform:'scale(1)'}],{duration:320});
  }
});

/* =========================
   showCV visual adjustments
   ========================= */
function showCV(){
  mainContent.scrollIntoView({behavior:'smooth'});
  leftPanel.animate([{transform:'translateX(-6px)'},{transform:'translateX(0)'}],{duration:360});
  log('CV unlocked');
}


/* =========================
    Stealth Mode
 ========================= */
let stealthActive = 1;
toggleStealthBtn.addEventListener('click', ()=>{
  stealthActive = !stealthActive;
  applyStealth(stealthActive);
});
function applyStealth(on){
  if(on){
    $('#projects').style.filter = 'blur(5px) saturate(.6)';
    $('#contact').style.filter = 'blur(5px) saturate(.6)';
    $('#home').style.filter = 'blur(5px) saturate(.6)';
    $('#skills').style.filter = 'blur(5px) saturate(.6)';
    $('#education').style.filter = 'blur(5px) saturate(.6)';
    $('#interests').style.filter = 'blur(5px) saturate(.6)';
    $('#about').style.filter = 'blur(5px) saturate(.6)';
    log('stealth mode enabled');
  } else {
    $('#projects').style.filter = '';
    $('#contact').style.filter = '';
    $('#home').style.filter = '';
    $('#skills').style.filter = '';
    $('#education').style.filter = '';
    $('#interests').style.filter = '';
    $('#about').style.filter = '';
    log('stealth mode disabled');
  }
}
document.addEventListener('keydown', (e)=>{
  if(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's'){
    stealthActive = !stealthActive;
    applyStealth(stealthActive);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const sections = ['home','about','skills','projects','education','interests','contact']

  function blurAllExcept(id) {
    sections.forEach(s => {
      const el = document.getElementById(s)
      if (!el) return
      if (id && s === id) {
        el.style.filter = 'none'
        el.style.pointerEvents = 'auto'
      } else {
        el.style.filter = 'blur(5px) saturate(.6)'
        el.style.pointerEvents = 'none'
      }
    })
  }

  // attach listeners to nav items, safe-guard if elements missing
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.target
      if (!target) return
      // remove stealth flag if you want clicking to exit stealth mode
      stealthActive = 0
      applyStealth(false) // keep code consistent with existing logic
      // blur all except the clicked section
      blurAllExcept(target)
      // scroll to target if exists
      const el = document.getElementById(target)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // small visual feedback
      log(`focused section ${target}`)
    })
  })

  // if you want to start with stealth on, blur everything initially
  if (typeof stealthActive !== 'undefined' && stealthActive) {
    blurAllExcept(null) // pass null to blur all
  } else {
    // ensure all clear if stealth inactive
    sections.forEach(s => {
      const el = document.getElementById(s)
      if (el) { el.style.filter = ''; el.style.pointerEvents = 'auto' }
    })
  }

  // helper: allow blurAllExcept(null) to blur all
  const originalBlurAllExcept = blurAllExcept
  blurAllExcept = (id) => {
    if (!id) {
      sections.forEach(s => {
        const el = document.getElementById(s)
        if (!el) return
        el.style.filter = 'blur(5px) saturate(.6)'
        el.style.pointerEvents = 'none'
      })
      return
    }
    originalBlurAllExcept(id)
  }
})


// تفعيل البلور مباشرة عند تحميل الصفحة
applyStealth(true);

/* =========================
  SCROLL
   ========================= */

    function updateScroll(){
  const content = document.querySelector('.scroll-container');
  content.scrollTop = content.scrollHeight; // ينزل تلقائياً للأسفل
}

/* =========================
   Observe sections for fade-in
   ========================= */
const observer = new IntersectionObserver(entries=>{
  entries.forEach(en=>{
    if(en.isIntersecting){
      en.target.classList.add('in');
      if(Math.random() > 0.85){
        en.target.animate([{filter:'none'},{filter:'hue-rotate(20deg) drop-shadow(0 0 16px rgba(255,27,45,0.5))'},{filter:'none'}],{duration:700});
      }
    }
  });
},{threshold:0.15});
$$('.section').forEach(s=>observer.observe(s));

/* =========================
   Focus outlines
   ========================= */
let keyboardMode = false;
window.addEventListener('keydown', e => {
  if(e.key === 'Tab'){ document.body.classList.add('show-focus'); keyboardMode = true; }
});
window.addEventListener('mousedown', e => {
  if(keyboardMode){ document.body.classList.remove('show-focus'); keyboardMode = false; }
});

/* =========================
   Cleanup
   ========================= */
window.addEventListener('beforeunload', ()=>{
  if(animId) cancelAnimationFrame(animId);
  if(flickerRAF) cancelAnimationFrame(flickerRAF);
});

/* =========================
   No mobile
   ========================= */
(function(){
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isSmall = window.innerWidth <= 700;
  if (isMobileUA || isSmall) {
    // redirect to another page or show message
    window.location.href = 'no-mobile.html';
  }
})();

/* =========================
   Tuning notes
   - To change blur intensity adjust CSS rule for .modal-blur filter blur(6px)
   - Blur is applied to both #matrix-wrap and .container ensuring everything behind modal is blurred
   - This creates the requested behavior that the password entry screen blurs everything behind it
*/
