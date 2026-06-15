/* ============================================================
   MODAL.JS — Project detail modal
   ============================================================ */

const PROJECTS = [
  {
    id: 'cicd-pipeline',
    name: 'Cloud-Native CI/CD Pipeline',
    namespace: 'devops/automation',
    status: 'operational',
    replicas: '3/3',
    desc: 'End-to-end CI/CD system using GitHub Actions, Amazon EKS, and ArgoCD with GitOps workflow. Reduced deployment time by 70% and enabled zero-downtime releases.',
    tags: ['GitHub Actions', 'EKS', 'ArgoCD', 'Terraform', 'Helm'],
    github: 'https://github.com/viswanadh',
    arch: `
  ┌─────────────────────────────────────────────────────────┐
  │                  CI/CD Pipeline Architecture            │
  ├─────────────────────────────────────────────────────────┤
  │                                                         │
  │  Dev Push ──► GitHub ──► GitHub Actions                 │
  │                               │                        │
  │                    ┌──────────▼──────────┐             │
  │                    │   Build & Test      │             │
  │                    │  (Docker + pytest)  │             │
  │                    └──────────┬──────────┘             │
  │                               │                        │
  │                    ┌──────────▼──────────┐             │
  │                    │  ECR Push (image)   │             │
  │                    └──────────┬──────────┘             │
  │                               │                        │
  │                    ┌──────────▼──────────┐             │
  │                    │   ArgoCD Sync       │             │
  │                    │   (GitOps)          │             │
  │                    └──────────┬──────────┘             │
  │                               │                        │
  │              ┌────────────────▼────────────────┐       │
  │              │         Amazon EKS Cluster       │       │
  │              │  [Pod] [Pod] [Pod]  ← Helm Chart │       │
  │              └─────────────────────────────────┘       │
  └─────────────────────────────────────────────────────────┘`,
    problem: 'The team was deploying manually to production via SSH, leading to inconsistent environments, deployment errors, and no rollback capability. Each deployment took 45+ minutes.',
    solution: 'Implemented a fully automated GitOps pipeline using GitHub Actions for CI (build, test, scan), Amazon ECR for image registry, and ArgoCD for continuous delivery to EKS. Infrastructure provisioned via Terraform.',
    challenges: '• Handling secret management across multiple environments\n• Configuring EKS IRSA (IAM Roles for Service Accounts) for least-privilege access\n• Implementing health checks for zero-downtime rolling deployments\n• Setting up Helm chart templating for dev/staging/prod parity',
    results: '70% faster deployments · Zero-downtime releases · Full audit trail · Rollback in < 2 min',
  },
  {
    id: 'multi-region-infra',
    name: 'Multi-Region AWS Infrastructure',
    namespace: 'cloud/infrastructure',
    status: 'operational',
    replicas: '2 regions',
    desc: 'Production-grade multi-region AWS infrastructure using Terraform modules — VPC, subnets, RDS Multi-AZ, CloudFront CDN, WAF, and Route 53 failover routing.',
    tags: ['Terraform', 'AWS VPC', 'RDS', 'CloudFront', 'Route 53', 'WAF'],
    github: 'https://github.com/viswanadh',
    arch: `
  ┌───────────────────────────────────────────────────────┐
  │            Multi-Region AWS Architecture              │
  ├───────────────────────────────────────────────────────┤
  │                                                       │
  │  Internet ──► Route 53 ──► CloudFront + WAF           │
  │                                  │                   │
  │              ┌───────────────────▼────────────┐      │
  │              │  us-east-1 (Primary)            │      │
  │              │  ┌─────────────────────────┐   │      │
  │              │  │ ALB → EC2 ASG (Web)     │   │      │
  │              │  │      ↓                  │   │      │
  │              │  │ ALB → EC2 ASG (App)     │   │      │
  │              │  │      ↓                  │   │      │
  │              │  │ RDS Aurora Multi-AZ     │   │      │
  │              │  └─────────────────────────┘   │      │
  │              └───────────────────┬─────────────┘     │
  │                                  │ Replication       │
  │              ┌───────────────────▼─────────────┐     │
  │              │  ap-south-1 (Failover)           │     │
  │              │  ┌─────────────────────────┐    │     │
  │              │  │ ALB → EC2 ASG (Standby) │    │     │
  │              │  │ RDS Read Replica         │    │     │
  │              │  └─────────────────────────┘    │     │
  │              └─────────────────────────────────┘     │
  └───────────────────────────────────────────────────────┘`,
    problem: 'Single-region deployment with no disaster recovery plan. A single AZ failure caused 4+ hours of downtime, violating SLA commitments.',
    solution: 'Designed and provisioned a complete multi-region Terraform setup with automated failover. Modular codebase with separate state backends per region, VPC peering, and Route 53 health-check-based DNS failover.',
    challenges: '• State management across multiple Terraform backends\n• VPC CIDR planning to avoid overlap during peering\n• RDS cross-region replication lag tuning\n• CloudFront cache invalidation strategy\n• WAF rule tuning to reduce false positives',
    results: '99.95% uptime SLA · RTO < 15 min · RPO < 5 min · 40% cost reduction via Reserved Instances',
  },
  {
    id: 'k8s-monitoring',
    name: 'Kubernetes Observability Stack',
    namespace: 'observability/monitoring',
    status: 'operational',
    replicas: '1/1',
    desc: 'Full observability platform on Kubernetes: Prometheus + Grafana + AlertManager + Loki for logs + Jaeger for tracing. Custom dashboards and SLO-based alerting.',
    tags: ['Prometheus', 'Grafana', 'AlertManager', 'Loki', 'Jaeger', 'Helm'],
    github: 'https://github.com/viswanadh',
    arch: `
  ┌──────────────────────────────────────────────────────┐
  │          Kubernetes Observability Stack              │
  ├──────────────────────────────────────────────────────┤
  │                                                      │
  │  Applications ──► Node Exporter ──► Prometheus       │
  │  Applications ──► Promtail ──────► Loki              │
  │  Applications ──► OTEL SDK ──────► Jaeger            │
  │                                      │              │
  │                                  ┌───▼───┐          │
  │                                  │Grafana│          │
  │                                  └───┬───┘          │
  │                                      │              │
  │                               AlertManager          │
  │                              /       │       \      │
  │                         Slack    PagerDuty  Email   │
  └──────────────────────────────────────────────────────┘`,
    problem: 'No visibility into cluster health, pod resource usage, or application errors. Incidents were discovered by end users, not engineering.',
    solution: 'Deployed the kube-prometheus-stack Helm chart with custom Grafana dashboards for SLI/SLO tracking. Added Loki for centralized log aggregation and Jaeger for distributed tracing.',
    challenges: '• Storage sizing for Prometheus TSDB at scale\n• Alert noise reduction — tuning inhibition rules\n• Grafana RBAC configuration for multiple teams\n• Cardinality explosion from high-label-count metrics',
    results: 'MTTD reduced from 45 min → 3 min · 100% alert coverage for critical services · 30-day metric retention',
  },
  {
    id: 'serverless-api',
    name: 'Serverless API Platform',
    namespace: 'cloud/serverless',
    status: 'operational',
    replicas: 'auto-scale',
    desc: 'Event-driven serverless platform on AWS: Lambda + API Gateway + DynamoDB + SQS + EventBridge. Infrastructure as code with Terraform, monitored via CloudWatch.',
    tags: ['Lambda', 'API Gateway', 'DynamoDB', 'SQS', 'EventBridge', 'Terraform'],
    github: 'https://github.com/viswanadh',
    arch: `
  ┌────────────────────────────────────────────────────┐
  │           Serverless API Architecture              │
  ├────────────────────────────────────────────────────┤
  │                                                    │
  │  Client ──► API Gateway ──► Lambda (Handler)       │
  │                                  │                │
  │                       ┌──────────▼──────────┐     │
  │                       │    DynamoDB (DB)     │     │
  │                       └──────────────────────┘     │
  │                                  │                │
  │                       ┌──────────▼──────────┐     │
  │                       │  SQS Queue          │     │
  │                       └──────────┬──────────┘     │
  │                                  │                │
  │                       ┌──────────▼──────────┐     │
  │                       │ Lambda (Worker)     │     │
  │                       └──────────┬──────────┘     │
  │                                  │                │
  │                       EventBridge / SNS           │
  └────────────────────────────────────────────────────┘`,
    problem: 'Maintaining EC2-based REST API with unpredictable traffic spikes caused over-provisioning (high cost) or throttling (poor UX).',
    solution: 'Rebuilt the API as a serverless platform using AWS Lambda triggered by API Gateway. Async tasks offloaded to SQS + Lambda workers. DynamoDB for sub-millisecond reads.',
    challenges: '• Cold start latency for infrequent Lambda functions\n• DynamoDB partition key design for hot partition avoidance\n• Managing Lambda deployment packages and layers\n• Distributed tracing across Lambda + SQS chains',
    results: '85% cost reduction · Auto-scales to 10,000 RPS · p99 latency < 120ms · Zero servers to manage',
  },
  {
    id: 'docker-infra',
    name: 'Containerized Microservices Platform',
    namespace: 'containers/platform',
    status: 'operational',
    replicas: '12 containers',
    desc: 'Containerized microservices deployment using Docker Compose for dev and Kubernetes for production. Nginx reverse proxy, automated SSL, and centralized logging.',
    tags: ['Docker', 'Kubernetes', 'Nginx', 'Let\'s Encrypt', 'ELK Stack'],
    github: 'https://github.com/viswanadh',
    arch: `
  ┌─────────────────────────────────────────────────┐
  │        Containerized Microservices Platform     │
  ├─────────────────────────────────────────────────┤
  │                                                 │
  │  Internet ──► Nginx Ingress ──► Services        │
  │                                    │           │
  │           ┌────────────────────────┘           │
  │           │                                    │
  │    ┌──────▼──────┐  ┌──────────┐  ┌────────┐  │
  │    │  Auth Svc   │  │ User Svc │  │ API    │  │
  │    └─────────────┘  └──────────┘  └────────┘  │
  │                        │                       │
  │              ┌──────────▼──────────┐           │
  │              │  PostgreSQL (RDS)   │           │
  │              └─────────────────────┘           │
  │                                                 │
  │   Logs ──► Filebeat ──► Elasticsearch ──► Kibana│
  └─────────────────────────────────────────────────┘`,
    problem: 'Monolithic application was difficult to scale, and a single bug deployment caused full system outages. No environment parity between dev and production.',
    solution: 'Decomposed monolith into containerized microservices using Docker. Dev environment via Docker Compose ensures 100% parity with production Kubernetes cluster.',
    challenges: '• Service-to-service authentication (mTLS with cert-manager)\n• Managing inter-service communication and service mesh evaluation\n• Log aggregation and correlation across containers\n• Network policy definition for security isolation',
    results: 'Independent service deploys · 99.9% uptime · Dev/prod environment parity · 4× faster onboarding',
  },
  {
    id: 'iac-platform',
    name: 'Infrastructure as Code Platform',
    namespace: 'automation/iac',
    status: 'operational',
    replicas: 'managed',
    desc: 'Reusable Terraform module library for AWS, Azure, and GCP. Enforces naming conventions, tagging standards, and security baselines across all environments.',
    tags: ['Terraform', 'AWS', 'Azure', 'Terragrunt', 'OPA', 'Atlantis'],
    github: 'https://github.com/viswanadh',
    arch: `
  ┌────────────────────────────────────────────────────┐
  │            IaC Platform Architecture               │
  ├────────────────────────────────────────────────────┤
  │                                                    │
  │  Engineer PR ──► Atlantis ──► terraform plan       │
  │                       │           │               │
  │                  OPA Policy   State Store          │
  │                  (Conftest)   (S3+DynamoDB)        │
  │                       │                           │
  │               ┌───────▼────────┐                 │
  │               │ Approved? Apply│                 │
  │               └───────┬────────┘                 │
  │                       │                           │
  │        ┌──────────────▼──────────────┐           │
  │        │    Terraform Module Library │           │
  │        │  vpc / eks / rds / iam /    │           │
  │        │  cloudfront / lambda / s3   │           │
  │        └─────────────────────────────┘           │
  └────────────────────────────────────────────────────┘`,
    problem: 'Multiple teams writing ad-hoc AWS resources with no consistency, missing tags, and insecure defaults. Compliance audits were failing on missing encryption and public S3 buckets.',
    solution: 'Built a centralised Terraform module library with opinionated defaults: encryption enabled, public access blocked, mandatory tags enforced via OPA. Atlantis automates plan/apply from GitHub PRs.',
    challenges: '• OPA policy as code for cross-team enforcement\n• Atlantis webhook configuration for GitHub Enterprise\n• Module versioning and backward compatibility\n• Handling Terraform state lock timeouts in parallel runs',
    results: '100% compliance on tagging & encryption · 60% reduction in time-to-provision · Zero public S3 incidents',
  },
];

