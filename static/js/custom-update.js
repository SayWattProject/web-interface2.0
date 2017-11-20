$(document).ready(function(){
/*
  Add functionality to the update object form

*/
$("form#form-update-object").submit(function(e){
  e.preventDefault();

  // Gather the data
  // and remove undefined keys(buttons)
  var data = {};
  $('input',this).each( function(i, v){
    var input = $(v);
    data[input.attr("name")] = input.val();
  });
  $('select',this).each( function(i, v){
    var input = $(v);
    data[input.attr("name")] = input.val();
  });
  delete data["undefined"];


  // Form Validation goes here....


  // Don't include id in query string
  var object_id = data["object-id"];
  delete data["object-id"];

  // Send the request to the WCC server
  $.ajax({
    url : '/networks/'+network_id+'/objects/'+object_id+'?'+$.param(data),
    type: "post",
    success : function(response){
      var this_form = $("form#form-update-object");
      var message = $('<div class="alert" style="margin-top:20px"></div>');
      var req = $('<pre class="language-"><b>POST</b> '+this.url+'</pre>');

      if( response['object-code'] == 200 ){
        // Start Success message
        message.addClass('alert-success');
        message.append("<h4>Success!</h4>");
        req.css({ 'color': '#3c763d' });

        if (enable_ws == true) {
          // Use WebSocket message to update client-side
        }else{
          // Update object client-side
          doUpdateObject( response );
        }

        // Don't reset form

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
      json_code = $('<pre class="language-javascript"><code class="language-javascript">'+JSON.stringify(response,null,4)+'</code></pre>');
      message.append( json_code );

      // Highlight with Prism
      Prism.highlightElement(json_code[0] );

      // Add/Replace Alert message
      if ( $('.alert', this_form).length ) {
        $('.alert', this_form).replaceWith( message );
      }else{
        this_form.append(message);
      }
    },
    error : function(jqXHR, textStatus, errorThrown){
      var this_form = $("form#form-update-object");

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
});

/*
  Add functionality to the update create form

*/
$("form#form-update-stream").submit(function(e){
  e.preventDefault();

  // Gather the data
  // and remove undefined keys(buttons)
  var data = {}
  $('input',this).each( function(i, v){
    var input = $(v);
    data[input.attr("name")] = input.val();
  });
  $('select',this).each( function(i, v){
    var input = $(v);
    data[input.attr("name")] = input.val();
  });
  delete data["undefined"];


  // Form Validation goes here....


  // Don't include ids in query string
  object_id = data["object-id"];
  delete data["object-id"];
  stream_id = data["stream-id"];
  delete data["stream-id"];

  // Send the request to the WCC server
  $.ajax({
    url : '/networks/'+network_id+'/objects/'+object_id+'/streams/'+stream_id+'?'+$.param(data),
    type: "post",
    success : function(response){
      var this_form = $("form#form-update-stream");
      var message = $('<div class="alert" style="margin-top:20px"></div>');
      var req = $('<pre class="language-"><b>POST</b> '+this.url+'</pre>');

      if( response['stream-code'] == 200 ){
        // Start Success message
        message.addClass('alert-success');
        message.append("<h4>Success!</h4>");
        req.css({ 'color': '#3c763d' });

        if (enable_ws == true) {
          // Use WebSocket message to update client-side
        }else{
          // Update stream client-side
          doUpdateStream( response );
        }

        // Don't reset form

      }else{
        // Start Danger message
        message.addClass('alert-danger');
        message.append("<h4>Error</h4>");
      }

      // Add Request message
      message.append('<p>Request</p>');
      message.append( req );

      // Add Response message
      message.append('<p>Response</p>');
      json_code = $('<pre class="language-javascript"><code class="language-javascript">'+JSON.stringify(response,null,4)+'</code></pre>');
      message.append( json_code );

      // Highlight with Prism
      Prism.highlightElement(json_code[0] );

      // Add/Replace Alert message
      if ( $('.alert', this_form).length ) {
        $('.alert', this_form).replaceWith( message );
      }else{
        this_form.append(message);
      }
    },
    error : function(jqXHR, textStatus, errorThrown){
      var this_form = $("form#form-update-stream");

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
});

/*
  Add functionality to the update points form

*/
$("form#form-update-points").submit(function(e){
  e.preventDefault();

  // Gather the data
  // and remove undefined keys(buttons)
  var data = {};
  $('input',this).each( function(i, v){
    var input = $(v);
    data[input.attr("name")] = input.val();
  });
  $('select',this).each( function(i, v){
    var input = $(v);
    data[input.attr("name")] = input.val();
  });
  delete data["undefined"];

  // Form Validation goes here....
  var points_type = network.objects[data["object-id"]].streams[data["stream-id"]]['points-details']['points-type'];
  if( points_type == 'f' ){
    data["points-value"] = parseFloat( data["points-value"] );
  }else if( points_type == 'i' ){
    data["points-value"] = parseInt( data["points-value"] );
  }

  try{
    var at = new Date( data["points-at"] );
    data["points-at"] = at.toISOString();
    /*data["points-at"] = data["points-at"].replace(/\./g,'');
    data["points-at"] = data["points-at"].replace(/:/g,'');
    data["points-at"] = data["points-at"].replace(/-/g,'');*/
  }catch(err){
    delete data["points-at"];
  }


  // Check point value
  if( points_type == 'f' && data["points-value"] === +data["points-value"] && data["points-value"] !== (data["points-value"]|0) ){
    // Point value is float. Do nothing.
  }
  else if( points_type == 'f' && data["points-value"] === +data["points-value"] && data["points-value"] === (data["points-value"]|0) ){
    // Expected float but got integer. We will accept it.
  }
  else if( points_type == 'i' && data["points-value"] === +data["points-value"] && data["points-value"] === (data["points-value"]|0) ){
    // Point value is integer. Do nothing.
  }
  else if( points_type == 's' && (typeof data["points-value"] === 'string' || data["points-value"] instanceof String) ){
    // Point value is string. Do nothing.
  }else{
    // Something is wrong.
    return
  }

  // Don't include ids in query string
  object_id = data["object-id"];
  delete data["object-id"];
  stream_id = data["stream-id"];
  delete data["stream-id"];

  // Send the request to the WCC server
  $.ajax({
    url: '/networks/'+network_id+'/objects/'+object_id+'/streams/'+stream_id+'/points?'+$.param(data),
    type: "post",
    success: function(response){
      var this_form = $("form#form-update-points");
      var message = $('<div class="alert" style="margin-top:20px"></div>');
      var req = $('<pre class="language-"><b>POST</b> '+this.url+'</pre>');

      if( response['points-code'] == 200 ){
        // Start Success message
        message.addClass('alert-success');
        message.append("<h4>Success!</h4>");
        req.css({ 'color': '#3c763d' });

        if (enable_ws == true) {
          // Use WebSocket message to update client-side
        }else{
          // Update points client-side
          doUpdatePoints( response );
        }

        // Don't reset form

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
      json_code = $('<pre class="language-javascript"><code class="language-javascript">'+JSON.stringify(response,null,4)+'</code></pre>');
      message.append( json_code );

      // Highlight with Prism
      Prism.highlightElement( json_code[0] );

      // Add/Replace Alert message
      if ( $('.alert', this_form).length ) {
        $('.alert', this_form).replaceWith( message );
      }else{
        this_form.append(message);
      }
    },
    error : function(jqXHR, textStatus, errorThrown){
      var this_form = $("form#form-update-points");

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
});


// Make object update form interactive
$('#form-update-object select[name="object-id"]').change( function(e){
  // Remove alert, if applicable
  $('#form-update-object .alert').remove();
  // Set object name field given selected object
  var selected_object_id = $( "option:selected", this ).val();
  $('#form-update-object input[name="object-name"]').val( network.objects[selected_object_id]['object-details']['object-name'] );
});


// Make stream update form interactive
$('#form-update-stream select[name="object-id"]').change( function(e){
  // Remove alert, if applicable
  $('#form-update-stream .alert').remove();

  // Clear the stream id option
  $('#form-update-stream select[name="stream-id"] option').remove();

  var selected_object_id = $( "option:selected", this ).val();
  if( selected_object_id in network.objects &&
      network.objects[selected_object_id].hasOwnProperty("streams") &&
      Object.keys( network.objects[selected_object_id].streams ).length > 0 ) {

    // Populate the stream id option
    $("#form-conditional-update-stream").removeClass('hidden');
    for ( var stream_id in network.objects[selected_object_id].streams ){
      $('#form-update-stream select[name="stream-id"]').append('<option value="'+stream_id+'">'+stream_id+'</option>');
    }

    // Set stream name field given selected object and stream
    var selected_stream_id = $( "option:selected", $('#form-update-stream select[name="stream-id"]') ).val();
    if ( typeof selected_stream_id !== "undefined" ){
      $('#form-update-stream input[name="stream-name"]').val( network.objects[selected_object_id].streams[selected_stream_id]['stream-details']['stream-name'] );
    }
  }else{
    $("#form-conditional-update-stream").addClass('hidden');
  }
});

$('#form-update-stream select[name="stream-id"]').change( function(e){
  // Remove alert, if applicable
  $('#form-update-stream .alert').remove();
  // Set stream name field given selected object and stream
  var selected_object_id = $( 'option:selected', $('#form-update-stream select[name="object-id"]') ).val();
  var selected_stream_id = $( "option:selected", this ).val();
  $('#form-update-stream input[name="stream-name"]').val( network.objects[selected_object_id].streams[selected_stream_id]['stream-details']['stream-name'] );
});


// Make points update form interactive
$('#form-update-points select[name="object-id"]').change( function(e){
  // Remove alert, if applicable
  $('#form-update-points .alert').remove();

  // Clear the stream id option
  $('#form-update-points select[name="stream-id"] option').remove();

  var selected_object_id = $( "option:selected", this ).val();
  if( selected_object_id in network.objects &&
      network.objects[selected_object_id].hasOwnProperty("streams") &&
      Object.keys( network.objects[selected_object_id].streams ).length > 0 ) {

    // Populate the stream id option
    $("#form-conditional-update-points").removeClass('hidden');
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
});

$('#form-update-points select[name="stream-id"]').change( function(e){
  // Remove alert, if applicable
  $('#form-update-points .alert').remove();

  // Set the type of the point value field given selected object and stream
  var selected_object_id = $( 'option:selected', $('#form-update-points select[name="object-id"]') ).val();
  var selected_stream_id = $( "option:selected", this ).val();
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
});
});
