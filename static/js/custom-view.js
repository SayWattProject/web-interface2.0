$(document).ready(function(){
  /*
    Add functionality to the view network form
  */
  $("form#form-view-network").submit(function(e){
    e.preventDefault();

    // Send the request to the WCC server
    $.ajax({
      url : '/networks/'+network_id,
      type: "get",
      cache: false,
      data: {},
      success : function(response){
        var this_form = $("form#form-view-network");
        var message = $('<div class="alert" style="margin-top:20px"></div>');
        var url_array = this.url.split('?');
        var url = url_array[0]; // URL without '_' parameter
        var req = $('<pre class="language-"><b>GET</b> '+url+'</pre>');

        if( response['network-code'] == 200 ){
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
        var this_form = $("form#form-view-network");

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
    Add functionality to the view object form

  */
  $("form#form-view-object").submit(function(e){
    e.preventDefault();

    // Gather the data
    // and remove undefined keys(buttons)
    var data = {};
    $('input',this).each( function(i, v){
      var input = $(v);
      data[input.attr("name")] = input.val();
    })
    delete data["undefined"];

    // Send the request to the WCC server
    $.ajax({
      url : '/networks/'+network_id+'/objects/'+data["object-id"],
      type: "get",
      cache: false,
      data: {},
      success : function(response){
        var this_form = $("form#form-view-object");
        var message = $('<div class="alert" style="margin-top:20px"></div>');
        var url_array = this.url.split('?');
        var url = url_array[0]; // URL without '_' parameter
        var req = $('<pre class="language-"><b>GET</b> '+url+'</pre>');

        if( response['object-code'] == 200 ){
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
        var this_form = $("form#form-view-object");

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
    Add functionality to the view stream form

  */
  $("form#form-view-stream").submit(function(e){
    e.preventDefault();

    // Gather the data
    // and remove undefined keys(buttons)
    var data = {};
    $('input',this).each( function(i, v){
      var input = $(v);
      data[input.attr("name")] = input.val();
    })
    delete data["undefined"];

    // Send the request to the WCC server
    $.ajax({
      url : '/networks/'+network_id+'/objects/'+data["object-id"]+'/streams/'+data["stream-id"],
      type: "get",
      cache: false,
      data: {},
      success : function(response){
        var this_form = $("form#form-view-stream");
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
        var this_form = $("form#form-view-stream");

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
    Add functionality to the view points form

  */
  $("form#form-view-points").submit(function(e){
    e.preventDefault();

    // Gather the data
    // and remove undefined keys(buttons)
    var data = {};
    $('input',this).each( function(i, v){
      var input = $(v);
      data[input.attr("name")] = input.val();
      if( data[input.attr("name")] == ''){
        delete data[input.attr("name")];
      }
    });
    delete data["undefined"];


    // Form Validation goes here....
    try{
      var at = new Date( data["points-start"] );
      data["points-start"] = at.toISOString();
    }catch(err){
      delete data["points-start"];
    }
    try{
      var at = new Date( data["points-end"] );
      data["points-end"] = at.toISOString();
    }catch(err){
      delete data["points-end"];
    }


    // Don't include ids in query string
    object_id = data["object-id"];
    delete data["object-id"];
    stream_id = data["stream-id"];
    delete data["stream-id"];

    var query = '';
    if( Object.keys(data).length > 0 ){
      query = '?'+$.param(data);
    }

    // Send the request to the WCC server
    $.ajax({
      url : '/networks/'+network_id+'/objects/'+object_id+'/streams/'+stream_id+'/points'+query,
      type: "get",
      cache: true,
      data: {},
      success : function(response){
        var this_form = $("form#form-view-points");
        var message = $('<div class="alert" style="margin-top:20px"></div>');
        var req = $('<pre class="language-"><b>GET</b> '+this.url+'</pre>');

        if( response['points-code'] == 200 ){
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
        var this_form = $("form#form-view-points");

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
