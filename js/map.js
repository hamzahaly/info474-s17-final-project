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

    var view;
    //This refers to how the data will be mapped. For the id of each location, we will provide
    //data for that by setting and getting.
    var fill;

    var csvFile;

    var color;

    var chart = function(selection) {
        var chartHeight = height - margin.top - margin.bottom;
        var chartWidth = width - margin.left - margin.right;

        var path = d3.geoPath();

        selection.each(function(data) {
            d3.queue()
                .defer(d3.json, "https://d3js.org/us-10m.v1.json")
                .defer(d3.csv, "data/State_Zhvi_Summary_AllHomes.csv", function(d) {

                })
                .await(ready);

            var homeData = data;
            console.log(homeData);

            function ready(error, us) {
                if (error) throw error;
                //console.log(us);

                //Data for maps is passed as topojson
                var svg = d3.selectAll('.chart')
                    .data([homeData]);
                
                var svgEnter = svg
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height);
                
                //Renders borders
                svgEnter.append('g')
                    .attr('class', 'counties')
                    .selectAll('path')
                    .data(topojson.feature(us, us.objects.states).features)
                    .enter().append('path')
                    .attr('d', path);
                
                svgEnter.append('path')
                    .data(topojson.mesh(us, us.objects.states, function(a, b) {
                        return a !== b;
                    }))
                    .attr('class', 'states')
                    .attr('d', path);
            };
        });
    };

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

    return chart;
};