var ul = $('ul#side-menu');
$.ajax({
	url : '/static/extend_dashboard_links.html',
	type: "get",
	success : function(response){
		console.log("Load /static/extend_dashboard_links.html");
		ul.append(response);
	}
});

var wrapper = $('div#wrapper');
$.ajax({
	url : '/static/extend_dashboard_pages.html',
	type: "get",
	success : function(response){
		console.log("Load /static/extend_dashboard_pages.html");
		wrapper.append(response);

		// Form submit call goes here.
		$("form#form-input").submit( onInputFormSubmit );
	}
});

/*
  Add functionality to the input page form
*/
function onInputFormSubmit(e){
	e.preventDefault();
	var object_id = "obj-names";
	var stream_id = "stm-form-input";
	// Gather the data
	// and remove any undefined keys
	var data = {};
	$('input',this).each( function(i, v){
		var input = $(v); data[input.attr("name")] = input.val();
	});
	delete data["undefined"];
	//console.log( data );

	var url = '/networks/'+network_id+'/objects/';
	url = url + object_id+'/streams/'+stream_id+'/points';
	var query = {
		"points-value": JSON.stringify( data )
	};

	// Send the request to the Pico server
	$.ajax({
		url : url+'?'+$.param(query),
		type: "post",
		success : function(response){
			var this_form = $("form#form-input");

			if( response['points-code'] == 200 ){
			console.log("Success");
			// Clear the form
			this_form.trigger("reset");
		}
	// Log the response to the console
	console.log(response);
	},
	error : function(jqXHR, textStatus, errorThrown){
		// Do nothing
	}
	});
};

/*
  Add function to get points for report page
*/
function getPoints( the_network_id, the_object_id, the_stream_id, callback ){
	var query_data = {};
	var query_string = '?'+$.param(query_data);
	var url = '/networks/'+the_network_id+'/objects/'+the_object_id;
	url += '/streams/'+the_stream_id+'/points'+query_string;

	// Send the request to the server
	$.ajax({
		url : url,
		type: "get",
		success : function(response){
			//console.log( response );
			if( response['points-code'] == 200 ){
				var num_points = response.points.length
				var most_recent_value = response.points[0].value
				console.log("Most recent value: "+most_recent_value);
				console.log("Number of points retrieved: "+num_points);
				callback( response.points );
			}
		},
		error : function(jqXHR, textStatus, errorThrown){
			console.log(jqXHR);
		}
	});
}

// Call getPoints if Input or Report is selected
// ...added feature to dynamically update plot as new data becomes available
custom_sidebar_link_callback = function( select ){
	if (select == 'input') {

	}
	else if (select == 'report'){
		var plotCalls = 0;
		var plotTimer = setInterval( function(){
			getPoints('local','arduino-temp','temp-stream', function(points){
				console.log( "The points request was successful!" );
				loadPlot( points, 'content-report' );
			});
			if( plotCalls > 20 ){
				console.log( 'Clear timer' );
				clearInterval( plotTimer );
			}else{
				plotCalls += 1;
			}
		}, 1000);
	}
}

/*
    Function to plot data points using Highcharts
*/
function loadPlot( points, container_name ){
	var plot = $('#'+container_name);
	// Check if plot has a Highcharts element
	if( plot.highcharts() === undefined ){
		// Create a Highcharts element
		plot.highcharts( report_plot_options );
	}
	// Iterate over points to place in Highcharts format
	var datapoints = [];
	for ( var i = 0; i < points.length; i++){
		var at_date = new Date(points[i].at);
		var at = at_date.getTime() - at_date.getTimezoneOffset()*60*1000; datapoints.unshift( [ at, points[i].value] );
	}
	// Update Highcharts plot
	if( plot.highcharts().series.length > 0 ){
		plot.highcharts().series[0].setData( datapoints );
	}else{
		plot.highcharts().addSeries({
			name: "Stream Wattage",
			data: datapoints });
	}
}

var report_plot_options = {
	chart: {
		type: 'spline'
	},
	title: {
		text: 'Watts vs Time'
	},
	xAxis: {
		title: {
			text: 'Time'
		},
		type: 'datetime',
		dateTimeLabelFormats: { // don't display the dummy year
			month: '%e. %b',
			year: '%b'
		},
	},
	yAxis: {
		title: {
			text: 'Temperature (˚F)'
		}
	},
};



