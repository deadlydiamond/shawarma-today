# Today Shawarma - Restaurant Management System

A complete restaurant management system with customer ordering website, POS system, and admin dashboard.

## 🚀 Features

### Customer Website
- ✅ Beautiful landing page with hero, menu, reviews, contact sections
- ✅ Dynamic menu from Supabase with category filtering
- ✅ Shopping cart with localStorage persistence
- ✅ Checkout flow (dine-in / takeaway)
- ✅ Real-time order tracking
- ✅ Google Reviews integration
- ✅ Cookie consent popup
- ✅ Mobile responsive design

### POS System (`/pos`)
- ✅ Walk-in order creation
- ✅ Category filtering & search
- ✅ Discount application
- ✅ Cash calculator for change
- ✅ Receipt modal (Cash/Card/Pay Later)
- ✅ Active orders management
- ✅ Payment lookup by order code
- ✅ Lock screen functionality

### Admin Dashboard (`/admin`)
- ✅ Order management with real-time updates
- ✅ Payment collection (Cash/Card)
- ✅ Order status workflow
- ✅ Daily statistics
- ✅ Lock screen functionality

### Admin Menu Management (`/admin/menu`)
- ✅ Add/Edit/Delete menu items
- ✅ Category management
- ✅ Image upload (URL or Supabase Storage)
- ✅ Sold out toggle
- ✅ Popular/Featured tags

### Admin Reports (`/admin/reports`)
- ✅ Daily revenue reports
- ✅ Order statistics
- ✅ Popular items tracking
- ✅ Hourly breakdown

### Admin Settings (`/admin/settings`)
- ✅ Restaurant info (name, address, phone)
- ✅ Accept online orders toggle
- ✅ Table count configuration
- ✅ Tax rate settings

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: Supabase (PostgreSQL)
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **State Management**: React Context
- **Real-time**: Supabase Realtime

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd shawarma-today
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Add your credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GOOGLE_PLACES_API_KEY=your-google-api-key
GOOGLE_PLACE_ID=your-place-id
```

5. Set up Supabase database:
   - Go to Supabase Dashboard → SQL Editor
   - Run the contents of `supabase-schema.sql`

6. Run the development server:
```bash
npm run dev
```

## 🚀 Deployment (Vercel)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GOOGLE_PLACES_API_KEY`
   - `GOOGLE_PLACE_ID`
5. Click "Deploy"

### Step 3: Configure Supabase
1. Go to Supabase Dashboard → Settings → API
2. Add your Vercel domain to "Site URL"
3. Ensure RLS policies allow public access for orders

## 📁 Project Structure

```
shawarma-today/
├── app/
│   ├── page.tsx              # Landing page
│   ├── checkout/             # Customer checkout
│   ├── orders/               # Customer order tracking
│   ├── order/[id]/           # Single order view
│   ├── pos/                  # POS system
│   ├── admin/                # Admin dashboard
│   │   ├── login/            # Admin login
│   │   ├── menu/             # Menu management
│   │   ├── reports/          # Daily reports
│   │   └── settings/         # Restaurant settings
│   └── api/
│       └── reviews/          # Google Reviews API
├── components/
│   ├── admin/                # Admin components
│   ├── layout/               # Header, Footer, Navbar
│   └── ui/                   # Reusable UI components
├── contexts/                 # React Context providers
├── lib/                      # Utilities and Supabase client
└── supabase-schema.sql       # Database schema
```

## 🔐 Default Login

- **Username**: `admin`
- **Password**: `admin123`
- **PIN (Lock Screen)**: `1234`

## 📱 URLs

- **Customer Website**: `/`
- **POS System**: `/pos`
- **Admin Dashboard**: `/admin`
- **Admin Login**: `/admin/login`

## 📄 License

Private project. All rights reserved.
