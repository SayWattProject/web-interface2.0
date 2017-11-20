$(document).ready(function(){
/*
  Add functionality to the create object form

*/
$("form#form-create-object").submit(function(e){
  e.preventDefault();

  // Gather the data
  // and remove undefined keys(buttons)
  var data = {};
  $('input',this).each( function(i, v){
    var input = $(v);
    data[input.attr("name")] = inpatomut.val();
  })
  delete data["undefined"];


  // Form Validation goes here....

  // Remove prohibited characters from object id
  object_id = data["object-id"].replace(/[^a-z0-9\-\_]/gi,'');
  if( object_id.length != data["object-id"].length ){
    $("form#form-create-object input[name='oi']").val( object_id );
  }

  // Don't include id in query string
  delete data["object-id"];

  // Send the request to the WCC server
  $.ajax({
    url : '/networks/'+network_id+'/objects/'+object_id+'?'+$.param(data),
    type: "put",
    success : function(response){
      var this_form = $("form#form-create-object");
      var message = $('<div class="alert" style="margin-top:20px"></div>');
      var req = $('<pre class="language-"><b>PUT</b> '+this.url+'</pre>');

      if( response['object-code'] == 201 ){
        // Start Success message
        message.addClass('alert-success');
        message.append("<h4>Success!</h4>");
        req.css({ 'color': '#3c763d' });

        if (enable_ws == true) {
          // Use WebSocket message to update client-side
        }else{
          // Create object client-side
          doCreateObject( response );
        }

        // Clear the create object form
        this_form.trigger("reset");

      }else if( response['object-code'] == 304 ){
        // Start Info message
        message.addClass('alert-info');
        message.append("<h4>Request Not Completed</h4>");
        req.css({ 'color': '#31708f' });
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
      var this_form = $("form#form-create-object");

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
  Add functionality to the create stream form

*/
$("form#form-create-stream").submit(function(e){
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

  // Remove prohibited characters from stream id
  stream_id = data["stream-id"].replace(/[^a-z0-9\-\_]/gi,'');
  if( stream_id.length != data["stream-id"].length ){
    $("form#form-create-stream input[name='si']").val( stream_id );
  }

  // Don't include ids in query string
  object_id = data["object-id"];
  delete data["object-id"];
  delete data["stream-id"];

  // Send the request to the WCC server
  $.ajax({
    url : '/networks/'+network_id+'/objects/'+object_id+'/streams/'+stream_id+'?'+$.param(data),
    type: "put",
    success : function(response){
      var this_form = $("form#form-create-stream");
      var message = $('<div class="alert" style="margin-top:20px"></div>');
      var req = $('<pre class="language-"><b>PUT</b> '+this.url+'</pre>');

      if( response['stream-code'] == 201 ){
        // Start Success message
        message.addClass('alert-success');
        message.append("<h4>Success!</h4>");
        req.css({ 'color': '#3c763d' });

        if (enable_ws == true) {
          // Use WebSocket message to update client-side
        }else{
          // Create stream client-side
          doCreateStream( response );
        }

        // Clear the form
        this_form.trigger("reset");

      }else if( response['stream-code'] == 304 ){
        // Start Info message
        message.addClass('alert-info');
        message.append("<h4>Request Not Completed</h4>");
        req.css({ 'color': '#31708f' });
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
      Prism.highlightElement(json_code[0]);

      // Add/Replace Alert message
      if ( $('.alert', this_form).length ) {
        $('.alert', this_form).replaceWith( message );
      }else{
        this_form.append(message);
      }
    },
    error : function(jqXHR, textStatus, errorThrown){
      var this_form = $("form#form-create-stream");

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
});
