// Sounds
var cx = "<MYCX>";
var sound_on = true;
var root_url = "<ROOT_URL>";
var isLoggedIn = "<ISLOGGEDIN>";
var	myname   = "";
var	mystatus = 0;
var working_user = [];

if(sound_on){
	var sound_button_click = new Audio('<ROOT_URL>/assets/sounds/sound_button_click.mp3');
	$(document).on( 'click', '.sound_button_click', function(){ sound_button_click.play(); });
}

// Errors
function doErr(s,t,en){
	// Could do en 1 for error 2 for note color change, or set a redirect/reload
	t = (t==0) ? 10000 : t ;
	$('#errNote').text(s).show().delay(t).fadeOut(0);
}

function doTrans(i){ $('#bgvid').show().delay(i).fadeOut(); }
function clean_user_popups(){
	$('#peeps_travelers').show();
	$('#user_using_div, #pop_box_champs, #pop_box_items, #pop_box_maps, #pop_box_quests, #peeps_champs, #char_portrait, #go_home').hide();
}
function rgb2hex(rgb) {
     if (  rgb.search("rgb") == -1 ) {
          return rgb;
     } else {
          rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
          function hex(x) {
               return ("0" + parseInt(x).toString(16)).slice(-2);
          }
          return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]); 
     }
}

function nl2br (str) {
  var breakTag = '<br>'; // (false || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display
  // return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
  return (str).replace(/(\r\n|\n\r|\r|\n)/g, breakTag);
}
function br2nl (str) {
  var breakTag = "\n"; // (false || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display
  return (str).replace(/<br>/g, breakTag );
}
function vote_image_uploaded_action(ele){ 
  event.preventDefault();
  if( $('#vote_img_file').val() != '' ){
    var reader = new FileReader();
    // Attempt to resize.
    if(ele.files[0].type.match(/image.*/)) {
      reader.onloadend = function(){
        var nimg = new Image();
        nimg.onload = function(){
        	let image_max_size = 2500000;
    		let uHeight        = '280px';
    		let uWidth         = '260px';
	        var canvas = document.createElement('canvas'); var width  = nimg.width; var height = nimg.height;
	        if(width > height && width > uWidth){ height *= uHeight / width; width = uWidth; }else if( height > uHeight ){ width *= uWidth / height; height = uHeight; }
	        canvas.width = width; canvas.height = height; canvas.getContext('2d').drawImage(nimg, 0, 0, width, height); 
	        user_img = canvas.toDataURL('image/jpeg');
	        if(user_img.length > image_max_size){doErr('Image Upload Failed', 0, 1); }else{
	        	if( user_img != '' ){ 
							s = {"vals":{"cx":cx, "k" : $('#char_portrait').data('k').toString(), "uu" : $('#user_using_user').data('k').toString(), "img" : user_img }};
							$.ajax({
							  	type: "POST", url: "<ROOT_URL>/ajax/char_update_img", data: JSON.stringify(s), contentType: "application/json", dataType: 'json',
							    success: function (d) { 
						    		cx = d.cx;
							    	if( d.success == "true" ){
							    		// Update Complete.
							    	}
							    }
							});

	        		$('#char_portrait').html('<img src="'+user_img+'"/>'); 
	          		doErr('Image Uploaded.', 0, 1); 
	          	} 
	        }
        }
        nimg.src = reader.result;
      }
      reader.readAsDataURL(ele.files[0]);
    } else { doErr('Image Missing', 0, 1); }
  } else { doErr('Image Missing', 0, 1); }
}


