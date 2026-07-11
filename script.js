// ============ DADOS DOS VÍDEOS ============
// IDs reais de vídeos públicos de receitas do YouTube (use substitua pelos seus IDs)
const videoIds = {
    1: 'dQw4w9WgXcQ',  // PLACEHOLDER — substitua por ID real do YouTube
    2: 'dQw4w9WgXcQ',
    3: 'dQw4w9WgXcQ',
    4: 'dQw4w9WgXcQ',
    5: 'dQw4w9WgXcQ',
    6: 'dQw4w9WgXcQ'
};

// Para trocar pelos seus vídeos reais, edite a constante acima. Formato: 'ID_do_video_youtube'
// Exemplo: 1: 'abc123def45' (apenas o ID, não a URL completa)

const videoDurations = {
    1: '8:42', 2: '12:08', 3: '6:30',
    4: '9:15', 5: '5:50', 6: '11:20'
};

// ============ INICIALIZAÇÃO ============
let sessionStartTime = Date.now();
let exitPopupShown = false;
let recipesViewed = new Set();
let notificationInterval;
let onlineCounterInterval;

// Mensagens do mistério (muda a cada acesso)
const mysteryMessages = [
    "O segredo que sua avó nunca quis te contar",
    "A fórmula que famílias guardam por gerações",
    "O truque que padarias não querem que você saiba",
    "Como ganhar R$ 5.000/mês cozinhando em casa",
    "A receita que mudou a vida de 3.421 pessoas"
];

// ============ TELA DE BOAS-VINDAS ============
function enterSite() {
    const screen = document.getElementById('welcome-screen');
    if (!screen) return; // segurança
    screen.classList.add('hidden');
    sessionStartTime = Date.now();
    setTimeout(() => {
        screen.style.display = 'none';
    }, 600);
    startEngagementLoops();
}

// Atacha tudo DEPOIS do DOM estar pronto (corrige bug mobile)
document.addEventListener('DOMContentLoaded', () => {
    // Mensagem aleatória
    const secretEl = document.getElementById('welcome-secret');
    if (secretEl) {
        secretEl.textContent = mysteryMessages[Math.floor(Math.random() * mysteryMessages.length)];
    }

    // Botão de entrada — funciona em click E touch (mobile)
    const welcomeBtn = document.getElementById('welcome-btn');
    if (welcomeBtn) {
        welcomeBtn.addEventListener('click', enterSite);
        // Fallback extra para mobile (alguns navegadores mobile têm delay no click)
        welcomeBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            enterSite();
        });
    }
});

