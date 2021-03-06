// var global_comment_profile_image_height = "45";
// var global_post_profile_image_height = "80";
var global_unhearted_class = 'glyphicon glyphicon-heart-empty button';
var global_hearted_class = 'glyphicon glyphicon-heart button';
var global_delete_class = 'fa fa-trash';
var global_logged_in_username = '';

function getSpinner() {
	return $("<i>", { class: "fa fa-circle-o-notch fa-spin", id: "post_spinner", }).css("font-size", "54px");
}

class PostManager {
	constructor(id_container, filter_object, logged_in_username) {
		this.id_container = id_container;
		this.filter_object = filter_object;
		this.logged_in_username = logged_in_username;
		this.rendered_post_id = -1;
		this.ajax_post_requesting = false;
		this.reached_bottom = false;

		this.renderPost();

		$(window).scroll(
			(function () {
				if (this.ajax_post_requesting) return;
				if ($(window).scrollTop() + $(window).height() == $(document).height()) {
					this.renderPost();
				}
			}).bind(this)
		);
	}

	setRenderedPostID(post_id) {
		this.rendered_post_id = post_id;
	}

	renderPost() {
		this.ajax_post_requesting = true;
		// end case
		if (this.reached_bottom) { 
			this.ajax_post_requesting = false;
			return; 
		}

		// first time loading in
		if (this.rendered_post_id == -1) {
			this.handleRenderPostCallback();
		}

		// ajax continue loading in
		else {
			this.filter_object['id__lt'] = this.rendered_post_id;
			this.handleRenderPostCallback();
		}
	}

	handleRenderPostCallback() {
		render_post(this.id_container, this.filter_object, this.logged_in_username, (json_data) => {
			if (json_data.posts.length == 0) {
				this.reached_bottom = true
			} else {
				this.rendered_post_id = json_data.posts[json_data.posts.length - 1]["post_id"]
			}
			this.ajax_post_requesting = false;
		});
	}
}

// this is the starter of the whole render chain functions
function render_post(id_container, filter_object, logged_in_username, callback) {
	if (!logged_in_username || logged_in_username == "") return;
	// insert spinner
	if (!document.getElementById("post_spinner")) {
		$("#" + id_container).after(
			getSpinner()
		);
	}

	global_logged_in_username = logged_in_username;

	// acquire post data for rendering
	var request_url = '/post_db/';
	var request_json;

	request_json = {
		"request_type": "get_post",
		"filter": filter_object,
	};

	// render tab content = render all posts
	$.ajax({
		type: "POST",
		url: request_url,
		data: JSON.stringify(request_json),
		dataType: "JSON", /* this specify the returned object type */
		contentType: "application/json",
	})
		.done(function (json_data) {
			handle_incoming_post_data(json_data, id_container, callback);
			if (callback) callback(json_data);
		})
		.fail(ajax_fail_handler);
}

function handle_incoming_post_data(json_data, id_container, callback) {
	var json_object = json_data;
	if (json_object.posts.length == 0 && ($("#"+id_container).children(".a_post").length == 0) ) {
		// handle case that no post is returned
		$("<div>", {
			'class': 'alert alert-info',
			'html': 'no post',
		}).appendTo("#" + id_container)
	}
	else {
		// rander out all the posts
		render_post_body(json_object, id_container);
	}
	$("#post_spinner").remove();
}

function render_post_body(json_data, id_container) {

	// render post data
	// we will have the following fields to render for each post:
	// post tile, video url, post message, comments, likes, user

	// iterate the json object, and render out the post
	// console.log(json_data);
	json_data.posts.forEach(function (obj) {

		// render post main
		post_id = obj['post_id'];
		$post_main = $("<div>", {
			'class': 'row panel panel-default a_post',
		}).appendTo("#" + id_container);

		// left side - post profile
		$post_profile = $("<div>", {
			'class': 'col-xs-2 panel-body',
		}).appendTo($post_main);
		render_post_profile(obj, $post_profile);

		// rightside - post field := {video, post messange, comment}
		$post_field_col = $("<div>", {
			'class': 'col-xs-10',
		}).appendTo($post_main);
		// rightside - video view
		$post_video = $("<div>", {
			'class': 'row',
		}).appendTo($post_field_col);
		$video_col = $("<div>", {
			'class': 'col-xs-12',
		}).appendTo($post_video);
		render_post_video(obj, $video_col);
		// rightside - post message
		$post_message = $("<div>", {
			'class': 'row panel-body',
		}).appendTo($post_field_col);
		$post_message_col = $("<div>", {
			'class': 'col-xs-12',
		}).appendTo($post_message);
		render_post_message(obj, $post_message_col);
		// rightside - comment
		$comment_field = $("<div>", {
			'class': 'row panel-body',
		}).appendTo($post_field_col);
		$comment_field_col = $("<div>", {
			'class': 'col-xs-12',
		}).appendTo($comment_field);
		render_post_comment(obj, $comment_field_col);

	});// a post render ended

}// home tab all posts render ended

