var map = function() {
    //Set default values
    var height = 600;
    var width = 960;
    var margin = {
        left: 50,
        bottom: 50,
        top: 10,
        right: 10
    };

    var chart = function(selection) {
        var chartHeight = height - margin.top - margin.bottom;
        var chartWidth = width - margin.left - margin.right;

        var path = d3.geoPath();

        selection.each(function(data) {

        });
    }

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
}