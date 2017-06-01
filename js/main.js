$(function() {
    var path = d3.geoPath();

    //Use bracket notation for 1 map
    //Use data for multiple maps
    
    var csvFile = "data/census_prep_data.csv";


    d3.csv(csvFile, function(error, data) {
        var homeValue = d3.map();
        
        var map = MapChart().width(960).height(600);
        var nationView = true;
        //CSV file needs to change if you want ZHVI values or any other data value

        map.csvFile(csvFile);

        if (nationView) {
            map.countyView(true);
        } else {
            map.washingtonView(true);
        };


        var charts = d3.select('#viz').selectAll('.chart')
            .data([data]);

        charts.enter().append('div')
            .attr('class', 'chart')
            .merge(charts)
            .call(map);

        charts.exit().remove();
    });

    // event listeners for UI components
    $('.btn').click(function() {
<<<<<<< HEAD
        //alert('I\'m clicked!');
=======
        // alert('I\'m clicked!');
>>>>>>> 8fba2de7de5b64849bb188a59a1612255e73f887
    });
});