function render_post_profile(post_data, $post_profile_container) {
	// Split into {like, title} and {pic, username, message}
	post_id = post_data['post_id'];
	// id_field_title_bar =  post_id + "_field_title_bar";
	// id_field_content = post_id + "_field_content";

	// {pic, username, message} := content
	$field_content = $("<div>", {
		'class': 'row',
	}).appendTo($post_profile_container);
	// Split into {pic, username}
	// {pic, username} := user
	$field_user = $("<div>", {
		'class': 'col-xs-12 text-center',
		// 'id':id_field_user,
	}).appendTo($field_content);

	// Split into {pic}, {username}
	// id_field_pic = post_id + "_field_pic";
	// id_field_username = post_id + "_field_username";
	// {pic}
	$field_pic = $("<div>", {
		'class': 'row field_pic',
		// 'id':id_field_pic,
	}).appendTo($field_user);
	$("<img>", {
		'src': post_data['user_pic'],
		'class': 'user img-circle img-responsive img-thumbnail',
		'alt': 'user picture',
		// 'width': global_post_profile_image_height+'px',
	}).appendTo($field_pic);
	// console.log(post_data['user_pic']);
	// {username}
	$field_username = $("<div>", {
		'class': 'row field_username',
		// 'id':id_field_username,
	}).appendTo($field_user);
	$("<a>", {
		'href': '/profile/' + post_data['username'] + '/1/',
		'html': post_data['username'],
	}).appendTo($field_username);
	// {like}
	$like_body = $("<div>", {
		'class': 'row like_body',
	}).appendTo($field_user);
	if (post_data["is_like"]) {
		heart_icon = $("<i>", {
			'class': global_hearted_class,
		})
			.appendTo($like_body)
			.bind('click', {
				post_id: post_id,
			}, like_clicked);
	}
	else {
		heart_icon = $("<i>", {
			'class': global_unhearted_class,
		})
			.appendTo($like_body)
			.bind('click', {
				post_id: post_id,
			}, like_clicked);
	}
	// {like count}
	var id_field_like_count = post_id + "_field_like_count";
	$("<span>", {
		'html': post_data["like_count"],
		'id': id_field_like_count,
	}).appendTo($like_body);

	// {delete}
	if (global_logged_in_username == post_data['username']) {
		$delete_body = $("<div>", {
			'class': 'row',
		}).appendTo($field_user);

		$delete_col = $("<i>", {
			'class': global_delete_class,
		}).css("font-size", "25px").appendTo($delete_body).bind('click', {
			post_id: post_id,
		}, delete_clicked);
	}

	// {post time}
	$posttime_body = $("<div>", {
		'class': 'row',
	}).appendTo($field_user);

	$posttime_col = $("<span>", {
		'class': 'post_time',
		'html': post_data["time"]["date"] + "<br>" + post_data["time"]["hour_time"] + "<br>" + post_data["time"]["year"] ,
	}).appendTo($posttime_body);

	// { donwload }
	// var link_text = 'http://www.youtubeinmp3.com/fetch/?video=http://www.youtube.com/watch?v=' + post_data["video_id"];
	// $download_body = $("<div>", {
	// 	'class':'row',
	// }).appendTo($field_user);
	// $download_col = $("<div>", {
	// 	'class':'col-xs-12',
	// 	'html':'<a class="glyphicon glyphicon-download hahahahhaha" href="'+link_text+'"></a>',
	// })
	//.appendTo($download_body)
	;
}

