///////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2016 Eric Burger, Wallflower.cc
//
//  MIT License (MIT)
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//  SOFTWARE.
//
///////////////////////////////////////////////////////////////////////////////////


// Network to display
var network_id = 'local';
var network = {};
var view_stream = [];

var custom_sidebar_link_callback, ws_callback;

if (enable_ws == true) {
  // Connect to WebSocket
  window.onload = function() {
    // Subscribe to all (successful) responses on the network
    socket = new WebSocket("ws://"+window.location.hostname+":5050/network/"+network_id);
    socket.binaryType = "arraybuffer";
    socket.onopen = function() {
       console.log("WebSocket Connected!");
       isopen = true;
    }
    socket.onmessage = function(e) {
       if (typeof e.data == "string") {
          //console.log("Text message received: " + e.data);
          try{
            var response = JSON.parse( e.data );
            // Route the responses
            if ( response.hasOwnProperty("response-type") ){
              if ( response["response-type"] == "object-create" ){
                doCreateObject( response );
              }
              else if ( response["response-type"] == "stream-create" ){
                doCreateStream( response );
              }
              else if ( response["response-type"] == "object-update" ){
                doUpdateObject( response );
              }
              else if ( response["response-type"] == "stream-update" ){
                doUpdateStream( response );
              }
              else if ( response["response-type"] == "points-update" ){
                doUpdatePoints( response );
              }
              else if ( response["response-type"] == "object-delete" ){
                doDeleteObject( response );
              }
              else if ( response["response-type"] == "stream-delete" ){
                doDeleteStream( response );
              }

              // Optional callback
              if ( jQuery.isFunction( ws_callback ) ){
                ws_callback( response );
              }
            }
          } catch (e) {
            console.log( e );
          }
       } else {
          var arr = new Uint8Array(e.data);
          var hex = '';
          for (var i = 0; i < arr.length; i++) {
             hex += ('00' + arr[i].toString(16)).substr(-2);
          }
          console.log("Binary message received: " + hex);
       }
    }
    socket.onclose = function(e) {
       console.log("WebSocket Connection Closed.");
       socket = null;
       isopen = false;
    }
  };
}


