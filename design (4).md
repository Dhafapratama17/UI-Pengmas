# ReteMali --- Mobile-First Responsive Library Application

## 1. Project Overview

**Application Name:** ReteMali\
**Application Type:** Responsive Web Application / Progressive Web App
(PWA)\
**Organization:** Taman Baca ReteMali\
**Primary Language:** Bahasa Indonesia\
**Primary Platforms:** Mobile, Tablet, and Desktop

ReteMali is a digital library and community application designed to
support Taman Baca ReteMali. The application allows users to explore
book collections, borrow books, register for community activities,
participate as volunteers, and make donations.

The application must prioritize a mobile-first experience while
remaining fully responsive and functional on tablets and desktop
computers.

The application is not a static prototype. All navigation menus,
buttons, forms, tabs, filters, dialogs, and user interactions must work
according to their intended functionality.

## 2. Main Objectives

-   Introduce Taman Baca ReteMali and its community programs.
-   Provide an interactive and searchable book catalog.
-   Enable book borrowing and borrowing-status tracking.
-   Support registration for free and paid community activities.
-   Provide financial and physical book donation services.
-   Offer dedicated dashboards for members, volunteers, and
    administrators.
-   Make the application accessible across mobile, tablet, and desktop
    devices.

## 3. Branding and Visual Identity

### 3.1 Application Logo

Use the ReteMali logo supplied by the user as the primary application
identity.

Implementation instructions:

-   Place the supplied logo in `public/images/retemali-logo.png`.
-   Use the logo on the login page, sidebar, home page, and application
    branding area.
-   Preserve the original logo proportions and colors.
-   Do not recreate, distort, recolor, or replace the supplied logo.
-   Use a suitable contained image layout to prevent cropping.
-   Provide meaningful alternative text: "Logo Taman Baca ReteMali".

If the original logo file has a different filename, update the image
reference accordingly.

### 3.2 Color Palette

Use a white and light-blue visual theme with stronger blue accents to
prevent the interface from looking empty or overly white.

  Color            Hex Code    Usage
  ---------------- ----------- -------------------------------------------
  Primary Blue     `#1976D2`   Primary buttons, active navigation, links
  Deep Blue        `#1557A0`   Headings, strong accents
  Light Blue       `#E8F4FF`   Section backgrounds, highlighted cards
  Soft Blue        `#D5EAFE`   Secondary cards, chips, borders
  White            `#FFFFFF`   Main surfaces and cards
  Background       `#F5F9FE`   Main application background
  Text Primary     `#20334A`   Main text and headings
  Text Secondary   `#64748B`   Descriptions and metadata
  Success          `#198754`   Successful registration and transactions
  Warning          `#E9A23B`   Pending payments and pending approvals
  Error            `#DC3545`   Validation errors and failed transactions

Maintain sufficient contrast between text, backgrounds, buttons, and
icons.

### 3.3 Typography

Use Inter, Plus Jakarta Sans, or a similar modern sans-serif font.

Typography guidelines:

-   Main headings: bold and clearly visible.
-   Section headings: medium to semibold.
-   Body text: comfortable and readable on small screens.
-   Metadata: smaller but still accessible.
-   Buttons: medium-weight text with clear action labels.

### 3.4 UI Components

Use a consistent design system with:

-   Rounded cards with approximately 12--18px corner radii.
-   Primary buttons with rounded corners.
-   Consistent spacing and padding.
-   Simple line icons.
-   Soft borders and subtle shadows.
-   Clear active, hover, pressed, disabled, loading, and focus states.
-   Consistent form fields, dropdowns, badges, and confirmation dialogs.

Avoid excessive gradients, unnecessary animations, and decorative
elements that interfere with usability.

## 4. User Roles and Access Control

The application supports four access modes.

### 4.1 Non-Member

Non-members can explore public features without creating an account.

Permissions:

-   View the home page.
-   Browse and search the public book catalog.
-   View book details and availability.
-   View community activities.
-   Register for activities using the required identity information.
-   View donation information.
-   Submit financial or physical book donation forms.

Restrictions:

-   Cannot access member-only profile information.
-   Cannot use the member borrowing-history dashboard.
-   Cannot access member QR attendance.
-   Cannot access volunteer or administrator dashboards.
-   Must sign in or register for a member account if an action requires
    verified membership.

Provide a clear "Masuk sebagai Non-Member" option on the login page.
This option should open the public application without requiring a
password.

### 4.2 Member