$(document).ready(function () {
	$('#errNote').click( function(){ $(this).hide(); });

	if( isLoggedIn == "1" ){
    	$("#container>div").hide(); $("#page_dashboard, #pop_box_users").show();
    	trigger_dashboard_items();
	}else{
		$('#pop_box_welcome').show();
	}

	$('#pop_box_users').on('click', '#go_home', function(){clean_user_popups();});

	$('#pop_box_users').on('click', '#logmeout', function(){
		s = {"vals":{}};
		$.ajax({
		  	type: "POST", url: "<ROOT_URL>/ajax/logout", data: JSON.stringify(s), contentType: "application/json", dataType: 'json',
		    success: function (d) { 
	    		window.location.reload();
		    }
		});
	});


	$('#button_join_game_door').click(function(){
		if( ($('#game_name').val()).trim().length < 2 ){ doErr('User Name must be at least 3 characters long.', 0, 1); return true; }
		if( ($('#game_pass').val()).trim().length < 6 ){ doErr('User Password must be at least 6 characters long.', 0, 1); return true; }
	   	doTrans(1000);
		s = {"vals":{"cx":cx, "un" : $('#game_name').val(), "pw" : $('#game_pass').val() }};
		$.ajax({
		  	type: "POST", url: "<ROOT_URL>/ajax/login", data: JSON.stringify(s), contentType: "application/json", dataType: 'json',
		    success: function (d) { 
	    		cx = d.cx;
		    	if( d.success == "true" ){
			    	$("#container>div").hide(); $("#page_dashboard, #pop_box_users").show();
			    	trigger_dashboard_items();
		    	} else {
		    		doErr('That username and password did not match.', 0, 1);
		    	}
		    }
		});
	});

	function trigger_dashboard_items(){
		s = {"vals":{"cx":cx }};
		$.ajax({
		  	type: "POST", url: "<ROOT_URL>/ajax/get_dashboard", data: JSON.stringify(s), contentType: "application/json", dataType: 'json',
		    success: function (d) { 
	    		cx = d.cx;
		    	if( d.success == "true" ){
					myname   = d.un;
					mystatus = d.us;
					let o = '';
					if( mystatus < 10 ){
						o = 'Waiting for DM to activate your account.';
					}else{
			    		o = '<div id="users_list_box">';
						o += '<div data-k="_WORLD_" data-d="-1" class="users_button red_border_hl">[_WORLD_]</div>';
						ho = '';
						$.each(d.sa, function( k, v ) {
							if( v[1] == 1000 ){
								o += '<div data-k="'+v[0]+'" data-s="'+v[1]+'" class="users_button red_border_hl">'+v[0]+' [DM]</div>';
							} else {
								let addinf = '';
								addinf = ((v[1]==2)?' [BND]':addinf);
								addinf = ((v[1]==0)?' [*]':addinf);
								addinf = ((v[1]==10)?' [PLR]':addinf);
								addinf = ((v[1]==20)?' [HPR]':addinf);
								ho += '<div data-k="'+v[0]+'" data-s="'+v[1]+'" class="users_button red_border_hl">'+v[0]+ addinf +'</div>';
							}
						});
						o += ho + '</div>';
					}
	    			$('#users_list').html( o );
		    	} else {
		    		doErr('Loading dashboard failed.', 0, 1);
		    	}
		    }
		});
	}


	$('#users_list').on('click', '.users_button', function(){
		clean_user_popups();
		if( $(this).hasClass('user_marked') ){
			$('.user_marked').removeClass('user_marked');
			$('#users_list_ops').hide();
			$('#user_list_select').html('');
		}else{
			working_user = [$(this).data('k'), $(this).data('s')]; // User and User Status 
			$('.user_marked').removeClass('user_marked');
			$(this).addClass('user_marked');
			$('#users_list_ops').show();
			let o = '<OPTION VALUE="">Select Option</OPTION>';
			if( mystatus >= 10 ){
				o += '<optgroup label="Message">';
					o += '<OPTION VALUE="m1">Message</OPTION>';
					o += '<OPTION VALUE="m2">Note</OPTION>';
				o += '</optgroup>';
				o += '<optgroup label="Characters">';
					o += '<OPTION VALUE="c1">Characters</OPTION>';
				o += '</optgroup>';
			}
			if( mystatus >= 1000 ){
				o += '<option disabled="disabled"></option>';
				o += '<optgroup label="User Reset">';
					o += '<OPTION VALUE="a0">Reset User</OPTION>';
				o += '</optgroup>';
				o += '<optgroup label="Promotions">';
					o += '<OPTION VALUE="a1">No Access</OPTION>';
					o += '<OPTION VALUE="a2">Player Access</OPTION>';
					o += '<OPTION VALUE="a3">Helper Access</OPTION>';
					o += '<OPTION VALUE="a4">DM Access</OPTION>';
				o += '</optgroup>';
				o += '<optgroup label="Punishments">';
					o += '<OPTION VALUE="d1">Delete User</OPTION>';
					o += '<OPTION VALUE="d2">Bann User</OPTION>';
				o += '</optgroup>';
			}
			$('#user_list_select').html(o);
		}
	});
	$('#user_list_select').change(function(){

		let sval = $(this).val(); 
		$("#user_list_select").val($("#user_list_select option:first").val());
		$('.user_marked').removeClass('user_marked');
		$('#users_list_ops').hide();
		$('#user_list_select').html('');
		$('#user_using').html( '<div id="user_using_user" data-k="' + working_user[0] + '" data-s="' + working_user[1] + '">' + working_user[0].toUpperCase() + '</div>');
		$('#user_using_div, #go_home').show();

		if( sval == "d1" || sval == "d2" || sval == "a0" || sval == "a1" || sval == "a2" || sval == "a3" || sval == "a4" ){
			let countdms = 0;
			$('.users_button').each(function(k,v){
				if( $(v).data('s') == 1000 ){ countdms++; }
			});

			if( working_user[1] >= 1000 && countdms < 2 ){ clean_user_popups(); doErr("Must have at least one active DM.", 0, 1); return false; }
			if( sval == "d1" && working_user[1] > 100 ){ clean_user_popups(); doErr("User permissions must be lower to delete.", 0, 1); return false;}
			if( sval == "d1" ){ if(confirm("Are you sure?")){ } else { clean_user_popups(); return false; } }
			if( sval == "a0" ){ if(confirm("Are you sure? User account will be reset so the user can log back in with same user name and a NEW password.")){ } else { clean_user_popups(); return false; } }
			if( working_user[0] == "_WORLD_"){ clean_user_popups(); doErr('Can not affect _WORLD_ this way.', 0, 1); return false; }

			clean_user_popups();
			s = {"vals":{"cx":cx, "s":sval, "usr":working_user[0], "usrstat":working_user[1] }};
			$.ajax({
			  	type: "POST", url: "<ROOT_URL>/ajax/update_user", data: JSON.stringify(s), contentType: "application/json", dataType: 'json',
			    success: function (d) { 
		    		cx = d.cx;
			    	if( d.success == "true" ){
			    		// doErr('Permissions Updated.', 0, 1);
			    		window.location.reload();
			    	} else {
			    		doErr('Update failed.', 0, 1);
			    	}
			    }
			});
		}else{
			if( sval == 'm1' ){
//				$('#pop_box_champs').show();
			}
			if( sval == 'm2' ){
//				$('#pop_box_champs').show();
			}
			if( sval == 'c1' ){
				s = {"vals":{"cx":cx, "uu":$('#user_using_user').data('k').toString() }};
				$.ajax({
				  	type: "POST", url: "<ROOT_URL>/ajax/char_list", data: JSON.stringify(s), contentType: "application/json", dataType: 'json',
				    success: function (d) { 
			    		cx = d.cx;
   						let o = '<div>';
				    	if( d.success == "true" ){
				    		$.each(d.s, function(k,v){
								o += '<div><div class="char_submark" data-id="' + v[1] + '" data-k="' + v[0] + '" data-n="' + v[2] + '" title="Remove Character">[-]</div><div data-k="' + v[0] + '" class="char_user_button red_border_hl">' + v[2] + '</div></div>';
				    		});
				    	}
						o += '</div>';
						$('#champs_list').html(o);
						$('#peeps_travelers').hide(); $('#peeps_champs').show();
				    }
				});
			}

		}


	});


/***********************************************************************************************/
/************* C H A R A C T E R S ************/ 
/***********************************************************************************************/
	var char_set_fields = {};
	function load_character_sheet(id){
		s = {"vals":{"cx":cx, "k" : id.toString(), "uu" : $('#user_using_user').data('k').toString() }};
		$.ajax({
		  	type: "POST", url: "<ROOT_URL>/ajax/char_load", data: JSON.stringify(s), contentType: "application/json", dataType: 'json',
		    success: function (d) { 
	    		cx = d.cx;

					$('#char_portrait').data('u', '');
					$('#char_portrait').data('k', '0');

		    	if( d.success == "true" ){
		    		let char_user_parts = d.sa.id.split("_");
		    		let char_user_name = char_user_parts[0];
		    		let char_id        = char_user_parts[1];
		    		if(id==0){
							$('#champs_list').prepend('<div><div class="char_submark" data-id="' + d.sa.id + '" data-k="' + char_id + '" data-n="' + (( d.sa.char_name == '' || d.sa.char_name == 'Character Name' ) ? 'Character Name' : d.sa.char_name ) + '" title="Remove Character">[-]</div><div data-k="' + char_id  + '" class="char_user_button red_border_hl">' + (( d.sa.char_name == '' || d.sa.char_name == 'Character Name' ) ? 'Character Name' : d.sa.char_name ) + '</div></div>');
		    		}
						$('#char_portrait').data('u', char_user_name);
						$('#char_portrait').data('k', char_id);

/*
						var client = new XMLHttpRequest();
						client.open('GET', root_url + '/champs/' + char_user_name + '/' + d.sa.id + '.jpg');
						client.onreadystatechange = function() {
							if( client.responseText != '' ){
								// $('#char_portrait').html( ((d.hasimg !== true) ? '<img src="'+root_url+'/assets/images/icons/noportrait.webp"/>' : '<img src="'+root_url+'/champs/'+char_user_name+'/'+d.sa.id+'.jpg" onerror="this.onerror=null;this.src=\''+root_url+'/assets/images/icons/noportrait.webp\';" />' ) );
								$('#char_portrait').html( ((d.hasimg !== true) ? '<img src="'+root_url+'/assets/images/icons/noportrait.webp"/>' : '<img src="' + client.responseText + '" onerror="this.onerror=null;this.src=\''+root_url+'/assets/images/icons/noportrait.webp\';" />' ) );
							}
						}
						client.send();
*/
//						$('#char_portrait').html( ((d.hasimg !== true) ? '<img src="'+root_url+'/assets/images/icons/noportrait.webp"/>' : '<img src="'+root_url+'/champs/'+char_user_name+'/'+d.sa.id+'.jpg" onerror="this.onerror=null;this.src=\''+root_url+'/assets/images/icons/noportrait.webp\';" />' ) );
						$('#char_portrait').html( ((d.hasimg !== true) ? '<img src="'+root_url+'/assets/images/icons/noportrait.webp"/>' : '<img src="'+d.img+'" onerror="this.onerror=null;this.src=\''+root_url+'/assets/images/icons/noportrait.webp\';" />' ) );


						$('#char_name').html( (( d.sa.char_name == '' || d.sa.char_name == 'Character Name' ) ? 'Character Name' : d.sa.char_name ) );
						$('#char_race').html( (( d.sa.char_race == '' ) ? 'Race' : d.sa.char_race ) );
						$('#char_aura').html( (( d.sa.char_aura == '' ) ? 'Aura' : d.sa.char_aura ) );
						$('#char_alignment').html( (( d.sa.char_alignment == '' ) ? 'Alignment' : d.sa.char_alignment ) );

						$('#char_age').html(    (( d.sa.char_age    == '' ) ? '' : d.sa.char_age    ) ); // _tag for on click
						$('#char_height').html( (( d.sa.char_height == '' ) ? '' : d.sa.char_height ) );
						$('#char_weight').html( (( d.sa.char_weight == '' ) ? '' : d.sa.char_weight ) );
						$('#char_skin').html(   (( d.sa.char_skin   == '' ) ? '' : d.sa.char_skin   ) );
						$('#char_eyes').html(   (( d.sa.char_eyes   == '' ) ? '' : d.sa.char_eyes   ) );
						$('#char_hair').html(   (( d.sa.char_hair   == '' ) ? '' : d.sa.char_hair   ) );

						$('#char_str_op1').html(   (( d.sa.char_str_op1     == ''     ) ? ''  : d.sa.char_str_op1   ) ).prop('title', (( d.sa.char_str_op1  == '' ) ? 'You Decide'    : d.sa.char_str_op1t  ) );
						$('#char_str_op2').html(   (( d.sa.char_str_op2     == ''     ) ? ''  : d.sa.char_str_op2   ) ).prop('title', (( d.sa.char_str_op2  == '' ) ? 'You Decide'    : d.sa.char_str_op2t  ) );
						$('#char_str_op3').html(   (( d.sa.char_str_op3     == ''     ) ? ''  : d.sa.char_str_op3   ) ).prop('title', (( d.sa.char_str_op3  == '' ) ? 'You Decide'    : d.sa.char_str_op3t  ) );
						$('#char_str').html(       (( d.sa.char_str         == ''     ) ? '0' : d.sa.char_str      ) );
						$('#char_str_bonus').html( (( d.sa.char_str_bonus   == ''     ) ? '0' : d.sa.char_str_bonus ) );
						$('#char_dex_op1').html(   (( d.sa.char_dex_op1     == ''     ) ? ''  : d.sa.char_dex_op1   ) ).prop('title', (( d.sa.char_dex_op1  == '' ) ? 'You Decide'    : d.sa.char_dex_op1t  ) );
						$('#char_dex_op2').html(   (( d.sa.char_dex_op2     == ''     ) ? 'Init' : d.sa.char_dex_op2   ) ).prop('title', (( d.sa.char_dex_op2  == '' ) ? 'Initiative'    : d.sa.char_dex_op2t  ) );
						$('#char_dex_op3').html(   (( d.sa.char_dex_op3     == ''     ) ? ''  : d.sa.char_dex_op3   ) ).prop('title', (( d.sa.char_dex_op3  == '' ) ? 'You Decide'    : d.sa.char_dex_op3t  ) );
						$('#char_dex').html(       (( d.sa.char_dex         == ''     ) ? '0' : d.sa.char_dex      ) );
						$('#char_dex_bonus').html( (( d.sa.char_dex_bonus   == ''     ) ? '0' : d.sa.char_dex_bonus ) );
						$('#char_con_op1').html(   (( d.sa.char_con_op1     == ''     ) ? ''  : d.sa.char_con_op1   ) ).prop('title', (( d.sa.char_con_op1t  == '' ) ? 'You Decide'    : d.sa.char_con_op1t  ) );
						$('#char_con_op2').html(   (( d.sa.char_con_op2     == ''     ) ? ''  : d.sa.char_con_op2   ) ).prop('title', (( d.sa.char_con_op2t  == '' ) ? 'You Decide'    : d.sa.char_con_op2t  ) );
						$('#char_con_op3').html(   (( d.sa.char_con_op3     == ''     ) ? ''  : d.sa.char_con_op3   ) ).prop('title', (( d.sa.char_con_op3t  == '' ) ? 'You Decide'    : d.sa.char_con_op3t  ) );
						$('#char_con').html(       (( d.sa.char_con         == ''     ) ? '0' : d.sa.char_con      ) );
						$('#char_con_bonus').html( (( d.sa.char_con_bonus   == ''     ) ? '0' : d.sa.char_con_bonus ) );
						$('#char_int_op1').html(   (( d.sa.char_int_op1     == ''     ) ? ''  : d.sa.char_int_op1   ) ).prop('title', (( d.sa.char_int_op1t  == '' ) ? 'You Decide'    : d.sa.char_int_op1t  ) );
						$('#char_int_op2').html(   (( d.sa.char_int_op2     == ''     ) ? ''  : d.sa.char_int_op2   ) ).prop('title', (( d.sa.char_int_op2t  == '' ) ? 'You Decide'    : d.sa.char_int_op2t  ) );
						$('#char_int_op3').html(   (( d.sa.char_int_op3     == ''     ) ? ''  : d.sa.char_int_op3   ) ).prop('title', (( d.sa.char_int_op3t  == '' ) ? 'You Decide'    : d.sa.char_int_op3t  ) );
						$('#char_int').html(       (( d.sa.char_int         == ''     ) ? '0' : d.sa.char_int      ) );
						$('#char_int_bonus').html( (( d.sa.char_int_bonus   == ''     ) ? '0' : d.sa.char_int_bonus ) );
						$('#char_wis_op1').html(   (( d.sa.char_wis_op1     == ''     ) ? ''  : d.sa.char_wis_op1   ) ).prop('title', (( d.sa.char_wis_op1t  == '' ) ? 'You Decide'    : d.sa.char_wis_op1t  ) );
						$('#char_wis_op2').html(   (( d.sa.char_wis_op2     == ''     ) ? ''  : d.sa.char_wis_op2   ) ).prop('title', (( d.sa.char_wis_op2t  == '' ) ? 'You Decide'    : d.sa.char_wis_op2t  ) );
						$('#char_wis_op3').html(   (( d.sa.char_wis_op3     == ''     ) ? ''  : d.sa.char_wis_op3   ) ).prop('title', (( d.sa.char_wis_op3t  == '' ) ? 'You Decide'    : d.sa.char_wis_op3t  ) );
						$('#char_wis').html(       (( d.sa.char_wis         == ''     ) ? '0' : d.sa.char_wis      ) );
						$('#char_wis_bonus').html( (( d.sa.char_wis_bonus   == ''     ) ? '0' : d.sa.char_wis_bonus ) );
						$('#char_cha_op1').html(   (( d.sa.char_cha_op1     == ''     ) ? ''  : d.sa.char_cha_op1   ) ).prop('title', (( d.sa.char_cha_op1t  == '' ) ? 'You Decide'    : d.sa.char_cha_op1t  ) );
						$('#char_cha_op2').html(   (( d.sa.char_cha_op2     == ''     ) ? ''  : d.sa.char_cha_op2   ) ).prop('title', (( d.sa.char_cha_op2t  == '' ) ? 'You Decide'    : d.sa.char_cha_op2t  ) );
						$('#char_cha_op3').html(   (( d.sa.char_cha_op3     == ''     ) ? ''  : d.sa.char_cha_op3   ) ).prop('title', (( d.sa.char_cha_op3t  == '' ) ? 'You Decide'    : d.sa.char_cha_op3t  ) );
						$('#char_cha').html(       (( d.sa.char_cha         == ''     ) ? '0' : d.sa.char_cha      ) );
						$('#char_cha_bonus').html( (( d.sa.char_cha_bonus   == ''     ) ? '0' : d.sa.char_cha_bonus ) );

						$('#char_ac').html(         (( d.sa.char_ac         == ''     ) ? 'AC'     : d.sa.char_ac     ) );
						$('#char_ac_armor').html(   (( d.sa.char_ac_armor   == ''     ) ? 'ARMOR'  : d.sa.char_ac_armor  ) );
						$('#char_ac_shield').html(  (( d.sa.char_ac_shield  == ''     ) ? 'SHIELD' : d.sa.char_ac_shield    ) );
						$('#char_hp').html(         (( d.sa.char_hp         == ''     ) ? 'HP'     : d.sa.char_hp     ) );
						$('#char_hp_max').html(     (( d.sa.char_hp_max     == ''     ) ? 'MAX'    : d.sa.char_hp_max    ) );
						$('#char_hp_tmp').html(     (( d.sa.char_hp_tmp     == ''     ) ? 'TMP'    : d.sa.char_hp_tmp    ) );
						$('#char_speed').html(      (( d.sa.char_speed      == ''     ) ? 'SPEED'  : d.sa.char_speed  ) );
						$('#char_speed_swim').html( (( d.sa.char_speed_swim == ''     ) ? 'SWIM'   : d.sa.char_speed_swim   ) );
						$('#char_speed_fly').html(  (( d.sa.char_speed_fly  == ''     ) ? 'FLY'    : d.sa.char_speed_fly    ) );

						$('#char_level').html(     (( d.sa.char_level        == ''     ) ? 'LEVEL'  : d.sa.char_level  ) );
						$('#char_level_xp').html(  (( d.sa.char_level_xp     == ''     ) ? 'XP'     : d.sa.char_level_xp     ) );
						$('#char_level_sp').html(  (( d.sa.char_level_sp     == ''     ) ? 'SP'     : d.sa.char_level_sp     ) );
						$('#char_level_dmp').html( (( d.sa.char_level_dmp    == ''     ) ? 'DMP'    : d.sa.char_level_dmp    ) );
						$('#char_level_psp').html( (( d.sa.char_level_psp    == ''     ) ? 'PSP'    : d.sa.char_level_psp    ) );

						if( d.sa.char_classes != '' ){
							out = '';
							$.each(JSON.parse(d.sa.char_classes), function(k,v){
								out += '<div data-k="'+(k+1)+'" class="char_class_item">';
								out +='<div data-k="'+(k+1)+'" style="cursor:pointer;" class="ch_action_class char_class_edit" >(e)</div>';

								out +='<div class="char_class_div_s">'
									out +='<div class="char_class_level">'+v[2]+'</div>';
								out +='</div>'
								out +='<div class="char_class_div_l">';
									out +='<div class="char_class_class">'+v[0]+'</div>';
									out +='<div class="char_class_subclass">'+v[1]+'</div>';
								out +='</div>'

								out +='</div>';
							});
							$('#char_classes').html(out);
							char_classes_sort();
						}




						$('#char_background').html( (( d.sa.char_background  == ''     ) ? ''    : nl2br(d.sa.char_background)  ) );
						$('#char_languages').html(  (( d.sa.char_languages   == ''     ) ? ''    : nl2br(d.sa.char_languages)   ) );
						$('#char_notes').html(      (( d.sa.char_notes       == ''     ) ? ''    : nl2br(d.sa.char_notes)       ) );
						$('#char_features').html(   (( d.sa.char_features    == ''     ) ? ''    : nl2br(d.sa.char_features)    ) );

						$('#char_spells').html(     (( d.sa.char_spells      == ''     ) ? ''    : nl2br(d.sa.char_spells)      ) );
						$('#char_weapons').html(    (( d.sa.char_weapons     == ''     ) ? ''    : nl2br(d.sa.char_weapons)     ) );
						$('#char_armors').html(     (( d.sa.char_armors      == ''     ) ? ''    : nl2br(d.sa.char_armors)      ) );
						$('#char_equipments').html( (( d.sa.char_equipments  == ''     ) ? ''    : nl2br(d.sa.char_equipments)  ) );

						$('#char_toggle1').css('background-color', (( d.sa.char_toggle1  == '' ) ? '#afafaf'    : d.sa.char_toggle1 ) ).prop('title', (( d.sa.char_toggle1t    == '' ) ? 'You Decide'    : d.sa.char_toggle1t   ));
						$('#char_toggle2').css('background-color', (( d.sa.char_toggle2  == '' ) ? '#afafaf'    : d.sa.char_toggle2 ) ).prop('title', (( d.sa.char_toggle2t    == '' ) ? 'You Decide'    : d.sa.char_toggle2t   ));
						$('#char_toggle3').css('background-color', (( d.sa.char_toggle3  == '' ) ? '#afafaf'    : d.sa.char_toggle3 ) ).prop('title', (( d.sa.char_toggle3t    == '' ) ? 'You Decide'    : d.sa.char_toggle3t   ));
						$('#char_toggle4').css('background-color', (( d.sa.char_toggle4  == '' ) ? '#afafaf'    : d.sa.char_toggle4 ) ).prop('title', (( d.sa.char_toggle4t    == '' ) ? 'You Decide'    : d.sa.char_toggle4t   ));
						$('#char_toggle5').css('background-color', (( d.sa.char_toggle5  == '' ) ? '#afafaf'    : d.sa.char_toggle5 ) ).prop('title', (( d.sa.char_toggle5t    == '' ) ? 'You Decide'    : d.sa.char_toggle5t   ));
						$('#char_toggle6').css('background-color', (( d.sa.char_toggle6  == '' ) ? '#afafaf'    : d.sa.char_toggle6 ) ).prop('title', (( d.sa.char_toggle6t    == '' ) ? 'You Decide'    : d.sa.char_toggle6t   ));
						$('#char_op1').html(  (( d.sa.char_op1   == '' ) ? '0'    : d.sa.char_op1  ) ).prop('title', (( d.sa.char_op1t    == '' ) ? 'You Decide'    : d.sa.char_op1t   ) );
						$('#char_op2').html(  (( d.sa.char_op2   == '' ) ? '0'    : d.sa.char_op2  ) ).prop('title', (( d.sa.char_op2t    == '' ) ? 'You Decide'    : d.sa.char_op2t   ) );
						$('#char_op3').html(  (( d.sa.char_op3   == '' ) ? '0'    : d.sa.char_op3  ) ).prop('title', (( d.sa.char_op3t    == '' ) ? 'You Decide'    : d.sa.char_op3t   ) );
						$('#char_op4').html(  (( d.sa.char_op4   == '' ) ? '0'    : d.sa.char_op4  ) ).prop('title', (( d.sa.char_op4t    == '' ) ? 'You Decide'    : d.sa.char_op4t   ) );
						$('#char_op5').html(  (( d.sa.char_op5   == '' ) ? '0'    : d.sa.char_op5  ) ).prop('title', (( d.sa.char_op5t    == '' ) ? 'You Decide'    : d.sa.char_op5t   ) );
						$('#char_op6').html(  (( d.sa.char_op6   == '' ) ? '0'    : d.sa.char_op6  ) ).prop('title', (( d.sa.char_op6t    == '' ) ? 'You Decide'    : d.sa.char_op6t   ) );
						$('#char_op7').html(  (( d.sa.char_op7   == '' ) ? '0'    : d.sa.char_op7  ) ).prop('title', (( d.sa.char_op7t    == '' ) ? 'You Decide'    : d.sa.char_op7t   ) );
						$('#char_op8').html(  (( d.sa.char_op8   == '' ) ? '0'    : d.sa.char_op8  ) ).prop('title', (( d.sa.char_op8t    == '' ) ? 'You Decide'    : d.sa.char_op8t   ) );
						$('#char_op9').html(  (( d.sa.char_op9   == '' ) ? '0'    : d.sa.char_op9  ) ).prop('title', (( d.sa.char_op9t    == '' ) ? 'You Decide'    : d.sa.char_op9t   ) );
						$('#char_op10').html( (( d.sa.char_op10  == '' ) ? '0'    : d.sa.char_op10 ) ).prop('title', (( d.sa.char_op10t   == '' ) ? 'You Decide'    : d.sa.char_op10t  ) );
						$('#char_op11').html( (( d.sa.char_op11  == '' ) ? '0'    : d.sa.char_op11 ) ).prop('title', (( d.sa.char_op11t   == '' ) ? 'You Decide'    : d.sa.char_op11t  ) );
						$('#char_op12').html( (( d.sa.char_op12  == '' ) ? '0'    : d.sa.char_op12 ) ).prop('title', (( d.sa.char_op12t   == '' ) ? 'You Decide'    : d.sa.char_op12t  ) );
						$('#char_op13').html( (( d.sa.char_op13  == '' ) ? '0'    : d.sa.char_op13 ) ).prop('title', (( d.sa.char_op13t   == '' ) ? 'You Decide'    : d.sa.char_op13t  ) );
						$('#char_op14').html( (( d.sa.char_op14  == '' ) ? '0'    : d.sa.char_op14 ) ).prop('title', (( d.sa.char_op14t   == '' ) ? 'You Decide'    : d.sa.char_op14t  ) );
						$('#char_op15').html( (( d.sa.char_op15  == '' ) ? '0'    : d.sa.char_op15 ) ).prop('title', (( d.sa.char_op15t   == '' ) ? 'You Decide'    : d.sa.char_op15t  ) );
						$('#char_op16').html( (( d.sa.char_op16  == '' ) ? '0'    : d.sa.char_op16 ) ).prop('title', (( d.sa.char_op16t   == '' ) ? 'You Decide'    : d.sa.char_op16t  ) );
						$('#char_op17').html( (( d.sa.char_op17  == '' ) ? '0'    : d.sa.char_op17 ) ).prop('title', (( d.sa.char_op17t   == '' ) ? 'You Decide'    : d.sa.char_op17t  ) );
						$('#char_op18').html( (( d.sa.char_op18  == '' ) ? '0'    : d.sa.char_op18 ) ).prop('title', (( d.sa.char_op18t   == '' ) ? 'You Decide'    : d.sa.char_op18t  ) );

						$('#pop_box_champs, #char_portrait').show();

		    	}
		    }
		});
	}

	$('#pop_box_champs').on('click', '#char_background_link', function(){
		$('.bgnotes_selected').removeClass('bgnotes_selected');
		$('#char_languages, #char_notes, #char_features').hide(); $('#char_background').show(); $('#char_background_link').addClass('bgnotes_selected');
	});
	$('#pop_box_champs').on('click', '#char_languages_link', function(){
		$('.bgnotes_selected').removeClass('bgnotes_selected');
		$('#char_notes, #char_features, #char_background').hide(); $('#char_languages').show(); $('#char_languages_link').addClass('bgnotes_selected');
	});
	$('#pop_box_champs').on('click', '#char_notes_link', function(){
		$('.bgnotes_selected').removeClass('bgnotes_selected');
		$('#char_features, #char_background, #char_languages').hide(); $('#char_notes').show(); $('#char_notes_link').addClass('bgnotes_selected');
	});
	$('#pop_box_champs').on('click', '#char_features_link', function(){
		$('.bgnotes_selected').removeClass('bgnotes_selected');
		$('#char_notes, #char_background, #char_languages').hide(); $('#char_features').show(); $('#char_features_link').addClass('bgnotes_selected');
	});


	$('#pop_box_users').on('click', '.char_user_button', function(){
		load_character_sheet( $(this).data('k') );
	});
	$('#pop_box_users').on('click', '#char_add_new', function(){
		load_character_sheet( 0 );
	});
	$('#pop_box_users').on('click','.char_submark',function(){
		if (confirm("Are you sure you wish to delete " + $(this).data('n') + "?") !== true) { return false; } 
		s = {"vals":{"cx":cx, "k" : $(this).data('k').toString(), "uu" : $('#user_using_user').data('k').toString() }};
		$(this).parent().remove();
		$('#pop_box_champs, #char_portrait').hide();
		$.ajax({
		  	type: "POST", url: "<ROOT_URL>/ajax/char_delete", data: JSON.stringify(s), contentType: "application/json", dataType: 'json',
		    success: function (d) { 
	    		cx = d.cx;
		    	if( d.success == "true" ){}
		    }
		});
	});


	$("#char_form_loader").on('click', '.togglepick', function(){
		$('.togglepicked').removeClass('togglepicked');	$(this).addClass('togglepicked');	$('#char_toggle_').val( $(this).data('k') );
	});

	$("#pop_box_champs").on('click', '.ch_action', function(){
		let o = '';
		$('#char_form_loader').show();
		switch ( $(this).attr('id') ){
			case "char_name":
						o += '<div class="charfl">Character Name:</div>';
						o += '<div class="charfi"><input data-k="char_name" class="charfid" type="text" value="' + $('#char_name').text() + '" maxlength="20" /></div>';
	      	break;
			case "char_race":
						o += '<div class="charfl">Character Race:</div>';
						o += '<div class="charfi"><input data-k="char_race" class="charfid" type="text" value="' + $('#char_race').text() + '" maxlength="20" /></div>';
	      	break;
			case "char_aura":
						o += '<div class="charfl">Character Aura:</div>';
						o += '<div class="charfi"><input data-k="char_aura" class="charfid" type="text" value="' + $('#char_aura').text() + '" maxlength="20" /></div>';
	      	break;
			case "char_alignment":
						o += '<div class="charfl">Character Alignment:</div>';
						o += '<div class="charfi"><input data-k="char_alignment" class="charfid" type="text" value="' + $('#char_alignment').text() + '" maxlength="20" /></div>';
	      	break;

			case "char_age_tag":
						o += '<div class="charfl">Age:</div>';
						o += '<div class="charfi"><input data-k="char_age" class="charfid" type="text" value="' + $('#char_age').text() + '" /></div>';
	      	break;
			case "char_height_tag":
						o += '<div class="charfl">Height:</div>';
						o += '<div class="charfi"><input data-k="char_height" class="charfid" type="text" value="' + $('#char_height').text() + '" /></div>';
	      	break;
			case "char_weight_tag":
						o += '<div class="charfl">Weight:</div>';
						o += '<div class="charfi"><input data-k="char_weight" class="charfid" type="text" value="' + $('#char_weight').text() + '" /></div>';
	      	break;
			case "char_skin_tag":
						o += '<div class="charfl">Skin:</div>';
						o += '<div class="charfi"><input data-k="char_skin" class="charfid" type="text" value="' + $('#char_skin').text() + '" /></div>';
	      	break;
			case "char_eyes_tag":
						o += '<div class="charfl">Eyes:</div>';
						o += '<div class="charfi"><input data-k="char_eyes" class="charfid" type="text" value="' + $('#char_eyes').text() + '" /></div>';
	      	break;
			case "char_hair_tag":
						o += '<div class="charfl">Hair:</div>';
						o += '<div class="charfi"><input data-k="char_hair" class="charfid" type="text" value="' + $('#char_hair').text() + '" /></div>';
	      	break;

			case "char_str":
						o += '<div class="charfl">Strength:</div>';
						o += '<div class="charfi"><input data-k="char_str" class="charfid" type="text" value="' + $('#char_str').text() + '" /></div>';
	      	break;
			case "char_str_bonus":
						o += '<div class="charfl">Strength Bonus:</div>';
						o += '<div class="charfi"><input data-k="char_str_bonus" class="charfid" type="text" value="' + $('#char_str_bonus').text() + '" /></div>';
	      	break;
			case "char_str_op1":
						o += '<div class="charfl">Strength Option 1:</div>';
						o += '<div class="charfi"><input data-k="char_str_op1" class="charfid" type="text" value="' + $('#char_str_op1').text() + '" /></div>';
						o += '<div class="charfl">Strength Option 1 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_str_op1t" class="charfid" type="text" value="' + $('#char_str_op1').prop('title') + '" /></div>';
	      	break;
			case "char_str_op2":
						o += '<div class="charfl">Strength Option 2:</div>';
						o += '<div class="charfi"><input data-k="char_str_op2" class="charfid" type="text" value="' + $('#char_str_op2').text() + '" /></div>';
						o += '<div class="charfl">Strength Option 2 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_str_op2t" class="charfid" type="text" value="' + $('#char_str_op2').prop('title') + '" /></div>';
	      	break;
			case "char_str_op3":
						o += '<div class="charfl">Strength Option 3:</div>';
						o += '<div class="charfi"><input data-k="char_str_op3" class="charfid" type="text" value="' + $('#char_str_op3').text() + '" /></div>';
						o += '<div class="charfl">Strength Option 3 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_str_op3t" class="charfid" type="text" value="' + $('#char_str_op3').prop('title') + '" /></div>';
	      	break;
			case "char_dex":
						o += '<div class="charfl">Dexterity:</div>';
						o += '<div class="charfi"><input data-k="char_dex" class="charfid" type="text" value="' + $('#char_dex').text() + '" /></div>';
	      	break;
			case "char_dex_bonus":
						o += '<div class="charfl">Dexterity Bonus:</div>';
						o += '<div class="charfi"><input data-k="char_dex_bonus" class="charfid" type="text" value="' + $('#char_dex_bonus').text() + '" /></div>';
	      	break;
			case "char_dex_op1":
						o += '<div class="charfl">Dexterity Option 1:</div>';
						o += '<div class="charfi"><input data-k="char_dex_op1" class="charfid" type="text" value="' + $('#char_dex_op1').text() + '" /></div>';
						o += '<div class="charfl">Dexterity Option 1 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_dex_op1t" class="charfid" type="text" value="' + $('#char_dex_op1').prop('title') + '" /></div>';
	      	break;
			case "char_dex_op2":
						o += '<div class="charfl">Dexterity Option 2:</div>';
						o += '<div class="charfi"><input data-k="char_dex_op2" class="charfid" type="text" value="' + $('#char_dex_op2').text() + '" /></div>';
						o += '<div class="charfl">Dexterity Option 2 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_dex_op2t" class="charfid" type="text" value="' + $('#char_dex_op2').prop('title') + '" /></div>';
	      	break;
			case "char_dex_op3":
						o += '<div class="charfl">Dexterity Option 3:</div>';
						o += '<div class="charfi"><input data-k="char_dex_op3" class="charfid" type="text" value="' + $('#char_dex_op3').text() + '" /></div>';
						o += '<div class="charfl">Dexterity Option 3 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_dex_op3t" class="charfid" type="text" value="' + $('#char_dex_op3').prop('title') + '" /></div>';
	      	break;


			case "char_con":
						o += '<div class="charfl">Constitution:</div>';
						o += '<div class="charfi"><input data-k="char_con" class="charfid" type="text" value="' + $('#char_con').text() + '" /></div>';
	      	break;
			case "char_con_bonus":
						o += '<div class="charfl">Constitution Bonus:</div>';
						o += '<div class="charfi"><input data-k="char_con_bonus" class="charfid" type="text" value="' + $('#char_con_bonus').text() + '" /></div>';
	      	break;
			case "char_con_op1":
						o += '<div class="charfl">Constitution Option 1:</div>';
						o += '<div class="charfi"><input data-k="char_con_op1" class="charfid" type="text" value="' + $('#char_con_op1').text() + '" /></div>';
						o += '<div class="charfl">Constitution Option 1 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_con_op1t" class="charfid" type="text" value="' + $('#char_con_op1').prop('title') + '" /></div>';
	      	break;
			case "char_con_op2":
						o += '<div class="charfl">Constitution Option 2:</div>';
						o += '<div class="charfi"><input data-k="char_con_op2" class="charfid" type="text" value="' + $('#char_con_op2').text() + '" /></div>';
						o += '<div class="charfl">Constitution Option 2 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_con_op2t" class="charfid" type="text" value="' + $('#char_con_op2').prop('title') + '" /></div>';
	      	break;
			case "char_con_op3":
						o += '<div class="charfl">Constitution Option 3:</div>';
						o += '<div class="charfi"><input data-k="char_con_op3" class="charfid" type="text" value="' + $('#char_con_op3').text() + '" /></div>';
						o += '<div class="charfl">Constitution Option 3 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_con_op3t" class="charfid" type="text" value="' + $('#char_con_op3').prop('title') + '" /></div>';
	      	break;

			case "char_int":
						o += '<div class="charfl">Intelligence:</div>';
						o += '<div class="charfi"><input data-k="char_int" class="charfid" type="text" value="' + $('#char_int').text() + '" /></div>';
	      	break;
			case "char_int_bonus":
						o += '<div class="charfl">Intelligence Bonus:</div>';
						o += '<div class="charfi"><input data-k="char_int_bonus" class="charfid" type="text" value="' + $('#char_int_bonus').text() + '" /></div>';
	      	break;
			case "char_int_op1":
						o += '<div class="charfl">Intelligence Option 1:</div>';
						o += '<div class="charfi"><input data-k="char_int_op1" class="charfid" type="text" value="' + $('#char_int_op1').text() + '" /></div>';
						o += '<div class="charfl">Intelligence Option 1 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_int_op1t" class="charfid" type="text" value="' + $('#char_int_op1').prop('title') + '" /></div>';
	      	break;
			case "char_int_op2":
						o += '<div class="charfl">Intelligence Option 2:</div>';
						o += '<div class="charfi"><input data-k="char_int_op2" class="charfid" type="text" value="' + $('#char_int_op2').text() + '" /></div>';
						o += '<div class="charfl">Intelligence Option 2 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_int_op2t" class="charfid" type="text" value="' + $('#char_int_op2').prop('title') + '" /></div>';
	      	break;
			case "char_int_op3":
						o += '<div class="charfl">Intelligence Option 3:</div>';
						o += '<div class="charfi"><input data-k="char_int_op3" class="charfid" type="text" value="' + $('#char_int_op3').text() + '" /></div>';
						o += '<div class="charfl">Intelligence Option 3 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_int_op3t" class="charfid" type="text" value="' + $('#char_int_op3').prop('title') + '" /></div>';
	      	break;

			case "char_wis":
						o += '<div class="charfl">Wisdom:</div>';
						o += '<div class="charfi"><input data-k="char_wis" class="charfid" type="text" value="' + $('#char_wis').text() + '" /></div>';
	      	break;
			case "char_wis_bonus":
						o += '<div class="charfl">Wisdom Bonus:</div>';
						o += '<div class="charfi"><input data-k="char_wis_bonus" class="charfid" type="text" value="' + $('#char_wis_bonus').text() + '" /></div>';
	      	break;
			case "char_wis_op1":
						o += '<div class="charfl">Wisdom Option 1:</div>';
						o += '<div class="charfi"><input data-k="char_wis_op1" class="charfid" type="text" value="' + $('#char_wis_op1').text() + '" /></div>';
						o += '<div class="charfl">Wisdom Option 1 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_wis_op1t" class="charfid" type="text" value="' + $('#char_wis_op1').prop('title') + '" /></div>';
	      	break;
			case "char_wis_op2":
						o += '<div class="charfl">Wisdom Option 2:</div>';
						o += '<div class="charfi"><input data-k="char_wis_op2" class="charfid" type="text" value="' + $('#char_wis_op2').text() + '" /></div>';
						o += '<div class="charfl">Wisdom Option 2 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_wis_op2t" class="charfid" type="text" value="' + $('#char_wis_op2').prop('title') + '" /></div>';
	      	break;
			case "char_wis_op3":
						o += '<div class="charfl">Wisdom Option 3:</div>';
						o += '<div class="charfi"><input data-k="char_wis_op3" class="charfid" type="text" value="' + $('#char_wis_op3').text() + '" /></div>';
						o += '<div class="charfl">Wisdom Option 3 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_wis_op3t" class="charfid" type="text" value="' + $('#char_wis_op3').prop('title') + '" /></div>';
	      	break;

			case "char_cha":
						o += '<div class="charfl">Charisma:</div>';
						o += '<div class="charfi"><input data-k="char_cha" class="charfid" type="text" value="' + $('#char_cha').text() + '" /></div>';
	      	break;
			case "char_cha_bonus":
						o += '<div class="charfl">Charisma Bonus:</div>';
						o += '<div class="charfi"><input data-k="char_cha_bonus" class="charfid" type="text" value="' + $('#char_cha_bonus').text() + '" /></div>';
	      	break;
			case "char_cha_op1":
						o += '<div class="charfl">Charisma Option 1:</div>';
						o += '<div class="charfi"><input data-k="char_cha_op1" class="charfid" type="text" value="' + $('#char_cha_op1').text() + '" /></div>';
						o += '<div class="charfl">Charisma Option 1 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_cha_op1t" class="charfid" type="text" value="' + $('#char_cha_op1').prop('title') + '" /></div>';
	      	break;
			case "char_cha_op2":
						o += '<div class="charfl">Charisma Option 2:</div>';
						o += '<div class="charfi"><input data-k="char_cha_op2" class="charfid" type="text" value="' + $('#char_cha_op2').text() + '" /></div>';
						o += '<div class="charfl">Charisma Option 2 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_cha_op2t" class="charfid" type="text" value="' + $('#char_cha_op2').prop('title') + '" /></div>';
	      	break;
			case "char_cha_op3":
						o += '<div class="charfl">Charisma Option 3:</div>';
						o += '<div class="charfi"><input data-k="char_cha_op3" class="charfid" type="text" value="' + $('#char_cha_op3').text() + '" /></div>';
						o += '<div class="charfl">Charisma Option 3 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_cha_op3t" class="charfid" type="text" value="' + $('#char_cha_op3').prop('title') + '" /></div>';
	      	break;


			case "char_ac":
						o += '<div class="charfl">Armor Class:</div>';
						o += '<div class="charfi"><input data-k="char_ac" class="charfid" type="text" value="' + $('#char_ac').text() + '" /></div>';
	      	break;
			case "char_ac_armor":
						o += '<div class="charfl">AC Armor:</div>';
						o += '<div class="charfi"><input data-k="char_ac_armor" class="charfid" type="text" value="' + $('#char_ac_armor').text() + '" /></div>';
	      	break;
			case "char_ac_shield":
						o += '<div class="charfl">AC Shield:</div>';
						o += '<div class="charfi"><input data-k="char_ac_shield" class="charfid" type="text" value="' + $('#char_ac_shield').text() + '" /></div>';
	      	break;

			case "char_hp":
						o += '<div class="charfl">Hit Points:</div>';
						o += '<div class="charfi"><input data-k="char_hp" class="charfid" type="text" value="' + $('#char_hp').text() + '" /></div>';
	      	break;
			case "char_hp_max":
						o += '<div class="charfl">Max Hit Points:</div>';
						o += '<div class="charfi"><input data-k="char_hp_max" class="charfid" type="text" value="' + $('#char_hp_max').text() + '" /></div>';
	      	break;
			case "char_hp_tmp":
						o += '<div class="charfl">Temporary Hit Points:</div>';
						o += '<div class="charfi"><input data-k="char_hp_tmp" class="charfid" type="text" value="' + $('#char_hp_tmp').text() + '" /></div>';
	      	break;

			case "char_speed":
						o += '<div class="charfl">Movement Speed:</div>';
						o += '<div class="charfi"><input data-k="char_speed" class="charfid" type="text" value="' + $('#char_speed').text() + '" /></div>';
	      	break;
			case "char_speed_swim":
						o += '<div class="charfl">Swim Speed:</div>';
						o += '<div class="charfi"><input data-k="char_speed_swim" class="charfid" type="text" value="' + $('#char_speed_swim').text() + '" /></div>';
	      	break;
			case "char_speed_fly":
						o += '<div class="charfl">Fly Speed:</div>';
						o += '<div class="charfi"><input data-k="char_speed_fly" class="charfid" type="text" value="' + $('#char_speed_fly').text() + '" /></div>';
	      	break;


			case "char_level_xp":
						o += '<div class="charfl">Earned Experience:</div>';
						o += '<div class="charfi"><input data-k="char_level_xp" class="charfid" type="text" value="' + $('#char_level_xp').text() + '" /></div>';
	      	break;
			case "char_level":
						o += '<div class="charfl">Character Level:</div>';
						o += '<div class="charfi"><input data-k="char_level" class="charfid" type="text" value="' + $('#char_level').text() + '" /></div>';
	      	break;
			case "char_level_sp":
						o += '<div class="charfl">Spell/Magic Points:</div>';
						o += '<div class="charfi"><input data-k="char_level_sp" class="charfid" type="text" value="' + $('#char_level_sp').text() + '" /></div>';
	      	break;
			case "char_level_dmp":
						o += '<div class="charfl">Dragon Magic Points:</div>';
						o += '<div class="charfi"><input data-k="char_level_dmp" class="charfid" type="text" value="' + $('#char_level_dmp').text() + '" /></div>';
	      	break;
			case "char_level_psp":
						o += '<div class="charfl">Psyonic Points:</div>';
						o += '<div class="charfi"><input data-k="char_level_psp" class="charfid" type="text" value="' + $('#char_level_psp').text() + '" /></div>';
	      	break;

			case "char_toggle1":
						o += '<div class="charfl">Toggle 1 Color:</div>';
						o += '<div>';
						mcolor = rgb2hex($(this).css('background-color'));
						o += '<div class="togglepick ' + ((mcolor=='#fc0303')?'togglepicked':'') + '" style="background-color:#fc0303;" data-k="#fc0303"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#fc8c03')?'togglepicked':'') + '" style="background-color:#fc8c03;" data-k="#fc8c03"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#fcf803')?'togglepicked':'') + '" style="background-color:#fcf803;" data-k="#fcf803"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#4efc03')?'togglepicked':'') + '" style="background-color:#4efc03;" data-k="#4efc03"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#03bafc')?'togglepicked':'') + '" style="background-color:#03bafc;" data-k="#03bafc"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#1403fc')?'togglepicked':'') + '" style="background-color:#1403fc;" data-k="#1403fc"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#e703fc')?'togglepicked':'') + '" style="background-color:#e703fc;" data-k="#e703fc"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#afafaf')?'togglepicked':'') + '" style="background-color:#afafaf;" data-k="#afafaf"></div>';
						o += '</div>'
						o += '<div class="charfi" style="display: none;"><input id="char_toggle_" data-k="char_toggle1" class="charfid" type="text" value="'+mcolor+'" /></div>';
						o += '<div class="charfl">Toggle 1 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_toggle1t" class="charfid" type="text" value="' + $(this).attr('title') + '" /></div>';
	      	break;
			case "char_toggle2":
						o += '<div class="charfl">Toggle 2 Color:</div>';
						o += '<div>';
						mcolor = rgb2hex($(this).css('background-color'));
						o += '<div class="togglepick ' + ((mcolor=='#fc0303')?'togglepicked':'') + '" style="background-color:#fc0303;" data-k="#fc0303"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#fc8c03')?'togglepicked':'') + '" style="background-color:#fc8c03;" data-k="#fc8c03"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#fcf803')?'togglepicked':'') + '" style="background-color:#fcf803;" data-k="#fcf803"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#4efc03')?'togglepicked':'') + '" style="background-color:#4efc03;" data-k="#4efc03"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#03bafc')?'togglepicked':'') + '" style="background-color:#03bafc;" data-k="#03bafc"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#1403fc')?'togglepicked':'') + '" style="background-color:#1403fc;" data-k="#1403fc"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#e703fc')?'togglepicked':'') + '" style="background-color:#e703fc;" data-k="#e703fc"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#afafaf')?'togglepicked':'') + '" style="background-color:#afafaf;" data-k="#afafaf"></div>';
						o += '</div>'
						o += '<div class="charfi" style="display: none;"><input id="char_toggle_" data-k="char_toggle2" class="charfid" type="text" value="'+mcolor+'" /></div>';
						o += '<div class="charfl">Toggle 2 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_toggle2t" class="charfid" type="text" value="' + $(this).attr('title') + '" /></div>';
	      	break;
			case "char_toggle3":
						o += '<div class="charfl">Toggle 3 Color:</div>';
						o += '<div>';
						mcolor = rgb2hex($(this).css('background-color'));
						o += '<div class="togglepick ' + ((mcolor=='#fc0303')?'togglepicked':'') + '" style="background-color:#fc0303;" data-k="#fc0303"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#fc8c03')?'togglepicked':'') + '" style="background-color:#fc8c03;" data-k="#fc8c03"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#fcf803')?'togglepicked':'') + '" style="background-color:#fcf803;" data-k="#fcf803"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#4efc03')?'togglepicked':'') + '" style="background-color:#4efc03;" data-k="#4efc03"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#03bafc')?'togglepicked':'') + '" style="background-color:#03bafc;" data-k="#03bafc"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#1403fc')?'togglepicked':'') + '" style="background-color:#1403fc;" data-k="#1403fc"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#e703fc')?'togglepicked':'') + '" style="background-color:#e703fc;" data-k="#e703fc"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#afafaf')?'togglepicked':'') + '" style="background-color:#afafaf;" data-k="#afafaf"></div>';
						o += '</div>'
						o += '<div class="charfi" style="display: none;"><input id="char_toggle_" data-k="char_toggle3" class="charfid" type="text" value="'+mcolor+'" /></div>';
						o += '<div class="charfl">Toggle 3 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_toggle3t" class="charfid" type="text" value="' + $(this).attr('title') + '" /></div>';
	      	break;
			case "char_toggle4":
						o += '<div class="charfl">Toggle 4 Color:</div>';
						o += '<div>';
						mcolor = rgb2hex($(this).css('background-color'));
						o += '<div class="togglepick ' + ((mcolor=='#fc0303')?'togglepicked':'') + '" style="background-color:#fc0303;" data-k="#fc0303"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#fc8c03')?'togglepicked':'') + '" style="background-color:#fc8c03;" data-k="#fc8c03"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#fcf803')?'togglepicked':'') + '" style="background-color:#fcf803;" data-k="#fcf803"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#4efc03')?'togglepicked':'') + '" style="background-color:#4efc03;" data-k="#4efc03"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#03bafc')?'togglepicked':'') + '" style="background-color:#03bafc;" data-k="#03bafc"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#1403fc')?'togglepicked':'') + '" style="background-color:#1403fc;" data-k="#1403fc"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#e703fc')?'togglepicked':'') + '" style="background-color:#e703fc;" data-k="#e703fc"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#afafaf')?'togglepicked':'') + '" style="background-color:#afafaf;" data-k="#afafaf"></div>';
						o += '</div>'
						o += '<div class="charfi" style="display: none;"><input id="char_toggle_" data-k="char_toggle4" class="charfid" type="text" value="'+mcolor+'" /></div>';
						o += '<div class="charfl">Toggle 4 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_toggle4t" class="charfid" type="text" value="' + $(this).attr('title') + '" /></div>';
	      	break;
			case "char_toggle5":
						o += '<div class="charfl">Toggle 5 Color:</div>';
						o += '<div>';
						mcolor = rgb2hex($(this).css('background-color'));
						o += '<div class="togglepick ' + ((mcolor=='#fc0303')?'togglepicked':'') + '" style="background-color:#fc0303;" data-k="#fc0303"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#fc8c03')?'togglepicked':'') + '" style="background-color:#fc8c03;" data-k="#fc8c03"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#fcf803')?'togglepicked':'') + '" style="background-color:#fcf803;" data-k="#fcf803"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#4efc03')?'togglepicked':'') + '" style="background-color:#4efc03;" data-k="#4efc03"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#03bafc')?'togglepicked':'') + '" style="background-color:#03bafc;" data-k="#03bafc"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#1403fc')?'togglepicked':'') + '" style="background-color:#1403fc;" data-k="#1403fc"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#e703fc')?'togglepicked':'') + '" style="background-color:#e703fc;" data-k="#e703fc"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#afafaf')?'togglepicked':'') + '" style="background-color:#afafaf;" data-k="#afafaf"></div>';
						o += '</div>'
						o += '<div class="charfi" style="display: none;"><input id="char_toggle_" data-k="char_toggle5" class="charfid" type="text" value="'+mcolor+'" /></div>';
						o += '<div class="charfl">Toggle 5 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_toggle5t" class="charfid" type="text" value="' + $(this).attr('title') + '" /></div>';
	      	break;
			case "char_toggle6":
						o += '<div class="charfl">Toggle 6 Color:</div>';
						o += '<div>';
						mcolor = rgb2hex($(this).css('background-color'));
						o += '<div class="togglepick ' + ((mcolor=='#fc0303')?'togglepicked':'') + '" style="background-color:#fc0303;" data-k="#fc0303"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#fc8c03')?'togglepicked':'') + '" style="background-color:#fc8c03;" data-k="#fc8c03"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#fcf803')?'togglepicked':'') + '" style="background-color:#fcf803;" data-k="#fcf803"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#4efc03')?'togglepicked':'') + '" style="background-color:#4efc03;" data-k="#4efc03"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#03bafc')?'togglepicked':'') + '" style="background-color:#03bafc;" data-k="#03bafc"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#1403fc')?'togglepicked':'') + '" style="background-color:#1403fc;" data-k="#1403fc"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#e703fc')?'togglepicked':'') + '" style="background-color:#e703fc;" data-k="#e703fc"></div>';
						o += '<div class="togglepick ' + ((mcolor=='#afafaf')?'togglepicked':'') + '" style="background-color:#afafaf;" data-k="#afafaf"></div>';
						o += '</div>'
						o += '<div class="charfi" style="display: none;"><input id="char_toggle_" data-k="char_toggle6" class="charfid" type="text" value="'+mcolor+'" /></div>';
						o += '<div class="charfl">Toggle 6 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_toggle6t" class="charfid" type="text" value="' + $(this).attr('title') + '" /></div>';
	      	break;

			case "char_op1":
						o += '<div class="charfl">Option 1:</div>';
						o += '<div class="charfi"><input data-k="char_op1" class="charfid" type="text" value="' + $('#char_op1').text() + '" /></div>';
						o += '<div class="charfl">Option 1 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_op1t" class="charfid" type="text" value="' + $('#char_op1').prop('title') + '" /></div>';
	      	break;
			case "char_op2":
						o += '<div class="charfl">Option 2:</div>';
						o += '<div class="charfi"><input data-k="char_op2" class="charfid" type="text" value="' + $('#char_op2').text() + '" /></div>';
						o += '<div class="charfl">Option 2 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_op2t" class="charfid" type="text" value="' + $('#char_op2').prop('title') + '" /></div>';
	      	break;
			case "char_op3":
						o += '<div class="charfl">Option 3:</div>';
						o += '<div class="charfi"><input data-k="char_op3" class="charfid" type="text" value="' + $('#char_op3').text() + '" /></div>';
						o += '<div class="charfl">Option 3 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_op3t" class="charfid" type="text" value="' + $('#char_op3').prop('title') + '" /></div>';
	      	break;
			case "char_op4":
						o += '<div class="charfl">Option 4:</div>';
						o += '<div class="charfi"><input data-k="char_op4" class="charfid" type="text" value="' + $('#char_op4').text() + '" /></div>';
						o += '<div class="charfl">Option 4 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_op4t" class="charfid" type="text" value="' + $('#char_op4').prop('title') + '" /></div>';
	      	break;
			case "char_op5":
						o += '<div class="charfl">Option 5:</div>';
						o += '<div class="charfi"><input data-k="char_op5" class="charfid" type="text" value="' + $('#char_op5').text() + '" /></div>';
						o += '<div class="charfl">Option 5 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_op5t" class="charfid" type="text" value="' + $('#char_op5').prop('title') + '" /></div>';
	      	break;
			case "char_op6":
						o += '<div class="charfl">Option 6:</div>';
						o += '<div class="charfi"><input data-k="char_op6" class="charfid" type="text" value="' + $('#char_op6').text() + '" /></div>';
						o += '<div class="charfl">Option 6 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_op6t" class="charfid" type="text" value="' + $('#char_op6').prop('title') + '" /></div>';
	      	break;
			case "char_op7":
						o += '<div class="charfl">Option 7:</div>';
						o += '<div class="charfi"><input data-k="char_op7" class="charfid" type="text" value="' + $('#char_op7').text() + '" /></div>';
						o += '<div class="charfl">Option 7 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_op7t" class="charfid" type="text" value="' + $('#char_op7').prop('title') + '" /></div>';
	      	break;
			case "char_op8":
						o += '<div class="charfl">Option 8:</div>';
						o += '<div class="charfi"><input data-k="char_op8" class="charfid" type="text" value="' + $('#char_op8').text() + '" /></div>';
						o += '<div class="charfl">Option 8 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_op8t" class="charfid" type="text" value="' + $('#char_op8').prop('title') + '" /></div>';
	      	break;
			case "char_op9":
						o += '<div class="charfl">Option 9:</div>';
						o += '<div class="charfi"><input data-k="char_op9" class="charfid" type="text" value="' + $('#char_op9').text() + '" /></div>';
						o += '<div class="charfl">Option 9 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_op9t" class="charfid" type="text" value="' + $('#char_op9').prop('title') + '" /></div>';
	      	break;
			case "char_op10":
						o += '<div class="charfl">Option 10:</div>';
						o += '<div class="charfi"><input data-k="char_op10" class="charfid" type="text" value="' + $('#char_op10').text() + '" /></div>';
						o += '<div class="charfl">Option 10 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_op10t" class="charfid" type="text" value="' + $('#char_op10').prop('title') + '" /></div>';
	      	break;
			case "char_op11":
						o += '<div class="charfl">Option 11:</div>';
						o += '<div class="charfi"><input data-k="char_op11" class="charfid" type="text" value="' + $('#char_op11').text() + '" /></div>';
						o += '<div class="charfl">Option 11 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_op11t" class="charfid" type="text" value="' + $('#char_op11').prop('title') + '" /></div>';
	      	break;
			case "char_op12":
						o += '<div class="charfl">Option 12:</div>';
						o += '<div class="charfi"><input data-k="char_op12" class="charfid" type="text" value="' + $('#char_op12').text() + '" /></div>';
						o += '<div class="charfl">Option 12 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_op12t" class="charfid" type="text" value="' + $('#char_op12').prop('title') + '" /></div>';
	      	break;
			case "char_op13":
						o += '<div class="charfl">Option 13:</div>';
						o += '<div class="charfi"><input data-k="char_op13" class="charfid" type="text" value="' + $('#char_op13').text() + '" /></div>';
						o += '<div class="charfl">Option 13 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_op13t" class="charfid" type="text" value="' + $('#char_op13').prop('title') + '" /></div>';
	      	break;
			case "char_op14":
						o += '<div class="charfl">Option 14:</div>';
						o += '<div class="charfi"><input data-k="char_op14" class="charfid" type="text" value="' + $('#char_op14').text() + '" /></div>';
						o += '<div class="charfl">Option 14 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_op14t" class="charfid" type="text" value="' + $('#char_op14').prop('title') + '" /></div>';
	      	break;
			case "char_op15":
						o += '<div class="charfl">Option 15:</div>';
						o += '<div class="charfi"><input data-k="char_op15" class="charfid" type="text" value="' + $('#char_op15').text() + '" /></div>';
						o += '<div class="charfl">Option 15 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_op15t" class="charfid" type="text" value="' + $('#char_op15').prop('title') + '" /></div>';
	      	break;
			case "char_op16":
						o += '<div class="charfl">Option 16:</div>';
						o += '<div class="charfi"><input data-k="char_op16" class="charfid" type="text" value="' + $('#char_op16').text() + '" /></div>';
						o += '<div class="charfl">Option 16 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_op16t" class="charfid" type="text" value="' + $('#char_op16').prop('title') + '" /></div>';
	      	break;
			case "char_op17":
						o += '<div class="charfl">Option 17:</div>';
						o += '<div class="charfi"><input data-k="char_op17" class="charfid" type="text" value="' + $('#char_op17').text() + '" /></div>';
						o += '<div class="charfl">Option 17 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_op17t" class="charfid" type="text" value="' + $('#char_op17').prop('title') + '" /></div>';
	      	break;
			case "char_op18":
						o += '<div class="charfl">Option 18:</div>';
						o += '<div class="charfi"><input data-k="char_op18" class="charfid" type="text" value="' + $('#char_op18').text() + '" /></div>';
						o += '<div class="charfl">Option 18 Title:</div>';
						o += '<div class="charfi"><input id="char_togglet_" data-k="char_op18t" class="charfid" type="text" value="' + $('#char_op18').prop('title') + '" /></div>';
	      	break;



			case "char_add_spells":
						o += '<div class="charfl">Spells &amp; Powers:</div>';
						o += '<div class="charfi"><textarea data-k="char_spells" class="charfid" type="text">' + br2nl($('#char_spells').html()) + '</textarea></div>';
	      	break;
			case "char_add_bgnote":
						if( $('#char_background').is(":visible") ){
							o += '<div class="charfl">Character Background:</div>';
							o += '<div class="charfi"><textarea data-k="char_background" class="charfid" type="text">' + br2nl($('#char_background').html()) + '</textarea></div>';
						}
						if( $('#char_languages').is(":visible") ){
							o += '<div class="charfl">Character Languages:</div>';
							o += '<div class="charfi"><textarea data-k="char_languages" class="charfid" type="text">' + br2nl($('#char_languages').html()) + '</textarea></div>';
						}
						if( $('#char_notes').is(":visible") ){
							o += '<div class="charfl">Character Notes:</div>';
							o += '<div class="charfi"><textarea data-k="char_notes" class="charfid" type="text">' + br2nl($('#char_notes').html()) + '</textarea></div>';
						}
						if( $('#char_features').is(":visible") ){
							o += '<div class="charfl">Character Features:</div>';
							o += '<div class="charfi"><textarea data-k="char_features" class="charfid" type="text">' + br2nl($('#char_features').html()) + '</textarea></div>';
						}
	      	break;

			case "char_add_weapons":
						o += '<div class="charfl">Weapons:</div>';
						o += '<div class="charfi"><textarea data-k="char_weapons" class="charfid" type="text">' + br2nl($('#char_weapons').html()) + '</textarea></div>';
	      	break;
			case "char_add_armor":
						o += '<div class="charfl">Armors:</div>';
						o += '<div class="charfi"><textarea data-k="char_armors" class="charfid" type="text">' + br2nl($('#char_armors').html()) + '</textarea></div>';
	      	break;
			case "char_add_equiptment":
						o += '<div class="charfl">Equipments:</div>';
						o += '<div class="charfi"><textarea data-k="char_equipments" class="charfid" type="text">' + br2nl($('#char_equipments').html()) + '</textarea></div>';
	      	break;

			default:
		}
		$('#char_form_loader_set').html(o);
	});

	$('#pop_box_champs').on('click', '.ch_action_class', function(){
		let o = '';
		$('#char_form_loader').show();
		o += '<div class="charfl">Update Character Class:</div>';

		if( $(this).data('k') > 0 ){
			o += '<div style="display: inline-block;">';
				o += '<div id="char_class_remove" data-k="' + $(this).data('k') + '" style="cursor:pointer; padding: 4px; border: 1px solid #333; background-color:#cb0b0b; color:#fff; width: 80px;">Remove</div>';
			o += '</div>';
		}

		let fill_class    = '';
		let fill_subclass = '';
		let fill_classlvl = '';
		let holdk = $(this).data('k');
		$('.char_class_item').each(function(i, v) {
			if( $(v).data('k') == holdk ){
				fill_class = $(v).find('.char_class_class').text();
				fill_subclass = $(v).find('.char_class_subclass').text();
				fill_classlvl = $(v).find('.char_class_level').text();
			}
		});

		o += '<div style="display: inline-block;">';
			o += '<div>';
				o += '<div style="display:inline-block;text-align: left; width: 150px;margin: 0px 10px;">Class</div>';
				o += '<div style="display:inline-block;text-align: left; width: 150px;margin: 0px 10px;">SubClass</div>';
				o += '<div style="display:inline-block;text-align: left; width: 50px;margin: 0px 10px;">Level</div>';
			o += '</div>';
			o += '<div>';
				o += '<div style="display:inline-block;"><input id="char_class_class"    style="width: 150px; margin: 10px;" data-k="char_classes" class="charfid_classes" type="text" value="'+fill_class+'" /></div>';
				o += '<div style="display:inline-block;"><input id="char_class_subclass" style="width: 150px; margin: 10px;" data-k="char_classes" class="charfid_classes" type="text" value="'+fill_subclass+'" /></div>';
				o += '<div style="display:inline-block;"><input id="char_class_level"    style="width: 50px;  margin: 10px;" data-k="char_classes" class="charfid_classes" type="text" value="'+fill_classlvl+'" /></div>';
			o += '</div>';
		o += '</div>';
		$('#char_form_loader_set').html(o);
	});




	$('#pop_box_champs').on('click', '#char_cancel', function(){ $('#char_form_loader').hide(); });
	$('#pop_box_champs').on('click', '#char_submit', function(){
		char_set_fields = {};

		$('#char_submit').prop("disabled",true);
		$('.charfid').each(function(i, v) {
			char_set_fields[ $(v).data('k') ] = $(v).val();
			if( $(v).attr('id') == 'char_toggle_' ){
				$('#' + $(v).data('k') ).css('background-color', $(v).val() );
			}else if( $(v).attr('id') == 'char_togglet_' ){
				$('#' + $(v).data('k').slice(0, -1) ).prop('title', $(v).val());

			}else{
				$('#' + $(v).data('k') ).html( nl2br($(v).val()) );
			}
		});

		if( $('.charfid_classes').length > 0 ){
			let use_class_key = 0;
			if( $('#char_class_remove').length > 0 ){ use_class_key = $('#char_class_remove').data('k'); }
			char_set_class_unit( use_class_key, 0 );
		}
		update_char_sheet();
		$('#char_submit').prop("disabled",false);
		$('#char_form_loader').hide();
	});

	function char_set_class_unit(t,tt){
		if(t>0){
			$('.char_class_item').each(function(i, v) {
				if( $(v).data('k') == t ){
					$(this).remove();
				}
			});
		}
		let o = '[';
		$('.char_class_item').each(function(i, v) {
			if( o!='['){ o += ','; }
			o += '["' + $(v).find('.char_class_class').html() + '","' +  $(v).find('.char_class_subclass').html() + '","' +  $(v).find('.char_class_level').html() + '"]';
		});
		if( t == 0 || tt == 0 ){
			if( o!='['){ o += ','; }
			o += '["' + $('#char_class_class').val() + '","' +  $('#char_class_subclass').val() + '","' +  $('#char_class_level').val() + '"]';
		}
		o += ']';
		char_set_fields[ 'char_classes' ] = o;

		if( t == 0 || tt == 0 ){
			let outk = $('.char_class_item').length+1;
			let out = '<div data-k="'+outk+'" class="char_class_item">';
			out +='<div data-k="'+outk+'" style="cursor:pointer" class="ch_action_class char_class_edit">(e)</div>';

			out +='<div class="char_class_div_s">'
				out +='<div class="char_class_level">'+$('#char_class_level').val()+'</div>';
			out +='</div>'
			out +='<div class="char_class_div_l">';
				out +='<div class="char_class_class">'+$('#char_class_class').val()+'</div>';
				out +='<div class="char_class_subclass">'+$('#char_class_subclass').val()+'</div>';
			out +='</div>'


			out +='</div>';
			$('#char_classes').append( out );
			char_classes_sort();
		}

	}
	$('#pop_box_champs').on('click', '#char_class_remove', function(){
		char_set_fields = {};
		char_set_class_unit($(this).data('k'), 1);
		update_char_sheet();
		$('#char_submit').prop("disabled",false);
		$('#char_form_loader').hide();
	});

	function update_char_sheet(){
		// console.log( char_set_fields );
		s = {"vals":{"cx":cx, "k" : $('#char_portrait').data('k').toString(), "uu" : $('#user_using_user').data('k').toString(), "f": JSON.stringify(char_set_fields) }};
		$.ajax({
		  	type: "POST", url: "<ROOT_URL>/ajax/char_update", data: JSON.stringify(s), contentType: "application/json", dataType: 'json',
		    success: function (d) { 
	    		cx = d.cx;
		    	if( d.success == "true" ){
		    		// Update Complete.
		    	}
		    }
		});
	}

	function char_classes_sort(){
		let holdtop = [];
		$('.char_class_item').each(function(i, v) {
			holdtop.push( [ parseInt($(v).find('.char_class_level').text()), $(v) ] );
			$(v).remove();
		});
		holdtop.sort();
		$.each(holdtop, function(i,v){
			$('#char_classes').prepend( v[1] );
		})

	}

	$(document).on('click', '.die_roller_link', function(){
		$('#die_roller_div').show();
/*
		s = {"vals":{"cx":cx, "u":usr, "n1":n1, "n2":n2 ) }};
		$.ajax({
		  	type: "POST", url: "<ROOT_URL>/ajax/char_update", data: JSON.stringify(s), contentType: "application/json", dataType: 'json',
		    success: function (d) { 
	    		cx = d.cx;
		    	if( d.success == "true" ){
		    		// Update Complete.
		    	}
		    }
		});
*/
	});



});