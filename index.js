/* ===== NeerajOS — Portfolio Engine ===== */

(function () {
    'use strict';

    /* ================================================================
       SECURITY: HTML escape utility to prevent XSS
       ================================================================ */
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /* ================================================================
       BOOT SEQUENCE
       ================================================================ */
    const ASCII_ART = `
 ███╗   ██╗███████╗███████╗██████╗  █████╗      ██╗ ██████╗ ███████╗
 ████╗  ██║██╔════╝██╔════╝██╔══██╗██╔══██╗     ██║██╔═══██╗██╔════╝
 ██╔██╗ ██║█████╗  █████╗  ██████╔╝███████║     ██║██║   ██║███████╗
 ██║╚██╗██║██╔══╝  ██╔══╝  ██╔══██╗██╔══██║██   ██║██║   ██║╚════██║
 ██║ ╚████║███████╗███████╗██║  ██║██║  ██║╚█████╔╝╚██████╔╝███████║
 ╚═╝  ╚═══╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚════╝  ╚═════╝ ╚══════╝`;

    const BOOT_MESSAGES = [
        { text: '  Starting NeerajOS kernel v1.0...', prefix: 'ok' },
        { text: '  Loading system modules...', prefix: 'ok' },
        { text: '  Mounting portfolio filesystem...', prefix: 'ok' },
        { text: '  Initializing GPU compositor...', prefix: 'ok' },
        { text: '  Loading skills.db .............. 8 categories found', prefix: 'ok' },
        { text: '  Loading projects.db ............ 5 projects loaded', prefix: 'ok' },
        { text: '  Loading certifications.db ...... 8 credentials verified', prefix: 'ok' },
        { text: '  Starting window manager...', prefix: 'ok' },
        { text: '  Connecting to github.com/neerajsait ...', prefix: 'ok' },
        { text: '  Loading desktop environment...', prefix: 'ok' },
        { text: '  System ready — Welcome, visitor!', prefix: 'done' }
    ];

    function startBoot() {
        const bootScreen = document.getElementById('boot-screen');
        const asciiEl = document.getElementById('boot-ascii');
        const logEl = document.getElementById('boot-log');
        const barEl = document.getElementById('boot-bar');
        const statusEl = document.getElementById('boot-status');

        // Typewriter ASCII art
        let idx = 0;
        const text = ASCII_ART;
        const typeSpeed = 2;
        const asciiTimer = setInterval(() => {
            // Add multiple chars per frame for speed
            const chunk = text.substring(idx, idx + 3);
            asciiEl.textContent += chunk;
            idx += 3;
            if (idx >= text.length) {
                asciiEl.textContent = text;
                clearInterval(asciiTimer);
            }
        }, typeSpeed);

        // Boot log messages
        let msgIdx = 0;
        const total = BOOT_MESSAGES.length;
        const logTimer = setInterval(() => {
            if (msgIdx >= total) {
                clearInterval(logTimer);
                barEl.style.width = '100%';
                statusEl.textContent = '✓ Welcome to NeerajOS';
                statusEl.style.textShadow = '0 0 20px rgba(0,229,255,0.5)';

                setTimeout(() => {
                    bootScreen.classList.add('fade-out');
                    setTimeout(() => {
                        bootScreen.style.display = 'none';
                        document.getElementById('desktop').classList.remove('hidden');
                        initDesktop();
                    }, 1000);
                }, 700);
                return;
            }

            const msg = BOOT_MESSAGES[msgIdx];
            const div = document.createElement('div');
            const prefix = msg.prefix === 'done'
                ? '<span class="done-prefix">[ DONE ]</span>'
                : '<span class="ok-prefix">[  OK  ]</span>';
            div.innerHTML = prefix + msg.text;
            logEl.appendChild(div);
            logEl.scrollTop = logEl.scrollHeight;

            barEl.style.width = ((msgIdx + 1) / total * 100) + '%';
            statusEl.textContent = msg.text.replace(/^\s+/, '').replace(/\.+.*$/, '...');
            msgIdx++;
        }, 260);

        // Visitor counter — increment once per session
        if (!sessionStorage.getItem('neerajOS_counted')) {
            const count = (parseInt(localStorage.getItem('neerajOS_visits') || '0', 10)) + 1;
            localStorage.setItem('neerajOS_visits', count);
            sessionStorage.setItem('neerajOS_counted', '1');
        }
        const visitorCount = parseInt(localStorage.getItem('neerajOS_visits') || '1', 10);
        const visitorEl = document.getElementById('boot-visitor');
        setTimeout(() => {
            visitorEl.textContent = '👤 You are visitor #' + visitorCount.toLocaleString();
        }, BOOT_MESSAGES.length * 260 - 400);
    }

    /* ================================================================
       DESKTOP INIT
       ================================================================ */
    const isMobile = window.matchMedia('(max-width: 768px)').matches
        || 'ontouchstart' in window;

    function initDesktop() {
        initBackground();
        initClock();
        initIcons();
        initStartMenu();
        initTerminal();
        setupWindowControls();
        fetchGitHubStats();
        initMatrixName();
        initASCIIPortrait();
        initCertCards();

        // Auto-open About Me on every load
        setTimeout(() => openWindow('about'), 400);
    }

    /* ================================================================
       CERT CARD CLICK HANDLERS (moved from inline onclick for CSP)
       ================================================================ */
    function initCertCards() {
        document.querySelectorAll('.cert-card[data-cert-url]').forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                window.open(card.dataset.certUrl, '_blank', 'noopener,noreferrer');
            });
        });
    }

    /* ================================================================
       MATRIX NAME REVEAL — characters scramble then resolve
       ================================================================ */
    function initMatrixName() {
        const NAME = 'NEERAJ VENKATA SAI';
        const TAGLINE = 'Full-Stack Developer • Cybersecurity Enthusiast';
        const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const nameEl = document.getElementById('matrix-name');
        const tagEl = document.getElementById('matrix-tagline');

        function scrambleReveal(el, finalText, startDelay, speed) {
            const chars = finalText.split('');
            const resolved = new Array(chars.length).fill(false);
            let iterations = 0;

            setTimeout(() => {
                const interval = setInterval(() => {
                    let html = '';
                    for (let i = 0; i < chars.length; i++) {
                        if (resolved[i]) {
                            html += `<span class="resolved-char">${chars[i]}</span>`;
                        } else if (chars[i] === ' ') {
                            html += ' ';
                            resolved[i] = true;
                        } else {
                            html += `<span class="scramble-char">${GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]}</span>`;
                        }
                    }
                    el.innerHTML = html;

                    // Resolve characters from left to right, one per cycle
                    const nextToResolve = resolved.indexOf(false);
                    if (nextToResolve !== -1 && iterations > 3) {
                        resolved[nextToResolve] = true;
                    }

                    iterations++;
                    if (resolved.every(Boolean)) {
                        clearInterval(interval);
                        el.innerHTML = finalText.split('').map(c =>
                            `<span class="resolved-char">${c}</span>`
                        ).join('');
                    }
                }, speed);
            }, startDelay);
        }

        scrambleReveal(nameEl, NAME, 800, 50);
        scrambleReveal(tagEl, TAGLINE, 2200, 35);
    }

    /* ================================================================
       ASCII ART PORTRAIT — line-by-line reveal
       ================================================================ */
    function initASCIIPortrait() {
        const PORTRAIT = [
            '          ▄▄▄▄▄▄▄▄▄▄▄          ',
            '       ▄██████████████▄        ',
            '     ▄████████████████████▄     ',
            '    ████████████████████████    ',
            '   ██████▀▀▀▀████▀▀▀▀██████   ',
            '   █████      ████     █████   ',
            '   ████  ◉     ██  ◉   ████   ',
            '   ████        ▀▀      ████   ',
            '    ████   ▄      ▄   ████    ',
            '     ████  ╰──────╯  ████     ',
            '      ▀████▄▄▄▄▄▄▄▄████▀      ',
            '        ▀▀████████████▀▀       ',
            '           ▀▀████▀▀            ',
            '         ╔════╧══╧════╗        ',
            '        ╔╝ ░░░░░░░░░░ ╚╗       ',
            '       ╔╝ ░░╔══════╗░░ ╚╗      ',
            '      ╔╝ ░░░║▓▓▓▓▓▓║░░░ ╚╗     ',
            '      ║ ░░░░║▓▓▓▓▓▓║░░░░ ║     ',
            '      ║ ░░░░║▓▓▓▓▓▓║░░░░ ║     ',
            '      ╚═░░░░╚══════╝░░░░═╝     '
        ];

        const el = document.getElementById('ascii-portrait');
        let lineIdx = 0;

        setTimeout(() => {
            const timer = setInterval(() => {
                if (lineIdx >= PORTRAIT.length) {
                    clearInterval(timer);
                    el.classList.add('revealed');
                    return;
                }
                el.textContent += (lineIdx > 0 ? '\n' : '') + PORTRAIT[lineIdx];
                lineIdx++;
            }, 80);
        }, 600);
    }

    /* ================================================================
       GITHUB STATS (Public API — no auth needed)
       ================================================================ */
    function fetchGitHubStats() {
        fetch('https://api.github.com/users/neerajsait')
            .then(r => {
                if (!r.ok) throw new Error('GitHub API error');
                return r.json();
            })
            .then(data => {
                // Validate it's real user data, not an error/rate-limit response
                if (typeof data.public_repos === 'undefined') return;
                animateCount('gh-repos', data.public_repos);
                animateCount('gh-followers', data.followers);
                animateCount('gh-following', data.following);
                animateCount('gh-gists', data.public_gists);
            })
            .catch(() => { /* silently fail — stat cards stay as "—" */ });
    }

    function animateCount(id, target) {
        const el = document.getElementById(id);
        if (!el || target === 0) { el.textContent = target; return; }
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 30));
        const timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = current;
        }, 30);
    }



    /* ================================================================
       ANIMATED BACKGROUND — Performance-optimized
       ================================================================ */
    function initBackground() {
        const canvas = document.getElementById('bg-canvas');
        const ctx = canvas.getContext('2d', { alpha: false });
        let w, h;
        const blobs = [];
        let resizeTimer;

        function resize() {
            // On mobile, render at half resolution for performance
            const dpr = isMobile ? 0.5 : Math.min(window.devicePixelRatio || 1, 1);
            w = Math.floor(window.innerWidth * dpr);
            h = Math.floor(window.innerHeight * dpr);
            canvas.width = w;
            canvas.height = h;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
        }
        resize();
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 200);
        });

        // Fewer blobs on mobile
        const configs = isMobile ? [
            { color: 'rgba(0,229,255,0.10)', r: 250, speed: 0.2 },
            { color: 'rgba(124,77,255,0.08)', r: 200, speed: 0.15 },
            { color: 'rgba(255,64,129,0.06)', r: 180, speed: 0.18 }
        ] : [
            { color: 'rgba(0,229,255,0.10)', r: 350, speed: 0.3 },
            { color: 'rgba(124,77,255,0.08)', r: 300, speed: 0.25 },
            { color: 'rgba(255,64,129,0.06)', r: 280, speed: 0.22 },
            { color: 'rgba(0,200,83,0.05)', r: 250, speed: 0.2 },
            { color: 'rgba(0,150,255,0.06)', r: 320, speed: 0.15 }
        ];

        for (const c of configs) {
            blobs.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: c.r * (isMobile ? 0.6 : 1),
                dx: (Math.random() - 0.5) * c.speed,
                dy: (Math.random() - 0.5) * c.speed,
                color: c.color
            });
        }

        // Fewer stars on mobile
        const STAR_COUNT = isMobile ? 25 : 60;
        const stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 1.2,
                alpha: Math.random() * 0.4 + 0.15
            });
        }

        // Throttle: mobile=30fps, desktop=60fps
        const frameInterval = isMobile ? 33 : 16;
        let lastFrame = 0;

        function draw(now) {
            requestAnimationFrame(draw);
            if (now - lastFrame < frameInterval) return;
            lastFrame = now;

            ctx.fillStyle = '#060a14';
            ctx.fillRect(0, 0, w, h);

            // Stars — single color batch
            ctx.fillStyle = 'rgba(200,220,255,0.3)';
            for (const s of stars) {
                ctx.fillRect(s.x, s.y, s.r, s.r); // squares are much cheaper than arcs
            }

            // Blobs
            for (const b of blobs) {
                b.x += b.dx;
                b.y += b.dy;
                if (b.x < -b.r) b.x = w + b.r;
                if (b.x > w + b.r) b.x = -b.r;
                if (b.y < -b.r) b.y = h + b.r;
                if (b.y > h + b.r) b.y = -b.r;

                const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
                grad.addColorStop(0, b.color);
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                // Only fill the blob region, not the entire canvas
                ctx.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
            }
        }
        requestAnimationFrame(draw);
    }

    /* ================================================================
       CLOCK
       ================================================================ */
    function initClock() {
        const el = document.getElementById('taskbar-clock');
        function tick() {
            const now = new Date();
            const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const date = now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
            el.textContent = time + '  •  ' + date;
        }
        tick();
        setInterval(tick, 15000);
    }

    /* ================================================================
       WINDOW MANAGER
       ================================================================ */
    let zCounter = 60;
    const openWindows = new Set();

    function openWindow(id) {
        const win = document.getElementById('window-' + id);
        if (!win) return;

        if (openWindows.has(id)) {
            // Already open — restore & focus
            win.style.display = 'flex';
            win.classList.remove('minimized-state');
            win.style.animation = 'winOpen 0.3s var(--transition) forwards';
            focusWindow(id);
            return;
        }

        // Calculate position
        const offset = openWindows.size * 28 + 40;
        const maxW = window.innerWidth;
        const maxH = window.innerHeight - 54;

        let winW, winH;
        if (id === 'terminal') {
            winW = Math.min(700, maxW - 40);
            winH = Math.min(440, maxH - 40);
        } else if (id === 'certifications') {
            winW = Math.min(780, maxW - 40);
            winH = Math.min(580, maxH - 40);
        } else {
            winW = Math.min(740, maxW - 40);
            winH = Math.min(560, maxH - 40);
        }

        // Center with slight offset for each window
        const left = Math.max(20, (maxW - winW) / 2 + (openWindows.size % 3 - 1) * 40);
        const top = Math.max(20, (maxH - winH) / 2 + (openWindows.size % 3 - 1) * 30);

        win.style.width = winW + 'px';
        win.style.height = winH + 'px';
        win.style.left = Math.min(left, maxW - winW - 10) + 'px';
        win.style.top = Math.min(top, maxH - winH - 10) + 'px';

        win.classList.add('shown');
        win.style.animation = 'winOpen 0.4s var(--transition) forwards';
        openWindows.add(id);
        focusWindow(id);
        updateTaskbar();
        makeDraggable(win);
    }

    function closeWindow(id) {
        const win = document.getElementById('window-' + id);
        if (!win) return;

        win.style.animation = 'winClose 0.3s ease forwards';
        setTimeout(() => {
            win.classList.remove('shown', 'active', 'maximized');
            win.style.animation = '';
            win.style.display = '';
            openWindows.delete(id);
            updateTaskbar();
        }, 280);
    }

    function minimizeWindow(id) {
        const win = document.getElementById('window-' + id);
        if (!win) return;
        win.style.animation = 'winMinimize 0.3s ease forwards';
        setTimeout(() => {
            win.style.display = 'none';
            win.classList.add('minimized-state');
            win.style.animation = '';
            updateTaskbar();
        }, 280);
    }

    function maximizeWindow(id) {
        const win = document.getElementById('window-' + id);
        if (!win) return;
        win.classList.toggle('maximized');
    }

    function focusWindow(id) {
        document.querySelectorAll('.os-window').forEach(w => w.classList.remove('active'));
        const win = document.getElementById('window-' + id);
        if (win) {
            zCounter++;
            win.style.zIndex = zCounter;
            win.classList.add('active');
        }
        updateTaskbar();
    }

    function makeDraggable(win) {
        if (isMobile) return; // No dragging on mobile — windows are fullscreen
        const titlebar = win.querySelector('.window-titlebar');
        if (win._draggable) return;
        win._draggable = true;

        let dragging = false, sX, sY, oL, oT, rafId;

        function onStart(x, y, e) {
            if (e.target.closest('.tb-btn')) return;
            if (win.classList.contains('maximized')) return;
            dragging = true;
            sX = x; sY = y;
            oL = win.offsetLeft;
            oT = win.offsetTop;
            win.style.transition = 'none'; // Kill transitions during drag
            focusWindow(win.id.replace('window-', ''));
        }

        function onMove(x, y) {
            if (!dragging) return;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                win.style.left = (oL + x - sX) + 'px';
                win.style.top = (oT + y - sY) + 'px';
            });
        }

        function onEnd() {
            dragging = false;
            win.style.transition = '';
        }

        titlebar.addEventListener('mousedown', (e) => {
            onStart(e.clientX, e.clientY, e);
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
        document.addEventListener('mouseup', onEnd);
    }

    function setupWindowControls() {
        document.querySelectorAll('.tb-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const win = e.target.closest('.os-window');
                const id = win.id.replace('window-', '');
                const action = e.target.dataset.action;
                if (action === 'close') closeWindow(id);
                else if (action === 'minimize') minimizeWindow(id);
                else if (action === 'maximize') maximizeWindow(id);
            });
        });

        // Focus on click
        document.querySelectorAll('.os-window').forEach(win => {
            win.addEventListener('mousedown', () => {
                focusWindow(win.id.replace('window-', ''));
            });
        });
    }

    /* ================================================================
       TASKBAR
       ================================================================ */
    function updateTaskbar() {
        const container = document.getElementById('taskbar-windows');
        container.innerHTML = '';

        openWindows.forEach(id => {
            const win = document.getElementById('window-' + id);
            const title = win.dataset.title || id;
            const isMinimized = win.style.display === 'none';
            const isActive = win.classList.contains('active') && !isMinimized;

            const btn = document.createElement('button');
            btn.className = 'taskbar-win-btn' + (isActive ? ' active' : '');
            btn.innerHTML = title;
            if (isMinimized) btn.style.opacity = '0.5';

            btn.addEventListener('click', () => {
                if (isMinimized || win.style.display === 'none') {
                    win.style.display = 'flex';
                    win.classList.remove('minimized-state');
                    win.style.animation = 'winOpen 0.3s var(--transition) forwards';
                    focusWindow(id);
                } else if (win.classList.contains('active')) {
                    minimizeWindow(id);
                } else {
                    focusWindow(id);
                }
            });
            container.appendChild(btn);
        });
    }

    /* ================================================================
       DESKTOP ICONS
       ================================================================ */
    function initIcons() {
        const icons = document.querySelectorAll('.desktop-icon');
        icons.forEach(icon => {
            // Single click on all devices
            icon.addEventListener('click', () => {
                openWindow(icon.dataset.window);
            });
        });
    }

    /* ================================================================
       START MENU
       ================================================================ */
    function initStartMenu() {
        const btn = document.getElementById('start-btn');
        const menu = document.getElementById('start-menu');

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const showing = !menu.classList.contains('hidden');
            if (showing) {
                menu.classList.add('hidden');
                btn.classList.remove('active');
            } else {
                menu.classList.remove('hidden');
                btn.classList.add('active');
            }
        });

        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
                menu.classList.add('hidden');
                btn.classList.remove('active');
            }
        });

        document.querySelectorAll('.start-item').forEach(item => {
            item.addEventListener('click', () => {
                openWindow(item.dataset.window);
                menu.classList.add('hidden');
                btn.classList.remove('active');
            });
        });
    }

    /* ================================================================
       TERMINAL
       ================================================================ */
    function initTerminal() {
        const output = document.getElementById('terminal-output');
        const input = document.getElementById('terminal-input');
        const history = [];
        let histIdx = -1;

        function print(html) {
            output.innerHTML += html + '\n';
            output.scrollTop = output.scrollHeight;
        }

        // Welcome banner
        print('<span class="t-accent">╔═══════════════════════════════════════════════════════╗</span>');
        print('<span class="t-accent">║</span>  <span class="t-bold">Welcome to NeerajOS Terminal v1.0</span>                   <span class="t-accent">║</span>');
        print('<span class="t-accent">║</span>  <span class="t-dim">Type</span> <span class="t-green">help</span> <span class="t-dim">to see available commands</span>                 <span class="t-accent">║</span>');
        print('<span class="t-accent">╚═══════════════════════════════════════════════════════╝</span>');
        print('');

        const COMMANDS = {
            help: () => `<span class="t-bold">Available Commands:</span>
  <span class="t-green">whoami</span>         <span class="t-dim">— About me</span>
  <span class="t-green">skills</span>         <span class="t-dim">— My technical skills</span>
  <span class="t-green">projects</span>       <span class="t-dim">— List my projects</span>
  <span class="t-green">certs</span>          <span class="t-dim">— My certifications</span>
  <span class="t-green">education</span>      <span class="t-dim">— Education timeline</span>
  <span class="t-green">contact</span>        <span class="t-dim">— How to reach me</span>
  <span class="t-green">achievements</span>   <span class="t-dim">— My achievements</span>
  <span class="t-green">resume</span>         <span class="t-dim">— Download my resume</span>
  <span class="t-green">open &lt;app&gt;</span>     <span class="t-dim">— Open a window (about/skills/projects/certifications/contact)</span>
  <span class="t-green">neofetch</span>       <span class="t-dim">— System info</span>
  <span class="t-green">clear</span>          <span class="t-dim">— Clear terminal</span>
  <span class="t-green">history</span>        <span class="t-dim">— Command history</span>`,

            whoami: () => `<span class="t-bold">Tiruveedhi Neeraj Venkata Sai</span>
<span class="t-accent">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>
<span class="t-dim">Role:</span>      Computer Science Student | Full-Stack Developer | Cybersecurity Enthusiast
<span class="t-dim">College:</span>   KL University (3rd Year CSE) — 9.22 CGPA
<span class="t-dim">Focus:</span>     Web Development, Cybersecurity, Data Analysis, AI/Cloud
<span class="t-dim">GitHub:</span>    <a href="https://github.com/neerajsait" target="_blank" class="t-link">github.com/neerajsait</a>
<span class="t-dim">LinkedIn:</span>  <a href="https://linkedin.com/in/neerajsait" target="_blank" class="t-link">linkedin.com/in/neerajsait</a>
<span class="t-dim">Bio:</span>       Passionate third-year CSE student building impactful web
           applications, exploring AI/cloud/security.`,

            skills: () => `<span class="t-bold">Technical Skills</span>
<span class="t-accent">━━━━━━━━━━━━━━━━</span>
<span class="t-pink">Frontend:</span>    HTML5, CSS3, JavaScript, React.js, Bootstrap
<span class="t-green">Backend:</span>     Python, Java, Spring Boot, Flask
<span class="t-yellow">Database:</span>    MySQL, MongoDB
<span class="t-accent">DevOps:</span>      Docker, CI/CD (GitHub Actions), Linux, AWS, Nginx
<span class="t-pink">Cloud:</span>       Google Cloud, AWS, Netlify, Vercel
<span class="t-green">Cyber:</span>       Maltego, openSTego, SIEM, Wireshark
<span class="t-yellow">Tools:</span>       GitHub, Figma, Postman, Tableau, Pandas & NumPy, Matplotlib & Seaborn
<span class="t-accent">IDEs:</span>        VS Code, Eclipse, PyCharm
<span class="t-pink">Soft:</span>        Communication, Teamwork, Problem Solving, Time Mgmt, Critical Thinking, Adaptability`,

            projects: () => `<span class="t-bold">Projects</span>
<span class="t-accent">━━━━━━━━</span>
<span class="t-green">1.</span> <span class="t-bold">Secure Data Management</span>
   <span class="t-dim">Flask + SQLAlchemy + MySQL + Fernet encryption</span>
   <span class="t-dim">→ Encryption logic & email notifications</span>
   <a href="https://github.com/neerajsait/Security-High" target="_blank" class="t-link">github.com/neerajsait/Security-High</a>

<span class="t-green">2.</span> <span class="t-bold">Real-Time Network Monitor</span>
   <span class="t-dim">Python + Flask + Scapy + SocketIO + psutil</span>
   <span class="t-dim">→ Live packet capture, GeoIP, anomaly alerts, dashboards</span>
   <a href="https://github.com/neerajsait/Network-Monitor" target="_blank" class="t-link">github.com/neerajsait/Network-Monitor</a>

<span class="t-green">3.</span> <span class="t-bold">Hotel Management System</span>
   <span class="t-dim">Python + Django + PostgreSQL + Git</span>
   <span class="t-dim">→ UI for smooth booking experience</span>

<span class="t-green">4.</span> <span class="t-bold">Campus Recruitment System</span>
   <span class="t-dim">Java + Spring Boot + MySQL</span>
   <span class="t-dim">→ Recruiter-side functionalities + UI</span>
   <a href="https://github.com/neerajsait/RecruiterService" target="_blank" class="t-link">github.com/neerajsait/RecruiterService</a>

<span class="t-green">5.</span> <span class="t-bold">Online Bus Reservation (MERN)</span>
   <span class="t-dim">MongoDB + Express.js + React + Node.js</span>
   <span class="t-dim">→ Frontend + API integration for real-time data</span>
   <a href="https://mswd-seven.vercel.app/" target="_blank" class="t-link">Live: mswd-seven.vercel.app</a>
   <a href="https://github.com/neerajsait/Express-Ride" target="_blank" class="t-link">github.com/neerajsait/Express-Ride</a>`,

            certs: () => `<span class="t-bold">Certifications</span>
<span class="t-accent">━━━━━━━━━━━━━━━</span>
<span class="t-yellow">●</span> Postman API Fundamentals         <span class="t-dim">— Postman          ✓ Verified</span>
<span class="t-yellow">●</span> Salesforce AI Associate           <span class="t-dim">— Salesforce       ✓ Verified</span>
<span class="t-yellow">●</span> Azure AI Fundamentals (AI-900)    <span class="t-dim">— Microsoft        ✓ Verified</span>
<span class="t-yellow">●</span> AWS Cloud Practitioner            <span class="t-dim">— Amazon           ✓ Verified</span>
<span class="t-yellow">●</span> Java Programming                  <span class="t-dim">— NPTEL (IIT)      ✓ Completed</span>
<span class="t-yellow">●</span> Linguaskills (B1)                 <span class="t-dim">— Cambridge        ✓ Completed</span>
<span class="t-yellow">●</span> JNCIA-Junos                       <span class="t-dim">— Juniper          ✓ Completed</span>
<span class="t-yellow">●</span> Data Analyst                      <span class="t-dim">— Cisco            ✓ Verified</span>`,

            education: () => `<span class="t-bold">Education Timeline</span>
<span class="t-accent">━━━━━━━━━━━━━━━━━━</span>
<span class="t-green">2019–2020</span>  10th Grade — BVB Public School, Bhimavaram
           <span class="t-dim">413/500 | Sports, quizzes, debates</span>

<span class="t-green">2020–2022</span>  Intermediate — Tirumala Junior College
           <span class="t-dim">908/1000 | JEE Mains 89 percentile</span>

<span class="t-green">2022–Now</span>   B.Tech CSE — Koneru Lakshmaiah University
           <span class="t-dim">9.22 CGPA | Peer mentor & LEAD member</span>`,

            contact: () => `<span class="t-bold">Contact Information</span>
<span class="t-accent">━━━━━━━━━━━━━━━━━━━</span>
<span class="t-dim">Email:</span>      <a href="mailto:2200030957@kluniversity.in" class="t-link">2200030957@kluniversity.in</a>
<span class="t-dim">Phone:</span>      +91 9642292282
<span class="t-dim">Location:</span>   Vijayawada, India
<span class="t-dim">LinkedIn:</span>   <a href="https://linkedin.com/in/neerajsait" target="_blank" class="t-link">linkedin.com/in/neerajsait</a>
<span class="t-dim">GitHub:</span>     <a href="https://github.com/neerajsait" target="_blank" class="t-link">github.com/neerajsait</a>`,

            achievements: () => `<span class="t-bold">Achievements</span>
<span class="t-accent">━━━━━━━━━━━━</span>
🛡️  Built Email Scanning tool (Flask + React) — phishing/spam detection
📈  Finalist — University Innovation Challenge (Placement Interaction System)
🎓  LEAD member — student mentoring & grievance resolution at KL University
🧠  200+ problems solved on LeetCode & HackerRank
📚  Research paper: "Digital Forensics" at cybersecurity forum`,

            resume: () => {
                try {
                    const a = document.createElement('a');
                    a.href = 'media/resume.pdf';
                    a.download = 'Neeraj_Resume.pdf';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                } catch (e) { /* ignore */ }
                return '<span class="t-green">⬇ Downloading resume...</span>';
            },

            neofetch: () => `<span class="t-accent">        ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄</span>        <span class="t-bold">visitor@neerajOS</span>
<span class="t-accent">      ▄████████████████████▄</span>      <span class="t-accent">━━━━━━━━━━━━━━━━━━</span>
<span class="t-accent">    ▄████████████████████████▄</span>    <span class="t-dim">OS:</span>      NeerajOS v1.0
<span class="t-accent">   ██████████████████████████</span>     <span class="t-dim">Host:</span>    Portfolio Server
<span class="t-accent">   ██████████████████████████</span>     <span class="t-dim">Kernel:</span>  HTML5 + CSS3 + JS
<span class="t-accent">   ██████████████████████████</span>     <span class="t-dim">Shell:</span>   NeerajTerminal 1.0
<span class="t-accent">    ▀████████████████████████▀</span>    <span class="t-dim">DE:</span>      NeerajDE (Glass)
<span class="t-accent">      ▀████████████████████▀</span>      <span class="t-dim">WM:</span>      Draggable Windows
<span class="t-accent">        ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀</span>        <span class="t-dim">Theme:</span>  Cyber Midnight
                                   <span class="t-dim">Uptime:</span> Since 2002 🚀`,

            clear: () => { output.innerHTML = ''; return null; },

            history: () => {
                if (history.length === 0) return '<span class="t-dim">No commands in history</span>';
                return history.map((c, i) => `<span class="t-dim">${String(i + 1).padStart(3)}</span>  ${c}`).join('\n');
            }
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (history.length > 0 && histIdx < history.length - 1) {
                    histIdx++;
                    input.value = history[history.length - 1 - histIdx];
                }
                return;
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (histIdx > 0) {
                    histIdx--;
                    input.value = history[history.length - 1 - histIdx];
                } else {
                    histIdx = -1;
                    input.value = '';
                }
                return;
            }
            if (e.key !== 'Enter') return;

            const raw = input.value.trim();
            const cmd = raw.toLowerCase();
            input.value = '';
            histIdx = -1;
            if (!cmd) return;

            history.push(raw);
            const safeRaw = escapeHtml(raw);
            print(`<span class="t-accent">visitor@neerajOS:~$</span> ${safeRaw}`);

            // Handle "open <app>"
            if (cmd.startsWith('open ')) {
                const app = cmd.replace('open ', '').trim();
                const valid = ['about', 'skills', 'projects', 'certifications', 'contact', 'terminal', 'apps'];
                if (valid.includes(app)) {
                    openWindow(app);
                    print(`<span class="t-green">✓ Opened ${escapeHtml(app)}</span>`);
                } else {
                    print(`<span class="t-pink">✗ Unknown app: ${escapeHtml(app)}</span>`);
                    print(`<span class="t-dim">  Valid: ${valid.join(', ')}</span>`);
                }
                print('');
                return;
            }

            if (COMMANDS[cmd]) {
                const result = COMMANDS[cmd]();
                if (result) print(result);
            } else {
                print(`<span class="t-pink">command not found: ${escapeHtml(cmd)}</span>`);
                print(`<span class="t-dim">Type <span class="t-green">help</span> for available commands</span>`);
            }
            print('');
        });

        // Click terminal body to focus input
        document.querySelector('#window-terminal .terminal-body').addEventListener('click', () => {
            input.focus();
        });
    }

    /* ================================================================
       START
       ================================================================ */
    document.addEventListener('DOMContentLoaded', startBoot);
})();
