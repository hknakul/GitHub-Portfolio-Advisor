import confetti from 'canvas-confetti';
import { marked } from 'marked';
import { GitHubApi } from './services/githubApi.js';
import { AuditEngine } from './services/auditEngine.js';
import { AiAdvisor } from './services/aiAdvisor.js';
import { ReadmeGenerator } from './services/readmeGenerator.js';
import { ROLE_BENCHMARKS } from './data/roleBenchmarks.js';
import './style.css';

// ---------------- Application State ----------------
const state = {
  profile: null,
  repos: [],
  targetRole: 'fullstack',
  auditResult: null,
  activeFilter: 'all',
  activeSort: 'health',
  chatOpen: false,
  chatMessages: [],
  sprintTasks: JSON.parse(localStorage.getItem('gh_sprint_tasks') || '{}')
};

// ---------------- DOM Element References ----------------
const elements = {
  // Search & Role
  searchForm: document.getElementById('searchForm'),
  usernameInput: document.getElementById('usernameInput'),
  roleSelect: document.getElementById('roleSelect'),
  btnAnalyze: document.getElementById('btnAnalyze'),
  analyzeSpinner: document.getElementById('analyzeSpinner'),
  demoChips: document.querySelectorAll('.demo-chip'),

  // Header & Rate Limit
  rateLimitBadge: document.getElementById('rateLimitBadge'),
  rateLimitText: document.getElementById('rateLimitText'),
  rateIndicator: document.getElementById('rateIndicator'),
  btnOpenTokenModal: document.getElementById('btnOpenTokenModal'),
  btnOpenAiModal: document.getElementById('btnOpenAiModal'),

  // Profile Hero
  profileAvatar: document.getElementById('profileAvatar'),
  profileName: document.getElementById('profileName'),
  profileLogin: document.getElementById('profileLogin'),
  profileHireable: document.getElementById('profileHireable'),
  profileBio: document.getElementById('profileBio'),
  metaCompany: document.getElementById('metaCompany'),
  metaLocation: document.getElementById('metaLocation'),
  metaBlog: document.getElementById('metaBlog'),
  metaGithub: document.getElementById('metaGithub'),
  statPublicRepos: document.getElementById('statPublicRepos'),
  statFollowers: document.getElementById('statFollowers'),
  statStars: document.getElementById('statStars'),

  // Overall Score
  overallScoreVal: document.getElementById('overallScoreVal'),
  scoreProgressRing: document.getElementById('scoreProgressRing'),
  gradeBadge: document.getElementById('gradeBadge'),
  tierTitle: document.getElementById('tierTitle'),
  tierDesc: document.getElementById('tierDesc'),

  // Dimensions
  dimDocVal: document.getElementById('dimDocVal'),
  dimDocBar: document.getElementById('dimDocBar'),
  dimQualityVal: document.getElementById('dimQualityVal'),
  dimQualityBar: document.getElementById('dimQualityBar'),
  dimImpactVal: document.getElementById('dimImpactVal'),
  dimImpactBar: document.getElementById('dimImpactBar'),
  dimRoleVal: document.getElementById('dimRoleVal'),
  dimRoleBar: document.getElementById('dimRoleBar'),
  dimHygieneVal: document.getElementById('dimHygieneVal'),
  dimHygieneBar: document.getElementById('dimHygieneBar'),
  quickWinsContainer: document.getElementById('quickWinsContainer'),
  btnAskAiAboutScore: document.getElementById('btnAskAiAboutScore'),

  // Tabs
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabContentPanels: document.querySelectorAll('.tab-content-panel'),
  tabReposCount: document.getElementById('tabReposCount'),
  tabSkillsBadge: document.getElementById('tabSkillsBadge'),
  tabRecruiterBadge: document.getElementById('tabRecruiterBadge'),
  tabSprintBadge: document.getElementById('tabSprintBadge'),

  // Repos Matrix
  reposGrid: document.getElementById('reposGrid'),
  filterPills: document.querySelectorAll('.filter-pill'),
  reposSortSelect: document.getElementById('reposSortSelect'),

  // Skills
  matchedSkillsList: document.getElementById('matchedSkillsList'),
  missingSkillsList: document.getElementById('missingSkillsList'),
  blueprintContainer: document.getElementById('blueprintContainer'),

  // Recruiter Simulation
  recruiterStars: document.getElementById('recruiterStars'),
  recruiterScoreText: document.getElementById('recruiterScoreText'),
  recruiterTier: document.getElementById('recruiterTier'),
  recruiterSalary: document.getElementById('recruiterSalary'),
  recruiterVerdict: document.getElementById('recruiterVerdict'),
  greenFlagsList: document.getElementById('greenFlagsList'),
  redFlagsList: document.getElementById('redFlagsList'),

  // Sprint Plan
  sprintWeeksContainer: document.getElementById('sprintWeeksContainer'),
  btnExportSprintMd: document.getElementById('btnExportSprintMd'),
  btnOptimizeBioModal: document.getElementById('btnOptimizeBioModal'),

  // AI Chat
  btnToggleChat: document.getElementById('btnToggleChat'),
  chatWindow: document.getElementById('chatWindow'),
  btnCloseChat: document.getElementById('btnCloseChat'),
  chatMessages: document.getElementById('chatMessages'),
  chatForm: document.getElementById('chatForm'),
  chatInput: document.getElementById('chatInput'),
  promptChips: document.querySelectorAll('.prompt-chip'),

  // Modals
  readmeModal: document.getElementById('readmeModal'),
  btnCloseReadmeModal: document.getElementById('btnCloseReadmeModal'),
  readmeRepoSelect: document.getElementById('readmeRepoSelect'),
  readmePreviewText: document.getElementById('readmePreviewText'),
  btnCopyReadme: document.getElementById('btnCopyReadme'),
  btnDownloadReadme: document.getElementById('btnDownloadReadme'),
  chkBadges: document.getElementById('chkBadges'),
  chkDemo: document.getElementById('chkDemo'),
  chkFeatures: document.getElementById('chkFeatures'),
  chkStack: document.getElementById('chkStack'),
  chkInstall: document.getElementById('chkInstall'),
  chkTree: document.getElementById('chkTree'),

  tokenModal: document.getElementById('tokenModal'),
  btnCloseTokenModal: document.getElementById('btnCloseTokenModal'),
  tokenInput: document.getElementById('tokenInput'),
  btnSaveToken: document.getElementById('btnSaveToken'),
  btnClearToken: document.getElementById('btnClearToken'),

  aiModal: document.getElementById('aiModal'),
  btnCloseAiModal: document.getElementById('btnCloseAiModal'),
  aiProviderSelect: document.getElementById('aiProviderSelect'),
  geminiKeyGroup: document.getElementById('geminiKeyGroup'),
  geminiKeyInput: document.getElementById('geminiKeyInput'),
  btnSaveAiSettings: document.getElementById('btnSaveAiSettings'),

  bioModal: document.getElementById('bioModal'),
  btnCloseBioModal: document.getElementById('btnCloseBioModal'),
  btnCloseBioModalBtn: document.getElementById('btnCloseBioModalBtn'),
  bioOptionsList: document.getElementById('bioOptionsList'),

  toastContainer: document.getElementById('toastContainer')
};