// from: http://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/dynamic-master-detail/
function energyusagedashboard(){
	$.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=usdeur.json&callback=?', function (data) {
    var detailChart;

    // create the detail chart
    function createDetail(masterChart) {

        // prepare the detail chart
        var detailData = [],
            detailStart = data[0][0];

        $.each(masterChart.series[0].data, function () {
            if (this.x >= detailStart) {
                detailData.push(this.y);
            }
        });

        // create a detail chart referenced by a global variable
        detailChart = Highcharts.chart('detail-container', {
            chart: {
                marginBottom: 120,
                reflow: false,
                marginLeft: 50,
                marginRight: 20,
                style: {
                    position: 'absolute'
                }
            },
            credits: {
                enabled: false
            },
            title: {
                text: 'Building Composit Energy Usage'
            },
            subtitle: {
                text: 'Select an \'timebox\' by dragging across the lower chart'
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: null
                },
                maxZoom: 0.1
            },
            tooltip: {
                formatter: function () {
                    var point = this.points[0];
                    return '<b>' + point.series.name + '</b><br/>' + Highcharts.dateFormat('%A %B %e %Y', this.x) + ':<br/>' +
                        '1 USD = ' + Highcharts.numberFormat(point.y, 2) + ' EUR';
                },
                shared: true
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                enabled: true,
                                radius: 3
                            }
                        }
                    }
                }
            },
            series: [{
                name: 'USD to EUR',
                pointStart: detailStart,
                pointInterval: 24 * 3600 * 1000,
                data: detailData
            }],

            exporting: {
                enabled: false
            }

        }); // return chart
    }

    // create the master chart
    function createMaster() {
        Highcharts.chart('master-container', {
            chart: {
                reflow: false,
                borderWidth: 0,
                backgroundColor: null,
                marginLeft: 50,
                marginRight: 20,
                zoomType: 'x',
                events: {

                    // listen to the selection event on the master chart to update the
                    // extremes of the detail chart
                    selection: function (event) {
                        var extremesObject = event.xAxis[0],
                            min = extremesObject.min,
                            max = extremesObject.max,
                            detailData = [],
                            xAxis = this.xAxis[0];

                        // reverse engineer the last part of the data
                        $.each(this.series[0].data, function () {
                            if (this.x > min && this.x < max) {
                                detailData.push([this.x, this.y]);
                            }
                        });

                        // move the plot bands to reflect the new detail span
                        xAxis.removePlotBand('mask-before');
                        xAxis.addPlotBand({
                            id: 'mask-before',
                            from: data[0][0],
                            to: min,
                            color: 'rgba(0, 0, 0, 0.2)'
                        });

                        xAxis.removePlotBand('mask-after');
                        xAxis.addPlotBand({
                            id: 'mask-after',
                            from: max,
                            to: data[data.length - 1][0],
                            color: 'rgba(0, 0, 0, 0.2)'
                        });


                        detailChart.series[0].setData(detailData);

                        return false;
                    }
                }
            },
            title: {
                text: null
            },
            xAxis: {
                type: 'datetime',
                showLastTickLabel: true,
                maxZoom: 14 * 24 * 3600000, // fourteen days
                plotBands: [{
                    id: 'mask-before',
                    from: data[0][0],
                    to: data[data.length - 1][0],
                    color: 'rgba(0, 0, 0, 0.2)'
                }],
                title: {
                    text: null
                }
            },
            yAxis: {
                gridLineWidth: 0,
                labels: {
                    enabled: false
                },
                title: {
                    text: null
                },
                min: 0.6,
                showFirstLabel: false
            },
            tooltip: {
                formatter: function () {
                    return false;
                }
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                series: {
                    fillColor: {
                        linearGradient: [0, 0, 0, 70],
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, 'rgba(255,255,255,0)']
                        ]
                    },
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    shadow: false,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    enableMouseTracking: false
                }
            },

            series: [{
                type: 'area',
                name: 'USD to EUR',
                pointInterval: 24 * 3600 * 1000,
                pointStart: data[0][0],
                data: data
            }],

            exporting: {
                enabled: false
            }

        }, function (masterChart) {
            createDetail(masterChart);
        }); // return chart instance
    }

    // make the container smaller and add a second container for the master chart
    var $container = $('#containerEnergyUsageComposite')
        .css('position', 'relative');

    $('<div id="detail-container">')
        .appendTo($container);

    $('<div id="master-container">')
        .css({
            position: 'absolute',
            top: 300,
            height: 100,
            width: '100%'
        })
            .appendTo($container);

    // create master and in its callback, create the detail chart
    createMaster();
});
} //end energyusagedashboard() def


