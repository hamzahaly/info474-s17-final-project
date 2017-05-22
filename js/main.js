$(function() {
    // var svg = d3.select("#viz").append('svg')
    //     .attr('width', 900)
    //     .attr('height', 560);

    // var g = d3.select('svg').append('g');

    var path = d3.geoPath();

    // d3.queue()
    //     .defer(d3.json, "https://d3js.org/us-10m.v1.json")
    //     .defer(d3.csv, "data/State_Zhvi_Summary_AllHomes.csv", function(d) {

    //     })
    //     .await(ready);
        
    // function ready(error, us) {
    //     if (error) throw error;
    //     console.log(us);

    //     svg.append('g')
    //         .attr('class', 'counties')
    //         .selectAll('path')
    //         .data(topojson.feature(us, us.objects.counties).features)
    //         .enter().append("path")
    //         //.style('fill', 'blue')
    //         .attr('d', path)

    //     // Draw state paths
    //     svg.append('path')
    //         .data(topojson.mesh(us, us.objects.states, function(a, b) {
    //             return a !== b;
    //         }))
    //         .attr('class', 'states')
    //         .attr('d', path);

    // };

    //Use bracket notation for 1 map
    //Use data for multiple maps

    d3.csv("data/State_Zhvi_Summary_AllHomes.csv", function(error, data) {
        var homeValue = d3.map();
        
        var map = MapChart().width(960).height(600);

        var charts = d3.select('#viz').selectAll('.chart')
            .data([data]);

        charts.enter().append('div')
            .attr('class', 'chart')
            .merge(charts)
            .call(map);

        charts.exit().remove();
    });
});