Members have access to all public features plus a dedicated member
dashboard.

Additional permissions:

-   View and edit permitted profile information.
-   View current and historical book loans.
-   Check due dates and borrowing status.
-   View borrowing history.
-   Access a personal QR code for eligible attendance activities.
-   View registered community activities.
-   Check registration and payment statuses.
-   View notifications and account information.

Member-only features must only be available after successful
authentication and membership verification.

### 4.3 Volunteer

Volunteers have access to public features and volunteer-specific
information.

Additional permissions:

-   View the volunteer dashboard.
-   View approved volunteer activities.
-   See activity names, dates, schedules, locations, and assigned
    responsibilities.
-   Access a personal QR code for volunteer attendance.
-   View attendance history.
-   Check volunteer registration and approval status.
-   Receive activity announcements.

Volunteer attendance must be recorded against the correct activity and
schedule.

The volunteer menu and volunteer-only features must only become
available when the account has an approved volunteer role. Users who are
not approved must not see active volunteer controls.

### 4.4 Administrator

Administrators have access to the management dashboard.

Administrative features:

-   Manage book collections, categories, and book availability.
-   Manage member accounts and membership verification.
-   Manage book loans, returns, and borrowing records.
-   Create, edit, publish, and manage community activities.
-   Manage free and paid activity registrations.
-   Verify payment evidence.
-   Manage financial donations and physical book donations.
-   Manage volunteer applications, schedules, assignments, and
    attendance.
-   Manage QR attendance records.
-   View reports and operational statistics.
-   Manage public home page information and contact details.

Administrative actions must require appropriate authorization.

## 5. Application Entry Point: Login Page

The login page must be the first page displayed when a user opens the
application, unless a valid authenticated session already exists.

### 5.1 Login Page Layout

Create a clean, friendly, modern layout using white and light blue.

Desktop layout:

-   Two-column composition.
-   Left section: ReteMali logo, welcome message, short introduction,
    and an optional illustration.
-   Right section: login card with account access options.
-   Center the login card vertically with comfortable spacing.

Tablet layout:

-   Use a compact two-column layout when sufficient space is available.
-   Switch to a single-column layout on narrower screens.

Mobile layout:

-   Single-column layout.
-   Logo at the top.
-   Welcome message underneath.
-   Access options displayed as full-width buttons or stacked cards.
-   Login form displayed only when required.
-   Avoid unnecessary scrolling on common mobile screen sizes.

### 5.2 Welcome Content

Main heading:

"Selamat Datang di ReteMali"

Description:

"Temukan buku, ikuti kegiatan komunitas, dan tumbuh bersama Taman Baca
ReteMali."

### 5.3 Four Login Access Options

Display four clearly differentiated options:

1.  **Masuk sebagai Non-Member**
    -   No account required.
    -   Open the public application directly.
    -   Provide access to the four main navigation menus.
2.  **Masuk sebagai Member**
    -   Display email and password fields.
    -   Provide a login button.
    -   Include links for member registration and password recovery.
    -   Redirect successfully authenticated members to their member
        dashboard.
3.  **Masuk sebagai Volunteer**
    -   Display email and password fields.
    -   Validate the volunteer role and approval status.
    -   Redirect approved volunteers to their volunteer dashboard.
    -   Display an appropriate message when the account is not approved
        or does not have the volunteer role.
4.  **Masuk sebagai Admin**
    -   Display administrator email and password fields.
    -   Use the same overall design language but clearly identify the
        administrator access mode.
    -   Redirect authorized administrators to the admin dashboard.
    -   Never expose administrator credentials in the frontend.

Use distinct icons and short descriptions for each access option. The
selected role should be visually highlighted.

### 5.4 Login Interactions

-   Clicking an access option must open the correct form or public
    application.
-   Password visibility must be toggleable.
-   Required fields must be validated.
-   Invalid credentials must display a helpful error message.
-   Login buttons must display a loading state while processing.
-   Successful authentication must redirect to the correct dashboard.
-   The application must preserve valid sessions and support logout.
-   Unauthenticated users must not be able to access protected routes by
    entering URLs manually.

## 6. Main Application Navigation

The application has four main navigation menus:

1.  Beranda
2.  Katalog Buku
3.  Kegiatan Komunitas
4.  Donasi

### 6.1 Responsive Sidebar

Create a sidebar that opens and closes when the user clicks the
hamburger menu icon located in the upper-left corner of the application
header.

