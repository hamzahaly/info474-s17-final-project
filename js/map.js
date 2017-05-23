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

    //Controls whether you see a state view or county view. [Default = true]
    var stateView = true;

    //Controls wheter you see a state view or county view. [Default = false]
    var countyView = false;

    //This refers to how the data will be mapped. For the id of each location, we will provide
    //data for that by setting and getting.
    var fipsDataMap = d3.map();

    //Specifies the csv file to read
    var csvFile;

    //Controls the color of the map.
    var color = d3.scaleThreshold().domain(d3.range(101600, 597700, 800)).range(d3.schemeRdBu[6]);

    var chart = function(selection) {
        var chartHeight = height - margin.top - margin.bottom;
        var chartWidth = width - margin.left - margin.right;

        var path = d3.geoPath();

        selection.each(function(data) {
            d3.queue()
                .defer(d3.json, "https://d3js.org/us-10m.v1.json")
                .defer(d3.csv, csvFile, function(d) {
                    //Logic for applying the mapping of fips codes to the zhvi values
                    //console.log(d);
                    var fips = d['countyFips'];
                    var zhviValue = d.Zhvi;
                    if (fips.length == 4) {
                        fips = "0" + fips;
                        //console.log(fips);
                    };
                    //console.log(zhviValue);

                    if (fips.length == 5) {
                        fipsDataMap.set(fips, +zhviValue);
                        //console.log(fipsDataMap);
                    };

                })
                .await(ready);

            var homeData = data;

            //Logic for getting min and max from dataset that contains comparable values
            var zhvi = [];
            
            homeData.forEach(function(element) {
                zhvi.push(element.Zhvi);
            }, this);

            var min = d3.min(zhvi);
            var max = d3.max(zhvi);
           
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
                    .attr('height', height);
                
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
                            //console.log(d);
                            return color(fipsDataMap.get(d.id));
                        })
                        .attr('d', path);
                } else if (countyView) {
                    svgEnter.append('g')
                        .attr('class', 'counties')
                        .selectAll('path')
                        .data(topojson.feature(us, us.objects.counties).features)
                        .enter().append('path')
                        .attr('fill', function(d) {
                            return color(fipsDataMap.get(d.id));
                        })
                        .attr('d', path);
                };
                
                svgEnter.append('path')
                    .data(topojson.mesh(us, us.objects.states, function(a, b) {
                        return a !== b;
                    }))
                    .attr('class', 'states')
                    .attr('d', path);
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

    chart.stateView = function(value) {
        if (!arguments.length) return stateView;
        stateView = value;
        countyView = false;
        return chart;
    };

    chart.countyView = function(value) {
        if (!arguments.length) return countyView;
        countyView = value;
        stateView = false;
        return chart;
    };

    chart.csvFile = function(value) {
        if (!arguments.length) return csvFile;
        csvFile = value;
        return chart;
    };

    return chart;
};