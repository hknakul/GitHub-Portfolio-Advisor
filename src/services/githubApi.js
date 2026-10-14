import { MOCK_PROFILES } from '../data/mockProfiles.js';

let personalAccessToken = localStorage.getItem('gh_portfolio_pat') || '';
let lastRateLimit = {
  remaining: 60,
  limit: 60,
  reset: null
};

export const GitHubApi = {
  getToken() {
    return personalAccessToken;
  },

  setToken(token) {
    personalAccessToken = token ? token.trim() : '';
    if (personalAccessToken) {
      localStorage.setItem('gh_portfolio_pat', personalAccessToken);
    } else {
      localStorage.removeItem('gh_portfolio_pat');
    }
  },

  getRateLimit() {
    return lastRateLimit;
  },

  getHeaders() {
    const headers = {
      'Accept': 'application/vnd.github.v3+json'
    };
    if (personalAccessToken) {
      headers['Authorization'] = `token ${personalAccessToken}`;
    }
    return headers;
  },

  updateRateLimitFromResponse(response) {
    const remaining = response.headers.get('x-ratelimit-remaining');
    const limit = response.headers.get('x-ratelimit-limit');
    const reset = response.headers.get('x-ratelimit-reset');

    if (remaining !== null) {
      lastRateLimit.remaining = parseInt(remaining, 10);
    }
    if (limit !== null) {
      lastRateLimit.limit = parseInt(limit, 10);
    }
    if (reset !== null) {
      lastRateLimit.reset = new Date(parseInt(reset, 10) * 1000);
    }
  },

  async fetchUserProfile(username) {
    const cleanUsername = username.trim().toLowerCase();

    // Check if it's one of our built-in demo profiles first
    if (MOCK_PROFILES[cleanUsername]) {
      return {
        source: 'mock',
        isDemo: true,
        data: MOCK_PROFILES[cleanUsername].user,
        repos: MOCK_PROFILES[cleanUsername].repos
      };
    }

    try {
      const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, {
        headers: this.getHeaders()
      });

      this.updateRateLimitFromResponse(userRes);

      if (userRes.status === 404) {
        throw new Error(`GitHub user "${cleanUsername}" was not found. Please double check the username.`);
      }

      if (userRes.status === 403 || userRes.status === 429) {
        const errorData = await userRes.json().catch(() => ({}));
        const resetMsg = lastRateLimit.reset ? ` Resets at ${lastRateLimit.reset.toLocaleTimeString()}.` : '';
        throw new Error(
          `GitHub API rate limit reached (${errorData.message || 'Rate limit exceeded'}).${resetMsg} Add a free GitHub Token or select one of our preloaded demo profiles!`
        );
      }

      if (!userRes.ok) {
        throw new Error(`GitHub API error (${userRes.status}): ${userRes.statusText}`);
      }

      const userData = await userRes.json();

      // Fetch user's public repositories
      const reposRes = await fetch(
        `https://api.github.com/users/${encodeURIComponent(cleanUsername)}/repos?per_page=100&sort=pushed`,
        { headers: this.getHeaders() }
      );

      this.updateRateLimitFromResponse(reposRes);

      let reposData = [];
      if (reposRes.ok) {
        reposData = await reposRes.json();
      }

      // Enhance repos with client-side heuristic inspection
      const enhancedRepos = reposData.map(repo => {
        const hasReadme = repo.size > 0; // heuristic indicator
        const topics = repo.topics || [];
        return {
          ...repo,
          has_readme: hasReadme,
          readme_quality: repo.description && repo.homepage ? 'high' : (repo.description ? 'medium' : 'low'),
          has_tests: topics.some(t => ['test', 'tests', 'jest', 'vitest', 'pytest', 'testing'].includes(t.toLowerCase())),
          has_ci: topics.some(t => ['ci', 'github-actions', 'workflow', 'cicd'].includes(t.toLowerCase())),
          languages: repo.language ? { [repo.language]: 10000 } : {}
        };
      });

      return {
        source: 'live',
        isDemo: false,
        data: userData,
        repos: enhancedRepos
      };
    } catch (err) {
      console.warn('GitHub API fetch failed:', err);
      throw err;
    }
  },

  async fetchRepoReadme(owner, repoName) {
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repoName}/readme`, {
        headers: {
          ...this.getHeaders(),
          'Accept': 'application/vnd.github.v3.raw'
        }
      });
      if (!res.ok) return null;
      return await res.text();
    } catch {
      return null;
    }
  }
};
