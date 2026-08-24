"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Globe,
  Copy,
  Check,
  Server,
  Cloud,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

interface CustomDomainSectionProps {
  previewUrl: string;
}

export function CustomDomainSection({ previewUrl }: CustomDomainSectionProps) {
  const [copied, setCopied] = useState(false);
  const [customDomain, setCustomDomain] = useState("");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const dnsTarget = previewUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <section id="custom-domain" className="mx-auto w-full max-w-5xl px-4 py-12 sm:py-16">
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <Globe className="h-3.5 w-3.5" />
          Bring Your Own Domain
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Link Your Custom Domain
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
          Your chess site is live and ready. Connecting your own domain (e.g.{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">play.mybrand.com</code>) takes about
          5 minutes and works with any major DNS provider.
        </p>
      </div>

      <Card className="mb-6 overflow-hidden border-border">
        <CardHeader className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Server className="h-5 w-5 text-emerald-600" />
            Your live site
          </CardTitle>
          <CardDescription>
            This is the address your chess website is currently serving from.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={previewUrl}
              readOnly
              className="font-mono text-sm"
              aria-label="Live preview URL"
            />
            <Button onClick={handleCopy} variant="default" className="gap-2 sm:w-auto">
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
        <label
          htmlFor="custom-domain-input"
          className="mb-1 block text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400"
        >
          Your custom domain
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            id="custom-domain-input"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder="play.mybrand.com"
            className="font-mono text-sm"
          />
          <span className="hidden text-sm text-muted-foreground sm:inline">
            <ArrowRight className="h-4 w-4" />
          </span>
          <Input
            value={dnsTarget}
            readOnly
            className="bg-muted font-mono text-sm text-muted-foreground"
            aria-label="DNS target"
          />
        </div>
        <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
          Above is the DNS target you&apos;ll point your domain at.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StepCard
          step={1}
          title="Choose a host"
          icon={<Cloud className="h-5 w-5" />}
          accent="bg-sky-500/10 text-sky-600 dark:text-sky-400"
        >
          <p className="mb-2 text-sm text-muted-foreground">
            Deploy this Next.js app to any platform that supports custom domains:
          </p>
          <ul className="space-y-1 text-sm text-foreground">
            <li>• <strong>Vercel</strong> — easiest, free for hobby</li>
            <li>• <strong>Cloudflare Pages</strong> — generous free tier</li>
            <li>• <strong>Netlify</strong> — drag-and-drop deploys</li>
            <li>• <strong>Self-hosted</strong> with Caddy / Nginx + Let&apos;s Encrypt</li>
          </ul>
        </StepCard>

        <StepCard
          step={2}
          title="Add your domain"
          icon={<Globe className="h-5 w-5" />}
          accent="bg-violet-500/10 text-violet-600 dark:text-violet-400"
        >
          <p className="mb-2 text-sm text-muted-foreground">
            In your hosting dashboard, find the &quot;Domains&quot; section and add your custom
            domain. The platform will give you the exact DNS records to create.
          </p>
          <p className="text-sm text-foreground">
            Most commonly, you&apos;ll add a <code className="rounded bg-muted px-1 py-0.5 text-xs">CNAME</code> record
            pointing your hostname to the platform&apos;s endpoint.
          </p>
        </StepCard>

        <StepCard
          step={3}
          title="Configure DNS"
          icon={<ShieldCheck className="h-5 w-5" />}
          accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        >
          <p className="mb-2 text-sm text-muted-foreground">
            Log into your DNS provider (Cloudflare, Namecheap, GoDaddy, Route 53, etc.) and create the
            records the host specified:
          </p>
          <div className="rounded-md bg-muted p-2 font-mono text-xs">
            <div className="flex justify-between">
              <span>Type</span>
              <span className="text-muted-foreground">CNAME</span>
            </div>
            <div className="flex justify-between">
              <span>Name</span>
              <span className="text-muted-foreground">play</span>
            </div>
            <div className="flex justify-between">
              <span>Target</span>
              <span className="text-muted-foreground">{dnsTarget}</span>
            </div>
            <div className="flex justify-between">
              <span>Proxy</span>
              <span className="text-muted-foreground">DNS only</span>
            </div>
          </div>
        </StepCard>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          SSL / HTTPS is automatic
        </h3>
        <p className="text-sm text-muted-foreground">
          All major hosts (Vercel, Cloudflare Pages, Netlify) provision and auto-renew a free
          TLS certificate for your custom domain. Once your DNS change propagates (usually 5-30
          minutes), the platform detects it and issues the certificate automatically — no manual
          setup needed.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <details className="rounded-lg border border-border bg-card p-3 text-sm">
          <summary className="cursor-pointer font-semibold text-foreground">
            Deploying to Vercel (recommended)
          </summary>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
            <li>Push this project to a GitHub/GitLab repo.</li>
            <li>
              Visit <code className="rounded bg-muted px-1 py-0.5 text-xs">vercel.com/new</code> and
              import the repo.
            </li>
            <li>Accept the defaults — Vercel auto-detects Next.js.</li>
            <li>Once deployed, open <em>Settings → Domains → Add</em>.</li>
            <li>Enter your custom domain and follow the on-screen DNS instructions.</li>
          </ol>
        </details>

        <details className="rounded-lg border border-border bg-card p-3 text-sm">
          <summary className="cursor-pointer font-semibold text-foreground">
            Deploying to Cloudflare Pages
          </summary>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
            <li>Push this project to a Git repo.</li>
            <li>In Cloudflare Pages, &quot;Create a project&quot; and connect the repo.</li>
            <li>Build command: <code className="rounded bg-muted px-1 py-0.5 text-xs">npm run build</code>.</li>
            <li>Output directory: <code className="rounded bg-muted px-1 py-0.5 text-xs">.next</code>.</li>
            <li>In &quot;Custom domains&quot; tab, add your domain and create the CNAME Cloudflare shows you.</li>
          </ol>
        </details>

        <details className="rounded-lg border border-border bg-card p-3 text-sm">
          <summary className="cursor-pointer font-semibold text-foreground">
            Already have a server? Self-host with Caddy
          </summary>
          <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-xs"><code>{`play.mybrand.com {
  reverse_proxy localhost:3000
}`}</code></pre>
          <p className="mt-2 text-xs text-muted-foreground">
            Caddy automatically issues and renews Let&apos;s Encrypt certificates.
          </p>
        </details>

        <details className="rounded-lg border border-border bg-card p-3 text-sm">
          <summary className="cursor-pointer font-semibold text-foreground">
            Using a subdomain vs. apex domain
          </summary>
          <p className="mt-2 text-muted-foreground">
            For a subdomain (e.g. <code className="rounded bg-muted px-1 py-0.5 text-xs">play.mybrand.com</code>),
            use a <strong>CNAME</strong> record. For the apex/root domain (e.g.{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">mybrand.com</code>), use an{" "}
            <strong>A</strong> record pointing to the host&apos;s provided IP, or use Cloudflare&apos;s
            CNAME flattening feature.
          </p>
        </details>
      </div>
    </section>
  );
}

function StepCard({
  step,
  title,
  icon,
  accent,
  children,
}: {
  step: number;
  title: string;
  icon: React.ReactNode;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="mb-2 flex items-center justify-between">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${accent}`}>
            {icon}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Step {step}
          </span>
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
