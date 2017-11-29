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
				//console.log("Most recent value: "+most_recent_value);
				//console.log("Number of points retrieved: "+num_points);
				//console.log(response.points)
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
			text: 'Watts (W)'
		}
	},
};


/*
// from: http://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/dynamic-master-detail/
function energyusagedashboard(){
	obj_name = "OBJ-CURR-SENSORS"
	stream_name = "data-curr-sens-three"
	getPoints('local',obj_name,stream_name, function (data) {
		console.log(data);
		tmp = {};
		for (i=0; i<data.length; i++){
			at = data[i].at;
			val = data[i].val;
			tmp[i]= [at, val];
		}
		data = tmp;
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
                text: 'Building Composite Energy Usage'
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
*/


//TODO - need to make this usable for different streams and different container names
function energyusagecomponentstream(container_name,obj_name,stream_name){
	var plotCalls = 0;
	var plotTimer = setInterval( function(){
		getPoints('local',obj_name,stream_name, function(points){
			//console.log( "The points request was successful!" );
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

//energyusagedashboard() //load master detail
energyusagecomponentstream('containerEnergyUsageComposite','OBJ-CURR-SENSORS','data-curr-sens-three')
energyusagecomponentstream('containerEnergyUsageComponent1','OBJ-CURR-SENSORS','data-curr-sens-one') //load one stream
energyusagecomponentstream('containerEnergyUsageComponent2','OBJ-CURR-SENSORS','data-curr-sens-two') //load another stream
energyusagecomponentstream('containerEnergyUsageComponent3','OBJ-CURR-SENSORS','data-curr-sens-three') //load another stream



// from: http://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/polar-wind-rose/
function loadco2chart() {
	console.log('co2 called');
	// // Parse the data from an inline table using the Highcharts Data plugin
	// const container_name = 'containerco2impact';
	// //var plot = $('#'+container_name);
	// // Build the chart
	Highcharts.chart('containerco2impact', {
	    chart: {
	        plotBackgroundColor: null,
	        plotBorderWidth: null,
	        plotShadow: false,
	        type: 'pie'
	    },
	    title: {
	        text: 'CAISO Energy Cleanliness Makeup - WattTime'
	    },
	    tooltip: {
	        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
	    },
	    plotOptions: {
	        pie: {
	            allowPointSelect: true,
	            cursor: 'pointer',
	            dataLabels: {
	                enabled: false
	            },
	            showInLegend: true
	        }
	    },
	    series: [{
	        name: 'Source',
	        colorByPoint: true,
	        data: [{
	        name: 'wind',
	        y: 4495.7
	    }, {
	        name: 'renewable',
	        y: 613.5
	    }, {
	        name: 'other',
	        y: 35.6
	    }, {
	        name: 'oil',
	        y: 212.8
	    }, {
	        name: 'nuclear',
	        y: 34728.6
	    }, {
	        name: 'thermo',
	        y: 34.2
	    }, {
	        name: 'hydro',
	        y: 862.8
	    }, {
	        name: 'natgas',
	        y: 23304.8
	    }, {
	        name: 'coal',
	        y: 24541.8
	    }]
	    }]
	});
}

loadco2chart()

function loadgoalschart(){
	Highcharts.chart('containerGoals', {
    chart: {
        type: 'spline'
    },
    title: {
        text: 'Energy Usage in the Current Week'
    },
    subtitle: {
        text: 'Source: data-curr-sensors-all'
    },
    xAxis: [{
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
            'Sun'],
        crosshair: true,
        title: {
            text: 'Day of the Week'
        }
    }],
    yAxis: {
        title: {
            text: 'Energy Usage (kWh)'
        },
        min: 0
    },
    tooltip: {
        headerFormat: '<b>{series.name}</b><br>',
        pointFormat: '{point.y:.2f} kWh'
    },

    plotOptions: {
        spline: {
            marker: {
                enabled: true
            }
        }
    },

    series: [{
        name: 'Energy Used',
        type: 'column',
        data: [25.5, 29, 9],
        tooltip: {
            valueSuffix: ' kWh'
        }

    }, {
        name: '10% Reduction Goal',
        type: 'spline',
        data: [25.65,27.27,24.48,23.31,26.1,23.49,23.13],
        marker: {
            enabled: false
        },
        dashStyle: 'shortdot',
        tooltip: {
            valueSuffix: ' kWh'
        }

    }, {
        name: '3Week Moving Average',
        type: 'spline',
        data: [28.5, 30.3, 27.2, 25.9, 29.0, 26.1, 25.7],
        tooltip: {
            valueSuffix: ' kWh'
        }
    }]
});


}

loadgoalschart()


function loadenergypriceschart(){
	Highcharts.chart('containerEnergyPrices', {
    chart: {
        zoomType: 'xy'
    },
    title: {
        text: 'Energy Prices'
    },
    subtitle: {
        text: 'Tariff Schedule 1'
    },
    xAxis: [{
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
            'Sun'],
        crosshair: true
    }],
    yAxis: [{ // Primary yAxis
        labels: {
            format: '{value} kWh',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        title: {
            text: 'Energy Used',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        }
    }, { // Secondary yAxis
        title: {
            text: 'Energy Prices',
            style: {
                color: Highcharts.getOptions().colors[0]
            }
        },
        labels: {
            format: '${value}',
            style: {
                color: Highcharts.getOptions().colors[0]
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
        x: 120,
        verticalAlign: 'top',
        y: 100,
        floating: true,
        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
    },
    series: [{
        name: 'EnergyUsed',
        type: 'column',
        data: [25.5, 29, 9],
        tooltip: {
            valueSuffix: ' kWh'
        }

    }, {
        name: 'EnergyPrices based on Current Usage',
        type: 'spline',
        yAxis: 1,
        data: [8.16,	9.28,	2.88],
        tooltip: {
            valuePrefix: '$'
        }
    }, {
        name: '3Week Moving Average Projected Cost',
        type: 'spline',
        yAxis: 1,
        data: [9.12,	9.696,	8.704,	8.288,	9.28,	8.352,	8.224],
        tooltip: {
            valuePrefix: '$'
        }
    }]
});
}

loadenergypriceschart()


console.log("Adding toggle functionality");
//registerHandlers();

//function registerHandlers() {
// https://stackoverflow.com/questions/9180087/how-to-handle-change-of-checkbox-using-jquery

$('#btn-1').click(function () {
    $('#actuate-toggle-device-01').prop('checked', !$('#actuate-toggle-device-01').is(':checked'));
});

$('#btn-2').click(function () {
    var chk1 = $('#actuate-toggle-device-01').is(':checked');
    console.log("Value : " + chk1);
});

$('input[type="checkbox"]').change(function () {
    var name = $(this).val();
    var check = $(this).prop('checked');
    console.log("Change: " + name + " to " + check);
		if (check){
			//clicked to true >> turn on device
			console.log('hello brian set to true');
		}else{
			console.log('hello brian set to false');
			//clicked to false >> turn off device
			network_id = "local"
			object_id = "OBJ-PSWITCH-TAIL"
			stream_id = "actuate-pswitch-tail"
			// Send the request to the WCC server
			url = '/networks/'+network_id+'/objects/'+ object_id +'/streams/'+ stream_id +'/points'
/*
			$.post(url,
	    {
	        'points-at': "2017-10-18T07:32:29.243313Z",
	        'points-value': 1
	    },
	    function(data, status){
				message = '';
				for (i = 0; i < Object.keys(data).length; i++) {
				    message += Object.keys(data)[i] + ': ' + data[Object.keys(data)[i]] + ',';
				}
				console.log(message);
        //alert("Data: " + message + "\nStatus: " + status);
	    });
			*/
			$.ajax({
			  url: url,
			  type: "POST",
			  dataType:'json',
			  data: {
		        'points-at': "2017-10-18T07:32:29.243313Z",
		        'points-value': 1
		    },
			  success: function(data){
					message = '';
					for (i = 0; i < Object.keys(data).length; i++) {
							message += Object.keys(data)[i] + ': ' + data[Object.keys(data)[i]] + ',';
					}
			    console.log(message);
			  }
			});
			/*
			// Gather the data
			// and remove undefined keys(buttons)
			network_id = "local"
			object_id = "OBJ-PSWITCH-TAIL"
			stream_id = "actuate-pswitch-tail"
			// Send the request to the WCC server
			$.ajax({
				url : '/networks/'+network_id+'/objects/'+ object_id +'/streams/'+ stream_id +'/points',
				type: "put",
				cache: false,
				query = {
			        'points-value': click,
			        'points-at':
			    },
				success : function(response){
					var this_form = $("input[type='checkbox']");
					var message = $('<div class="alert" style="margin-top:20px"></div>');
					var url_array = this.url.split('?');
					var url = url_array[0]; // URL without '_' parameter
					var req = $('<pre class="language-"><b>GET</b> '+url+'</pre>');

					if( response['stream-code'] == 200 ){
						// Start Success message
						message.addClass('alert-success');
						message.append("<h4>Success!</h4>");
						req.css({ 'color': '#3c763d' });
					}else{
						// Start Danger message
						message.addClass('alert-danger');
						message.append("<h4>Error</h4>");
						req.css({ 'color': '#a94442' });
					}

					// Add Request message
					message.append('<p>Request</p>');
					message.append( req );

					// Add Response message
					message.append('<p>Response</p>');
					var json_code = $('<pre class="language-javascript"><code class="language-javascript">'+JSON.stringify(response,null,4)+'</code></pre>');
					message.append( json_code );

					// Highlight JSON with Prism
					Prism.highlightElement(json_code[0]);

					// Add/Replace Alert message
					if ( $('.alert', this_form).length ) {
						$('.alert', this_form).replaceWith( message );
					}else{
						this_form.append(message);
					}
				},
				error : function(jqXHR, textStatus, errorThrown){
					var this_form = $("input[type='checkbox']");

					// Add Error message
					var message = $('<div class="alert" style="margin-top:20px"></div>');
					message.addClass('alert-danger');
					message.append("<h4>Error</h4>");
					message.append("<p>Status Code: "+jqXHR.status+"</p>");
					message.append("<p>Status Text: "+textStatus+"</p>");

					// Add/Replace Alert message
					if ( $('.alert', this_form).length ) {
						$('.alert', this_form).replaceWith( message );
					}else{
						this_form.append(message);
					}
				}
			});
			*/
		}
});

// $('input[type="checkbox"]').bind('click', function(){
// 	alert("OK");
// })