Sidebar requirements:

-   Display the ReteMali logo and application name.
-   Display the four main navigation menus with icons.
-   Highlight the currently active menu.
-   Display additional role-specific menus when appropriate.
-   Provide an overlay on mobile when the sidebar is open.
-   Close the sidebar when a user selects a menu on mobile.
-   Support keyboard navigation and accessible controls.

On mobile, the sidebar should slide in from the left. On desktop, it may
appear as a collapsible side panel.

The hamburger button must toggle the actual sidebar state. It must not
be a decorative element.

### 6.2 Application Header

Include:

-   Hamburger menu.
-   Page title or breadcrumb.
-   Optional global search shortcut.
-   Notification icon when applicable.
-   User avatar or profile menu for authenticated users.

Keep the header compact, especially on mobile.

### 6.3 Responsive Navigation

On small mobile screens, use the hamburger sidebar as the primary
navigation method. A compact bottom navigation may be used as an
optional shortcut to the four main menus, provided it does not duplicate
controls excessively or make the interface crowded.

On tablets and desktops, use the sidebar with the main content area
occupying the remaining width.

## 7. Dashboard 1: Beranda

### 7.1 Purpose

Introduce Taman Baca ReteMali, showcase its books, highlight upcoming
community activities, and encourage participation and donations.

### 7.2 Page Structure

Arrange the sections in the following order.

#### A. Welcome Hero

Display:

-   Welcome heading.
-   Short introduction to Taman Baca ReteMali.
-   Supplied ReteMali logo.
-   A relevant library or reading illustration, if needed.
-   Primary buttons: "Jelajahi Buku" and "Lihat Kegiatan".

Suggested introduction:

"ReteMali hadir sebagai ruang belajar, membaca, dan bertumbuh bersama
masyarakat melalui kegiatan literasi yang terbuka dan bermanfaat."

The buttons must navigate to the correct catalog and community activity
pages.

#### B. About ReteMali

Display a short description of the library, its mission, and its
community activities.

Provide an optional "Selengkapnya" link to a dedicated about section or
page.

#### C. Koleksi Buku Terpopuler

Display book cards containing:

-   Book cover.
-   Title.
-   Author.
-   Category.
-   Availability status.
-   "Lihat Detail" action.

Provide a "Lihat Semua Buku" button that navigates to Katalog Buku.

Populate this section from actual book data when a backend is connected.

#### D. Kegiatan Terdekat

Display upcoming activities with:

-   Activity image or thumbnail.
-   Activity title.
-   Date and time.
-   Location.
-   Free or paid badge.
-   Registration status.
-   "Lihat Kegiatan" or "Daftar Sekarang" button.

Show a helpful empty state when no upcoming activities are available.

#### E. Informasi Donasi

Create a highlighted donation section with two options:

-   Donasi Finansial.
-   Donasi Buku Fisik.

Include a short explanation of how donations support literacy and
community activities.

Each button must open the corresponding donation form or section.

#### F. Location and Contact

Display:

-   Taman Baca ReteMali address.
-   Embedded map or map preview.
-   Button to open directions.
-   Instagram account link.
-   Contact telephone number.
-   Official email address.

Use verified organizational information supplied by the administrator.
Do not invent account names, phone numbers, email addresses, or map
coordinates.

External links should open correctly and provide clear feedback if a
service cannot be reached.

## 8. Dashboard 2: Katalog Buku

### 8.1 Purpose

Allow users to discover, search, filter, and inspect books, with
borrowing features available to eligible members.

### 8.2 Catalog Layout

Include:

-   Page title: "Katalog Buku".
-   Search field.
-   Category filter.
-   Sorting control.
-   Availability filter.
-   Book grid or list.
-   Pagination or a "Muat Lebih Banyak" control when needed.

### 8.3 Search and Sorting

Users must be able to:

-   Search by book title.
-   Search by author.
-   Search by category or relevant keywords.
-   Filter by category.
-   Filter by availability.
-   Sort alphabetically.
-   Sort by recently added books.
-   Sort by popularity when reliable usage data is available.

Search, filters, and sorting must update the displayed books rather than
only changing the control appearance.

On mobile, filters may open in a bottom sheet or compact dialog.

### 8.4 Book Cards

Each book card should display:

-   Cover image.
-   Book title.
-   Author.
-   Category.
-   Availability badge.
-   "Detail Buku" button.

Use a responsive grid: fewer columns on mobile, more columns on tablets
and desktops.

