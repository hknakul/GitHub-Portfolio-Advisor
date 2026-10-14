export const ROLE_BENCHMARKS = {
  'fullstack': {
    id: 'fullstack',
    title: 'Full-Stack Engineer',
    icon: '🌐',
    description: 'Builds end-to-end web applications across client, server, database, and deployment pipelines.',
    requiredSkills: [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'REST APIs', 
      'PostgreSQL', 'Git', 'CSS/Responsive Design', 'Database Modeling'
    ],
    advancedSkills: [
      'Docker', 'Next.js', 'GraphQL', 'Redis', 'CI/CD Pipelines', 
      'Unit/Integration Testing', 'TailwindCSS', 'AWS / Cloud Hosting'
    ],
    idealPortfolioArchetype: 'At least 2 deployed full-stack web applications with authentication, relational/NoSQL database, live demo URL, responsive UI, and automated CI/CD.',
    recruiterChecklist: [
      'Live deployed links that work on mobile and desktop',
      'Clear separation of client and server architecture',
      'Database schema diagrams or seed migrations documented',
      'Authentication & authorization flows (JWT/OAuth/Sessions)',
      'Clean README with architecture overview and local setup commands'
    ],
    recommendedProject: {
      title: 'Distributed Real-Time Collaborative Workspace',
      pitch: 'A Notion + Figma style collaborative document or canvas platform with live WebSockets, PostgreSQL ACID persistence, Redis caching, and Dockerized microservices.',
      stack: ['TypeScript', 'React', 'Node.js', 'Socket.io', 'PostgreSQL', 'Redis', 'Docker'],
      features: [
        'Real-time cursor syncing and presence tracking',
        'Rich-text editing with operational transformation / CRDTs',
        'JWT & OAuth2 authentication with role-based access control',
        'Docker-compose setup for one-line local development'
      ]
    }
  },
  'ai-ml': {
    id: 'ai-ml',
    title: 'AI / Machine Learning Engineer',
    icon: '🤖',
    description: 'Designs, trains, fine-tunes, and serves ML models, LLM agents, and data inference pipelines.',
    requiredSkills: [
      'Python', 'PyTorch', 'NumPy', 'Pandas', 'Scikit-learn', 
      'FastAPI', 'Git', 'Data Preprocessing', 'Model Evaluation'
    ],
    advancedSkills: [
      'LangChain / LlamaIndex', 'Hugging Face Transformers', 'Vector Databases (Chroma/Pinecone)', 
      'Docker', 'MLflow / Weights & Biases', 'CUDA / GPU Optimization', 'ONNX / TensorRT'
    ],
    idealPortfolioArchetype: 'A deployed inference web service or interactive Streamlit/Gradio demo, end-to-end Jupyter notebooks with EDA, benchmark metrics (F1/loss curves), and model artifact links.',
    recruiterChecklist: [
      'Live interactive model demo (HuggingFace Spaces or Gradio / Streamlit)',
      'Benchmark comparisons against baseline models with clear metrics',
      'Reproducible training scripts and requirements.txt / poetry.lock',
      'Clear explanations of model architecture, tradeoffs, and dataset origins',
      'FastAPI/Flask API wrapper with Swagger documentation'
    ],
    recommendedProject: {
      title: 'Multimodal RAG Knowledge Intelligence Engine',
      pitch: 'An enterprise document ingestion & question-answering pipeline using hybrid vector search (Pinecone + BM25), reranking, and local LLM quantization with evaluation benchmarks.',
      stack: ['Python', 'PyTorch', 'FastAPI', 'LangChain', 'Qdrant / ChromaDB', 'Docker'],
      features: [
        'PDF/Markdown document chunking and metadata enrichment',
        'Hybrid dense & sparse vector retrieval with cross-encoder re-ranking',
        'Latency vs precision evaluation dashboard comparing 3 LLM backends',
        'FastAPI async inference endpoint with streaming responses'
      ]
    }
  },
  'frontend': {
    id: 'frontend',
    title: 'Senior Frontend Engineer',
    icon: '🎨',
    description: 'Crafts high-performance, accessible, responsive user interfaces and design systems.',
    requiredSkills: [
      'JavaScript', 'TypeScript', 'React', 'CSS3 / Modern CSS', 'HTML5 & Accessibility (a11y)', 
      'State Management', 'Web Performance / Core Web Vitals', 'Git'
    ],
    advancedSkills: [
      'Next.js', 'Vue.js / Svelte', 'TailwindCSS', 'Storybook / Component Driven Dev', 
      'Jest / Vitest / Playwright', 'WebSockets', 'Canvas / WebGL / Three.js', 'PWA'
    ],
    idealPortfolioArchetype: 'Production-ready web apps with exquisite UX, 95+ Lighthouse scores, keyboard accessibility, dark/light themes, and custom design systems.',
    recruiterChecklist: [
      'Flawless responsive layouts tested across mobile, tablet, and widescreen',
      'Active live demo links with zero console errors',
      'Accessible semantic HTML with proper ARIA attributes',
      'Component library or Storybook documentation',
      'Lighthouse audit score screenshot or automated badge'
    ],
    recommendedProject: {
      title: 'Modular High-Performance Analytics Dashboard & Design System',
      pitch: 'A custom, lightweight UI component library and real-time financial or metrics analytics dashboard featuring dynamic SVG/Canvas charting, virtualized lists for 100k items, and full keyboard a11y.',
      stack: ['TypeScript', 'React', 'Modern CSS', 'Vite', 'Vitest', 'Storybook'],
      features: [
        'Accessible, headless UI primitives (Dialog, Dropdown, Tabs, Virtual Table)',
        'Custom interactive data visualizer without heavy external chart bloat',
        'Sub-second first contentful paint and 100 Lighthouse performance',
        'Comprehensive unit tests with Vitest and user-event testing'
      ]
    }
  },
  'backend': {
    id: 'backend',
    title: 'Backend & Systems Engineer',
    icon: '⚙️',
    description: 'Architects robust microservices, scalable APIs, distributed storage, and secure backend systems.',
    requiredSkills: [
      'Node.js / Go / Python / Java', 'RESTful APIs', 'SQL (PostgreSQL/MySQL)', 
      'Database Indexing & Optimization', 'Git', 'Authentication / Security Best Practices', 'Linux / Bash'
    ],
    advancedSkills: [
      'Go / Rust', 'gRPC / Protocol Buffers', 'Redis / Caching Strategies', 
      'Message Queues (Kafka / RabbitMQ)', 'Docker', 'Kubernetes', 'Microservices', 'Distributed Tracing'
    ],
    idealPortfolioArchetype: 'High-throughput API backend with stress-test benchmarks, database schema migrations, automated unit/integration test suites, and Docker deployment.',
    recruiterChecklist: [
      'Comprehensive API docs (OpenAPI/Swagger or Postman Collection)',
      'Detailed test coverage (>80% with CI badge)',
      'Clear documentation of concurrency, rate limiting, and failure handling',
      'Benchmarking numbers (requests per second, latency percentiles)',
      'Database design ER diagrams and indexing justification'
    ],
    recommendedProject: {
      title: 'High-Throughput Distributed Rate-Limiting & Task Queue Service',
      pitch: 'A fault-tolerant distributed background worker and token-bucket API rate limiter built in Go or Node, backed by Redis clusters, with telemetry and Prometheus metrics.',
      stack: ['Go or Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Prometheus', 'Grafana'],
      features: [
        'Token bucket / sliding window rate limiting algorithm with Redis Lua scripts',
        'Dead-letter queue and automatic retry with exponential backoff',
        'Load testing script with k6 showing 15,000+ RPS sustained throughput',
        'Prometheus metrics endpoint and Grafana dashboard config'
      ]
    }
  },
  'devops': {
    id: 'devops',
    title: 'DevOps & Cloud Engineer',
    icon: '☁️',
    description: 'Automates infrastructure as code, CI/CD pipelines, container orchestration, and site reliability.',
    requiredSkills: [
      'Linux / Bash', 'Git', 'Docker', 'CI/CD (GitHub Actions / GitLab CI)', 
      'Cloud Providers (AWS / GCP / Azure)', 'Python / Go', 'Networking Basics'
    ],
    advancedSkills: [
      'Kubernetes (K8s)', 'Terraform / OpenTofu', 'Ansible', 'Helm', 
      'Prometheus / Grafana', 'ArgoCD / GitOps', 'IAM / Cloud Security', 'Cost Optimization'
    ],
    idealPortfolioArchetype: 'Infrastructure-as-Code repositories with modular Terraform, automated GitHub Actions pipelines, multi-stage Dockerfiles, and Kubernetes manifests.',
    recruiterChecklist: [
      'Modular, reusable Terraform configs with remote state locking',
      'Complete CI/CD workflow files (.github/workflows) running lint, test, scan, and deploy',
      'Hardened, non-root multi-stage Dockerfiles with minimal image size',
      'Documentation of disaster recovery, zero-downtime rolling updates, and monitoring',
      'Security scanning (Trivy, SonarQube, or Snyk) integrated into PR checks'
    ],
    recommendedProject: {
      title: 'GitOps Kubernetes Multi-Environment Cloud Platform',
      pitch: 'Production-ready Infrastructure-as-Code pipeline using Terraform to provision AWS EKS/GKE, with ArgoCD continuous delivery, automated TLS with Let\'s Encrypt, and Grafana monitoring.',
      stack: ['Terraform', 'Kubernetes', 'Helm', 'ArgoCD', 'GitHub Actions', 'Prometheus'],
      features: [
        'Terraform modules for VPC, EKS cluster, and IAM least-privilege roles',
        'Automated PR validation with tfsec and tflint in GitHub Actions',
        'GitOps deployment repo synchronizing staging and production namespaces',
        'Comprehensive architectural diagrams and disaster recovery runbook'
      ]
    }
  },
  'mobile': {
    id: 'mobile',
    title: 'Mobile App Developer',
    icon: '📱',
    description: 'Builds native or cross-platform mobile experiences for iOS and Android with smooth 60fps performance.',
    requiredSkills: [
      'React Native / Flutter / Swift / Kotlin', 'JavaScript / TypeScript / Dart', 
      'Mobile UI / UX Guidelines', 'REST APIs', 'Offline Storage', 'Git'
    ],
    advancedSkills: [
      'Native Module Bridging', 'App Store / Play Store Deployment', 'Push Notifications', 
      'State Management (Redux/Zustand/Bloc)', 'Mobile CI/CD (Fastlane)', 'Performance Profiling'
    ],
    idealPortfolioArchetype: 'Published App Store/Play Store links, or interactive Expo Snack demo with recorded screen demo GIFs, smooth navigation, offline support, and device permissions handling.',
    recruiterChecklist: [
      'Visual demo GIFs / videos in README showing smooth screen transitions',
      'Expo Snack or downloadable APK release in GitHub Releases',
      'Offline-first caching and graceful network failure UI',
      'Deep linking and native device capability integrations (camera, biometrics, GPS)',
      'Fastlane automated build configurations'
    ],
    recommendedProject: {
      title: 'Offline-First Personal Health & Workout Tracker',
      pitch: 'A cross-platform React Native / Flutter mobile app with SQLite offline sync, biometric authentication, interactive charts, and background GPS route tracking.',
      stack: ['React Native / Expo', 'TypeScript', 'SQLite / WatermelonDB', 'Zustand'],
      features: [
        'Instant offline writes with background conflict-free replication',
        'Haptic feedback and 60 FPS gesture-driven animations',
        'GitHub Release with compiled Android APK and iOS TestFlight setup',
        'Comprehensive mock data suite and snapshot tests'
      ]
    }
  }
};
