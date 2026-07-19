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

  function restartPan(slide) {
    var pan = slide.querySelector('.hero__pan');
    if (!pan) return;
    pan.style.animation = 'none';
    void pan.offsetWidth;
    pan.style.animation = '';
  }

  function saveState() {
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

  function activateSlide(nextIndex, seekTime) {
    var next = heroSlides[nextIndex];
    var nextType = next.getAttribute('data-type');
    var durationSec = parseFloat(next.getAttribute('data-duration') || '9', 10);
    var video = getVideo(next);

    heroSlides.forEach(function (slide) {
      slide.classList.remove('hero__slide--active');
      var v = getVideo(slide);
      if (v && slide !== next) v.pause();
    });

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

    next.classList.add('hero__slide--active');
    index = nextIndex;
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
    video.preload = 'auto';
  });

  var restored = loadState();
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
