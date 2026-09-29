// ==========================================
// 1. LENIS SMOOTH MOMENTUM SCROLL ENGINE
// ==========================================
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false
});

// Connect Lenis to GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ==========================================
// 2. GSAP SCROLLTRIGGER: DYNAMIC TRAVELING 3D CHARACTER
// ==========================================
gsap.registerPlugin(ScrollTrigger);

const character = document.getElementById('traveling-character');

if (character) {
    // Stage 1 -> About Me: Character glides to the left side and scales slightly down
    gsap.to(character, {
        scrollTrigger: {
            trigger: "#about",
            start: "top center",
            end: "bottom center",
            scrub: 1
        },
        x: -480,
        y: 80,
        scale: 0.85,
        rotation: -4,
        ease: "power2.out"
    });

    // Stage 2 -> Creations: Character drops down and swings to the right corner
    gsap.to(character, {
        scrollTrigger: {
            trigger: "#creations",
            start: "top center",
            end: "bottom center",
            scrub: 1
        },
        x: 40,
        y: 120,
        scale: 0.9,
        rotation: 3,
        ease: "power2.out"
    });

    // Stage 3 -> Software: Character centers up behind the tools
    gsap.to(character, {
        scrollTrigger: {
            trigger: "#software",
            start: "top center",
            end: "bottom center",
            scrub: 1
        },
        x: -220,
        y: -30,
        scale: 0.78,
        rotation: 0,
        ease: "power2.out"
    });

    // Stage 4 -> Terminal & Connect: Character slides into focus
    gsap.to(character, {
        scrollTrigger: {
            trigger: "#connect",
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1
        },
        x: -30,
        y: 60,
        scale: 0.88,
        rotation: 2,
        ease: "power2.out"
    });
}

// ==========================================
// 3. SCROLLSPY (LEFT MENU ACTIVE TRACKER)
// ==========================================
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.sidebar-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 180;
        if (pageYOffset >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active-nav');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active-nav');
        }
    });
});

// ==========================================
// 4. SYNTHESIZED WEB AUDIO API
// ==========================================
let audioCtx = null;
function getAudioContext() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

function playUiSound(type) {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(650, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } else if (type === 'pop') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(350, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.12);
        }
    } catch(e) {}
}

// ==========================================
// 5. CUSTOM MAGNETIC CURSOR TRACKER
// ==========================================
const cursor = document.getElementById('custom-cursor');
const dot = document.getElementById('cursor-dot');

window.addEventListener('mousemove', (e) => {
    if (cursor && dot) {
        cursor.style.transform = `translate(${e.clientX - 16}px, ${e.clientY - 16}px)`;
        dot.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
    }
});

// ==========================================
// 6. INTERACTIVE NEURAL LAB SANDBOX
// ==========================================
function injectPipelineSandbox() {
    const input = document.getElementById('sandbox-text').value.trim();
    const telemetryText = document.getElementById('pipeline-telemetry-text');
    const statusTag = document.getElementById('pipeline-status-tag');

    if (!input) return;
    playUiSound('pop');

    statusTag.textContent = "INFERRING...";
    statusTag.className = "text-amber-400 font-bold tracking-wider animate-ping";
    telemetryText.textContent = `> Transforming "${input.slice(0, 32)}..." through 50,000 sparse TF-IDF n-grams...`;

    setTimeout(() => {
        statusTag.textContent = "DISPATCHED";
        statusTag.className = "text-emerald-400 font-bold tracking-wider";
        telemetryText.textContent = `> Result: POSITIVE (Confidence: 96.8%) • Latency: 11.4ms ⚡ • Uvicorn Async Loop OK`;
        
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#FFB703', '#FF7B00', '#00F59B']
            });
        }
    }, 600);
}

// ==========================================
// 7. INTERACTIVE CLI TERMINAL
// ==========================================
function handleTerminalCommand(e) {
    if (e.key === 'Enter') {
        playUiSound('click');
        const input = document.getElementById('term-input');
        const history = document.getElementById('terminal-history');
        const val = input.value.trim().toLowerCase();

        if (!val) return;

        let response = '';
        if (val === 'skills') {
            response = 'Python • FastAPI • Scikit-Learn • NLP • PyTorch • Uvicorn • Three.js • Git';
        } else if (val === 'projects') {
            response = '1. CineScope AI (Movie Sentiment Studio, 91.53% Accuracy)\n2. Customer IQ Engine (RFM Segmentation)\n3. 3D Claymorphic Flagship Studio';
        } else if (val === 'gemini' || val === 'chatgpt') {
            toggleDualAIChat();
            response = 'Launching Dual AI Council...';
        } else if (val === 'contact') {
            response = 'Email: rohitsharma.dev@gmail.com | GitHub: github.com/RohitSharma13920';
        } else if (val === 'clear') {
            history.innerHTML = '';
            input.value = '';
            return;
        } else {
            response = `command not found: "${val}". Available: skills, projects, gemini, contact, clear`;
        }

        history.innerHTML += `
            <div>
                <span class="text-amber-400 font-bold">&gt;</span> <span class="text-white">${input.value}</span>
                <div class="text-zinc-400 pl-4 whitespace-pre-line mt-0.5">${response}</div>
            </div>
        `;

        input.value = '';
    }
}

// ==========================================
// 8. DUAL AI ENGINE: GOOGLE GEMINI + CHATGPT
// ==========================================
let isDualAIOpen = false;
let activeAIMode = 'both';

