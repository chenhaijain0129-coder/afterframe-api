# ROLL — Private visual diary

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app deliberately works in visual demo mode until Supabase values are configured.

## Connect Supabase

1. Create a Supabase project, copy `.env.example` to `.env.local`, and fill in its variables.
2. Run `supabase/schema.sql` in the SQL Editor; create a **private** bucket called `diary-media`.
3. In Auth settings enable email magic links and restrict permitted users to your email. Add Vercel's URL to Auth redirect URLs.
4. Deploy to Vercel and add the same environment variables there.

The included schema enables RLS on all data. Storage should remain private and be read with short-lived signed URLs from server-side actions.