### 8.5 Book Details

When a user clicks a book, open a dedicated detail page or modal with:

-   Book cover.
-   Full title.
-   Author.
-   Publisher.
-   Publication year.
-   ISBN, when available.
-   Category.
-   Synopsis or description.
-   Total collection and available copies, where applicable.
-   Borrowing conditions.
-   Current availability status.

Provide a clear borrowing button when the book is available and the user
is eligible.

### 8.6 Borrowing Flow

For eligible members:

1.  Click "Pinjam Buku".
2.  Review the selected book and borrowing information.
3.  Confirm the borrowing request.
4.  Validate membership and book availability.
5.  Save the request.
6.  Display the result and borrowing status.
7.  Show the record in the member's borrowing dashboard.

If the book is unavailable, disable the borrowing action and explain its
status.

Non-members may explore book details but must be prompted to log in or
register as members when borrowing requires membership.

Borrowing confirmation must not be displayed as successful until the
request has been accepted and saved by the application.

## 9. Dashboard 3: Kegiatan Komunitas

### 9.1 Purpose

Provide information about community activities and enable users to
register for free or paid activities.

### 9.2 Activity Listing

Display:

-   Activity poster or image.
-   Activity name.
-   Description.
-   Date.
-   Start and end times.
-   Location.
-   Organizer.
-   Available capacity, if applicable.
-   Registration deadline.
-   Activity type: Gratis or Berbayar.
-   Registration status.

Include filters for:

-   All activities.
-   Free activities.
-   Paid activities.
-   Upcoming activities.
-   Past activities, when relevant.

Each activity must have a clickable detail view.

### 9.3 Activity Details

Display complete activity information and a prominent registration
button.

The registration button must reflect the activity state:

-   "Daftar Sekarang" when registration is open.
-   "Pendaftaran Ditutup" when registration is closed.
-   "Kuota Penuh" when capacity has been reached.
-   "Sudah Terdaftar" when the user already has an active registration.

Prevent duplicate registrations for the same user and activity.

### 9.4 Free Activity Registration

When the user clicks the registration button for a free activity:

1.  Open a registration form.
2.  Display the activity name and schedule.
3.  Request the required participant information, such as full name,
    email, and telephone number.
4.  For authenticated users, prefill available profile information.
5.  Validate required fields.
6.  Allow the user to confirm registration.
7.  Save the registration.
8.  Display a successful registration confirmation.
9.  Show the registration in the user's activity history.

Suggested confirmation:

"Pendaftaran berhasil! Kamu sudah terdaftar pada kegiatan ini. Silakan
periksa jadwal dan lokasi kegiatan."

If registration fails, display the reason and allow the user to retry.

### 9.5 Paid Activity Registration

When the user clicks the registration button for a paid activity:

1.  Display the activity details and registration fee.
2.  Collect or confirm participant information.
3.  Display available payment instructions.
4.  Allow the user to complete payment outside the app or through an
    integrated payment provider.
5.  Provide a form to upload payment proof when manual verification is
    used.
6.  Validate the required registration and payment fields.
7.  Enable the final registration submission only after all required
    information has been completed and the payment proof has been
    attached.
8.  Save the registration and payment submission.
9.  Display the appropriate confirmation.
10. Show the registration and payment verification status in the user's
    dashboard.

Suggested confirmation:

"Pendaftaran berhasil dikirim! Bukti pembayaran sedang diverifikasi oleh
admin. Informasi selanjutnya dapat dilihat melalui menu Kegiatan Saya."

Important implementation rules:

-   Distinguish between registration submitted, payment pending
    verification, payment verified, and payment rejected.
-   Do not label an unverified payment as successful or verified.
-   If the payment is rejected, allow the participant to upload
    corrected evidence when appropriate.
-   Validate the file type and file size.
-   Do not expose uploaded payment evidence publicly.

If a payment provider is integrated, use its verified transaction status
instead of relying solely on screenshots.

### 9.6 Registration History

Authenticated members and volunteers should be able to view their
relevant activity registrations.

Display:

-   Activity name.
-   Date and location.
-   Registration status.
-   Payment status when applicable.
-   Registration details.
-   Cancellation instructions, if cancellation is permitted.

## 10. Dashboard 4: Donasi

### 10.1 Purpose

Make it easy for visitors and community members to support Taman Baca
ReteMali through financial contributions or physical book donations.

Create two clear donation options.

### 10.2 Donasi Finansial

