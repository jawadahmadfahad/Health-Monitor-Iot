# Health-Mointor-IOT

## Cloudflare D1 (sensordata) integration

This project includes a Cloudflare Worker that writes/reads sensor readings from your D1 database named `sensordata`.

### 1) Install dependencies

```bash
npm install
```

### 2) Login to Cloudflare (one-time)

```bash
npx wrangler login
```

### 3) Create the D1 table (remote)

This applies the migration in `worker/migrations/0001_init.sql` to your Cloudflare D1 database.

```bash
npm run cf:d1:migrate:remote
```

### 4) Deploy the Worker

```bash
npm run cf:deploy
```

After deploy, Wrangler prints your Worker URL (for example `https://health-monitor-d1.<subdomain>.workers.dev`).

### 5) Point the React app at the Worker

Create a `.env` file (you can copy `.env.example`) and set:

```bash
VITE_D1_API_URL=https://<your-worker-url>
```

Then run the app:

```bash
npm run dev
```

### API endpoints

- `POST /api/readings` with JSON `{ heartRate, temperature, ts }`
- `GET /api/readings?limit=100` returns `{ readings: [...] }`