// ---------------- Helper Utilities ----------------
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span><span>${message}</span>`;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function updateRateLimitDisplay() {
  const rate = GitHubApi.getRateLimit();
  elements.rateLimitText.textContent = `Rate Limit: ${rate.remaining}/${rate.limit}`;
  if (rate.remaining <= 5) {
    elements.rateIndicator.style.backgroundColor = 'var(--accent-rose)';
    elements.rateIndicator.style.boxShadow = '0 0 8px var(--accent-rose)';
  } else if (rate.remaining <= 20) {
    elements.rateIndicator.style.backgroundColor = 'var(--accent-amber)';
    elements.rateIndicator.style.boxShadow = '0 0 8px var(--accent-amber)';
  } else {
    elements.rateIndicator.style.backgroundColor = 'var(--accent-green)';
    elements.rateIndicator.style.boxShadow = '0 0 8px var(--accent-green)';
  }
}

// ---------------- Core Audit & View Rendering ----------------
async function loadAndAuditProfile(username) {
  try {
    elements.btnAnalyze.disabled = true;
    elements.analyzeSpinner.style.display = 'inline';

    const res = await GitHubApi.fetchUserProfile(username);
    state.profile = res.data;
    state.repos = res.repos;

    updateRateLimitDisplay();

    // Perform deep audit calculation
    state.auditResult = AuditEngine.analyze(state.profile, state.repos, state.targetRole);

    renderAllViews();

    // Trigger celebration confetti on high readiness score
    if (state.auditResult.overallScore >= 80) {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 }
      });
    }

    showToast(`Audit complete for @${state.profile.login} (${state.auditResult.gradeInfo.title})`, 'success');

    // Add or update initial chat greeting
    if (state.chatMessages.length === 0) {
      addAiMessage(`👋 **Hello! I'm OctoAdvisor.** I've analyzed your GitHub portfolio for the **${state.auditResult.targetRole.title}** career path!\n\nYour portfolio readiness score is **${state.auditResult.overallScore}/100** (${state.auditResult.gradeInfo.letter} - ${state.auditResult.gradeInfo.title}). Ask me any question or tap a quick prompt above to get started!`);
    }

  } catch (err) {
    console.error('Audit failed:', err);
    showToast(err.message, 'error');
  } finally {
    elements.btnAnalyze.disabled = false;
    elements.analyzeSpinner.style.display = 'none';
  }
}

function renderAllViews() {
  renderProfileHero();
  renderScorecard();
  renderQuickWins();
  renderReposMatrix();
  renderSkillsGap();
  renderRecruiterSimulation();
  renderSprintPlan();
}

// 1. Profile Hero Section
function renderProfileHero() {
  const p = state.profile;
  elements.profileAvatar.src = p.avatar_url;
  elements.profileName.textContent = p.name || p.login;
  elements.profileLogin.textContent = `@${p.login}`;
  elements.profileBio.textContent = p.bio || 'No GitHub bio provided. Having a compelling bio boosts recruiter retention!';

  if (p.hireable) {
    elements.profileHireable.style.display = 'inline-flex';
  } else {
    elements.profileHireable.style.display = 'none';
  }

  // Meta items
  elements.metaCompany.querySelector('span').textContent = p.company || 'Independent';
  elements.metaLocation.querySelector('span').textContent = p.location || 'Remote / Unspecified';
  
  if (p.blog) {
    elements.metaBlog.href = p.blog.startsWith('http') ? p.blog : `https://${p.blog}`;
    elements.metaBlog.style.display = 'inline-flex';
    elements.metaBlog.querySelector('span').textContent = p.blog.replace(/^https?:\/\//, '').slice(0, 25);
  } else {
    elements.metaBlog.style.display = 'none';
  }

  elements.metaGithub.href = p.html_url || `https://github.com/${p.login}`;

  // Stats
  elements.statPublicRepos.textContent = state.repos.length;
  elements.statFollowers.textContent = p.followers || 0;
  elements.statStars.textContent = state.auditResult.stats.totalStars;
}