$(document).ready(function(){

  // Load the network from the WCC server
  loadNetwork();

  // Load the Highcharts element
  loadPointsPlot();

  // Bind function to panel clicks
  $(document).on('click', '#dashboard-panel-heading .panel', panelClickResponse );

  // Bind function to sidebar clicks
  $(document).on('click', '#dashboard-sidebar-nav a.first-level', sidebarClickResponse );



// Process object-create response
function doCreateObject( response ){
  // Add new object to client-side
  var new_object = {
    'object-id': response['object-id'],
    'object-details': response['object-details'],
    'streams': {}
  }
  network['objects'][response['object-id']] = new_object;

  // Reload the create stream form
  loadCreateStreamForms();
  // Reload Side Bar
  loadViewSideBarNav();

  if (enable_ws == true) {
    // Notification
    var current_page = $('div.page:not(.hidden) div.row:not(.hidden) .note');
    var note = $("<div class='alert alert-success affix'><p>Received Object Create Message</p><div>");
    current_page.html( note );
    note.fadeTo(1000, 1).fadeTo(1000, 0, function(){
      $(this).remove();
    });
  }
}

// Process stream-create response
function doCreateStream( response ){
  // Add new stream to client-side
  var new_stream = {
    'stream-id': response['stream-id'],
    'stream-details': response['stream-details'],
    'points-details': response['points-details'],
    'points': []
  }
  network['objects'][response["object-id"]]['streams'][response['stream-id']] = new_stream;

  // Reload Side Bar
  loadViewSideBarNav();

  if (enable_ws == true) {
    // Notification
    var current_page = $('div.page:not(.hidden) div.row:not(.hidden) .note');
    var note = $("<div class='alert alert-success affix'><p>Received Stream Create Message</p><div>");
    current_page.html( note );
    note.fadeTo(1000, 1).fadeTo(1000, 0, function(){
      $(this).remove();
    });
  }
}

// Process object-update response
function doUpdateObject( response ){
  // Update client-side object details
  for ( var object_details_id in response['object-details'] ){
    network['objects'][response['object-id']]['object-details'][object_details_id] = response['object-details'][object_details_id];
  }

  // Reload Side Bar
  loadViewSideBarNav();
  if (enable_ws == true) {
    // Notification
    var current_page = $('div.page:not(.hidden) div.row:not(.hidden) .note');
    var note = $("<div class='alert alert-warning affix'><p>Received Object Update Message</p><div>");
    current_page.html( note );
    note.fadeTo(1000, 1).fadeTo(1000, 0, function(){
      $(this).remove();
    });
  }
}

// Process stream-update response
function doUpdateStream( response ){
  // Update client-side stream details
  for ( var stream_details_id in response['stream-details'] ){
    network['objects'][response['object-id']]['streams'][response['stream-id']]['stream-details'][stream_details_id] = response['stream-details'][stream_details_id];
  }

  // Reload Side Bar
  loadViewSideBarNav();

  if (enable_ws == true) {
    // Notification
    var current_page = $('div.page:not(.hidden) div.row:not(.hidden) .note');
    var note = $("<div class='alert alert-warning affix'><p>Received Stream Update Message</p><div>");
    current_page.html( note );
    note.fadeTo(1000, 1).fadeTo(1000, 0, function(){
      $(this).remove();
    });
  }
}

// Process points-update response
function doUpdatePoints( response ){
  // Update client-side points
  for ( var point in response['points'] ){
    network['objects'][response['object-id']]['streams'][response['stream-id']]['points'].unshift( point );
  }

  if( view_stream.length == 3 ){
    if( view_stream[0] == response['network-id'] && view_stream[1] == response['object-id'] && view_stream[2] == response['stream-id'] ){
      // User is currently viewing stream that was just updated.
      if( network.objects[response['object-id']].streams[response['stream-id']]['points-details']['points-type'] == 'i' ||
          network.objects[response['object-id']].streams[response['stream-id']]['points-details']['points-type'] == 'f' ){

        reloadPointsPlot( response['network-id'], response['object-id'], response['stream-id'] );

        $('.page-view-stream.points-plot').removeClass('hidden');
      }
      else{

        reloadPointsTable( response['network-id'], response['object-id'], response['stream-id'] );

        $('.page-view-stream.points-table').removeClass('hidden');
      }
    }
  }

  if (enable_ws == true) {
    // Notification
    var current_page = $('div.page:not(.hidden) div.row:not(.hidden) .note');
    var note = $("<div class='alert alert-warning affix'><p>Received Points Update Message</p><div>");
    current_page.html( note );
    note.fadeTo(1000, 1).fadeTo(1000, 0, function(){
      $(this).remove();
    });
  }
}

// Process object-delete response
function doDeleteObject( response ){
  // Delete object from client-side record
  delete network['objects'][response['object-id']];

  // TODO: If user is viewing stream or object when deleted

  // Reload the object and stream delete forms
  loadDeleteObjectForms();
  loadDeleteStreamsForms();
  // Reload Side Bar
  loadViewSideBarNav();

  if (enable_ws == true) {
    // Notification
    var current_page = $('div.page:not(.hidden) div.row:not(.hidden) .note');
    var note = $("<div class='alert alert-danger affix'><p>Received Object Delete Message</p><div>");
    current_page.html( note );
    note.fadeTo(1000, 1).fadeTo(1000, 0, function(){
      $(this).remove();
    });
  }
}

// Process stream-delete response
function doDeleteStream( response ){
  // Delete stream from client-side record
  delete network['objects'][response['object-id']]['streams'][response['stream-id']];

  // TODO: If user is viewing stream when deleted

  // Reload the stream delete form
  loadDeleteStreamsForms();
  // Reload Side Bar
  loadViewSideBarNav();

  if (enable_ws == true) {
    // Notification
    var current_page = $('div.page:not(.hidden) div.row:not(.hidden) .note');
    var note = $("<div class='alert alert-danger affix'><p>Received Stream Delete Message</p><div>");
    current_page.html( note );
    note.fadeTo(1000, 1).fadeTo(1000, 0, function(){
      $(this).remove();
    });
  }
}



// Initialize/reload the create stream form
function loadCreateStreamForms(){
  // Clear the object id option
  $('#form-create-stream select[name="object-id"] option').remove();
  // Populate the object id option
  if ( network.hasOwnProperty("objects") ) {
    for ( var object_id in network.objects ){
      $('#form-create-stream select[name="object-id"]').append('<option value="'+object_id+'">'+object_id+'</option>');
    }
  }
}

// Initialize/reload the update object form
function loadUpdateObjectForms(){
  // Clear the object id option
  $('#form-update-object select[name="object-id"] option').remove();
  // Populate the object id option
  if ( network.hasOwnProperty("objects") ) {
    for ( var object_id in network.objects ){
      $('#form-update-object select[name="object-id"]').append('<option value="'+object_id+'">'+object_id+'</option>');
    }
  }
  // Set object name field given selected object
  var selected_object_id = $( "option:selected", $('#form-update-object select') ).val();
  $('#form-update-object input[name="object-name"]').val( network.objects[selected_object_id]['object-details']['object-name'] );
}

// Initialize/reload the update stream form
function loadUpdateStreamsForms(){
  // Clear the object id and stream id options
  $('#form-update-stream select[name="object-id"] option').remove();
  $('#form-update-stream select[name="stream-id"] option').remove();

  if ( network.hasOwnProperty("objects") ) {
    // Populate the object id option
    for ( var object_id in network.objects ){
      $('#form-update-stream select[name="object-id"]').append('<option value="'+object_id+'">'+object_id+'</option>');
    }

    var selected_object_id = $( "option:selected", $('#form-update-stream select[name="object-id"]') ).val();
    if( selected_object_id in network.objects &&
        network.objects[selected_object_id].hasOwnProperty("streams") &&
        Object.keys( network.objects[selected_object_id].streams ).length > 0 ) {

      // Show stream portion of form
      $("#form-conditional-update-stream").removeClass('hidden');

      // Populate the stream id option
      for ( var stream_id in network.objects[selected_object_id].streams ){
        $('#form-update-stream select[name="stream-id"]').append('<option value="'+stream_id+'">'+stream_id+'</option>');
      }
      // Set stream name field given selected object and stream
      var selected_stream_id = $( "option:selected", $('#form-update-stream select[name="stream-id"]') ).val();
      $('#form-update-stream input[name="stream-name"]').val( network.objects[selected_object_id].streams[selected_stream_id]['stream-details']['stream-name'] );
    }else{
      $("#form-conditional-update-stream").addClass('hidden');
    }
  }
}

// Initialize/reload the update points form
function loadUpdatePointsForms(){
  // Clear the object id and stream id options
  $('#form-update-points select[name="object-id"] option').remove();
  $('#form-update-points select[name="stream-id"] option').remove();

  if ( network.hasOwnProperty("objects") ) {
    // Populate the object id option
    for ( var object_id in network.objects ){
      $('#form-update-points select[name="object-id"]').append('<option value="'+object_id+'">'+object_id+'</option>');
    }

    var selected_object_id = $( "option:selected", $('#form-update-points select[name="object-id"]') ).val();
    if( selected_object_id in network.objects &&
        network.objects[selected_object_id].hasOwnProperty("streams") &&
        Object.keys( network.objects[selected_object_id].streams ).length > 0 ) {

      // Show streams portion of form
      $("#form-conditional-update-points").removeClass('hidden');

      // Populate the stream id option
      for ( var stream_id in network.objects[selected_object_id].streams ){
        $('#form-update-points select[name="stream-id"]').append('<option value="'+stream_id+'">'+stream_id+'</option>');
      }

      // Set the type of the point value field given selected object and stream
      var selected_stream_id = $( "option:selected", $('#form-update-points select[name="stream-id"]') ).val();
      var points_type = network.objects[selected_object_id].streams[selected_stream_id]['points-details']['points-type'];
      if( points_type == 'f' ){
        // Float
        $('#form-update-points p.help-block[for="points-value"]').html("Value must be a <b>float</b>");
        $('#form-update-points input[name="points-value"]').attr('type', 'number');
        $('#form-update-points input[name="points-value"]').attr('step', 'any');
      }else if( points_type == 's' ){
        // String
        $('#form-update-points p.help-block[for="points-value"]').html("Value must be a <b>string</b>");
        $('#form-update-points input[name="points-value"]').attr('type', 'text');
        $('#form-update-points input[name="points-value"]').removeAttr('step');
      }else{
        // Integer
        $('#form-update-points p.help-block[for="points-value"]').html("Value must be an <b>integer</b>");
        $('#form-update-points input[name="points-value"]').attr('type', 'number');
        $('#form-update-points input[name="points-value"]').attr('step', '1');
      }
    }else{
      $("#form-conditional-update-points").addClass('hidden');
    }
  }
}

// Initialize/reload the delete object form
function loadDeleteObjectForms(){
  // Clear the object id option
  $('#form-delete-object select[name="object-id"] option').remove();
  // Populate the object id option
  if ( network.hasOwnProperty("objects") ) {
    for ( var object_id in network.objects ){
      $('#form-delete-object select[name="object-id"]').append('<option value="'+object_id+'">'+object_id+'</option>');
    }
  }

  // Set warning message
  var selected_object_id = $( "option:selected", $('#form-delete-object select[name="object-id"]') ).val();
  var object = network_id+'.'+selected_object_id;
  var message = $("<p>Do you want to delete "+object+"?</p>\
  <p>All associated streams and points will also be deleted.</p>\
  <p>This action cannot be undone.</p>");
  $("#modal-body-delete-object").html( message );
}

// Initialize/reload the delete stream form
function loadDeleteStreamsForms(){
  // Clear the object id and stream id options
  $('#form-delete-stream select[name="object-id"] option').remove();
  $('#form-delete-stream select[name="stream-id"] option').remove();

  if ( network.hasOwnProperty("objects") ) {
    // Populate the object id option
    for ( var object_id in network.objects ){
      $('#form-delete-stream select[name="object-id"]').append('<option value="'+object_id+'">'+object_id+'</option>');
    }

    var selected_object_id = $( "option:selected", $('#form-delete-stream select[name="object-id"]') ).val();
    if( selected_object_id in network.objects &&
        network.objects[selected_object_id].hasOwnProperty("streams") &&
        Object.keys( network.objects[selected_object_id].streams ).length > 0 ) {

      // Show stream portion of form
      $("#form-conditional-delete-stream").removeClass('hidden');

      // Populate the stream id option
      for ( var stream_id in network.objects[selected_object_id].streams ){
        $('#form-delete-stream select[name="stream-id"]').append('<option value="'+stream_id+'">'+stream_id+'</option>');
      }

      // Set warning message
      var selected_stream_id = $( "option:selected", $('#form-delete-stream select[name="stream-id"]') ).val();
      var stream = network_id+'.'+selected_object_id+"."+selected_stream_id;
      var message = $("<p>Do you want to delete "+stream+"?</p>\
      <p>All associated points will also be deleted.</p>\
      <p>This action cannot be undone.</p>");
      $("#modal-body-delete-stream").html( message );
    }else{
      $("#form-conditional-delete-stream").addClass('hidden');
    }
  }
}




/*
  Add functionality to the dashboard panels
*/
function panelClickResponse(e){
  // Prevent browser from opening link
  e.preventDefault();
  // Reset
  view_stream = [];

  // Select current element
  var $this = $(this);
  var id = $this.attr('id');
  var id_array = id.split('-');
  var select = id_array[1];

  // Remove the class 'active' from all elements
  $('#dashboard-sidebar-nav a.active').removeClass('active');
  // Add the class 'active' to current element
  $('#dashboard-sidebar-nav a#sidebar-'+select).addClass('active');

  // Hide/Show pages
  $('div#wrapper div.page').addClass('hidden');
  $('div#wrapper div#page-'+select).removeClass('hidden');

  // Remove any alerts, if applicable
  $('.alert', $('div#wrapper div#page-'+select)).remove();

  /*
  if( select == 'dashboard' ){
    $('div#dashboard-sidebar-nav').addClass('hidden');
    $('div#page-wrapper').addClass('full-width');
  }else{
    $('div#dashboard-sidebar-nav').removeClass('hidden');
    $('div#page-wrapper').removeClass('full-width');
  }
  */

  // Load the relevant forms
  if( select == 'view' ){
    $("div.page-view-object").addClass('hidden');
    $("div.page-view-stream").addClass('hidden');
    $("div.page-view-network").removeClass('hidden');

    $("div.page-view-network .network-name span").text( network['network-details']['network-name'] );
    $("div.page-view-network .network-id span").text( network['network-id'] );
    if ( network.hasOwnProperty("objects") ) {
      $("div.page-view-network .network-objects span").text( Object.keys( network.objects ).length );
    }
    else{
      $("div.page-view-network .network-objects span").text( 0 );
    }
  }
  else if( select == 'create' ){
    loadCreateStreamForms();
  }
  else if( select == 'update' ){
    loadUpdateObjectForms();
    loadUpdateStreamsForms();
    loadUpdatePointsForms();
  }
  else if( select == 'delete' ){
    loadDeleteObjectForms();
    loadDeleteStreamsForms();
  }

}


function sidebarClickResponse(e) {
  // Prevent browser from opening link
  e.preventDefault();
  // Reset
  view_stream = [];

  // Select current element
  var $this = $(this);
  var id = $this.attr('id');
  var id_array = id.split('-');
  var select = id_array[1];

  // Remove the class 'active' from all elements
  $('#dashboard-sidebar-nav a.active').removeClass('active');
  // Add the class 'active' to current element
  $this.addClass('active');

  // Hide/Show pages
  $('div#wrapper div.page').addClass('hidden');
  $('div#wrapper div#page-'+select).removeClass('hidden');

  // Remove any alerts, if applicable
  $('.alert', $('div#wrapper div#page-'+select)).remove();

  /*
  if( select == 'dashboard' ){
    $('div#dashboard-sidebar-nav').addClass('hidden');
    $('div#page-wrapper').addClass('full-width');
  }else{
    $('div#dashboard-sidebar-nav').removeClass('hidden');
    $('div#page-wrapper').removeClass('full-width');
  }
  */

  // Load the relevant forms
  if( select == 'view' ){
    $("div.page-view-object").addClass('hidden');
    $("div.page-view-stream").addClass('hidden');
    $("div.page-view-network").removeClass('hidden');

    $("div.page-view-network .network-name span").text( network['network-details']['network-name'] );
    $("div.page-view-network .network-id span").text( network['network-id'] );
    if ( network.hasOwnProperty("objects") ) {
      $("div.page-view-network .network-objects span").text( Object.keys( network.objects ).length );
    }
    else{
      $("div.page-view-network .network-objects span").text( 0 );
    }
  }
  else if( select == 'create' ){
    loadCreateStreamForms();
  }
  else if( select == 'update' ){
    loadUpdateObjectForms();
    loadUpdateStreamsForms();
    loadUpdatePointsForms();
  }
  else if( select == 'delete' ){
    loadDeleteObjectForms();
    loadDeleteStreamsForms();
  }
  else if ( jQuery.isFunction( custom_sidebar_link_callback ) ){
    // For custom sidebar link(s)
    custom_sidebar_link_callback( select );
  }
}

/*
  Add functionality to the view links within the sidebar
*/
function loadViewSideBarNav(){

  var sidebar_view_objects_link = $('a#sidebar-view');
  sidebar_view_objects_link.html('<i class="fa fa-sitemap fa-fw"></i>  View');
  // Remove existing list, if necessary
  $('#sidebar\\:view\\:'+network_id+'\\:objects').remove();

  // For each "object" in the "network"
  if ( network.hasOwnProperty("objects") && Object.keys( network.objects ).length > 0 ) {
    sidebar_view_objects_link.html('<i class="fa fa-sitemap fa-fw"></i>  View<span class="fa arrow"></span>');
    var sidebar_view_object_list = $('<ul class="nav nav-second-level" id="sidebar:view:'+network_id+':objects"></ul><!-- /.nav-second-level -->');
    sidebar_view_objects_link.after( sidebar_view_object_list );

    for ( var object_id in network.objects ){
      //console.log( object_id );
      if ( network.objects.hasOwnProperty(object_id) ) {
        var object_name = network.objects[object_id]['object-details']['object-name'];
        var sidebar_view_object_link;
        // For each "stream" in the "object"
        if ( network.objects[object_id].hasOwnProperty("streams") && Object.keys( network.objects[object_id].streams ).length > 0 ) {
          sidebar_view_object_link = $( '<li><a href="view" id="sidebar:view:'+network_id+':'+object_id+'"><i class="fa fa-sitemap fa-fw"></i> '+object_name+' <br><small>'+object_id+'<small><span class="fa arrow"></span></a></li>' );
          var sidebar_view_stream_list = $('<ul class="nav nav-third-level" id="sidebar:view:'+object_id+':streams"></ul><!-- /.nav-third-level -->');
          for ( var stream_id in network.objects[object_id].streams ){
            //console.log( stream_id );
            if ( network.objects[object_id].streams.hasOwnProperty(stream_id) ) {
              var stream_name = network.objects[object_id].streams[stream_id]['stream-details']['stream-name'];
              sidebar_view_stream_list.append( '<li><a href="view" id="sidebar:view:'+network_id+':'+object_id+':'+stream_id+'"><i class="fa fa-line-chart fa-fw"></i> '+stream_name+' <br><small>'+stream_id+'</small></a></li>' );
            }
          }
          sidebar_view_object_link.append( sidebar_view_stream_list );
        }else{
          sidebar_view_object_link = $( '<li><a href="view" id="sidebar:view:'+network_id+':'+object_id+'"><i class="fa fa-sitemap fa-fw"></i> '+object_name+' <br><small>'+object_id+'</small></a></li>' );
        }
        sidebar_view_object_list.append( sidebar_view_object_link );
      }
    }

    // Add functionality to the sidebar
    $('a', sidebar_view_object_list).click(function(e) {
      // Prevent browser from opening link
      e.preventDefault();
      // Reset
      view_stream = [];

      // Select current element
      var $this = $(this);
      var id = $this.attr('id');
      var id_array = id.split(':');
      var select = id_array[1];

      if( id_array.length == 4 ){
        var object_id = id_array[3];
        $('form#form-view-object input[name="object-id"]').attr( 'value', object_id );

        $("div.page-view-network").addClass('hidden');
        $("div.page-view-stream").addClass('hidden');
        $("div.page-view-object").removeClass('hidden');

        $("div.page-view-object .object-name span").text( network.objects[object_id]['object-details']['object-name'] );
        $("div.page-view-object .object-id span").text( object_id );
        if ( network.objects[object_id].hasOwnProperty("streams") ) {
          $("div.page-view-object .object-streams span").text( Object.keys( network.objects[object_id].streams ).length );
        }
        else{
          $("div.page-view-object .object-streams span").text( 0 );
        }
      }else if( id_array.length == 5 ){
        var object_id = id_array[3];
        var stream_id = id_array[4];
        $('form#form-view-stream input[name="object-id"]').attr( 'value', object_id );
        $('form#form-view-stream input[name="stream-id"]').attr( 'value', stream_id );
        $('form#form-view-points input[name="object-id"]').attr( 'value', object_id );
        $('form#form-view-points input[name="stream-id"]').attr( 'value', stream_id );

        $("div.page-view-network").addClass('hidden');
        $("div.page-view-object").addClass('hidden');
        $("div.page-view-stream").removeClass('hidden');

        $("div.page-view-stream .stream-name span").text( network.objects[object_id].streams[stream_id]['stream-details']['stream-name'] );
        $("div.page-view-stream .stream-id span").text( stream_id );
        $("div.page-view-stream .stream-type span").text( network.objects[object_id].streams[stream_id]['stream-details']['stream-type'] );

        // Record which stream is being viewed
        view_stream = [network_id, object_id, stream_id];

        if( !network.objects[object_id].streams[stream_id].hasOwnProperty("points") ||
            network.objects[object_id].streams[stream_id].points.length == 0 ) {

          $('.page-view-stream.points-table').addClass('hidden');
          $('.page-view-stream.points-plot').addClass('hidden');
        }
        else if( network.objects[object_id].streams[stream_id]['points-details']['points-type'] == 'i' ||
            network.objects[object_id].streams[stream_id]['points-details']['points-type'] == 'f' ){

          reloadPointsPlot( network_id, object_id, stream_id );

          $('.page-view-stream.points-table').addClass('hidden');
          $('.page-view-stream.points-plot').removeClass('hidden');
        }
        else{

          reloadPointsTable( network_id, object_id, stream_id );

          $('.page-view-stream.points-plot').addClass('hidden');
          $('.page-view-stream.points-table').removeClass('hidden');
        }
      }

      // Remove the class 'active' from all elements
      $('#dashboard-sidebar-nav a.active').removeClass('active');
      // Add the class 'active' to current element
      $this.addClass('active');

      // Hide/Show pages
      $('div#wrapper div.page').addClass('hidden');
      $('div#wrapper div#page-view').removeClass('hidden');

      // Remove any alerts, if applicable
      $('.alert', $('div#wrapper div#page-'+select)).remove();

    });
  }

  // Load/reload Metis Menu plugin
  $('#side-menu').metisMenu();

}



//
//  Function for loading data from the DBNanoServer API
//
function loadNetwork(){
  // Use .ajax() to make an HTTP request from JS
  $.ajax({
    url: '/networks/'+network_id,
    type: 'get',
    cache: false,
    success: function(response_data) {
      // Called when successful
      // console.log( response_data );
      // Store response
      network = response_data;
      //console.log(network);
      loadViewSideBarNav();
    },
    error: function(e) {
      // Called when there is an error
      console.log(e.message);
    }
  });
}

//
//  Function for loading a plot
//
function loadPointsPlot(){
  // Create plot container
  var streamPlot = $('#page-view-points-plot');

  var timezone = '';
  try{
    timezone = /\((.*)\)/.exec(new Date().toString())[1];
    timezone = ' ('+timezone+')';
  }catch(err){
    // Do nothing
  }

  // Load Highcharts
  streamPlot.highcharts({
    chart: {
        type: 'spline',
        zoomType: 'x'
    },
    title: {
        text: ''
    },
    subtitle: {
        text: ''
    },
    xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: { // don't display the dummy year
            month: '%e. %b',
            year: '%b'
        },
        title: {
            text: 'Date'+timezone
        }
    },
    yAxis: {
        title: {
            text: ''
        }
    },
    plotOptions: {
        spline: {
            marker: {
                enabled: true
            }
        }
    }
  });
}

//
//  Function reloading the points plot
//  by retrieving most recent data from WCC server.
//
function reloadPointsPlot( network_id, object_id, stream_id ){
  // Send the request to the WCC server
  $.ajax({
    url : '/networks/'+network_id+'/objects/'+object_id+'/streams/'+stream_id+'/points?limit=100',
    type: "get",
    cache: false,
    data: {},
    success : function(response){
      if( response['points-code'] == 200 ){
        var points = response.points;
        // Iterate over points to place in Highcharts format
        var datapoints = [];
        for ( var i = 0; i < points.length; i++){
          var at_date = new Date(points[i].at);
          var at = at_date.getTime() - at_date.getTimezoneOffset()*60*1000;
          datapoints.unshift( [ at, points[i].value] );
        }

        // Update Highcharts plot
        var streamPlot = $('#page-view-points-plot');
        if( streamPlot.highcharts().series.length > 0 ){
          streamPlot.highcharts().series[0].setData( datapoints );
        }else{
          streamPlot.highcharts().addSeries({
            name: stream_id,
            data: datapoints
          });
        }
      }else{
        // Something went wrong
      }
    },
    error : function(jqXHR, textStatus, errorThrown){
      // Called when there is an error
      console.log(jqXHR.message);
    }
  });
}

//
//  Function reloading the points table
//  by retrieving most recent data from WCC server.
//
function reloadPointsTable( network_id, object_id, stream_id ){
  var tbody = $('div#page-view-points-table tbody')
  // Send the request to the WCC server
  $.ajax({
    url : '/networks/'+network_id+'/objects/'+object_id+'/streams/'+stream_id+'/points?limit=20',
    type: "get",
    cache: false,
    data: {},
    success : function(response){
      tbody.html('');
      if( response['points-code'] == 200 ){
        var points = response.points;
        // Iterate over points to populate the table.
        for ( var i = 0; i < points.length; i++){
          tbody.append(
            '<tr><td>'+points[i].value+'</td>'+
            '<td>'+points[i].at+'</td>'+
            '<td>'+(new Date(points[i].at)).toLocaleString()+'</td></tr>'
          );
        }
      }else{
        // Something went wrong
      }
    },
    error : function(jqXHR, textStatus, errorThrown){
      tbody.html('');
      // Called when there is an error
      console.log(jqXHR.message);
    }
  });
}

// Attach datetimepicker plugin
$('.datetimepicker').datetimepicker({
  format:'Y-m-d H:i:s T',
  onChangeDateTime:function(dp,$input){
    if(!!dp){
      $input.nextAll('p:first').text( 'Converted to ISO 8601 Format: '+dp.toISOString() );
    }else{
      $input.nextAll('p:first').text('');
    }
  }
});
