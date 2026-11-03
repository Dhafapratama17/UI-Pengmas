"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export function BroadcastForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("all");
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const send = async () => {
    setNotice(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/notifikasi/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), target }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setNotice(data.message ?? "Gagal mengirim pengumuman. Coba lagi.");
        return;
      }
      toast(
        `Pengumuman terkirim ke ${data.targets} akun.`,
        "success"
      );
      setTitle("");
      setBody("");
      router.refresh();
    } catch {
      setNotice("Tidak dapat menghubungi server. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className="space-y-3"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void send();
      }}
    >
      <Input
        id="pengumuman-judul"
        label="Judul Pengumuman"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        id="pengumuman-isi"
        label="Isi Pengumuman"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <Select
        id="pengumuman-target"
        label="Tujuan"
        value={target}
        options={[
          { value: "all", label: "Semua member dan relawan" },
          { value: "member", label: "Hanya member" },
          { value: "volunteer", label: "Hanya relawan" },
        ]}
        onChange={(e) => setTarget(e.target.value)}
      />
      {notice ? (
        <div
          role="status"
          className="rounded-field border border-danger/30 bg-red-50 px-3 py-2.5 text-xs text-danger"
        >
          {notice}
        </div>
      ) : null}
      <Button type="submit" loading={submitting} disabled={submitting}>
        <Megaphone className="h-4 w-4" aria-hidden />
        Kirim Pengumuman
      </Button>
    </form>
  );
}