// ============ VÍDEOS INLINE ============
function playVideo(element) {
    const card = element.closest('.recipe-card');
    const recipeNum = card.dataset.recipe;
    const videoId = videoIds[recipeNum] || videoIds[1];

    // Substitui a "fake" pelo iframe do YouTube (assiste na própria página)
    element.innerHTML = `
        <iframe
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1"
            title="Vídeo da Receita ${recipeNum}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
        ></iframe>
    `;

    // Marca como vista
    recipesViewed.add(recipeNum);
    updateExitPopup();

    // Scroll suave para o vídeo
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ============ EXPANDIR RECEITAS ============
function toggleExpand(btn) {
    const content = btn.nextElementSibling;
    content.classList.toggle('open');
    btn.textContent = content.classList.contains('open')
        ? '▲ Recolher'
        : '▼ Ver mais detalhes e variações';
}

// ============ FAQ ============
function toggleFaq(item) {
    item.classList.toggle('open');
}

// ============ POPUP DE SAÍDA ============
function setupExitPopup() {
    let mouseLeft = false;

    document.addEventListener('mouseleave', (e) => {
        if (e.clientY <= 0 && !exitPopupShown) {
            const elapsed = (Date.now() - sessionStartTime) / 1000;
            if (elapsed > 15 && recipesViewed.size < 4) {
                showExitPopup();
            }
        }
    });
}

function showExitPopup() {
    if (exitPopupShown) return;
    exitPopupShown = true;
    document.getElementById('exit-popup').classList.add('active');
    document.getElementById('recipes-seen').textContent = recipesViewed.size || 1;
}

function closeExit() {
    document.getElementById('exit-popup').classList.remove('active');
    // Permite mostrar de novo após 60s
    setTimeout(() => { exitPopupShown = false; }, 60000);
}

function updateExitPopup() {
    const el = document.getElementById('recipes-seen');
    if (el) el.textContent = recipesViewed.size;
}

// ============ BARRA DE PROGRESSO ============
function updateProgress() {
    const winHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const progress = Math.min((scrolled / winHeight) * 100, 100);
    document.getElementById('progress-bar').style.width = progress + '%';
}

window.addEventListener('scroll', updateProgress);

// ============ CONTADOR DE "ONLINE" ============
function startOnlineCounter() {
    const counter = document.getElementById('online-count');
    if (!counter) return;

    onlineCounterInterval = setInterval(() => {
        const current = parseInt(counter.textContent.replace(/\./g, ''));
        const change = Math.floor(Math.random() * 21) - 10; // -10 a +10
        const next = Math.max(2500, Math.min(3500, current + change));
        counter.textContent = next.toLocaleString('pt-BR');
    }, 3000);
}

// ============ NOTIFICAÇÕES DE PROVA SOCIAL ============
const notifications = [
    { name: 'Ana de Curitiba', action: 'acabou de comprar o Método Completo' },
    { name: 'Carlos de Recife', action: 'vendeu 12 bolos hoje' },
    { name: 'Mariana de Belo Horizonte', action: 'começou a lucrar com brigadeiro' },
    { name: 'Roberto de Salvador', action: 'faturou R$ 1.240 esta semana' },
    { name: 'Juliana de Porto Alegre', action: 'acabou de comprar o Método' },
    { name: 'Pedro de Fortaleza', action: 'vendeu 30 pães caseiros hoje' },
    { name: 'Fernanda de Manaus', action: 'saiu do zero com R$ 3.500/mês' },
    { name: 'Lucas de Goiânia', action: 'comprou o Método há 2 min' },
    { name: 'Patrícia de Campinas', action: 'faturou R$ 890 em 1 dia' },
    { name: 'Ricardo de Brasília', action: 'já recuperou o investimento' }
];

function showNotification() {
    const notif = document.getElementById('notification');
    if (!notif) return;

    const data = notifications[Math.floor(Math.random() * notifications.length)];
    document.getElementById('notif-name').textContent = data.name;
    document.getElementById('notif-action').textContent = data.action;
    document.getElementById('notif-time').textContent =
        Math.floor(Math.random() * 8) + 1;

    notif.classList.add('show');

    setTimeout(() => {
        notif.classList.remove('show');
    }, 5000);
}

function startNotifications() {
    // Primeira notificação após 25s
    setTimeout(showNotification, 25000);
    // Próximas a cada 30-50s
    notificationInterval = setInterval(() => {
        if (Math.random() > 0.3) showNotification();
    }, 40000);
}

// ============ GATILHOS DE RETENÇÃO (10+ MINUTOS) ============
function startEngagementLoops() {
    startOnlineCounter();
    startNotifications();
    setupExitPopup();
    setupScrollMilestones();
    setupIdleEngagement();
    setupTimeMilestone();
}

// Marcos de scroll que recompensam o usuário
function setupScrollMilestones() {
    const milestones = {
        25: "🔥 Você já viu 25% — falta pouco para descobrir TUDO!",
        50: "💰 Metade do caminho! Você já sabe mais que 90% das pessoas.",
        75: "🚀 75%! O método completo está logo abaixo.",
        90: "👑 Quase lá! A oferta exclusiva vem a seguir."
    };

    const shown = new Set();
    window.addEventListener('scroll', () => {
        const winHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / winHeight) * 100;

        Object.keys(milestones).forEach(milestone => {
            const m = parseInt(milestone);
            if (scrolled >= m && !shown.has(m)) {
                shown.add(m);
                showCustomNotification("🎯 " + milestones[m], "Continue rolando!");
            }
        });
    });
}

