"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Database, Plus, Trash2, Loader2, CheckCircle2, XCircle, Wifi } from "lucide-react";

const ERP_TYPES = [
  { value: "SAP", label: "SAP" },
  { value: "NAVISION", label: "Microsoft Navision" },
  { value: "DYNAMICS365", label: "Microsoft Dynamics 365" },
  { value: "SAGE", label: "Sage" },
  { value: "DATEV", label: "DATEV" },
  { value: "LEXOFFICE", label: "Lexoffice" },
  { value: "SEVDESK", label: "sevDesk" },
  { value: "CUSTOM_REST", label: "Eigene REST-API" },
  { value: "CUSTOM_SOAP", label: "Eigene SOAP-API" },
];

interface EmailConfig {
  id: string;
  label: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  folder: string;
  isActive: boolean;
  lastSyncAt: string | null;
}

interface ErpConfig {
  id: string;
  label: string;
  type: string;
  baseUrl: string;
  isActive: boolean;
  lastSyncAt: string | null;
}

export default function SettingsPage() {
  const [emailConfigs, setEmailConfigs] = useState<EmailConfig[]>([]);
  const [erpConfigs, setErpConfigs] = useState<ErpConfig[]>([]);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showErpDialog, setShowErpDialog] = useState(false);

  useEffect(() => {
    fetchEmailConfigs();
    fetchErpConfigs();
  }, []);

  async function fetchEmailConfigs() {
    const res = await fetch("/api/email-config");
    const data = await res.json();
    setEmailConfigs(data);
  }

  async function fetchErpConfigs() {
    const res = await fetch("/api/erp-config");
    const data = await res.json();
    setErpConfigs(data);
  }

  async function deleteEmailConfig(id: string) {
    await fetch(`/api/email-config/${id}`, { method: "DELETE" });
    fetchEmailConfigs();
  }

  async function deleteErpConfig(id: string) {
    await fetch(`/api/erp-config/${id}`, { method: "DELETE" });
    fetchErpConfigs();
  }

  async function toggleEmailConfig(id: string, isActive: boolean) {
    await fetch(`/api/email-config/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    fetchEmailConfigs();
  }

  return (
    <div>
      <Header title="Einstellungen" description="Verbindungen und Integrationen konfigurieren" />

      <div className="p-6">
        <Tabs defaultValue="email">
          <TabsList className="mb-6">
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              E-Mail-Postfächer
            </TabsTrigger>
            <TabsTrigger value="erp" className="gap-2">
              <Database className="h-4 w-4" />
              ERP-Verbindungen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>E-Mail-Postfächer</CardTitle>
                  <CardDescription>
                    Verbinden Sie IMAP-Postfächer zum automatischen Empfang von Auftragsbestätigungen
                  </CardDescription>
                </div>
                <Button onClick={() => setShowEmailDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Postfach hinzufügen
                </Button>
              </CardHeader>
              <CardContent>
                {emailConfigs.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <Mail className="mx-auto mb-3 h-12 w-12 opacity-30" />
                    <p className="font-medium">Noch kein Postfach konfiguriert</p>
                    <p className="text-sm">Fügen Sie Ihr erstes E-Mail-Postfach hinzu</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {emailConfigs.map((cfg) => (
                      <div
                        key={cfg.id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                            <Mail className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{cfg.label}</p>
                            <p className="text-sm text-gray-400">
                              {cfg.username} @ {cfg.host}:{cfg.port} · Ordner: {cfg.folder}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={cfg.isActive}
                            onCheckedChange={(v) => toggleEmailConfig(cfg.id, v)}
                          />
                          <Badge variant={cfg.isActive ? "success" : "secondary"}>
                            {cfg.isActive ? "Aktiv" : "Inaktiv"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-600"
                            onClick={() => deleteEmailConfig(cfg.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="erp">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>ERP-Verbindungen</CardTitle>
                  <CardDescription>
                    Konfigurieren Sie Ihr ERP-System für die automatische Synchronisation
                  </CardDescription>
                </div>
                <Button onClick={() => setShowErpDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  ERP hinzufügen
                </Button>
              </CardHeader>
              <CardContent>
                {erpConfigs.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <Database className="mx-auto mb-3 h-12 w-12 opacity-30" />
                    <p className="font-medium">Noch keine ERP-Verbindung konfiguriert</p>
                    <p className="text-sm">Verbinden Sie Ihr ERP-System</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {erpConfigs.map((cfg) => (
                      <div
                        key={cfg.id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                            <Database className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{cfg.label}</p>
                            <p className="text-sm text-gray-400">
                              {ERP_TYPES.find((t) => t.value === cfg.type)?.label || cfg.type} · {cfg.baseUrl}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={cfg.isActive ? "success" : "secondary"}>
                            {cfg.isActive ? "Aktiv" : "Inaktiv"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-600"
                            onClick={() => deleteErpConfig(cfg.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <EmailConfigDialog
        open={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        onCreated={fetchEmailConfigs}
      />
      <ErpConfigDialog
        open={showErpDialog}
        onClose={() => setShowErpDialog(false)}
        onCreated={fetchErpConfigs}
      />
    </div>
  );
}

function EmailConfigDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    label: "", host: "", port: "993", secure: true,
    username: "", password: "", folder: "INBOX",
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    const res = await fetch("/api/email-config/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, port: parseInt(form.port) }),
    });
    const data = await res.json();
    setTestResult(data);
    setTesting(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/email-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, port: parseInt(form.port) }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Fehler");
      setLoading(false);
      return;
    }
    onCreated();
    onClose();
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>E-Mail-Postfach hinzufügen</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {testResult && (
            <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${testResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {testResult.message}
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Bezeichnung</Label>
            <Input name="label" value={form.label} onChange={handleChange} placeholder="z.B. Einkauf-Postfach" required />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>IMAP-Host</Label>
              <Input name="host" value={form.host} onChange={handleChange} placeholder="imap.beispiel.de" required />
            </div>
            <div className="space-y-1.5">
              <Label>Port</Label>
              <Input name="port" type="number" value={form.port} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Benutzername</Label>
              <Input name="username" value={form.username} onChange={handleChange} placeholder="benutzer@firma.de" required />
            </div>
            <div className="space-y-1.5">
              <Label>Passwort</Label>
              <Input name="password" type="password" value={form.password} onChange={handleChange} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Ordner</Label>
              <Input name="folder" value={form.folder} onChange={handleChange} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={form.secure} onCheckedChange={(v) => setForm((p) => ({ ...p, secure: v }))} />
              <Label>SSL/TLS</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleTest} disabled={testing}>
              {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wifi className="mr-2 h-4 w-4" />}
              Verbindung testen
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Speichern
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ErpConfigDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    label: "", type: "CUSTOM_REST", baseUrl: "",
    apiKey: "", username: "", password: "",
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    const res = await fetch("/api/erp-config/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setTestResult(data);
    setTesting(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/erp-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Fehler");
      setLoading(false);
      return;
    }
    onCreated();
    onClose();
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>ERP-Verbindung hinzufügen</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {testResult && (
            <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${testResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {testResult.message}
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Bezeichnung</Label>
            <Input name="label" value={form.label} onChange={handleChange} placeholder="z.B. Produktions-ERP" required />
          </div>
          <div className="space-y-1.5">
            <Label>ERP-System</Label>
            <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ERP_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>API-URL</Label>
            <Input name="baseUrl" value={form.baseUrl} onChange={handleChange} placeholder="https://mein-erp.beispiel.de/api" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>API-Key (optional)</Label>
              <Input name="apiKey" value={form.apiKey} onChange={handleChange} placeholder="sk_..." />
            </div>
            <div className="space-y-1.5">
              <Label>Benutzername (optional)</Label>
              <Input name="username" value={form.username} onChange={handleChange} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleTest} disabled={testing}>
              {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wifi className="mr-2 h-4 w-4" />}
              Verbindung testen
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Speichern
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
