# Global Business Gap Finder & Blue Ocean Intelligence Web App

> Discover underserved business industries, benchmark per-capita supply across peer cities globally, and uncover potential **Blue Ocean** market opportunities using **Overture Maps GeoParquet** location intelligence.

---

## 🚀 Features

- **Mode A — Analyze an Industry**:
  - Select any **Country → City → Industry** worldwide (e.g. *Valencia, Spain • Bar & Pub*, *Tbilisi, Georgia • Pet Grooming*, *Warsaw, Poland • Laundromat*).
  - Queries public **Overture Maps Places GeoParquet** data (`2026-07-22.0` release) live via **DuckDB Spatial**.
  - Performs administrative boundary containment (`ST_Within`) against Nominatim GeoJSON polygons.
  - Fetches municipal census & population recency metadata via **Wikidata SPARQL**.
  - Normalizes supply per 10,000 residents and compares target city against auto-selected **Peer Cities**.
  - Calculates **Expected Supply Benchmark** (weighted peer median) and **Estimated Supply Gap**.
  - Computes a deterministic **Opportunity Score (0–100)** and independent **Data Confidence Score (0–100)**.
  - Renders an interactive **MapLibre GL JS Map** with category-themed emoji pins, Google Maps popup cards, quadrant density, and boundary overlay.
  - Export reports to **Excel (.xlsx)**, **CSV**, or **JSON**.

- **Mode B — Discover Opportunities (Gap Scanner)**:
  - Select **Country → City** to automatically scan 35+ commercial categories in parallel threads.
  - Ranks top underserved Blue Ocean gaps with category family filters (*Food & Drink, Beauty & Wellness, Fitness, Pet Services, Entertainment, Retail, Services, Healthcare, Education, Automotive, Hospitality*).

---

## 🛠️ Project Structure

```
├── backend/
│   ├── main.py              # FastAPI server & Excel export endpoints
│   ├── overture_provider.py # DuckDB S3 GeoParquet Overture Places query engine
│   ├── city_resolver.py     # Nominatim boundary & Wikidata SPARQL population resolver
│   ├── peer_resolver.py     # Population-weighted peer city similarity matching
│   ├── taxonomy.py          # Overture taxonomy hierarchy mapping
│   ├── scoring.py           # Opportunity & Data Confidence statistical scoring
│   ├── cache.py             # SQLite local snapshot caching
│   └── run_server.sh        # Auto-restarting server daemon
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── HeroSearch.tsx
│   │   │   ├── MapView.tsx
│   │   │   ├── KpiCard.tsx
│   │   │   ├── PeerChart.tsx
│   │   │   ├── SupplyGauge.tsx
│   │   │   ├── BusinessList.tsx
│   │   │   ├── OpportunityScanner.tsx
│   │   │   └── MethodologyModal.tsx
│   │   ├── App.tsx
│   │   ├── types.ts
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 💻 Local Setup & Installation

### 1. Backend Setup (Python 3.10+)

```bash
cd backend
pip install duckdb fastapi uvicorn httpx shapely pydantic pandas pyarrow openpyxl
python3 main.py
```

### 2. Frontend Setup (Node.js 18+)

```bash
cd frontend
npm install
npm run build
```

The application will run on `http://localhost:3000`.

---

## 🌐 Deploying to GitHub & Cloud Hosting

### Push to GitHub Repository

```bash
git remote add origin https://github.com/devsura3939/<your-repository-name>.git
git branch -M main
git push -u origin main
```

### Free Cloud Deployment Options

1. **Vercel / Netlify** (Static Frontend):
   - Import GitHub repository.
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Render / Koyeb / Railway** (Full Stack FastAPI + React):
   - Import GitHub repository.
   - Build Command: `pip install -r requirements.txt && cd frontend && npm install && npm run build`
   - Start Command: `cd backend && python3 main.py`
