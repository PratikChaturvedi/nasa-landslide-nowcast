library(cleangeo)
library(raster)
library(rgdal)
library(dplyr)
library(lubridate)

## paste the various strings to create the url for UTC 2330 hrs = IST 0500 hrs. Add the Julian Day likewise. 
## As the release of the 2330 hrs nowcast is one day later in UTC subtract one day from todays date

landslide_url <-  paste0("https://pmmpublisher.pps.eosdis.nasa.gov/products/global_landslide_nowcast_3hr/export/Global/",format(now(tzone="UTC")-days(1), "%Y"), "/", format(now(tzone="UTC")-days(1), "%j"), "/", "global_landslide_nowcast_3hr.", format(now(tzone="UTC")-days(1), "%Y%m%d"), ".233000.geojson")

download.file(landslide_url, destfile = basename(landslide_url))

landslide <- readOGR(paste0(basename(landslide_url)))

circles <- readOGR("arunachal-pradesh-circles.geojson")
 
landslide_cleaned <- clgeo_Clean(landslide, errors.only = NULL, strategy = "POLYGONATION", verbose = FALSE)

intersectit <- raster::intersect(landslide_cleaned, circles)

landslide_circles <- as.data.frame(intersectit)

table_landslide_circles <- landslide_circles %>% select(circle, district) %>% arrange(district) %>% distinct(circle, district)