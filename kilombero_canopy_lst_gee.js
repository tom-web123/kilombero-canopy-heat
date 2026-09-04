/*
  PROJECT: Tree Canopy Cover vs. Urban Heat Island in Kilombero, Morogoro, Tanzania
  PLATFORM: Google Earth Engine Code Editor (https://code.earthengine.google.com)
  HOW TO USE:
    1. Paste this whole script into a new GEE script.
    2. Click "Run".
    3. Adjust START_DATE / END_DATE below to your preferred dry-season window
       (dry season is best for LST because clouds interfere with thermal bands).
    4. Use Tasks tab (bottom right) to run the two Export.image.toDrive tasks
       if you want GeoTIFFs for your repo / report.
*/

// ---------------------------------------------------------------
// 1. STUDY AREA — Kilombero District boundary
// ---------------------------------------------------------------
var admin2 = ee.FeatureCollection('FAO/GAUL/2015/level2');
var kilombero = admin2.filter(
  ee.Filter.and(
    ee.Filter.eq('ADM0_NAME', 'United Republic of Tanzania'),
    ee.Filter.eq('ADM2_NAME', 'Kilombero')
  )
);
var aoi = kilombero.geometry();

Map.centerObject(aoi, 9);
Map.addLayer(aoi, {color: 'yellow'}, 'Kilombero district boundary', true, 0.4);

// ---------------------------------------------------------------
// 2. DATE RANGE — pick a dry-season window (low cloud, good thermal signal)
// ---------------------------------------------------------------
var START_DATE = '2023-06-01';
var END_DATE   = '2023-10-31';

// ---------------------------------------------------------------
// 3. TREE CANOPY COVER — from Sentinel-2 NDVI
// ---------------------------------------------------------------
function maskS2clouds(image) {
  var scl = image.select('SCL');
  // keep vegetation(4), bare soil(5), water(6) - drop clouds(8,9,10) & shadow(3)
  var mask = scl.neq(3).and(scl.neq(8)).and(scl.neq(9)).and(scl.neq(10));
  return image.updateMask(mask).divide(10000)
              .copyProperties(image, ['system:time_start']);
}

var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(aoi)
  .filterDate(START_DATE, END_DATE)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
  .map(maskS2clouds);

var s2median = s2.median().clip(aoi);

var ndvi = s2median.normalizedDifference(['B8', 'B4']).rename('NDVI');

// Simple canopy mask: NDVI > 0.5 is a common threshold for tree/dense-vegetation
// cover in tropical settings. Adjust after visually checking against imagery.
var canopyMask = ndvi.gt(0.5).rename('canopy');

Map.addLayer(ndvi.clip(aoi), {min: -0.2, max: 0.9, palette: ['brown','yellow','green']}, 'NDVI');
Map.addLayer(canopyMask.updateMask(canopyMask), {palette: ['00ff00']}, 'Canopy mask (NDVI > 0.5)');

// ---------------------------------------------------------------
// 4. LAND SURFACE TEMPERATURE — from Landsat 8/9 Collection 2 Level 2
// ---------------------------------------------------------------
function maskL2sr(image) {
  var qa = image.select('QA_PIXEL');
  var cloudMask = qa.bitwiseAnd(1 << 3).eq(0) // cloud
    .and(qa.bitwiseAnd(1 << 4).eq(0));         // cloud shadow
  return image.updateMask(cloudMask);
}

function scaleAndConvertLST(image) {
  // ST_B10 is the surface temperature band, scaled per USGS Collection 2 docs
  var lstKelvin = image.select('ST_B10').multiply(0.00341802).add(149.0);
  var lstCelsius = lstKelvin.subtract(273.15).rename('LST_C');
  return image.addBands(lstCelsius);
}

var landsat = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .merge(ee.ImageCollection('LANDSAT/LC09/C02/T1_L2'))
  .filterBounds(aoi)
  .filterDate(START_DATE, END_DATE)
  .filter(ee.Filter.lt('CLOUD_COVER', 20))
  .map(maskL2sr)
  .map(scaleAndConvertLST);

var lstMedian = landsat.select('LST_C').median().clip(aoi);

Map.addLayer(lstMedian, {min: 20, max: 40, palette: ['blue','yellow','red']}, 'Land Surface Temp (deg C)');

// ---------------------------------------------------------------
// 5. RELATIONSHIP: canopy cover vs. LST
// ---------------------------------------------------------------
// Resample NDVI to same grid as LST (Landsat = 30m) and sample random points
var stack = ndvi.rename('NDVI').addBands(lstMedian).clip(aoi);

var samplePoints = stack.sample({
  region: aoi,
  scale: 30,
  numPixels: 2000,
  seed: 42,
  geometries: true
});

// Scatter plot: NDVI (proxy for canopy density) vs LST
var chart = ui.Chart.feature.byFeature(samplePoints, 'NDVI', 'LST_C')
  .setChartType('ScatterChart')
  .setOptions({
    title: 'Tree Canopy (NDVI) vs. Land Surface Temperature - Kilombero',
    hAxis: {title: 'NDVI'},
    vAxis: {title: 'LST (deg C)'},
    pointSize: 2,
    trendlines: {0: {type: 'linear', showR2: true, visibleInLegend: true}}
  });
print(chart);

// Simple correlation coefficient
var corr = samplePoints.reduceColumns({
  reducer: ee.Reducer.pearsonsCorrelation(),
  selectors: ['NDVI', 'LST_C']
});
print('Pearson correlation (NDVI vs LST):', corr);

// ---------------------------------------------------------------
// 6. EXPORTS (run manually from the Tasks tab if you want GeoTIFFs)
// ---------------------------------------------------------------
Export.image.toDrive({
  image: ndvi,
  description: 'Kilombero_NDVI_canopy',
  folder: 'kilombero_project',
  region: aoi,
  scale: 10,
  maxPixels: 1e9
});

Export.image.toDrive({
  image: lstMedian,
  description: 'Kilombero_LST_celsius',
  folder: 'kilombero_project',
  region: aoi,
  scale: 30,
  maxPixels: 1e9
});

Export.table.toDrive({
  collection: samplePoints,
  description: 'Kilombero_NDVI_LST_samples',
  folder: 'kilombero_project',
  fileFormat: 'CSV'
});
