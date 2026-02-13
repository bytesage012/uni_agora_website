# UniAGORA UI Features Inventory

This document provides a comprehensive overview of all pages and features within the UniAGORA student marketplace.

## 1. Public & Core Discovery

### [Landing Page](file:///home/bytesage/unuagora-latest/src/app/page.tsx) (`/`)
- **Luxury Hero**: High-contrast typography with dynamic CTAs reflecting the user's auth state.
- **Smart Categories**: Interactive grid of categories (Writing, Tech, Design, etc.) that link to filtered marketplace results.
- **Onboarding Guide**: 3-step visual walkthrough for new students.
- **Marketplace Trust**: Integrated testimonials from verified university students.
- **FAQ Section**: Directly addresses safety, cost, and verification concerns across all campuses.

### [Marketplace Feed](file:///home/bytesage/unuagora-latest/src/app/marketplace/page.tsx) (`/marketplace`)
- **Expansive Header**: A unified, 1440px-wide sticky header with a centered 500px search bar.
- **Backdrop Blur**: Glassmorphism effect that keeps the search/filter section legible while scrolling.
- **Pill Navigation**: Horizontal scrollable filters for rapid category switching.
- **Responsive Grid**: Hover-responsive cards (Lift + Zoom) with freelancer names and categories.
- **Global Toggler**: A "Filters" button in the Navbar to hide/show the search section for a cleaner view.

### [Service Details](file:///home/bytesage/unuagora-latest/src/app/service/[id]/page.tsx) (`/service/[id]`)
- **Premium Detail View**: Two-column layout with a large content area and a sticky conversion sidebar.
- **Dynamic Conversion**:
  - **Visitor View**: Integrated "Start Conversation" (In-app) and WhatsApp redirection.
  - **Owner View**: "Owner View" badge and "Edit Listing" primary action.
- **Social Proof**: Dedicated reviews section with star ratings and detailed comments.
- **Trust Badges**: Visual "Verified Seller" markers and global "Safety First" guide.
- **Mobile Action Bar**: Fixed bottom message button for immediate conversion on small screens.

---

## 2. Freelancer & User Tools

### [User Dashboard](file:///home/bytesage/unuagora-latest/src/app/dashboard/page.tsx) (`/dashboard`)
- **Performance Stats**: Visual indicators with growth trends for listing engagement.
- **Management Center**: Centralized access to account settings and active listings.
- **Custom Illustrations**: Minimalist 2D SVG placeholders for empty states.

### [My Services](file:///home/bytesage/unuagora-latest/src/app/my-services/page.tsx) (`/my-services`)
- **Listing Hub**: High-density view of all services created by the user.
- **Management Shortcuts**: Direct "Edit" and "Delete" actions on every listing card.
- **Quick-Start**: Prominent "Add New Service" button for rapid gig launching.

### [Launch/Edit Gig](file:///home/bytesage/unuagora-latest/src/app/create-service/page.tsx) (`/create-service`, `/edit-service/[id]`)
- **Intuitive Builder**: Streamlined form for Title, Category, Description, and Price Hints.
- **Image Handling**: Drag-and-drop image uploader with instant cropping/preview.
- **Data Persistence**: Pre-filling existing data when editing, ensuring no loss of current information.
- **Permission Guard**: Multi-layer security to ensure only authorized owners can modify listings.

### [Profile & Accountability](file:///home/bytesage/unuagora-latest/src/app/profile/page.tsx) (`/profile`, `/edit-profile`)
- **Profile Card**: Public-facing view showing trust markers, member age, and university.
- **Smart Editing**: Field-level validation for bios and +234 phone number formatting.

---

## 3. Logistics & Communication

### [Inbox & Chat](file:///home/bytesage/unuagora-latest/src/app/messages/page.tsx) (`/messages`, `/messages/[id]`)
- **Unified Inbox**: Listing-specific conversation threads grouped by user.
- **Real-time API Polling**: Reliable message delivery with automatic updates.
- **Contextual In-app Chat**: Seamless transition from viewing a listing to negotiating a deal.

### [Identity Verification](file:///home/bytesage/unuagora-latest/src/app/verify/page.tsx) (`/verify`)
- **ID Submission**: Secure portal for students to upload their verification documents.
- **Workflow HUD**: Clear instructions on the verification steps and benefits.

---

## 4. Platform Administration

### [Admin Console](file:///home/bytesage/unuagora-latest/src/app/admin/users/page.tsx) (`/admin/users`)
- **Pro Data Table**: Clean management view for reviewing student registrations across various universities.
- **Verification Trigger**: One-click "Verify Now" button with integrated celebratory confetti.
- **User Auditing**: Secure access to user verification status and documents.

---

## 5. Security & Legal Foundation
- **Auth Flow**: Secure Login, Signup, Forgot Password, and Update Password routes.
- **Legal Safeguards**: [Terms of Service](file:///home/bytesage/unuagora-latest/src/app/terms/page.tsx), [Community Guidelines](file:///home/bytesage/unuagora-latest/src/app/community-guidelines/page.tsx), and Contact support.
