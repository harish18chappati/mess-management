# mess-management

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-u6zcyjrg)

## Run the ML API (Windows PowerShell)

Run these commands from the project root. Use the project `.venv` (not `.venv-1`):

```powershell
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn ml.api:app --reload
```

Keep that terminal open. In a second terminal, start the React app:

```powershell
npm run dev
```

The API is available at `http://127.0.0.1:8000`. Its predictions are demo estimates trained on the small synthetic dataset in `ml/mess_wait_data.csv`, not real-world wait-time forecasts.

## Supabase ratings

Apply [`supabase/migrations/20261015_create_ratings.sql`](./supabase/migrations/20261015_create_ratings.sql) in the Supabase Dashboard SQL Editor to create the missing `public.ratings` table. The migration enables RLS, permits reading only non-identifying rating columns, and intentionally grants no client writes. Until authenticated rating ownership is implemented, this app saves rating submissions in the current browser's local storage.

The frontend should use only the Supabase project URL and publishable/anon key in `.env.local` (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`). Never put a service-role key in frontend environment variables.
