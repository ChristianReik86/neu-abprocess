"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FileCheck2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    organizationName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registrierung fehlgeschlagen");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <FileCheck2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">AB-Process</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Konto erstellen</CardTitle>
            <CardDescription>10 Belege kostenlos – keine Kreditkarte erforderlich</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="organizationName">Unternehmensname</Label>
                <Input
                  id="organizationName"
                  name="organizationName"
                  placeholder="Muster GmbH"
                  value={formData.organizationName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">Ihr Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Max Mustermann"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="max@muster-gmbh.de"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mindestens 8 Zeichen"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kostenlos registrieren
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-500">
              Bereits registriert?{" "}
              <Link href="/login" className="font-medium text-blue-600 hover:underline">
                Jetzt anmelden
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
