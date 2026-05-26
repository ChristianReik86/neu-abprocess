"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileCheck2, Search, Plus, RefreshCw, CheckCircle2, XCircle, Archive, Loader2 } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; variant: any }> = {
  PENDING: { label: "Ausstehend", variant: "warning" },
  REVIEWED: { label: "Geprüft", variant: "secondary" },
  APPROVED: { label: "Genehmigt", variant: "success" },
  REJECTED: { label: "Abgelehnt", variant: "destructive" },
  ARCHIVED: { label: "Archiviert", variant: "outline" },
};

const ERP_STATUS: Record<string, { label: string; variant: any }> = {
  NOT_SYNCED: { label: "Nicht synchronisiert", variant: "outline" },
  SYNCING: { label: "Synchronisiert...", variant: "secondary" },
  SYNCED: { label: "Im ERP", variant: "success" },
  FAILED: { label: "Fehler", variant: "destructive" },
};

interface Order {
  id: string;
  orderNumber: string | null;
  supplierName: string | null;
  supplierEmail: string | null;
  subject: string | null;
  amount: number | null;
  currency: string | null;
  status: string;
  erpSyncStatus: string;
  createdAt: string;
  notes: string | null;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (statusFilter !== "ALL") params.set("status", statusFilter);

    const res = await fetch(`/api/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  }

  return (
    <div>
      <Header
        title="Auftragsbestätigungen"
        description={`${total} Belege insgesamt`}
      />

      <div className="p-6">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Suche nach Lieferant, AB-Nummer..."
                className="pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Alle Status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchOrders}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Manuell erfassen
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
              </div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <FileCheck2 className="mx-auto mb-3 h-12 w-12 opacity-30" />
                <p className="text-lg font-medium">Keine Auftragsbestätigungen</p>
                <p className="text-sm">Richten Sie Ihr E-Mail-Postfach ein, um automatisch Belege zu empfangen.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Lieferant</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">AB-Nummer</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Betrag</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">ERP</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Datum</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{order.supplierName || "—"}</p>
                            <p className="text-xs text-gray-400">{order.supplierEmail || ""}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{order.orderNumber || "—"}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {order.amount ? formatCurrency(order.amount, order.currency || "EUR") : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_CONFIG[order.status]?.variant}>
                            {STATUS_CONFIG[order.status]?.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={ERP_STATUS[order.erpSyncStatus]?.variant}>
                            {ERP_STATUS[order.erpSyncStatus]?.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            {order.status === "PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => updateStatus(order.id, "APPROVED")}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateStatus(order.id, "REJECTED")}
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(order.id, "ARCHIVED")}
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {total > 20 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>Zeige {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} von {total}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Zurück
              </Button>
              <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>
                Weiter
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Auftragsbestätigung Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-gray-500">Lieferant</p><p className="font-medium">{selectedOrder.supplierName || "—"}</p></div>
                <div><p className="text-gray-500">AB-Nummer</p><p className="font-medium">{selectedOrder.orderNumber || "—"}</p></div>
                <div><p className="text-gray-500">Betrag</p><p className="font-medium">{selectedOrder.amount ? formatCurrency(selectedOrder.amount, selectedOrder.currency || "EUR") : "—"}</p></div>
                <div><p className="text-gray-500">Status</p><Badge variant={STATUS_CONFIG[selectedOrder.status]?.variant}>{STATUS_CONFIG[selectedOrder.status]?.label}</Badge></div>
              </div>
              {selectedOrder.subject && (
                <div><p className="text-gray-500">Betreff</p><p>{selectedOrder.subject}</p></div>
              )}
              {selectedOrder.notes && (
                <div><p className="text-gray-500">Notizen</p><p>{selectedOrder.notes}</p></div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>Schließen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <CreateOrderDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreated={fetchOrders}
      />
    </div>
  );
}

function CreateOrderDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    supplierName: "",
    supplierEmail: "",
    orderNumber: "",
    amount: "",
    currency: "EUR",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: form.amount ? parseFloat(form.amount) : undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Fehler beim Erstellen");
      setLoading(false);
      return;
    }

    onCreated();
    onClose();
    setForm({ supplierName: "", supplierEmail: "", orderNumber: "", amount: "", currency: "EUR", notes: "" });
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Beleg manuell erfassen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Lieferant</Label>
              <Input name="supplierName" value={form.supplierName} onChange={handleChange} placeholder="Muster AG" />
            </div>
            <div className="space-y-1.5">
              <Label>AB-Nummer</Label>
              <Input name="orderNumber" value={form.orderNumber} onChange={handleChange} placeholder="AB-2025-001" />
            </div>
            <div className="space-y-1.5">
              <Label>Betrag</Label>
              <Input name="amount" type="number" step="0.01" value={form.amount} onChange={handleChange} placeholder="1234.50" />
            </div>
            <div className="space-y-1.5">
              <Label>Währung</Label>
              <Input name="currency" value={form.currency} onChange={handleChange} placeholder="EUR" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notizen</Label>
            <Input name="notes" value={form.notes} onChange={handleChange} placeholder="Optionale Anmerkungen..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Erstellen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