Display:

-   Explanation of the purpose of financial donations.
-   Official donation QRIS.
-   Official foundation bank account.
-   Bank name.
-   Account holder name.
-   Donation instructions.
-   Donation form.
-   Upload payment proof for manual transfers.
-   Confirmation and donation status.

Provide an option to select or enter a donation amount.

The amount selection may include suggested values, with a custom amount
field.

Allow users to choose the available payment method:

-   QRIS.
-   Bank transfer.

Donation instructions must be based on verified information provided by
the organization.

The QRIS image and bank account details must be configurable by the
administrator. Never use fabricated account details or a placeholder
QRIS as a real payment destination.

### 10.3 Financial Donation Flow

1.  Select "Donasi Finansial".
2.  Enter the donation amount.
3.  Select QRIS or bank transfer.
4.  Display the verified payment instructions.
5.  Complete payment through the selected method.
6.  Upload payment proof if required.
7.  Enter donor information if required by the organization.
8.  Submit the donation form.
9.  Save the donation record.
10. Display a confirmation with the donation reference and current
    status.

Suggested confirmation:

"Terima kasih atas dukunganmu untuk ReteMali. Donasi kamu telah tercatat
dan akan diverifikasi sesuai prosedur."

Distinguish between pending verification and confirmed donations.

### 10.4 Physical Book Donation

Display:

-   Description of the physical book donation program.
-   Types of books accepted.
-   Book condition requirements.
-   Official drop-off address.
-   Drop-off schedule.
-   Contact information.
-   Donation form.

The organization only accepts physical book donations through
**drop-off**. Do not provide a courier or shipping option.

### 10.5 Physical Book Donation Form

Required or configurable fields:

-   Donor's full name.
-   Email address.
-   Telephone number.
-   Number of books.
-   Book titles or a list of donated books.
-   Book categories.
-   General book condition.
-   Optional notes.
-   Planned drop-off date and time.

Provide a clear notice:

"Donasi buku fisik hanya dapat dilakukan melalui drop-off langsung di
Taman Baca ReteMali. Pengiriman melalui kurir tidak tersedia."

### 10.6 Physical Book Donation Flow

1.  Select "Donasi Buku Fisik".
2.  Fill in the donor information.
3.  Enter the book information.
4.  Select a planned drop-off schedule from available options.
5.  Review the information.
6.  Submit the form.
7.  Save the donation submission.
8.  Display the submission confirmation and reference number.
9.  Provide the drop-off location and schedule.

Suggested confirmation:

"Terima kasih! Pengajuan donasi buku berhasil dicatat. Silakan membawa
buku langsung ke lokasi ReteMali sesuai jadwal yang telah dipilih."

If the organization requires confirmation before accepting the books,
clearly distinguish between a submitted request and an approved drop-off
appointment.

## 11. Member Dashboard and Profile

Authenticated members should have an additional menu called "Profil
Saya".

The profile section must be separate from the four public navigation
menus.

### 11.1 Member Dashboard Overview

Display summary cards for:

-   Books currently borrowed.
-   Books already returned.
-   Loans approaching their due dates.
-   Activities joined.
-   Registration or payment statuses when applicable.

Only display data belonging to the authenticated member.

### 11.2 Member Profile

Include:

-   Profile photo or initials.
-   Full name.
-   Member ID.
-   Email address.
-   Telephone number.
-   Membership status.
-   Membership verification status.
-   Account creation or membership date, if available.
-   Edit profile action.
-   Change password action.
-   Logout action.

Provide a distinct membership badge, such as "Member ReteMali", to
distinguish the member interface from the non-member interface.

### 11.3 Borrowing Information

Display a list of borrowing records with:

-   Book cover and title.
-   Borrowing date.
-   Due date.
-   Return date, if applicable.
-   Borrowing status.
-   Overdue status when applicable.
-   Return or extension instructions, according to library policy.

The dashboard must calculate the displayed status from actual borrowing
records and due dates.

### 11.4 Member QR Code

Provide a dedicated QR code associated with the member's verified
identity.

The QR code may be used for attendance at eligible library or community
activities.

Requirements:

-   Display the QR code on the member dashboard.
-   Include the member's name and member ID nearby.
-   Generate a secure, unique identifier or signed token.
-   Do not encode passwords or unnecessary personal information directly
    in the QR code.
-   Validate the QR code on the server.
-   Support invalid, expired, or unauthorized QR responses.
-   Record attendance only for authorized activities and valid
    attendance windows.

