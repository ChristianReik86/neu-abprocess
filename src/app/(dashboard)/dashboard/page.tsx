import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileCheck2, Clock, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { PLANS } from "@/lib/stripe";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
    include: {
      organization: {
        include: {
          subscription: true,
          orderConfirmations: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      },
    },
  });

  const org = user?.organization;
  const sub = org?.subscription;
  const orders = org?.orderConfirmations || [];

  const [pending, approved, rejected, totalOrders] = await Promise.all([
    prisma.orderConfirmation.count({ where: { organizationId: org?.id, status: "PENDING" } }),
    prisma.orderConfirmation.count({ where: { organizationId: org?.id, status: "APPROVED" } }),
    prisma.orderConfirmation.count({ where: { organizationId: org?.id, status: "REJECTED" } }),
    prisma.orderConfirmation.count({ where: { organizationId: org?.id } }),
  ]);

  const plan = PLANS[sub?.plan || "FREE"];
  const usagePercent = sub ? Math.min(100, (sub.documentsUsed / sub.documentsLimit) * 100) : 0;

  const statusConfig: Record<string, { label: string; variant: any }> = {
    PENDING: { label: "Ausstehend", variant: "warning" },
    REVIEWED: { label: "Geprüft", variant: "secondary" },
    APPROVED: { label: "Genehmigt", variant: "success" },
    REJECTED: { label: "Abgelehnt", variant: "destructive" },
    ARCHIVED: { label: "Archiviert", variant: "outline" },
  };

  return (
    <div>
      <Header
        title={`Guten Tag, ${user?.name?.split(" ")[0] || ""}!`}
        description={`${org?.name} – ${plan.name}-Plan`}
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Gesamt Belege", value: totalOrders, icon: FileCheck2, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Ausstehend", value: pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "Genehmigt", value: approved, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
            { label: "Abgelehnt", value: rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Neueste Auftragsbestätigungen</CardTitle>
                <Link href="/orders" className="text-sm text-blue-600 hover:underline">
                  Alle anzeigen →
                </Link>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="py-8 text-center text-gray-400">
                    <FileCheck2 className="mx-auto mb-2 h-10 w-10 opacity-30" />
                    <p>Noch keine Auftragsbestätigungen vorhanden</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-900">
                            {order.supplierName || "Unbekannter Lieferant"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {order.orderNumber ? `AB ${order.orderNumber}` : "Keine Auftragsnummer"} ·{" "}
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="ml-4 flex items-center gap-3">
                          {order.amount && (
                            <span className="text-sm font-medium text-gray-700">
                              {formatCurrency(order.amount, order.currency || "EUR")}
                            </span>
                          )}
                          <Badge variant={statusConfig[order.status]?.variant}>
                            {statusConfig[order.status]?.label}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Usage & Plan */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nutzung dieses Monats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {sub?.documentsUsed || 0} / {sub?.documentsLimit === 999999 ? "∞" : sub?.documentsLimit || 10} Belege
                  </span>
                  <span className="font-medium">{Math.round(usagePercent)}%</span>
                </div>
                <Progress value={usagePercent} className={usagePercent > 80 ? "[&>div]:bg-red-500" : ""} />
                {usagePercent > 80 && (
                  <p className="mt-2 text-xs text-red-600">
                    Fast ausgeschöpft –{" "}
                    <Link href="/billing" className="underline">
                      Jetzt upgraden
                    </Link>
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Aktueller Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant="default">{plan.name}</Badge>
                  {sub?.status === "ACTIVE" && <Badge variant="success">Aktiv</Badge>}
                  {sub?.status === "PAST_DUE" && <Badge variant="destructive">Überfällig</Badge>}
                </div>
                <p className="mb-4 text-sm text-gray-500">{plan.description}</p>
                <Link
                  href="/billing"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Plan verwalten →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