// 2. Scorecard & Radial Gauge
function renderScorecard() {
  const r = state.auditResult;
  const score = r.overallScore;

  elements.overallScoreVal.textContent = score;

  // SVG Radial stroke calculation (radius = 50, circumference = 2 * PI * 50 ≈ 314.16)
  const circumference = 314.16;
  const offset = circumference - (score / 100) * circumference;
  elements.scoreProgressRing.style.strokeDashoffset = offset;
  elements.scoreProgressRing.style.stroke = r.gradeInfo.color;

  elements.gradeBadge.textContent = `Grade ${r.gradeInfo.letter}`;
  elements.gradeBadge.style.color = r.gradeInfo.color;
  elements.gradeBadge.style.borderColor = r.gradeInfo.color;
  elements.gradeBadge.style.background = `${r.gradeInfo.color}20`;

  elements.tierTitle.textContent = r.gradeInfo.title;
  elements.tierDesc.textContent = r.gradeInfo.description;

  // Dimensions
  const d = r.dimensions;
  elements.dimDocVal.textContent = `${d.documentation}%`;
  elements.dimDocBar.style.width = `${d.documentation}%`;

  elements.dimQualityVal.textContent = `${d.codeQuality}%`;
  elements.dimQualityBar.style.width = `${d.codeQuality}%`;

  elements.dimImpactVal.textContent = `${d.impact}%`;
  elements.dimImpactBar.style.width = `${d.impact}%`;

  elements.dimRoleVal.textContent = `${d.roleAlignment}%`;
  elements.dimRoleBar.style.width = `${d.roleAlignment}%`;

  elements.dimHygieneVal.textContent = `${d.hygiene}%`;
  elements.dimHygieneBar.style.width = `${d.hygiene}%`;

  // Tab badges
  elements.tabReposCount.textContent = state.repos.length;
  elements.tabSkillsBadge.textContent = `${d.roleAlignment}%`;
  elements.tabRecruiterBadge.textContent = `${r.recruiterReview.stars}★`;
}

// 3. High Impact Quick Wins
function renderQuickWins() {
  const wins = state.auditResult.quickWins;
  elements.quickWinsContainer.innerHTML = '';

  if (wins.length === 0) {
    elements.quickWinsContainer.innerHTML = `<div style="font-size:0.85rem; color:var(--text-muted); grid-column:1/-1;">🎉 No immediate red flags found! Your portfolio follows great hygiene standards.</div>`;
    return;
  }

  wins.forEach(win => {
    const item = document.createElement('div');
    item.className = 'quick-win-item';
    item.innerHTML = `
      <div class="win-badge-row">
        <span class="win-points-badge">${win.impact}</span>
        <span class="win-category-tag">${win.category}</span>
      </div>
      <div class="win-title">${win.title}</div>
      <div class="win-action-desc">${win.action}</div>
    `;
    elements.quickWinsContainer.appendChild(item);
  });
}