The QR code is for identification and attendance. It must not
automatically grant administrator or volunteer privileges.

### 11.5 Additional Member Menus

Include:

-   Profil Saya.
-   Peminjaman Saya.
-   Kegiatan Saya.
-   QR Absensi.
-   Notifikasi.
-   Pengaturan Akun.
-   Logout.

These menus should be visible only to authenticated members with the
correct permissions.

## 12. Volunteer Dashboard

Volunteer accounts should have a dedicated dashboard and role-specific
navigation.

### 12.1 Volunteer Overview

Display summary cards for:

-   Upcoming volunteer activities.
-   Total activities participated in.
-   Attendance records.
-   Pending or approved assignments.

### 12.2 Volunteer Activity Information

Each activity card must display:

-   Activity name.
-   Activity date.
-   Start and end times.
-   Location.
-   Assigned responsibilities.
-   Organizer or coordinator.
-   Participation status.
-   Additional instructions.

Clicking an activity must open a detailed activity page.

### 12.3 Volunteer QR Attendance

Provide a personal volunteer QR code for attendance.

The QR attendance system must:

-   Associate attendance with the correct volunteer account.
-   Validate the assigned activity.
-   Validate the activity's attendance window.
-   Prevent duplicate attendance submissions.
-   Record attendance time.
-   Display attendance success or failure feedback.

If the QR code is scanned by an authorized administrator or attendance
scanner, the backend must validate and record the result.

### 12.4 Volunteer Menus

Include:

-   Dashboard Volunteer.
-   Kegiatan Saya.
-   Jadwal dan Tugas.
-   QR Absensi.
-   Riwayat Kehadiran.
-   Profil Saya.
-   Notifikasi.
-   Logout.

Only approved volunteers may access active volunteer functionality.

## 13. Administrator Dashboard

The administrator dashboard should prioritize operational information
and management actions.

### 13.1 Overview

Display statistics for:

-   Total books.
-   Available books.
-   Active members.
-   Active borrowing records.
-   Upcoming activities.
-   Pending activity registrations.
-   Payments requiring verification.
-   Financial donations.
-   Physical book donation requests.
-   Volunteer attendance.

Display charts only when sufficient real data is available.

### 13.2 Administrative Menus

Include:

-   Dashboard.
-   Manajemen Buku.
-   Manajemen Peminjaman.
-   Manajemen Member.
-   Manajemen Kegiatan.
-   Pendaftaran Kegiatan.
-   Verifikasi Pembayaran.
-   Manajemen Donasi.
-   Manajemen Volunteer.
-   QR dan Absensi.
-   Laporan.
-   Pengaturan Website.
-   Pengaturan Akun.
-   Logout.

### 13.3 Management Interactions

Administrators must be able to:

-   Add, edit, and archive books.
-   Update available book copies.
-   Process borrowing and return records.
-   Approve eligible membership or volunteer applications.
-   Create, update, publish, and close activities.
-   Manage activity capacity and registration deadlines.
-   Verify payment evidence.
-   Review donation submissions.
-   Manage volunteer assignments and attendance.
-   Update public contact information, social media links, maps, and
    donation instructions.

Use confirmation dialogs for destructive or sensitive actions.

## 14. Notifications and Status Feedback

Provide clear feedback for all major actions.

Examples:

-   "Data berhasil disimpan."
-   "Pendaftaran berhasil dikirim."
-   "Bukti pembayaran sedang diverifikasi."
-   "Pembayaran telah diverifikasi."
-   "Buku berhasil dipinjam."
-   "QR absensi berhasil divalidasi."
-   "Terjadi kesalahan. Silakan coba kembali."

Use success, warning, and error indicators consistently.

Notifications should be based on actual application events, not
hardcoded messages that imply an action was completed when it was not.

## 15. Responsive Design Requirements

The application must work across common screen sizes.

### Mobile

-   Single-column primary layout.
-   Collapsible hamburger sidebar.
-   Full-width forms and primary buttons.
-   Compact book cards.
-   Touch-friendly controls.
-   No horizontal page overflow.
-   Appropriate spacing around fixed navigation, if used.

### Tablet

-   Two-column layouts where appropriate.
-   More compact sidebar or collapsible navigation.
-   Multi-column book grids.
-   Responsive forms and cards.
-   Comfortable touch targets.

### Desktop

