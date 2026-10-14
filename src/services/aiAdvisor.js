import { marked } from 'marked';

let customApiKey = localStorage.getItem('gh_advisor_ai_key') || '';
let aiProvider = localStorage.getItem('gh_advisor_ai_provider') || 'builtin'; // 'builtin' | 'gemini' | 'openai'

export const AiAdvisor = {
  getAiSettings() {
    return {
      provider: aiProvider,
      hasKey: !!customApiKey
    };
  },

  setAiSettings(provider, key) {
    aiProvider = provider || 'builtin';
    customApiKey = key ? key.trim() : '';
    localStorage.setItem('gh_advisor_ai_provider', aiProvider);
    if (customApiKey) {
      localStorage.setItem('gh_advisor_ai_key', customApiKey);
    } else {
      localStorage.removeItem('gh_advisor_ai_key');
    }
  },

  async askAdvisor(userMessage, context) {
    const { profile, auditResult, targetRole } = context;

    // If user configured custom Gemini API key
    if (aiProvider === 'gemini' && customApiKey) {
      try {
        return await this.callGeminiApi(userMessage, context, customApiKey);
      } catch (err) {
        console.warn('Gemini API call failed, falling back to built-in advisor:', err);
        const fallback = this.generateBuiltinResponse(userMessage, context);
        return `> ⚠️ *Note: Custom Gemini API call failed (${err.message}). Using built-in OctoAdvisor intelligence engine.*\n\n${fallback}`;
      }
    }

    // Default: Built-in intelligent context-aware reasoning engine
    // Add realistic thinking delay for smooth UX
    await new Promise(resolve => setTimeout(resolve, 550));
    return this.generateBuiltinResponse(userMessage, context);
  },

  async callGeminiApi(prompt, context, apiKey) {
    const { profile, auditResult, targetRole } = context;
    const systemInstruction = `You are OctoAdvisor, a world-class Principal Software Engineer and Elite Tech Recruiter who reviews hundreds of developer portfolios.
You provide encouraging, highly specific, technical, and actionable feedback to help software developers improve their GitHub portfolio, bridge skill gaps, and get hired.

CURRENT CANDIDATE CONTEXT:
- GitHub Username: ${profile.login} (${profile.name || profile.login})
- Target Career Role: ${targetRole.title}
- Overall Readiness Score: ${auditResult.overallScore}/100 (Grade: ${auditResult.gradeInfo.letter} - ${auditResult.gradeInfo.title})
- Dimensional Scores:
  * Documentation: ${auditResult.dimensions.documentation}/100
  * Code Quality: ${auditResult.dimensions.codeQuality}/100
  * Community Impact: ${auditResult.dimensions.impact}/100
  * Role Alignment: ${auditResult.dimensions.roleAlignment}/100
  * Repo Hygiene: ${auditResult.dimensions.hygiene}/100
- Missing Key Role Skills: ${auditResult.skillsAnalysis.missingRequired.join(', ') || 'None! Excellent coverage.'}
- Missing Advanced Skills: ${auditResult.skillsAnalysis.missingAdvanced.join(', ')}
- Top Repositories: ${auditResult.pinWorthyRepos.map(r => `${r.name} (${r.language || 'No lang'}, ${r.stargazers_count} stars, Homepage: ${r.homepage || 'None'}, License: ${r.license?.key || 'None'})`).join('; ')}

GUIDELINES:
- Be direct, professional, inspiring, and deeply specific to the candidate's actual projects.
- Format with clean GitHub markdown, emojis, bullet points, and code blocks where helpful.
- Offer concrete solutions, not generic platitudes.`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemInstruction}\n\nUser Question: ${prompt}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No response text returned from Gemini API.');
    return text;
  },

  generateBuiltinResponse(query, context) {
    const { profile, auditResult, targetRole } = context;
    const lower = query.toLowerCase();
    const topRepo = auditResult.pinWorthyRepos[0] || { name: 'primary-project', language: 'TypeScript' };
    const missing = auditResult.skillsAnalysis.missingRequired;
    const score = auditResult.overallScore;

    // Intent 1: How to get 90+ score / increase score
    if (lower.includes('90') || lower.includes('increase') || lower.includes('boost') || lower.includes('improve score')) {
      return `### 🎯 Blueprint to Reach a 90+ Readiness Score

Your portfolio currently scores **${score}/100** (${auditResult.gradeInfo.title}). To break into the elite **90+ Top-Tier Candidate** tier, focus on these highest-ROI leverage points:

1. **Deploy & Link Live Demonstrations (+12 pts)**
   - Repositories without live demo links force recruiters to clone and build locally, which 90% won't do.
   - For **\`${topRepo.name}\`**, deploy immediately to Vercel, Netlify, or Render, and populate the GitHub repo's \`About -> Website\` field.

2. **Fill Core Role Gap: ${missing[0] || 'CI/CD & Automated Testing'} (+15 pts)**
   - Your target role is **${targetRole.title}**. Recruiters specifically look for **${missing.slice(0, 2).join(' and ') || 'automated tests and Dockerization'}**.
   - Build a targeted project: *"${targetRole.recommendedProject.title}"* combining \`${targetRole.recommendedProject.stack.slice(0, 4).join(', ')}\`.

3. **Repository Licensing & Hygiene (+8 pts)**
   - Add standard MIT or Apache-2.0 licenses to all open repositories. Many corporate engineering teams are forbidden from looking at code without clear open-source licensing.

4. **Add Badges & Visual Architecture to READMEs (+6 pts)**
   - Use our built-in **AI README Generator** to embed Shields.io badges, architecture diagrams, and quick-start instructions into your top repos.`;
    }

    // Intent 2: Critique top project
    if (lower.includes('critique') || lower.includes('top repo') || lower.includes('top project') || lower.includes('flagship')) {
      const hasDemo = !!topRepo.homepage;
      const hasLicense = !!topRepo.license;

      return `### 🔍 Senior Recruiter Critique: \`${topRepo.name}\`

Here is an honest, high-caliber evaluation of your flagship project from a hiring manager's lens:

#### 🟢 What’s Working Great
- **Domain Relevance:** Built with \`${topRepo.language || 'Modern Web Stack'}\`, showing alignment with modern tech stacks.
- **Social Proof:** Garnered **${topRepo.stargazers_count} stars** and **${topRepo.forks_count} forks**, proving external interest.
- ${topRepo.description ? `**Clear Summary:** "${topRepo.description}" immediately frames the problem space.` : '**Needs Description:** Repo is currently missing an executive summary.'}

#### 🟡 Critical Gaps To Fix Immediately
${!hasDemo ? `- ❌ **No Live Deployment:** Recruiters spend an average of 30 seconds per repo. Without a live link at the top, your UI/code is practically invisible.` : `- ✅ **Live URL Present:** "${topRepo.homepage}" is a major green flag!`}
${!hasLicense ? `- ❌ **Missing Open-Source License:** Add an MIT license file so others can legally test and contribute.` : `- ✅ **Properly Licensed:** Governed under ${topRepo.license.name}.`}
- ⚠️ **Test Coverage:** Add a \`tests/\` suite with Vitest/Jest/PyTest and display a \`coverage > 85%\` badge in the README.

#### 💡 The Winning Differentiator
Add a short **"System Architecture & Engineering Decisions"** section explaining *why* you chose this stack, what scaling challenges you encountered, and how you solved them.`;
    }

    // Intent 3: Skill gaps & what to learn next
    if (lower.includes('skill') || lower.includes('gap') || lower.includes('learn') || lower.includes('missing')) {
      const primaryMissing = missing.slice(0, 3).join(', ') || 'Docker, CI/CD, and Integration Testing';
      const advMissing = auditResult.skillsAnalysis.missingAdvanced.slice(0, 3).join(', ') || 'Distributed Caching, Redis, and Performance Profiling';

      return `### ⚡ Skill Gap Intelligence for **${targetRole.title}**

Based on analyzing your repositories, commit artifacts, and topics:

| Category | Skills You Have Demonstrated | High-Priority Gaps |
| :--- | :--- | :--- |
| **Core Must-Haves** | \`${auditResult.skillsAnalysis.matchedRequired.slice(0, 4).join(', ') || 'JavaScript, Git, APIs'}\` | <span style="color:#f85149">**${primaryMissing}**</span> |
| **Advanced Edge** | \`${auditResult.skillsAnalysis.matchedAdvanced.slice(0, 3).join(', ') || 'Component Architecture'}\` | <span style="color:#e3b341">**${advMissing}**</span> |

#### 🚀 Recommended Action:
Do **not** just take online tutorial quizzes. Recruiters want to see skills proven in code. 
Build a 2-week capstone project:
- **Project Idea:** **${targetRole.recommendedProject.title}**
- **Recommended Stack:** \`${targetRole.recommendedProject.stack.join(', ')}\`
- **Core Value:** Solves the exact gap for **${missing[0] || 'production deployment'}** in an interview portfolio.`;
    }

    // Intent 4: Bio / Headline optimization
    if (lower.includes('bio') || lower.includes('headline') || lower.includes('about me') || lower.includes('profile')) {
      return `### ✍️ 3 Recruiter-Optimized GitHub Bios

Your current bio: *"${profile.bio || '(Empty)'}"*

Choose one of these 3 high-impact formulas tailored for **${targetRole.title}**:

#### Option 1: The Modern & Impact-Driven (Recommended)
\`\`\`text
${targetRole.title} @ ${profile.company || 'OpenSource'} • Crafting high-performance web systems with ${auditResult.stats.languages.slice(0, 3).join(', ') || 'TypeScript & React'}. Passionate about DX & scalable architecture.
\`\`\`

#### Option 2: The Tech Stack & Specialization Heavy
\`\`\`text
Building resilient distributed apps with ${auditResult.stats.languages.slice(0, 4).join(' / ') || 'TypeScript / Node / React'}. 🚀 Currently exploring ${missing[0] || 'AI agents & cloud scale'}. Open to ${targetRole.title} roles.
\`\`\`

#### Option 3: The Problem-Solver / Mission Oriented
\`\`\`text
Turning complex engineering challenges into clean, accessible digital products. Author of ${topRepo.name} (${topRepo.stargazers_count}★). Let's build something extraordinary.
\`\`\`

💡 **Recruiter Tip:** Always keep your location (\`${profile.location || 'Your City, State'}\`) and a clickable portfolio or LinkedIn URL in your header profile!`;
    }

    // Intent 5: Technical interview questions based on repos
    if (lower.includes('interview') || lower.includes('questions') || lower.includes('mock') || lower.includes('prep')) {
      return `### 🎙️ 5 Targeted Technical Interview Questions Based On Your Repos

A Senior Engineering Manager reviewing your profile before an interview will likely probe these exact topics:

1. **Architecture & State Management (Based on \`${topRepo.name}\`):**
   > *"Can you walk me through the component hierarchy and state flow in \`${topRepo.name}\`? What made you choose your current data-fetching strategy over alternatives?"*

2. **Performance & Optimization:**
   > *"If \`${topRepo.name}\` experienced a 100x spike in concurrent users tomorrow, what would be the first bottleneck to fail, and how would you profile and cache it?"*

3. **Error Handling & Resilience:**
   > *"How do you handle graceful degradation when external API dependencies or network requests time out in your client application?"*

4. **Testing & Code Quality:**
   > *"Walk me through your testing philosophy. If you had 3 days to add automated testing to your top projects, where would you prioritize unit vs integration tests?"*

5. **Trade-offs & Tech Selection:**
   > *"You used \`${topRepo.language || 'JavaScript'}\`. What was the biggest technical trade-off you had to accept with that choice, and what would you do differently on v2?"*`;
    }

    // Intent 6: Red flags
    if (lower.includes('red flag') || lower.includes('risks') || lower.includes('weakness') || lower.includes('mistake')) {
      return `### 🚨 Red Flag Audit: What Might Pause a Recruiter

Based on our simulated 6-second recruiter glance:

${auditResult.recruiterReview.redFlags.map(rf => `- ⚠️ **${rf}**`).join('\n')}

#### 🛡️ How to Neutralize These in 48 Hours:
1. **Archive or unlist empty/toy repos:** Delete or make private repos with zero commits or generic names like 'test' or 'practice'.
2. **Add a pinned repository row:** Select your top 4-6 flagship projects so visitors see your best work first.
3. **Commit consistency:** Maintain a green streak or active contribution history on GitHub over the last 30 days.`;
    }

    // Default conversational response
    return `### 👋 Hello! I'm OctoAdvisor, your AI Portfolio Mentor

I’ve audited **@${profile.login}**'s GitHub presence for the **${targetRole.title}** career path!

Here is your quick executive summary:
- **Readiness Score:** **${auditResult.overallScore}/100** (${auditResult.gradeInfo.title})
- **Top Flagship Repo:** \`${topRepo.name}\` (${topRepo.stargazers_count}★, ${topRepo.language || 'Web'})
- **Key Skill Priority:** Fill gap in **${missing[0] || 'CI/CD pipelines'}**
- **Recruiter Rating:** ${'⭐'.repeat(Math.floor(auditResult.recruiterReview.stars))} (${auditResult.recruiterReview.stars}/5)

What would you like to explore next?
- *"How do I get my score to 90+?"*
- *"Critique my top project \`${topRepo.name}\`"*
- *"What are my biggest skill gaps for ${targetRole.title}?"*
- *"Write an optimized bio for my GitHub profile"*
- *"Simulate technical interview questions for my code"*`;
  }
};
