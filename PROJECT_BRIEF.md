# Project Brief

## Spatial Question
How does tree canopy coverage relate to urban heat island intensity in Kilombero, Morogoro, Tanzania?

## Study Area
Kilombero District, Morogoro Region, Tanzania. The district boundary used for this analysis is sourced from the FAO GAUL Level 2 administrative boundaries dataset (ADM2_NAME = "Kilombero").

## Datasets

| Dataset | Purpose | Source |
|---|---|---|
| Sentinel-2 Surface Reflectance (Harmonized) | Derive NDVI and tree canopy cover mask | https://scihub.copernicus.eu/ (accessed via Google Earth Engine: `COPERNICUS/S2_SR_HARMONIZED`) |
| Landsat 8/9 Collection 2 Level 2 | Derive Land Surface Temperature (LST), the urban heat island proxy | https://earthexplorer.usgs.gov/ (accessed via Google Earth Engine: `LANDSAT/LC08/C02/T1_L2`, `LANDSAT/LC09/C02/T1_L2`) |
| FAO GAUL 2015 Level 2 Administrative Boundaries | Define and clip the Kilombero District study area | https://developers.google.com/earth-engine/datasets/catalog/FAO_GAUL_2015_level2 |
| Hansen Global Forest Change | Cross-check baseline tree cover and canopy loss | https://www.globalforestwatch.org/dashboards/country/TZA/14/2/ |
| ESA WorldCover 2021 | Separate built-up/urban areas from vegetated areas for comparison | https://esa-worldcover.org/en/data-access |
| Humanitarian Data Exchange - Tanzania Admin Boundaries | Verification/alternative boundary source | https://data.humdata.org/dataset/cod-ab-tza |

## Method Summary
1. Clip all imagery to the Kilombero district boundary.
2. Compute NDVI from Sentinel-2 (dry-season composite, Jun-Oct 2023) as a proxy for tree canopy cover; apply an NDVI > 0.5 threshold to generate a canopy mask.
3. Compute Land Surface Temperature from Landsat 8/9 thermal band (ST_B10), converted to Celsius.
4. Sample 2,000 random points across the study area, pairing NDVI and LST values at each point.
5. Assess the relationship using a scatter plot with linear trendline (R²) and Pearson correlation coefficient.

## Repository Contents
- `kilombero_canopy_lst_gee.js` - Google Earth Engine script that performs the full analysis (boundary load, NDVI/canopy computation, LST computation, correlation chart, exports).
- `README.md` - setup and run instructions.
- `PROJECT_BRIEF.md` - this file.
