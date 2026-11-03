"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { formatDateWib } from "@/lib/status-labels";
import { describeLoanState } from "@/lib/services/loans";
import type { Book, Borrowing, Profile } from "@/types/db";

interface Notice {
  tone: "success" | "error";
  message: string;
}

const stateTone: Record<string, BadgeTone> = {
  aktif: "info",
  "mendekati tenggat": "warning",
  terlambat: "danger",
  "sudah dikembalikan": "neutral",
};

export function LoansAdmin({
  borrowings,
  members,
  books,
}: {
  borrowings: Borrowing[];
  members: Profile[];
  books: Book[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [target, setTarget] = useState<Borrowing | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const memberName = (id: string) =>
    members.find((m) => m.id === id)?.fullName ?? id;
  const bookTitle = (id: string) =>
    books.find((b) => b.id === id)?.title ?? id;

  const submit = async () => {
    if (!target) return;
    setNotice(null);
    setSubmitting(true);
    const res = await fetch(`/api/admin/peminjaman/${target.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "returned" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      setNotice({
        tone: "error",
        message: data.message ?? "Tidak dapat menghubungi server. Coba lagi.",
      });
      setSubmitting(false);
      return;
    }
    toast("Peminjaman ditandai sudah dikembalikan.", "success");
    setTarget(null);
    setSubmitting(false);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {borrowings.length === 0 ? (
        <p className="text-sm text-ink-soft">Belum ada data peminjaman.</p>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Member</TH>
              <TH>Buku</TH>
              <TH>Dipinjam</TH>
              <TH>Tenggat</TH>
              <TH>Status</TH>
              <TH>Aksi</TH>
            </TR>
          </THead>
          <TBody>
            {borrowings.map((borrowing) => {
              const state = describeLoanState(borrowing);
              return (
                <TR key={borrowing.id}>
                  <TD className="font-medium">{memberName(borrowing.memberId)}</TD>
                  <TD>{bookTitle(borrowing.bookId)}</TD>
                  <TD>{formatDateWib(borrowing.borrowedAt)}</TD>
                  <TD>{formatDateWib(borrowing.dueDate)}</TD>
                  <TD>
                    <Badge tone={stateTone[state.label] ?? "neutral"}>
                      {state.label}
                    </Badge>
                  </TD>
                  <TD>
                    {borrowing.returnedAt || borrowing.status === "returned" ? (
                      <span className="text-xs text-ink-soft">
                        Kembali {formatDateWib(borrowing.returnedAt ?? borrowing.dueDate)}
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setTarget(borrowing);
                          setNotice(null);
                        }}
                      >
                        Tandai Kembali
                      </Button>
                    )}
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}

      <Modal
        open={Boolean(target)}
        title="Tandai Sudah Dikembalikan"
        description={
          target
            ? `${bookTitle(target.bookId)} dipinjam ${memberName(target.memberId)}. Tandai hanya setelah fisik buku kembali.`
            : undefined
        }
        onClose={() => {
          setTarget(null);
          setNotice(null);
        }}
      >
        {notice ? (
          <div
            role="status"
            className="flex items-start gap-2 rounded-field border border-danger/30 bg-red-50 px-3 py-2.5 text-xs text-danger"
          >
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{notice.message}</span>
          </div>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              setTarget(null);
              setNotice(null);
            }}
          >
            Batal
          </Button>
          <Button loading={submitting} disabled={submitting} onClick={submit}>
            Ya, Tandai Kembali
          </Button>
        </div>
      </Modal>
    </div>
  );
}