-   Persistent or collapsible sidebar.
-   Wide content area with sensible maximum widths.
-   Multi-column book and activity grids.
-   Dashboard statistics and management tables.
-   Appropriate spacing and readable text widths.

Recommended breakpoints:

-   Mobile: below 640px.
-   Tablet: 640px--1023px.
-   Desktop: 1024px and above.

Use responsive CSS rather than separate, disconnected applications for
each device.

## 16. Interaction and Navigation Requirements

All navigation elements must lead to functional destinations.

Required behavior:

-   Hamburger menu opens and closes the sidebar.
-   Each sidebar menu opens the correct page.
-   Active navigation reflects the current route.
-   Browser back and forward navigation work.
-   Book cards open their corresponding book details.
-   Activity cards open their corresponding activity details.
-   Forms validate their fields.
-   Search, filters, and sorting update their results.
-   Registration and donation forms show accurate submission states.
-   Login and logout work correctly.
-   Protected pages check authentication and permissions.
-   Modal dialogs and bottom sheets can be opened and closed.
-   Buttons provide loading and disabled states when necessary.

Avoid dead buttons, placeholder links, and controls that only change
their visual appearance.

Use a routing system appropriate to the selected frontend framework. If
Next.js is used, implement navigation with its App Router and use shared
layouts for the common application shell.

## 17. Suggested Route Structure

Use clear and consistent URLs.

### Public Routes

-   `/login`
-   `/beranda`
-   `/katalog`
-   `/katalog/[id]`
-   `/kegiatan`
-   `/kegiatan/[id]`
-   `/kegiatan/[id]/daftar`
-   `/donasi`
-   `/donasi/finansial`
-   `/donasi/buku-fisik`

### Member Routes

-   `/member`
-   `/member/profil`
-   `/member/peminjaman`
-   `/member/kegiatan`
-   `/member/qr-absensi`
-   `/member/notifikasi`
-   `/member/pengaturan`

### Volunteer Routes

-   `/volunteer`
-   `/volunteer/kegiatan`
-   `/volunteer/jadwal`
-   `/volunteer/qr-absensi`
-   `/volunteer/kehadiran`
-   `/volunteer/profil`

### Administrator Routes

-   `/admin`
-   `/admin/buku`
-   `/admin/peminjaman`
-   `/admin/member`
-   `/admin/kegiatan`
-   `/admin/pendaftaran`
-   `/admin/pembayaran`
-   `/admin/donasi`
-   `/admin/volunteer`
-   `/admin/absensi`
-   `/admin/laporan`
-   `/admin/pengaturan`

The routes are a recommended structure and can be adapted to the final
application architecture.

## 18. Recommended Technical Architecture

Suggested technology stack:

-   Frontend: Next.js with React and TypeScript.
-   Styling: Tailwind CSS.
-   Icons: Lucide.
-   Backend and database: Supabase.
-   Authentication: Supabase Auth.
-   Database: PostgreSQL through Supabase.
-   File storage: Supabase Storage or another authorized storage
    service.
-   Deployment: A compatible production hosting platform.

Use reusable components for the sidebar, header, book cards, activity
cards, forms, modals, notifications, and dashboard statistics.

Keep application logic separate from presentation components.

If the existing project already uses another framework or backend, adapt
the implementation to the existing stack instead of replacing it
unnecessarily.

## 19. Data Model Overview

Recommended database entities:

### Users and Roles

-   User profile.
-   Authentication identity.
-   Role assignments.
-   Membership status.
-   Volunteer approval status.

### Books

-   Book ID.
-   Title.
-   Author.
-   Publisher.
-   Publication year.
-   ISBN.
-   Category.
-   Synopsis.
-   Cover image.
-   Total copies.
-   Available copies.
-   Publication status.

### Borrowing Records

-   Borrowing ID.
-   Member ID.
-   Book ID.
-   Borrowing date.
-   Due date.
-   Return date.
-   Status.

### Activities

-   Activity ID.
-   Name.
-   Description.
-   Poster.
-   Date and time.
-   Location.
-   Fee.
-   Capacity.
-   Registration deadline.
-   Publication status.

### Activity Registrations

-   Registration ID.
-   Activity ID.
-   User or participant ID.
-   Participant information.
-   Registration date.
-   Registration status.
-   Payment status, when applicable.

### Payments

-   Payment ID.
-   Related registration or donation ID.
-   Amount.
-   Payment method.
-   Payment evidence.
-   Verification status.
-   Verification timestamp.

### Donations

