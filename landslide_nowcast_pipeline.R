library(cleangeo)
library(raster)
library(rgdal)
library(dplyr)
library(lubridate)
library(tidyr)

## paste the various strings to create the url for UTC 2330 hrs = IST 0500 hrs. Add the Julian Day likewise. 
## As the release of the 2330 hrs nowcast is one day later in UTC, subtract one day from todays UTC date

landslide_url <-  paste0("https://pmmpublisher.pps.eosdis.nasa.gov/products/global_landslide_nowcast_3hr/export/Global/",format(now(tzone="UTC")-days(1), "%Y"), "/", format(now(tzone="UTC")-days(1), "%j"), "/", "global_landslide_nowcast_3hr.", format(now(tzone="UTC")-days(1), "%Y%m%d"), ".233000.geojson")

## DOWNLOAD THE FILE
download.file(landslide_url, destfile = basename(landslide_url))

## CREATE THE LANDSLIDE FILE
landslide <- readOGR(paste0(basename(landslide_url)))

## CALL THE CIRCLES FILE
circles <- readOGR("arunachal-pradesh-circles.geojson")
 
## CLEAN THE GEOMETRIES OF THE LANDSLIDE FILE
landslide_cleaned <- clgeo_Clean(landslide, errors.only = NULL, strategy = "POLYGONATION", verbose = FALSE)

## INTERSECT THE LANDSLIDE FILE WITH THE CIRCLES
intersectit <- raster::intersect(landslide_cleaned, circles)

## MAKE DATA FRAME OF THE SPATIAL DATAFRAME
landslide_circles <- as.data.frame(intersectit)

## USE DPLYR TO SELECT JUST CIRCLE AND DISTRICT, THEN ARRANGE ALPHABETICALLY BY DITRICT AND DROP DUPLICATES
table_landslide_circles <- landslide_circles %>% select(circle, district) %>% arrange(district) %>% distinct(circle, district)


aggregate_by_district <- aggregate(table_landslide_circles$circle, list(table_landslide_circles$district), function(x) paste0(toString(unique(x))))

names(aggregate_by_district) <- c("district", "circles")

aggregate_by_district$text <- "district :"

aggregate_by_district$intro <- paste(format(now(tzone="UTC"), "%d-%m-%Y"), "Landslide Nowcast at 0500 hrs IST is moderate/high for following circles of :")

## REAARANGE THE COLUMNS
aggregate_by_district <- aggregate_by_district[,c(4, 1, 3, 2)]

## UNITE ALL COLUMNS SUCH THAT EVERY ROW IS ONE TWEET
tweets <- aggregate_by_district %>% unite("tweet", intro, district, text, circles, remove = T, sep = " ")