function render_post_video(post_data, $post_video_container) {
	$video_body = $("<div>", {
		'class': 'row',
	}).appendTo($post_video_container);
	$video_col = $("<div>", {
		'class': 'col-xs-12',
	}).appendTo($video_body);

	var youtube_url = "https://www.youtube.com/embed/" + post_data['video_id'] + "?enablejsapi=1";
	// var vidid=post_data['video_id'];
	// player layout settings
	youtube_url = youtube_url + "&controls=2&modestbranding=1&rel=0";

	// security settings
	youtube_url = youtube_url + "&origin=";
	// youtube_url = youtube_url + "&origin="+"https://youboxapp.herokuapp.com"

	// set start time
	youtube_url = youtube_url + "&start=" + post_data["start_time"];
	// set end time
	youtube_url = youtube_url + "&end=";

	id_player = post_data['post_id'] + '_player';
	$("<div>", {
		'id': id_player,
		'class': 'embed-responsive embed-responsive-16by9',
		'style': "margin:10px"
	})
		.append($("<iframe>", {
			'src': youtube_url,
			// 'type':'text/html',
			'frameborder': '0',
			'class': 'embed-responsive-item',
		}))
		.appendTo($video_col);
}

function render_post_message(post_data, $post_msg_container) {
	// Split into {like, title} and {pic, username, message}
	post_id = post_data['post_id'];
	id_field_content = post_id + "_field_content";

	// {pic, username, message} := content
	$("<div>", {
		'class': 'row',
		'id': id_field_content,
	})
		.appendTo($post_msg_container);

	id_field_message = post_id + "_field_message";

	// {message}
	$("<div>", {
		'class': 'col-xs-12',
		'html': post_data['message'],
		'id': id_field_message,
	})
		.appendTo("#" + id_field_content);

}

function render_post_comment(post_data, $comment_container) {
	post_id = post_data['post_id'];
	comment_data = post_data['comments'];

	// comment top level: row and col
	$comment_body = $("<div>", {
		'class': 'row'
	}).appendTo($comment_container);
	id_comment_col = post_id + "_col";
	$("<div>", {
		'class': 'col-xs-12',
		'id': id_comment_col,
	}).appendTo($comment_body);

	// collapsed block
	id_comment_collapse = post_id + "_collapse";
	// collapse control toggler
	id_comment_collapse_control = post_id + "_comment_collapse_control";

	// collapse controller
	$("<div>", {
		'class': 'btn btn-primary',
		// the following 2 attributes will carry collapse toggle function
		'data-toggle': 'collapse',
		'data-target': '#' + id_comment_collapse,
		'id': id_comment_collapse_control,
		'html': 'Comments...(' + comment_data.length + ')',
		'style': 'margin-bottom:10px;',
	}).appendTo("#" + id_comment_col);

	// block to be collapsed
	$("<div>", {
		'class': 'collapse',
		'id': id_comment_collapse,
	}).appendTo("#" + id_comment_col);
	// comments ul list
	id_comment_list = post_id + "_comment_list";
	$("<ul>", {
		'class': 'list-group',
		'id': id_comment_list,
	}).appendTo("#" + id_comment_collapse);

	// render comment input li item
	render_comment(id_comment_list, { "commentor": "" }, post_id);

	// comment li item
	comment_data.forEach(function (comment) {
		render_comment(post_id + "_comment_item_last", comment, post_id);
	});


}

