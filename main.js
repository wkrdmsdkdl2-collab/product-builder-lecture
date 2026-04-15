// ─── 데이터 ───────────────────────────────────────────────────
const COLORS = [
  '#e94560', '#f7971e', '#2ecc71', '#3498db',
  '#9b59b6', '#e67e22', '#1abc9c', '#e74c3c',
  '#f39c12', '#16a085', '#8e44ad', '#d35400',
];

let players = ['홍길동', '김철수', '이영희'];
let penalties = ['원샷!', '춤 추기', '노래 한 곡', '만원 내기', '罰酒 3잔', '닭발 먹기'];
let isSpinning = false;
let currentAngle = 0;

// ─── 테마 관리 ──────────────────────────────────────────────────
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('themeBtn');
  if (btn) {
    btn.textContent = theme === 'light' ? '🌙' : '☀️';
  }
}

// ─── 참가자 ───────────────────────────────────────────────────
function addPlayer() {
  const input = document.getElementById('playerInput');
  const name = input.value.trim();
  if (!name) return;
  players.push(name);
  input.value = '';
  renderPlayers();
  drawWheel();
}

window.addPlayer = addPlayer; // Global expose for inline onclick

function removePlayer(i) {
  players.splice(i, 1);
  renderPlayers();
  drawWheel();
}
window.removePlayer = removePlayer;

function renderPlayers() {
  const list = document.getElementById('playerList');
  if (!list) return;
  
  if (players.length === 0) {
    list.innerHTML = '<li class="empty-msg" id="emptyPlayers">참가자를 추가하세요</li>';
    return;
  }
  list.innerHTML = players.map((p, i) => `
    <li class="player-item">
      <span class="player-dot" style="background:${COLORS[i % COLORS.length]}"></span>
      <span class="player-name">${escHtml(p)}</span>
      <button class="btn-remove" onclick="removePlayer(${i})">✕</button>
    </li>
  `).join('');
}

// ─── 벌칙 ────────────────────────────────────────────────────
function addPenalty() {
  const input = document.getElementById('penaltyInput');
  const text = input.value.trim();
  if (!text) return;
  penalties.push(text);
  input.value = '';
  renderPenalties();
}
window.addPenalty = addPenalty;

function removePenalty(i) {
  penalties.splice(i, 1);
  renderPenalties();
}
window.removePenalty = removePenalty;

function renderPenalties() {
  const list = document.getElementById('penaltyList');
  if (!list) return;

  if (penalties.length === 0) {
    list.innerHTML = '<li class="empty-msg">벌칙을 추가하세요</li>';
    return;
  }
  list.innerHTML = penalties.map((p, i) => `
    <li class="penalty-item">
      <span class="penalty-text">⚡ ${escHtml(p)}</span>
      <button class="btn-remove" onclick="removePenalty(${i})">✕</button>
    </li>
  `).join('');
}

// ─── 룰렛 그리기 ─────────────────────────────────────────────
function drawWheel(highlightIdx = -1) {
  const canvas = document.getElementById('wheel');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2, r = cx - 6;

  ctx.clearRect(0, 0, W, H);

  if (players.length === 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#888';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('참가자를 추가하세요', cx, cy);
    return;
  }

  const slice = (Math.PI * 2) / players.length;

  players.forEach((name, i) => {
    const startAngle = currentAngle + slice * i - Math.PI / 2;
    const endAngle = startAngle + slice;
    const color = COLORS[i % COLORS.length];

    // 부채꼴
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = highlightIdx === i ? '#fff' : color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 텍스트
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(startAngle + slice / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = highlightIdx === i ? color : '#fff';
    ctx.font = `bold ${players.length > 8 ? 13 : 16}px sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(name, r - 14, 5);
    ctx.restore();
  });

  // 테두리 원
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 4;
  ctx.stroke();
}

// ─── 스핀 ────────────────────────────────────────────────────
function spin() {
  if (isSpinning || players.length < 2) {
    if (players.length < 2) alert('참가자를 2명 이상 추가하세요!');
    return;
  }

  isSpinning = true;
  document.getElementById('spinBtn').disabled = true;

  const totalRotation = (Math.PI * 2) * (5 + Math.random() * 5);
  const duration = 3500 + Math.random() * 1500;
  const startAngle = currentAngle;
  const startTime = performance.now();

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    currentAngle = startAngle + totalRotation * easeOut(progress);

    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      document.getElementById('spinBtn').disabled = false;

      // 결과 계산
      const slice = (Math.PI * 2) / players.length;
      let normalizedAngle = ((-(currentAngle) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      let winnerIdx = Math.floor(normalizedAngle / slice) % players.length;

      drawWheel(winnerIdx);
      showResult(winnerIdx);
    }
  }

  requestAnimationFrame(animate);
}
window.spin = spin;

// ─── 결과 표시 ───────────────────────────────────────────────
function showResult(winnerIdx) {
  const winner = players[winnerIdx];
  const penalty = penalties.length > 0
    ? penalties[Math.floor(Math.random() * penalties.length)]
    : '벌칙 없음 (럭키~!)';

  const isBad = penalties.length > 0;
  document.getElementById('resultEmoji').textContent = isBad ? '😱' : '🎉';
  document.getElementById('resultTitle').textContent = isBad ? '당첨! 걸렸다!!' : '선택됨!';
  document.getElementById('resultWinner').textContent = winner;
  document.getElementById('resultWinner').style.color = COLORS[winnerIdx % COLORS.length];
  document.getElementById('resultPenalty').textContent = `🎯 ${penalty}`;

  document.getElementById('resultModal').classList.add('show');
  launchConfetti(isBad ? ['#e94560', '#ff6b6b', '#f7971e'] : ['#2ecc71', '#ffd200', '#3498db']);
}

function closeModal() {
  document.getElementById('resultModal').classList.remove('show');
  document.getElementById('confettiContainer').innerHTML = '';
}
window.closeModal = closeModal;

// ─── 컨페티 ──────────────────────────────────────────────────
function launchConfetti(colors) {
  const container = document.getElementById('confettiContainer');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.width = (6 + Math.random() * 10) + 'px';
    el.style.height = (6 + Math.random() * 10) + 'px';
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    el.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    el.style.animationDelay = (Math.random() * 0.8) + 's';
    container.appendChild(el);
  }
}

// ─── 유틸 ────────────────────────────────────────────────────
function escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── 초기화 ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderPlayers();
  renderPenalties();
  drawWheel();

  // 엔터키 지원
  const pInput = document.getElementById('playerInput');
  const penInput = document.getElementById('penaltyInput');
  const themeBtn = document.getElementById('themeBtn');

  if (pInput) pInput.addEventListener('keydown', e => { if (e.key === 'Enter') addPlayer(); });
  if (penInput) penInput.addEventListener('keydown', e => { if (e.key === 'Enter') addPenalty(); });
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
});
