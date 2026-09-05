# Tree Canopy Cover vs. Urban Heat Island in Kilombero, Morogoro, Tanzania

This repository contains a Google Earth Engine (GEE) analysis investigating the relationship between tree canopy cover and land surface temperature (as an urban heat island) in Kilombero District, Morogoro Region, Tanzania.

See [`PROJECT_BRIEF.md`](./PROJECT_BRIEF.md) for the spatial question, study area, and full dataset list with source links.

## Repository Structure
```
.
├── README.md
├── PROJECT_BRIEF.md
└── kilombero_canopy_lst_gee.js
```

## Requirements
- A Google account registered for Google Earth Engine access: https://code.earthengine.google.com
- No local installation is required; the script runs entirely in the browser-based GEE Code Editor.

## How to Run
1. Go to https://code.earthengine.google.com and sign in.
2. Open a new script and paste in the full contents of `kilombero_canopy_lst_gee.js`.
3. Import the study area which in our case its Kilombero
4. Click **Run**.
5. Adjust `START_DATE` and `END_DATE` at the top of the script if you want a different time window (dry season is recommended to minimize cloud interference with the thermal bands).
6. The script will display, in the Map panel:
   - Kilombero district boundary
   - NDVI layer
   - Tree canopy mask (NDVI > 0.5)
   - Land Surface Temperature layer (degrees Celsius)
7. To export outputs (NDVI GeoTIFF, LST GeoTIFF, and a CSV of sampled points) to Google Drive, open the **Tasks** tab in the Code Editor and click **Run** on each of the three export tasks.

## Outputs
- `Kilombero_NDVI_canopy` (GeoTIFF, 10m resolution)
- `Kilombero_LST_celsius` (GeoTIFF, 30m resolution)
- `Kilombero_NDVI_LST_samples` (CSV, 2000 sample points with NDVI and LST values)

## Method Summary
NDVI is computed from a cloud-masked Sentinel-2 median composite and used as a proxy for tree canopy density. Land Surface Temperature is computed from Landsat 8/9 Collection 2 Level 2 thermal band data. Both are sampled at matching locations across the study area to test whether higher canopy cover is associated with lower surface temperature (the expected urban heat island mitigation effect).

## Data Sources
All datasets and their source links are listed in [`PROJECT_BRIEF.md`](./PROJECT_BRIEF.md).