// Engajamento quando o usuário fica parado (idle)
let idleTimer;
function setupIdleEngagement() {
    ['mousemove', 'scroll', 'keydown', 'touchstart'].forEach(evt => {
        document.addEventListener(evt, () => {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(onIdle, 45000);
        });
    });
    idleTimer = setTimeout(onIdle, 45000);
}

function onIdle() {
    if (recipesViewed.size < 3) {
        showCustomNotification(
            "👀 Dica: Clique nos vídeos das receitas!",
            "Assistir aumenta seu interesse em 300%"
        );
    } else if (recipesViewed.size < 6) {
        showCustomNotification(
            "🤫 Sabia que existe um método que une TODAS essas receitas?",
            "Role até o final para descobrir"
        );
    }
}

// Marco de tempo: depois de 2 minutos
function setupTimeMilestone() {
    setTimeout(() => {
        showCustomNotification(
            "⏰ Você está aqui há 2 minutos!",
            "A maioria das pessoas desiste em 30s. Você é diferente."
        );
    }, 120000);

    // Marco de 5 minutos
    setTimeout(() => {
        showCustomNotification(
            "🏆 5 minutos! Você é persistente.",
            "Os melhores resultados vêm de quem não desiste."
        );
    }, 300000);

    // Marco de 10 minutos
    setTimeout(() => {
        showCustomNotification(
            "🎉 10 MINUTOS! Você desbloqueou a OFERTA ESPECIAL!",
            "Role até o final e garanta o método completo."
        );
    }, 600000);
}

// Notificação customizada (reutiliza a box de notificação)
function showCustomNotification(title, subtitle) {
    const notif = document.getElementById('notification');
    if (!notif) return;

    document.getElementById('notif-name').textContent = title;
    document.getElementById('notif-action').textContent = subtitle;
    document.getElementById('notif-time').textContent = "agora";

    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 6000);
}

// ============ CTA DE COMPRA ============
function buyNow(e) {
    e.preventDefault();
    // AQUI você coloca o link de checkout (Hotmart, Kiwify, Eduzz, etc.)
    const checkoutUrl = '#'; // <-- SUBSTITUA pelo seu link de checkout
    alert('🎉 PARABÉNS!\n\nVocê está a um passo de transformar sua cozinha em uma máquina de fazer dinheiro.\n\nRedirecionando para o pagamento seguro...');
    // window.location.href = checkoutUrl;
    console.log('Checkout:', checkoutUrl);
}

// ============ INTERSECTION OBSERVER (cards aparecem ao scroll) ============
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.recipe-card').forEach(card => {
    observer.observe(card);
});

// ============ DETECÇÃO DE SCROLL RÁPIDO (indicador de saída) ============
let lastScrollY = window.scrollY;
let scrollSpeed = 0;
window.addEventListener('scroll', () => {
    scrollSpeed = Math.abs(window.scrollY - lastScrollY);
    lastScrollY = window.scrollY;

    // Se rolar muito rápido para cima nos primeiros 20s, mostrar popup
    if (scrollSpeed > 50 && window.scrollY < 100) {
        const elapsed = (Date.now() - sessionStartTime) / 1000;
        if (elapsed < 20 && !exitPopupShown) {
            showExitPopup();
        }
    }
});

// ============ START ============
console.log('%c🔐 RECEITAS OCULTAS', 'font-size: 24px; font-weight: bold; color: #ff6b35;');
console.log('%cSite carregado com sucesso. Recursos de retenção ativados.', 'color: #ffd700;');
