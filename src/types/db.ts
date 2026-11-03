export type UserRole = "member" | "volunteer" | "admin";
export type MembershipStatus = "pending" | "active" | "expired";
export type VolunteerApprovalStatus = "pending" | "approved" | "rejected";
export type BookStatus = "published" | "archived";
export type LoanStatus = "active" | "returned" | "overdue";
export type ActivityStatus = "draft" | "published" | "closed" | "archived";
export type RegistrationStatus = "registered" | "cancelled";
export type PaymentSubject = "activity_registration" | "donation";
export type PaymentStatus = "pending" | "verified" | "rejected";
export type PaymentMethod = "qris" | "bank_transfer";
export type DonationType = "financial" | "physical";
export type DonationStatus = "pending" | "confirmed" | "rejected" | "fulfilled";
export type AttendanceRole = "member" | "volunteer";
export type ActivityTypeBadge = "gratis" | "berbayar";

export interface Profile {
  id: string;
  memberNo: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  membershipStatus: MembershipStatus;
  volunteerApprovalStatus: VolunteerApprovalStatus;
  createdAt: string;
}

export interface BookCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  publicationYear: number;
  isbn: string | null;
  categoryId: string;
  synopsis: string;
  coverUrl: string | null;
  totalCopies: number;
  availableCopies: number;
  status: BookStatus;
  popularity: number;
  createdAt: string;
}

export interface Borrowing {
  id: string;
  memberId: string;
  bookId: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt: string | null;
  status: LoanStatus;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  posterUrl: string | null;
  startsAt: string;
  endsAt: string;
  location: string;
  organizer: string;
  feeAmount: number;
  capacity: number;
  registrationDeadline: string;
  status: ActivityStatus;
  createdAt: string;
}

export interface ActivityRegistration {
  id: string;
  reference: string;
  activityId: string;
  memberId: string | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  registeredAt: string;
  status: RegistrationStatus;
}

export interface Payment {
  id: string;
  subject: PaymentSubject;
  activityRegistrationId: string | null;
  donationId: string | null;
  amount: number;
  method: PaymentMethod;
  evidenceUrl: string | null;
  status: PaymentStatus;
  verifiedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export interface Donation {
  id: string;
  reference: string;
  type: DonationType;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  amount: number | null;
  bookCount: number | null;
  bookTitles: string | null;
  bookCondition: string | null;
  notes: string | null;
  paymentMethod: PaymentMethod | null;
  evidenceUrl: string | null;
  dropOffAt: string | null;
  status: DonationStatus;
  createdAt: string;
}

export interface VolunteerAssignment {
  id: string;
  volunteerId: string;
  activityId: string;
  responsibilities: string;
}

export interface AttendanceRecord {
  id: string;
  activityId: string;
  personId: string;
  personRole: AttendanceRole;
  scannedAt: string;
}

export type NotificationCategory =
  | "kegiatan"
  | "pembayaran"
  | "donasi"
  | "absensi"
  | "pengumuman"
  | "pengingat";

export interface AppNotification {
  id: string;
  userId: string;
  category: NotificationCategory;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface ActivityQrToken {
  id: string;
  activityId: string;
  token: string;
  active: boolean;
  expiresAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  address: string | null;
  mapsUrl: string | null;
  instagramUrl: string | null;
  phone: string | null;
  email: string | null;
  qrisImageUrl: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
  donationInstructions: string | null;
}

export type BookSort = "title_asc" | "title_desc" | "newest" | "popular";

export interface BookQuery {
  search?: string;
  categorySlug?: string;
  availableOnly?: boolean;
  sort?: BookSort;
  page?: number;
  pageSize?: number;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type ActivityActivityWindowState =
  | "open"
  | "deadline_passed"
  | "full"
  | "closed";

export interface ActivityRegistrationSummary {
  registeredCount: number;
  slotsLeft: number | null;
  window: ActivityActivityWindowState;
  isFree: boolean;
}
