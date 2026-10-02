(function () {
  'use strict';

  // Hero 4-slide cinematic cycle (images + videos) — shared across all pages
  var heroSlides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  if (!heroSlides.length) return;

  var FADE_MS = 500;
  var STORAGE_KEY = '4e-hero-cycle';
  var index = 0;
  var timer = null;
  var saveTimer = null;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isHome = document.body.classList.contains('home-shell');

  function getVideo(slide) {
    return slide.querySelector('video');
  }

  function tuneRate(video, targetSec) {
    if (!video || !video.duration || !isFinite(video.duration) || targetSec <= 0) return;
    video.playbackRate = Math.min(2.5, Math.max(0.75, video.duration / targetSec));
  }

  function playSafe(video) {
    if (!video) return;
    video.muted = true;
    var p = video.play();
    if (p && typeof p.catch === 'function') p.catch(function () {});
  }

  function useMobileHero() {
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var slow = conn && (conn.saveData || conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g');
    return window.matchMedia('(max-width: 767px)').matches || !!slow;
  }

  function chooseSrc(video) {
    var desktop = video.getAttribute('data-src');
    var mobile = video.getAttribute('data-src-mobile');
    if (!desktop) {
      var source = video.querySelector('source');
      if (source) desktop = source.getAttribute('src');
    }
    if (useMobileHero() && mobile) return mobile;
    return desktop;
  }

  function markReady(video) {
    video.classList.add('is-ready');
  }

  function primeVideo(video, keepTime) {
    if (!video) return;
    var src = chooseSrc(video);
    if (src && video.getAttribute('data-primed-src') !== src) {
      video.preload = 'auto';
      video.setAttribute('data-primed-src', src);
      video.src = src;
    } else {
      video.preload = 'auto';
    }
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    if (video.getAttribute('data-watch') !== '1') {
      video.setAttribute('data-watch', '1');
      video.addEventListener('loadeddata', function () { markReady(video); });
      video.addEventListener('playing', function () { markReady(video); });
    }
    if (keepTime || video.getAttribute('data-kicked') === '1') return;
    video.setAttribute('data-kicked', '1');
    var kick = function () {
      var pending = video.play();
      if (pending && typeof pending.then === 'function') {
        pending.then(function () {
          if (video.closest('.hero__slide--active')) return;
          video.pause();
          try { video.currentTime = 0; } catch (e) { /* ignore */ }
        }).catch(function () {});
      }
    };
    if (video.readyState >= 2) kick();
    else video.addEventListener('loadeddata', function onKick() {
      video.removeEventListener('loadeddata', onKick);
      kick();
    });
  }

  function warmNextImage(fromIndex) {
    var slide = heroSlides[(fromIndex + 1) % heroSlides.length];
    if (!slide || slide.getAttribute('data-type') !== 'image') return;
    var img = slide.querySelector('img.hero__slide-media');
    if (!img) return;
    var src = img.getAttribute('data-src') || img.getAttribute('src');
    if (src && !img.getAttribute('src')) img.src = src;
    if (img.decode) img.decode().catch(function () {});
  }

  function queueUpcoming(fromIndex) {
    var nextSlide = heroSlides[(fromIndex + 1) % heroSlides.length];
    var nextVideo = nextSlide && getVideo(nextSlide);
    if (nextVideo) primeVideo(nextVideo, false);
    else warmNextImage(fromIndex);
  }

  function restartPan(slide) {
    var pan = slide.querySelector('.hero__pan, .dept-pan');
    if (!pan) return;
    pan.style.animation = 'none';
    void pan.offsetWidth;
    pan.style.animation = '';
  }

  function saveState() {
    if (document.body.classList.contains('page--construction')) return;
    try {
      var active = heroSlides[index];
      if (!active) return;
      var video = getVideo(active);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        index: index,
        t: video ? video.currentTime : 0,
        type: active.getAttribute('data-type') || 'image',
        savedAt: Date.now()
      }));
    } catch (e) { /* ignore */ }
  }

  function loadState() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var state = JSON.parse(raw);
      if (!state || typeof state.index !== 'number') return null;
      // Resume only if recent (same browsing session navigation)
      if (!state.savedAt || Date.now() - state.savedAt > 120000) return null;
      if (state.index < 0 || state.index >= heroSlides.length) return null;
      return state;
    } catch (e) {
      return null;
    }
  }

  function activateSlide(nextIndex, seekTime, force) {
    var next = heroSlides[nextIndex];
    var nextType = next.getAttribute('data-type');
    var durationSec = parseFloat(next.getAttribute('data-duration') || '9', 10);
    var video = getVideo(next);

    if (isHome && !force && nextType === 'image') {
      var img = next.querySelector('img.hero__slide-media');
      if (img && img.getAttribute('data-src') && !img.getAttribute('src')) img.src = img.getAttribute('data-src');
      if (img && img.getAttribute('src') && !img.complete) {
        var imageDone = false;
        var showImage = function () {
          if (imageDone) return;
          imageDone = true;
          activateSlide(nextIndex, seekTime, true);
        };
        img.addEventListener('load', showImage);
        window.setTimeout(showImage, 1400);
        return;
      }
    }

    if (isHome && video && !force && video.readyState < 2) {
      primeVideo(video, typeof seekTime === 'number');
      var done = false;
      var go = function () {
        if (done) return;
        done = true;
        activateSlide(nextIndex, seekTime, true);
      };
      video.addEventListener('canplay', function onReady() {
        video.removeEventListener('canplay', onReady);
        go();
      });
      window.setTimeout(go, 1400);
      return;
    }

    heroSlides.forEach(function (slide) {
      slide.classList.remove('hero__slide--active');
      var v = getVideo(slide);
      if (v && slide !== next) v.pause();
    });

    next.classList.add('hero__slide--active');
    if (nextType === 'image') {
      restartPan(next);
    }

    if (video) {
      video.loop = true;
      video.playsInline = true;
      video.muted = true;
      var applySeek = function () {
        if (typeof seekTime === 'number' && seekTime > 0 && isFinite(video.duration)) {
          try {
            video.currentTime = Math.min(seekTime, Math.max(0, video.duration - 0.25));
          } catch (e) { /* ignore */ }
        } else if (seekTime !== false) {
          // fresh start only when not restoring
          if (seekTime === undefined) video.currentTime = 0;
        }
        tuneRate(video, durationSec);
        playSafe(video);
      };
      if (video.readyState >= 1) {
        applySeek();
      } else {
        video.addEventListener('loadedmetadata', function onMeta() {
          applySeek();
          video.removeEventListener('loadedmetadata', onMeta);
        });
        playSafe(video);
      }
    }

    index = nextIndex;
    if (isHome) queueUpcoming(nextIndex);
    else warmNextImage(nextIndex);
    saveState();

    var holdMs = durationSec * 1000 - FADE_MS;
    if (holdMs < 3500) holdMs = 3500;
    // Shorten remaining hold if we resumed mid-slide
    if (typeof seekTime === 'number' && seekTime > 0 && nextType === 'video') {
      var remaining = durationSec * 1000 - seekTime * 1000 - FADE_MS;
      if (remaining > 2000) holdMs = remaining;
    }

    if (timer) window.clearTimeout(timer);
    if (!reducedMotion) {
      timer = window.setTimeout(function () {
        activateSlide((index + 1) % heroSlides.length);
      }, holdMs);
    }
  }

  heroSlides.forEach(function (slide) {
    var video = getVideo(slide);
    if (!video) return;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = isHome ? 'none' : 'auto';
  });

  var restored = document.body.classList.contains('page--construction') ? null : loadState();
  if (restored) {
    activateSlide(restored.index, restored.t || 0);
  } else {
    activateSlide(0);
  }

  // Persist frequently so navigation mid-slide resumes cleanly
  if (saveTimer) window.clearInterval(saveTimer);
  saveTimer = window.setInterval(saveState, 800);

  window.addEventListener('pagehide', saveState);
  window.addEventListener('beforeunload', saveState);

  var resume = function () {
    var active = heroSlides[index];
    playSafe(getVideo(active));
    document.removeEventListener('touchstart', resume);
    document.removeEventListener('click', resume);
  };
  document.addEventListener('touchstart', resume, { once: true });
  document.addEventListener('click', resume, { once: true });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      saveState();
      if (timer) window.clearTimeout(timer);
      heroSlides.forEach(function (slide) {
        var v = getVideo(slide);
        if (v) v.pause();
      });
    } else {
      activateSlide(index, false);
    }
  });
})();
