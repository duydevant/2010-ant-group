// ========================================================
// 20/10 SLIDER SHOWCASE - CORE ENGINE (APP.JS)
// Focus: 100% on Crisp Photos & Banners • Zero Text Clutter
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  // ---- BUILD UNIFIED SLIDES LIST ----
  // Sequence: Dept Banner -> Dept Photos -> Next Dept Banner -> ... -> Gift Box
  const slides = [];

  DEPARTMENTS_DATA.forEach((dept, dIdx) => {
    // 1. Department Banner Slide
    slides.push({
      type: 'banner',
      deptIndex: dIdx,
      deptName: dept.name,
      duration: 2200
    });

    // 2. Department Photo Slides (100% pure photo, zero text)
    dept.members.forEach((member) => {
      slides.push({
        type: 'photo',
        deptIndex: dIdx,
        deptName: dept.name,
        image: member.image
      });
    });
  });

  // 3. Finale Gift Box Slide
  slides.push({
    type: 'gift',
    deptName: 'PHẦN QUÀ 20/10'
  });

  // ---- STATE ----
  let currentSlideIndex = 0;
  let isAutoPlaying = true;
  let slideDuration = 4000; // ms per photo
  let slideStartTime = Date.now();
  let animFrameId = null;
  let soundEnabled = true;

  // ---- DOM ELEMENTS ----
  const progressFill = document.getElementById('progress-fill');
  const quickDeptNav = document.getElementById('quick-dept-nav');
  const btnReplayShow = document.getElementById('btn-replay-show');
  const btnSound = document.getElementById('btn-sound');
  const iconVolOn = document.querySelector('.icon-vol-on');
  const iconVolOff = document.querySelector('.icon-vol-off');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const btnGiftShortcut = document.getElementById('btn-gift-shortcut');

  const btnPrevSlide = document.getElementById('btn-prev-slide');
  const btnNextSlide = document.getElementById('btn-next-slide');

  const ambientPhotoGlow = document.getElementById('ambient-photo-glow');
  const slideTypeBanner = document.getElementById('slide-type-banner');
  const bannerTitle = document.getElementById('banner-title');

  const slideTypePhoto = document.getElementById('slide-type-photo');
  const purePhoto = document.getElementById('pure-photo');

  const slideTypeGift = document.getElementById('slide-type-gift');
  const giftPromptState = document.getElementById('gift-prompt-state');
  const giftVideoState = document.getElementById('gift-video-state');
  const clickableGiftBox = document.getElementById('clickable-gift-box');
  const theatreVideo = document.getElementById('theatre-video');
  const btnReplayVideo = document.getElementById('btn-replay-video');
  const btnRestartShow = document.getElementById('btn-restart-show');

  const slideIndicator = document.getElementById('slide-indicator');
  const deptBadgeLabel = document.getElementById('dept-badge-label');
  const btnPlayPause = document.getElementById('btn-play-pause');
  const iconPause = document.querySelector('.icon-pause');
  const iconPlay = document.querySelector('.icon-play');
  const speedButtons = document.querySelectorAll('.speed-opt');

  // ---- AUDIO SYNTHESIZER ----
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSoftChime() {
    if (!soundEnabled || !audioCtx) return;
    try {
      const notes = [659.25, 830.61, 987.77];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + idx * 0.08);
        osc.stop(audioCtx.currentTime + idx * 0.08 + 0.4);
      });
    } catch (e) {}
  }

  function playGiftOpenSound() {
    if (!soundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.35);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  }

  // ---- QUICK DEPARTMENT NAVIGATION PILLS ----
  function renderDeptNav() {
    quickDeptNav.innerHTML = '';
    DEPARTMENTS_DATA.forEach((dept, idx) => {
      const btn = document.createElement('button');
      btn.className = 'dept-pill-btn';
      btn.textContent = dept.name;
      btn.addEventListener('click', () => {
        initAudio();
        jumpToDeptBanner(idx);
      });
      quickDeptNav.appendChild(btn);
    });
  }

  function updateDeptNavActive(deptName) {
    const btns = quickDeptNav.querySelectorAll('.dept-pill-btn');
    btns.forEach(btn => {
      btn.classList.toggle('active', btn.textContent === deptName);
    });
  }

  function jumpToDeptBanner(deptIdx) {
    const targetIdx = slides.findIndex(s => s.type === 'banner' && s.deptIndex === deptIdx);
    if (targetIdx !== -1) {
      currentSlideIndex = targetIdx;
      renderCurrentSlide();
    }
  }

  // ---- RENDER CURRENT SLIDE ----
  function renderCurrentSlide() {
    const slide = slides[currentSlideIndex];
    if (!slide) return;

    // Reset progress
    slideStartTime = Date.now();
    progressFill.style.width = '0%';

    // Update footer indicators
    slideIndicator.textContent = `${currentSlideIndex + 1} / ${slides.length}`;
    deptBadgeLabel.textContent = slide.deptName.toUpperCase();
    updateDeptNavActive(slide.deptName);

    // Hide all slide types first
    slideTypeBanner.classList.add('hidden');
    slideTypePhoto.classList.add('hidden');
    slideTypeGift.classList.add('hidden');

    if (slide.type === 'banner') {
      // 1. BANNER SLIDE: ONLY DEPT NAME
      bannerTitle.textContent = slide.deptName.toUpperCase();
      ambientPhotoGlow.style.backgroundImage = 'none';
      slideTypeBanner.classList.remove('hidden');
      playSoftChime();

    } else if (slide.type === 'photo') {
      // 2. PHOTO SLIDE: 100% PURE CRISP PHOTO
      purePhoto.classList.add('entering');
      // Add timestamp query to bypass browser cache when files are updated on disk
      const imgUrl = `${slide.image}?t=${Date.now()}`;
      purePhoto.src = imgUrl;
      purePhoto.alt = slide.deptName;
      ambientPhotoGlow.style.backgroundImage = `url("${imgUrl}")`;

      setTimeout(() => {
        purePhoto.classList.remove('entering');
      }, 100);

      slideTypePhoto.classList.remove('hidden');

    } else if (slide.type === 'gift') {
      // 3. GIFT BOX SLIDE
      pauseSlideshow();
      ambientPhotoGlow.style.backgroundImage = 'none';
      slideTypeGift.classList.remove('hidden');

      // Reset gift state to box waiting to be opened
      giftPromptState.classList.remove('hidden');
      giftVideoState.classList.add('hidden');
      clickableGiftBox.classList.remove('opened');
      theatreVideo.pause();
      theatreVideo.currentTime = 0;
    }
  }

  // ---- PROGRESS BAR & SLIDESHOW ENGINE ----
  function tickSlider() {
    const slide = slides[currentSlideIndex];
    if (isAutoPlaying && slide && slide.type !== 'gift') {
      const dur = (slide.type === 'banner') ? slide.duration : slideDuration;
      const elapsed = Date.now() - slideStartTime;
      const pct = Math.min((elapsed / dur) * 100, 100);
      progressFill.style.width = `${pct}%`;

      if (elapsed >= dur) {
        nextSlide();
      }
    }
    animFrameId = requestAnimationFrame(tickSlider);
  }

  function nextSlide() {
    if (currentSlideIndex < slides.length - 1) {
      currentSlideIndex++;
      renderCurrentSlide();
    } else {
      // Reached the end (gift box)
      renderCurrentSlide();
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
    } else {
      currentSlideIndex = slides.length - 1;
    }
    renderCurrentSlide();
  }

  // ---- REPLAY PRESENTATION FROM START ----
  function replayShowFromStart() {
    initAudio();
    theatreVideo.pause();
    currentSlideIndex = 0;
    resumeSlideshow();
    renderCurrentSlide();
  }

  btnReplayShow.addEventListener('click', replayShowFromStart);
  btnRestartShow.addEventListener('click', replayShowFromStart);

  // ---- GIFT BOX INTERACTION (CLICK TO OPEN VIDEO) ----
  clickableGiftBox.addEventListener('click', () => {
    initAudio();
    playGiftOpenSound();
    clickableGiftBox.classList.add('opened');

    setTimeout(() => {
      giftPromptState.classList.add('hidden');
      giftVideoState.classList.remove('hidden');
      theatreVideo.currentTime = 0;
      theatreVideo.play().catch(e => {
        console.log('Video gesture policy', e);
      });
    }, 600);
  });

  btnReplayVideo.addEventListener('click', () => {
    theatreVideo.currentTime = 0;
    theatreVideo.play();
  });

  btnGiftShortcut.addEventListener('click', () => {
    initAudio();
    currentSlideIndex = slides.length - 1;
    renderCurrentSlide();
  });

  // ---- PLAY / PAUSE CONTROLS ----
  function togglePlayPause() {
    if (isAutoPlaying) {
      pauseSlideshow();
    } else {
      resumeSlideshow();
    }
  }

  function pauseSlideshow() {
    isAutoPlaying = false;
    iconPause.classList.add('hidden');
    iconPlay.classList.remove('hidden');
  }

  function resumeSlideshow() {
    isAutoPlaying = true;
    slideStartTime = Date.now();
    iconPause.classList.remove('hidden');
    iconPlay.classList.add('hidden');
  }

  btnPlayPause.addEventListener('click', () => {
    initAudio();
    togglePlayPause();
  });

  btnPrevSlide.addEventListener('click', () => {
    initAudio();
    prevSlide();
  });

  btnNextSlide.addEventListener('click', () => {
    initAudio();
    nextSlide();
  });

  // Speed selector
  speedButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      speedButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      slideDuration = parseInt(btn.dataset.speed, 10);
      slideStartTime = Date.now();
    });
  });

  // Sound toggle
  btnSound.addEventListener('click', () => {
    initAudio();
    soundEnabled = !soundEnabled;
    iconVolOn.classList.toggle('hidden', !soundEnabled);
    iconVolOff.classList.toggle('hidden', soundEnabled);
  });

  // Fullscreen
  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Keyboard Navigation
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      initAudio();
      togglePlayPause();
    } else if (e.code === 'ArrowRight') {
      initAudio();
      nextSlide();
    } else if (e.code === 'ArrowLeft') {
      initAudio();
      prevSlide();
    } else if (e.code === 'KeyF') {
      btnFullscreen.click();
    } else if (e.code === 'KeyV') {
      initAudio();
      btnGiftShortcut.click();
    } else if (e.code === 'Home') {
      replayShowFromStart();
    }
  });

  // Initialize
  renderDeptNav();
  renderCurrentSlide();
  tickSlider();
});
