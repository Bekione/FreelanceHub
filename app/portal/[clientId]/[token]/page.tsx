import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  FileText,
  FolderOpen,
  Download,
  Building,
  Link2,
  Building2,
  PenTool,
  Code,
  Video,
  File as FileIcon,
} from "lucide-react";
import Image from "next/image";
import { PortalAttachment } from "@/components/portal/portal-attachment";

// Server Component
export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ clientId: string; token: string }>;
}) {
  const { clientId, token } = await params;

  // 1. Validate the portal link
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      projects: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: {
          attachments: true,
        },
      },
      invoices: {
        where: { deletedAt: null },
        orderBy: { issueDate: "desc" },
      },
    },
  });

  if (!client || !client.hasPortal || client.portalToken !== token) {
    return notFound();
  }

  // Soft-deleted clients shouldn't have active portals
  if (client.deletedAt) {
    return notFound();
  }

  const profile = client.user.profile;
  const brandColor = profile?.brandColor || "#f59e0b";
  const brandLogo = profile?.brandLogoUrl;
  const freelancerName = client.user.name;
  const freelancerImage = client.user.image;

  const getCategoryIcon = (
    category: string | null | undefined,
    className = "h-4 w-4",
    isFile = false,
  ) => {
    switch (category) {
      case "design":
        return <PenTool className={`${className} text-pink-500`} />;
      case "development":
      case "code":
        return <Code className={`${className} text-blue-500`} />;
      case "copywriting":
      case "document":
        return <FileText className={`${className} text-orange-500`} />;
      case "video":
      case "media":
        return <Video className={`${className} text-purple-500`} />;
      default:
        return isFile ? (
          <FileIcon className={`${className} text-muted-foreground`} />
        ) : (
          <FolderOpen className={`${className} text-primary`} />
        );
    }
  };

  const activeProjects = client.projects.filter(
    (p) => p.status === "ACTIVE" || p.status === "PENDING",
  );
  const completedProjects = client.projects.filter(
    (p) => p.status === "COMPLETED" || p.status === "ARCHIVED",
  );
  const unpaidInvoices = client.invoices.filter(
    (i) => i.status === "PENDING" || i.status === "OVERDUE",
  );
  const paidInvoices = client.invoices.filter((i) => i.status === "PAID");

  const totalOutstanding = unpaidInvoices.reduce(
    (acc, inv) => acc + inv.amount,
    0,
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans print:bg-white">
      {/* Dynamic Brand Underlay */}
      <div
        className="absolute top-0 left-0 w-full h-96 opacity-10 pointer-events-none -z-10"
        style={{
          background: `radial-gradient(ellipse at top, ${brandColor}60 0%, transparent 70%)`,
        }}
      />

      {/* Navigation / Header */}
      <header className="border-b border-border/40 bg-background/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {brandLogo ? (
              <Image
                src={brandLogo}
                alt={freelancerName}
                width={32}
                height={32}
                className="rounded-md object-contain"
                style={{ width: "auto", height: "32px" }}
              />
            ) : freelancerImage ? (
              <Image
                src={freelancerImage}
                alt={freelancerName}
                width={32}
                height={32}
                className="rounded-full object-cover"
                style={{ width: "32px", height: "32px" }}
              />
            ) : (
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: brandColor }}
              >
                {freelancerName.charAt(0)}
              </div>
            )}
            <span className="font-semibold text-lg">{freelancerName}</span>
          </div>

          <div className="text-sm text-muted-foreground flex items-center gap-2 border border-border/50 bg-muted/30 px-3 py-1.5">
            <Building className="h-4 w-4" />
            Client Portal:{" "}
            <span className="font-medium text-foreground">{client.name}</span>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-12 space-y-12">
        {/* Welcome Section */}
        <section>
          <h1 className="text-4xl font-heading font-bold mb-2 tracking-tight">
            Welcome back, {client.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Here is the current status of your projects and financial overview
            with {freelancerName}.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="bg-card shadow-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Active Projects
                    </p>
                    <p className="text-3xl font-bold">
                      {activeProjects.length}
                    </p>
                  </div>
                  <div
                    className="p-3 "
                    style={{
                      backgroundColor: `${brandColor}15`,
                      color: brandColor,
                    }}
                  >
                    <FolderOpen className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Outstanding Balance
                    </p>
                    <p className="text-3xl font-bold text-destructive">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: profile?.currency || "USD",
                      }).format(totalOutstanding)}
                    </p>
                  </div>
                  <div className="p-3  bg-destructive/10 text-destructive">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/60 shadow-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Completed Operations
                    </p>
                    <p className="text-3xl font-bold">
                      {completedProjects.length + paidInvoices.length}
                    </p>
                  </div>
                  <div className="p-3  bg-muted text-muted-foreground">
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Projects Column */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FolderOpen className="h-6 w-6 text-muted-foreground" />
              Active Projects
            </h2>

            {activeProjects.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border/50 text-muted-foreground">
                No active projects right now.
              </div>
            ) : (
              <div className="space-y-4">
                {activeProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="overflow-hidden border-border/50 shadow-sm"
                  >
                    <div
                      className="h-1.5 w-full"
                      style={{ backgroundColor: brandColor }}
                    />
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            {getCategoryIcon(project.category, "h-5 w-5")}
                            {project.title}
                          </CardTitle>
                          {project.description && (
                            <CardDescription className="mt-2 text-sm leading-relaxed max-w-xl">
                              {project.description}
                            </CardDescription>
                          )}
                        </div>
                        <Badge variant="secondary" className="font-semibold">
                          {project.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    {project.attachments.length > 0 && (
                      <CardContent>
                        <div className="mt-2 space-y-3">
                          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Project Files
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {project.attachments.map((att) => (
                              <PortalAttachment
                                key={att.id}
                                att={att}
                                icon={getCategoryIcon(
                                  att.category,
                                  "h-4 w-4",
                                  true,
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Invoices Column */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-muted-foreground" />
              Invoices
            </h2>

            {unpaidInvoices.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-destructive px-1">
                  Action Required
                </p>
                {unpaidInvoices.map((invoice) => (
                  <a
                    key={invoice.id}
                    href={`/invoice/${invoice.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <Card className="border-destructive/20 bg-destructive/5 hover:bg-destructive/10 hover:border-destructive/40 transition-all shadow-sm">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-destructive">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: profile?.currency || "USD",
                            }).format(invoice.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
                            {(profile?.invoicePrefix || "INV-") +
                              invoice.invoiceNumber}
                          </p>
                        </div>
                        <div
                          className="px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-sm flex items-center gap-1.5 transition-transform group-hover:scale-105"
                          style={{ backgroundColor: brandColor }}
                        >
                          View & Pay <Link2 className="h-3 w-3" />
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            )}

            {paidInvoices.length > 0 && (
              <div className="space-y-3 pt-6">
                <p className="text-sm font-medium text-muted-foreground px-1">
                  Paid & Settled
                </p>
                {paidInvoices.slice(0, 5).map((invoice) => (
                  <a
                    key={invoice.id}
                    href={`/invoice/${invoice.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <Card className="border-border/50 bg-background/50 hover:bg-muted/30 shadow-none">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: profile?.currency || "USD",
                            }).format(invoice.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Paid{" "}
                            {new Date(invoice.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        >
                          Paid
                        </Badge>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container max-w-5xl mx-auto px-4 py-8 mt-12 border-t border-border/40 text-center flex flex-col items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Secure Client Portal provided by {freelancerName}
        </p>
        {(!client.user.subscriptionStatus ||
          (client.user.subscriptionStatus !== "active" &&
            client.user.subscriptionStatus !== "past_due")) && (
          <div className="mt-4 opacity-50 grayscale scale-90">
            <p className="text-xs font-medium tracking-widest uppercase">
              Powered by FreelanceHub
            </p>
          </div>
        )}
      </footer>
    </div>
  );
}