let activeModal = null;
let activeTab = 'overview';

function renderTabs(project) {
  return `
    <div class="tab-nav" role="tablist">
      <button class="tab-btn active" role="tab" data-tab="overview" aria-selected="true">Overview</button>
      <button class="tab-btn" role="tab" data-tab="architecture" aria-selected="false">Architecture</button>
      <button class="tab-btn" role="tab" data-tab="challenges" aria-selected="false">Challenges</button>
    </div>

    <div id="tab-overview" class="tab-panel active">
      <p class="modal-section-title">Problem Statement</p>
      <p class="modal-text">${project.problem}</p>
      <p class="modal-section-title">Solution</p>
      <p class="modal-text">${project.solution}</p>
      <p class="modal-section-title">Results</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
        ${project.results.split(' · ').map(r => `<span class="badge badge-operational"><span class="pulse-dot"></span>${r}</span>`).join('')}
      </div>
    </div>

    <div id="tab-architecture" class="tab-panel">
      <div class="arch-diagram">${project.arch}</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${project.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
    </div>

    <div id="tab-challenges" class="tab-panel">
      <p class="modal-section-title">Engineering Challenges</p>
      <div class="modal-text" style="white-space:pre-line;">${project.challenges}</div>
    </div>
  `;
}

function openModal(projectId) {
  const project = PROJECTS.find(p => p.id === projectId);
  if (!project) return;

  const overlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalNs    = document.getElementById('modal-ns');
  const modalBadge = document.getElementById('modal-badge');
  const modalBody  = document.getElementById('modal-body');
  const modalGh    = document.getElementById('modal-github');

  modalTitle.textContent = project.name;
  modalNs.textContent    = project.namespace;
  modalBadge.innerHTML   = `<span class="badge badge-operational"><span class="pulse-dot"></span>OPERATIONAL</span>`;
  modalBody.innerHTML    = renderTabs(project);
  modalGh.href           = project.github;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  activeModal = projectId;
  activeTab   = 'overview';

  // Wire tab buttons
  modalBody.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tabId) {
  activeTab = tabId;
  const body = document.getElementById('modal-body');
  body.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
    btn.setAttribute('aria-selected', btn.dataset.tab === tabId);
  });
  body.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-${tabId}`);
  });
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  activeModal = null;
}

export function initModal() {
  // Attach open listeners to project cards
  document.querySelectorAll('[data-project-id]').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.projectId));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card.dataset.projectId);
      }
    });
  });

  // Close button
  const closeBtn = document.getElementById('modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Click outside
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal();
    });
  }

  // Keyboard escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && activeModal) closeModal();
  });
}

export { PROJECTS };
