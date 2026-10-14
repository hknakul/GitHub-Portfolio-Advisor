import { ROLE_BENCHMARKS } from '../data/roleBenchmarks.js';

export const AuditEngine = {
  analyze(profileData, repos, targetRoleId = 'fullstack') {
    const user = profileData;
    const allRepos = repos || [];
    const nonForkRepos = allRepos.filter(r => !r.fork);
    const activeRepos = nonForkRepos.length > 0 ? nonForkRepos : allRepos;
    const roleBenchmark = ROLE_BENCHMARKS[targetRoleId] || ROLE_BENCHMARKS['fullstack'];

    // 1. Calculate Documentation Score (0 - 100)
    let docScore = 0;
    if (activeRepos.length > 0) {
      const withDescription = activeRepos.filter(r => r.description && r.description.trim().length > 10).length;
      const withHomepage = activeRepos.filter(r => r.homepage && r.homepage.trim().length > 5).length;
      const withLicense = activeRepos.filter(r => r.license && r.license.key).length;
      const withReadme = activeRepos.filter(r => r.has_readme).length;

      const descRatio = withDescription / activeRepos.length;
      const homeRatio = Math.min(1, withHomepage / Math.min(3, activeRepos.length));
      const licRatio = withLicense / activeRepos.length;
      const readmeRatio = withReadme / activeRepos.length;

      docScore = Math.round(
        (descRatio * 30) +
        (homeRatio * 30) +
        (licRatio * 20) +
        (readmeRatio * 20)
      );
    } else {
      docScore = 20;
    }

    // 2. Calculate Code Quality & Breadth Score (0 - 100)
    let qualityScore = 0;
    const languageSet = new Set();
    const topicSet = new Set();
    let hasTestsCount = 0;
    let hasCiCount = 0;

    activeRepos.forEach(r => {
      if (r.language) languageSet.add(r.language);
      if (r.topics && Array.isArray(r.topics)) {
        r.topics.forEach(t => topicSet.add(t.toLowerCase()));
      }
      if (r.has_tests) hasTestsCount++;
      if (r.has_ci) hasCiCount++;
    });

    const langScore = Math.min(30, languageSet.size * 10);
    const topicScore = Math.min(30, topicSet.size * 4);
    const testCiScore = Math.min(40, (hasTestsCount * 15) + (hasCiCount * 15) + 10);

    qualityScore = Math.min(100, Math.round(langScore + topicScore + testCiScore));

    // 3. Calculate Community & Impact Score (0 - 100)
    const totalStars = activeRepos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
    const totalForks = activeRepos.reduce((acc, r) => acc + (r.forks_count || 0), 0);
    const followers = user.followers || 0;

    let impactScore = 20; // baseline
    if (totalStars > 500) impactScore += 40;
    else if (totalStars > 100) impactScore += 30;
    else if (totalStars > 20) impactScore += 20;
    else if (totalStars > 0) impactScore += 10;

    if (totalForks > 50) impactScore += 20;
    else if (totalForks > 10) impactScore += 15;
    else if (totalForks > 0) impactScore += 8;

    if (followers > 200) impactScore += 20;
    else if (followers > 50) impactScore += 15;
    else if (followers > 10) impactScore += 10;

    impactScore = Math.min(100, impactScore);

    // 4. Role Alignment & Skill Gap
    const detectedSkills = this.extractSkills(user, activeRepos);
    const requiredSkills = roleBenchmark.requiredSkills;
    const advancedSkills = roleBenchmark.advancedSkills;

    const matchedRequired = requiredSkills.filter(skill => 
      this.isSkillMatched(skill, detectedSkills)
    );
    const missingRequired = requiredSkills.filter(skill => 
      !this.isSkillMatched(skill, detectedSkills)
    );

    const matchedAdvanced = advancedSkills.filter(skill => 
      this.isSkillMatched(skill, detectedSkills)
    );
    const missingAdvanced = advancedSkills.filter(skill => 
      !this.isSkillMatched(skill, detectedSkills)
    );

    const matchPercentage = Math.round(
      ((matchedRequired.length / requiredSkills.length) * 0.7 +
       (matchedAdvanced.length / advancedSkills.length) * 0.3) * 100
    );

    const roleAlignmentScore = matchPercentage;

    // 5. Repository Hygiene Score (0 - 100)
    let hygieneScore = 40;
    if (user.bio && user.bio.trim().length > 15) hygieneScore += 15;
    if (user.blog || user.email || user.location) hygieneScore += 15;
    
    // Check for stale repos (no push in > 1 year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const recentRepos = activeRepos.filter(r => new Date(r.pushed_at || r.updated_at) > oneYearAgo);
    const recencyRatio = activeRepos.length > 0 ? recentRepos.length / activeRepos.length : 0.5;
    hygieneScore += Math.round(recencyRatio * 20);

    // Penalty for empty repo descriptions
    const emptyDesc = activeRepos.filter(r => !r.description || r.description.trim() === '').length;
    if (emptyDesc === 0 && activeRepos.length > 0) hygieneScore += 10;
    else hygieneScore = Math.max(20, hygieneScore - (emptyDesc * 5));

    hygieneScore = Math.min(100, Math.max(10, hygieneScore));

    // Overall Weighted Score (0 - 100)
    const overallScore = Math.round(
      (docScore * 0.25) +
      (qualityScore * 0.20) +
      (impactScore * 0.20) +
      (roleAlignmentScore * 0.20) +
      (hygieneScore * 0.15)
    );

    // Letter Grade & Level
    const gradeInfo = this.getGradeInfo(overallScore);

    // Flagship Pin-worthy recommendations
    const rankedRepos = this.rankRepositories(activeRepos);
    const pinWorthyRepos = rankedRepos.slice(0, 6);

    // High Impact Quick Wins
    const quickWins = this.generateQuickWins(user, activeRepos, docScore, qualityScore, missingRequired);

    // Recruiter 6-Second Simulation
    const recruiterReview = this.simulateRecruiterReview(user, activeRepos, overallScore, roleBenchmark, missingRequired);

    return {
      overallScore,
      gradeInfo,
      dimensions: {
        documentation: docScore,
        codeQuality: qualityScore,
        impact: impactScore,
        roleAlignment: roleAlignmentScore,
        hygiene: hygieneScore
      },
      stats: {
        totalRepos: allRepos.length,
        originalRepos: activeRepos.length,
        totalStars,
        totalForks,
        followers: user.followers || 0,
        following: user.following || 0,
        languagesCount: languageSet.size,
        languages: Array.from(languageSet)
      },
      detectedSkills,
      skillsAnalysis: {
        matchedRequired,
        missingRequired,
        matchedAdvanced,
        missingAdvanced,
        matchPercentage,
        recommendedProject: roleBenchmark.recommendedProject
      },
      pinWorthyRepos,
      allRepos: rankedRepos,
      quickWins,
      recruiterReview,
      targetRole: roleBenchmark
    };
  },

  extractSkills(user, repos) {
    const rawSkills = new Set();

    // From user bio
    if (user.bio) {
      const bioWords = user.bio.split(/[\s,./|&+-]+/);
      bioWords.forEach(w => rawSkills.add(w.toLowerCase()));
    }

    // From repos languages and topics
    repos.forEach(repo => {
      if (repo.language) rawSkills.add(repo.language.toLowerCase());
      if (repo.topics && Array.isArray(repo.topics)) {
        repo.topics.forEach(t => rawSkills.add(t.toLowerCase()));
      }
      if (repo.description) {
        const descWords = repo.description.split(/[\s,./|&+-]+/);
        descWords.forEach(w => rawSkills.add(w.toLowerCase()));
      }
    });

    return Array.from(rawSkills);
  },

  isSkillMatched(benchmarkSkill, detectedSkills) {
    const clean = benchmarkSkill.toLowerCase();
    
    // Exact or direct alias matching
    if (detectedSkills.includes(clean)) return true;

    // Mapping synonyms / aliases
    const aliases = {
      'javascript': ['js', 'es6', 'vanilla-js'],
      'typescript': ['ts'],
      'react': ['reactjs', 'nextjs', 'next.js', 'react-native'],
      'node.js': ['nodejs', 'node', 'express', 'fastify', 'nest', 'nestjs'],
      'python': ['py', 'fastapi', 'flask', 'django', 'pytorch', 'tensorflow'],
      'postgresql': ['postgres', 'psql', 'sql', 'prisma', 'typeorm'],
      'rest apis': ['api', 'rest', 'endpoints', 'crud', 'fastify', 'express'],
      'css/responsive design': ['css', 'css3', 'scss', 'sass', 'tailwind', 'responsive'],
      'database modeling': ['postgresql', 'sql', 'mongodb', 'prisma', 'sqlite', 'database'],
      'docker': ['dockerfile', 'container', 'containers', 'docker-compose'],
      'ci/cd pipelines': ['ci', 'cicd', 'github-actions', 'workflow', 'pipeline'],
      'unit/integration testing': ['jest', 'vitest', 'pytest', 'mocha', 'testing', 'cypress', 'playwright'],
      'pytorch': ['torch', 'deep-learning', 'neural-network'],
      'kubernetes': ['k8s', 'helm', 'kubectl'],
      'terraform': ['hcl', 'opentofu', 'infrastructure-as-code', 'iac']
    };

    if (aliases[clean]) {
      return aliases[clean].some(alias => detectedSkills.includes(alias));
    }

    // Partial contains check
    return detectedSkills.some(ds => ds.includes(clean) || clean.includes(ds));
  },

  getGradeInfo(score) {
    if (score >= 90) {
      return {
        letter: 'A+',
        title: 'Top-Tier Candidate',
        color: '#2ea043',
        description: 'Elite portfolio readiness. Outstanding documentation, strong social proof, and clear specialization.'
      };
    }
    if (score >= 80) {
      return {
        letter: 'A',
        title: 'Industry Ready',
        color: '#3fb950',
        description: 'Strong hireable profile. Clean projects, good documentation, and solid technical depth.'
      };
    }
    if (score >= 70) {
      return {
        letter: 'B+',
        title: 'Competitive Apprentice',
        color: '#388bfd',
        description: 'Solid foundation with clear potential. Needs a few high-impact fixes (live demos, README polish).'
      };
    }
    if (score >= 60) {
      return {
        letter: 'B',
        title: 'Emerging Developer',
        color: '#d29922',
        description: 'Good early projects, but missing key polish: licenses, live deployment links, or tests.'
      };
    }
    return {
      letter: 'C',
      title: 'Portfolio Under Construction',
      color: '#f85149',
      description: 'Significant room for improvement in documentation, repository hygiene, and project depth.'
    };
  },

  rankRepositories(repos) {
    return repos.map(repo => {
      let score = 20;

      // Factors
      if (repo.description && repo.description.length > 15) score += 15;
      if (repo.homepage && repo.homepage.length > 5) score += 20;
      if (repo.license) score += 10;
      if (repo.stargazers_count > 0) score += Math.min(25, repo.stargazers_count * 2);
      if (repo.forks_count > 0) score += Math.min(10, repo.forks_count * 3);
      if (repo.topics && repo.topics.length > 0) score += Math.min(10, repo.topics.length * 2);
      if (repo.has_readme) score += 10;

      // Deductions
      if (!repo.description) score -= 15;
      if (repo.fork) score -= 15;

      const healthScore = Math.max(10, Math.min(100, score));

      return {
        ...repo,
        healthScore,
        isPinWorthy: false,
        warnings: this.getRepoWarnings(repo)
      };
    }).sort((a, b) => b.healthScore - a.healthScore)
      .map((repo, idx) => ({
        ...repo,
        isPinWorthy: idx < 6 && repo.healthScore >= 50
      }));
  },

  getRepoWarnings(repo) {
    const warnings = [];
    if (!repo.description || repo.description.trim() === '') {
      warnings.push({ type: 'danger', text: 'Missing repository description' });
    }
    if (!repo.homepage || repo.homepage.trim() === '') {
      warnings.push({ type: 'warning', text: 'No live demo / homepage URL linked' });
    }
    if (!repo.license) {
      warnings.push({ type: 'warning', text: 'No open-source license specified' });
    }
    if (!repo.topics || repo.topics.length === 0) {
      warnings.push({ type: 'info', text: 'No topic tags for discoverability' });
    }
    if (repo.fork) {
      warnings.push({ type: 'info', text: 'Forked repository - original work preferred' });
    }
    return warnings;
  },

  generateQuickWins(user, repos, docScore, qualityScore, missingSkills) {
    const wins = [];

    // Check for missing homepage in top repo
    const topRepo = repos[0];
    if (topRepo && (!topRepo.homepage || topRepo.homepage.trim() === '')) {
      wins.push({
        id: 'live-demo',
        impact: '+12 pts',
        title: `Deploy & link a live demo for "${topRepo.name}"`,
        action: 'Deploy to Vercel, Netlify, or GitHub Pages and add the URL in the repo About section.',
        category: 'Impact'
      });
    }

    // Check licenses
    const unlicensed = repos.filter(r => !r.license);
    if (unlicensed.length > 0) {
      wins.push({
        id: 'add-licenses',
        impact: '+8 pts',
        title: `Add MIT license to ${unlicensed.length} unlicensed repos`,
        action: 'Recruiters and engineers look for clear licenses before exploring or evaluating code.',
        category: 'Hygiene'
      });
    }

    // Check empty descriptions
    const noDesc = repos.filter(r => !r.description || r.description.trim() === '');
    if (noDesc.length > 0) {
      wins.push({
        id: 'add-desc',
        impact: '+7 pts',
        title: `Add 1-sentence value propositions to ${noDesc.length} repos`,
        action: 'Every pinned and public repo needs a clear, punchy explanation in the header.',
        category: 'Readability'
      });
    }

    // Check missing high-demand skill
    if (missingSkills.length > 0) {
      wins.push({
        id: 'bridge-skill',
        impact: '+15 pts',
        title: `Build 1 project highlighting "${missingSkills[0]}"`,
        action: `Adding a dedicated project featuring ${missingSkills[0]} directly fills your primary role gap.`,
        category: 'Career Alignment'
      });
    }

    // Check bio
    if (!user.bio || user.bio.trim().length < 20) {
      wins.push({
        id: 'optimize-bio',
        impact: '+5 pts',
        title: 'Upgrade your GitHub profile bio',
        action: 'Include your specialty, core tech stack, and what problems you love solving.',
        category: 'First Impression'
      });
    }

    return wins.slice(0, 3);
  },

  simulateRecruiterReview(user, repos, score, role, missingSkills) {
    const greenFlags = [];
    const redFlags = [];

    if (repos.length >= 3) {
      greenFlags.push('Active portfolio with multiple repositories');
    }
    const withDemos = repos.filter(r => r.homepage);
    if (withDemos.length > 0) {
      greenFlags.push(`Demonstrated deployment ability (${withDemos.length} live project links)`);
    } else {
      redFlags.push('No live demo links found - requires cloning to evaluate UI/functionality');
    }

    if (user.bio && user.bio.length > 25) {
      greenFlags.push('Clear bio stating identity and core specialization');
    } else {
      redFlags.push('Sparse or empty profile bio - hurts immediate 6-second scan');
    }

    const unlicensed = repos.filter(r => !r.license);
    if (unlicensed.length > repos.length * 0.4) {
      redFlags.push('Over 40% of repositories lack open-source licensing');
    }

    if (missingSkills.length > 3) {
      redFlags.push(`Missing core ${role.title} industry benchmarks: ${missingSkills.slice(0, 3).join(', ')}`);
    }

    // Seniority tier estimate
    let estimatedTier = 'Junior / Entry-Level';
    let salaryEstimate = '$75k - $95k';
    let starsOutOf5 = 3.0;

    if (score >= 88) {
      estimatedTier = 'Senior / Staff Candidate';
      salaryEstimate = '$155k - $210k+';
      starsOutOf5 = 4.8;
    } else if (score >= 76) {
      estimatedTier = 'Mid-Level Engineer';
      salaryEstimate = '$115k - $145k';
      starsOutOf5 = 4.2;
    } else if (score >= 65) {
      estimatedTier = 'Junior-to-Mid Transition';
      salaryEstimate = '$90k - $115k';
      starsOutOf5 = 3.6;
    }

    return {
      stars: starsOutOf5,
      estimatedTier,
      salaryEstimate,
      greenFlags,
      redFlags,
      verdict: score >= 75
        ? `Strong candidate for ${role.title} interviews. Profile demonstrates genuine passion and practical execution.`
        : `Shows genuine potential, but requires 2-3 weeks of portfolio curation to maximize inbound recruiter response rates.`
    };
  }
};
