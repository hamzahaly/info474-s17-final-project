zillowData <- read.csv(file="/Users/alexchow/Documents/UW/info474final/County_Zhvi_Summary_AllHomes.csv", header=TRUE, sep=",")
zillowData

zillowRegions <-read.csv(file="/Users/alexchow/Documents/UW/info474final/CountyCrossWalk_Zillow.csv", header=TRUE, sep=",")
zillowRegions

zillowRegionNames = zillowData['RegionName']
zillowRegionNames
zillowRegionID = zillowData[2]
zillowRegionID
zillowZhvi = zillowData[7]
zillowZhvi

regionsRegionID = zillowRegions['CountyRegionID_Zillow']
regionsRegionID
regionsFips = zillowRegions['FIPS']
regionsFips

zillowRegions['CountyName']

zillowData[5,]

countyFips <- vector(mode="numeric", length=nrow(zillowRegionID))
countyFips

zillowRegionID
for (i in 1:nrow(zillowRegionID)) {
  for (j in 1:nrow(regionsRegionID)) {
    if (zillowRegionID[i,] == regionsRegionID[j,]) {
      countyFips[i] = regionsFips[j,]
      print(countyFips[i])
    }
  }
}

df = data.frame(zillowRegionNames, zillowRegionID, zillowZhvi, countyFips)
df

write.csv(df, file = "zillow_prep.csv",row.names=TRUE)


