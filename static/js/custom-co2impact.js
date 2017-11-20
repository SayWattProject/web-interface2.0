$(function () {

    $('#containergauge').highcharts({

        chart: {
            type: 'gauge'
        },

        title: {
            text: 'CO2 Emissions Right Now'
        },

        pane: {
            startAngle: -90,
            endAngle: 90,
            background: null
        },

        // the value axis
        yAxis: {
            min: 0,
            max: 200,

            minorTickInterval: 'auto',
            minorTickWidth: 1,
            minorTickLength: 10,
            minorTickPosition: 'inside',
            minorTickColor: '#666',

            tickPixelInterval: 30,
            tickWidth: 2,
            tickPosition: 'inside',
            tickLength: 10,
            tickColor: '#666',
            labels: {
                step: 2,
                rotation: 'auto'
            },
            title: {
                text: 'kgCO2/hr'
            },
            plotBands: [{
                from: 0,
                to: 120,
                color: '#55BF3B' // green
            }, {
                from: 120,
                to: 160,
                color: '#DDDF0D' // yellow
            }, {
                from: 160,
                to: 200,
                color: '#DF5353' // red
            }, {
            	from: 100,
                to: 140,
                color: '#6677ff',
                innerRadius: '100%',
                outerRadius: '110%'
            }]
        },

        series: [{
            name: 'Carbon Emissions',
            data: [80],
            tooltip: {
                valueSuffix: ' kgCO2/h'
            }
        }]

    },
    // Add some life
    function (chart) {
        if (!chart.renderer.forExport) {
            setInterval(function () {
                var point = chart.series[0].points[0],
                    newVal,
                    inc = Math.round((Math.random() - 0.5) * 20);

                newVal = point.y + inc;
                if (newVal < 0 || newVal > 200) {
                    newVal = point.y - inc;
                }

                point.update(newVal);

            }, 3000);
        }
    });
});
