/* ═══════════════════════════════════════════════════════════
   BlogArch — External JavaScript
   https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/blogarch.js
   ═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var body=document.body;

  /* ── Theme (Dark Mode) ── */
  var themeIcon=document.getElementById('theme-icon');
  var savedTheme=localStorage.getItem('theme');
  var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;
  if(savedTheme==='dark'||(savedTheme===null&&prefersDark)){
    body.classList.add('dark-mode');
    if(themeIcon) themeIcon.className='fas fa-sun';
  }
  var themeBtn=document.getElementById('theme-toggle');
  if(themeBtn){
    themeBtn.addEventListener('click',function(){
      body.classList.toggle('dark-mode');
      var dark=body.classList.contains('dark-mode');
      localStorage.setItem('theme',dark?'dark':'light');
      if(themeIcon) themeIcon.className=dark?'fas fa-sun':'fas fa-moon';
    });
  }

  /* ── Color Mode Buttons (theme-bar) ── */
  var savedMode=localStorage.getItem('colorMode');
  if(savedMode) body.setAttribute('data-mode',savedMode);
  document.querySelectorAll('.theme-btn[data-mode]').forEach(function(btn){
    if(savedMode&&btn.getAttribute('data-mode')===savedMode) btn.classList.add('active');
    btn.addEventListener('click',function(){
      var mode=btn.getAttribute('data-mode');
      if(body.getAttribute('data-mode')===mode){
        body.removeAttribute('data-mode');
        localStorage.removeItem('colorMode');
        document.querySelectorAll('.theme-btn').forEach(function(b){b.classList.remove('active');});
      } else {
        body.setAttribute('data-mode',mode);
        localStorage.setItem('colorMode',mode);
        document.querySelectorAll('.theme-btn').forEach(function(b){b.classList.remove('active');});
        btn.classList.add('active');
      }
    });
  });

  /* ── Reading Progress + Back to Top + Navbar scroll ── */
  var bar=document.getElementById('reading-progress');
  var btt=document.getElementById('back-to-top');
  var navbar=document.getElementById('navbar');
  window.addEventListener('scroll',function(){
    var st=document.documentElement.scrollTop||document.body.scrollTop||0;
    if(navbar){if(st>50) navbar.classList.add('scrolled'); else navbar.classList.remove('scrolled');}
    var h=document.documentElement.scrollHeight-document.documentElement.clientHeight;
    if(bar) bar.style.width=(h>0?(st/h)*100:0)+'%';
    if(btt){if(st>400) btt.classList.add('visible'); else btt.classList.remove('visible');}
  },{passive:true});
  if(btt) btt.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});

  /* ── Read Time Calculator ── */
  var postBody=document.getElementById('post-body');
  var readTimeEl=document.querySelector('.read-time-val');
  if(postBody&&readTimeEl){
    var words=(postBody.innerText||postBody.textContent||'').trim().split(/\s+/).length;
    readTimeEl.textContent=Math.max(1,Math.round(words/200));
  }

  /* ── Lazy Loading ── */
  function initLazy(){
    var imgs=document.querySelectorAll('img.lazy');
    if('IntersectionObserver' in window){
      var obs=new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting){
            var img=e.target;img.src=img.dataset.src;
            img.onload=function(){img.classList.add('loaded');};obs.unobserve(img);
          }
        });
      },{rootMargin:'200px'});
      imgs.forEach(function(img){obs.observe(img);});
    } else {
      imgs.forEach(function(img){img.src=img.dataset.src;img.classList.add('loaded');});
    }
    document.querySelectorAll('.post-body img:not(.lazy)').forEach(function(img){
      img.setAttribute('loading','lazy');
      var mark=function(){img.classList.add('loaded');};
      if(img.complete) mark(); else img.addEventListener('load',mark,{once:true});
    });
  }

  /* ── Mobile Drawer ── */
  var drawer=document.getElementById('mobile-drawer');
  var overlay=document.getElementById('menu-overlay');
  var hamburger=document.getElementById('hamburger');
  function openDrawer(){
    if(drawer) drawer.classList.add('active');
    if(overlay) overlay.classList.add('active');
    if(hamburger) hamburger.classList.add('active');
    body.style.overflow='hidden';
  }
  function closeDrawer(){
    if(drawer) drawer.classList.remove('active');
    if(overlay) overlay.classList.remove('active');
    if(hamburger) hamburger.classList.remove('active');
    body.style.overflow='';
  }
  if(hamburger) hamburger.addEventListener('click',function(){
    drawer&&drawer.classList.contains('active')?closeDrawer():openDrawer();
  });
  if(overlay) overlay.addEventListener('click',closeDrawer);
  document.querySelectorAll('.mobile-drawer .nav-link:not(.dropdown-toggle)').forEach(function(link){
    link.addEventListener('click',closeDrawer);
  });

  /* ── Mobile Dropdown ── */
  var mobileDropdown=document.getElementById('mobile-dropdown');
  if(mobileDropdown){
    var dtoggle=mobileDropdown.querySelector('.dropdown-toggle');
    if(dtoggle){
      dtoggle.addEventListener('click',function(e){
        e.preventDefault();
        mobileDropdown.classList.toggle('active');
      });
    }
    mobileDropdown.querySelectorAll('.dropdown-item').forEach(function(item){
      item.addEventListener('click',closeDrawer);
    });
  }

  /* ── Search Panel ── */
  var searchPanel=document.getElementById('search-panel');
  var searchInput=document.getElementById('search-input');
  var searchResults=document.getElementById('search-results');
  var searchBtn=document.getElementById('search-btn');
  var searchCloseBtn=document.getElementById('search-close');
  var setSearch=function(open){
    if(!searchPanel) return;
    if(open){searchPanel.classList.add('active');if(searchInput) searchInput.focus();}
    else searchPanel.classList.remove('active');
  };
  if(searchBtn) searchBtn.addEventListener('click',function(){setSearch(!searchPanel.classList.contains('active'));});
  if(searchCloseBtn) searchCloseBtn.addEventListener('click',function(){setSearch(false);});
  var renderResults=function(items){
    if(!searchResults) return;
    if(!items.length){searchResults.innerHTML="<div style='padding:1rem;text-align:center;color:var(--muted)'>لا توجد نتائج مطابقة</div>";return;}
    searchResults.innerHTML=items.map(function(it){
      return "<a class='search-item' href='"+it.url+"'>"+
        "<strong class='arabic-text'>"+it.title+"</strong>"+
        "<span class='arabic-text'>"+it.snippet+"</span></a>";
    }).join('');
  };
  var doSearch=function(q){
    q=(q||'').toLowerCase().trim();
    if(q.length<2){renderResults([]);return;}
    var items=[];
    document.querySelectorAll('.post-card,.entry').forEach(function(card){
      var a=card.querySelector('h2 a,h3 a');
      var sn=card.querySelector('.card-snippet,.snippet');
      if(!a||!sn) return;
      var title=a.textContent||'';
      var snippet=(sn.textContent||'').trim();
      if((title+' '+snippet).toLowerCase().indexOf(q)!==-1)
        items.push({title:title,snippet:snippet.slice(0,100)+(snippet.length>100?'...':''),url:a.href});
    });
    renderResults(items.slice(0,10));
  };
  if(searchInput) searchInput.addEventListener('input',function(){doSearch(searchInput.value);});
  if(searchResults){
    searchResults.addEventListener('click',function(e){
      var item=e.target.closest('.search-item');
      if(item&&item.href) window.location.href=item.href;
    });
  }
  document.addEventListener('click',function(e){
    if(!searchPanel||!searchPanel.classList.contains('active')) return;
    if(!searchPanel.contains(e.target)&&!(searchBtn&&searchBtn.contains(e.target))) setSearch(false);
  });

  /* ── About Modal ── */
  var modal=document.getElementById('about-modal');
  function openAbout(){if(modal){modal.classList.add('open');body.style.overflow='hidden';}}
  function closeAbout(){if(modal){modal.classList.remove('open');body.style.overflow='';}}
  var aboutOpen=document.getElementById('about-open');
  var aboutOpenMobile=document.getElementById('about-open-mobile');
  if(aboutOpen) aboutOpen.addEventListener('click',function(e){e.preventDefault();openAbout();});
  if(aboutOpenMobile) aboutOpenMobile.addEventListener('click',function(e){e.preventDefault();closeDrawer();openAbout();});
  var aboutClose=document.getElementById('about-close');
  if(aboutClose) aboutClose.addEventListener('click',closeAbout);
  if(modal) modal.addEventListener('click',function(e){if(e.target===modal) closeAbout();});

  /* ── Pills: active state for real label links ── */
  var currentPath=window.location.pathname;
  document.querySelectorAll('.pills .pill').forEach(function(pill){
    pill.classList.remove('active');
    try{
      if(pill.href&&currentPath===new URL(pill.href,window.location.origin).pathname)
        pill.classList.add('active');
    }catch(e){}
  });

  /* ── Keyboard (Escape) ── */
  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape') return;
    if(searchPanel&&searchPanel.classList.contains('active')) setSearch(false);
    if(modal&&modal.classList.contains('open')) closeAbout();
    if(drawer&&drawer.classList.contains('active')) closeDrawer();
  });

  /* ── Active Nav Highlighting ── */
  document.querySelectorAll('.nav-menu .nav-link,.mobile-drawer .nav-link').forEach(function(a){
    try{if(a.getAttribute('href')&&currentPath===new URL(a.href,window.location.origin).pathname) a.classList.add('active');}catch(err){}
  });

  document.addEventListener('DOMContentLoaded',initLazy);
})();
