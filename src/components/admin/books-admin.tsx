"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Select, Textarea } from "@/components/ui/input";
import {
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { bookStatusLabel, bookStatusTone } from "@/lib/status-labels";
import type { Book } from "@/types/db";

interface CategoryOption {
  id: string;
  name: string;
}

type DialogMode = "create" | "edit" | "stock" | "delete" | null;

interface Notice {
  tone: "success" | "error";
  message: string;
}

interface FormState {
  title: string;
  author: string;
  publisher: string;
  publicationYear: string;
  isbn: string;
  categoryId: string;
  synopsis: string;
  coverUrl: string;
  totalCopies: string;
  availableCopies: string;
  status: string;
}

function emptyForm(categoryId: string): FormState {
  return {
    title: "",
    author: "",
    publisher: "",
    publicationYear: "",
    isbn: "",
    categoryId,
    synopsis: "",
    coverUrl: "",
    totalCopies: "1",
    availableCopies: "1",
    status: "published",
  };
}

export function BooksAdmin({
  books,
  categories,
}: {
  books: Book[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [dialog, setDialog] = useState<DialogMode>(null);
  const [target, setTarget] = useState<Book | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(categories[0]?.id ?? ""));
  const [notice, setNotice] = useState<Notice | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setForm(emptyForm(categories[0]?.id ?? ""));
    setTarget(null);
    setNotice(null);
    setDialog("create");
  };

  const openEdit = (book: Book) => {
    setTarget(book);
    setForm({
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      publicationYear: String(book.publicationYear),
      isbn: book.isbn ?? "",
      categoryId: book.categoryId,
      synopsis: book.synopsis,
      coverUrl: book.coverUrl ?? "",
      totalCopies: String(book.totalCopies),
      availableCopies: String(book.availableCopies),
      status: book.status,
    });
    setNotice(null);
    setDialog("edit");
  };

  const openStock = (book: Book) => {
    setTarget(book);
    setForm(openStockForm(book));
    setNotice(null);
    setDialog("stock");
  };

  const openDelete = (book: Book) => {
    setTarget(book);
    setNotice(null);
    setDialog("delete");
  };

  const closeDialog = () => {
    setDialog(null);
    setTarget(null);
  };

  const send = async (
    url: string,
    method: "POST" | "PATCH" | "DELETE",
    body?: unknown
  ) => {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      setNotice({
        tone: "error",
        message: data.message ?? "Tidak dapat menghubungi server. Coba lagi.",
      });
      return false;
    }
    return true;
  };

  const handleSave = async (mode: "create" | "edit") => {
    setNotice(null);
    setSubmitting(true);
    const payload = {
      title: form.title,
      author: form.author,
      publisher: form.publisher,
      publicationYear: Number(form.publicationYear),
      isbn: form.isbn || null,
      categoryId: form.categoryId,
      synopsis: form.synopsis,
      coverUrl: form.coverUrl || null,
      totalCopies: Number(form.totalCopies),
      availableCopies: Number(form.availableCopies),
      status: form.status === "archived" ? "archived" : "published",
    };
    const ok =
      mode === "create"
        ? await send("/api/admin/buku", "POST", payload)
        : await send(`/api/admin/buku/${target?.id}`, "PATCH", payload);
    if (ok) {
      toast("Data buku berhasil disimpan.", "success");
      closeDialog();
      router.refresh();
    }
    setSubmitting(false);
  };

  const handleStockSave = async () => {
    setNotice(null);
    setSubmitting(true);
    const ok = await send(`/api/admin/buku/${target?.id}`, "PATCH", {
      totalCopies: Number(form.totalCopies),
      availableCopies: Number(form.availableCopies),
    });
    if (ok) {
      toast("Stok buku diperbarui.", "success");
      closeDialog();
      router.refresh();
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    setSubmitting(true);
    const ok = await send(`/api/admin/buku/${target?.id}`, "DELETE");
    if (ok) {
      toast("Buku berhasil dihapus.", "success");
      closeDialog();
      router.refresh();
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          Total {books.length} entri (termasuk arsip). Gunakan pencarian di atas.
        </p>
        <Button onClick={openCreate}>+ Tambah Buku</Button>
      </div>

      <Table>
        <THead>
          <TR>
            <TH>Judul</TH>
            <TH>Kategori</TH>
            <TH>Tahun</TH>
            <TH>Stok</TH>
            <TH>Status</TH>
            <TH>Aksi</TH>
          </TR>
        </THead>
        <TBody>
          {books.map((book) => (
            <TR key={book.id}>
              <TD>
                <div className="font-semibold text-ink">{book.title}</div>
                <div className="text-xs text-ink-soft">{book.author}</div>
              </TD>
              <TD>
                {categories.find((c) => c.id === book.categoryId)?.name ?? "-"}
              </TD>
              <TD>{book.publicationYear}</TD>
              <TD>
                {book.availableCopies}/{book.totalCopies}
              </TD>
              <TD>
                <Badge tone={bookStatusTone(book.status)}>
                  {bookStatusLabel(book.status)}
                </Badge>
              </TD>
              <TD>
                <div className="flex flex-wrap gap-1.5">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(book)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openStock(book)}
                  >
                    Stok
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger"
                    onClick={() => openDelete(book)}
                  >
                    Hapus
                  </Button>
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>

      <Modal
        open={dialog === "create" || dialog === "edit"}
        title={dialog === "create" ? "Tambah Buku" : `Edit Buku: ${target?.title}`}
        description="Informasi katalog. Salinan tersedia harus ≤ total salinan."
        onClose={closeDialog}
      >
        <BookFormFields
          form={form}
          setForm={setForm}
          categories={categories}
          notice={notice}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={closeDialog}>
            Batal
          </Button>
          <Button
            loading={submitting}
            disabled={submitting}
            onClick={() => handleSave(dialog === "create" ? "create" : "edit")}
          >
            Simpan Buku
          </Button>
        </div>
      </Modal>

      <Modal
        open={dialog === "stock"}
        title={`Kelola Stok: ${target?.title}`}
        description="Atur total salinan dan salinan yang tersedia untuk dipinjam."
        onClose={closeDialog}
      >
        <BookFormFields
          form={form}
          setForm={setForm}
          categories={categories}
          notice={notice}
          stockOnly
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={closeDialog}>
            Batal
          </Button>
          <Button loading={submitting} disabled={submitting} onClick={handleStockSave}>
            Simpan Stok
          </Button>
        </div>
      </Modal>

      <Modal
        open={dialog === "delete"}
        title="Hapus Buku"
        description={`"${target?.title}" akan dihapus dari katalog. Buku yang masih memiliki riwayat peminjaman tidak dapat dihapus; gunakan status arsip.`}
        onClose={closeDialog}
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
          <Button variant="ghost" onClick={closeDialog}>
            Batal
          </Button>
          <Button variant="danger" loading={submitting} disabled={submitting} onClick={handleDelete}>
            Hapus Permanen
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function openStockForm(book: Book): FormState {
  return {
    title: "",
    author: "",
    publisher: "",
    publicationYear: "",
    isbn: "",
    categoryId: "",
    synopsis: "",
    coverUrl: "",
    totalCopies: String(book.totalCopies),
    availableCopies: String(book.availableCopies),
    status: "published",
  };
}

function BookFormFields({
  form,
  setForm,
  categories,
  notice,
  stockOnly,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  categories: CategoryOption[];
  notice: Notice | null;
  stockOnly?: boolean;
}) {
  return (
    <div className="space-y-3">
      {stockOnly ? (
        <>
          <Input
            id="buku-total"
            label="Total Salinan"
            type="number"
            min={1}
            value={form.totalCopies}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, totalCopies: e.target.value }))
            }
          />
          <Input
            id="buku-tersedia"
            label="Salinan Tersedia"
            type="number"
            min={0}
            value={form.availableCopies}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, availableCopies: e.target.value }))
            }
          />
        </>
      ) : (
        <>
          <Input
            id="buku-judul"
            label="Judul Buku"
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
          />
          <Input
            id="buku-penulis"
            label="Penulis"
            value={form.author}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, author: e.target.value }))
            }
          />
          <Input
            id="buku-penerbit"
            label="Penerbit"
            value={form.publisher}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, publisher: e.target.value }))
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="buku-tahun"
              label="Tahun Terbit"
              type="number"
              min={1900}
              max={new Date().getFullYear() + 1}
              value={form.publicationYear}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  publicationYear: e.target.value,
                }))
              }
            />
            <Input
              id="buku-isbn"
              label="ISBN"
              hint="Kosongkan jika tidak ada."
              value={form.isbn}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isbn: e.target.value }))
              }
            />
          </div>
          <Select
            id="buku-kategori"
            label="Kategori"
            value={form.categoryId}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, categoryId: e.target.value }))
            }
          />
          <Textarea
            id="buku-sinopsis"
            label="Sinopsis"
            value={form.synopsis}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, synopsis: e.target.value }))
            }
          />
          <Input
            id="buku-cover"
            label="URL Cover"
            hint="Kosongkan jika belum tersedia."
            value={form.coverUrl}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, coverUrl: e.target.value }))
            }
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              id="buku-total2"
              label="Total Salinan"
              type="number"
              min={1}
              value={form.totalCopies}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, totalCopies: e.target.value }))
              }
            />
            <Input
              id="buku-tersedia2"
              label="Salinan Tersedia"
              type="number"
              min={0}
              value={form.availableCopies}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  availableCopies: e.target.value,
                }))
              }
            />
            <Select
              id="buku-status"
              label="Status Katalog"
              value={form.status}
              options={[
                { value: "published", label: "Tersedia" },
                { value: "archived", label: "Arsip" },
              ]}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, status: e.target.value }))
              }
            />
          </div>
        </>
      )}
      {notice ? (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-field border px-3 py-2.5 text-xs ${
            notice.tone === "success"
              ? "border-success/30 bg-green-50 text-success"
              : "border-danger/30 bg-red-50 text-danger"
          }`}
        >
          {notice.tone === "success" ? (
            <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          )}
          <span>{notice.message}</span>
        </div>
      ) : null}
    </div>
  );
}
