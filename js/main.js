$(function() {
    var path = d3.geoPath();

    //Use bracket notation for 1 map
    //Use data for multiple maps
    
    var csvFile = "data/census_prep_data_final2.csv";

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
            $('.btn-filter').removeClass('btn-primary');
            $('.btn-filter').removeClass('active');

            if (val == 'United States') {
                nationView = true;

                d3.selectAll(".chart").remove();

                charts = d3.select('#viz').selectAll('.chart')
                .data([data]);

                if (nationView) {
                    map.washingtonView(false);
                    map.countyView(true);
                } else {
                    map.countyView(false);
                    map.washingtonView(true);
                };


                charts.enter().append('div')
                    .attr('class', 'chart')
                    .merge(charts)
                    .call(map);

                charts.exit().remove();

            } else if (val == 'Washington') {
                nationView = false;

                d3.selectAll(".chart").remove();

                charts = d3.select('#viz').selectAll('.chart')
                    .data([data]);

                if (nationView) {
                    map.washingtonView(false);
                    map.countyView(true);
                } else {
                    map.countyView(false);
                    map.washingtonView(true);
                };

                charts.enter().append('div')
                    .attr('class', 'chart')
                    .merge(charts)
                    .call(map);

                charts.exit().remove();
            };
        });

        //Controls getting the text value form the drop down. Change the indexhtml text to what ever you need to get the value.
        var scatterplotFilters = document.querySelectorAll('.btn-filter-scatter');

        scatterplotFilters.forEach(function(e) {
            e.onclick = function() {
                var val = this.value;
            }
        });
    });
});