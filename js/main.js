$(function() {
    var path = d3.geoPath();

    //Use bracket notation for 1 map
    //Use data for multiple maps

    d3.csv("data/State_Zhvi_Summary_AllHomes.csv", function(error, data) {
        var homeValue = d3.map();
        
        var map = MapChart().width(960).height(600);

        map.csvFile("data/zillow_prep.csv")
        map.stateView(true);

        var charts = d3.select('#viz').selectAll('.chart')
            .data([data]);

        charts.enter().append('div')
            .attr('class', 'chart')
            .merge(charts)
            .call(map);

        charts.exit().remove();
    });
});