function render_comment(id_target, comment, post_id) {
	if (comment["commentor"] === "") {
		// console.log("id  taret is " + id_target);
		// console.log("inside!!!");
		// the bottom input field
		// a comment line
		var id_comment_item_last = post_id + "_comment_item_last"
		$comment_item = $("<li>", {
			'class': 'list-group-item',
			'id': id_comment_item_last,
		}).appendTo("#" + id_target);


		var id_comment_input = post_id + "_comment_input";
		$("<input>", {
			'class': 'form-control',
			'type': 'text',
			'id': id_comment_input,
		})
			.appendTo($comment_item)
			.bind('keyup', {
				postid: post_id
			}, comment_input_enter_listener);


	}
	else {
		var profile_href = '/profile/' + comment["commentor"] + "/1/";

		$comment_item = $("<li>", {
			'class': 'list-group-item',
		}).insertBefore("#" + id_target);

		// a comment top level grid system
		$comment_row = $("<div>", {
			'class': 'row',
		}).appendTo($comment_item);

		$a_comment_col = $("<div>", {
			'class': 'col-xs-12 media',
		}).appendTo($comment_row);

		// commentor image
		$commentor_profile = $("<a>", {
			'class': 'media-left',
			'href': profile_href,
		}).appendTo($a_comment_col);

		// commentor profile: image
		$profile_image = $("<img>", {
			'src': comment['commentor_image'],
			'class': 'commentor img-circle',
		}).appendTo($commentor_profile);

		// comment media block for name and message
		$comment_media_body = $("<div>", {
			'class': 'media-body',
			// 'html':comment['comment_content'],
		}).appendTo($a_comment_col);
		$commment_message = $("<span>", {
			'id': 'comment_text',
			'html': comment['comment_content'],
		}).appendTo($comment_media_body);
		// name
		if (comment["comment_time"] == undefined) {
			comment["comment_time"] = "";
		}
		$comment_heading = $("<span>", {
			'class': 'media-heading',
			'html': '<a href=" ' + profile_href + ' " ><strong> ' + comment["commentor"] + ' </strong></a>  <em style="margin-left:5px;" >' + comment["comment_time"] + '</em> <br>',
		}).prependTo($comment_media_body);
	}

}

function comment_input_enter_listener(e) {
	// if enter is pressed
	if (e.keyCode == 13) {
		var $input_field = this;
		var $post_id = e.data.postid;
		// console.log($(this).val());
		var comment_message = $(this).val();

		// push this commnt into database
		var request_json = {
			"request_type": "push_comment_input",
			"comment_message": comment_message,
			"post_id": $post_id,
		};

		$.ajax({
			type: "POST",
			url: "/post_db/",
			data: JSON.stringify(request_json),
			//dataType:"JSON", /* this specify the returned object type */
			contentType: 'application/json',
		})
			.done(function (response_json) {
				// display the new comment
				$($input_field).val("");
				if (response_json["comment_content"] == "") {
					// alert("empty comment");
				} else {
					// alert("ok!!");
					// add the new comment
					render_comment($post_id + "_comment_item_last", response_json, $post_id);
				}
			})
			.fail(ajax_fail_handler);
	}

}

function delete_clicked(e) {
	var resp = confirm("Are you sure you want to delete the post?")
	if (resp == false) {
		return;
	}

	var post_id = e.data.post_id;
	var request_json = {
		"request_type": "delete_post",
		"post_id": post_id,
	};
	$.ajax({
		'type': 'POST',
		'url': '/post_db/',
		data: JSON.stringify(request_json),
	})
		.done(function (response) {
			// console.log(response);
			location.reload();
		})
		.fail(ajax_fail_handler);
}

function like_clicked(e) {
	var post_id = e.data.post_id;
	var item = this;
	// console.log("post_id is "+post_id);
	// console.log(item);

	if ($(item).attr('class') == global_unhearted_class) {
		// previously unhearted
		// now we want to heart it
		$(item).prop('class', global_hearted_class);
		$.post('/like/', {
			"post_id": post_id
		});

		// increment like count of the post
		var request_json = {
			"request_type": "uprate_like",
			"post_id": post_id,
		};
		$.ajax({
			'type': 'POST',
			'url': '/post_db/',
			data: JSON.stringify(request_json),
		})
			.done(function (response) {
				// console.log(response);
				// get resulting like count here
				$("#" + post_id + "_field_like_count").html(response.like_count);
			})
			.fail(ajax_fail_handler);
	}
	else {
		// already hearted
		// now we want to unheart it
		$(item).prop('class', global_unhearted_class);
		$.post('/unlike/', {
			"post_id": post_id
		});

		// decrement like count of the post
		var request_json = {
			"request_type": "downrate_like",
			"post_id": post_id,
		};
		$.ajax({
			'type': 'POST',
			'url': '/post_db/',
			data: JSON.stringify(request_json),
		})
			.done(function (response) {
				// console.log(response);
				// get resulting like count here
				$("#" + post_id + "_field_like_count").html(response.like_count);
			})
			.fail(ajax_fail_handler);
	}
}