//TODO - need to make this usable for different streams and different container names
function energyusagecomponentstream(container_name){
	var plotCalls = 0;
	var plotTimer = setInterval( function(){
		getPoints('local','arduino-temp','temp-stream', function(points){
			console.log( "The points request was successful!" );
			loadPlot( points, container_name );
		});
		if( plotCalls > 20 ){
			console.log( 'Clear timer' );
			clearInterval( plotTimer );
		}else{
			plotCalls += 1;
		}
	}, 1000);
}

energyusagedashboard() //load master detail
energyusagecomponentstream('containerEnergyUsageComponent1') //load one stream
energyusagecomponentstream('containerEnergyUsageComponent2') //load another stream



// from: http://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/polar-wind-rose/
function loadco2chart() {
	console.log('co2 called');
	// Parse the data from an inline table using the Highcharts Data plugin
	const container_name = 'containerco2impact';
	//var plot = $('#'+container_name);
	var plot = Highcharts.chart(container_name, {
	    data: {
	        table: 'freq',
	        startRow: 1,
	        endRow: 17,
	        endColumn: 7
	    },

	    chart: {
	        polar: true,
	        type: 'column'
	    },

	    title: {
	        text: 'Wind rose for South Shore Met Station, Oregon'
	    },

	    subtitle: {
	        text: 'Source: or.water.usgs.gov'
	    },

	    pane: {
	        size: '85%'
	    },

	    legend: {
	        align: 'right',
	        verticalAlign: 'top',
	        y: 100,
	        layout: 'vertical'
	    },

	    xAxis: {
	        tickmarkPlacement: 'on'
	    },

	    yAxis: {
	        min: 0,
	        endOnTick: false,
	        showLastLabel: true,
	        title: {
	            text: 'Frequency (%)'
	        },
	        labels: {
	            formatter: function () {
	                return this.value + '%';
	            }
	        },
	        reversedStacks: false
	    },

	    tooltip: {
	        valueSuffix: '%'
	    },

	    plotOptions: {
	        series: {
	            stacking: 'normal',
	            shadow: false,
	            groupPadding: 0,
	            pointPlacement: 'on'
	        }
	    }
	});
}

loadco2chart()

function loadgoalschart(){
	Highcharts.chart('containerGoals', {
    chart: {
        zoomType: 'xy'
    },
    title: {
        text: 'Average Monthly Weather Data for Tokyo'
    },
    subtitle: {
        text: 'Source: WorldClimate.com'
    },
    xAxis: [{
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        crosshair: true
    }],
    yAxis: [{ // Primary yAxis
        labels: {
            format: '{value}°C',
            style: {
                color: Highcharts.getOptions().colors[2]
            }
        },
        title: {
            text: 'Temperature',
            style: {
                color: Highcharts.getOptions().colors[2]
            }
        },
        opposite: true

    }, { // Secondary yAxis
        gridLineWidth: 0,
        title: {
            text: 'Rainfall',
            style: {
                color: Highcharts.getOptions().colors[0]
            }
        },
        labels: {
            format: '{value} mm',
            style: {
                color: Highcharts.getOptions().colors[0]
            }
        }

    }, { // Tertiary yAxis
        gridLineWidth: 0,
        title: {
            text: 'Sea-Level Pressure',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        labels: {
            format: '{value} mb',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        opposite: true
    }],
    tooltip: {
        shared: true
    },
    legend: {
        layout: 'vertical',
        align: 'left',
        x: 80,
        verticalAlign: 'top',
        y: 55,
        floating: true,
        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
    },
    series: [{
        name: 'Rainfall',
        type: 'column',
        yAxis: 1,
        data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
        tooltip: {
            valueSuffix: ' mm'
        }

    }, {
        name: 'Sea-Level Pressure',
        type: 'spline',
        yAxis: 2,
        data: [1016, 1016, 1015.9, 1015.5, 1012.3, 1009.5, 1009.6, 1010.2, 1013.1, 1016.9, 1018.2, 1016.7],
        marker: {
            enabled: false
        },
        dashStyle: 'shortdot',
        tooltip: {
            valueSuffix: ' mb'
        }

    }, {
        name: 'Temperature',
        type: 'spline',
        data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6],
        tooltip: {
            valueSuffix: ' °C'
        }
    }]
});


}

loadgoalschart()
