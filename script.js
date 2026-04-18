/* ==========================================================================
   EVERYTHING MEDIA — SCRIPT
   Viewfinder cursor · hero hard-cuts · timecode nav · form · reveals
   ========================================================================== */

(() => {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    const isSmall = window.innerWidth <= 768;

    /* ---------- PRELOADER ---------- */
    const preloader = document.getElementById('preloader');
    const MIN_PRELOAD = 1700;
    const start = Date.now();

    const finishPreload = () => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, MIN_PRELOAD - elapsed);
        setTimeout(() => {
            preloader.classList.add('done');
            document.body.classList.add('loaded');
            initHeroStills();
        }, remaining);
    };

    if (document.readyState === 'complete') {
        finishPreload();
    } else {
        window.addEventListener('load', finishPreload);
    }

    /* ---------- HERO STILLS — HARD CUTS WITH 1-FRAME WHITE FLASH ---------- */
    function initHeroStills() {
        const stills = document.querySelectorAll('.hero-still');
        const metaEl = document.getElementById('hero-meta');
        if (!stills.length) return;

        let i = 0;
        const setActive = (n) => {
            stills.forEach((s, k) => {
                if (k === n) {
                    s.classList.add('active', 'flash');
                    if (metaEl) metaEl.textContent = s.dataset.meta || '';
                    setTimeout(() => s.classList.remove('flash'), 150);
                } else {
                    s.classList.remove('active');
                }
            });
        };
        setActive(0);

        if (reducedMotion) return;
        setInterval(() => {
            i = (i + 1) % stills.length;
            setActive(i);
        }, 4600);
    }

    /* ---------- VIEWFINDER CURSOR ---------- */
    const cursor = document.getElementById('cursor-brackets');

    if (!isTouch && !reducedMotion && cursor) {
        let mx = window.innerWidth / 2;
        let my = window.innerHeight / 2;
        let cx = mx, cy = my;

        window.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
        });

        const lerp = (a, b, t) => a + (b - a) * t;
        const tick = () => {
            cx = lerp(cx, mx, 0.22);
            cy = lerp(cy, my, 0.22);
            cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);

        document.querySelectorAll('[data-cursor]').forEach((el) => {
            el.addEventListener('mouseenter', () => cursor.classList.add('expanded'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('expanded'));
        });

        document.querySelectorAll('a:not([data-cursor]), button:not([data-cursor]), input, textarea, select').forEach((el) => {
            el.addEventListener('mouseenter', () => cursor.classList.add('link'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('link'));
        });

        document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
        document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
    } else if (cursor) {
        cursor.remove();
        document.body.style.cursor = 'auto';
    }

    /* ---------- SCROLL PROGRESS + NAV + TIMECODE ---------- */
    const scrollProgress = document.getElementById('scroll-progress');
    const nav = document.getElementById('nav');
    const navTimecode = document.getElementById('nav-timecode');

    const formatTimecode = (progress) => {
        // progress 0..1 → 00:00:00 to ~02:30:00 (a full-length feel)
        const total = Math.round(progress * 9000); // 0..9000 = 2h30m in seconds
        const h = Math.floor(total / 3600).toString().padStart(2, '0');
        const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(total % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const p = Math.min(1, Math.max(0, y / max));
            scrollProgress.style.height = (p * 100) + 'vh';

            if (navTimecode) navTimecode.textContent = formatTimecode(p);

            if (y > 120) {
                nav.classList.add('visible');
                if (y > 280) nav.classList.add('scrolled');
                else nav.classList.remove('scrolled');
            } else {
                nav.classList.remove('visible', 'scrolled');
            }

            ticking = false;
        });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ---------- MOBILE MENU ---------- */
    const mobileToggle = document.getElementById('nav-mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuClose = document.getElementById('menu-close');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    const openMenu = () => {
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    };

    if (mobileToggle) mobileToggle.addEventListener('click', openMenu);
    if (menuClose) menuClose.addEventListener('click', closeMenu);
    mobileLinks.forEach((a) => a.addEventListener('click', closeMenu));

    /* ---------- INTERSECTION OBSERVER — REVEALS ---------- */
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add('in-view');
        });
    }, { threshold: 0.15, rootMargin: '-6% 0px -6% 0px' });

    document.querySelectorAll([
        '.section-head',
        '.positioning-body p',
        '.work-tile',
        '.cap-item',
        '.method-step',
        '.mani-line',
        '.manifesto'
    ].join(',')).forEach((el) => io.observe(el));

    /* ---------- FORM ---------- */
    const form = document.getElementById('contact-form');
    const statusEl = document.getElementById('form-status');
    const submitBtn = form ? form.querySelector('.submit-btn') : null;

    const fields = form ? form.querySelectorAll('input, textarea, select') : [];
    fields.forEach((field) => {
        const parent = field.closest('.form-field');
        const check = () => {
            if (field.value && field.value.trim() !== '') parent.classList.add('has-value');
            else parent.classList.remove('has-value');
        };
        field.addEventListener('input', check);
        field.addEventListener('change', check);
        check();
    });

    const setStatus = (msg, type) => {
        if (!statusEl) return;
        statusEl.textContent = msg;
        statusEl.classList.remove('success', 'error');
        if (type) statusEl.classList.add(type);
        statusEl.classList.add('visible');
    };

    const submitForm = async (data) => {
        // DEFAULT: mailto — works on day one, no backend.
        // Replace with a real backend (Formspree, Resend, Vercel function) when ready.
        const subject = `New project — ${data.company || data.name}`;
        const body = [
            `Name: ${data.name}`,
            `Company / project: ${data.company || '—'}`,
            `Email: ${data.email}`,
            `Type: ${data.type}`,
            '',
            data.message
        ].join('\n');
        window.location.href = `mailto:hello@everythingmedia.studio?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        return { ok: true };
    };

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                name: form.elements['name'].value.trim(),
                company: form.elements['company'].value.trim(),
                email: form.elements['email'].value.trim(),
                type: form.elements['type'].value,
                message: form.elements['message'].value.trim()
            };

            if (!data.name || !data.email || !data.type || !data.message) {
                setStatus('please fill in the required fields.', 'error');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                setStatus('that email doesn\'t look right.', 'error');
                return;
            }

            submitBtn.classList.add('sending');
            setStatus('opening your email…', null);

            try {
                const res = await submitForm(data);
                if (res.ok) {
                    setStatus('sent. we\'ll reply soon.', 'success');
                    form.reset();
                    fields.forEach((f) => f.closest('.form-field').classList.remove('has-value'));
                } else {
                    setStatus('something went wrong. write us directly at hello@everythingmedia.studio', 'error');
                }
            } catch (err) {
                setStatus('something went wrong. write us directly at hello@everythingmedia.studio', 'error');
            } finally {
                submitBtn.classList.remove('sending');
            }
        });
    }

    /* ---------- SMOOTH ANCHOR SCROLL ---------- */
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('href');
            if (id.length <= 1) return;
            const t = document.querySelector(id);
            if (t) {
                e.preventDefault();
                t.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
            }
        });
    });

})();
