import { dataMode } from "@/lib/config";
import { store } from "@/lib/mock-store";
import type { Borrowing, LoanStatus } from "@/types/db";

export interface LoanDisplayState {
  label: "aktif" | "mendekati tenggat" | "terlambat" | "sudah dikembalikan";
  status: LoanStatus;
  daysRemaining: number;
}

export function describeLoanState(
  borrowing: Borrowing,
  now: Date = new Date()
): LoanDisplayState {
  const due = new Date(borrowing.dueDate).getTime();
  const diffDays = Math.ceil((due - now.getTime()) / 86_400_000);

  if (borrowing.returnedAt || borrowing.status === "returned") {
    return {
      label: "sudah dikembalikan",
      status: "returned",
      daysRemaining: 0,
    };
  }
  if (diffDays < 0) {
    return {
      label: "terlambat",
      status: borrowing.status === "overdue" ? "overdue" : "active",
      daysRemaining: diffDays,
    };
  }
  if (diffDays <= 3) {
    return {
      label: "mendekati tenggat",
      status: borrowing.status === "overdue" ? "overdue" : "active",
      daysRemaining: diffDays,
    };
  }
  return {
    label: "aktif",
    status: borrowing.status === "overdue" ? "overdue" : "active",
    daysRemaining: diffDays,
  };
}

export async function listBorrowingsByMember(
  memberId: string
): Promise<Borrowing[]> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk peminjaman belum tersedia di Fase 1");
  }
  return store.borrowings
    .filter((b) => b.memberId === memberId)
    .slice()
    .sort((a, b) => b.borrowedAt.localeCompare(a.borrowedAt));
}

export function listBorrowingsForAdmin(): Borrowing[] {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk peminjaman belum tersedia di Fase 1");
  }
  return store.borrowings
    .slice()
    .sort((a, b) => b.borrowedAt.localeCompare(a.borrowedAt));
}

export async function markBorrowingReturned(borrowingId: string): Promise<Borrowing> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk peminjaman belum tersedia di Fase 1");
  }
  const borrowing = store.borrowings.find((b) => b.id === borrowingId);
  if (!borrowing) throw new Error("Data peminjaman tidak ditemukan.");
  if (borrowing.returnedAt || borrowing.status === "returned") {
    throw new Error("Buku ini sudah ditandai kembali.");
  }
  borrowing.returnedAt = new Date().toISOString();
  borrowing.status = "returned";
  return { ...borrowing };
}
