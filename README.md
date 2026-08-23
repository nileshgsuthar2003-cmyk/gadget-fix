# Phone Fix Pro

Mobile Repair Service Application — Mobile UI Design Prompt

Design and build a modern, clean, premium mobile-first UI/UX for a Mobile Repair Service application.

The application has two sides:

Customer Mobile Application

Admin / Repair Person Mobile Panel

Important: The Admin and Technician are the same person, so DO NOT create separate Admin and Technician applications or roles. There is only one Admin/Repair Panel.

The UI should be designed primarily for mobile phone screens, with a polished app-like experience. It should feel similar to a modern service-booking application, but specifically designed for mobile phone repair.

1. Overall Design Direction

Create a professional and trustworthy repair-service design.

Design Style

Modern

Clean

Minimal

Premium

Professional

Easy to understand

Mobile-first

Rounded cards

Soft shadows

Good spacing

Large touch-friendly buttons

Clear typography

Simple icons

Smooth visual hierarchy

Avoid clutter

The application should look like a real production-ready startup application, NOT like a generic admin template.

Use a consistent design system across Customer App and Admin/Repair Panel.

Color Direction

Use a professional technology/service color palette.

Primary:

Deep blue / modern indigo

Secondary:

Light blue

Success:

Green

Warning:

Orange

Error:

Red

Background:

Very light gray / off-white

Cards:

White

Text:

Dark charcoal

Use colors carefully. Do not make the UI overly colorful.

2. Customer Mobile App

Create the following customer screens.

A. Splash Screen

Show:

Application logo

Application name

Small tagline such as:

"Fast. Reliable. Trusted Mobile Repair."

Use a clean centered layout.

3. Customer Login / Registration

Login Screen

Fields:

Mobile Number

Password / OTP

Buttons:

Continue

Login with Google (optional)

Links:

Forgot Password

Create Account

Make OTP login the primary option.

4. Customer Home Screen

Create a polished home dashboard.

Top section:

"Hello, Rahul 👋"

"How can we help your phone today?"

Search bar:

"Search repair services..."

Then show a prominent CTA:

"Book a Repair"

Below that:

Popular Services

Horizontal cards:

Screen Replacement

Battery Replacement

Charging Problem

Camera Repair

Speaker Repair

Water Damage

Each card should have a simple icon.

Then:

My Current Repair

Example card:

Repair #REP10245

iPhone 13

Screen Replacement

Status:
"Repairing"

Progress indicator.

Button:

"Track Repair"

Then:

Browse Services

Show service cards with starting prices.

Example:

Screen Replacement
"From ₹999"

Battery Replacement
"From ₹799"

Charging Repair
"From ₹499"

Then show:

Recent Repairs

Compact repair history cards.

5. Book Repair Flow

The booking experience should be a multi-step mobile wizard.

At the top show:

Step 1 of 5

Progress indicator.

Step 1 — Select Mobile Brand

Title:

"What phone do you use?"

Show searchable brand list.

Brands:

Apple

Samsung

OnePlus

Xiaomi

Vivo

Oppo

Realme

Motorola

Google

Nothing

Other

Use clean selectable cards.

6. Step 2 — Select Mobile Model

Title:

"Select your model"

Search bar.

Example:

Apple

iPhone 11

iPhone 12

iPhone 13

iPhone 14

iPhone 15

iPhone 16

Show model cards with optional phone thumbnails.

7. Step 3 — Select Problem

Title:

"What's wrong with your phone?"

Show selectable problem cards.

Problems:

Broken Screen

Display Not Working

Battery Problem

Charging Problem

Camera Problem

Speaker Problem

Microphone Problem

Water Damage

Back Glass Broken

Face ID Problem

Software Problem

Other

Allow multiple selection.

Selected cards should have a strong visual state.

8. Step 4 — Describe Problem

Title:

"Tell us more"

Show:

Text area:

"Describe the problem..."

Below:

"Add Photos"

Allow multiple image uploads.

Optional:

"Add Video"