-   Donation ID.
-   Donation type.
-   Donor information.
-   Amount or book details.
-   Payment or drop-off information.
-   Submission date.
-   Verification or fulfillment status.

### Volunteer Activities and Attendance

-   Volunteer assignment ID.
-   Volunteer ID.
-   Activity ID.
-   Assigned responsibilities.
-   Schedule.
-   Attendance record.
-   Attendance timestamp.
-   Attendance status.

All entities should have appropriate identifiers, relationships,
validation rules, and access policies.

## 20. Security and Privacy

Implement authentication and authorization on the server side.

Required protections:

-   Role-based access control.
-   Protected routes and API endpoints.
-   Database-level access policies, such as Supabase Row Level Security.
-   Secure session management.
-   Input validation and sanitization.
-   Restricted file uploads.
-   Private storage for payment evidence and sensitive documents.
-   Server-side verification of payment and QR attendance operations.
-   Prevention of duplicate registrations and unauthorized borrowing.
-   Rate limiting for sensitive endpoints where appropriate.

Hiding a menu in the frontend is not sufficient authorization. Every
protected action must also be validated on the server or through
database access policies.

## 21. Accessibility and Usability

-   Use readable font sizes.
-   Maintain accessible color contrast.
-   Provide descriptive labels for form fields.
-   Display clear validation errors.
-   Support keyboard navigation.
-   Provide visible focus states.
-   Add alternative text to meaningful images.
-   Do not rely on color alone to communicate status.
-   Ensure touch targets are comfortable to use.
-   Provide empty, loading, success, and error states.

## 22. Final Implementation Checklist

### Visual Design

-   [ ] Use the supplied ReteMali logo.
-   [ ] Apply the white and light-blue color palette.
-   [ ] Maintain consistent spacing and components.
-   [ ] Provide mobile, tablet, and desktop layouts.

### Login and Roles

-   [ ] Non-member access works without an account.
-   [ ] Member login and registration work.
-   [ ] Volunteer login checks approval status.
-   [ ] Administrator login is protected.
-   [ ] Role-based redirects work correctly.

### Main Navigation

-   [ ] Beranda works.
-   [ ] Katalog Buku works.
-   [ ] Kegiatan Komunitas works.
-   [ ] Donasi works.
-   [ ] Hamburger sidebar opens and closes.
-   [ ] Active menu follows the current route.

### Book Catalog

-   [ ] Search works.
-   [ ] Filters and sorting work.
-   [ ] Book details are available.
-   [ ] Eligible members can submit borrowing requests.
-   [ ] Borrowing statuses reflect actual records.

### Community Activities

-   [ ] Activity listings and details work.
-   [ ] Free registration works.
-   [ ] Paid registration and evidence upload work.
-   [ ] Payment verification states are accurate.
-   [ ] Duplicate registration is prevented.

### Donations

-   [ ] Financial donation instructions are configurable.
-   [ ] Official QRIS and bank information are used.
-   [ ] Payment evidence can be submitted securely.
-   [ ] Physical book donation form works.
-   [ ] Physical book donations support drop-off only.

### Member and Volunteer Dashboards

-   [ ] Member profile and borrowing history work.
-   [ ] Member QR attendance is available.
-   [ ] Volunteer activities and schedules work.
-   [ ] Volunteer QR attendance is available.
-   [ ] Role-specific information is restricted to authorized users.

### Administration

-   [ ] Books and borrowing records can be managed.
-   [ ] Activities and registrations can be managed.
-   [ ] Payments and donations can be verified.
-   [ ] Volunteer assignments and attendance can be managed.
-   [ ] Reports and website settings are available.

### Final Quality

-   [ ] No dead buttons or broken internal links.
-   [ ] Forms validate inputs.
-   [ ] Loading, empty, success, and error states are implemented.
-   [ ] Authentication and authorization are enforced.
-   [ ] Layouts are responsive.
-   [ ] Core workflows are tested from beginning to end.

## Final Design Direction

Build ReteMali as a welcoming, modern, and practical digital library
application. The interface should make discovering books, joining
community activities, and supporting literacy through donations feel
simple and accessible.

Prioritize a polished login page, a responsive collapsible sidebar, the
four main public dashboards, and distinct member, volunteer, and
administrator experiences.

Every interactive element must be connected to its intended page, form,
or backend operation. Where the backend or official organizational
information is not yet available, provide clearly identified
placeholders and do not simulate real transactions or successful
records.
