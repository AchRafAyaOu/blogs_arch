(function(){
  /* Dark mode */
  var dm = localStorage.getItem('fin-dark') === '1';
  if(dm) document.body.classList.add('dark-mode');
  document.getElementById('pg-dark-btn').addEventListener('click', function(){
    document.body.classList.toggle('dark-mode');
    var on = document.body.classList.contains('dark-mode');
    localStorage.setItem('fin-dark', on ? '1' : '0');
    this.querySelector('i').className = on ? 'fas fa-sun' : 'fas fa-moon';
  });
  if(dm) document.querySelector('#pg-dark-btn i').className = 'fas fa-sun';

  function hideLoader(){
    var el = document.getElementById('fin-loader');
    if(!el) return;
    el.classList.add('fin-loader-hidden');
    setTimeout(function(){ el.style.display='none'; }, 500);
  }

  var CDN = 'https://cdn.jsdelivr.net/gh/AchRafAyaOu/blogs_arch@main/data/lessons.json';
  var grid = document.getElementById('pg-grid');
  var allLessons = [];
  var filteredLessons = [];
  var currentIdx = -1;
  var currentFilter = 'all';

  function renderCards(lessons){
    filteredLessons = lessons;
    grid.innerHTML = lessons.map(function(l, i){
      var emoji = l.level === 'beg' ? '🔰' : (l.level === 'mid' ? '🌟' : '⚡');
      return '<div class="lc-card arabic-text" role="listitem" tabindex="0"'
        + ' onclick="openLesson(' + i + ')"'
        + ' onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();openLesson(' + i + ')}"'
        + ' aria-label="' + l.title + '">'
        + '<span class="lc-level ' + l.level + '">' + emoji + ' ' + l.levelLabel + '</span>'
        + '<div class="lc-icon"><i class="' + l.icon + '" aria-hidden="true"></i></div>'
        + '<p class="lc-title">' + l.title + '</p>'
        + '<p class="lc-title-en">' + l.titleEn + '</p>'
        + '<p class="lc-desc">' + l.description + '</p>'
        + '<span class="lc-link">افتح الدرس <i class="fas fa-arrow-left" aria-hidden="true"></i></span>'
        + '</div>';
    }).join('');
  }

  function applyFilter(level){
    currentFilter = level;
    document.querySelectorAll('.pg-filter-btn').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-level') === level);
    });
    var filtered = level === 'all' ? allLessons : allLessons.filter(function(l){ return l.level === level; });
    renderCards(filtered);
  }

  function updateCounts(lessons){
    var c = { beg: 0, mid: 0, adv: 0 };
    lessons.forEach(function(l){ if(c[l.level] !== undefined) c[l.level]++; });
    var fcAll = document.getElementById('fc-all');
    var fcBeg = document.getElementById('fc-beg');
    var fcMid = document.getElementById('fc-mid');
    var fcAdv = document.getElementById('fc-adv');
    if(fcAll) fcAll.textContent = lessons.length;
    if(fcBeg) fcBeg.textContent = c.beg;
    if(fcMid) fcMid.textContent = c.mid;
    if(fcAdv) fcAdv.textContent = c.adv;
    var sB = document.getElementById('stat-beg');
    var sM = document.getElementById('stat-mid');
    var sA = document.getElementById('stat-adv');
    if(sB) sB.textContent = c.beg;
    if(sM) sM.textContent = c.mid;
    if(sA) sA.textContent = c.adv;
  }

  document.querySelectorAll('.pg-filter-btn').forEach(function(btn){
    btn.addEventListener('click', function(){ applyFilter(this.getAttribute('data-level')); });
  });

  /* Modal */
  var modal = document.getElementById('lm-modal');
  var iframe = document.getElementById('lm-iframe');
  var label  = document.getElementById('lm-label');
  var extLink= document.getElementById('lm-ext');
  var prevBtn= document.getElementById('lm-prev');
  var nextBtn= document.getElementById('lm-next');
  var counter= document.getElementById('lm-counter');

  window.openLesson = function(idx){
    currentIdx = idx;
    var l = filteredLessons[idx];
    if(!l) return;
    label.textContent = l.title + ' — ' + l.titleEn;
    extLink.href = l.url;
    iframe.src = l.url;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateNav();
  };

  function updateNav(){
    counter.textContent = (currentIdx + 1) + ' / ' + filteredLessons.length;
    prevBtn.disabled = currentIdx === 0;
    nextBtn.disabled = currentIdx === filteredLessons.length - 1;
  }

  function closeModal(){
    modal.classList.remove('open');
    document.body.style.overflow = '';
    iframe.src = '';
    currentIdx = -1;
  }

  document.getElementById('lm-close').onclick = closeModal;
  modal.addEventListener('click', function(e){ if(e.target === modal) closeModal(); });
  prevBtn.onclick = function(){ if(currentIdx > 0){ openLesson(currentIdx - 1); } };
  nextBtn.onclick = function(){ if(currentIdx < filteredLessons.length - 1){ openLesson(currentIdx + 1); } };
  document.addEventListener('keydown', function(e){
    if(!modal.classList.contains('open')) return;
    if(e.key === 'Escape') closeModal();
    if(e.key === 'ArrowRight') prevBtn.onclick();
    if(e.key === 'ArrowLeft')  nextBtn.onclick();
  });
  var tX = 0;
  modal.addEventListener('touchstart', function(e){ tX = e.changedTouches[0].screenX; }, { passive: true });
  modal.addEventListener('touchend', function(e){
    var diff = tX - e.changedTouches[0].screenX;
    if(Math.abs(diff) > 50){ if(diff > 0) nextBtn.onclick(); else prevBtn.onclick(); }
  }, { passive: true });

  fetch(CDN)
    .then(function(r){ return r.json(); })
    .then(function(data){
      allLessons = data;
      updateCounts(data);
      renderCards(data);
      hideLoader();
    })
    .catch(function(){
      grid.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--muted)" class="arabic-text"><i class="fas fa-exclamation-circle" style="font-size:2rem;display:block;margin-bottom:1rem;opacity:.4"></i>تعذّر تحميل الدروس — حاول لاحقاً</div>';
      hideLoader();
    });

  window.addEventListener('load', function(){ setTimeout(hideLoader, 1500); });
})();
