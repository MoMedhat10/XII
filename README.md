# XII — Architectural Luxury Timepiece E-Commerce

> An austere, high-horology digital exhibition and e-commerce experience rooted in **Architectural Luxury Brutalism** and **Editorial Minimalism**. Built with **Next.js 16 (App Router)**, **React 19**, and **Tailwind CSS v4**.

---

## 🏛️ Project Overview

**XII** is a high-end luxury timepiece e-commerce platform designed like a modern architectural monograph and private gallery space. Unlike conventional commercial storefronts, XII treats timepieces as sculptural exhibits and mechanical marvels.

The platform embraces a raw, uncompromising brutalist aesthetic: heavy 4px solid borders, 0px border-radii, pure geometric layouts, technical typography, and moments of **Luxury Gold (`#B08D57`)** accenting horological excellence.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server & Client Components)
- **UI Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with custom brutalist design tokens
- **Typography:** [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) (Architectural Display & Headers) & [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans) (Technical & Editorial Body)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Component Primitives:** [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Language:** TypeScript 5 (Strict Mode)

---

## 🧭 Pages & Route Architecture

| Route | Page Name | Description | Key Next.js Concepts |
| :--- | :--- | :--- | :--- |
| **`/`** | **The Exhibition (Home)** | Monolithic hero section, curated timepiece drops, timepiece advisor teaser, and brand story. | Server Components, Layouts, Image optimization |
| **`/catalog`** | **All Timepieces (Catalog)** | The complete collection with instant search, category filters (Automatic, Chronograph, Tourbillon), material filters, and price sorting. | Dynamic filtering, Client state, URL search params |
| **`/timepieces/[slug]`** | **Timepiece Details (PDP)** | Dedicated exhibit page featuring high-res imagery, interactive macro zoom loupe, mechanical specs matrix, audio caliber sample, and acquisition triggers. | Dynamic Routing (`[slug]`), Static generation, Metadata |
| **`/finder`** | **Timepiece Advisor Quiz** | Interactive 3-step questionnaire (*"Find Your Signature Timepiece"*) matching clients to timepieces based on style, wrist size, and budget. | Multi-step wizard state, dynamic filtering |
| **`/size-guide`** | **Wrist & Scale Guide** | Interactive tool with a wrist size slider simulating how 38mm, 40mm, 42mm, and 44mm cases sit on a wrist. | Controlled inputs, SVG math, responsive UI |
| **`/compare`** | **Horological Comparator** | Side-by-side technical comparison tool for up to 3 timepieces (Caliber, Frequency, Power Reserve, Dimensions). | Data matrix tables, shared component state |
| **`/wishlist`** | **Saved Collection** | Quick access to all bookmarked timepieces saved in local storage. | Custom React hooks (`useWishlist`), LocalStorage sync |
| **`/cart` & `/checkout`** | **Bag & Armored Checkout** | Sliding cart drawer and multi-step luxury checkout with armored courier selection (Ferrari Group / Malca-Amit). | Global Cart Context, form validation |
| **`/about`** | **Craft & Manifesto** | Editorial manifesto on horological engineering, sapphire finishing, and brutalist design roots. | Editorial layout, Server Component rendering |
| **`/journal`** | **The Monograph Journal** | Articles and essays on watchmaking craftsmanship, master horologists, and mechanical movements. | Content rendering, typography hierarchy |

---

## ✨ Key Features

- **🔍 Interactive Jeweler's Loupe:** Real-time macro magnifying lens on timepiece imagery for dial and movement inspection.
- **🔊 "Listen to the Caliber" Audio Preview:** Acoustic sound preview of mechanical balance wheel ticking and minute repeater chimes.
- **🎯 Timepiece Advisor Quiz:** Step-by-step recommendation wizard that suggests the best timepiece for the client.
- **📏 Interactive Wrist Size Guide:** Dynamic wrist slider for visual case-diameter sizing and fit estimation.
- **⚖️ Technical Spec Comparator:** Side-by-side matrix comparing movements, case materials, power reserves, and complications.
- **💱 Live Multi-Currency Switcher:** Global currency converter (USD `$`, EUR `€`, GBP `£`, CHF `Fr`, JPY `¥`).
- **❤️ LocalStorage Wishlist & Cart:** Persistent bag drawer and saved favorites with real-time badges.
- **🌓 Architectural Dark / Light Mode:** Built-in theme switcher supporting high-contrast white gallery and stealth dark mode.

---

## 🎨 Design System & Aesthetics

Refer to [DESIGN.md](DESIGN.md) for full design tokens and styling guidelines:

- **Borders & Radius:** Strict **4px solid borders** and **0px border-radius** across all buttons, containers, inputs, and cards.
- **Color Palette:**
  - `Primary Black (#000000)`: Structural borders, primary buttons, and headings.
  - `Neutral White (#FFFFFF)`: Primary gallery canvas and negative space.
  - `Concrete (#D9D9D9) & Steel (#A5A5A5)`: Industrial structural backgrounds and dividers.
  - `Luxury Gold (#B08D57)`: Accenting exclusivity, prices, and critical call-to-actions.
- **Elevation:** Flat planar layering with high-contrast color inversion upon hover states (no drop shadows or blurs).

---

## 📁 Project Structure

```text
XII/
├── public/                # Static assets, timepiece media, audio files
├── src/
│   ├── app/               # Next.js App Router (pages & layouts)
│   │   ├── layout.tsx     # Root layout (fonts, theme provider, global shell)
│   │   ├── page.tsx       # Homepage (Exhibition)
│   │   ├── globals.css    # Tailwind CSS v4 & brutalist theme tokens
│   │   ├── catalog/       # All timepieces catalog & filter page
│   │   ├── timepieces/[slug]/ # Dynamic timepiece product detail page
│   │   ├── finder/        # Timepiece Advisor Quiz
│   │   ├── size-guide/    # Interactive Wrist Size Guide
│   │   ├── compare/       # Horological Spec Comparator
│   │   ├── wishlist/      # Saved timepieces collection
│   │   ├── cart/          # Shopping bag & checkout
│   │   ├── about/         # Craft & Manifesto page
│   │   └── journal/       # Horology articles & journal
│   ├── components/        # Reusable React components
│   │   ├── layout/        # Navbar, Footer, Currency Switcher, Cart Drawer
│   │   ├── timepieces/    # TimepieceCard, LoupeZoom, AudioPlayer, SpecTable
│   │   └── ui/            # Brutalist buttons, inputs, dialogs, badges
│   ├── data/              # Mock timepieces dataset & specs
│   ├── hooks/             # Custom hooks (useCart, useWishlist, useCurrency)
│   ├── lib/               # Utility functions (formatting, helpers)
│   └── types/             # TypeScript interfaces (Timepiece, Complication, Filter)
├── DESIGN.md              # Brand & Design System guidelines
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 3. Build for Production
```bash
npm run build
```

### 4. Code Quality & Typecheck
```bash
npm run typecheck
npm run lint
```