function toggleDualAIChat() {
    playUiSound('pop');
    const modal = document.getElementById('dual-ai-modal');
    isDualAIOpen = !isDualAIOpen;

    if (isDualAIOpen) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.getElementById('ai-user-input').focus();
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function switchAIMode(mode) {
    playUiSound('click');
    activeAIMode = mode;
    const tabGemini = document.getElementById('tab-gemini');
    const tabChatGPT = document.getElementById('tab-chatgpt');
    const tabBoth = document.getElementById('tab-both');

    [tabGemini, tabChatGPT, tabBoth].forEach(t => {
        t.className = "px-2.5 py-1 rounded-lg text-zinc-400 hover:text-white transition";
    });

    if (mode === 'gemini') {
        tabGemini.className = "px-2.5 py-1 rounded-lg text-amber-400 bg-zinc-800 shadow-sm font-bold";
    } else if (mode === 'chatgpt') {
        tabChatGPT.className = "px-2.5 py-1 rounded-lg text-emerald-400 bg-zinc-800 shadow-sm font-bold";
    } else {
        tabBoth.className = "px-2.5 py-1 rounded-lg text-amber-400 bg-zinc-800 shadow-sm font-bold";
    }
}

const aiResponses = {
    cinescope: {
        gemini: "🎬 **Gemini:** CineScope AI uses an optimized **TF-IDF + Logistic Regression** architecture trained over 50,000 IMDB samples with **91.53% validation accuracy** and sub-15ms async inference.",
        chatgpt: "🍿 **ChatGPT:** On the software engineering side, CineScope AI demonstrates excellent full-stack structure: clean FastAPI REST endpoints, Web Audio chimes, and browser-native SpeechRecognition for voice reviews."
    },
    skills: {
        gemini: "🛠️ **Gemini:** Rohit's core strength is applied machine learning: Python, Scikit-Learn pipelines, n-gram vectorizers, high-dimensional matrices, and model telemetry visualization.",
        chatgpt: "⚙️ **ChatGPT:** Rohit pairs that ML knowledge with solid developer tooling: asynchronous FastAPI services, Uvicorn, responsive Tailwind CSS layouts, and Git version control."
    },
    hire: {
        gemini: "🌟 **Gemini:** Rohit is rare because he doesn't just train models in Jupyter Notebooks—he builds real-time telemetry, latency benchmarking, and visual frontends around them.",
        chatgpt: "🚀 **ChatGPT:** He executes end-to-end: from data preprocessing and training to containerization, API routing, and high-conversion aesthetic UI engineering."
    }
};

function handleQuickAI(key) {
    const promptMap = {
        cinescope: "Tell me about CineScope AI",
        skills: "What is Rohit's Tech Stack?",
        hire: "Why should a company hire Rohit Sharma?"
    };
    addMessageToChat('user', promptMap[key]);

    if (activeAIMode === 'gemini' || activeAIMode === 'both') {
        setTimeout(() => addMessageToChat('gemini', aiResponses[key].gemini), 350);
    }
    if (activeAIMode === 'chatgpt' || activeAIMode === 'both') {
        setTimeout(() => addMessageToChat('chatgpt', aiResponses[key].chatgpt), 750);
    }
}

function handleAISubmit(e) {
    e.preventDefault();
    const input = document.getElementById('ai-user-input');
    const text = input.value.trim();
    if (!text) return;

    addMessageToChat('user', text);
    input.value = '';

    const lower = text.toLowerCase();
    let key = 'skills';

    if (lower.includes('cinescope') || lower.includes('project') || lower.includes('movie')) {
        key = 'cinescope';
    } else if (lower.includes('hire') || lower.includes('job') || lower.includes('why')) {
        key = 'hire';
    }

    if (activeAIMode === 'gemini' || activeAIMode === 'both') {
        setTimeout(() => addMessageToChat('gemini', aiResponses[key].gemini), 350);
    }
    if (activeAIMode === 'chatgpt' || activeAIMode === 'both') {
        setTimeout(() => addMessageToChat('chatgpt', aiResponses[key].chatgpt), 750);
    }
}

function addMessageToChat(sender, text) {
    const body = document.getElementById('ai-chat-body');
    playUiSound('click');

    if (sender === 'user') {
        body.innerHTML += `
            <div class="flex items-start justify-end gap-2">
                <div class="bg-amber-400 text-black font-bold rounded-2xl rounded-tr-none p-3 max-w-[85%] shadow-sm">
                    ${text}
                </div>
            </div>
        `;
    } else if (sender === 'gemini') {
        body.innerHTML += `
            <div class="flex items-start gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-amber-400 text-black font-black flex items-center justify-center text-xs shrink-0 shadow-sm">
                    ✦
                </div>
                <div class="bg-[#0A0C12] rounded-2xl rounded-tl-none p-3 text-zinc-200 leading-relaxed max-w-[85%] border border-white/10">
                    <span class="text-[10px] font-black text-amber-400 block uppercase">Google Gemini:</span>
                    ${text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                </div>
            </div>
        `;
    } else if (sender === 'chatgpt') {
        body.innerHTML += `
            <div class="flex items-start gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-800 flex items-center justify-center text-white text-xs shrink-0 shadow-sm">
                    🟢
                </div>
                <div class="bg-[#0A0C12] rounded-2xl rounded-tl-none p-3 text-zinc-200 leading-relaxed max-w-[85%] border border-white/10">
                    <span class="text-[10px] font-black text-emerald-400 block uppercase">OpenAI ChatGPT:</span>
                    ${text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                </div>
            </div>
        `;
    }

    body.scrollTop = body.scrollHeight;
}