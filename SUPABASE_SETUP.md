# Supabase Setup Guide for Leaf & Bean Café

## Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up (free)
3. Create a new project with any name (e.g., "leaf-bean-cafe")
4. Choose a strong database password and save it somewhere
5. Select the region closest to you (e.g., London for UK)
6. Wait for the project to be created (~2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public key** (a long string starting with `eyJ...`)

## Step 3: Add Environment Variables

Create a file called `.env.local` in your project root with:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual values from Step 2.

## Step 4: Create the Database Table

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy ALL the contents from `supabase-schema.sql` file
4. Paste it into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

## Step 5: Enable Realtime

1. Go to **Database** → **Replication**
2. Find the `orders` table
3. Make sure it's enabled for realtime (toggle should be ON)

## Step 6: Test It!

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Open the website and place a test order
3. Open the admin panel (`/admin/login`) in another tab
4. You should see the order appear in real-time!

---

## Troubleshooting

### Orders not appearing?
- Check that your `.env.local` file has the correct keys
- Make sure you ran the SQL schema
- Check the browser console for errors

### Real-time not working?
- Go to Database → Replication and ensure `orders` table has realtime enabled
- The SQL schema includes this, but double-check

### Authentication issues?
- Currently using simple localStorage auth for demo
- For production, use Supabase Auth

---

## Production Checklist

Before going live:

- [ ] Set up Row Level Security (RLS) policies properly
- [ ] Use Supabase Auth for admin login
- [ ] Add rate limiting
- [ ] Set up database backups
- [ ] Configure custom domain (optional)

---

## Free Tier Limits

Supabase free tier includes:
- 500 MB database storage
- 1 GB file storage
- 50,000 monthly active users
- 2 million edge function invocations

This is more than enough for a small café!