Show uploaded images as thumbnails.

Add helper text:

"Photos help us understand the issue before inspection."

9. Step 5 — Service & Price

After selecting the problem, show relevant services.

Example:

iPhone 13

Screen Replacement

Original Estimate:
₹12,999

Battery Replacement

Estimated:
₹4,999

Charging Port Repair

Estimated:
₹2,499

Clearly label prices as:

"Estimated Price"

Add a small note:

"Final price may change after physical inspection."

Allow the customer to select the required service.

10. Appointment Selection

Screen title:

"Choose an appointment"

Date selector:

Today
Tomorrow
25 Aug
26 Aug
27 Aug

Time slots:

10:00 AM
11:00 AM
12:00 PM
2:00 PM
3:00 PM
4:00 PM

Unavailable slots should appear disabled.

11. Repair Method

Show two large cards:

Visit Store

Bring your phone to our repair center.

Pickup & Delivery

We'll collect your phone and return it after repair.

Selected option should be clearly highlighted.

12. Address Screen

Only show address selection if Pickup & Delivery is selected.

Show saved addresses:

Home
Office

Button:

"+ Add New Address"

Address form:

Full Name

Phone

House / Flat

Street

Area

City

State

Pincode

Landmark

13. Booking Summary

Create a clean checkout-style screen.

Show:

Customer

Device:
iPhone 13

Problem:
Screen Broken

Service:
Screen Replacement

Appointment:
25 Aug 2026
11:00 AM

Repair Method:
Pickup & Delivery

Estimated Service:
₹12,999

Pickup Fee:
₹99

Coupon:
-₹500

Estimated Total:
₹12,598

Large CTA:

"Confirm Booking"

Add note:

"Final repair amount will be confirmed after inspection."

14. Booking Success Screen

Show a success animation/icon.

Title:

"Repair Booked Successfully!"

Repair ID:

#REP-2026-001245

Show:

iPhone 13
Screen Replacement

Appointment:
25 Aug
11:00 AM

Buttons:

"Track Repair"

"View Booking"

15. Repair Tracking Screen

Create a visually attractive vertical timeline.

Status:

✓ Booking Created

✓ Appointment Confirmed

✓ Device Received

✓ Inspection

● Repair In Progress

○ Quality Check

○ Ready for Delivery

○ Completed

Show current status prominently.

Example:

"Your phone is currently being repaired."

Also show:

Repair ID

Device

Service

Estimated price

Appointment

16. Inspection / Additional Charge Approval

This is an important screen.

If the repair person discovers additional issues, show:

Additional Repair Required

Original Estimate:
₹2,999

Additional Services:

Charging IC Repair
₹1,500

Water Damage Treatment
₹800

Updated Total:

₹5,299

Message:

"Additional issues were found during inspection. Please review and approve the updated estimate."

Buttons:

"Approve ₹5,299"

"Reject Additional Repair"

This screen must be extremely clear because it involves money.

17. Payment Screen

After repair:

Show:

Repair Total:
₹5,299

Payment options:

UPI

Card

Cash

Large CTA:

"Pay ₹5,299"

After payment show:

"Payment Successful"

18. Invoice Screen

Create a professional invoice-style mobile screen.

Show:

Repair Center Name

Invoice:
INV-2026-00125

Customer:
Rahul Sharma

Device:
iPhone 13

Services:

Screen Replacement ₹3,000
Charging Repair ₹1,500
Cleaning ₹300

Subtotal:
₹4,800

Discount:
₹300

Total:
₹4,500

Payment:
PAID

Buttons:

"Download Invoice"

"Share Invoice"

19. Customer Repair History

Screen:

"My Repairs"

Tabs:

All
Active
Completed
Cancelled

Repair cards:

REP10245
iPhone 13
Screen Replacement
₹12,999
Completed

REP10220
Samsung S23
Battery Replacement
₹3,499
Completed

20. Customer Profile

Create:

Profile photo

Name
Mobile
Email

Menu:

My Devices
My Repairs
My Invoices
Saved Addresses
Warranty
Notifications
Help & Support
Terms & Conditions
Privacy Policy
Logout

21. Customer Bottom Navigation

Use a mobile bottom navigation bar.

Items:

Home
Book Repair
My Repairs
Profile

The "Book Repair" button can be visually emphasized.

==================================================

ADMIN / REPAIR PERSON MOBILE PANEL

==================================================

The Admin and Repair Person are the SAME USER.

Create one mobile dashboard called:

"Repair Panel"

Do not create a separate technician dashboard.

22. Admin / Repair Dashboard

Top:

"Good Morning 👋"

"Repair Dashboard"

Show summary cards:

Pending Requests
5

Today's Appointments
8

Under Repair
6

Waiting Approval
2

Completed
12

Today's Revenue
₹25,500

Use compact but readable cards.

23. Repair Requests

Create a mobile-friendly request list.

Each card:

REP-10245

Customer:
Rahul Sharma

Device:
iPhone 13

Problem:
Screen Broken

Appointment:
11:00 AM

Estimated:
₹12,999

Status:
Pending

Actions:

"View"

"Accept"

Use status badges.

24. Repair Request Details

Create a complete mobile repair details screen.

Sections:

Customer

Name
Phone
Address

Device

Brand
Model
IMEI
Serial Number

Problem

Customer description

Uploaded photos

Appointment

Date
Time
Repair method

Pricing

Estimated amount

Status

Current repair status

Buttons:

Accept Request
Start Inspection
Reschedule
Cancel

25. Device Inspection Screen

Create a form for the repair person.

Title:

"Device Inspection"

Device:

iPhone 13

IMEI:

XXXXXXXXXXXX

Physical Condition

Broken Screen
Body Scratch
Back Glass Damage
Water Damage

Functional Test

Display
Touch
Camera
Speaker
Microphone
Charging
Face ID
WiFi
Bluetooth

Each item should have:

✓ Working

✕ Not Working

— Not Tested

Allow:

"Add Inspection Notes"

"Upload Photos"

Button:

"Complete Inspection"

26. Additional Charges Screen

Allow repair person to add extra services.

Show:

Original Estimate:
₹2,999

Add Service:

Service dropdown

Amount

Description

Button:

"+ Add Service"

Example:

Charging Port Repair
₹1,500

Cleaning
₹300

Then:

Original:
₹2,999

Additional:
₹1,800

New Total:
₹4,799

CTA:

"Send Approval to Customer"

27. Repair Status Management

Create a clear status selector.

Statuses:

Pending
Confirmed
Device Received
Inspection
Waiting Approval
Approved
Repairing
Quality Check
Ready
Delivered
Completed
Cancelled

Use a timeline/progress design.

The repair person should be able to update the status from the repair details page.

28. Repair Work Screen

When repairing:

Show:

Repair ID
Customer
Device
Services

Checklist:

Screen Replacement ✓
Battery Replacement ✓
Cleaning ✓

Repair Notes:

"Display replaced successfully."

Upload final repair photos.

Button:

"Complete Repair"

Before allowing completion, show:

"Move this repair to Quality Check?"

29. Quality Check Screen

Create a simple checklist:

Display ✓
Touch ✓
Camera ✓
Speaker ✓
Microphone ✓
Charging ✓
Face ID ✓
WiFi ✓
Bluetooth ✓

Button:

"Pass Quality Check"

Then status becomes:

"Ready"

30. Invoice Generation

Admin/repair person should see the final bill.

Show:

Services
Parts
Labour
Additional Charges
Discount
Tax if applicable

Example:

Screen Replacement ₹12,999
Cleaning ₹300
Labour ₹500

Subtotal ₹13,799
Discount ₹500

Total ₹13,299

Button:

"Generate Invoice"

Then:

"Send Invoice to Customer"

31. Payment Management

Admin can mark:

Paid
Pending
Partially Paid

Payment methods:

UPI
Card
Cash

For partial payment:

Total:
₹5,000

