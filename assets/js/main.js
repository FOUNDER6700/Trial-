/**
 * CINEMATIC SCROLL-DRIVEN PORTFOLIO — MAIN APPLICATION & MOTION CONTROLLER
 * - Genuine scroll-scrubbed timelines powered by GSAP + ScrollTrigger
 * - Mobile-first Android performance optimizations (ignoreMobileResize, matchMedia)
 * - Full progressive enhancement fallback if GSAP fails or reduced motion is active
 */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. UI UTILITIES & MOBILE NAVIGATION (Runs even without GSAP)
     ------------------------------------------------------------------------ */
  function initNavigationAndUtilities() {
    var yearEl = document.getElementById('current-year');
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }

    var navToggle = document.getElementById('nav-toggle');
    var primaryNav = document.getElementById('primary-nav');
    var navLinks = document.querySelectorAll('[data-nav-link]');

    if (!navToggle || !primaryNav) return;

    function closeMenu() {
      navToggle.setAttribute('aria-expanded', 'false');
      primaryNav.classList.remove('is-open');
    }

    navToggle.addEventListener('click', function () {
      var isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isExpanded));
      primaryNav.classList.toggle('is-open', !isExpanded);
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });
  }

  /* ------------------------------------------------------------------------
     2. GSAP & SCROLLTRIGGER CHOREOGRAPHY
     ------------------------------------------------------------------------ */
  function initScrollChoreography() {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fallback gracefully if reduced motion is enabled or GSAP CDN failed to load
    if (prefersReducedMotion || typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
      var progressBarFallback = document.getElementById('scroll-progress-bar');
      if (progressBarFallback) {
        progressBarFallback.style.transform = 'scaleX(1)';
      }
      return;
    }

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    // Prevent mobile browser address-bar resize jumps on Android
    ScrollTrigger.config({
      ignoreMobileResize: true,
      limitCallbacks: true
    });

    /* --- Global Page Scroll Progress Bar --- */
    gsap.to('#scroll-progress-bar', {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.15
      }
    });

    /* --- Chapter 1: Hero Entrance & Scroll-Linked Exit --- */
    var heroWords = gsap.utils.toArray('[data-hero-word]');
    var heroMeta = document.querySelector('[data-hero-meta]');
    var heroLead = document.querySelector('[data-hero-lead]');
    var heroCta = document.querySelector('[data-hero-cta]');

    var heroIntroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroIntroTl
      .fromTo(heroMeta, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 })
      .fromTo(
        heroWords,
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.75, stagger: 0.09 },
        '-=0.3'
      )
      .fromTo(
        [heroLead, heroCta],
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
        '-=0.4'
      );

    // Continuous scroll-linked hero timeline as the visitor scrolls toward Chapter 2
    var heroScrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.4
      }
    });

    heroScrollTl
      .to('.hero-headline', { yPercent: -22, scale: 0.94, opacity: 0.15, ease: 'none' }, 0)
      .to('.hero-bottom-grid', { yPercent: -15, opacity: 0, ease: 'none' }, 0)
      .to('.hero-ring--outer', { rotation: 45, scale: 1.18, ease: 'none' }, 0)
      .to('.hero-ring--inner', { rotation: -60, scale: 0.86, ease: 'none' }, 0)
      .to('#scroll-cue', { opacity: 0, y: 12, ease: 'none' }, 0);

    /* --- Responsive Timelines via gsap.matchMedia() --- */
    var mm = gsap.matchMedia();

    mm.add(
      {
        isMobile: '(max-width: 899px)',
        isDesktop: '(min-width: 900px)'
      },
      function (context) {
        var isMobile = context.conditions.isMobile;

        /* ==================================================================
           CHAPTER 2: PINNED 3D ARTIFACT TIMELINE (Scroll-Scrubbed)
           Uses a compact scroll distance on mobile (+=135%) so Android users
           experience smooth 3D scroll control without getting trapped.
           ================================================================== */
        var stageCards = gsap.utils.toArray('[data-artifact-stage]');
        var readoutEl = document.getElementById('artifact-readout');

        function setActiveStageCard(activeIndex) {
          stageCards.forEach(function (card, idx) {
            card.classList.toggle('is-active', idx === activeIndex);
          });
        }

        var artifactTl = gsap.timeline({
          scrollTrigger: {
            trigger: '#artifact-pin-wrap',
            start: 'top top',
            end: isMobile ? '+=135%' : '+=210%',
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
            onUpdate: function (self) {
              var pct = Math.round(self.progress * 100);
              if (readoutEl) {
                readoutEl.textContent = String(pct).padStart(3, '0') + '%';
              }
              if (self.progress < 0.34) {
                setActiveStageCard(0);
              } else if (self.progress < 0.68) {
                setActiveStageCard(1);
              } else {
                setActiveStageCard(2);
              }
            }
          }
        });

        // Phase 1 -> Phase 2 -> Phase 3 continuous 3D rotation, scale, and lighting
        artifactTl
          .fromTo(
            '#prism-assembly',
            { rotateX: -24, rotateY: 28, rotateZ: 0, scale: 0.72 },
            { rotateX: 18, rotateY: 195, rotateZ: 14, scale: isMobile ? 1.08 : 1.24, ease: 'none', duration: 1 },
            0
          )
          .to(
            '#prism-assembly',
            { rotateX: -32, rotateY: 360, rotateZ: -12, scale: 0.92, ease: 'none', duration: 1 },
            1
          )
          .fromTo(
            '#artifact-halo',
            { scale: 0.65, opacity: 0.3 },
            { scale: 1.35, opacity: 0.95, ease: 'none', duration: 1 },
            0
          )
          .to(
            '#artifact-halo',
            { scale: 0.85, opacity: 0.4, ease: 'none', duration: 1 },
            1
          )
          .to('#orbit-ring-1', { rotation: 140, scale: 1.12, ease: 'none', duration: 2 }, 0)
          .to('#orbit-ring-2', { rotation: -120, scale: 0.9, ease: 'none', duration: 2 }, 0)
          .to('#orbit-ring-3', { rotation: 200, scale: 1.18, ease: 'none', duration: 2 }, 0);

        /* ==================================================================
           CHAPTER 3: SELECTED PROJECTS (Coordinated Scroll Timelines)
           ================================================================== */
        var projectEntries = gsap.utils.toArray('[data-project-entry]');

        projectEntries.forEach(function (entry) {
          var frame = entry.querySelector('[data-project-frame]');
          var img = entry.querySelector('[data-project-img]');
          var info = entry.querySelector('[data-project-info]');

          var projectTl = gsap.timeline({
            scrollTrigger: {
              trigger: entry,
              start: 'top 88%',
              end: 'bottom 20%',
              scrub: 0.4
            }
          });

          projectTl
            .fromTo(
              frame,
              { y: isMobile ? 28 : 48, opacity: 0.25 },
              { y: 0, opacity: 1, duration: 0.45, ease: 'none' },
              0
            )
            .fromTo(
              img,
              { scale: 1.16, yPercent: -6 },
              { scale: 1.0, yPercent: 6, duration: 1, ease: 'none' },
              0
            )
            .fromTo(
              info,
              { y: isMobile ? 20 : 40, opacity: 0.2 },
              { y: 0, opacity: 1, duration: 0.5, ease: 'none' },
              0.08
            );
        });

        /* ==================================================================
           CHAPTER 4: ABOUT & CREATIVE PROCESS TIMELINE
           ================================================================== */
        gsap.fromTo(
          '#process-rail-fill',
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '#process-timeline',
              start: 'top 75%',
              end: 'bottom 55%',
              scrub: 0.35
            }
          }
        );

        var processSteps = gsap.utils.toArray('[data-process-step]');
        processSteps.forEach(function (step) {
          gsap.fromTo(
            step,
            { y: 26, opacity: 0.2 },
            {
              y: 0,
              opacity: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: step,
                start: 'top 88%',
                end: 'top 58%',
                scrub: 0.3
              }
            }
          );
        });

        gsap.to('[data-process-bg]', {
          yPercent: -24,
          rotation: 35,
          ease: 'none',
          scrollTrigger: {
            trigger: '#process',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5
          }
        });

        /* ==================================================================
           CHAPTER 5: CONTACT FINALE SCROLL SEQUENCE
           ================================================================== */
        var contactTl = gsap.timeline({
          scrollTrigger: {
            trigger: '#contact',
            start: 'top 82%',
            end: 'bottom bottom',
            scrub: 0.4
          }
        });

        contactTl
          .fromTo(
            '#contact-flare',
            { scale: 0.65, opacity: 0.2 },
            { scale: 1.15, opacity: 1, ease: 'none' },
            0
          )
          .fromTo(
            '[data-contact-headline]',
            { y: 36, opacity: 0.25 },
            { y: 0, opacity: 1, ease: 'none' },
            0
          );
      }
    );

    // Refresh ScrollTrigger accurately on orientation changes
    var resizeTimer;
    window.addEventListener('orientationchange', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        ScrollTrigger.refresh();
      }, 250);
    });
  }

  /* ------------------------------------------------------------------------
     3. INITIALIZATION ENTRY POINT
     ------------------------------------------------------------------------ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initNavigationAndUtilities();
      initScrollChoreography();
    });
  } else {
    initNavigationAndUtilities();
    initScrollChoreography();
  }
})();
      
