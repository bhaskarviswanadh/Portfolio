export type Experience = {
  id: string;
  company: string;
  role: string;
  duration: string;
  period: string;
  location: string;
  status: "Running" | "Completed";
  tech: string[];
  bullets: string[];
};

export type Project = {
  name: string;
  context: string;
  description: string;
  summary?: string;
  tech: string[];
  link?: string;
};

export type SkillGroup = {
  label: string;
  items: string[];
};

export type Cert = {
  short: string;
  name: string;
  issuer: string;
};

export const profile = {
  name: "Bhaskar Viswanadh Devisetti",
  role: "Cloud & DevOps Engineer",
  location: "Vizianagaram, India",
  availability: "Open to Cloud & DevOps opportunities",
  summary:
    "Passionate Cloud & DevOps engineer with hands-on experience in containerization, Kubernetes orchestration, CI/CD automation, and network infrastructure. I build platforms that are reliable, automated, and developer-friendly — from a single `idp deploy` command to full network monitoring stacks on AWS.",
  stats: [
    { value: "9.3", label: "CGPA" },
    { value: "4", label: "projects shipped" },
    { value: "1yr", label: "internship exp." },
  ],
  email: "viswanathdevisetti789@gmail.com",
  linkedin: "in/bhaskarviswanadhdevisetti",
  linkedinUrl: "https://www.linkedin.com/in/bhaskarviswanadhdevisetti/",
  github: "bhaskarviswanadh",
  githubUrl: "https://github.com/bhaskarviswanadh",
  resume: "/Bhaskar viswanadh Devisetti.pdf",
};

export const experience: Experience[] = [
  {
    id: "centurion-intern",
    company: "Centurion University of Technology and Management",
    role: "Network Operations Intern",
    duration: "Feb 2025 – Feb 2026",
    period: "Feb 2025 – Feb 2026",
    location: "Vizianagaram, India",
    status: "Running",
    tech: ["Linux", "Networking", "VLANs", "Routing", "Firewalls", "Bash"],
    bullets: [
      "Maintained campus network infrastructure including switches, routers, and access points supporting daily operations.",
      "Monitored network performance and troubleshot LAN/WAN connectivity issues across multiple departments.",
      "Configured VLANs, subnetting, routing, and firewall access policies following security best practices.",
      "Assisted in server monitoring, backup operations, and infrastructure documentation within data center environments.",
      "Performed Linux administration tasks and resolved networking and system-related issues for end users.",
    ],
  },
];

export const projects: Project[] = [
  {
    name: "idp-project",
    context: "Personal Project",
    description:
      "A CLI-based Internal Developer Platform (IDP) built in Go that automates end-to-end application deployment. Uses YAML config to dynamically generate Kubernetes manifests, Docker for containerization, and Minikube for orchestration — reducing multi-step deploys to a single `idp deploy` command.",
    summary: "CLI-driven Internal Developer Platform in Go that automates Kubernetes deployments end-to-end with a single command.",
    tech: ["Go", "Docker", "Kubernetes", "Minikube", "YAML", "GitHub Actions"],
    link: "https://github.com/bhaskarviswanadh/idp-project",
  },
  {
    name: "Network-Monitoring-System",
    context: "Personal Project",
    description:
      "A Flask-based containerized monitoring platform that polls 18+ network switches using Paramiko and APScheduler to collect CPU, memory, uptime, and interface metrics. Deployed on AWS EC2 with Docker Compose and a full CI/CD pipeline via GitHub Actions.",
    summary: "Containerized network monitoring platform polling 18+ switches for real-time metrics, deployed on AWS EC2 with full CI/CD.",
    tech: ["Python", "Flask", "Docker", "Docker Compose", "AWS EC2", "GitHub Actions", "Paramiko"],
    link: "https://github.com/bhaskarviswanadh/Network-Monitoring-System",
  },
  {
    name: "AI-Lead-Qualification-Bot",
    context: "Personal Project",
    description:
      "Built an AI-powered lead qualification system that automatically analyzes incoming leads, evaluates their intent and business requirements, and categorizes them based on qualification criteria. The workflow reduces manual screening effort by extracting key information, scoring prospects, and routing high-potential leads for faster follow-up, helping sales teams focus on conversion-ready opportunities.",
    summary:
      "AI-driven lead qualification workflow that analyzes, scores, and categorizes incoming prospects to automate sales pipeline management.",
    tech: ["n8n", "OpenAI", "Gemini API", "Webhooks", "JSON Processing", "Google Sheets", "REST APIs", "Prompt Engineering", "Workflow Automation"],
    link: "https://github.com/bhaskarviswanadh/AI-Lead-Qualification-Bot",
  },
  {
    name: "AI-Customer-Support-Assistant",
    context: "Personal Project",
    description:
      "Developed an AI-powered customer support assistant capable of understanding user queries, retrieving relevant information, and generating contextual responses in real time. The system automates repetitive support interactions, improves response consistency, and delivers 24/7 assistance through conversational AI workflows.",
    summary:
      "AI-powered support assistant that automates customer interactions and provides intelligent, context-aware responses.",
    tech: ["n8n", "OpenAI", "Gemini API", "AI Agents", "Prompt Engineering", "Webhooks", "API Integrations", "Knowledge Base Retrieval", "Workflow Automation"],
    link: "https://github.com/bhaskarviswanadh/AI-Customer-Support-Assistant",
  },
];

export const skills: SkillGroup[] = [
  {
    label: "cloud & devops",
    items: [
      "AWS (EC2, S3, IAM)",
      "Docker & Docker Compose",
      "Kubernetes & Minikube",
      "GitHub Actions & CI/CD",
      "Containerization",
    ],
  },
  {
    label: "linux & scripting",
    items: [
      "Linux Administration",
      "Bash Scripting",
      "Python",
      "User & Group Management",
      "Process Management",
    ],
  },
  {
    label: "networking",
    items: [
      "TCP/IP, DNS, DHCP",
      "HTTP/HTTPS",
      "VLANs & Subnetting",
      "Routing & Switching",
      "Network Troubleshooting",
    ],
  },
  {
    label: "tools & technologies",
    items: [
      "Git & GitHub",
      "Go",
      "Wireshark & Nmap",
      "Cisco Packet Tracer",
      "Flask & REST APIs",
    ],
  },
];

export const certifications: Cert[] = [
  {
    short: "CKA",
    name: "Certified Kubernetes Administrator (In Progress)",
    issuer: "CNCF",
  },
  {
    short: "AWS SAA",
    name: "AWS Certified Solutions Architect - Associate (Target)",
    issuer: "Amazon Web Services",
  },
];

export const awards = [
  {
    title: "B.Tech Academic Honors",
    org: "Centurion University of Technology and Management (9.3 CGPA)",
    year: "2025",
  },
];

export const navItems = [
  { id: "experience", label: "experience" },
  { id: "projects", label: "projects" },
  { id: "skills", label: "skills" },
  // { id: "certifications", label: "certs" },
  { id: "contact", label: "contact" },
];