// 4. Repositories Matrix
function renderReposMatrix() {
  let repos = [...state.auditResult.allRepos];

  // Filtering
  if (state.activeFilter === 'flagship') {
    repos = repos.filter(r => r.isPinWorthy);
  } else if (state.activeFilter === 'warnings') {
    repos = repos.filter(r => r.warnings.length > 0);
  }

  // Sorting
  if (state.activeSort === 'stars') {
    repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
  } else if (state.activeSort === 'updated') {
    repos.sort((a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at));
  } else if (state.activeSort === 'name') {
    repos.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // health score
    repos.sort((a, b) => b.healthScore - a.healthScore);
  }

  elements.reposGrid.innerHTML = '';

  if (repos.length === 0) {
    elements.reposGrid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted);">
        No repositories matched the selected filter.
      </div>
    `;
    return;
  }

  repos.forEach(repo => {
    const card = document.createElement('div');
    card.className = `repo-card ${repo.isPinWorthy ? 'pin-worthy' : ''}`;

    let healthScoreClass = 'score-green';
    if (repo.healthScore < 50) healthScoreClass = 'score-red';
    else if (repo.healthScore < 75) healthScoreClass = 'score-yellow';

    const warningsHtml = repo.warnings.length > 0 ? `
      <div class="repo-warnings-box">
        ${repo.warnings.slice(0, 2).map(w => `
          <div class="repo-warning-line ${w.type}">
            <span>${w.type === 'danger' ? '⛔' : w.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
            <span>${w.text}</span>
          </div>
        `).join('')}
      </div>
    ` : '';

    const topicsHtml = (repo.topics && repo.topics.length > 0) ? `
      <div class="repo-topics-row">
        ${repo.topics.slice(0, 4).map(t => `<span class="topic-tag">#${t}</span>`).join('')}
      </div>
    ` : '';

    card.innerHTML = `
      <div>
        ${repo.isPinWorthy ? `<div class="repo-pin-badge">⭐ Recommended Pin Flagship</div>` : ''}
        
        <div class="repo-card-header">
          <a href="${repo.html_url}" target="_blank" rel="noopener" class="repo-name-link">
            <span>📦</span>
            <span>${repo.name}</span>
          </a>
          <span class="repo-health-pill ${healthScoreClass}">
            Health ${repo.healthScore}%
          </span>
        </div>

        <p class="repo-description ${!repo.description ? 'missing' : ''}">
          ${repo.description || '⚠️ No description provided. Add 1 sentence describing what this project does.'}
        </p>

        ${topicsHtml}
        ${warningsHtml}
      </div>

      <div class="repo-footer-meta">
        <div class="repo-stats-group">
          <span>★ ${repo.stargazers_count || 0}</span>
          <span>🍴 ${repo.forks_count || 0}</span>
          <span>💻 ${repo.language || 'Plain'}</span>
        </div>

        <div class="repo-action-btns">
          <button class="btn-sm-action btn-gen-readme" data-repo-id="${repo.id}">
            ✨ README
          </button>
          ${repo.homepage ? `
            <a href="${repo.homepage}" target="_blank" rel="noopener" class="btn-sm-action">
              Demo ↗
            </a>
          ` : ''}
        </div>
      </div>
    `;

    // Click event for README generator button
    card.querySelector('.btn-gen-readme').addEventListener('click', () => {
      openReadmeModal(repo);
    });

    elements.reposGrid.appendChild(card);
  });
}

// 5. Skill Gap Analysis
function renderSkillsGap() {
  const sa = state.auditResult.skillsAnalysis;

  // Matched Skills
  elements.matchedSkillsList.innerHTML = '';
  if (sa.matchedRequired.length === 0 && sa.matchedAdvanced.length === 0) {
    elements.matchedSkillsList.innerHTML = `<span style="color:var(--text-muted); font-size:0.85rem;">No exact role keywords identified in descriptions/topics yet.</span>`;
  } else {
    sa.matchedRequired.forEach(skill => {
      elements.matchedSkillsList.innerHTML += `
        <span class="skill-badge matched">✓ ${skill} (Core)</span>
      `;
    });
    sa.matchedAdvanced.forEach(skill => {
      elements.matchedSkillsList.innerHTML += `
        <span class="skill-badge matched">✓ ${skill} (Adv)</span>
      `;
    });
  }

  // Missing Skills
  elements.missingSkillsList.innerHTML = '';
  if (sa.missingRequired.length === 0) {
    elements.missingSkillsList.innerHTML = `<span class="skill-badge matched">🎉 100% Core Role Requirements Covered!</span>`;
  } else {
    sa.missingRequired.forEach(skill => {
      elements.missingSkillsList.innerHTML += `
        <span class="skill-badge missing-crit">✕ ${skill}</span>
      `;
    });
  }
  sa.missingAdvanced.forEach(skill => {
    elements.missingSkillsList.innerHTML += `
      <span class="skill-badge missing-adv">△ ${skill} (Bonus)</span>
    `;
  });

  // Gap-Bridging Project Blueprint
  const bp = sa.recommendedProject;
  elements.blueprintContainer.innerHTML = `
    <h3 class="blueprint-title">🏗️ ${bp.title}</h3>
    <p class="blueprint-pitch">${bp.pitch}</p>

    <div class="blueprint-grid">
      <div class="blueprint-box">
        <div class="blueprint-box-title">Recommended Tech Stack</div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${bp.stack.map(s => `<span class="topic-tag" style="background:rgba(139,92,246,0.15); border-color:rgba(139,92,246,0.3); color:#c084fc;">${s}</span>`).join('')}
        </div>
      </div>

      <div class="blueprint-box">
        <div class="blueprint-box-title">Key Engineering Objectives to Implement</div>
        <ul class="blueprint-features-list">
          ${bp.features.map(f => `<li><span>⚡</span><span>${f}</span></li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

// 6. Recruiter 6-Second Glance Simulation
function renderRecruiterSimulation() {
  const r = state.auditResult.recruiterReview;

  const fullStars = Math.floor(r.stars);
  const halfStar = r.stars % 1 >= 0.5 ? '½' : '';
  elements.recruiterStars.textContent = '★'.repeat(fullStars) + halfStar;
  elements.recruiterScoreText.textContent = `${r.stars} / 5.0`;
  elements.recruiterTier.textContent = r.estimatedTier;
  elements.recruiterSalary.textContent = r.salaryEstimate;
  elements.recruiterVerdict.textContent = r.verdict;

  // Green flags
  elements.greenFlagsList.innerHTML = '';
  r.greenFlags.forEach(f => {
    elements.greenFlagsList.innerHTML += `
      <li class="flag-item">
        <span class="flag-icon-green">✓</span>
        <span>${f}</span>
      </li>
    `;
  });

  // Red flags
  elements.redFlagsList.innerHTML = '';
  if (r.redFlags.length === 0) {
    elements.redFlagsList.innerHTML = `
      <li class="flag-item">
        <span class="flag-icon-green">✓</span>
        <span>Zero major flags detected! Profile presents high polish.</span>
      </li>
    `;
  } else {
    r.redFlags.forEach(f => {
      elements.redFlagsList.innerHTML += `
        <li class="flag-item">
          <span class="flag-icon-red">✕</span>
          <span>${f}</span>
        </li>
      `;
    });
  }
}

// 7. 30-Day Sprint Action Plan
const SPRINT_WEEKS = [
  {
    week: 1,
    title: 'Week 1: Repository Hygiene & Profile First Impressions',
    tasks: [
      { id: 'w1-1', text: 'Write a high-converting profile bio highlighting your core specialty and location' },
      { id: 'w1-2', text: 'Add 1-sentence value propositions in the About section of all public repos' },
      { id: 'w1-3', text: 'Add open-source MIT or Apache licenses to every active public repository' },
      { id: 'w1-4', text: 'Archive or make private any empty, abandoned, or toy practice repos' }
    ]
  },
  {
    week: 2,
    title: 'Week 2: Polish Top 3 Flagship Repositories & Live Demos',
    tasks: [
      { id: 'w2-1', text: 'Pin your top 4-6 flagship repositories to the GitHub profile overview' },
      { id: 'w2-2', text: 'Deploy live demos on Vercel, Netlify, or Pages and link in repo About settings' },
      { id: 'w2-3', text: 'Upgrade READMEs with Shields.io badges, architecture diagrams, and quickstart commands' },
      { id: 'w2-4', text: 'Tag all repositories with role-specific topics (e.g. #react, #docker, #typescript)' }
    ]
  },
  {
    week: 3,
    title: 'Week 3: Bridge Primary Skill Gaps (Build Capstone Feature)',
    tasks: [
      { id: 'w3-1', text: 'Begin building recommended capstone project addressing role skill gaps' },
      { id: 'w3-2', text: 'Implement automated CI/CD pipeline with GitHub Actions running tests and linter' },
      { id: 'w3-3', text: 'Add unit and integration tests achieving at least 80% test coverage' },
      { id: 'w3-4', text: 'Include Dockerfile and docker-compose.yml for zero-friction local setup' }
    ]
  },
  {
    week: 4,
    title: 'Week 4: Recruiter Optimization & Open-Source Footprint',
    tasks: [
      { id: 'w4-1', text: 'Open a quality pull request or fix an open issue in a well-known open-source repo' },
      { id: 'w4-2', text: 'Publish a technical writeup or architecture breakdown on Dev.to, Hashnode, or personal blog' },
      { id: 'w4-3', text: 'Ensure GitHub contribution graph shows consistent commit activity over the past 30 days' },
      { id: 'w4-4', text: 'Simulate mock technical interview questions using OctoAdvisor AI before applying' }
    ]
  }
];

function renderSprintPlan() {
  elements.sprintWeeksContainer.innerHTML = '';
  let completedCount = 0;
  let totalTasks = 0;

  SPRINT_WEEKS.forEach(week => {
    const card = document.createElement('div');
    card.className = 'sprint-week-card';

    let tasksHtml = '';
    week.tasks.forEach(task => {
      totalTasks++;
      const isDone = !!state.sprintTasks[task.id];
      if (isDone) completedCount++;

      tasksHtml += `
        <label class="sprint-task-item ${isDone ? 'completed' : ''}" data-task-id="${task.id}">
          <input type="checkbox" class="sprint-checkbox" ${isDone ? 'checked' : ''} />
          <span class="sprint-task-text">${task.text}</span>
        </label>
      `;
    });

    card.innerHTML = `
      <div class="week-header-row">
        <h4 class="week-title">${week.title}</h4>
      </div>
      <div class="sprint-checklist">
        ${tasksHtml}
      </div>
    `;

    // Bind checkboxes
    card.querySelectorAll('.sprint-task-item').forEach(el => {
      const checkbox = el.querySelector('input');
      const taskId = el.getAttribute('data-task-id');

      checkbox.addEventListener('change', (e) => {
        state.sprintTasks[taskId] = e.target.checked;
        localStorage.setItem('gh_sprint_tasks', JSON.stringify(state.sprintTasks));
        renderSprintPlan();
      });
    });

    elements.sprintWeeksContainer.appendChild(card);
  });

  elements.tabSprintBadge.textContent = `${completedCount}/${totalTasks}`;
}

// ---------------- Interactive AI Chat Implementation ----------------
function toggleChat(forceOpen = null) {
  if (forceOpen !== null) {
    state.chatOpen = forceOpen;
  } else {
    state.chatOpen = !state.chatOpen;
  }

  if (state.chatOpen) {
    elements.chatWindow.classList.remove('hidden');
    elements.chatInput.focus();
  } else {
    elements.chatWindow.classList.add('hidden');
  }
}

function addAiMessage(markdownText) {
  state.chatMessages.push({ role: 'ai', text: markdownText });
  renderChatMessages();
}

function addUserMessage(text) {
  state.chatMessages.push({ role: 'user', text });
  renderChatMessages();
}

function renderChatMessages() {
  elements.chatMessages.innerHTML = '';
  state.chatMessages.forEach(msg => {
    const row = document.createElement('div');
    row.className = `chat-message-row ${msg.role}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    
    if (msg.role === 'ai') {
      bubble.innerHTML = marked.parse(msg.text);
    } else {
      bubble.textContent = msg.text;
    }

    row.appendChild(bubble);
    elements.chatMessages.appendChild(row);
  });

  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

async function handleChatSubmit(text) {
  if (!text || text.trim() === '') return;
  const userText = text.trim();
  addUserMessage(userText);
  elements.chatInput.value = '';

  // Show temporary thinking state
  const thinkingId = 'thinking-' + Date.now();
  const row = document.createElement('div');
  row.className = 'chat-message-row ai';
  row.id = thinkingId;
  row.innerHTML = `<div class="chat-bubble" style="color:var(--text-muted); font-style:italic;">OctoAdvisor is synthesizing recommendation...</div>`;
  elements.chatMessages.appendChild(row);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;

  try {
    const aiResponse = await AiAdvisor.askAdvisor(userText, {
      profile: state.profile,
      auditResult: state.auditResult,
      targetRole: state.auditResult.targetRole
    });

    // Remove thinking message
    const thinkingEl = document.getElementById(thinkingId);
    if (thinkingEl) thinkingEl.remove();

    addAiMessage(aiResponse);
  } catch (err) {
    const thinkingEl = document.getElementById(thinkingId);
    if (thinkingEl) thinkingEl.remove();
    addAiMessage(`❌ Sorry, I encountered an error: ${err.message}`);
  }
}

// ---------------- README Generator Modal ----------------
function openReadmeModal(selectedRepo = null) {
  // Populate dropdown
  elements.readmeRepoSelect.innerHTML = '';
  state.repos.forEach(repo => {
    const opt = document.createElement('option');
    opt.value = repo.name;
    opt.textContent = `${repo.name} (${repo.language || 'Web'})`;
    elements.readmeRepoSelect.appendChild(opt);
  });

  if (selectedRepo) {
    elements.readmeRepoSelect.value = selectedRepo.name;
  }

  updateReadmePreview();
  elements.readmeModal.classList.add('open');
}

function updateReadmePreview() {
  const repoName = elements.readmeRepoSelect.value;
  const repo = state.repos.find(r => r.name === repoName) || state.repos[0];
  if (!repo) return;

  const options = {
    badges: elements.chkBadges.checked,
    demo: elements.chkDemo.checked,
    features: elements.chkFeatures.checked,
    stack: elements.chkStack.checked,
    install: elements.chkInstall.checked,
    tree: elements.chkTree.checked
  };

  const md = ReadmeGenerator.generate(repo, state.profile, options);
  elements.readmePreviewText.value = md;
}

// ---------------- Bio Optimizer Modal ----------------
function openBioModal() {
  const user = state.profile;
  const role = state.auditResult.targetRole;
  const topRepo = state.auditResult.pinWorthyRepos[0] || { name: 'flagship-project', stargazers_count: 50 };
  const languages = state.auditResult.stats.languages.slice(0, 3).join(', ') || 'TypeScript, React & Node.js';

  const bios = [
    {
      title: '⚡ High Impact & Punchy (Recruiter Favorite)',
      text: `${role.title} • Crafting robust, scalable web products with ${languages}. Open to high-impact opportunities in ${user.location || 'remote/hybrid'}.`
    },
    {
      title: '🛠️ Stack & Engineering Focused',
      text: `Building resilient architectures with ${languages}. Creator of @${user.login}/${topRepo.name}. Passionate about clean code, automated CI/CD, and developer experience.`
    },
    {
      title: '🚀 Problem Solver & Mission Oriented',
      text: `Transforming complex engineering challenges into elegant software. ${role.title} dedicated to accessibility, performance, and building products users love.`
    },
    {
      title: '🌟 Open Source & Collaboration',
      text: `Open source builder & ${role.title}. Exploring scalable distributed systems. Let's build something extraordinary together!`
    }
  ];

  elements.bioOptionsList.innerHTML = '';
  bios.forEach(b => {
    const item = document.createElement('div');
    item.style.cssText = 'background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px;';
    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-weight: 700; font-size: 0.85rem; color: var(--accent-cyan);">${b.title}</span>
        <button class="btn-sm-action btn-copy-bio">📋 Copy</button>
      </div>
      <p style="font-size: 0.85rem; color: #e2e8f0; line-height: 1.4;">${b.text}</p>
    `;
    item.querySelector('.btn-copy-bio').addEventListener('click', () => {
      navigator.clipboard.writeText(b.text);
      showToast('Bio copied to clipboard! Paste it into your GitHub Profile Settings.', 'success');
    });
    elements.bioOptionsList.appendChild(item);
  });

  elements.bioModal.classList.add('open');
}

// ---------------- Event Listeners Wire-up ----------------
function setupEventListeners() {
  // Search Form Submit
  elements.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = elements.usernameInput.value.trim();
    if (username) {
      loadAndAuditProfile(username);
    }
  });

  // Role Select Change
  elements.roleSelect.addEventListener('change', (e) => {
    state.targetRole = e.target.value;
    if (state.profile && state.repos) {
      state.auditResult = AuditEngine.analyze(state.profile, state.repos, state.targetRole);
      renderAllViews();
      showToast(`Audit recalibrated for ${state.auditResult.targetRole.title}`, 'info');
    }
  });

  // Demo Chips Click
  elements.demoChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.demoChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const username = chip.getAttribute('data-username');
      elements.usernameInput.value = username;

      // Automatically select appropriate matching role for demo profile
      if (username === 'priya-ml-ai') {
        elements.roleSelect.value = 'ai-ml';
        state.targetRole = 'ai-ml';
      } else if (username === 'jordan-codecraft') {
        elements.roleSelect.value = 'frontend';
        state.targetRole = 'frontend';
      } else if (username === 'marcus-devops') {
        elements.roleSelect.value = 'devops';
        state.targetRole = 'devops';
      } else {
        elements.roleSelect.value = 'fullstack';
        state.targetRole = 'fullstack';
      }

      loadAndAuditProfile(username);
    });
  });

  // Tabs Switching
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tabName = btn.getAttribute('data-tab');
      elements.tabContentPanels.forEach(panel => {
        panel.style.display = 'none';
      });

      if (tabName === 'repos') document.getElementById('tabViewRepos').style.display = 'block';
      else if (tabName === 'skills') document.getElementById('tabViewSkills').style.display = 'block';
      else if (tabName === 'recruiter') document.getElementById('tabViewRecruiter').style.display = 'block';
      else if (tabName === 'sprint') document.getElementById('tabViewSprint').style.display = 'block';
    });
  });

  // Repos Filter Pills
  elements.filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      elements.filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeFilter = pill.getAttribute('data-filter');
      renderReposMatrix();
    });
  });

  // Repos Sort Select
  elements.reposSortSelect.addEventListener('change', (e) => {
    state.activeSort = e.target.value;
    renderReposMatrix();
  });

  // Ask AI about score button
  elements.btnAskAiAboutScore.addEventListener('click', () => {
    toggleChat(true);
    handleChatSubmit('How can I increase my portfolio readiness score to 90+?');
  });

  // Chat Drawer toggle
  elements.btnToggleChat.addEventListener('click', () => toggleChat());
  elements.btnCloseChat.addEventListener('click', () => toggleChat(false));

  // Chat Form Submit
  elements.chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleChatSubmit(elements.chatInput.value);
  });

  // Chat Prompt Chips
  elements.promptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      toggleChat(true);
      handleChatSubmit(prompt);
    });
  });

  // README Modal
  elements.btnCloseReadmeModal.addEventListener('click', () => elements.readmeModal.classList.remove('open'));
  elements.readmeRepoSelect.addEventListener('change', updateReadmePreview);
  [
    elements.chkBadges, elements.chkDemo, elements.chkFeatures, 
    elements.chkStack, elements.chkInstall, elements.chkTree
  ].forEach(chk => chk.addEventListener('change', updateReadmePreview));

  elements.btnCopyReadme.addEventListener('click', () => {
    navigator.clipboard.writeText(elements.readmePreviewText.value);
    showToast('README markdown copied to clipboard!', 'success');
  });

  elements.btnDownloadReadme.addEventListener('click', () => {
    const text = elements.readmePreviewText.value;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `README-${elements.readmeRepoSelect.value}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded README file successfully!', 'success');
  });

  // Token Modal
  elements.btnOpenTokenModal.addEventListener('click', () => {
    elements.tokenInput.value = GitHubApi.getToken();
    elements.tokenModal.classList.add('open');
  });
  elements.rateLimitBadge.addEventListener('click', () => {
    elements.tokenInput.value = GitHubApi.getToken();
    elements.tokenModal.classList.add('open');
  });
  elements.btnCloseTokenModal.addEventListener('click', () => elements.tokenModal.classList.remove('open'));

  elements.btnSaveToken.addEventListener('click', () => {
    GitHubApi.setToken(elements.tokenInput.value);
    elements.tokenModal.classList.remove('open');
    showToast('GitHub token configured! Rate limit increased to 5,000/hr.', 'success');
    updateRateLimitDisplay();
  });

  elements.btnClearToken.addEventListener('click', () => {
    GitHubApi.setToken('');
    elements.tokenInput.value = '';
    elements.tokenModal.classList.remove('open');
    showToast('GitHub token cleared.', 'info');
    updateRateLimitDisplay();
  });

  // AI Modal
  elements.btnOpenAiModal.addEventListener('click', () => {
    const settings = AiAdvisor.getAiSettings();
    elements.aiProviderSelect.value = settings.provider;
    elements.geminiKeyGroup.style.display = settings.provider === 'gemini' ? 'block' : 'none';
    elements.aiModal.classList.add('open');
  });
  elements.btnCloseAiModal.addEventListener('click', () => elements.aiModal.classList.remove('open'));

  elements.aiProviderSelect.addEventListener('change', (e) => {
    elements.geminiKeyGroup.style.display = e.target.value === 'gemini' ? 'block' : 'none';
  });

  elements.btnSaveAiSettings.addEventListener('click', () => {
    const provider = elements.aiProviderSelect.value;
    const key = elements.geminiKeyInput.value;
    AiAdvisor.setAiSettings(provider, key);
    elements.aiModal.classList.remove('open');
    showToast(`AI settings updated: using ${provider === 'gemini' ? 'Gemini Flash LLM' : 'Built-in Expert Engine'}.`, 'success');
  });

  // Bio Modal
  elements.btnOptimizeBioModal.addEventListener('click', openBioModal);
  elements.btnCloseBioModal.addEventListener('click', () => elements.bioModal.classList.remove('open'));
  elements.btnCloseBioModalBtn.addEventListener('click', () => elements.bioModal.classList.remove('open'));

  // Export 30-Day Sprint to Markdown
  elements.btnExportSprintMd.addEventListener('click', () => {
    const user = state.profile;
    const role = state.auditResult.targetRole;
    let md = `# 🚀 30-Day Portfolio Transformation Sprint\n\n`;
    md += `**Candidate:** @${user.login} (${user.name || user.login})\n`;
    md += `**Target Role:** ${role.title}\n`;
    md += `**Starting Score:** ${state.auditResult.overallScore}/100\n\n`;
    md += `---\n\n`;

    SPRINT_WEEKS.forEach(week => {
      md += `### ${week.title}\n\n`;
      week.tasks.forEach(task => {
        const checked = !!state.sprintTasks[task.id] ? '[x]' : '[ ]';
        md += `- ${checked} ${task.text}\n`;
      });
      md += `\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `30-Day-Sprint-Plan-${user.login}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported 30-Day Sprint Plan as Markdown!', 'success');
  });

  // Close modals on clicking outside
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  });
}

// ---------------- Application Bootstrap ----------------
function init() {
  setupEventListeners();
  updateRateLimitDisplay();

  // Load initial demo profile
  loadAndAuditProfile('alexrivera-dev');
}

// Launch app
init();
