$(function() {
    var path = d3.geoPath();

    //Use bracket notation for 1 map
    //Use data for multiple maps
    
    var csvFile = "data/census_prep_data.csv";

    var map = MapChart().width(960).height(600);

    d3.csv(csvFile, function(error, data) {
        var homeValue = d3.map();
        
        var nationView = false;
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

        $('#map-display li').on('click', function() {
            var val = $(this).text();
            console.log(val);

            var charts = d3.select('#viz').selectAll('.chart')
                .data([data]);

            if (val == 'United States') {
                nationView = true;

                if (nationView) {
                    map.countyView(true);
                } else {
                    map.washingtonView(true);
                };


                charts.enter().append('div')
                    .attr('class', 'chart')
                    .merge(charts)
                    .call(map);

                charts.exit().remove();

            } else if (val == 'Washington') {
                console.log("WASHINGTON CHOSEN");
                nationView = false;
                
                var charts = d3.select('#viz').selectAll('.chart')
                    .data([data]);

                if (nationView) {
                    map.countyView(true);
                } else {
                    map.washingtonView(true);
                };

                charts.enter().append('div')
                    .attr('class', 'chart')
                    .merge(charts)
                    .call(map);

                charts.exit().remove();
            };
        });
    });

    // event listeners for UI components
    $('.dropdown-toggle').click(function() {
        // alert('I\'m clicked!');

    });

});