Paid:
₹2,000

Remaining:
₹3,000

32. Service & Pricing Management

Create mobile-friendly management screens.

Admin can manage:

Brands
Models
Problems
Services
Prices

Flow:

Brand → Model → Service → Price

Example:

Apple

iPhone 13

Screen Replacement

Part Cost:
₹9,000

Labour:
₹2,000

Customer Price:
₹12,999

Allow:

Add
Edit
Delete
Activate / Deactivate

33. Customer Management

Show customer list:

Name
Phone
Number of Repairs
Total Spent
Last Repair

Customer details should show:

Profile
Devices
Repair History
Invoices
Payments
Warranty

34. Inventory Management

Create a simple inventory screen.

Show:

Part Name
SKU
Stock
Selling Price

Example:

iPhone 13 Display
Stock: 5

iPhone 13 Battery
Stock: 8

Charging Port
Stock: 12

Show low-stock warning.

Allow:

Add Stock
Reduce Stock
Edit Part

35. Reports Screen

Create mobile-friendly charts/cards.

Show:

Today's Revenue
Weekly Revenue
Monthly Revenue

Total Repairs

Completed
Pending
Cancelled

Popular Services

Screen Replacement
Battery Replacement
Charging Repair

Popular Brands

Apple
Samsung
OnePlus

36. Admin Bottom Navigation

Use:

Dashboard
Requests
Appointments
Inventory
More

Inside "More":

Customers
Services
Pricing
Invoices
Payments
Coupons
Warranty
Reviews
Reports
Settings

37. Important UI/UX Requirements

The application must be mobile-first.

Design for approximately:

360px

375px

390px

412px

Do not design desktop-first and simply shrink it.

Use:

Bottom navigation

Sticky bottom CTAs

Full-width buttons

Touch-friendly controls

Mobile-friendly forms

Scrollable tabs

Cards

Bottom sheets

Modal dialogs

Step indicators

Status badges

Timeline components

Avoid:

Huge tables

Tiny text

Desktop sidebar

Excessive information on one screen

Small buttons

Overcrowded dashboards

For admin data, use cards and expandable sections instead of traditional desktop tables.

38. Design System

Use one consistent design system.

Typography:

Modern sans-serif

Strong headings

Medium-weight labels

Highly readable body text

Border radius:

12–18px for cards

Buttons:

12–14px radius

Cards:

16px radius

Spacing:

Use consistent 8px-based spacing.

Icons:

Use a consistent outline icon set.

39. Micro Interactions

Add subtle interactions:

Button press animation

Card selection animation

Step transition

Booking success animation

Status update animation

Skeleton loading

Toast notifications

Confirmation dialogs

Pull-to-refresh style interaction where appropriate

Do not over-animate the application.

40. Important Business Logic Reflected in UI

The UI must clearly communicate this workflow:

Customer Booking

↓

Estimated Price

↓

Admin/Repair Person Inspection

↓

Additional Issues Found

↓

Additional Charges Added

↓

Customer Approval Required

↓

Repair Starts

↓

Quality Check

↓

Final Invoice

↓

Payment

↓

Repair Completed

↓

Warranty

This workflow is the core of the application.

41. Final Deliverable

Create a complete clickable mobile UI prototype with all major screens connected through navigation.

Build the UI so that it feels like a real mobile repair service product ready for development, not just a collection of static screens.

Use realistic sample data such as:

Customer:
Rahul Sharma

Device:
iPhone 13

Repair:
Screen Replacement

Repair ID:
REP-2026-001245

Estimated Price:
₹12,999

Additional Charge:
₹1,500

Final Price:
₹14,499

Make all screens visually consistent and connected.

Prioritize:

Customer booking experience

Repair tracking

Admin/Repair workflow

Inspection

Additional charge approval

Billing

Payment

Repair history

Service/pricing management

The final result should look like a polished mobile-first mobile repair booking and repair management application.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://gadget-fix.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4516470a-31ed-4b1e-ab39-d9fe7792e201).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
