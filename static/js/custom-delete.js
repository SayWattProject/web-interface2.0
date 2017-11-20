$(document).ready(function(){
/*
  Add functionality to the delete object form
*/
$("form#form-delete-object").submit(function(e){
  e.preventDefault();

  // Hide the delete warning modal
  $('#modal-delete-object').modal('hide');

  // Gather the data
  // and remove undefined keys(buttons)
  var data = {};
  $('select',this).each( function(i, v){
    var input = $(v);
    data[input.attr("name")] = input.val();
  });
  delete data["undefined"];


  // Form Validation goes here....


  // Send the request to the WCC server
  $.ajax({
    url : '/networks/'+network_id+'/objects/'+data["object-id"],
    type: "delete",
    success : function(response){
      var this_form = $("form#form-delete-object");
      var message = $('<div class="alert" style="margin-top:20px"></div>');
      var req = $('<pre class="language-"><b>DELETE</b> '+this.url+'</pre>');

      if( response['object-code'] == 200 ){
        // Start Success message
        message.addClass('alert-success');
        message.append("<h4>Success!</h4>");
        req.css({ 'color': '#3c763d' });

        if (enable_ws == true) {
          // Use WebSocket message to update client-side
        }else{
          // Delete object client-side
          doDeleteObject( response );
        }

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
      var this_form = $("form#form-delete-object");

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
  Add functionality to the delete stream form

*/
$("form#form-delete-stream").submit(function(e){
  e.preventDefault();

  // Hide the delete warning modal
  $('#modal-delete-stream').modal('hide');

  // Gather the data
  // and remove undefined keys(buttons)
  var data = {};
  $('select',this).each( function(i, v){
    var input = $(v);
    data[input.attr("name")] = input.val();
  });
  delete data["undefined"];


  // Form Validation goes here....


  // Send the request to the WCC server
  $.ajax({
    url : '/networks/'+network_id+'/objects/'+data["object-id"]+'/streams/'+data["stream-id"],
    type: "delete",
    success : function(response){
      var this_form = $("form#form-delete-stream");
      var message = $('<div class="alert" style="margin-top:20px"></div>');
      var req = $('<pre class="language-"><b>DELETE</b> '+this.url+'</pre>');

      if( response['stream-code'] == 200 ){
        // Start Success message
        message.addClass('alert-success');
        message.append("<h4>Success!</h4>");
        req.css({ 'color': '#3c763d' });

        if (enable_ws == true) {
          // Use WebSocket message to update client-side
        }else{
          // Delete stream client-side
          doDeleteStream( response );
        }

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
      var this_form = $("form#form-delete-stream");

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


// Make object delete form interactive
$('#form-delete-object select[name="object-id"]').change( function(e){
  // Remove alert, if applicable
  $('#form-delete-object .alert').remove();
  // Set warning message
  var selected_object_id = $( "option:selected", this ).val();
  var object = network_id+'.'+selected_object_id;
  var message = $("<p>Do you want to delete "+object+"?</p>\
  <p>All associated streams and points will also be deleted.</p>\
  <p>This action cannot be undone.</p>");
  $("#modal-body-delete-object").html( message );
});


// Make stream delete form interactive
$('#form-delete-stream select[name="object-id"]').change( function(e){
  // Remove alert, if applicable
  $('#form-delete-stream .alert').remove();

  // Clear the stream id option
  $('#form-delete-stream select[name="stream-id"] option').remove();

  var selected_object_id = $( "option:selected", this ).val();
  if( selected_object_id in network.objects &&
      network.objects[selected_object_id].hasOwnProperty("streams") &&
      Object.keys( network.objects[selected_object_id].streams ).length > 0 ) {

    // Populate the stream id option
    $("#form-conditional-delete-stream").removeClass('hidden');
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
});

$('#form-delete-stream select[name="stream-id"]').change( function(e){
  // Remove alert, if applicable
  $('#form-delete-stream .alert').remove();
  // Set warning message
  var selected_object_id = $( 'select[name="object-id"] option:selected' ).val();
  var selected_stream_id = $( "option:selected", this ).val();
  var stream = network_id+'.'+selected_object_id+"."+selected_stream_id;
  var message = $("<p>Do you want to delete "+stream+"?</p>\
  <p>All associated points will also be deleted.</p>\
  <p>This action cannot be undone.</p>");
  $("#modal-body-delete-stream").html( message );
});


});
