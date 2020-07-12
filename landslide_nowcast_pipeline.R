library(cleangeo)
library(raster)
library(rgdal)
library(dplyr)
library(tibble)

landslide <- readOGR("")

circles <- readOGR("")
 
landslide_cleaned <- clgeo_Clean(landslide, errors.only = NULL, strategy = "POLYGONATION", verbose = FALSE)


intersectit <- raster::intersect(landslide_cleaned, circles)

landslide_circles <- as.data.frame(intersectit)

table_landslide_circles <- landslide_circles %>% select(circle, district) %>% arrange(district) %>% distinct(circle, district)

writeOGR(intersectit, dsn="intersection_landslide_nowcast_202007120500_arunachal_circles.GeoJSON", layer="intersectit", driver="GeoJSON")
