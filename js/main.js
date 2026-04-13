/* ============================================
   HASEBLACK — Main JavaScript
   Stars, Audio Player, Scroll Animations
   ============================================ */

(function () {
  'use strict';

  // ===========================
  // 1. Star Field Generator
  // ===========================
  function generateStars(elementId, count, maxSize) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const shadows = [];
    const screenW = 2000;
    const screenH = 4000;

    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * screenW);
      const y = Math.floor(Math.random() * screenH);
      const size = Math.random() * maxSize;
      const opacity = 0.2 + Math.random() * 0.6;
      shadows.push(`${x}px ${y}px 0 ${size}px rgba(226, 232, 240, ${opacity})`);
    }

    el.style.boxShadow = shadows.join(', ');
    el.style.width = '1px';
    el.style.height = '1px';
  }

  generateStars('stars-small', 300, 0.5);
  generateStars('stars-medium', 100, 1);
  generateStars('stars-large', 30, 1.5);

  // ===========================
  // 2. Scroll-triggered Fade-in
  // ===========================
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  document.querySelectorAll('.fade-in').forEach((el) => {
    fadeObserver.observe(el);
  });

  // ===========================
  // 3. Custom Audio Player
  // ===========================
  const audio = document.getElementById('audio-element');
  const btnPlay = document.getElementById('btn-play');
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');
  const progressWrap = document.getElementById('progress-wrap');
  const progressFill = document.getElementById('progress-fill');
  const timeCurrent = document.getElementById('time-current');
  const timeTotal = document.getElementById('time-total');

  if (audio && btnPlay) {
    // Format time in m:ss
    function formatTime(seconds) {
      if (isNaN(seconds)) return '0:00';
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
    }

    // Play / Pause toggle
    btnPlay.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().catch(() => {
          // No audio source loaded — silently fail
        });
      } else {
        audio.pause();
      }
    });

    audio.addEventListener('play', () => {
      iconPlay.style.display = 'none';
      iconPause.style.display = 'block';
    });

    audio.addEventListener('pause', () => {
      iconPlay.style.display = 'block';
      iconPause.style.display = 'none';
    });

    // Update progress
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = `${pct}%`;
        timeCurrent.textContent = formatTime(audio.currentTime);
        progressWrap.setAttribute('aria-valuenow', Math.round(pct));
      }
    });

    // Total duration
    audio.addEventListener('loadedmetadata', () => {
      timeTotal.textContent = formatTime(audio.duration);
    });

    // Seek on click
    progressWrap.addEventListener('click', (e) => {
      if (audio.duration) {
        const rect = progressWrap.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pct * audio.duration;
      }
    });

    // Keyboard support for slider
    progressWrap.addEventListener('keydown', (e) => {
      if (!audio.duration) return;
      const step = audio.duration * 0.02; // 2% per key press
      if (e.key === 'ArrowRight') {
        audio.currentTime = Math.min(audio.currentTime + step, audio.duration);
      } else if (e.key === 'ArrowLeft') {
        audio.currentTime = Math.max(audio.currentTime - step, 0);
      }
    });
  }

  // ===========================
  // 4. Smooth scroll for CTA
  // ===========================
  const heroCta = document.getElementById('hero-cta');
  if (heroCta) {
    heroCta.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('audio');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // ===========================
  // 5. Parallax on scroll (subtle)
  // ===========================
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const starsSmall = document.getElementById('stars-small');
        const starsMedium = document.getElementById('stars-medium');
        const starsLarge = document.getElementById('stars-large');

        if (starsSmall) starsSmall.style.transform = `translateY(${scrollY * 0.05}px)`;
        if (starsMedium) starsMedium.style.transform = `translateY(${scrollY * 0.1}px)`;
        if (starsLarge) starsLarge.style.transform = `translateY(${scrollY * 0.15}px)`;

        ticking = false;
      });
      ticking = true;
    }
  }

  // Only enable parallax on larger screens (performance)
  if (window.matchMedia('(min-width: 768px)').matches) {
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ===========================
  // 6. Ambient & UI Sounds
  // ===========================

  // -- Ambient Sound --
  const ambientAudio = new Audio('assets/sounds/ambince sound_2.mp3');
  ambientAudio.volume = 0.15; // Low volume
  ambientAudio.loop = true;

  // Attempt autoplay, fallback to playing on first interaction if blocked
  const playAmbient = () => {
    if (ambientAudio.paused) {
      ambientAudio.play().catch(e => {
        // Autoplay policy prevented playback, we wait for user interaction
        console.log('Autoplay prevented, waiting for interaction...', e);
      });
    }
  };

  playAmbient();

  // -- Pluck Hover Sound --
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioCtx;
  let pluckBuffer = null;

  // Load decode audio on first interaction to comply with AudioContext policies
  const initAudioCtx = () => {
    if (!audioCtx) {
      audioCtx = new AudioContext();
      fetch('assets/sounds/pluck hover sound.mp3')
        .then(res => res.arrayBuffer())
        .then(data => audioCtx.decodeAudioData(data))
        .then(buffer => {
          pluckBuffer = buffer;
        })
        .catch(err => console.error('Error loading hover sound:', err));
    } else if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  };

  const startAudioOnInteraction = () => {
    playAmbient();
    initAudioCtx();
  };

  const introOverlay = document.getElementById('intro-overlay');
  const introBtn = document.getElementById('intro-btn');
  const mainContent = document.getElementById('main-content');

  if (introBtn && introOverlay) {
    introBtn.addEventListener('click', () => {
      introOverlay.classList.add('hidden');
      if (mainContent) mainContent.classList.remove('hidden');
      document.body.classList.remove('intro-active');
      startAudioOnInteraction();
    });
  } else {
    // Fallback if overlay is not present
    ['click', 'scroll', 'touchstart', 'mousemove'].forEach(evt => {
      document.body.addEventListener(evt, startAudioOnInteraction, { once: true });
    });
  }

  function playPluck() {
    if (!audioCtx || !pluckBuffer) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const source = audioCtx.createBufferSource();
    source.buffer = pluckBuffer;
    
    // Slight random pitch variation (between ~0.9x and ~1.1x speed)
    source.playbackRate.value = 0.9 + Math.random() * 0.2;

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.3; // Pluck volume

    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    source.start(0);
  }

  // Attach pluck sound to interactive elements
  const hoverElements = document.querySelectorAll('a, button, .hero__cta, .link-card');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', playPluck);
  });

})();
