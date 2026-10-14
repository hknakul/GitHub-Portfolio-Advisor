export const ReadmeGenerator = {
  generate(repo, user, options = {}) {
    const repoName = repo.name || 'my-awesome-project';
    const username = user.login || 'octodev';
    const description = repo.description || 'A modern high-performance application built with clean architecture and developer experience in mind.';
    const homepage = repo.homepage || `https://${username}.github.io/${repoName}`;
    const licenseName = repo.license?.name || 'MIT';
    const licenseBadge = repo.license?.spdx_id || 'MIT';
    const language = repo.language || 'TypeScript';
    const topics = repo.topics && repo.topics.length > 0 ? repo.topics : ['web', 'software', 'open-source'];

    const includeBadges = options.badges !== false;
    const includeDemo = options.demo !== false;
    const includeFeatures = options.features !== false;
    const includeStack = options.stack !== false;
    const includeInstall = options.install !== false;
    const includeTree = options.tree !== false;
    const includeContributing = options.contributing !== false;

    let md = '';

    // Title & Badges
    md += `<div align="center">\n\n`;
    md += `# 🚀 ${repoName}\n\n`;
    md += `**${description}**\n\n`;

    if (includeBadges) {
      md += `[![License: ${licenseBadge}](https://img.shields.io/badge/License-${licenseBadge}-blue.svg?style=for-the-badge)](LICENSE)\n`;
      md += `[![Stars](https://img.shields.io/github/stars/${username}/${repoName}?style=for-the-badge&color=gold)](https://github.com/${username}/${repoName}/stargazers)\n`;
      md += `[![Issues](https://img.shields.io/github/issues/${username}/${repoName}?style=for-the-badge&color=brightgreen)](https://github.com/${username}/${repoName}/issues)\n`;
      md += `[![Language](https://img.shields.io/badge/Language-${encodeURIComponent(language)}-purple?style=for-the-badge)](https://github.com/${username}/${repoName})\n\n`;
    }

    if (includeDemo && homepage) {
      md += `[Explore Live Demo ↗](${homepage}) &nbsp;&bull;&nbsp; [Report Bug](https://github.com/${username}/${repoName}/issues) &nbsp;&bull;&nbsp; [Request Feature](https://github.com/${username}/${repoName}/issues)\n\n`;
    }

    md += `</div>\n\n---\n\n`;

    // Overview
    md += `## 🌟 Overview\n\n`;
    md += `${repoName} is engineered to solve modern engineering challenges with simplicity, high reliability, and exceptional performance.\n\n`;
    if (homepage) {
      md += `> **Live Preview:** Try out the running deployment at [${homepage}](${homepage})\n\n`;
    }

    // Features
    if (includeFeatures) {
      md += `## ✨ Key Features\n\n`;
      md += `- ⚡ **Blazing Fast Performance:** Optimized runtime with zero bloat and minimal latency.\n`;
      md += `- 🛡️ **Type-Safe & Resilient:** Built with strict typing and defensive design patterns.\n`;
      md += `- 🎨 **Modern & Accessible UX:** Responsive design catering to all device viewports.\n`;
      md += `- 🔄 **Modular Architecture:** Decoupled components ready for scaling and automated testing.\n`;
      md += `- 📦 **Zero-Config Deployment:** Ready for Vercel, Docker, or Kubernetes pipelines.\n\n`;
    }

    // Tech Stack
    if (includeStack) {
      md += `## 🛠️ Built With\n\n`;
      md += `| Layer | Technology | Purpose |\n`;
      md += `| :--- | :--- | :--- |\n`;
      md += `| **Core** | \`${language}\` | Primary application logic |\n`;
      if (topics.length > 0) {
        md += `| **Ecosystem** | \`${topics.slice(0, 4).join(', ')}\` | Libraries & toolchain |\n`;
      }
      md += `| **Tooling** | Git, GitHub Actions | CI/CD & version control |\n`;
      md += `| **Deployment** | Docker / Cloud | Scalable cloud hosting |\n\n`;
    }

    // Getting Started
    if (includeInstall) {
      md += `## 🚀 Getting Started\n\n`;
      md += `### Prerequisites\n\n`;
      md += `- Node.js \`>= 18.0.0\` (or Docker for containerized run)\n`;
      md += `- Package manager (\`npm\`, \`pnpm\`, or \`yarn\`)\n\n`;
      md += `### Installation\n\n`;
      md += `1. **Clone the repository:**\n`;
      md += `   \`\`\`bash\n`;
      md += `   git clone https://github.com/${username}/${repoName}.git\n`;
      md += `   cd ${repoName}\n`;
      md += `   \`\`\`\n\n`;
      md += `2. **Install dependencies:**\n`;
      md += `   \`\`\`bash\n`;
      md += `   npm install\n`;
      md += `   \`\`\`\n\n`;
      md += `3. **Configure environment:**\n`;
      md += `   \`\`\`bash\n`;
      md += `   cp .env.example .env.local\n`;
      md += `   \`\`\`\n\n`;
      md += `4. **Launch development server:**\n`;
      md += `   \`\`\`bash\n`;
      md += `   npm run dev\n`;
      md += `   \`\`\`\n\n`;
    }

    // Project Tree
    if (includeTree) {
      md += `## 📁 Project Structure\n\n`;
      md += `\`\`\`text\n`;
      md += `${repoName}/\n`;
      md += `├── src/\n`;
      md += `│   ├── components/      # Reusable UI widgets and views\n`;
      md += `│   ├── services/        # API clients and business domain logic\n`;
      md += `│   ├── types/           # Type definitions and interfaces\n`;
      md += `│   └── utils/           # Helper utilities and formatting\n`;
      md += `├── tests/               # Automated unit and integration tests\n`;
      md += `├── public/              # Static assets and icons\n`;
      md += `└── package.json\n`;
      md += `\`\`\`\n\n`;
    }

    // Contributing & License
    if (includeContributing) {
      md += `## 🤝 Contributing\n\n`;
      md += `Contributions, issues, and feature requests are very welcome!\n`;
      md += `Feel free to check [issues page](https://github.com/${username}/${repoName}/issues).\n\n`;
      md += `1. Fork the Project\n`;
      md += `2. Create your Feature Branch (\`git checkout -b feature/AmazingFeature\`)\n`;
      md += `3. Commit your Changes (\`git commit -m 'Add some AmazingFeature'\`)\n`;
      md += `4. Push to the Branch (\`git push origin feature/AmazingFeature\`)\n`;
      md += `5. Open a Pull Request\n\n`;
    }

    md += `## 📄 License\n\n`;
    md += `Distributed under the **${licenseName}**. See \`LICENSE\` for more information.\n\n`;
    md += `---\n\n`;
    md += `<p align="center">Crafted with precision by <a href="https://github.com/${username}">@${username}</a></p>\n`;

    return md;
  }
};
