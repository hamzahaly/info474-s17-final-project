var MapChart = function() {

    //Set default values
    var height = 600;
    var width = 960;

    var margin = {
        left: 50,
        bottom: 50,
        top: 10,
        right: 10
    };
    
    //Legend
    //************** Needs to find a way to determine domain based on data */
    var legendTitle;

    var legend;
    var thresholdScale;

    //Map Chart Title
    var mapTitle = 'Zillow Home Value Index';

    //Filter
    var filter = 'ZHVI';

    //Minimum value in filtered dataset
    var min;

    //Maximum value in filtered dataset
    var max;

    //Controls the view for seeing Washington state only
    var washingtonView = false;

    //Controls whether you see a state view or county view. [Default = true]
    //var stateView = true;

    //Controls wheter you see a state view or county view. [Default = false]
    var countyView = false;

    //This refers to how the data will be mapped. For the id of each location, we will provide
    //data for that by setting and getting.
    var fipsZhvi = d3.map();
    var fipsPop = d3.map();
    var fipsMedIncome = d3.map();
    var fipsMedHomeVal = d3.map();
    var fipsCounty = d3.map();

    var fipsMap;

    //Specifies the csv file to read
    var csvFile;

    var colorScheme = d3.schemeOranges[6];
    var colorDomain;

    //***************
    //Controls the color of the map. Need to change the scale whenever the data changes as well.
    var color = d3.scaleThreshold().domain(d3.range(101600, 597700, 100000)).range(colorScheme);

    var chart = function(selection) {
        var chartHeight = height - margin.top - margin.bottom;
        var chartWidth = width - margin.left - margin.right;

        var projection = d3.geoAlbersUsa().scale(7800).translate([2300, 680]);
        var path = d3.geoPath().projection(projection);

        //Only allow a projection for the Washington view or else you get a box for the U.S. nation choropleth.
        if (countyView) {
            path = d3.geoPath();
        } else if (washingtonView) {
            path = d3.geoPath().projection(projection);
        };

        selection.each(function(data) {
            //Need to use if statement to decide which json file to defer
            if (countyView) {
                d3.queue()
                    .defer(d3.json, "https://d3js.org/us-10m.v1.json")
                    .defer(d3.csv, csvFile, function(d) {
                        fixFIPS(d);
                    })
                    .await(ready);
            } else if (washingtonView) {
                d3.queue()
                    .defer(d3.json, "data/wa_county.json")
                    .defer(d3.csv, csvFile, function(d) {
                        fixFIPS(d);
                    })
                    .await(ready);
            };

            var homeData = data;
            console.log(homeData);

            //Logic for getting min and max from dataset that contains comparable values

            var getMinMax = function() {
                var array = [];

                homeData.forEach(function(element) {
                    switch(filter) {
                    case 'Total population':
                        array.push(+element['Total population'])
                        break;
                    case 'Median household income':
                        array.push(+element['Median household income'])
                        break;
                    case 'Median home value':
                        array.push(+element['Median home value'])
                        break;
                    case 'ZHVI':
                        array.push(+element.ZHVI)
                        break;
                    default:
                        break;
                };
                }, this);

                min = d3.min(array);
                max = d3.max(array);
            };
            
            //Logic for applying the mapping of fips codes to the zhvi values
            var fixFIPS = function(d) {
                var fips = d['FIPS'];
                var pop = d['Total population'];
                var county = d['County'];
                var medianIncome = d['Median household income'];
                var medianHomeVal = d['Median home value'];
                var zhviValue = d['ZHVI'];

                if (fips.length == 4) {
                    fips = "0" + fips;
                };

                if (fips.length == 5) {
                    fipsZhvi.set(fips, +zhviValue);
                    fipsPop.set(fips, +pop);
                    fipsCounty.set(fips, county);
                    fipsMedHomeVal.set(fips, +medianHomeVal);
                    fipsMedIncome.set(fips, +medianIncome);
                };
            };

            //Ready function after the d3.queue logic for getting us projection information
            function ready(error, us) {
                if (error) throw error;
                console.log(us);

                //Svg of all of the div chart elements created in main.js
                var svg = d3.selectAll('.chart')
                    .data([homeData]);
                
                //svg for the map to be contained in
                var svgEnter = svg
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height)

                var div = d3.select('body')
                    .append('div')
                    .attr('class', 'tooltip')
                    .style('opacity', 0);

                //Get a new min and max every time a new filter is chosen. Probably used in a click function later.
                getMinMax();

                //Set Color
                color = d3.scaleThreshold().domain(d3.range(101600, 597700, 100000)).range(colorScheme);

                var draw = function(fipsMap) {
                    //If state view is true, render map with state borders, else with county borders
                    //id comes from the us object
                    if (stateView) {
                        //Renders borders
                        svgEnter.append('g')
                            .attr('class', 'states')
                            .selectAll('path')
                            .data(topojson.feature(us, us.objects.states).features)
                            .enter().append('path')
                            .attr('fill', function(d) {
                                return color(fipsMap.get(d.id));
                            })
                            .attr('d', path)
                    } else if (countyView) {
                        svgEnter.append('g')
                            .attr('class', 'counties')
                            .selectAll('path')
                            .data(topojson.feature(us, us.objects.counties).features)
                            .enter().append('path')
                            .attr('fill', function(d) {
                                return color(fipsMap.get(d.id));
                            })
                            .attr('d', path)
                            // Modification of custom tooltip code provided by Malcolm Maclean, taken from Michelle Chandra's
                            //Basic US State Map - D3, 
                            //"D3 Tips and Tricks" 
                            // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
                            .on("mouseover", function(d) {      
                                div.transition()        
                                .duration(200)      
                                .style("opacity", .9);     

                                div.text(fipsCounty.get(d.id) + " " + filter + ": " + fipsMap.get(d.id))
                                .style("left", (d3.event.pageX) + "px")     
                                .style("top", (d3.event.pageY - 28) + "px");    
                            })
                            .on("mouseout", function(d) {       
                                div.transition()        
                                .duration(500)      
                                .style("opacity", 0);   
                            });
                    } else if (washingtonView) {
                        svgEnter.append('g')
                            .attr('class', 'counties')
                            .attr('transform', 'translate(475, 1080) rotate(-13)')
                            .selectAll('path')
                            .data(topojson.feature(us, us.objects['WA-County']).features)
                            .enter().append('path')
                            .attr('fill', function(d) {
                                return color(fipsMap.get(d.properties.GEOID));
                            })
                            .attr('d', path)
                            // Modification of custom tooltip code provided by Malcolm Maclean, taken from Michelle Chandra's
                            //Basic US State Map - D3, 
                            //"D3 Tips and Tricks" 
                            // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
                            .on("mouseover", function(d) {      
                                div.transition()        
                                .duration(200)      
                                .style("opacity", .9);   
                                 
                                console.log(d);  
                                console.log(fipsMap.get(d.properties.GEOID));
                                //Hovers don't work quite right
                                div.text(d.properties.NAME + " " + filter + ": " + fipsMap.get(d.properties.GEOID))
                                .style("left", (d3.event.pageX) + "px")     
                                .style("top", (d3.event.pageY - 28) + "px");    
                            })
                            .on("mouseout", function(d) {       
                                div.transition()        
                                .duration(500)      
                                .style("opacity", 0);   
                            })
                    };
                    
                    // svgEnter.append('path')
                    //     .data(topojson.mesh(us, us.objects.states, function(a, b) {
                    //         return a !== b;
                    //     }))
                    //     .attr('class', 'states')
                    //     .attr('d', path);

                };

                //Default Legend
                thresholdScale = d3.scaleThreshold()
                                .domain([min, min + 100000, min + (100000 * 2), min + (100000 * 3), 540000])
                                .range(d3.schemeOranges[6]);

                legend = d3.legendColor()
                    .labelFormat(d3.format(".0f"))
                    .labels(d3.legendHelpers.thresholdLabels)
                    .scale(thresholdScale)
                    .title('Zillow Home Value Index');

                svgEnter.append('g')
                    .attr('class', 'legendQuant')
                    .attr('transform', 'translate(' + (chartWidth - 160) + ", 20)");

                svgEnter.select(".legendQuant")
                    .call(legend);

                svgEnter.append('g').append('text')
                    .attr('class', 'title')
                    .attr('x', chartWidth / 2)
                    .attr('y', 0 - (margin.top / 2) + 40)
                    .attr('text-anchor', 'middle')
                    .text(mapTitle);

                //Default map drawing on load.
                draw(fipsZhvi);
                $('#zhvi').addClass('btn-primary');
                $('#zhvi').addClass('active');

                // add an event listener for each filter button
                var filters = document.querySelectorAll('.btn-filter');

                filters.forEach(function(e) {
                    e.onclick = function() {
                        filter = this.value;
                        $(this).siblings().removeClass('btn-primary');
                        $(this).siblings().removeClass('active');
                        $(this).addClass('btn-primary');
                        $(this).addClass('active');
                        switch(filter) {
                        case 'Total population':
                            mapTitle = "Total Population"
                            //Get a new min and max every time a new filter is chosen. Probably used in a click function later.
                            getMinMax();

                            //Set Color
                            color = d3.scaleThreshold().domain(d3.range(min, max, 25000)).range(d3.schemeGreens[6]);
                            thresholdScale = d3.scaleThreshold()
                                .domain([min, min + 25000, min + (25000 * 2), min + (25000 * 3), max])
                                .range(d3.schemeGreens[6]);

                            legend = d3.legendColor()
                                .labelFormat(d3.format(".0f"))
                                .labels(d3.legendHelpers.thresholdLabels)
                                .scale(thresholdScale)
                                .title('Total Population');
                            
                            svgEnter.select(".legendQuant").remove();
                            svgEnter.select('.title').remove();

                            draw(fipsPop);

                            svgEnter.append('g')
                                .attr('class', 'legendQuant')
                                .attr('transform', 'translate(' + (chartWidth - 120) + ", 20)");

                            svgEnter.select(".legendQuant")
                                .call(legend);

                            svgEnter.append('g').append('text')
                                .attr('class', 'title')
                                .attr('x', chartWidth / 2)
                                .attr('y', 0 - (margin.top / 2) + 40)
                                .attr('text-anchor', 'middle')
                                .text(mapTitle);

                            break;
                        case 'Median household income':
                            mapTitle = "Median Household Income";

                            //Get a new min and max every time a new filter is chosen. Probably used in a click function later.
                            getMinMax();

                            //Set Color
                            color = d3.scaleThreshold().domain(d3.range(min, max, 15000)).range(d3.schemeReds[6]);
                            thresholdScale = d3.scaleThreshold()
                                .domain([min, min + 15000, min + (15000 * 2), min + (15000 * 3), max])
                                .range(d3.schemeReds[6]);

                            legend = d3.legendColor()
                                .labelFormat(d3.format(".0f"))
                                .labels(d3.legendHelpers.thresholdLabels)
                                .scale(thresholdScale)
                                .title('Median Household Income');

                            svgEnter.select(".legendQuant").remove();
                            svgEnter.select('.title').remove();

                            draw(fipsMedIncome);


                            svgEnter.append('g')
                                .attr('class', 'legendQuant')
                                .attr('transform', 'translate(' + (chartWidth - 160) + ", 20)");

                            svgEnter.select(".legendQuant")
                                .call(legend);

                            svgEnter.append('g').append('text')
                                .attr('class', 'title')
                                .attr('x', chartWidth / 2)
                                .attr('y', 0 - (margin.top / 2) + 40)
                                .attr('text-anchor', 'middle')
                                .text(mapTitle);

                            break;
                        case 'Median home value':
                            mapTitle = "Median Home Value";
                            //Get a new min and max every time a new filter is chosen. Probably used in a click function later.
                            getMinMax();

                            //Set Color
                            color = d3.scaleThreshold().domain(d3.range(min, max, 60000)).range(d3.schemeBlues[6]);
                            thresholdScale = d3.scaleThreshold()
                                .domain([min, min + 60000, min + (60000 * 2), min + (60000 * 3), max])
                                .range(d3.schemeBlues[6]);

                            legend = d3.legendColor()
                                .labelFormat(d3.format(".0f"))
                                .labels(d3.legendHelpers.thresholdLabels)
                                .scale(thresholdScale)
                                .title('Median Home Value');

                            svgEnter.select(".legendQuant").remove();
                            svgEnter.select('.title').remove();

                            draw(fipsMedHomeVal);


                            svgEnter.append('g')
                                .attr('class', 'legendQuant')
                                .attr('transform', 'translate(' + (chartWidth - 120) + ", 20)");

                            svgEnter.select(".legendQuant")
                                .call(legend);

                            svgEnter.append('g').append('text')
                                .attr('class', 'title')
                                .attr('x', chartWidth / 2)
                                .attr('y', 0 - (margin.top / 2) + 40)
                                .attr('text-anchor', 'middle')
                                .text(mapTitle);

                            break;
                        case 'ZHVI':
                            mapTitle = "Zillow Home Value Index"
                            //Get a new min and max every time a new filter is chosen. Probably used in a click function later.
                            getMinMax();

                            //Set Color
                            color = d3.scaleThreshold().domain(d3.range(101600, 597700, 100000)).range(colorScheme);
                            thresholdScale = d3.scaleThreshold()
                                .domain([min, min + 100000, min + (100000 * 2), min + (100000 * 3), 540000])
                                .range(d3.schemeOranges[6]);

                            legend = d3.legendColor()
                                .labelFormat(d3.format(".0f"))
                                .labels(d3.legendHelpers.thresholdLabels)
                                .scale(thresholdScale)
                                .title('Zillow Home Value Index');

                            svgEnter.select(".legendQuant").remove();
                            svgEnter.select('.title').remove();

                            draw(fipsZhvi);

                            svgEnter.append('g')
                                .attr('class', 'legendQuant')
                                .attr('transform', 'translate(' + (chartWidth - 120) + ", 20)");

                            svgEnter.select(".legendQuant")
                                .call(legend);

                            svgEnter.append('g').append('text')
                                .attr('class', 'title')
                                .attr('x', chartWidth / 2)
                                .attr('y', 0 - (margin.top / 2) + 40)
                                .attr('text-anchor', 'middle')
                                .text(mapTitle);

                            break;
                        default:
                            break;
                        };
                    }
                });
            };
        });
    };

    //Chain Functions
    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    // chart.stateView = function(value) {
    //     if (!arguments.length) return stateView;
    //     stateView = value;
    //     countyView = false;
    //     return chart;
    // };

    chart.countyView = function(value) {
        if (!arguments.length) return countyView;
        countyView = value;
        //stateView = false;
        return chart;
    };

    chart.csvFile = function(value) {
        if (!arguments.length) return csvFile;
        csvFile = value;
        return chart;
    };

    chart.washingtonView = function(value) {
        if (!arguments.length) return washingtonView;
        washingtonView = value;
        stateView = false;
        return chart;
    };

    chart.mapTitle = function(value) {
        if (!arguments.length) return mapTitle;
        mapTitle = value;
        return chart;
    };

    chart.colorScheme = function(value) {
        if(!arguments.length) return colorScheme;
        colorScheme = value;
        return chart;
    };

    return chart;
};