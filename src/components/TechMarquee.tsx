type Logo = { name: string; src: string; wide?: boolean };

const LOGOS: Logo[] = [
  { name: "Kubernetes", src: "/logos/kubernetes.svg" },
  { name: "AWS", src: "/logos/aws.svg", wide: true },
  { name: "Terraform", src: "/logos/terraform.svg" },
  { name: "Docker", src: "/logos/docker.svg" },
  { name: "Go", src: "/logos/go.svg" },
  { name: "Python", src: "/logos/python.svg" },
  { name: "Helm", src: "/logos/helm.svg" },
  { name: "Prometheus", src: "/logos/prometheus.svg" },
  { name: "Grafana", src: "/logos/grafana.svg" },
  { name: "Ansible", src: "/logos/ansible.svg" },
  { name: "GitHub Actions", src: "/logos/githubactions.svg" },
  { name: "GitLab", src: "/logos/gitlab.svg" },
  { name: "Google Cloud", src: "/logos/googlecloud.svg" },
  { name: "PostgreSQL", src: "/logos/postgresql.svg" },
  { name: "Redis", src: "/logos/redis.svg" },
  { name: "Linux", src: "/logos/linux.svg" },
];

export default function TechMarquee() {
  const doubled = [...LOGOS, ...LOGOS];

  return (
    <div
      className="marquee-pause relative z-10 overflow-hidden border-y border-iron/50 bg-obsidian/30 py-6"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-void to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-void to-transparent" />

      <div className="marquee-track items-center gap-12">
        {doubled.map((logo, i) => (
          <span
            key={i}
            title={logo.name}
            className={`block h-8 shrink-0 bg-muted transition-colors duration-300 hover:bg-accent ${
              logo.wide ? "w-14" : "w-8"
            }`}
            style={{
              maskImage: `url(${logo.src})`,
              WebkitMaskImage: `url(${logo.src})`,
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskPosition: "center",
              maskSize: "contain",
              WebkitMaskSize: "contain",
            }}
          />
        ))}
      </div>
    </div>
  );
}
