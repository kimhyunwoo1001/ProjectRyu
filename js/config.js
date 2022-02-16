var CONFIG_DEFAULT = function(){
	var $form;
	var header_ctl;
	var $favicon_ico_file_upload, $favicon_img, $favicon_tmp_idx, $favicon_url, $favicon_img_delete;
	var $favicon_png_file_upload, $favicon_png_img, $favicon_png_tmp_idx, $favicon_png_url, $favicon_png_img_delete;
	var $main_png_file_upload, $main_png_img, $main_png_tmp_idx, $main_png_url,$lang_code;
	var $close_file_upload, $close_img, $close_tmp_idx, $close_url;
	var $localize;
	var init = function(){
		$form = $('#dof');
		$favicon_ico_file_upload = $('#favicon_ico_file_upload');
		$favicon_img = $('#favicon_img');
		$favicon_tmp_idx = $('#favicon_tmp_idx');
		$favicon_url = $("#favicon_url");
		$favicon_img_delete = $('#favicon_img_delete');

		$favicon_png_file_upload = $('#favicon_png_file_upload');
		$favicon_png_img = $('#favicon_png_img');
		$favicon_png_tmp_idx = $("#favicon_png_tmp_idx");
		$favicon_png_url = $("#favicon_png_url");
		$favicon_png_img_delete = $('#favicon_png_img_delete');

		$main_png_file_upload = $('#main_png_file_upload');
		$main_png_img = $('#main_png_img');
		$main_png_tmp_idx = $("#main_png_tmp_idx");
		$main_png_url = $("#main_png_url");
		$close_file_upload = $('#close_file_upload');
		$close_img = $('#close_img');
		$close_tmp_idx = $("#close_tmp_idx");
		$close_url = $("#close_url");
		$lang_code = $('#lang_code');
		$localize = $("#config_time_zone");

		header_ctl = new HEADER_CONTROL();
		header_ctl.init();
		header_ctl.addBtn('save',function(){
			submit();
		});
		createEvent();
		$lang_code.change(function(){
			header_ctl.change();
		});
		setUpload();
		makeTimezoneSelect();
	};

	var removeImg = function(remove_type){
		switch(remove_type){
			case 'favicon_png' :
				$favicon_png_url.val("");
				$favicon_png_img.hide();
				$favicon_png_img_delete.hide();
				break;
			case 'favicon_ico' :
				$favicon_url.val("");
				$favicon_img.hide();
				$favicon_img_delete.hide();
				break;
			case 'main' :
				$main_png_url.val("");
				$main_png_img.hide();
				break;
			case 'close' :
				$close_url.val("");
				$close_img.hide();
				break;
		}
		header_ctl.change();
	};
	var submit = function(){
		var data = $form.serializeObject();
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/config/default.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					header_ctl.save();
					location.reload();
				}else
					alert(res.msg);
			}
		});
	};

	var createEvent = function(){
		$form.find('input, textarea').off('change, keyup').on('change, keyup, blur',function(){
			header_ctl.change();
		});
		$form.find('select').change(function(){
			header_ctl.change();
		});
		$form.find('input[type=checkbox],input[type=radio]').off('click').on('click',function(){
			header_ctl.change();
		});
	};

	var setUpload = function(){
		$favicon_ico_file_upload.fileupload({
			url: '/admin/ajax/upload_favicon.cm',
			formData: {temp: 'Y', target: 'config', type: 'ico'},
			dataType: 'json',
			singleFileUploads: false,
			limitMultiFileUploads: 1,
			dropZone: null,
			start: function(e, data){
				// TODO site 에서는 preloader 변수가 아직 없음
				//$preloader.show();
			},
			progress: function(e, data){
				// Calculate the completion percentage of the upload
				var progress = parseInt(data.loaded / data.total * 100, 10);
				if(progress == 100){
					//	data.context.removeClass('working');
				}
			},
			done: function(e, data){
				$.each(data.result.files, function(e, tmp){
					if(tmp.error == null){
						$favicon_img.show();
						$favicon_img_delete.show();
						$favicon_img.attr('src', CDN_UPLOAD_URL + tmp.url);
						$favicon_tmp_idx.val(tmp.tmp_idx);
						$favicon_url.val(tmp.url);
					}else{
						alert(tmp.error);
					}
				});
				header_ctl.change();
			},
			fail: function(e, data){
				alert(getLocalizeString("설명_업로드에실패하였습니다", "", "업로드에 실패 하였습니다."));
			}
		});
		$favicon_png_file_upload.fileupload({
			url: '/admin/ajax/upload_favicon.cm',
			formData: {temp: 'Y', target: 'config', type: 'png', width: 512, height: 512},
			dataType: 'json',
			singleFileUploads: false,
			limitMultiFileUploads: 1,
			dropZone: null,
			start: function(e, data){
				// TODO site 에서는 preloader 변수가 아직 없음
				//$preloader.show();
			},
			progress: function(e, data){
				// Calculate the completion percentage of the upload
				var progress = parseInt(data.loaded / data.total * 100, 10);
				if(progress == 100){
					//	data.context.removeClass('working');
				}
			},
			done: function(e, data){
				$.each(data.result.files, function(e, tmp){
					if(tmp.error == null){
						$favicon_png_img.show();
						$favicon_png_img_delete.show();
						$favicon_png_img.attr('src', CDN_UPLOAD_URL + tmp.url);
						$favicon_png_tmp_idx.val(tmp.tmp_idx);
						$favicon_png_url.val(tmp.url);
					}else{
						alert(tmp.error);
					}
				});
				header_ctl.change();
			},
			fail: function(e, data){
				alert(getLocalizeString("설명_업로드에실패하였습니다", "", "업로드에 실패 하였습니다."));
			}
		});
		$main_png_file_upload.fileupload({
			url: '/admin/ajax/upload_favicon.cm',
			formData: {temp: 'Y', target: 'config', type: 'png'},
			dataType: 'json',
			singleFileUploads: false,
			limitMultiFileUploads: 1,
			dropZone: null,
			start: function(e, data){
				// TODO site 에서는 preloader 변수가 아직 없음
				//$preloader.show();
			},
			progress: function(e, data){
				// Calculate the completion percentage of the upload
				var progress = parseInt(data.loaded / data.total * 100, 10);
				if(progress == 100){
					//	data.context.removeClass('working');
				}
			},
			done: function(e, data){
				$.each(data.result.files, function(e, tmp){
					if(tmp.error == null){
						$main_png_img.show();
						$main_png_img.attr('src', CDN_UPLOAD_URL + tmp.url);
						$main_png_tmp_idx.val(tmp.tmp_idx);
						$main_png_url.val(tmp.url);
					}else{
						alert(tmp.error);
					}
				});
				header_ctl.change();
			},
			fail: function(e, data){
				alert(getLocalizeString("설명_업로드에실패하였습니다", "", "업로드에 실패 하였습니다."));
			}
		});
		$close_file_upload.fileupload({
			url: '/admin/ajax/upload_favicon.cm',
			formData: {temp: 'Y', target: 'config'},
			dataType: 'json',
			singleFileUploads: false,
			limitMultiFileUploads: 1,
			dropZone: null,
			start: function(e, data){
				// TODO site 에서는 preloader 변수가 아직 없음
				//$preloader.show();
			},
			progress: function(e, data){
				// Calculate the completion percentage of the upload
				var progress = parseInt(data.loaded / data.total * 100, 10);
				if(progress == 100){
					//	data.context.removeClass('working');
				}
			},
			done: function(e, data){
				$.each(data.result.files, function(e, tmp){
					if(tmp.error == null){
						$close_img.show();
						$close_img.attr('src', CDN_UPLOAD_URL + tmp.url);
						$close_tmp_idx.val(tmp.tmp_idx);
						$close_url.val(tmp.url);
					}else{
						alert(tmp.error);
					}
				});
				header_ctl.change();
			},
			fail: function(e, data){
				alert(getLocalizeString("설명_업로드에실패하였습니다", "", "업로드에 실패 하였습니다."));
			}
		});
	};

	var makeTimezoneSelect = function(){
		$localize.chosen();
		$localize.off("change.localize").on("change.localize",function(){
			var lang_code = $(this).val();
			changeLocalize(lang_code);
		});
		changeLocalize($localize.val());
		setDaumAddress();
	};

	var changeLocalize = function(lang_code){
		$form.find('._address_format').hide();
		if( $form.find('._address_format._addr_'+lang_code.toLowerCase()).length > 0 ){
			$form.find('._address_format._addr_'+lang_code.toLowerCase()).show();
		} else {
			$form.find('._address_format._addr_international').show();
		}
	};

	function setDaumAddress(){
		var addr_daum = new ZIPCODE_DAUM();
		addr_daum.init({
			'addr_container' : $("#order_find_address"),
			'addr_pop' : $('#order_find_address ._add_list'),
			'post_code' : $form.find("input[name='post_code_kr']"),
			'addr' : $form.find("input[name='address_kr']"),
			'onStart' : function(){

			},
			'onComplete' : function(key){
				$form.find("input[name='detail_address']").focus();
				header_ctl.change();
			},
			'onClose' : function(){

			}
		});
	}



	return {
		init : function(){
			init();
		},
		removeImg : function(remove_type){
			removeImg(remove_type);
		}
	}
}();

var CONFIG_MEMBERSHIP = function(){
	var $content; // 페이지 전체 html
	var $join_setting, $join_info, $social_login_use_policy_wrap; // 가입 설정관련
	var $join_form_manage; // 가입 폼 관리 관련
	var header_ctl;
	var current_data = [];
	var delete_custom_arr = [];
	var delete_join_form_arr = [];

	var init = function(){
		$content = $('#content');

		$join_setting = $content.find('#join_setting');
		$join_info = $join_setting.find("#join_info");
		autosize($join_info);

		$social_login_use_policy_wrap = $join_setting.find('._social_login_use_policy_wrap');

		$join_form_manage = $content.find('._join_form_manage');

		createEvent();

		header_ctl = new HEADER_CONTROL();
		header_ctl.init();
		header_ctl.addBtn('save',function(){
			submit();
		});
	};


	var createEvent = function(){
		$content.find('input[type=checkbox]').not('#use_shopping_group').off('change').on('change',function(){
			if($(this).data('essential') !== undefined){
				if($(this).is(':checked')){
					$content.find('input[name="' + $(this).data('essential') + '"]').prop('disabled', false);
				}else{
					$content.find('input[name="' + $(this).data('essential') + '"]').prop({'disabled':true, 'checked':false});
				}
			}
			header_ctl.change();
		});

		$content.find('#use_email').off('click').on('click', function(){
			if($(this).is(':checked') === false){
				if(confirm(getLocalizeString('설명_이메일주소미사용알람', '', "이메일 사용 해제 시 아이디/비밀번호 찾기, 이메일 인증, 자동 메일 안내가 발송되지 않습니다. 사용 해제하시겠습니까?"))){
					$join_form_manage.find('#essential_email').prop({'checked':false});
				}else{
					return false;
				}
			}else{
				$join_form_manage.find('#essential_email').prop({'checked':true});
			}
		});

		$content.find('input[type=radio]').off('change').on('change',function(){
			header_ctl.change();

			if($(this).attr('name') === 'use_policy'){
				if($(this).val() === 'Y' ){
					$social_login_use_policy_wrap.show();
				}else{
					$social_login_use_policy_wrap.hide();
				}
			}
			if($(this).attr('name') === 'login_type'){
				if(confirm(getLocalizeString('설명_로그인계정변경시회원혜택에대한', '', "로그인 계정 변경시 회원 혜택에 대한 기준이 변경될 수 있습니다.\n예) 회원가입 시 포인트 중복 지급"))){
					if($(this).val() === 'email'){
						$join_form_manage.find('#use_email').prop({'disabled':true, 'checked':true});
						$join_form_manage.find('#essential_email').prop({'checked':true});
						$join_form_manage.find('#use_id').prop({'disabled':true,'checked':false});
						$join_form_manage.find('#essential_id').prop({'disabled':true,'checked':false});
					}else{
						$join_form_manage.find('#use_id').prop({'disabled':true,'checked':true});
						$join_form_manage.find('#essential_id').prop({'disabled':true,'checked':true});
						$join_form_manage.find('#use_email').prop({'disabled':false});
					}
				}else{
					if($(this).val() === 'email'){
						$join_form_manage.find('#login_type_id').prop('checked',true);
					}else{
						$join_form_manage.find('#login_type_email').prop('checked',true);
					}
				}
			}
		});

		$content.find('textarea').off('change').on('change',function(){
			header_ctl.change();
		});

		$content.find('._use_checkbox').off('change').on('change', function(){
			var check_cnt = 0;
			$content.find('._use_checkbox').each(function(){
				if($(this).is(':checked')){
					check_cnt++;
				}
			});
			if(check_cnt === 0){
				alert(getLocalizeString('설명_회원가입유형은최소1개이상설정해야합니다', '', '회원가입 유형은 최소 1개 이상 설정해야 합니다.'));
				$(this).prop('checked', true);
				return false;
			}

			if($(this).is(':checked')){
				$join_form_manage.find('#' + $(this).data('target')).show();
			}else{
				$join_form_manage.find('#' + $(this).data('target')).hide();
			}
			header_ctl.change();
		});

		$content.find('._solrtable').sortable({
			'handle' : '._showcase_handle',
			'start' : function(event, ui){
			},
			'stop' : function(event, ui){
				header_ctl.change();
			}
		});
	};


	var submit = function(){
		var data = $.extend({}, $join_setting.serializeObject(), $join_form_manage.serializeObject());

		data.custom_arr = [];
		$join_form_manage.find('._custom_type').each(function(){
			data.custom_arr.push($(this).data('customNo'));
		});
		data.custom_arr = JSON.stringify(data.custom_arr);
		data.delete_custom_arr = JSON.stringify(delete_custom_arr);
		data.delete_join_form_arr = JSON.stringify(delete_join_form_arr);
		data.join_form = {};

		var default_join_form = [];
		$join_form_manage.find('._default_join_form').each(function(){
			default_join_form.push({
				'code' : $(this).data('code'),
				'title' : $(this).data('title'),
				'description' : $(this).data('description'),
				'type' : $(this).data('type'),
				'values' : $(this).data('values'),
				'use' : $join_form_manage.find("input[name='default_join_form_" + $(this).data('formNo') + "_use']").is(':checked'),
				'essential' : $join_form_manage.find("input[name='default_join_form_" + $(this).data('formNo') + "_essential']").is(':checked')
			});
		});
		data.join_form.default = default_join_form;

		var business_join_form = [];
		$join_form_manage.find('._business_join_form').each(function(){
			business_join_form.push({
				'code' : $(this).data('code'),
				'title' : $(this).data('title'),
				'description' : $(this).data('description'),
				'type' : $(this).data('type'),
				'values' : $(this).data('values'),
				'use' : $join_form_manage.find("input[name='business_join_form_" + $(this).data('formNo') + "_use']").is(':checked'),
				'essential' : $join_form_manage.find("input[name='business_join_form_" + $(this).data('formNo') + "_essential']").is(':checked')
			});
		});
		data.join_form.business = business_join_form;

		$join_form_manage.find('._custom_type').each(function(){
			var custom_join_form = [];
			var custom_no = $(this).data('customNo');
			$join_form_manage.find('._custom_'+custom_no+'_join_form').each(function(){
				custom_join_form.push({
					'code' : $(this).data('code'),
					'title' : $(this).data('title'),
					'description' : $(this).data('description'),
					'type' : $(this).data('type'),
					'values' : $(this).data('values'),
					'use' : $join_form_manage.find("input[name='custom_" + custom_no + "_join_form_" + $(this).data('formNo') + "_use']").is(':checked'),
					'essential' : $join_form_manage.find("input[name='custom_" + custom_no + "_join_form_" + $(this).data('formNo') + "_essential']").is(':checked')
				});
			});
			data.join_form['custom_'+custom_no] = custom_join_form;
		});


		data.join_form = JSON.stringify(data.join_form);



		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/config/membership.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg === 'SUCCESS'){
					header_ctl.save();
					location.reload();
				}else
					alert(res.msg);
			}
		});
	};

	var showHiddenForm = function(type, custom_no){
		switch(type){
			case 'password' :
				current_data['password_min_length']				 = $join_form_manage.find('#password_min_length').val();
				current_data['password_require_upper_case']		 = $join_form_manage.find('#password_require_upper_case').is(':checked');
				current_data['password_require_number']			 = $join_form_manage.find('#password_require_number').is(':checked');
				current_data['password_require_special_text']	 = $join_form_manage.find('#password_require_special_text').is(':checked');

				$join_form_manage.find('#password_hidden_form').show();
				$join_form_manage.find('#password_main_form').hide();
				break;
			case 'default_name' :
				$join_form_manage.find('._default_name').each(function(k, v){
					current_data[$(this).attr('name')] = $(this).val();
				});
				current_data['default_name_unique'] = $join_form_manage.find('#default_name_unique').is(':checked');

				$join_form_manage.find('#default_name_main_form').hide();
				$join_form_manage.find('#default_name_hidden_form').show();
				break;
			case 'default_callnum' :
				$join_form_manage.find('._default_callnum').each(function(k, v){
					current_data[$(this).attr('name')] = $(this).val();
				});

				$join_form_manage.find('#default_callnum_main_form').hide();
				$join_form_manage.find('#default_callnum_hidden_form').show();
				break;
			case 'business_name' :
				$join_form_manage.find('._business_name').each(function(k, v){
					current_data[$(this).attr('name')] = $(this).val();
				});

				$join_form_manage.find('#business_name_main_form').hide();
				$join_form_manage.find('#business_name_hidden_form').show();
				break;
			case 'business_number' :
				current_data['unique_business_number'] = $join_form_manage.find('#unique_business_number').is(':checked');

				$join_form_manage.find('#business_number_main_form').hide();
				$join_form_manage.find('#business_number_hidden_form').show();
				break;
			case 'business_callnum' :
				$join_form_manage.find('._business_callnum').each(function(k, v){
					current_data[$(this).attr('name')] = $(this).val();
				});

				$join_form_manage.find('#business_callnum_main_form').hide();
				$join_form_manage.find('#business_callnum_hidden_form').show();
				break;
			case 'custom_name' :
				$join_form_manage.find('._custom_name_'+custom_no).each(function(k, v){
					current_data[$(this).attr('name')] = $(this).val();
				});
				current_data['custom_name_unique_'+custom_no] = $join_form_manage.find('#custom_name_unique_'+custom_no).is(':checked');

				$join_form_manage.find('#custom_name_main_form_'+custom_no).hide();
				$join_form_manage.find('#custom_name_hidden_form_'+custom_no).show();
				break;
			case 'custom_callnum' :
				$join_form_manage.find('._custom_callnum_' + custom_no).each(function(k, v){
					current_data[$(this).attr('name')] = $(this).val();
				});

				$join_form_manage.find('#custom_callnum_main_form_' + custom_no).hide();
				$join_form_manage.find('#custom_callnum_hidden_form_' + custom_no).show();
				break;
		}
	};

	var hideHiddenForm = function(type, custom_no){
		switch(type){
			case 'password' :
				$join_form_manage.find('#password_hidden_form').hide();
				$join_form_manage.find('#password_main_form').show();

				$join_form_manage.find('#password_min_length').val(current_data['password_min_length']);
				$join_form_manage.find('#password_require_upper_case').prop('checked', current_data['password_require_upper_case']);
				$join_form_manage.find('#password_require_number').prop('checked', current_data['password_require_number']);
				$join_form_manage.find('#password_require_special_text').prop('checked', current_data['password_require_special_text']);
				break;
			case 'default_name' :
				$join_form_manage.find('#default_name_main_form').show();
				$join_form_manage.find('#default_name_hidden_form').hide();

				$join_form_manage.find('._default_name').each(function(k, v){
					$(this).val(current_data[$(this).attr('name')]);
				});
				$join_form_manage.find('#default_name_unique').prop('checked', current_data['default_name_unique']);
				break;
			case 'default_callnum' :
				$join_form_manage.find('#default_callnum_main_form').show();
				$join_form_manage.find('#default_callnum_hidden_form').hide();

				$join_form_manage.find('._default_callnum').each(function(k, v){
					$(this).val(current_data[$(this).attr('name')]);
				});
				break;
			case 'business_name' :
				$join_form_manage.find('#business_name_main_form').show();
				$join_form_manage.find('#business_name_hidden_form').hide();

				$join_form_manage.find('._business_name').each(function(k, v){
					$(this).val(current_data[$(this).attr('name')]);
				});
				break;
			case 'business_number' :
				$join_form_manage.find('#business_number_main_form').show();
				$join_form_manage.find('#business_number_hidden_form').hide();

				$join_form_manage.find('#unique_business_number').prop('checked', current_data['unique_business_number']);
				break;
			case 'business_callnum' :
				$join_form_manage.find('#business_callnum_main_form').show();
				$join_form_manage.find('#business_callnum_hidden_form').hide();

				$join_form_manage.find('._business_callnum').each(function(k, v){
					$(this).val(current_data[$(this).attr('name')]);
				});
				break;
			case 'custom_name' :
				$join_form_manage.find('#custom_name_main_form_' + custom_no).show();
				$join_form_manage.find('#custom_name_hidden_form_' + custom_no).hide();

				$join_form_manage.find('._custom_name_' + custom_no).each(function(k, v){
					$(this).val(current_data[$(this).attr('name')]);
				});
				$join_form_manage.find('#custom_name_unique_' + custom_no).prop('checked', current_data['custom_name_unique_' + custom_no]);
				break;
			case 'custom_callnum' :
				$join_form_manage.find('#custom_callnum_main_form_' + custom_no).show();
				$join_form_manage.find('#custom_callnum_hidden_form_' + custom_no).hide();

				$join_form_manage.find('._custom_callnum_' + custom_no).each(function(k, v){
					$(this).val(current_data[$(this).attr('name')]);
				});
				break;
		}

	};

	var saveHiddenForm = function(type, custom_no){
		var exception = false;
		switch(type){
			case 'password' :
				var regexp							 = /^[0-9+]*$/;
				var password_min_length				 = $join_form_manage.find('#password_min_length').val();

				if(password_min_length === '')
					password_min_length = 4;

				if(!regexp.test(password_min_length)){
					alert(getLocalizeString('설명_비밀번호최소길이숫자만입력가능','','비밀번호 최소길이는 숫자만 입력 가능합니다.'));
					return false;
				}

				if(password_min_length < 4){
					alert(getLocalizeString('설명_비밀번호길이최소4글자이상','','비밀번호 길이는 최소 4글자 이상이여야 합니다.'));
					return false;
				}

				$join_form_manage.find('#password_hidden_form').hide();
				$join_form_manage.find('#password_main_form').show();
				break;
			case 'default_name' :
				$join_form_manage.find('._default_name').each(function(k, v){
					if($(this).val() === ''){
						alert(getLocalizeString('설명_값을입력하세요', '', '값을 입력하세요'));
						exception = true;
					}
				});
				if(exception) return false;

				$join_form_manage.find('#default_name_main_form span').text($join_form_manage.find('input[name="default_name_' + UNIT_CODE + '"]').val());
				$join_form_manage.find('#default_name_main_form').show();
				$join_form_manage.find('#default_name_hidden_form').hide();
				break;

			case 'default_callnum' :
				$join_form_manage.find('._default_callnum').each(function(k, v){
					if($(this).val() === ''){
						alert(getLocalizeString('설명_값을입력하세요', '', '값을 입력하세요'));
						exception = true;
					}
				});
				if(exception) return false;

				$join_form_manage.find('#default_callnum_main_form span').text($join_form_manage.find('input[name="default_callnum_' + UNIT_CODE + '"]').val());
				$join_form_manage.find('#default_callnum_main_form').show();
				$join_form_manage.find('#default_callnum_hidden_form').hide();
				break;

			case 'business_name' :
				$join_form_manage.find('._business_name').each(function(k, v){
					if($(this).val() === ''){
						alert(getLocalizeString('설명_값을입력하세요', '', '값을 입력하세요'));
						exception = true;
						return false;
					}
				});
				if(exception) return false;

				$join_form_manage.find('#business_name_main_form span').text($join_form_manage.find('input[name="business_name_' + UNIT_CODE + '"]').val());
				$join_form_manage.find('#business_name_main_form').show();
				$join_form_manage.find('#business_name_hidden_form').hide();
				break;

			case 'business_number' :

				$join_form_manage.find('#business_number_main_form').show();
				$join_form_manage.find('#business_number_hidden_form').hide();
				break;

			case 'business_callnum' :
				$join_form_manage.find('._business_callnum').each(function(k, v){
					if($(this).val() === ''){
						alert(getLocalizeString('설명_값을입력하세요', '', '값을 입력하세요'));
						exception = true;
					}
				});
				if(exception) return false;

				$join_form_manage.find('#business_callnum_main_form span').text($join_form_manage.find('input[name="business_callnum_' + UNIT_CODE + '"]').val());
				$join_form_manage.find('#business_callnum_main_form').show();
				$join_form_manage.find('#business_callnum_hidden_form').hide();
				break;

			case 'custom_name' :
				$join_form_manage.find('._custom_name_' + custom_no).each(function(k, v){
					if($(this).val() === ''){
						alert(getLocalizeString('설명_값을입력하세요', '', '값을 입력하세요'));
						exception = true;
					}
				});
				if(exception) return false;

				$join_form_manage.find('#custom_name_main_form_' + custom_no + ' span').text($join_form_manage.find('input[name="custom_name_' + custom_no + '_' + UNIT_CODE + '"]').val());
				$join_form_manage.find('#custom_name_main_form_' + custom_no).show();
				$join_form_manage.find('#custom_name_hidden_form_' + custom_no).hide();
				break;

			case 'custom_callnum' :
				$join_form_manage.find('._custom_callnum_' + custom_no).each(function(k, v){
					if($(this).val() === ''){
						alert(getLocalizeString('설명_값을입력하세요', '', '값을 입력하세요'));
						exception = true;
					}
				});
				if(exception) return false;

				$join_form_manage.find('#custom_callnum_main_form_' + custom_no + ' span').text($join_form_manage.find('input[name="custom_callnum_' + custom_no + '_' + UNIT_CODE + '"]').val());
				$join_form_manage.find('#custom_callnum_main_form_' + custom_no).show();
				$join_form_manage.find('#custom_callnum_hidden_form_' + custom_no).hide();
				break;
		}
		header_ctl.change();
	};


	var addGroupHtml = function(data){
		var group_type = data['group_type'];
		var tr_id = 'group_item_'+data['idx'];
		var $target = $('#'+tr_id);

		if( $target.length == 0 ){
			var group_class = group_type+'_group';
			var $target_html = '<tr id="'+tr_id+'" class="group_item '+group_class+'"></tr>';

			switch(group_type){
				case 'member':
					if ($('#group_list').find('.'+group_class).length > 0) {
						$('#group_list').find('.'+group_class+':last').after($target_html);
					} else {
						if ($('#group_list').find('.admin_group').length > 0) {
							$('#group_list').find('.admin_group:first').before($target_html);
						} else {
							$('#group_list').append($target_html);
						}
					}
					break;
				case 'admin':
					$('#group_list').append($target_html);
					break;
				case 'shopping':
					$('#shopping_group_list').append($target_html);
					break;
			}
			$target = $('#'+tr_id);
		}

		$.ajax({
			"type": "POST",
			"data": {"idx": data['idx']},
			"url": "/admin/ajax/config/membership/group_item.cm",
			"dataType": "HTML",
			"success": function(res){
				$target.html(res);
			}
		});

	};

	var deleteGroupForm = function(idx){
		if(confirm(getLocalizeString('설명_사용자정의항목삭제알람', '', "삭제 후 복구할수 없습니다.\n정말 삭제 하시겠습니까?"))){
			$.ajax({
				"type": "POST",
				"data": {"mode": "delete", "idx": idx},
				"url": ('/admin/ajax/config/membership/group_form_proc.cm'),
				"dataType": "json",
				"async": false,
				"cache": false,
				"success" : function(result){
					if(result.msg == 'SUCCESS'){
						location.reload();
						// if( typeof MEMBER_GROUP != 'undefined' ){
						// 	MEMBER_GROUP.modifyGroupList('delete', result['data']);
						// }
						// $('#group_item_' + idx).remove();
					} else {
						alert(result['msg']);
					}
				}
			});
		}
	};

	var changeDefaultGroup = function(idx){
		$.ajax({
			"type": "POST",
			"data": {"mode": "change_default_group", "idx": idx},
			"url": "/admin/ajax/config/membership/group_form_proc.cm",
			"dataType": "json",
			"async": false,
			"cache": false,
			"success": function(result){
				if(result.msg  === 'SUCCESS'){
					alert(getLocalizeString('설명_기본그룹이변경되었습니다', '', '기본 그룹이 변경되었습니다'));
				}else{
					alert(result.msg);
				}
			}
		});
	};

	var changeDefaultText = function(target, text){
		$('input[name="'+target.data('target')+'"]').val(text);
	};

	var openJoinTypeAddForm = function(){
		if($join_form_manage.find('._custom_type').length >= 48){
			alert(getLocalizeString('설명_회원가입유형은최대50개까지설정가능합니다', '', '회원가입 유형은 최대 50개까지 설정 가능합니다.'));
			return false;
		}else{
			$.ajax({
				type : 'POST',
				data : '',
				url : ('/admin/config/membership/join_type_add_modal.cm'),
				dataType : 'html',
				traditional : true,
				async : false,
				cache : false,
				success : function(html){
					$.cocoaDialog.open({type : 'custom_join_type_form', custom_popup : html});
				}
			});
		}
	};

	var openJoinTypeEditForm = function(target, custom_no, custom_code){
		var list = {};
		var allow_type;
		var limit_join_type;
		var default_group;
		switch(target){
			case 'default' :
				$join_form_manage.find('._default_use_unit').each(function(k, v){
					list[$(this).data('unit')] = $(this).val();
				});
				allow_type = $join_form_manage.find('#default_allow_type').val();
				limit_join_type = $join_form_manage.find('#default_limit_join_type').val();
				default_group = $join_form_manage.find('#default_default_group').val();
				break;
			case 'business' :
				$join_form_manage.find('._business_use_unit').each(function(k, v){
					list[$(this).data('unit')] = $(this).val();
				});
				allow_type = $join_form_manage.find('#business_allow_type').val();
				limit_join_type = $join_form_manage.find('#business_limit_join_type').val();
				default_group = $join_form_manage.find('#business_default_group').val();
				break;
			case 'custom' :
				$join_form_manage.find('._custom_use_unit_'+custom_no).each(function(k, v){
					list[$(this).data('unit')] = $(this).val();
				});
				allow_type = $join_form_manage.find('#custom_allow_type_'+custom_no).val();
				limit_join_type = $join_form_manage.find('#custom_limit_join_type_'+custom_no).val();
				default_group = $join_form_manage.find('#custom_default_group_'+custom_no).val();
				break;
		}


		$.ajax({
			type:'POST',
			data:{target : target, list : JSON.stringify(list), allow_type : allow_type, limit_join_type : limit_join_type, default_group : default_group,  custom_no : custom_no, custom_code : custom_code},
			url:('/admin/config/membership/join_type_edit_modal.cm'),
			dataType:'html',
			traditional : true,
			async:false,
			cache:false,
			success:function(html){
				$.cocoaDialog.open({type:'custom_join_type_form',custom_popup:$(html)});
			}
		});
	};

	var saveJoinTypeAddForm = function(){
		var is_alert = false;
		var no_checked = true;
		var this_unit = '';
		var $html = '';
		var use_unit_list = [];
		var unit_name_list = {};
		var allow_type;
		var limit_join_type;
		var default_group;
		$('.modal_custom_join_type_form').find('._use_unit').each(function(){
			if($(this).is(':checked')){
				this_unit = $(this).data('unit');
				if($("input[name='custom_join_type_name_" + this_unit + "']").val() === ''){
					is_alert = true;
					return false;
				}
				no_checked = false;
				use_unit_list.push(this_unit);
				unit_name_list[this_unit] = $("input[name='custom_join_type_name_"+this_unit+"']").val();
			}
		});

		if(is_alert){
			alert(getLocalizeString("설명_유형제목을입력하세요", "", "유형 제목을 입력하세요."));
			return false;
		}

		if(no_checked){
			alert(getLocalizeString("설명_사용할사이트를1개이상선택해주세요", "", "사용할 사이트를 1개 이상 선택해 주세요."));
			return false;
		}

		allow_type = $("input[name='allow_type']:checked").val();
		limit_join_type = $("input[name='limit_join_type']:checked").val();

		default_group = $("#default_group").val();
		$.ajax({
			type:'POST',
			data:{
				custom_no : $join_form_manage.find('._custom_type').length+1,
				use_unit_list : JSON.stringify(use_unit_list),
				unit_name_list : JSON.stringify(unit_name_list),
				allow_type : allow_type,
				limit_join_type : limit_join_type,
				default_group : default_group
			},
			url:('/admin/config/membership/get_custom_join_type_html.cm'),
			dataType:'html',
			traditional : true,
			async:false,
			cache:false,
			success:function(html){
				$html = html;
			}
		});

		$join_form_manage.find('#custom_type_wrap').append($html);

		$.cocoaDialog.close();
		header_ctl.change();

		createEvent();
	};

	var saveJoinTypeEditForm = function(target, custom_no){
		var lang_html = '';
		var this_unit = '';
		var is_alert = false;
		var no_checked = true;
		var main_text = '';
		$('.modal_custom_join_type_form').find('._use_unit').each(function(){
			if($(this).is(':checked')){
				this_unit = $(this).data('unit');
				if($("input[name='"+target+"_join_type_name_"+this_unit+"']").val() === ''){
					is_alert = true;
					return false;
				}

				if(main_text === ''){
					main_text = $("input[name='"+target+"_join_type_name_"+this_unit+"']").val();
				}else if(this_unit === UNIT_NO){
					main_text = $("input[name='"+target+"_join_type_name_"+this_unit+"']").val();
				}

				no_checked = false;

				lang_html += "<img src='/common/img/flag_shapes/flag_."+$(this).data('lang')+"._circle.png' width='24' height='24' style='margin-left: 2px; margin-right: 2px;'>";
				if(target === 'custom' && custom_no > 0){
					lang_html += "<input type='hidden' class='_"+target+"_use_unit_"+custom_no+"' name='"+target+"_type_name_"+custom_no+"_"+this_unit+"' data-unit='"+this_unit+"' value='"+$("input[name='"+target+"_join_type_name_"+this_unit+"']").val()+"'>";
				}else{
					lang_html += "<input type='hidden' class='_"+target+"_use_unit' name='"+target+"_type_name_"+this_unit+"' data-unit='"+this_unit+"' value='"+$("input[name='"+target+"_join_type_name_"+this_unit+"']").val()+"'>";
				}
			}
		});

		if(is_alert){
			alert(getLocalizeString("설명_유형제목을입력하세요", "", "유형 제목을 입력하세요."));
			return false;
		}

		if(no_checked){
			alert(getLocalizeString("설명_사용할사이트를1개이상선택해주세요", "", "사용할 사이트를 1개 이상 선택해 주세요."));
			return false;
		}


		switch(target){
			case 'default' :
				$join_form_manage.find('#default_type_use_unit').html(lang_html);
				$join_form_manage.find('#default_main_text').text(main_text);
				$join_form_manage.find('#default_allow_type').val($("input[name='allow_type']:checked").val());
				$join_form_manage.find('#default_limit_join_type').val($("input[name='limit_join_type']:checked").val());
				$join_form_manage.find('#default_default_group').val($("#default_group").val());
				break;
			case 'business' :
				$join_form_manage.find('#business_type_use_unit').html(lang_html);
				$join_form_manage.find('#business_main_text').text(main_text);
				$join_form_manage.find('#business_allow_type').val($("input[name='allow_type']:checked").val());
				$join_form_manage.find('#business_limit_join_type').val($("input[name='limit_join_type']:checked").val());
				$join_form_manage.find('#business_default_group').val($("#default_group").val());
				break;
			case 'custom' :
				$join_form_manage.find('#custom_type_use_unit_'+custom_no).html(lang_html);
				$join_form_manage.find('#custom_main_text_'+custom_no).text(main_text);
				$join_form_manage.find('#custom_allow_type_'+custom_no).val($("input[name='allow_type']:checked").val());
				$join_form_manage.find('#custom_limit_join_type_'+custom_no).val($("input[name='limit_join_type']:checked").val());
				$join_form_manage.find('#custom_default_group_'+custom_no).val($("#default_group").val());
				break;
		}
		$.cocoaDialog.close();
		header_ctl.change();
	};

	var deleteCustomJoinType = function(target, custom_code){
		if(confirm(getLocalizeString("설명_삭제후복구는불가하지만기존회원", "", "삭제 후 복구는 불가하지만, 기존 회원 데이터는 유지됩니다. 정말 삭제 하시겠습니까?"))){
			$join_form_manage.find('.'+target).remove();
			if(custom_code !== ''){
				delete_custom_arr.push(custom_code);
			}
			$.cocoaDialog.close();
			header_ctl.change();
		}
	};

	var openJoinFormAddForm = function(target, custom_no){
		$.ajax({
			type:'POST',
			data:{mode : 'add', target : target, custom_no : custom_no},
			url:('/admin/config/membership/join_form_modal.cm'),
			dataType:'html',
			async:false,
			cache:false,
			success:function(html){
				$.cocoaDialog.open({type:'admin_join_form',custom_popup:$(html)});
			}
		});
	};

	var openJoinFormEditForm = function(target){
		var title = $join_form_manage.find('.' + target).data('title');
		var description = $join_form_manage.find('.' + target).data('description');
		var type = $join_form_manage.find('.' + target).data('type');
		var values = $join_form_manage.find('.' + target).data('values');

		$.ajax({
			type:'POST',
			data:{mode : 'edit', target : target, title : title, description : description, type : type, values : values},
			url:('/admin/config/membership/join_form_modal.cm'),
			dataType:'html',
			async:false,
			cache:false,
			success:function(html){
				$.cocoaDialog.open({type:'admin_join_form',custom_popup:$(html)});
			}
		});
	};

	var submitJoinForm = function(){
		var $joinf = $('#joinf');
		var data = $joinf.serializeObject();
		switch(data.mode){
			case 'add' :
				var $html = '';
				var form_no = 0;
				var counting_class = '';
				var main_class = '';
				var append_target = '';

				switch(data.target){
					case 'default' :
						form_no = $join_form_manage.find('._default_join_form').length + 1;
						counting_class = '_default_join_form';
						main_class = 'default_join_form_'+form_no;
						append_target = 'default_join_form_list';
						break;
					case 'business' :
						form_no = $join_form_manage.find('._business_join_form').length + 1;
						counting_class = '_business_join_form';
						main_class = 'business_join_form_'+form_no;
						append_target = 'business_join_form_list';
						break;
					case 'custom' :
						form_no = $join_form_manage.find('._custom_'+data.custom_no+'_join_form').length + 1;
						counting_class = '_custom_'+data.custom_no+'_join_form';
						main_class = 'custom_'+data.custom_no+'_join_form_'+form_no;
						append_target = 'custom_'+data.custom_no+'_join_form_list';
						$('#' + append_target).parent('table').show();
						break;
				}


				if(data.type === 'radio' || data.type === 'select' || data.type === 'checkbox'){

					//@TODO 배열인데 1개만 있는경우 '[]' 감싸지지 않아 오류발생됨, 아래와 같이 임시처리함
					var data_values = [];
					$joinf.find("input[name='data_values[]']").each(function(){
						data_values.push($(this).val());
					});
					data_values = JSON.stringify(data_values);

					$html += "<tr class='" + counting_class + " " + main_class + "' data-form-no='"+form_no+"' data-code='' data-title='" + data.title + "' data-description='" + data.description + "' data-type='" + data.type + "' data-values='" + data_values + "'>";
				}else{
					$html += "<tr class='" + counting_class + " " + main_class + "' data-form-no='"+form_no+"' data-code='' data-title='" + data.title + "' data-description='" + data.description + "' data-type='" + data.type + "' data-values=''>";
				}
				$html += "<td class='_title'><div class='drag _showcase_handle' style='position: absolute; left: 30px'></div>"+data.title+"</td>";
				$html += "<td></td>";

				$html += "<td>";
				$html += "<div class='checkbox checkbox-styled no-margin'>";
				$html += "<label><input type='checkbox' name='"+main_class+"_use' data-essential='"+main_class+"_essential' checked><span></span></label>";
				$html += "</div>";
				$html += "</td>";

				$html += "<td>";
				$html += "<div class='checkbox checkbox-styled no-margin'>";
				$html += "<label><input type='checkbox' name='"+main_class+"_essential'><span></span></label>";
				$html += "</div>";
				$html += "</td>";

				$html += "<td class='no-padding'>";
				$html += "<button class='btn btn-icon-toggle btn-lg' type='button' onclick='CONFIG_MEMBERSHIP.openJoinFormEditForm(\""+main_class+"\")'>";
				$html += "<i class='btm bt-pencil'></i>";
				$html += "</button>";
				$html += "</td>";

				$html += "<td class='no-padding'>";
				$html += "<button class='btn btn-icon-toggle btn-lg' type='button' onclick='CONFIG_MEMBERSHIP.deleteJoinForm(\""+main_class+"\")'>";
				$html += "<i class='btm bt-trash'></i>";
				$html += "</button>";
				$html += "</td>";

				$html += "</tr>";

				$join_form_manage.find('#'+append_target).append($html);
				break;
			case 'edit' :
				var $html = '';

				$join_form_manage.find('.' + data.target).data('title', data.title);
				$join_form_manage.find('.' + data.target).data('description', data.description);
				$join_form_manage.find('.' + data.target).data('type', data.type);
				if(data.type === 'radio' || data.type === 'select' || data.type === 'checkbox'){
					var data_values = [];
					$joinf.find("input[name='data_values[]']").each(function(){
						data_values.push($(this).val());
					});

					$join_form_manage.find('.' + data.target).data('values', data_values);
				}else{
					$join_form_manage.find('.' + data.target).data('values', '');
				}

				$html += '<div class="drag _showcase_handle" style="position: absolute;"></div>';
				$html += data.title;
				$join_form_manage.find('.' + data.target + ' ._title').html($html);
				break;
		}
		header_ctl.change();
		createEvent();
		$.cocoaDialog.close();
	};

	var deleteJoinForm =  function(target, form_no){
		if(confirm(getLocalizeString("설명_사용자정의항목삭제알람", "", "삭제 후 복구는 불가합니다.\n정말 삭제 하시겠습니까?"))){
			$join_form_manage.find('.'+target).remove();
			header_ctl.change();
			if(form_no !== ''){
				delete_join_form_arr.push(form_no);
			}
		}
	};


	return {
		init : function(){
			init();
		},
		changeDefaultGroup: function(idx){
			changeDefaultGroup(idx);
		},
		addGroupHtml: function(data){
			addGroupHtml(data);
		},
		deleteGroupForm: function(idx){
			deleteGroupForm(idx);
		},

		showHiddenForm : function(type, custom_no){
			showHiddenForm(type, custom_no);
		},
		hideHiddenForm : function(type, custom_no){
			hideHiddenForm(type, custom_no);
		},
		saveHiddenForm : function(type, custom_no){
			saveHiddenForm(type, custom_no);
		},
		changeDefaultText : function(target, text){
			changeDefaultText(target, text);
		},
		openJoinTypeAddForm : function (){
			openJoinTypeAddForm();
		},
		openJoinTypeEditForm : function(target, custom_no, custom_code){
			openJoinTypeEditForm(target, custom_no, custom_code);
		},
		saveJoinTypeAddForm : function(){
			saveJoinTypeAddForm();
		},
		saveJoinTypeEditForm : function(target, custom_no){
			saveJoinTypeEditForm(target, custom_no);
		},
		deleteCustomJoinType : function(target, custom_code){
			deleteCustomJoinType(target, custom_code);
		},
		openJoinFormAddForm : function(target, custom_no){
			openJoinFormAddForm(target, custom_no);
		},
		openJoinFormEditForm : function(target){
			openJoinFormEditForm(target);
		},
		submitJoinForm : function(){
			submitJoinForm();
		},
		deleteJoinForm : function(target, form_no){
			deleteJoinForm(target, form_no);
		}
	}
}();

var CONFIG_SHOPPING_GROUP = function(){
	var $form;
	var group_type = 'shopping';

	var init = function(){
		$form = $('#shopping_frm');
		createEvent();
	};

	var createEvent = function(){
		$form.find('input[name="use_shopping_group"]:checkbox').on('change', function(){
			setUsingSpecialGroup($(this));
		});
		$form.find('button.change_period').on('click', function(){
			setAutogroupingPeriod();
		});
		$form.find('#auto_grouping_type').on('change', function(){
			changeAutoGroupingType($(this).val());
		});

		$form.find('#auto_grouping_type').on('change', function(){
			changeAutoGroupingType($(this).val());
		});
		$form.find('#auto_grouping_period').on('change', function(){
			changeAutoGroupingType($(this).val());
		});

		$form.find('._benefit_money_format').each(function(){
			set_money_format($(this), $(this).data('decimal-count'), $(this).data('decimal-char'), $(this).data('thousand-char'));
		});
	};

	// 쇼핑설정 - 자동 등급 기준 변경
	var changeAutoGroupingType = function(type){
		type = type.toLowerCase();
		var $auto_grouping_period = $('#auto_grouping_period');
		var auto_grouping_type = type;
		switch(type){
			case 'all':
				$auto_grouping_period.hide();
				break;
			default:
				$auto_grouping_period.show();
				auto_grouping_type = $auto_grouping_period.val();
				break;
		}
		$form.find('input[name="auto_grouping_period"]').val(auto_grouping_type);
	};

	var openShoppingGroupDefaultForm = function(){
		$.ajax({
			type:'POST',
			data:{},
			url:('/admin/ajax/config/membership/shopping_group_form.cm'),
			dataType:'html',
			async:false,
			cache:false,
			success:function(html){
				$.cocoaDialog.open({type:'admin_group_form',custom_popup:$(html)});
			}
		});
	};

	var setUsingSpecialGroup = function($obj){
		if ( $obj.data('allow') == 'N' ) {
			alert(getLocalizeString('설명_쇼핑등급기능버전얼럿','',"쇼핑등급 기능은 Pro, Global 버전에서만 사용 가능합니다."));
			$obj.prop('checked', false);
			return false;
		}
		var b = $obj.prop('checked');
		var confirm_msg = b ? getLocalizeString('설명_쇼핑등급설정활성화얼럿','',"쇼핑 등급 설정을 사용하시겠습니까? \n사용시 구매내역이 없거나 신규 가입자에 해당되는 기본 쇼핑 등급이 자동 생성됩니다.") :
			getLocalizeString('설명_쇼핑등급설정비활성화얼럿','',"쇼핑 등급 사용을 중지하시겠습니까? \n모든 쇼핑 등급이 즉시 삭제되며 기존 회원들에게 부여된 구매혜택도 함께 소멸됩니다. \n\n사용 중지 후 다시 사용하더라도 복원이 불가하므로 신중히 선택해 주시기 바랍니다");

		if( confirm(confirm_msg) ){
			submit($form, 1, function(res){
				b = res['data']['is_use'];
				$('#shopping_group_list').html(res['html']);
				$form.find('.use_shopping_group').toggle(b);
				alert(res['msg']);
			});
		} else {
			$obj.prop('checked', !b);
		}
	};

	var setAutogroupingPeriod = function(){
		if(confirm(getLocalizeString('설명_자동등급조건유형변경얼럿','',"자동 등급 조건 유형의 변경사항을 적용하시겠습니까? \n변경된 자동 그룹 조건은 변경 이후 최초 등급 갱신 시점에 적용됩니다."))){
			submit($form, 2, function(res){
				$('.auto_grouping_period').html(res['html']);
			});
		}
	};
	var setDefaultGroupData = function(){
		var $default_group_form = $('#groupf');
		submit($default_group_form, 3, function(res){
			// 보여주는 데이터 갱신
			var $shopping_group_default = $('#shopping_group_default');
			if( $shopping_group_default.find('.benefit').length > 0 ){
				$shopping_group_default.html(res['html']);
			} else {
				$shopping_group_default.find('.title').html(res['data']['title']);
			}

			$.cocoaDialog.close();
		});

	};

	var submit = function($frm, act, callback){
		var data = $frm.serializeObject();
		data['group_type'] = group_type;
		data['act'] = act;

		$.ajax({
			url : "/admin/ajax/config/membership/site_group_setting.cm",
			type: "POST",
			data: data,
			dataType: "json",
			async: false,
			cache: false,
			success: function(res){
				if(res['result'] == 'SUCCESS'){
					if(typeof callback != 'undefined'){
						callback(res);
					}
				} else {
					if( res['msg'].trim() != ''){
						alert(res['msg']);
						if( act == 1 ) {
							var checkbox_status = ( typeof data['use_shopping_group'] != 'undefined' && data['use_shopping_group'] == 'ok' );
							$form.find('input[name="use_shopping_group"]:checkbox').prop( 'checked', !checkbox_status );
						}
					}
				}
			}
		});
	};

	return {
		'init': function(){
			init();
		},
		'openShoppingGroupDefaultForm': function(){
			openShoppingGroupDefaultForm();
		},
		'setDefaultGroupData': function(){
			setDefaultGroupData();
		}
	}
}();

var CONFIG_ADULT = function(){
	var $form;
	var header_ctl,
		$custom_content,
		$logo_img_upload,
		$logo_img,
		$logo_tmp_idx,
		$logo_url,
		$remove_img_btn,
		code_mirror_setting = false
	;

	var init = function(){
		$form = $('#dof');
		$logo_img_upload		= $form.find('#logo_img_upload');
		$logo_img				= $form.find('#logo_img');
		$logo_tmp_idx			= $form.find('#logo_tmp_idx');
		$remove_img_btn			= $form.find('#remove_img_btn');
		$logo_url				= $form.find('#logo_url');

		header_ctl = new HEADER_CONTROL();
		header_ctl.init();
		header_ctl.addBtn('save',function(){
			submit();
		});

		$logo_img_upload.setUploadImage({
			url: '/admin/ajax/upload_image.cm',
			dropZone : null,
			singleFileUploads:true,
			formData: {temp:'Y',target: 'auth_service'}
		},function(res,data){
			if(res === 'success'){
				$.each(data,function(e,tmp){
					img_name = tmp.name;
					if(tmp.error == "" || tmp.error == null){
						$logo_img.show();
						$remove_img_btn.show();
						$logo_img.attr('src', CDN_UPLOAD_URL + tmp.url);
						$logo_tmp_idx.val(tmp.tmp_idx);
						$logo_url.val(tmp.url);
					}else{
						alert(tmp.error);
					}
				});
				header_ctl.change();
			}
		});

		changeUseType();
		createEvent();
		changeUseAdultPage();
	};

	var changeUseType = function(){
		switch($form.find('input[name=use_type]:checked').val()){
			case 'not_use' :
				$form.find('#additional_settings').hide();
				$form.find('#only_identity_auth_additional_settings').hide();
				$form.find('#compositeness_auth_additional_settings').hide();
				break;
			case 'only_identity_auth' :
				$form.find('#additional_settings').show();
				$form.find('#only_identity_auth_additional_settings').show();
				$form.find('#compositeness_auth_additional_settings').hide();
				break;
			case 'compositeness_auth' :
				$form.find('#additional_settings').show();
				$form.find('#only_identity_auth_additional_settings').show();
				$form.find('#compositeness_auth_additional_settings').show();

				if($('#use_phone').is(':checked') || $('#use_card').is(':checked') || $('#use_combination').is(':checked')){ // 에디터 로드가 제대로 안돼서, 본인 인증 수단 모두 사용하지 않을 때는 미리 생성하지 않음
					if(code_mirror_setting === false){
						code_mirror_setting = true;
						$custom_content = CodeMirror.fromTextArea(document.getElementById("custom_content"), {
							lineNumbers: true,
							lineWrapping: true,
							mode: "text/html",
							matchBrackets: true,
							indentWithTabs: true
						});
					}
				}
				break;
		}
	};

	var changeUseAdultPage = function(){
		if($('#use_adult_page').is(":checked")){
			$('#allow_underage_join').prop('checked', false);
			$('#allow_underage_join').prop('disabled', true);
		}else{
			$('#allow_underage_join').prop('disabled', false);
		}

		if($('#use_phone').is(":checked")){
			$('._use_phone').show();
		}
		if($('#use_card').is(":checked")){
			$('._use_card').show();
		}
		if($('#use_combination').is(":checked")){
			$('._use_combination').show();
		}
	};

	var createEvent = function(){
		$form.find('input[name=use_type]').off('change.t1').on('change.t1',function(){
			changeUseType();
			header_ctl.change();
		});
		$form.find('input[name=adult_auth_target]').off('change').on('change',function(){
			header_ctl.change();
		});
		$form.find('input[type=checkbox]').change(function(){
			if(this.getAttribute('id') === 'use_adult_page'){
				changeUseAdultPage();
			}
			header_ctl.change();
		});
		$form.find('input[type=text]').off('change.t2').on('change.t2',function(){
			header_ctl.change();
		});
		$form.find('textarea').off('change, keyup').on('change, keyup, blur',function(){
			header_ctl.change();
		});

		$('#use_phone').change(function(){
			header_ctl.change();
		});
		$('#use_card').change(function(){
			header_ctl.change();
		});
		$('#use_combination').change(function(){
			header_ctl.change();
		});

		$('._auth_service_input').off('change, keyup').on('change, keyup, blur',function(){
			header_ctl.change();
		});

		$('#phoneuseService').change(function(){
			if($('#phoneuseService option:selected').val() == 'option_dream_security'){ // selected option이 드림시큐리티로 선택 됐을때.
				$('._input_wrap_auth_service_dream_security').show();
				$('._input_wrap_auth_service_mobilians').hide();
			}else{
				$('._input_wrap_auth_service_dream_security').hide();
				$('._input_wrap_auth_service_mobilians').show();
			}
			header_ctl.change();
		});

	};

	var submit = function(){
		var data = $form.serializeObject();
		if(data.use_type === 'compositeness_auth'){
			data.custom_content = $custom_content.getValue();
		}

		if($('._p_auth_service_dream_security').length > 0){ // 드림시큐리티만 결제된 상황
			data.selected_phone_auth_service		= 'dream_security';
		}else if($('._p_auth_service_mobilians').length > 0){ // 모빌리언스만 결제된 상황
			data.selected_phone_auth_service		= 'mobilians';
		}else if($('#phoneuseService').length > 0){ // 드림시큐리티, 모빌리언스 모두 결제된 상황
			data.selected_phone_auth_service		= $('#phoneuseService option:selected').val() == 'option_dream_security' ? 'dream_security' : 'mobilians';
		}

		data.use_phone 								= $('#use_phone').is(":checked");
		data.use_card  								= $('#use_card').is(":checked");
		data.use_combination						= $('#use_combination').is(":checked");
		data.auth_service_dream_security_cp_id 		= $('#auth_service_dream_security_cp_id').val();
		data.auth_service_mobilians_svcid			= $('#auth_service_mobilians_svcid').val();
		data.auth_service_mobilians_encrypt_key 	= $('#auth_service_mobilians_encrypt_key').val();
		data.auth_service_inicis_mid				= $('#auth_service_inicis_mid').val();
		data.auth_service_inicis_seed_key			= $('#auth_service_inicis_seed_key').val();
		data.auth_service_inicis_seed_iv			= $('#auth_service_inicis_seed_iv').val();
		data.auth_service_combination_mid			= $('#auth_service_combination_mid').val();
		data.auth_service_combination_api_key		= $('#auth_service_combination_api_key').val();

		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/config/adult.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					header_ctl.save();
					location.reload();
				}else
					alert(res.msg);
			}
		});
	};

	var removeImg = function(){
		$logo_url.val("");
		$logo_img.hide();
		$remove_img_btn.hide();
		header_ctl.change();
	};
	var  HelpConfirmMobile = function(){
		var dream_security_anchor = $("#chk_auth_service_dream_security").siblings();

		$.ajax({
			type : 'POST',
			data : {},
			url : ('/admin/ajax/config/help_confirm_mobile.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type:'helpConfirmModal',custom_popup:html});

				if(dream_security_anchor.length > 0){ // 결제/부가서비스 도움말탭 처리
					dream_security_anchor.off('click').on('click', function(){
						activeConfirmMobileTab();
					});
				}
			}
		});
	};

	var activeConfirmMobileTab = function(tab_element){
		if(tab_element !== undefined){
			var tab_id = tab_element.attr('data-tab');

			$('.tab').addClass('hidden');
			$('.help_tab').parent('li').removeClass('active');

			$("#"+tab_id).removeClass('hidden');
			tab_element.parent('li').addClass('active');
		}else{ // 결제/부가서비스 도움말탭 처리
			var mobilians_tab 	   = $('.line_nav_li:first-child');
			var mobilians_description = $('#kgtab');

			var dream_security_tab = $('.line_nav_li:last-child');
			var dream_security_description = $('#dream');

			mobilians_tab.removeClass('active');
			mobilians_description.addClass('hidden');

			dream_security_tab.addClass('active');
			dream_security_description.removeClass('hidden');
		}
	};

	var  HelpConfirmCard = function(){
		$.ajax({
			type : 'POST',
			data : {},
			url : ('/admin/ajax/config/help_confirm_card.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type:'helpConfirmCard',custom_popup:html});
			}
		});
	};
	var  HelpConfirmUnionAuth = function(){
		$.ajax({
			type : 'POST',
			data : {},
			url : ('/admin/ajax/config/help_confirm_union_auth.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type:'HelpConfirmUnionAuth',custom_popup:html});
			}
		});
	};
	var  HelpConfirmKgmobile = function(){
		$.ajax({
			type : 'POST',
			data : {},
			url : ('/admin/ajax/config/help_confirm_kgmobile.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type:'helpConfirmKgmobile',custom_popup:html});
			}
		});
	};

	var tabPhoneCard = function(){
		$('.confirm_nav_wrap div.btn_confirm a').off('click').on('click', function(){
			var tab_id = $(this).attr('data-tab');

			$('.confirm_nav_wrap div.btn_confirm').removeClass('active');
			$('.step').addClass('hidden');

			$(this).parent('.btn_confirm').addClass('active');
			$('#'+tab_id).removeClass('hidden');
		})
	};

	var phoneTabServiceUse = function(){
		$('#phone_tab .line_nav a').off('click').on('click', function(){
			var data_id = $(this).attr('data-tab');

			$('#phone_tab .line_nav li').removeClass('active');
			$('#phone_tab .inner_step').addClass('hidden');

			$(this).parent('li').addClass('active');
			$('#'+data_id).removeClass('hidden');
		})
	};
	var cardTabServiceUse = function(){
		$('#card_tab .line_nav a').off('click').on('click', function(){
			var data_id = $(this).attr('data-tab');

			$('#card_tab .line_nav li').removeClass('active');
			$('#card_tab .inner_step').addClass('hidden');

			$(this).parent('li').addClass('active');
			$('#'+data_id).removeClass('hidden');
		})
	};

	var checkUse = function(obj){
		var control_name = $(obj).attr('data-option');

		if($(obj).is(':checked')){
			if(control_name == 'identity_only'){
				$('._identity_adult').hide();
			}
			$('._dont_'+control_name).hide();
			$('._'+control_name).show();

			if($('._p_auth_service_dream_security').length > 0){ // 드림시큐리티만 결제함
				$('._input_wrap_auth_service_dream_security').show();
				$('._input_wrap_auth_service_mobilians').hide();
			}else if($('._p_auth_service_mobilians').length > 0){ // 모빌리언스만 결제함
				$('._input_wrap_auth_service_mobilians').show();
				$('._input_wrap_auth_service_dream_security').hide();
			}if($('#phoneuseService').length > 0){ // 본인인증, 드림시큐리티와 모빌리언스 모두 결제함
				if($('._option_auth_service_dream_security').is(':selected')){ // 기본값, 드림시큐리티로 사용 중
					$('._input_wrap_auth_service_dream_security').show();
					$('._input_wrap_auth_service_mobilians').hide();
				}else if($('._option_auth_service_mobilians').is(':selected')){ // 모빌리언스로 사용 중
					$('._input_wrap_auth_service_mobilians').show();
					$('._input_wrap_auth_service_dream_security').hide();
				}
			}

			if(!($('._only_identity_auth').is(':checked') || $('._compositeness_auth').is(':checked'))){ // 처음 설정할 경우
				$('._only_identity_auth').prop("checked", true);
				$('#only_identity_auth_additional_settings').show();
				$('#compositeness_auth_additional_settings').hide();
			}

		}else{
			$('._dont_'+control_name).show();
			$('._'+control_name).hide();
		}

		var use_phone = $('#use_phone').is(':checked');
		var use_card = $('#use_card').is(':checked');
		var use_combination = $('#use_combination').is(':checked');
		if(!use_phone && !use_card && !use_combination){ // 휴대폰, 카드, 간편 인증 둘다 사용 안함 일때,
			$('.status_use').hide();
		}else{
			$('.status_use').show();
		}

		if($('._compositeness_auth').is(':checked')){
			$form.find('#only_identity_auth_additional_settings').show();
			$form.find('#compositeness_auth_additional_settings').show();

			if(code_mirror_setting === false){
				code_mirror_setting = true;
				$custom_content = CodeMirror.fromTextArea(document.getElementById("custom_content"), {
					lineNumbers: true,
					lineWrapping: true,
					mode: "text/html",
					matchBrackets: true,
					indentWithTabs: true
				});
			}
		}
	};

	var openIntroduceMobile = function(){
		$.ajax({
			type : 'POST',
			data : {},
			url : ('/admin/ajax/config/adult_confirm_phone.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success: function (res) {
				var $html = $(res);
				$.cocoaDialog.open({type:'adult_confirm_phone',custom_popup:$html});
			}
		});
	};

	var openIntroduceCard = function(){
		$.ajax({
			type : 'POST',
			data : {},
			url : ('/admin/ajax/config/adult_confirm_card.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success: function (res) {
				var $html = $(res);
				$.cocoaDialog.open({type:'adult_confirm_card',custom_popup:$html});
			}
		});
	};
	var openIntroduceUnionAuth = function(){
		$.ajax({
			type : 'POST',
			data : {},
			url : ('/admin/ajax/config/adult_confirm_union_auth.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success: function (res) {
				var $html = $(res);
				$.cocoaDialog.open({type:'adult_confirm_union_auth',custom_popup:$html});
			}
		});
	};

	return {
		init : function(){
			init();
		},
		'removeImg' :function(){
			removeImg();
		},
		'HelpConfirmMobile' : function(){
			HelpConfirmMobile();
		},
		'activeConfirmMobileTab' : function(tab_element){
			activeConfirmMobileTab(tab_element);
		},
		'tabPhoneCard' : function(){
			tabPhoneCard();
		},
		'HelpConfirmCard' : function(){
			HelpConfirmCard();
		},
		'HelpConfirmUnionAuth' : function(){
			HelpConfirmUnionAuth();
		},
		'HelpConfirmKgmobile' : function(){
			HelpConfirmKgmobile();
		},
		'phoneTabServiceUse' : function(){
			phoneTabServiceUse();
		},
		'cardTabServiceUse' : function(){
			cardTabServiceUse();
		},
		'checkUse' : function(obj){
			checkUse(obj);
		},
		'openIntroduceMobile' : function(){
			openIntroduceMobile();
		},
		'openIntroduceCard' : function(){
			openIntroduceCard();
		},
		'openIntroduceUnionAuth' : function(){
			openIntroduceUnionAuth();
		}

	}
}();

var CONFIG_POPUP = function(){
	var $form;
	var header_ctl;
	var $title, $show_device, $show_page, $launch_type, $position_type, $background_color, $close_btn_color, $start_time, $end_time,
		$img_url, $img_width, $show_page_list_wrap, $body_image_options, $body_html_options, $body_html_editor, $popup_option_wrap,
		$banner_option_wrap,
		$show_page_list, $positon_center_options, $position_horizontal_option, $position_horizontal, $horizontal_unit,
		$position_vertical_option, $position_vertical, $vertical_unit, $on_mobile;
	var img_name, background_color, close_btn_color, body_html;

	var init = function(d){
		var data = d;
		$form					 = $('#dof');
		$title					 = $form.find('#title');
		$show_device			 = $form.find('._show_device');
		$show_page				 = $form.find('._show_page');
		$launch_type			 = $form.find('._launch_type');
		$position_type			 = $form.find('._position_type');
		$background_color		 = $form.find('._background_color');
		$close_btn_color		 = $form.find('._close_btn_color');
		$start_time				 = $form.find('#start_time');
		$end_time				 = $form.find('#end_time');
		$img_url				 = $form.find('#img_url');
		$img_width				 = $form.find('#img_width');
		$show_page_list_wrap	 = $form.find('._show_page_list_wrap');
		$body_image_options 	 = $form.find('._body_image_options');
		$body_html_options		 = $form.find('._body_html_options');
		$body_html_editor		 = $form.find('._body_html_editor');
		$popup_option_wrap		 = $form.find('._popup_option_wrap');
		$banner_option_wrap		 = $form.find('._banner_option_wrap');
		$on_mobile				 = $form.find('.on_mobile');
		$show_page_list			 = $('._show_page_list').find('input');
		img_name				 = $('#img_name').val();
		$positon_center_options	 = $form.find('._positon_center_options');
		$position_horizontal_option = $positon_center_options.find('.position_horizontal_option');
		$position_horizontal		= $positon_center_options.find('#position_horizontal');
		$horizontal_unit			= $positon_center_options.find('#horizontal_unit');
		$position_vertical_option	= $positon_center_options.find('#position_vertical_option');
		$position_vertical			= $positon_center_options.find('#position_vertical');
		$vertical_unit				= $positon_center_options.find('#vertical_unit');


		if(data.show_page == 'custom'){
			$show_page_list.each(function(){
				if(data.show_page_list.indexOf($(this).val()) != -1){
					$(this).prop("checked", true);
				}
			});
		}
		if(data.type == 'TB' && data.options.color != undefined){
			background_color = data.options.color['background'];
			close_btn_color = data.options.color['close_btn'];
		}
		$background_color.setColorPicker({
			value : background_color,
			brand_color : brand_color,
			change : function(hex){
				header_ctl.change();
			},
			stop : function(hex){
				background_color = hex;
				header_ctl.change();
			}
		});

		$close_btn_color.setColorPicker({
			value : close_btn_color,
			brand_color : brand_color,
			change : function(hex){
				header_ctl.change();
			},
			stop : function(hex){
				close_btn_color = hex;
				header_ctl.change();
			}
		});
		$('#icon_img').setUploadImage({
			url: '/admin/ajax/upload_image.cm',
			dropZone : 'icon_img_upload_wrap',
			singleFileUploads:true,
			formData: {temp:'Y',target: 'popup'}
		},function(res,data){
			$.each(data,function(e,tmp){
				header_ctl.change();
				img_name = tmp.name;
				if(tmp.error == "" || tmp.error == null){
					$("#icon_img_wrap").show();
					$("#icon_img_upload_wrap").hide();
					$('#icon_img_wrap img').attr('src',CDN_UPLOAD_URL+tmp.url);
					$("#icon_img_tmp_idx").val(tmp.tmp_idx);
					$("#icon_img_url").val(tmp.url);
				}else{
					alert(tmp.error);
				}
			});
		});

		$position_horizontal_option.each(function(){
			if($(this).val() == 'center'){
				$(this).parent().nextAll('.col-sm-1, .col-sm-2').hide();
			} else {
				$(this).parent().nextAll('.col-sm-1, .col-sm-2').show();
			}
		});

		header_ctl = new HEADER_CONTROL();
		header_ctl.init();
		header_ctl.addBtn('save',function(){
			submit();
		});
		createEvent();
		option_invisible();
		//editor(data);
	};

	var editor = function(data){

		//글양식 에디터 시작
		$body_html_editor.html(data.body_html == '' ? '' : data.body_html);
		if(FROALA_VERSION >= 300){
			var body_html_froala = setFroala('#dof ._body_html_editor', {
				theme: 'custom',
				imageDefaultWidth: 0,
				imageDefaultAlign: 'left',
				pastePlain: true,
				pasteImage: false,
				zIndex: 99999,
				linkAutoPrefix: '',
				fontFamily: SITE_COUNTRY_CODE === TAIWAN_COUNTRY_CODE ?
					{
						'': '기본',
						'Arial,Helvetica,sans-serif': 'Arial',
						'Georgia,serif,바탕,batang': 'Georgia',
						'Impact,Charcoal,sans-serif': 'Impact',
						'Tahoma,Geneva,sans-serif': 'Tahoma',
						"'Times New Roman',Times,serif,바탕,batang": 'Times New Roman',
						'Verdana,Geneva,sans-serif': 'Verdana'
					} : {
						'': '기본',
						'Malgun Gothic': '맑은고딕',
						'batang,Times New Roman,serif': '바탕',
						'Arial,Helvetica,sans-serif': 'Arial',
						'Georgia,serif,바탕,batang': 'Georgia',
						'Impact,Charcoal,sans-serif': 'Impact',
						'Tahoma,Geneva,sans-serif': 'Tahoma',
						"'Times New Roman',Times,serif,바탕,batang": 'Times New Roman',
						'Verdana,Geneva,sans-serif': 'Verdana'
					},
				paragraphFormat: {
					H1: 'Heading 1',
					H2: 'Heading 2',
					H3: 'Heading 3',
					H4: 'Heading 4',
					H5: 'Heading 5',
					H6: 'Heading 6',
					N: 'Normal'
				},
				fontSize: ['9', '10', '11', '12', '13', '14', '16', '18', '24', '30', '36', '48', '64', '72', '96', '120', '144', '180', '240'],
				language: SITE_COUNTRY_CODE === TAIWAN_COUNTRY_CODE ? 'zh_tw' : 'ko',
				events: {
					'blur': function(){
						body_html = body_html_froala.html.get(true);
						header_ctl.change();
					}
				}
			});
			body_html = body_html_froala.html.get(true);
		}else{
			$body_html_editor.froalaEditor({
				theme: 'custom',
				imageDefaultWidth: 0,
				imageDefaultAlign: 'left',
				pastePlain: true,
				pasteImage: false,
				zIndex: 99999,
				linkAutoPrefix: '',
				fontFamily: SITE_COUNTRY_CODE === TAIWAN_COUNTRY_CODE ?
					{
						'': '기본',
						'Arial,Helvetica,sans-serif': 'Arial',
						'Georgia,serif,바탕,batang': 'Georgia',
						'Impact,Charcoal,sans-serif': 'Impact',
						'Tahoma,Geneva,sans-serif': 'Tahoma',
						"'Times New Roman',Times,serif,바탕,batang": 'Times New Roman',
						'Verdana,Geneva,sans-serif': 'Verdana'
					} : {
						'': '기본',
						'Malgun Gothic': '맑은고딕',
						'batang,Times New Roman,serif': '바탕',
						'Arial,Helvetica,sans-serif': 'Arial',
						'Georgia,serif,바탕,batang': 'Georgia',
						'Impact,Charcoal,sans-serif': 'Impact',
						'Tahoma,Geneva,sans-serif': 'Tahoma',
						"'Times New Roman',Times,serif,바탕,batang": 'Times New Roman',
						'Verdana,Geneva,sans-serif': 'Verdana'
					},
				paragraphFormat: {
					H1: 'Heading 1',
					H2: 'Heading 2',
					H3: 'Heading 3',
					H4: 'Heading 4',
					H5: 'Heading 5',
					H6: 'Heading 6',
					N: 'Normal'
				},
				fontSize: ['9', '10', '11', '12', '13', '14', '16', '18', '24', '30', '36', '48', '64', '72', '96', '120', '144', '180', '240'],
				toolbarButtons: ['fontFamily','paragraphFormat','fontSize', '|', 'bold','underline', 'italic','|','align',  'formatOL', 'formatUL','insertLink','clearFormatting','insertTable','clearFormatting', '|', 'html'],
				toolbarButtonsMD: ['fontFamily','paragraphFormat','fontSize', '|', 'bold','underline', 'italic','|','align',  'formatOL', 'formatUL','insertLink','clearFormatting','insertTable','clearFormatting', 'html'],
				toolbarButtonsSM: ['fontFamily','paragraphFormat','fontSize', '|', 'bold','underline', 'italic','|','align',  'formatOL', 'formatUL','insertLink','clearFormatting','insertTable','clearFormatting', 'html'],
				language: SITE_COUNTRY_CODE === TAIWAN_COUNTRY_CODE ? 'zh_tw' : 'ko'
			});
			body_html = $body_html_editor.froalaEditor("html.get", true, true);
			$body_html_editor.off('froalaEditor.blur').on('froalaEditor.blur', function(e, editor){
				body_html = $body_html_editor.froalaEditor("html.get", true, true);
				header_ctl.change();
			});
		}
		//글양식 에디터 종료
	};

	var submit = function(){
		var data = $form.serializeObject();
		data.background_color = background_color;
		data.close_btn_color = close_btn_color;
		data.img_name = img_name;
		data.body_html = body_html;

		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/config/popup.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					header_ctl.save();
					history.go(-1);
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var createEvent = function(){
		$form.find('input, textarea').off('change, keyup').on('change, keyup, blur',function(){
			header_ctl.change();
		});
		$form.find('select').change(function(){
			header_ctl.change();
			option_invisible();
		});
		$form.find('input[type=checkbox],input[type=radio]').off('click').on('click',function(){
			header_ctl.change();
			option_invisible();
		});
		$form.find('._position_type').change('click',function(){
			header_ctl.change();
			option_invisible();
		});
		$start_time.off('click').on('click',function(){
			header_ctl.change();
		});
		$end_time.off('click').on('click',function(){
			header_ctl.change();
		});

		$position_horizontal_option.on('change',function(){
			header_ctl.change();
			if($(this).val() == 'center'){
				$(this).parent().nextAll('.col-sm-1, .col-sm-2').hide();
			} else {
				$(this).parent().nextAll('.col-sm-1, .col-sm-2').show();
			}
		});
	};

	var option_invisible = function(){
		if($show_page[0].checked){
			$show_page_list_wrap.css({'display':'none'});
		}else{
			$show_page_list_wrap.css({'display':'block'});
		}

		if($position_type[0].className.indexOf('active') > 0){
			$popup_option_wrap.show();
			$banner_option_wrap.hide();
			$positon_center_options.css({'display':'block'});
			if($show_device[1].checked){ // 대상기기 모바일 체크 여부
				$on_mobile.show();
			} else {
				$on_mobile.hide();
			}
		}else{
			$popup_option_wrap.hide();
			$banner_option_wrap.show();
			$positon_center_options.css({'display':'none'});

			if($show_device[1].checked){ // 대상기기 모바일 체크 여부
				$banner_option_wrap.find('._banner_mobile_height_wrap').show();

			}else{
				$banner_option_wrap.find('._banner_mobile_height_wrap').hide();
			}
		}
		if($position_type.val() == 'PL'){
			$position_horizontal.attr("disabled","disabled");
			$horizontal_unit.attr("disabled","disabled");
			$position_vertical_option.attr("disabled","disabled");
			$position_vertical.attr("disabled","disabled");
			$vertical_unit.attr("disabled","disabled");
			$position_horizontal.val('');
			$horizontal_unit.val('pixel');
			$position_vertical_option.val('browser_top');
			$position_vertical.val('');
			$vertical_unit.val('pixel');
		}else{
			$position_horizontal.removeAttr("disabled");
			$horizontal_unit.removeAttr("disabled");
			$position_vertical_option.removeAttr("disabled");
			$position_vertical.removeAttr("disabled");
			$vertical_unit.removeAttr("disabled");
		}
	};

	var deletePopup = function(idx){
		$.ajax({
			type : 'POST',
			data : {idx : idx},
			url : ('/admin/config/popup/delete.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type:'admin',custom_popup:html,width:550,reopen:true, use_enter : true, hide_event:function(){
						$(window).unbind('keydown');
					}});
			}
		});
	};

	var deletePopupItem = function(idx){
		$.ajax({
			type : 'POST',
			data : {idx : idx},
			url : ('/admin/config/popup/delete_proc.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					location.href="/admin/config/popup";
				}else{
					alert(res.msg);
				}
			}
		});
	};

	return {
		init : function(d){
			init(d);
		},
		deletePopup : function(idx){
			deletePopup(idx);
		},
		deletePopupItem : function(idx){
			deletePopupItem(idx);
		}
	}
}();

var CONFIG_SEO = function(){
	var $form;
	var header_ctl;
	var meta_editor, header_editor, footer_editor, body_editor, ads, app_ads, robots_txt;
	var init = function(){
		$form = $('#dof');
		header_ctl = new HEADER_CONTROL();
		header_ctl.init();
		header_ctl.addBtn('save',function(){
			submit();
		});

		ads = $form.find('._google_ads');
		app_ads = $form.find('._google_app_ads');

		meta_editor = CodeMirror.fromTextArea(document.getElementById("meta_code"), {
			lineNumbers: true,
			lineWrapping: true,
			mode: "text/html",
			matchBrackets: true,
			indentWithTabs: true
		});

		header_editor = CodeMirror.fromTextArea(document.getElementById("header_code"), {
			lineNumbers: true,
			lineWrapping: true,
			mode: "text/html",
			matchBrackets: true,
			indentWithTabs: true
		});

		body_editor = CodeMirror.fromTextArea(document.getElementById("body_code"), {
			lineNumbers: true,
			lineWrapping: true,
			mode: "text/html",
			matchBrackets: true,
			indentWithTabs: true
		});

		footer_editor = CodeMirror.fromTextArea(document.getElementById("footer_code"), {
			lineNumbers: true,
			lineWrapping: true,
			mode: "text/html",
			matchBrackets: true,
			indentWithTabs: true
		});


		robots_txt = CodeMirror.fromTextArea(document.getElementById("robots_txt"), {
			lineNumbers: true,
			lineWrapping: true,
			mode: "text",
			matchBrackets: true,
			indentWithTabs: true
		});

		/*
		robots_editor = CodeMirror.fromTextArea(document.getElementById("robots_code"), {
			lineNumbers: true,
			lineWrapping: true,
			mode: "text",
			matchBrackets: true,
			indentWithTabs: true
		});
		*/

		createEvent();
	};

	var submit = function(){
		var data = $form.serializeObject();
		data.meta = meta_editor.getValue();
		data.header = header_editor.getValue();
		data.body = body_editor.getValue();
		data.footer = footer_editor.getValue();
		data.robots_txt = robots_txt.getValue();
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/config/seo.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					header_ctl.save();
				}else
					alert(res.msg);
			}
		});
	};

	var createEvent = function(){
		$form.find('input, textarea').off('change, keyup').on('change, keyup, blur',function(){
			header_ctl.change();
		});
		$form.find('select').change(function(){
			header_ctl.change();
		});
		$form.find('input[type=checkbox],input[type=radio]').off('click').on('click',function(){
			header_ctl.change();
		});
		header_editor.on('change',function(cm, change){
			header_ctl.change();
		});
		footer_editor.on('change',function(cm, change){
			header_ctl.change();
		});
		ads.on('input',function(){
			if(ads.val().length > 15000){
				alert(getLocalizeString('설명_GoogleAds값초과', '', 'Google Ads의 값은 15,000자를 초과할 수 없습니다.'));
				ads.val(ads.val().substring(0, 15000));
			}
		});
		app_ads.on('input',function(){
			if(app_ads.val().length > 15000){
				alert(getLocalizeString('설명_GoogleAppAds값초과', '', 'Google app-ads의 값은 15,000자를 초과할 수 없습니다.'));
				app_ads.val(app_ads.val().substring(0, 15000));
			}
		});
	};

	return {
		init : function(){
			init();
		}
	}
}();

var CONFIG_TRACE = function(){ //환결설정 -> 전환추적/리마케팅 설정 ==>  마케팅관리 -> 전환추적/리타게팅 관리로 메뉴이동
	var $form;
	var header_ctl;
	var acecounter_common_script;

	var reg_ga4_id = new RegExp(/^G-(.*)$/i);
	var reg_ga_ua_id = new RegExp(/^UA-(.*)$/i);

	var init = function(){
		$form = $('#trace_form');
		if($('#google_ads_payment_complete').prop("checked")) $('._google_payment_id_wrap').show();
		if($('#google_ads_join_complete').prop("checked")) $('._google_join_id_wrap').show();
		if($('#google_ads_registration_complete').prop("checked")) $('._google_registration_id_wrap').show();
		if($('#google_ads_page_view').prop("checked")) $('._google_page_id_wrap').show();
		if($('#fb_include_npay').prop("checked")) $('._fb_api_wrap').show();
		$('#google_ads_payment_complete').change(function(){
			if($("#google_ads_payment_complete").is(":checked")){
				$('._google_payment_id_wrap').show();
			}else{
				$('._google_payment_id_wrap').hide();
			}
		});
		$('#google_ads_join_complete').change(function(){
			if($("#google_ads_join_complete").is(":checked")){
				$('._google_join_id_wrap').show();
			}else{
				$('._google_join_id_wrap').hide();
			}
		});
		$('#google_ads_registration_complete').change(function(){
			if($("#google_ads_registration_complete").is(":checked")){
				$('._google_registration_id_wrap').show();
			}else{
				$('._google_registration_id_wrap').hide();
			}
		});
		$('#google_ads_page_view').change(function(){
			if($("#google_ads_page_view").is(":checked")){
				$('._google_page_id_wrap').show();
			}else{
				$('._google_page_id_wrap').hide();
			}
		});
		$('#fb_include_npay').change(function(){
			if($("#fb_include_npay").is(":checked")){
				$('._fb_api_wrap').show();
			}else{
				$('._fb_api_wrap').hide();
			}
		});
		$('input[name="use_fb_capi"]').change(function(){
			if($(this).val() == 'Y' && $("#available_capi").val() == 'N') {
				alert('네이버페이 구매 완료 시 전환추적 기능을 사용하기 위해선 Facebook CAPI를 적용해야 합니다. 적용 방법은 설정방법 알아보기를 참고하세요.');
			}
		});


		if ( $('#acecounter_common_script').length > 0 ) {
			acecounter_common_script = CodeMirror.fromTextArea(document.getElementById("acecounter_common_script"), {
				lineNumbers: true,
				lineWrapping: true,
				mode: "text/html",
				indentUnit: 4,
				matchBrackets: true,
				indentWithTabs: true
			});
		}

		header_ctl = new HEADER_CONTROL();
		header_ctl.init();
		header_ctl.addBtn('save',function(){
			submit();
		});
		createEvent();
	};

	var openManual = function(type){
		$.ajax({
			type: 'POST',
			data: {'type' : type},
			url: ('/admin/ajax/dialog/trace_manual.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (res) {
				var $html = $(res);
				$.cocoaDialog.open({type:'trace_manual',custom_popup:$html});
			}
		});
	};

	var submit = function(){
		var data = $form.serializeObject();
		if ( typeof acecounter_common_script != "undefined" ) {
			data.acecounter_common_script = acecounter_common_script.getValue();
		}
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/config/trace.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					header_ctl.save();
				}else
					alert(res.msg);
			}
		});
	};

	var createEvent = function(){
		$form.find('input, textarea').off('change, keyup').on('change, keyup, blur',function(){
			header_ctl.change();
		});
		$form.find('select').change(function(){
			header_ctl.change();
		});
		$form.find('input[type=checkbox],input[type=radio]').off('click').on('click',function(){
			header_ctl.change();
		});

		$form.find('#google_analytics_ecommerce').on('change',function(){
			var bool = $(this).val() == 'Y';
			$form.find('#ga_include_npay_wrapper').toggle(bool);
			if(!bool){
				$form.find('input[name="ga_include_npay"]:checkbox').prop('checked',false);
			}

			callbackGoogleAnalytics4ApiSecretWrap();
		});

		$form.find('input[name="google_analytics_id"]').on('change', function() {
			callbackGoogleAnalytics4ApiSecretWrap();
		});
	};

	var callbackGoogleAnalytics4ApiSecretWrap = function() {
		var $_ga4_api_secret_wrap = $form.find('#ga4_api_secret_wrap');
		var $_google_analytics_id = $form.find('input[name="google_analytics_id"]');
		var $_google_analytics_ecommerce = $form.find('#google_analytics_ecommerce');

		var google_analytics_id = $_google_analytics_id.val();
		/* $_ga4_api_secret_wrap.toggle(reg_ga4_id.test(google_analytics_id) && $_google_analytics_ecommerce.val() == 'Y'); */
		$_ga4_api_secret_wrap.toggle($_google_analytics_ecommerce.val() == 'Y');
	};

	return {
		init : function(){
			init();
		},
		'openManual' : function(type){
			openManual(type);
		},
		submit : function(){
			submit();
		}
	}

}();

var CONFIG_TRACE_ADVANCED = function(){
	var $form;
	var header_ctl;
	var payment_complete_code_editor, join_complete_editor,login_complete_editor, add_cart_editor, search_editor, view_contents_editor, payment_order_list_editor;
	var init = function(){
		$form = $('#dof');
		header_ctl = new HEADER_CONTROL();
		header_ctl.init();
		header_ctl.addBtn('save',function(){
			submit();
		});
		payment_complete_code_editor = CodeMirror.fromTextArea(document.getElementById("payment_complete_code"), {
			lineNumbers: true,
			lineWrapping: true,
			mode: "text/html",
			indentUnit: 4,
			matchBrackets: true,
			indentWithTabs: true
		});
		join_complete_editor = CodeMirror.fromTextArea(document.getElementById("join_complete_code"), {
			lineNumbers: true,
			lineWrapping: true,
			mode: "text/html",
			indentUnit: 4,
			matchBrackets: true,
			indentWithTabs: true
		});
		login_complete_editor = CodeMirror.fromTextArea(document.getElementById("login_complete_code"), {
			lineNumbers: true,
			lineWrapping: true,
			mode: "text/html",
			indentUnit: 4,
			matchBrackets: true,
			indentWithTabs: true
		});
		add_cart_editor = CodeMirror.fromTextArea(document.getElementById("add_cart_code"), {
			lineNumbers: true,
			lineWrapping: true,
			mode: "text/html",
			indentUnit: 4,
			matchBrackets: true,
			indentWithTabs: true
		});
		search_editor = CodeMirror.fromTextArea(document.getElementById("search_code"), {
			lineNumbers: true,
			lineWrapping: true,
			mode: "text/html",
			indentUnit: 4,
			matchBrackets: true,
			indentWithTabs: true
		});
		view_contents_editor = CodeMirror.fromTextArea(document.getElementById("view_contents_code"), {
			lineNumbers: true,
			lineWrapping: true,
			mode: "text/html",
			indentUnit: 4,
			matchBrackets: true,
			indentWithTabs: true
		});
		payment_order_list_editor = CodeMirror.fromTextArea(document.getElementById("payment_order_list_code"), {
			lineNumbers: true,
			lineWrapping: true,
			mode: "text/html",
			indentUnit: 4,
			matchBrackets: true,
			indentWithTabs: true
		});
		createEvent();
	};

	var submit = function(){
		var data = $form.serializeObject();
		data.payment_complete_code = payment_complete_code_editor.getValue();
		data.join_complete_code = join_complete_editor.getValue();
		data.login_complete_code = login_complete_editor.getValue();
		data.add_cart_code = add_cart_editor.getValue();
		data.search_code = search_editor.getValue();
		data.view_contents_code = view_contents_editor.getValue();
		data.order_list_code = payment_order_list_editor.getValue();
		$.ajax({
			type: 'POST',
			data: {data : data},
			url: ('/admin/ajax/config/advanced_trace.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					header_ctl.save();
					// $('head').append(res.pc.body);
				}else
					alert(res.msg);
			}
		});
	};

	var createEvent = function(){
		payment_complete_code_editor.on('change',function(cm, change){
			header_ctl.change();
		});
		join_complete_editor.on('change',function(cm, change){
			header_ctl.change();
		});
		login_complete_editor.on('change',function(cm, change){
			header_ctl.change();
		});
		add_cart_editor.on('change',function(cm, change){
			header_ctl.change();
		});
		search_editor.on('change',function(cm, change){
			header_ctl.change();
		});
		view_contents_editor.on('change',function(cm, change){
			header_ctl.change();
		});
		payment_order_list_editor.on('change',function(cm, change){
			header_ctl.change();
		});
	};

	var changeCodeType = function(type){
		submit();
		var _type = type.split('_');
		var code_type = _type[0];
		var code_location = _type[1];
		$.ajax({
			type: 'POST',
			data: {code_type : code_type, code_location : code_location},
			url: ('/admin/ajax/config/change_advanced_trace_type.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					switch(code_type){
						case 'payment':
							$('#payment_code_type').val(code_location);
							if(res.change_code != null) payment_complete_code_editor.setValue(res.change_code);
							else payment_complete_code_editor.setValue('');
							break;
						case 'join':
							$('#join_code_type').val(code_location);
							if(res.change_code != null) join_complete_editor.setValue(res.change_code);
							else join_complete_editor.setValue('');
							break;
						case 'login':
							$('#login_code_type').val(code_location);
							if(res.change_code != null) login_complete_editor.setValue(res.change_code);
							else login_complete_editor.setValue('');
							break;
						case 'cart':
							$('#cart_code_type').val(code_location);
							if(res.change_code != null) add_cart_editor.setValue(res.change_code);
							else add_cart_editor.setValue('');
							break;
						case 'search':
							$('#search_code_type').val(code_location);
							if(res.change_code != null) search_editor.setValue(res.change_code);
							else search_editor.setValue('');
							break;
						case 'contents':
							$('#contents_code_type').val(code_location);
							if(res.change_code != null) view_contents_editor.setValue(res.change_code);
							else view_contents_editor.setValue('');
							break;
					}
					//header body footer 탭 active 처리
					$('._' + type).parent().parent().siblings().children().children().removeClass('active');
					header_ctl.save();
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var appendTraceCode = function(location,code){
		switch(location){
			case 'header' :
				$('head').append(code);
				break;
			case 'body' :
				$('body').append(code);
				break;
			case 'footer' :
				$('footer').append(code);
				break;
		}
	};

	return {
		init : function(){
			init();
		},
		changeCodeType : function(type){
			changeCodeType(type);
		},appendTraceCode : function(location,code){
			appendTraceCode(location,code);
		}
	}

}();

var CONFIG_FSS = function(){
	var $fss_wrap;
	var $toggle_menu_setting_btn;
	var $toggle_menu_manual_btn;
	var $toggle_menu_setting_wrap;
	var $toggle_menu_manual_wrap;

	var init = function($obj){
		$fss_wrap = $obj;
		$toggle_menu_setting_btn = $fss_wrap.find('._toggle_menu_setting_btn');
		$toggle_menu_manual_btn = $fss_wrap.find('._toggle_menu_manual_btn');
		$toggle_menu_setting_wrap = $fss_wrap.find('._toggle_menu_setting_wrap');
		$toggle_menu_manual_wrap = $fss_wrap.find('._toggle_menu_manual_wrap');
	};

	var changeToggleMenu = function(toggle_menu_key){
		if(toggle_menu_key == 'setting'){
			$toggle_menu_setting_btn.toggleClass('active', true);
			$toggle_menu_manual_btn.toggleClass('active', false);
			$toggle_menu_setting_wrap.show();
			$toggle_menu_manual_wrap.hide();
		}else{
			$toggle_menu_setting_btn.toggleClass('active', false);
			$toggle_menu_manual_btn.toggleClass('active', true);
			$toggle_menu_setting_wrap.hide();
			$toggle_menu_manual_wrap.show();
		}
	};

	return{
		'init': function($obj){
			init($obj);
		},
		'changeToggleMenu': function(toggle_menu_key){
			changeToggleMenu(toggle_menu_key);
		},
	}
}();

var CONFIG_FBE = function(){
	var $fbe_wrap;
	var $toggle_menu_setting_btn;
	var $toggle_menu_manual_btn;
	var $toggle_menu_setting_wrap;
	var $toggle_menu_manual_wrap;
	var $form_pixel_save_btn;
	var $open_fbe_btn;
	var dia_setting_data;
	var $popup_window;
	var fbe_data = {};
	var fbe_api_wrap;
	var fbe_connect_check;

	var init = function($obj){
		$fbe_wrap = $obj;
		$toggle_menu_setting_btn = $fbe_wrap.find('._toggle_menu_setting_btn');
		$toggle_menu_manual_btn = $fbe_wrap.find('._toggle_menu_manual_btn');
		$toggle_menu_setting_wrap = $fbe_wrap.find('._toggle_menu_setting_wrap');
		$toggle_menu_manual_wrap = $fbe_wrap.find('._toggle_menu_manual_wrap');
		$open_fbe_btn = $fbe_wrap.find('._open_fbe_btn');
		fbe_api_wrap = $fbe_wrap.find('._fb_api_wrap');
		fbe_connect_check = $fbe_wrap.find('._fbe_connect_check');


		if($('#fb_include_npay').prop("checked")) fbe_api_wrap.show();

		$('input[name="use_fb_capi"]').change(function(){
			if($(this).val() == 'Y' && $("#available_capi").val() == 'N') {
				alert('네이버페이 구매 완료 시 전환추적 기능을 사용하기 위해선 Facebook CAPI를 적용해야 합니다. 적용 방법은 설정방법 알아보기를 참고하세요.');
			}
		});

		$('#fb_include_npay').change(function(){
			if($("#fb_include_npay").is(":checked")){
				fbe_api_wrap.show();
			}else{
				fbe_api_wrap.hide();
			}
		});

		$open_fbe_btn.off('click').on('click', function(){
			startFBE();
		});
	};

	var changeToggleMenu = function(toggle_menu_key){
		if(toggle_menu_key == 'setting'){
			$toggle_menu_setting_btn.toggleClass('active', true);
			$toggle_menu_manual_btn.toggleClass('active', false);
			$toggle_menu_setting_wrap.show();
			$toggle_menu_manual_wrap.hide();
		}else{
			$toggle_menu_setting_btn.toggleClass('active', false);
			$toggle_menu_manual_btn.toggleClass('active', true);
			$toggle_menu_setting_wrap.hide();
			$toggle_menu_manual_wrap.show();
		}
	};

	/**
	 * FBE 처리 로직
	 * 전체 저장, 픽셀 저장이 따로 나뉘어져 있는 이유는 전체 저장 후 픽셀만 따로 변경할 수 있기 때문, 페이스북이 제공하는 API 구조의 한계
	 */
	var startFBE = function(){
		openFBEPopup();
		getMessage();
	};

	var openFBEPopup = function(){
		$.ajax({
			type: 'POST',
			data: {},
			url: '/admin/ajax/config/get_fbe_dia_setting_data.cm',
			dataType: 'json',
			async: false,
			cache: false,
			success: function(res){
				if(res.msg == 'SUCCESS'){
					dia_setting_data = res.dia_setting_data;
					var width = 1153;
					var height = 808;
					var top_pos = screen.height / 2 - height / 2;
					var left_pos = screen.width / 2 - width / 2;
					var openDialog = function(uri, name, options, closeCallback) {
						var $popup_window = window.open(uri, name, options);
						var interval = window.setInterval(function() {
							try {
								if ($popup_window == null || $popup_window.closed) {
									window.clearInterval(interval);
									closeCallback($popup_window);
								}
							}
							catch (e) {
							}
						}, 1000);
						return $popup_window ;
					};

					openDialog(dia_setting_data.popupOrigin, 'ImwebExtension', ['toolbar=no', 'location=no', 'directories=no', 'status=no', 'menubar=no', 'scrollbars=no', 'resizable=no', 'copyhistory=no', 'width=' + width, 'height=' + height, 'top=' + top_pos, 'left=' + left_pos].join(','), function(win) {
						location.reload();
					});
				}else{
					alert(res.msg);

				}
			}
		});
	};

	var getMessage = function(){
		window.removeEventListener('message', handleEvent);
		window.addEventListener('message', handleEvent);
	};

	var handleEvent = function(event){
		if(Object.keys(event.data).length == 0 || !checkEvent(event.data)) return;

		var response_data_type = '';

		switch(event.data.type){
			case 'get dia settings':
				if(checkParam(event.data.params)){
					response_data_type = 'dia settings';
					event.data.params.clientSetup = dia_setting_data;
					response(response_data_type, event.data.params);
				}
				break;
			case 'set catalog':
				response_data_type = checkParam(event.data.params) ? 'ack catalog' : 'fail catalog';
				fbe_data.catalog_id = event.data.params.catalog_id;
				response(response_data_type);
				break;
			case 'set pixel':
				if(checkParam(event.data.params)){
					response_data_type = 'ack set pixel';
					fbe_data.pixel_use_pii = event.data.params.pixel_use_pii;
					updateFBE(event.data.params, 'pixel');
				}else{
					response_data_type = 'fail set pixel';
				}
				response(response_data_type);
				break;
			case 'set merchant settings':
				response_data_type = checkParam(event.data.params) ? 'ack set merchant settings' : 'fail set merchant settings';
				fbe_data.settings_id = event.data.params.setting_id;
				updateFBE(fbe_data, 'total');
				response(response_data_type);
				break;
			case 'set page access token':
				if(checkParam(event.data.params)){
					response_data_type = 'ack page access token';
					fbe_data.page_id = event.data.params.page_id;
					fbe_data.page_token = event.data.params.page_token;
					updateFBE(fbe_data, 'total');
				}else{
					response_data_type = 'fail page access token';
				}
				response(response_data_type);
				break;
			case 'set msger chat':
				break;
			case 'reset':
				if(checkParam(event.data.params)){
					response_data_type = 'ack reset';
					updateFBE(event.data.params, 'reset');
				}else{
					response_data_type = 'fail reset';
				}
				response(response_data_type);
				break;
			default:
				break;
		}
	};

	var checkParam = function(params){
		var chk = true;
		if(params == null) return false;

		if(Object.keys(params).length > 0){
			$.each(params, function(k, v){
				if(typeof v === 'undefined' || v == null){
					chk = false;
					return false;
				}
			});
		}

		return chk;
	};

	var response = function(type, params){
		var msg = {};
		if(type !== null && typeof type !== 'undefined') msg.type = type;
		if(params !== null && params instanceof Object) msg.params = params;

		$popup_window.postMessage(msg, dia_setting_data.popupOrigin);
	};

	var checkEvent = function(data){
		var type = data.type;
		var possible_events = [
			'get dia settings',
			'set page access token',
			'set merchant settings',
			'set pixel',
			'set catalog',
			'set msger chat',
			'reset'
		];

		return (jQuery.inArray(type, possible_events) >= 0);
	};

	var updateFBE = function(data, mode){
		if(mode == '') return;

		$.ajax({
			type: 'POST',
			data: {'data': data, 'mode': mode},
			url: '/admin/ajax/config/update_fbe.cm',
			dataType: 'json',
			async: false,
			cache: false,
			success: function(res){
				if(res.msg == 'SUCCESS'){
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var saveConfigPixel = function(){
		var data = $fbe_wrap.find('#form_pixel').serializeObject();

		$.ajax({
			type: 'POST',
			data: {'data': data},
			url: '/admin/ajax/config/save_config_pixel.cm',
			dataType: 'json',
			async: false,
			cache: false,
			success: function(res){
				if(res.msg != 'SUCCESS'){
					alert(res.msg);
				}
			}
		});
	};

	var resetFBE = function(is_force){
		$.ajax({
			type: 'POST',
			data: {is_force: ( is_force ? 'Y' : 'N' )},
			url: '/admin/ajax/config/reset_fbe.cm',
			dataType: 'json',
			async: false,
			cache: false,
			success: function(res){
				if(res.msg == 'SUCCESS'){
					location.reload();
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var saveDomainFBE = function(domain){
		$.ajax({
			type: 'POST',
			data: {
				domain: domain
			},
			url: '/admin/ajax/config/save_domain_fbe.cm',
			dataType: 'json',
			async: false,
			cache: false,
			success: function(res){
				if(res.msg == 'Authorize'){
					if(confirm(getLocalizeString('설명_FBE도메인재설정', '', "도메인 인증 권한을 얻기 위해 이전 연결한 계정과 동일하게 재설정이 필요합니다. 확인 버튼 클릭 후 페이스북 설정창이 뜨면 계속하기를 눌러 진행해주세요"))){
						 openFBEPopup();
					}
				}else{
					if(res.msg != 'SUCCESS'){
						alert(res.msg);
					}
				}
				location.reload();
			}
		});
	};

	var deleteDomainFBE = function(domain_id){
		$.ajax({
			type: 'POST',
			data: {
				domain_id: domain_id
			},
			url: '/admin/ajax/config/delete_domain_fbe.cm',
			dataType: 'json',
			async: false,
			success: function(res){
				if(res.msg != 'SUCCESS'){
					alert(res.msg);
				}
				location.reload();
			}
		});
	};

	var saveProductSetFBE = function(showcase_code,showcase_name){
		var $input_showcase = $('input[name="showcase_' + showcase_code + '"]');

		$.ajax({
			type: 'POST',
			data: {
				showcase_code: showcase_code,
				showcase_name: showcase_name
			},
			url: '/admin/ajax/config/save_product_fbe.cm',
			dataType: 'json',
			async: false,
			success: function(res){
				if(res.msg == 'SUCCESS'){
					$input_showcase.attr("onchange","deleteProductSetFBE('"+ showcase_code +"','"+res.showcase_name+"')");
					res.msg = getLocalizeString('설명_기획전연동완료', '', '기획전 연동 완료');
				}else{
					$input_showcase.attr("onchange","saveProductSetFBE('"+ showcase_code +"','"+res.showcase_name+"')");
					$input_showcase.prop("checked",false);
				}
				$.cocoaToast.show({
					html: res.msg
				});
			},error: function () {
				$.cocoaToast.show({
					html: getLocalizeString('설명_잠시후다시시도해주세요', '', '잠시 후 다시 시도해주세요.')
				});
			}
		});
	};

	var deleteProductSetFBE = function(showcase_code,showcase_name){
		var $input_showcase = $('input[name="showcase_' + showcase_code + '"]');

		$.ajax({
			type: 'POST',
			data: {
				showcase_code: showcase_code,
				showcase_name: showcase_name,
			},
			url: '/admin/ajax/config/delete_product_fbe.cm',
			dataType: 'json',
			async: false,
			success: function(res){
				if(res.msg == 'SUCCESS'){
					$input_showcase.attr("onchange","saveProductSetFBE('"+ showcase_code +"','"+res.showcase_name+"')");
					res.msg = getLocalizeString('설명_기획전연동해제완료', '', '기획전 연동 해제 완료');
				}else{
					$input_showcase.attr("onchange","deleteProductSetFBE('"+ showcase_code +"','"+res.showcase_name+"')");
					$input_showcase.prop("checked",true);
				}
				$.cocoaToast.show({
					html: res.msg
				});
			},
			error: function () {
				$.cocoaToast.show({
					html: getLocalizeString('설명_잠시후다시시도해주세요', '', '잠시 후 다시 시도해주세요.')
				});
			}
		});
	};

	return{
		'init': function($obj){
			init($obj);
		},
		'changeToggleMenu': function(toggle_menu_key){
			changeToggleMenu(toggle_menu_key);
		},
		'startFBE': function(){
			startFBE();
		},
		'openFBEPopup': function(){
			openFBEPopup();
		},
		'getMessage': function(){
			getMessage();
		},
		'handleEvent': function(data){
			handleEvent(data);
		},
		'checkParam': function(params){
			checkParam(params);
		},
		'response': function(type, params){
			response(type, params);
		},
		'checkEvent': function(data){
			checkEvent(data);
		},
		'updateFBE': function(data, mode){
			updateFBE(data, mode);
		},
		'saveConfigPixel': function(){
			saveConfigPixel();
		},
		'resetFBE': function(is_force){
			resetFBE(is_force);
		},
		'saveDomainFBE': function(domain){
			saveDomainFBE(domain);
		},
		'deleteDomainFBE': function(domain_id){
			deleteDomainFBE(domain_id);
		},
		'saveProductSetFBE': function(showcase_code,showcase_name){
			saveProductSetFBE(showcase_code,showcase_name);
		},
		'deleteProductSetFBE': function(showcase_code,showcase_name){
			deleteProductSetFBE(showcase_code,showcase_name);
		},
	}
}();
var CONFIG_CHANNEL = function(){

	var sendChannelAppUrl = function(s_code, u_code){
		$.ajax({
			type : 'POST',
			data : {site_code : s_code, unit_code : u_code},
			url : ('/admin/ajax/config/send_channel_app_url.cm'),
			dataType : 'json',
			async : false,
			success : function(res){
				if(res.msg === 'SUCCESS'){
					if(res.state !== '' && res.redirect_uri !== ''){
						if(res.code === 1){
							CONFIG_CHANNEL.openChannelAgreePage(res.state, res.redirect_uri);
						}else{
							CONFIG_CHANNEL.moveChannelAuthorizePage(res.state, res.redirect_uri);
						}
					}
				}else{
					alert(res.msg);
				}
			},
			error: function (){
				alert(getLocalizeString('설명_잠시후다시시도해주세요', '', '잠시 후 다시 시도해주세요.'));
			}
		});
	};
	var openChannelAgreePage = function (state, redirect_uri){
		$.ajax({
			type : 'POST',
			data : {state : state, redirect_uri : redirect_uri},
			url : ('/admin/ajax/dialog/channel_agree_page.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(res){
				var $html = $(res);
				$.cocoaDialog.open({type: 'channel_agree', custom_popup: $html});
			},
			error: function (){
				alert(getLocalizeString('설명_잠시후다시시도해주세요', '', '잠시 후 다시 시도해주세요.'));
			}
		});
	};
	var moveChannelAuthorizePage = function (state, redirect_uri){
		$.ajax({
			type : 'POST',
			data : { state : state, redirect_uri : redirect_uri },
			url : ('/admin/ajax/config/make_channel_redirect_url.cm'),
			dataType : 'json',
			async : false,
			success : function(res){
				if(res.msg === 'SUCCESS'){
					if(res.redirect_uri !== ''){
						$('#cocoaModal').modal('hide');
						window.open(res.redirect_uri);
						// window.location.href = res.redirect_uri;
					}
				}else{
					alert('error');
				}
			},
			error: function (){
				alert(getLocalizeString('설명_잠시후다시시도해주세요', '', '잠시 후 다시 시도해주세요.'));
			}
		});
	}
	return{
		'init': function($obj){
			init($obj);
		},
		'sendChannelAppUrl': function(s_code, u_code){
			sendChannelAppUrl(s_code, u_code);
		},
		'openChannelAgreePage': function(state,redirect_uri){
			openChannelAgreePage(state,redirect_uri);
		},
		'moveChannelAuthorizePage': function(state,redirect_uri){
			moveChannelAuthorizePage(state,redirect_uri);
		},
	}
}();
var CONFIG_ETC = function(){
	var $form;
	var $form_join;
	var $form_no_member;
	var header_ctl;
	var policy_editor;
	var policy_join_editor;		// 개인정보 수집 및 이용 (회원가입용)
	var policy_no_member_editor;		// 개인정보 수집 및 이용 (비회원 구매용)
	var tos_list;
	var type;
	var init = function(tos_list, type){
		if(type !== 'regularly'){
			$form = $('#dof');
			$form_join = $('#dof_join');
			$form_no_member = $('#dof_no_member');
			header_ctl = new HEADER_CONTROL();
			header_ctl.init();
			header_ctl.addBtn('save',function(){
				submit();
			});

			policy_editor = CodeMirror.fromTextArea(document.getElementById("policy_editor"), {
				lineNumbers: true,
				lineWrapping: true,
				mode: "text/html",
				matchBrackets: true,
				indentWithTabs: true
			});
			if($form_join.length > 0){		// $form_join 객체가 존재할 때 CodeMirror init
				policy_join_editor = CodeMirror.fromTextArea(document.getElementById("policy_join_editor"), {
					lineNumbers : true,
					lineWrapping : true,
					mode : "text/html",
					matchBrackets : true,
					indentWithTabs : true
				});
			}
			if($form_no_member.length > 0){		// $form_no_member 객체가 존재할 때 CodeMirror init
				policy_no_member_editor = CodeMirror.fromTextArea(document.getElementById("policy_no_member_editor"), {
					lineNumbers : true,
					lineWrapping : true,
					mode : "text/html",
					matchBrackets : true,
					indentWithTabs : true
				});
			}
		}
		createEvent(tos_list, type);
	};

	var confirmSave = function(){
		if(getLocalizeString('설명_저장하시겠습니까', '', '저장 하시겠습니까?')){
			submit();
			return true;
		}else{
			return true;
		}
	};

	var confirmReset = function(type){
		if(confirm(getLocalizeString("설명_공정거래위원회권고내용으로되돌리시겠습니까", "", "공정거래위원회 등에서 권고하는 기본 내용으로 되돌리시겠습니까?\n되돌리신 후 업체명이나 사이트명 등 내용을 일부 수정해 주셔야 합니다."))){
			var data = $form.serializeObject();
			var data = {'is_reset': 'Y','mode': data.mode, type : type};
			var editor = policy_editor;
			if(data.mode == 'privacy'){
				data['sub'] = $('input[name="_privacy_view_mode"]:checked').val();
				switch(data['sub']){
					case 'join':
						editor = policy_join_editor;
						break;
					case 'no_member':
						editor = policy_no_member_editor;
						break;
				}
			}

			$.ajax({
				type: 'POST',
				data: data,
				url: '/admin/ajax/config/etc.cm',
				dataType: 'json',
				async: false,
				cache: false,
				success: function (res){
					if(res.msg == 'SUCCESS'){
						editor.setValue(res.body);
						header_ctl.change();
					}else{
						alert(res.msg);
					}
				}
			});

		} else {
			return false;
		}
	};

	var submit = function(){
		var data = $form.serializeObject();
		data.body = policy_editor.getValue();
		if(data.mode == 'privacy'){		// 타입이 privacy 일 경우 회원가입용, 비회원 구매용 개인정보 수집 및 이용 설정을 data 에 삽입
			var data_join = $form_join.serializeObject();
			var data_no_member = $form_no_member.serializeObject();
			data_join.body_join = policy_join_editor.getValue();
			data.body_join = data_join.body_join;
			data_no_member.body_no_member = policy_no_member_editor.getValue();
			data.body_no_member = data_no_member.body_no_member;
		}
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/config/etc.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					header_ctl.save();
				}else{
					alert(res.msg);
				}
				if(data.mode == 'third_party'){
					window.location.reload();
				}
			}
		});
	};

	var createEvent = function(tos_list, type){
		if(type !== 'regularly'){
			$('._privacy_view_join').hide();
			$('._privacy_view_no_member').hide();
			$form.find('input, textarea').off('change, keyup').on('change, keyup, blur',function(){
				header_ctl.change();
			});
			$form.find('select').change(function(){
				header_ctl.change();
			});
			$form.find('input[type=checkbox],input[type=radio]').off('click').on('click',function(){
				header_ctl.change();
			});
			policy_editor.on('change',function(cm, change){
				header_ctl.change();
			});
			if($form_join.length > 0){		// $form_join 객체가 존재할 때
				policy_join_editor.on('change', function(cm, change){
					header_ctl.change();
				});
			}
			if($form_no_member.length > 0){		// $form_no_member 객체가 존재할 때
				policy_no_member_editor.on('change', function(cm, change){
					header_ctl.change();
				});
			}
			$form.find('input[name=is_use]').on('change', function(){
				if($form.find('input[name=is_use]:checked').val() === 'not_used'){
					$form.find('#use_third_party_all_agree_wrap').hide();
				}else{
					$form.find('#use_third_party_all_agree_wrap').show();
				}
			});
		}
		$('#select_tos').on('click', function(event){
			imSheetSelect.open(tos_list, type, function(val, id){
				location.href = '/admin/config/etc/?mode=' + val;
			}, {});
		})

	};

	var checkChange = function(){
		return header_ctl.isChange();
	};

	return {
		init : function(tos_list, type){
			init(tos_list, type);
		},
		checkChange : function(){
			return checkChange();
		},
		'confirmReset' : function(type){
			return confirmReset(type);
		},
		confirmSave : function(){
			return confirmSave();
		}
	}
}();

var CONFIG_DOMAIN = function(){
	var $form;
	var $domain_list;
	var $domain_input;

	var domain_list;

	var init = function(){
		$form = $('#dof');
		$domain_list = $('#domain_list');
		domain_list = new DATA();

		$.ajax({
			type: 'POST',
			data: {},
			url: ('/admin/ajax/config/domain_list_get.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					$.each(res.list,function(e,v){
						domain_list.add(v.idx,v);
						addDomainItem(v);
					});
				}else{
					alert(res.msg);
				}
			}
		});
		createEvent();
	};

	var createEvent = function(){
		$('.domain_opt').off('click').on('click',function(){
			submit();
		});
	};

	//변경에 대한 저장 요청
	var submit = function(){
		// 기본 주소로 자동연결, 주소에 www 포함하기
		var domain_opt = {
			'redirect' 		: $('#use_domain_redirect').prop('checked')? 'Y':'N',
			'contain_www' 	: $('#use_domain_www').prop('checked')? 'Y':'N'
		};

		$.ajax({
			type : 'POST',
			data : {'domain_list' : domain_list.data, 'domain_opt' : domain_opt},
			url : ('/admin/ajax/config/domain.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					if(res.return_url != ''){
						location.href = res.return_url;
					}
				}else{
					alert(res.msg);
					if(res.return_url != ''){
						location.href = res.return_url;
					}
				}
			}
		});
	};

	//대표도메인 (기본주소) 변경
	var changeMainDomain = function(idx){
		$.each(domain_list.data,function(e,v){
			if(e==idx){
				v.is_main = 'Y';
			}else
				v.is_main = 'N';
		});
		submit();
	};

	var openDomainForm  = function(idx){
		var data = domain_list.get(idx);
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/config/domain_form.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg === 'SUCCESS'){
					var $html = $(res.html);
					$domain_input = $html.find('._domain_name');
					$.cocoaDialog.open({type : 'admin', custom_popup : $html, width : 600});
					$domain_input.focus();
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var openDomainAddForm  = function(idx){
		var data = domain_list.get(idx);
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/config/domain_add_form.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (res) {
				var $html = $(res);
				$.cocoaDialog.open({type:'admin',custom_popup:$html,width:600});
			}
		});
	};

	var openNameServerForm  = function(idx){
		var data = domain_list.get(idx);
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/config/domain_nameserver.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg === 'SUCCESS'){
					var $html = $(res.html);
					$.cocoaDialog.open({type:'admin_nameserver',custom_popup:$html,width:600});
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var openDomainExtendForm  = function(idx){
		var data = domain_list.get(idx);
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/config/domain_extend_form.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (res) {
				var $html = $(res);
				$.cocoaDialog.open({type:'admin',custom_popup:$html,width:600});
			}
		});
	};

	var openDomainSearch = function(){
		$.ajax({
			type: 'POST',
			data: '',
			url: ('/admin/ajax/config/domain_search.cm'),
			dataType : 'html',
			cache: false,
			success: function(res){
				var $html = $(res);
				$.cocoaDialog.open({type:'admin',custom_popup:$html,width:600, 'close_block':true, hide_event:function(){
						$(window).unbind('keydown');
					}});
			}
		});
	};

	var openDomainBuy = function(){
		var search_domain_name = $('#search_domain_name').val();
		$.ajax({
			type: 'POST',
			data: {search_domain_name : search_domain_name},
			url: ('/admin/ajax/config/domain_buy.cm'),
			dataType : 'html',
			cache: false,
			success: function(res){
				var $html = $(res);
				$.cocoaDialog.open({type:'admin',custom_popup:$html,width:600, 'close_block':true});
			}
		});
	};

	var checkDomainBuyForm = function(){
		if($('#payment_submit_form').find('._same_owner').is(":checked")){
			var admin_info_form = $('#admin_info_form');
			var owner_info_form = $('#owner_info_form');
			admin_info_form.find('#admin_name_korean').val(owner_info_form.find('#owner_name_korean').val());
			admin_info_form.find('#admin_name_english').val(owner_info_form.find('#owner_name_english').val());
			admin_info_form.find('#admin_callnum').val(owner_info_form.find('#owner_callnum').val());
			admin_info_form.find('#admin_company').val(owner_info_form.find('#owner_company').val());
			admin_info_form.find('#admin_email').val(owner_info_form.find('#owner_email').val());
			admin_info_form.find('#admin_country').val(owner_info_form.find('#owner_country').val());
			admin_info_form.find('#admin_city').val(owner_info_form.find('#owner_city').val());
			admin_info_form.find('#admin_addr').val(owner_info_form.find('#owner_addr').val());
			admin_info_form.find('#admin_addr_korean').val(owner_info_form.find('#owner_addr_korean').val());
			admin_info_form.find('#admin_addr_english').val(owner_info_form.find('#owner_addr_english').val());
			admin_info_form.find('#admin_addr_postcode').val(owner_info_form.find('#owner_addr_postcode').val());
			admin_info_form.find('#admin_detail_addr_korean').val(owner_info_form.find('#owner_detail_addr_korean').val());
			admin_info_form.find('#admin_detail_addr_english').val(owner_info_form.find('#owner_detail_addr_english').val());
		}

		var data = $('#payment_submit_form').serializeObject();

		var check_required_value = true;
		$.each(data, function(k, v){
			if(k === 'owner_company' || k === 'admin_company'){
				return true;
			}
			if(v === ''){
				alert($('input[name="'+k+'"]').data('text')+getLocalizeString("설명_을입력해주세요", "", "을(를) 입력해주세요."));
				check_required_value = false;
				return false;
			}
		});

		if(!check_required_value){
			return false;
		}

		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/config/check_domain_buy_form.cm'),
			dataType : 'json',
			cache: false,
			success: function(res){
				if(res.msg == 'SUCCESS'){
					$('#payment_submit_form').submit();
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var checkDomain = function(type,idx){
		var domain_name = $domain_input.val();
		$.ajax({
			type: 'POST',
			data: {domain_name:domain_name,idx:idx},
			url: ('/admin/ajax/config/domain_check.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg === 'SUCCESS'){
					if(!checkUniqDomain(res.data.domain_name)){
						alert(getLocalizeString("설명_중복된도메인입니다", "", "중복된 도메인 입니다."));
					}else{
						if(type === 'add'){
							domain_list.add(res.data.idx, res.data);
							addDomainItem(res.data);
						}else{
							var domain = domain_list.get(res.data.idx);
							domain.domain_name = res.data.domain_name;
							domain.punycode = res.data.punycode;//퓨니코드 저장하도록 수정 - lsy
							changeDomainItem(res.data);
						}
						submit();
						$.cocoaDialog.close();
					}
				}else{
					alert(res.msg);
					return false;
				}
			}
		});
	};

	var openDeleteForm = function(idx){
		$.ajax({
			type: 'POST',
			data: {idx:idx},
			url: ('/admin/ajax/config/domain_delete_form.cm'),
			dataType : 'html',
			cache: false,
			success: function(res){
				var $html = $(res);
				$.cocoaDialog.open({type:'admin',custom_popup:$html,width:600});
			}
		});
	};

	var removeDomain = function(idx){
		if(domain_list.data[idx].is_main !== 'Y'){	//대표도메인이 있을 경우 (라디오박스에 체크되어있을경우)
			domain_list.remove(idx);
			$domain_list.find('._domain_' + idx).remove();
			submit();
		}else{	//대표도메인이 없을 경우
			alert(getLocalizeString("설명_기본주소로설정되어있는도메인은삭제", "", "기본주소로 설정되어 있는 도메인은 삭제하실수 없습니다.\n다른 도메인으로 기본주소를 변경 후 삭제 해주시기 바랍니다."));
		}
	};

	var checkUniqDomain = function(domain_name){
		var st = true;
		$.each(domain_list.data,function(e,v){
			if(v.domain_name === domain_name){
				st = false;
				return false;
			}
		});
		return st;
	};

	var changeDomainItem = function(data){
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/config/domain_item.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (res) {
				var $html = $(res);
				$domain_list.find('._domain_'+data.idx).replaceWith($html);
			}
		});
	};

	var addDomainItem = function(data){
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/config/domain_item.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (res) {
				var $html = $(res);
				$domain_list.append($html);
			}
		});
	};

	var checkBuyDomain = function(){
		$('._available_domain').hide();
		$('._unavailable_domain').hide();
		$("._search_loding_wrap").show();
		var search_domain_name = $("#search_domain_name").val();
		$.ajax({
			type: 'POST',
			data: {'search_domain_name':search_domain_name},
			url: ('/admin/ajax/config/domain_buy_check.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (result) {
				setTimeout(function(){
					if(result.msg == 'SUCCESS'){
						$("._search_loding_wrap").hide();
						switch(result.domain_res.code){
							case '32000':
								$('._available_domain').show();
								break;
							case '34000':
								$('._unavailable_domain').show();
								break;
							default:
								alert(result.domain_res.msg + '(' + result.domain_res.code + ')');
						}
					}else{
						$("._search_loding_wrap").hide();
						alert(result.msg);
					}
				},800);
			}
		});
	};

	var changePrice = function(domain,p){
		var period = p;
		$.ajax({
			type: 'POST',
			data: {domain:domain, period : period},
			url: ('/admin/ajax/config/domain_price_change.cm'),
			dataType : 'json',
			cache: false,
			success: function(res){
				if(res.msg == 'SUCCESS'){
					$('._price').html(res.price_str);
					$('._tax_price').html(res.tax_str);
					$('._total_price').html(res.total_price_str);
					$('#one_year_price').html(res.one_year_price);
					$('#two_year_price').html(res.two_year_price);
					$('#three_year_price').html(res.three_year_price);
				}
			}
		});
	};

	var addRecord = function(imweb_nameserver){
		var list = [];
		var domain_name = $("#record_list input[name='domain_name']").val();
		$("#record_list ._record_sub_wrap").each(function(){
			var data = {};
			data.idx			 = $(this).find("input[name='idx']").val();
			data.is_alias		 = $(this).find("input[name='is_alias']").val();
			data.alias_target	 = $(this).find("input[name='alias_target']").val();
			data.alias_zone_id	 = $(this).find("input[name='alias_zone_id']").val();
			data.record_name	 = $(this).find("input[name='record_name']").val();
			data.record_type	 = $(this).find("select[name='record_type']").val();
			data.service		 = $(this).find("input[name='service']").val();
			data.protocol		 = $(this).find("select[name='protocol']").val();
			data.weight			 = $(this).find("input[name='weight']").val();
			data.port			 = $(this).find("input[name='port']").val();
			data.content		 = $(this).find("input[name='content']").val();
			data.ttl			 = $(this).find("input[name='ttl']").val();
			data.prio			 = $(this).find("input[name='prio']").val();
			if(data.record_name === "" || data.content === "") return true;
			list.push(data);
		});
		$.ajax({
			type: 'POST',
			data: {'record_list':list,'domain_name':domain_name},
			url: ('/admin/ajax/config/add_record.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (result) {
				if(result.msg === "SUCCESS"){
					if(imweb_nameserver === 'true'){
						alert(getLocalizeString("설명_저장완료", "", "저장 완료"));
						$.cocoaDialog.close();
					}else{
						$.cocoaDialog.close();
						$.ajax({
							type: 'POST',
							data: {},
							url: ('/admin/ajax/dialog/record_save_form.cm'),
							dataType: 'html',
							async: false,
							cache: false,
							success: function (html) {
								$.cocoaDialog.open({type:'admin',custom_popup:html,width:600});
							}
						});

					}

				}else{
					alert(result.msg);
				}
			}
		});
	};

	var addRecordForm = function(){
		var $html = '';

		$html += "<tr class='_record_sub_wrap'>";

		$html += "<td class='vertical-middle'>";
		$html += "<input type='hidden' name='is_alias' value='N' />";
		$html += "<select class='form-control static dirty' name='record_type' onchange='CONFIG_DOMAIN.changeRecordType($(this))'>";
		$html += "<option value='A'>A</option>";
		$html += "<option value='MX'>MX</option>";
		$html += "<option value='TXT'>TXT</option>";
		$html += "<option value='CNAME'>CNAME</option>";
		$html += "<option value='SRV'>SRV</option>";
		$html += "</select>";
		$html += "</td>";

		$html += "<td class='vertical-middle _record_name'>";
		$html += "<input type='text' class='form-control' name='record_name' value=''>";
		$html += "</td>";

		$html += "<td class='vertical-middle _record_content'>";
		$html += "<input type='text' class='form-control' name='content' value=''>";
		$html += "</td>";

		$html += "<td class='vertical-middle _record_prio'></td>";

		$html += "<td class='vertical-middle'>";
		$html += '<a href="javascript:;" class="btn float_l" onclick="CONFIG_DOMAIN.deleteRecordForm($(this))"><i class="btm bt-trash vertical-middle text-15"></i></a>';
		$html += "</td>";

		$html += "</tr>";

		$("._record_wrap").append($html);
	};

	var deleteRecordForm = function(t){
		t.parent().parent().remove();
	};

	var addOtherCompanyRecord = function(){
		switch($("select[name='other_company_record']").val()){
			case 'daum_smartwork':

				break;
			case 'hiworks':

				break;
			case 'line_wix':

				break;
			case 'g_suite':

				break;
		}
	};

	var domainDnsInstantUpdate = function(domain_name){
		$.ajax({
			type: 'POST',
			data: {domain_name:domain_name},
			url: ('/admin/ajax/config/domain_dns_instant_update.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (result) {
				if(result.msg == "SUCCESS"){
					location.reload();
				}else{
					alert(result.msg);
				}
			}
		});
	};

	var openManual = function(){
		$.ajax({
			type: 'POST',
			data: {},
			url: ('/admin/ajax/dialog/domain_record_manual.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (res) {
				var $html = $(res);
				$.cocoaDialog.open({type:'domain_record_manual',custom_popup:$html});
			}
		});
	};

	var openSslApplyForm = function(){
		$.ajax({
			type: 'POST',
			data: {},
			url: ('/admin/ajax/config/ssl_apply_form.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (res) {
				var $html = $(res);
				$.cocoaDialog.open({type:'admin',custom_popup:$html,width:600, 'close_block':true});
			}
		});
	};

	var addSslApplyData = function(){
		var data = $('#ssl_apply_form').serializeObject();
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/config/add_ssl_apply.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					alert(getLocalizeString("설명_SSL신청이완료", "", "SSL 신청이 완료되었습니다."));
					$.cocoaDialog.close();
				}else{
					alert(res.msg);
					return false;
				}
			}
		});
	};

	var openSslExtendForm = function(idx){
		$.ajax({
			type: 'POST',
			data: {'idx': idx},
			url: ('/admin/ajax/config/ssl_extend_form.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function(res){
				if(res.msg == 'SUCCESS'){
					$.cocoaDialog.open({type: 'admin_ssl_extend_form', custom_popup:res.html});
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var changeRecordType = function(target){
		var $record_name = target.parent().nextAll('._record_name');
		var $record_content = target.parent().nextAll('._record_content');
		var $record_prio = target.parent().nextAll('._record_prio');
		var name_html = '';
		var content_html = '';
		var prio_html = '';
		var root_domain_name = $('#root_domain_name').val();
		switch(target.val()){
			case 'A' :
			case 'CNAME' :
			case 'TXT' :
				name_html += "<input type='text' class='form-control' name='record_name' value=''>";
				content_html += "<input type='text' class='form-control' name='content'>";
				break;
			case 'MX' :
				name_html += "<input type='text' class='form-control' name='record_name' value=''>";
				content_html += "<input type='text' class='form-control' name='content'>";
				prio_html += "<input type='text' class='form-control' name='prio' value='0'>";
				break;
			case 'SRV' :
				name_html += "<input type='text' class='form-control' name='record_name' value='"+root_domain_name+"' disabled>";
				content_html += "<input type='text' class='form-control margin-bottom-xl' name='service' placeholder='서비스'>";
				content_html += "<select class='form-control margin-bottom-xl' name='protocol'>";
				content_html += "<option value='_tcp'>TCP</option>";
				content_html += "<option value='_tls'>TLS</option>";
				content_html += "<option value='_udp'>UDP</option>";
				content_html += "</select>";
				content_html += "<input type='text' class='form-control margin-bottom-xl' name='weight' placeholder='가중치'>";
				content_html += "<input type='text' class='form-control margin-bottom-xl' name='port' placeholder='포트'>";
				content_html += "<input type='text' class='form-control' name='content' placeholder='대상'>";
				prio_html += "<input type='text' class='form-control' name='prio'>";
				break;
		}

		$record_name.html(name_html);
		$record_content.html(content_html);
		$record_prio.html(prio_html);
	};

	var addCfAcmData = function(domain_idx, site_code){
		$.ajax({
			type: 'POST',
			data: {'domain_idx' : domain_idx, 'site_code' : site_code},
			url: ('/admin/ajax/config/add_cf_acm_data.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					alert('인증 레코드 신청이 완료 되었습니다. 인증 레코드 발급 까지 약 10분 소요됩니다.');
					location.reload();

				}else{
					alert(res.msg);
					return false;
				}
			}
		});
	};


	return {
		init : function(){
			init();
		},
		openDomainAddForm : function(idx){
			openDomainAddForm(idx);
		},
		openDomainForm : function(idx){
			openDomainForm(idx);
		},
		openNameServerForm : function(idx){
			openNameServerForm(idx);
		},
		openDomainExtendForm : function(idx){
			openDomainExtendForm(idx);
		},
		openDomainSearch : function(){
			openDomainSearch();
		},
		openDomainBuy : function(){
			openDomainBuy();
		},
		checkDomainBuyForm : function(){
			checkDomainBuyForm();
		},
		checkDomain : function(type,idx){
			checkDomain(type,idx);
		},
		openDeleteForm : function(idx){
			openDeleteForm(idx);
		},
		removeDomain : function(idx){
			removeDomain(idx);
		},
		changeMainDomain : function(idx){
			changeMainDomain(idx);
		},
		checkBuyDomain : function(){
			checkBuyDomain();
		},
		changePrice : function(domain,p){
			changePrice(domain,p);
		},
		addRecord : function(imweb_nameserver){
			addRecord(imweb_nameserver);
		},
		addRecordForm : function(){
			addRecordForm();
		},
		deleteRecordForm : function(t){
			deleteRecordForm(t);
		},
		addOtherCompanyRecord : function(){
			addOtherCompanyRecord();
		},
		domainDnsInstantUpdate : function(domain_name){
			domainDnsInstantUpdate(domain_name);
		},
		openManual : function(){
			openManual();
		},
		'openSslApplyForm' : function(){
			openSslApplyForm();
		},
		'addSslApplyData' : function(){
			addSslApplyData();
		},
		'openSslExtendForm': function(idx){
			openSslExtendForm(idx);
		},
		'changeRecordType' : function(target){
			changeRecordType(target);
		},
		'addCfAcmData' : function(domain_idx, site_code){
			addCfAcmData(domain_idx, site_code);

		}
	}
}();

var CONFIG_SSL = function(){
	var mode = '';
	var ssl_version = '';		// 사용 중인 SSL 버젼
	var ssl_price_list = {};		// SSL 가격 정보 리스트
	var $form;		// 폼 전체 영역
	var currency = 'KRW';

	var init = function(form_type, version_list){
		mode = form_type;
		ssl_price_list = version_list;

		$form = $('#ssl_form');
		$form.find('[data-toggle="popover"]').popover();

		addEvent();

		var data = $form.serializeObject();
		if ( data['version'] ) 		ssl_version = data['version'];
		if ( data['currency'] ) 	currency = data['currency'];
		if ( data['country_code'] ) 		changeCountryCode(data['country_code']);
		changePrice();
	};

	var addEvent = function(){
		$form.find(':radio[name="version"]').on('change', function(){
			changePrice();
		});
		$form.find(':radio[name="period"]').on('change', function(){
			changePrice();
		});
		$form.find('select[name="country_code"]').on('change', function(){
			changeCountryCode($(this).val());
		});

		// 다음 주소 Api 호출
		var owner_addr = new ZIPCODE_DAUM();
		owner_addr.init({
			'addr_container' : $('#owner_addr_container'),
			'addr_pop' : $('#owner_addr_container ._owner_add_list'),
			'addr' : $('#locality'),
			'post_code' : $('#post_code_kr'),
			'onShow' : function(){

			},
			'onComplete' : function(res){
				$('#addr').focus();
				var list = res.addressEnglish.split(',');
				list.reverse();
				var new_list = [];
				var detail_list = [];
				$.each(list,function(e,_d){
					new_list.push($.trim(_d));
					if(e >2)
						detail_list.push($.trim(_d));
				});
				detail_list.reverse();
				var detail = detail_list.join();


				$('#locality').val(new_list[1]);
				$('#state').val(new_list[2]);
				$('#addr').val(detail);
			},
			'onClose' : function(){
			},
			'height' : '470'
		});

		$form.find('._alnum').check_key({allow_list: ['-', ',',' ']});

		if ( mode === 'add' ) {
			$form.find('input[name="version"]').change(function(){
				if($('input[name="version"]:checked').val() === 'premium'){
					$('._global_required_value').show();
				}else{
					$('._global_required_value').hide();
				}
			});
		} else {
			var $owner_info_wrap = $form.find('._owner_info_wrap');
			$form.find('._use_org_owner_info').off('click').on('click', function(){
				if($(this).prop('checked') === true){
					$owner_info_wrap.hide();
				}else{
					$owner_info_wrap.show();
				}
			});
		}

		$('#english_business_license_upload').fileupload({
			url: '/admin/ajax/upload_image.cm',
			formData: {temp: 'Y', target: 'ssl'},
			dataType: 'json',
			singleFileUploads: false,
			limitMultiFileUploads: 1,
			dropZone: null,
			start: function(e, data){
				// TODO site 에서는 preloader 변수가 아직 없음
				//$preloader.show();
			},
			progress: function(e, data){
				// Calculate the completion percentage of the upload
				var progress = parseInt(data.loaded / data.total * 100, 10);
				if(progress == 100){
					//	data.context.removeClass('working');
				}
			},
			done: function(e, data){
				$.each(data.result.files, function(e, tmp){
					if(tmp.error == null){
						$('#english_business_license_img').show();
						$('#english_business_license_img').attr('src', CDN_UPLOAD_URL + tmp.url);
						$('#english_business_license').val(tmp.url);
						$('._english_business_license_close_btn').show();
					}else{
						alert(tmp.error);
					}
				});
			},
			fail: function(e, data){
				alert(getLocalizeString("설명_업로드에실패하였습니다", "", "업로드에 실패 하였습니다."));
			}
		});
		$('#callnum_verification_document_upload').fileupload({
			url: '/admin/ajax/upload_image.cm',
			formData: {temp: 'Y', target: 'ssl'},
			dataType: 'json',
			singleFileUploads: false,
			limitMultiFileUploads: 1,
			dropZone: null,
			start: function(e, data){
				// TODO site 에서는 preloader 변수가 아직 없음
				//$preloader.show();
			},
			progress: function(e, data){
				// Calculate the completion percentage of the upload
				var progress = parseInt(data.loaded / data.total * 100, 10);
				if(progress == 100){
					//	data.context.removeClass('working');
				}
			},
			done: function(e, data){
				$.each(data.result.files, function(e, tmp){
					if(tmp.error == null){
						$('#callnum_verification_document_img').show();
						$('#callnum_verification_document_img').attr('src', CDN_UPLOAD_URL + tmp.url);
						$('#callnum_verification_document').val(tmp.url);
						$('._callnum_verification_document_close_btn').show();
					}else{
						alert(tmp.error);
					}
				});
			},
			fail: function(e, data){
				alert(getLocalizeString("설명_업로드에실패하였습니다", "", "업로드에 실패 하였습니다."));
			}
		});


		$form.parents('.modal-dialog').find('#ssl_submit').off('click').on('click',function(){
			if ( !chkValidate($form.serializeObject2()) ) return false;
			$form.submit();
		});

		if ( $form.find('._tw_invoice_wrapper').length > 0 ) {
			addTwEvent();
		}
	};
	var addTwEvent = function(){
		var $invoice_wrapper = $form.find('._tw_invoice_wrapper');
		$invoice_wrapper.find('select').on('change', function(){
			$invoice_wrapper.find('._invoice_data_wrapper').toggle( ($(this).val().trim()!= '') );
			var invoice_type = $(this).val();
			$invoice_wrapper.find('._invoice_data').each(function(){
				var target = $(this).data('target');
				$(this).toggle(target.indexOf(invoice_type) != -1);
			});
		});

		$invoice_wrapper.find('._invoice_love_code').on('keyup', function(){
			$(this).data('checked', false);
			$invoice_wrapper.find('._love_code_chk_btn').addClass('btn-primary');
		});
	};
	var checkLoveCode = function(){
		var love_code = $('._invoice_love_code').val();
		if ( love_code.length > 0 ) {
			$.ajax({
				"type": "POST",
				"url": "/admin/ajax/check_invoice_donation_code.cm",
				"data": {"love_code": love_code},
				"dataType": "JSON",
				"success": function(res){
					if ( res.msg == 'SUCCESS' ) {
						$('._invoice_love_code').data('checked', true);
						$('._love_code_chk_btn').removeClass('btn-primary');
					} else {
						alert(res.msg);
					}
				}
			});
		}
		return false;
	};

	var chkValidate = function(data){
		var _version = ssl_version;
		if(typeof data['version'] != "undefined") _version = data['version'];
		if(!(_version in ssl_price_list)){
			alert(getLocalizeString("설명_잘못된인증서타입입니다", "", "잘못된 인증서 타입 입니다."));
			return false;
		}
		if(!(data['period'] in ssl_price_list[ssl_version])){
			alert(getLocalizeString("설명_선택한기간이잘못", "", "선택한 기간이 잘못 되었습니다."));
			return false;
		}

		if(mode == 'new'){
			if(data['domain'] == ''){
				alert(getLocalizeString("설명_사이트도메인을입력해주세요", "", "사이트 도메인을 입력해주세요."));
				return false;
			}
			if(data['domain'] == 'not_sel'){
				alert(getLocalizeString("설명_사이트도메인을선택해주세요", "", "사이트 도메인을 선택해주세요."));
				return false;
			}
			if(data['domain'].indexOf('http://') > -1){
				alert(getLocalizeString("설명_사이트도메인을제외해주세요", "", "http:// 를 제외해주세요."));
				return false;
			}
			if(data['domain'].indexOf('www.') > -1){
				alert(getLocalizeString("설명_사이트도메인을제외해주세요2", "", "www. 을 제외해주세요."));
				return false;
			}
			if(data['domain'].indexOf(' ') > -1){
				alert(getLocalizeString("설명_공백을제외해주세요", "", "공백을 제외해주세요."));
				return false;
			}
			if(data['domain'].indexOf('/') > -1){
				alert(getLocalizeString("설명_사이트도메인을제외해주세요3", "", "/ 를 제외해주세요."));
				return false;
			}
		}

		if(data['company_name'] == ''){
			alert(getLocalizeString("설명_회사명기관명을입력해주세요", "", "회사명/기관명을 입력해주세요."));
			return false;
		}
		if(data['department_name'] == ''){
			alert(getLocalizeString("설명_담당부서를입력해주세요", "", "담당부서를 입력해주세요."));
			return false;
		}
		if(data['country_code'] == 'KR'){
			if(data['locality'] == ''){
				alert(getLocalizeString("설명_광역시도를입력해주세요", "", "광역시/도를 입력해주세요."));
				return false;
			}
		}else{
			// if(data['locality2'] == ''){
			// 	alert(getLocalizeString("설명_광역시도를입력해주세요", "", "광역시/도를 입력해주세요."));
			// 	return false;
			// }
		}
		if(data['state'] == ''){
			alert(getLocalizeString("설명_구시군을입력해주세요", "", "구/시/군을 입력해주세요."));
			return false;
		}
		if(data['addr'] == ''){
			alert(getLocalizeString("설명_주소를입력해주세요", "", "주소를 입력해주세요."));
			return false;
		}
		if($("#country_code").val() === "KR"){
			if(data['post_code_kr'] == ''){
				alert(getLocalizeString("설명_우편번호를입력해주세요", "", "우편번호를 입력해주세요"));
				return false;
			}
		}else{
			if(data['post_code'] == ''){
				alert(getLocalizeString("설명_우편번호를입력해주세요", "", "우편번호를 입력해주세요"));
				return false;
			}
		}

		if(mode == 'new'){
			if(data['version'] === 'premium'){
				if(data['global_version_auth_number'] === ''){
					alert(getLocalizeString("설명_인증용연락처를입력해주세요", "", "인증용 연락처를 입력해주세요."));
					return false;
				}
				if(data['english_business_license'] === ''){
					alert(getLocalizeString("설명_영문사업자등록증을첨부해주세요", "", "영문 사업자 등록증을 첨부해 주세요."));
					return false;
				}
				if(data['callnum_verification_document'] === ''){
					alert(getLocalizeString("설명_전화번호확인서류를첨부해주세요", "", "전화번호 확인 서류를 첨부해 주세요."));
					return false;
				}
			}
		}
		if ( typeof data['sel_payment_type'] == "undefined" || data['sel_payment_type'] == "" ) {
			alert(getLocalizeString("설명_결제방법을선택해주세요", "", "결제방법을 선택해주세요"));
			return false;
		}

		if ( $form.find('._tw_invoice_wrapper').length > 0 ) {
			if ( typeof data['invoice'] == "undefined" ) {
				alert(getLocalizeString("설명_통일영수증정보를입력해주세요", "", "통일영수증 정보를 입력해주세요."));
				return false;
			}
			if ( typeof data['invoice']['type'] == "undefined" || data['invoice']['type'] == "" ) {
				alert(getLocalizeString("설명_통일영수증종류를선택해주세요", "", "영수증 종류를 선택해주세요."));
				return false;
			}
			if ( data['invoice']['type'] == 'donation' ) {
				if ( !$('._invoice_love_code').data('checked') ) {
					alert(getLocalizeString('설명_기부코드를체크해주세요', '', '기부코드를 체크 해 주세요.'));
					return false;
				}
			}

		}

		return true;
	};

	var getVatRate = function(){
		var rate = 1;
		switch ( SITE_COUNTRY_CODE ) {
			case KOREA_COUNTRY_CODE:
				rate = 1.1;
				break;
			default:
				break;
		}
		return rate;
	};
	// 연장 기간에 따라 가격을 동적으로 표시해줌, 연장의 경우엔 버전 변경이 불가능하므로 기간별 가격만 처리
	var changePrice = function(){
		var data = $form.serializeObject();
		var version = data['version'];
		var period = data['period'];

		var ssl_price = parseInt(ssl_price_list[version][period]) * getVatRate();
		var ssl_price_text = LOCALIZE.getCurrencyFormat(ssl_price, true, currency);
		if ( SITE_COUNTRY_CODE === KOREA_COUNTRY_CODE ) {
			ssl_price_text = getLocalizeString('설명_n원', money_format(ssl_price), '%1원');
		}
		$form.find('._ssl_price_wrap').html(ssl_price_text);
	};

	// 국가코드가 대한민국일 경우에는 DAUM 지도 API 사용, 아닐 경우 수동 입력
	var changeCountryCode = function(country_code){
		if(country_code == 'KR'){
			$('#locality').show();
			$('#post_code_kr').show();
			$('#locality2').hide();
			$('#post_code').hide();
			$('#locality2').val('');
			$('#post_code').val('');
		}else{
			$('#locality2').show();
			$('#post_code').show();
			$('#locality').hide();
			$('#post_code_kr').hide();
			$('#locality').val('');
			$('#post_code_kr').val('');
		}
	};

	var removeLicenseImg = function(type){
		if(type === 'english_business_license'){
			$('#english_business_license').val('');
			$('#english_business_license_img').hide();
			$('._english_business_license_close_btn').hide();
		}else{
			$('#callnum_verification_document').val('');
			$('#callnum_verification_document_img').hide();
			$('._callnum_verification_document_close_btn').hide();
		}

	};

	return{
		"init": function(mode, version_list){
			init(mode, version_list);
		},
		"checkLoveCode": function(){
			return checkLoveCode();
		},
		"removeLicenseImg": function(type){
			removeLicenseImg(type);
		}
	}
}();

var CONFIG_SECURITY = function(){
	var header_ctl;
	var $form,$limit_ip_list_form;
	var $ip_list_wrap,$allow_ip_list_wrap;
	var init = function(type){

		if(type == 'security'){ //보안 설정 탭 부분 셋팅

			$form = $('#security_form');

			$limit_ip_list_form = $('#limit_ip_list_form');
			$ip_list_wrap = $('._ip_list_wrap');
			$allow_ip_list_wrap = $('._allow_ip_list_wrap');

			$('#limit_country_list').chosen();

			if($("#limit_ip").is(":checked")){
				$('._limit_ip_list_wrap').show();
			}else{
				$('._limit_ip_list_wrap').hide();
			}
			$('#limit_ip').change(function(){
				if($("#limit_ip").is(":checked")){
					$('._limit_ip_list_wrap').show();
				}else{
					$('._limit_ip_list_wrap').hide();
				}
			});

			if($("#limit_country").is(":checked")){
				$('._limit_country_list_wrap').show();
			}else{
				$('._limit_country_list_wrap').hide();
			}
			$('#limit_country').change(function(){
				if($("#limit_country").is(":checked")){
					$('._limit_country_list_wrap').show();
				}else{
					$('._limit_country_list_wrap').hide();
				}
			});

			if($("#allow_iframe").is(":checked")){
				$('._allow_iframe_domain_list_wrap').show();
			}else{
				$('._allow_iframe_domain_list_wrap').hide();
			}
			$('#allow_iframe').change(function(){
				if($("#allow_iframe").is(":checked")){
					$('._allow_iframe_domain_list_wrap').show();
				}else{
					$('._allow_iframe_domain_list_wrap').hide();
				}
			});


			if($("#admin_allow_ip").is(":checked")){
				$('._admin_allow_ip_wrap').show();
			}else{
				$('._admin_allow_ip_wrap').hide();
			}

			$('#admin_allow_ip').change(function(){
				if($("#admin_allow_ip").is(":checked")){
					$('._admin_allow_ip_wrap').show();
				}else{
					$('._admin_allow_ip_wrap').hide();
				}
			});

			if($("#two_factor_login").is(":checked")){
				$('._two_factor_login_wrap').show();
			}else{
				$('._two_factor_login_wrap').hide();
			}
			$('#two_factor_login').change(function(){
				if($("#two_factor_login").is(":checked")){
					$('._two_factor_login_wrap').show();
				}else{
					$('._two_factor_login_wrap').hide();
				}
			});


		} else if(type == 'privacy'){ //개인정보 보호 설정 탭

			$form = $('#privacy_form');
			var member_inactive = $('#member_inactive');
			var use_inactive_member_email =  $('#use_inactive_member_email');

			//장기간 미사용 시 자동 로그아웃 이벤트
			$('#auto_logout').change(function(){
				if($('#auto_logout').is(":checked")){
					$('._auto_logout_wrap').show();
				}else{
					$('._auto_logout_wrap').hide();
				}
			});

			//로그인 실패시 접속제한 이벤트
			$('#limit_login').change(function(){
				if($('#limit_login').is(":checked")){
					$('._limit_login_wrap').show();
				}else{
					$('._limit_login_wrap').hide();
				}
			});

			//주기적 비밀번호 변경 안내 이벤트
			$('#change_password_notice').change(function(){
				if($('#change_password_notice').is(":checked")){
					$('._change_password_notice_wrap').show();
				}else{
					$('._change_password_notice_wrap').hide();
				}
			});

			//개인정보 유효기간제
			inactive_checked();

			member_inactive.change(function(){
				inactive_checked();
			});

			//휴면 예정 안내 자동 이메일 발송
			use_inactive_member_email.change(function(){
				if(use_inactive_member_email.is(":checked")){
					use_inactive_member_email.attr("checked",false);
					alert(LOCALIZE_ADMIN.설명_자동이메일발송());
				}
			});
		}

		header_ctl = new HEADER_CONTROL();
		header_ctl.init();
		header_ctl.addBtn('save',function(){
			submit(type);
		});
		createEvent();
	};

	var inactive_checked = function(){
		var inactive_wrap = $('._inactive_wrap');
		var member_inactive = $('#member_inactive');

		if(member_inactive.is(":checked")){
			inactive_wrap.show();
		}else{
			inactive_wrap.hide();
			$('._inactive_wrap input').filter(':checkbox').removeAttr('checked');
		}
	}
	var createEvent = function(){
		$form.find('select, textarea').off("change").on("change", function() {
			header_ctl.change();
		});
		$form.find('input[type=checkbox],input[type=radio]').off('click').on('click',function(){
			header_ctl.change();
		});
		$form.find('a[role=button],input[type=radio]').off('click').on('click',function(){
			header_ctl.change();
		});
	};

	var submit = function(type){
		var data = $form.serializeObject();
		if(data.admin_allow_ip == 'ok'){
			if(confirm(LOCALIZE_ADMIN.타이틀_관리페이지접속이허용되는ip등록기능사용시())){
				$.ajax({
					type: 'POST',
					data: {type:type, data:data},
					url: ('/admin/ajax/config/security.cm'),
					dataType: 'json',
					async: false,
					cache: false,
					success: function (res) {
						if(res.msg == 'SUCCESS'){
							header_ctl.save();
						}else
							alert(res.msg);
					}
				});
			}
		}else{
			$.ajax({
				type: 'POST',
				data: {type:type, data:data},
				url: ('/admin/ajax/config/security.cm'),
				dataType: 'json',
				async: false,
				cache: false,
				success: function (res) {
					if(res.msg == 'SUCCESS'){
						header_ctl.save();
					}else
						alert(res.msg);
				}
			});
		}
	};

	var openIpForm = function(type){
		$.ajax({
			type: 'POST',
			data: {type : type},
			url: ('/admin/ajax/dialog/open_ip_form.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					$.cocoaDialog.open({type:'ip_form', custom_popup:res.html});
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var addIP = function(type,ip){
		if(type == 'limit') var temp_ip_list = $('input[name="limit_ip_list"]').serializeObject()['limit_ip_list'];
		else var temp_ip_list = $('input[name="admin_allow_ip_list"]').serializeObject()['admin_allow_ip_list'];
		$.ajax({
			type: 'POST',
			data: {ip : ip, type : type, temp_ip_list : temp_ip_list},
			url: ('/admin/ajax/config/ip_form_proc.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					header_ctl.change();
					$.cocoaDialog.close();
					if(type == 'limit'){
						var $item = '<div class="_ip_list_item"><div class="checkbox checkbox-styled"><label><input type="checkbox" id="'+res.new_ip+'"><span class="no-margin">'+res.new_ip+'</span></label><input type="hidden" name="limit_ip_list" value="'+res.new_ip+'"></div></div>';
						$ip_list_wrap.append($item);
						$('._none_ip_wrap').hide();
					}else{
						var $item = '<div class="_allow_ip_list_item"><div class="checkbox checkbox-styled"><label><input type="checkbox" id="'+res.new_ip+'"><span class="no-margin">'+res.new_ip+'</span></label><input type="hidden" name="admin_allow_ip_list" value="'+res.new_ip+'"></div></div>';
						$allow_ip_list_wrap.append($item);
						$('._allow_none_ip_wrap').hide();
					}
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var deleteIp = function(type){
		if(confirm(getLocalizeString("설명_정말로삭제하시겠습니까", "", "정말로 삭제하시겠습니까?"))){
			if(type == 'limit'){
				var checkboxes = $ip_list_wrap.find('input[type=checkbox]');
				for(var i = 0; i < checkboxes.length; i++){
					if(checkboxes[i].checked){
						var _html = checkboxes[i].closest('div');
						var m_html = _html.closest('._ip_list_item');
						m_html.remove();
					}
				}
			}else{
				var checkboxes = $allow_ip_list_wrap.find('input[type=checkbox]');
				for(var i = 0; i < checkboxes.length; i++){
					if(checkboxes[i].checked){
						var _html = checkboxes[i].closest('div');
						var m_html = _html.closest('._allow_ip_list_item');
						m_html.remove();
					}
				}
			}
		}
	};

	var allCheckToggle = function(type){
		if(type == 'limit'){
			if($('#allToggle_limit').prop('checked')){
				$ip_list_wrap.find('input[type=checkbox]').prop("checked",true);
			}else{
				$ip_list_wrap.find('input[type=checkbox]').prop("checked",false);
			}
		}else{
			if($('#allToggle_allow').prop('checked')){
				$allow_ip_list_wrap.find('input[type=checkbox]').prop("checked",true);
			}else{
				$allow_ip_list_wrap.find('input[type=checkbox]').prop("checked",false);
			}
		}
	};

	var loadPrivacyLog = function(base_url, current_page, search_data, keyword){

		$.ajax({
			type : 'POST',
			data : {'base_url':base_url, 'current_page':current_page, 'search_data':search_data, 'keyword':keyword},
			url : ('/admin/ajax/config/load_privacy_log.cm'),
			dataType : 'json',
			success : function(res){
				if(res.msg == 'SUCCESS'){
					if(res.log_count > 0){
						$('#privacy_log_body').html(res.table_body_html);
						$('#privacy_log_paging').html(res.paging_html);
					}
					$('#privacy_log_count').text(res.log_count);
				}else{
					alert(res.msg);
					$('#privacy_log_count').text(0);
				}
			}
		})
	};

	return{
		'init' : function(type){
			init(type);
		},
		'submit' : function(){
			submit();
		},
		'openIpForm' : function(type){
			openIpForm(type);
		},
		'addIP': function(type,ip){
			addIP(type,ip);
		},
		'deleteIp' : function(type){
			deleteIp(type);
		},
		'allCheckToggle' : function(type){
			allCheckToggle(type);
		},
		'loadPrivacyLog' : function(base_url, current_page, search_data, keyword){
			loadPrivacyLog(base_url, current_page, search_data, keyword);
		}
	}
}();

var CONFIG_OAUTH = function(){
	var $form;
	var header_ctl;
	var $social_order;
	var $social_btn_list;
	var $social_btn_naver;
	var $social_btn_kakao;
	var $social_btn_facebook;
	var $social_btn_google;
	var $social_btn_line;
	var $social_btn_apple;
	var $kakao_sync_btn;
	var $reset_kakao_sync;
	var $naver_wrap;
	var $kakao_wrap;
	var $kakao_sync_wrap;
	var $facebook_wrap;
	var $google_wrap;
	var $line_wrap;
	var $apple_wrap;

	var init = function(old_social_oder,is_free){
		$form = $('#dof');
		$social_order = $form.find('#social_order');
		$social_btn_list = $social_order.find('._social_btn_list');
		$social_btn_kakao = $social_btn_list.find('#kakao').detach();
		$social_btn_naver = $social_btn_list.find('#naver').detach();
		$social_btn_facebook = $social_btn_list.find('#facebook').detach();
		$social_btn_google = $social_btn_list.find('#google').detach();
		$social_btn_line = $social_btn_list.find('#line').detach();
		$social_btn_apple = $social_btn_list.find('#apple').detach();
		$kakao_sync_btn = $form.find('#kakao_sync_btn');
		$reset_kakao_sync = $form.find('#reset_kakao_sync');
		var $use_kakao = $form.find('input[name="use_kakao"]');
		var use_kakao_value = $("input[name='use_kakao']:checked").val();
		if(use_kakao_value == 'S'){
			$use_kakao.off('change').on('change', function(event){
				var $that = $(this);
				if($that.val() == 'N') restKakaoSync();
			});
		}

		$kakao_sync_btn.off('click').on('click', function(){
			openKakaoSync();
		});

		$reset_kakao_sync.off('click').on('click', function(){
			restKakaoSync();
		});

		cleanUpHtml(is_free);

		header_ctl = new HEADER_CONTROL();
		header_ctl.init();
		header_ctl.addBtn('save',function(){
			submit();
		});
		createEvent();

		$social_btn_list.sortable({
			'handle' : '._social_btn',
			'stop' : function(event, ui) {
				header_ctl.change();
			}
		});

		$.each(old_social_oder,function (key,value) {
			$social_order.show();
			switch(value.id){
				case 'kakao':
					$social_btn_list.append($social_btn_kakao);
					break;
				case 'naver':
					$social_btn_list.append($social_btn_naver);
					break;
				case 'facebook':
					$social_btn_list.append($social_btn_facebook);
					break;
				case 'google':
					$social_btn_list.append($social_btn_google);
					break;
				case 'line':
					$social_btn_list.append($social_btn_line);
					break;
				case 'apple':
					$social_btn_list.append($social_btn_apple);
					break;
			}
		});

		$form.find('._radio').change(function(){
			$form.find('._radio').serialize().search("Y") > 0 ? $social_order.show() : $social_order.hide();
			$form.find('._radio').serialize().search("S") > 0 ? $social_order.show() : $social_order.hide();

			switch($(this).attr('name')){
				case 'use_kakao':
					$(this).val() == 'N' ? $social_btn_kakao.detach() : $social_btn_list.append($social_btn_kakao);
					break;
				case 'use_naver':
					$(this).val() == 'Y' ? $social_btn_list.append($social_btn_naver) : $social_btn_naver.detach();
					break;
				case 'use_facebook':
					$(this).val() == 'Y' ? $social_btn_list.append($social_btn_facebook) : $social_btn_facebook.detach();
					break;
				case 'use_google':
					$(this).val() == 'Y' ? $social_btn_list.append($social_btn_google) : $social_btn_google.detach();
					break;
				case 'use_line':
					$(this).val() == 'Y' ? $social_btn_list.append($social_btn_line) : $social_btn_line.detach();
					break;
				case 'use_apple':
					$(this).val() == 'Y' ? $social_btn_list.append($social_btn_apple) : $social_btn_apple.detach();
					break;

			}
		});



		$form.find('._apple_key_upload').fileupload({
			url: '/admin/ajax/shop/upload_apple_key.cm',
			formData: {},
			dataType: 'json',
			singleFileUploads: true,
			limitMultiFileUploads: 1,
			dropZone: false,
			start: function(e, data){},
			progress: function(e, data){},
			done: function(e, data){
				$form.find("._apple_key").val(data.result['key_body']);
				$form.find("._upload_complete_text").show();
				header_ctl.change();
			},
			fail: function(e, data){
				$form.find("._upload_complete_text").hide();
				alert(data.result['msg']);
				header_ctl.change();

			}
		});
	};

	var submit = function(){
		var data = $form.serializeObject();
		var social_order = [];
		$.each($social_btn_list.find('div'),function (key,value) {
			social_order.push(value.id);
		});
		data.social_order = social_order;
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/config/oauth.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					header_ctl.save();
					location.reload();
					if(res.apk_recreate == "Y"){
						if(confirm(getLocalizeString("설명_신청페이지로이동하시겠습니까", "", "해당 변경사항을 앱에 적용하기위해서는 \nAPK 재생성 및 Google Play 스토어에 업로드 작업이 필요합니다.\n앱 수정 페이지로 이동하시겠습니까?"))){
							location.href = '/admin/app/android';
						}
					}
				}else
					alert(res.msg);
			}
		});
	};

	var createEvent = function(){
		$form.find('input, textarea').off('change, keyup').on('change, keyup, blur',function(){
			header_ctl.change();
		});
		$form.find('select').change(function(){
			header_ctl.change();
		});
		$form.find('input[type=checkbox],input[type=radio]').off('click').on('click',function(){
			header_ctl.change();
		});
	};

	var openManual = function(type){
		$.ajax({
			type: 'POST',
			data: {},
			url: ('/admin/ajax/dialog/oauth_manual_'+type+'.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (res) {
				var $html = $(res);
				$.cocoaDialog.open({type:'oauth_manual',custom_popup:$html});
			}
		});
	};

	var cleanUpHtml = function(is_free){
		$naver_wrap = $('.naver_wrap');
		if($('input[name="use_naver"]:checked').val() == 'N'){
			$naver_wrap.hide();
		}else{
			if(is_free == 'N') $naver_wrap.show();
		}
		$('input[name="use_naver"]').change(function(){
			if($(this).val() == 'N') {
				$naver_wrap.hide();
			}else {
				if(is_free == 'N') $naver_wrap.show();
			}
		});
		$kakao_wrap = $('.kakao_wrap');
		$kakao_sync_wrap = $('.kakao_sync_wrap');

		if($('input[name="use_kakao"]:checked').val() != 'S'){
			if($('input[name="use_kakao"]:checked').val() == 'N') $kakao_wrap.hide();
			$kakao_sync_wrap.hide();
		}else{
			if(is_free == 'N') $kakao_sync_wrap.show();
		}
		$('input[name="use_kakao"]').change(function(){
			if($(this).val() == 'S') {
				if(is_free == 'N') $kakao_sync_wrap.show();
				$kakao_wrap.show();
				$('.kakao_text').hide();
			}else if($(this).val() == 'Y'){
				$kakao_sync_wrap.hide();
				$kakao_wrap.show();
				$('.kakao_text').show();
			}else{
				$kakao_wrap.hide();
				$kakao_sync_wrap.hide();
			}
		});

		$facebook_wrap = $('.facebook_wrap');
		if($('input[name="use_facebook"]:checked').val() == 'N'){
			$facebook_wrap.hide();
		}else{
			if(is_free == 'N') $facebook_wrap.show();
		}
		$('input[name="use_facebook"]').change(function(){
			if($(this).val() == 'N') {
				$facebook_wrap.hide();
			}else {
				if(is_free == 'N') $facebook_wrap.show();
			}
		});

		$google_wrap = $('.google_wrap');
		if($('input[name="use_google"]:checked').val() == 'N'){
			$google_wrap.hide();
		}else{
			if(is_free == 'N') $google_wrap.show();
		}
		$('input[name="use_google"]').change(function(){
			if($(this).val() == 'N') {
				$google_wrap.hide();
			}else {
				if(is_free == 'N') $google_wrap.show();
			}
		});

		$line_wrap = $('.line_wrap');
		if($('input[name="use_line"]:checked').val() == 'N'){
			$line_wrap.hide();
		}else{
			if(is_free == 'N') $line_wrap.show();
		}
		$('input[name="use_line"]').change(function(){
			if($(this).val() == 'N') {
				$line_wrap.hide();
			}else {
				if(is_free == 'N') $line_wrap.show();
			}
		});

		$apple_wrap = $('.apple_wrap');
		if($('input[name="use_apple"]:checked').val() == 'N'){
			$apple_wrap.hide();
		}else{
			if(is_free == 'N') $apple_wrap.show();
		}
		$('input[name="use_apple"]').change(function(){
			if($(this).val() == 'N') {
				$apple_wrap.hide();
			}else {
				if(is_free == 'N') $apple_wrap.show();
			}
		});

	};


	var openKakaoSync = function(){
		$.ajax({
			type: 'POST',
			data: {},
			url: '/admin/ajax/config/check_kakao_sync.cm',
			dataType: 'json',
			async: false,
			cache: false,
			success: function(res){
				if(res.msg == 'SUCCESS'){
					header_ctl.isChange();
					var width = 650;
					var height = 808;
					var top_pos = screen.height / 2 - height / 2;
					var left_pos = screen.width / 2 - width / 2;
					var openDialog = function(uri, name, options, closeCallback) {
						var $popup_window = window.open(uri, name, options);
						var interval = window.setInterval(function(){
							try{
								if($popup_window==null || $popup_window.closed){
									window.clearInterval(interval);
									closeCallback($popup_window);
								}
							}
							catch(e){
							}
						},1000);
						return $popup_window ;
					};
					openDialog('https://sync4ecp.kakao.com/dialog/connect?appKey=8127e21ead0e89903843af430ff4c518&storeKey='+UNIT_CODE, 'ImwebSync', ['toolbar=no', 'location=no', 'directories=no', 'status=no', 'menubar=no', 'scrollbars=no', 'resizable=no', 'copyhistory=no', 'width=' + width, 'height=' + height, 'top=' + top_pos, 'left=' + left_pos].join(','), function(win) {
						header_ctl.save();
						location.reload();
					});
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var restKakaoSync = function(){
		if(confirm(LOCALIZE_ADMIN.설명_연동을해제하시겠습니까())){
			$.ajax({
				type: 'POST',
				data: {},
				url: '/admin/ajax/config/reset_kakao_sync.cm',
				dataType: 'json',
				async: false,
				cache: false,
				success: function(res){
					if(res.msg == 'SUCCESS'){
						location.reload();
					}else{
						alert(res.msg);
					}
				}
			});
		}else{
			$("input:radio[name='use_kakao'][value='S']").prop('checked', true);
			$("input:radio[name='use_kakao']").val('S');
		}
	};


	return {
		'init' : function(old_social_oder,is_free){
			init(old_social_oder,is_free);
		},
		'openManual' : function(type){
			openManual(type);
		},
		'openKakaoSync' : function(){
			openKakaoSync();
		},
		'restKakaoSync' : function(){
			restKakaoSync();
		}
	}
}();

var CONFIG_SITE_API = function(){
	var $form;
	var header_ctl;

	var init = function(old_social_oder){
		$form = $('#dof');

		header_ctl = new HEADER_CONTROL();
		header_ctl.init();
		header_ctl.addBtn('save',function(){
			submit();
		});
		createEvent();
	};

	var submit = function(){
		var data = $form.serializeObject();
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/config/site_api.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					header_ctl.save();
					location.reload();
				}else
					alert(res.msg);
			}
		});
	};

	var createEvent = function(){
		$form.find('input, textarea').off('change, keyup').on('change, keyup, blur',function(){
			header_ctl.change();
		});
		$form.find('select').change(function(){
			header_ctl.change();
		});
		$form.find('input[type=checkbox],input[type=radio]').off('click').on('click',function(){
			header_ctl.change();
		});
	};

	var openManual = function(type){
		$.ajax({
			type: 'POST',
			data: {},
			url: ('/admin/ajax/dialog/site_api_manual_'+type+'.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (res) {
				var $html = $(res);
				$.cocoaDialog.open({type:'site_api_manual ' + type,custom_popup:$html});
			}
		});
	};


	return {
		'init' : function(old_social_oder){
			init(old_social_oder);
		},
		'openManual' : function(type){
			openManual(type);
		}
	}
}();

var CONFIG_SITE_CHAT = function(){
	var $form;
	var header_ctl;

	var init = function(){
		$form = $('#dof');
		header_ctl = new HEADER_CONTROL();
		header_ctl.init();
		header_ctl.addBtn('save',function(){
			submit();
		});
		createEvent();
	};

	var submit = function(){
		var data = $form.serializeObject();
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/config/set_chatting.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					header_ctl.save();
					location.reload();
				}else
					alert(res.msg);
			}
		});
	};

	var createEvent = function(){
		// 엔터키로 서브밋 방지
		$form.find('input[type="text"]').keydown(function(e) {
			if (e.keyCode === 13) {
				e.preventDefault();
			}
		});

		$form.find('input, textarea').off('change, keyup').on('change, keyup, blur',function(){
			header_ctl.change();
		});
		$form.find('select').change(function(){
			header_ctl.change();
		});
		$form.find('input[type=checkbox],input[type=radio]').off('click').on('click',function(){
			// 라디오버튼 변경이 안되었을 시 저장버튼 비활성화 유지
			if($(this).attr('type') == 'radio'){
				if($(this).val() == 'Y'){
					if($(":input:radio[value='Y']:checked").length > 1){
						alert(getLocalizeString("설명_실시간상담은여러서비스를동시에사용할수없습니다", "", "실시간 상담은 여러 서비스를 동시에 사용할 수 없습니다. \n사용중인 서비스를 사용안함으로 변경하신 후 다시 시도해 주세요."));
						$('input[name="'+$(this).attr('name')+'"]:unchecked').prop('checked',true);
						return false;
					}
				}
			}
			// 라디오버튼
			header_ctl.change();
		});
		$form.find('input[name="use_channel"]').on('change',function(){
			channelRadio($(this).val());
		});
	};
	var channelRadio = function(v){
		if(v == 'N'){
			$('#change_channel').addClass('hidden');
			$('#channel_info .info').addClass('hidden');
			$('#channel_info .info.default').removeClass('hidden');
		} else {
			$('#change_channel').removeClass('hidden');
		}
	};
	var openManual = function(type){
		var manual	= ["navertalk","channel","channel_v2","kakao_id","facebook_msgr"];
		manual = (manual.indexOf(type) > -1) ? type+'_manual' : 'navertalk_manual';

		$.ajax({
			type: 'POST',
			data: {},
			url: ('/admin/ajax/dialog/'+manual+'.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (res) {
				var $html = $(res);
				$.cocoaDialog.open({type: manual, custom_popup: $html});
			}
		});
	};

	return {
		'init' : function(){
			init();
		},
		'openManual' : function(type){
			openManual(type);
		}
	}
}();

var CONFIG_LOCALIZE = function() {
	var CONFIG = {
		USE_FORMAT_TYPE_CURRENCY_LIST : ['KRW', 'JPY'], /* currency 포맷 타입을 사용할 수 있는 국가 리스트 */
	};
	var $form;
	var $localize;
	var header_ctl;
	var current_currency='';
	var current_currency_string='';
	var exchange_rate;

	var init = function(){
		$form = $('#localize_form');
		$localize = $('#time_zone');
		header_ctl = new HEADER_CONTROL();
		header_ctl.init();
		header_ctl.addBtn('save',function(){
			submit();
		});
		createEvent();
		makeTimezoneSelect();
	};

	var makeTimezoneSelect = function(){
		$localize.chosen();
	};

	var currencyChange = function(){
		var timer = 0;
		return function(that) {
			clearTimeout(timer);
			timer = setTimeout(function() {
				var $_that = $(that);
				var $_option = $_that.find(':selected');

				var currency = $_that.val();
				var currency_string = $_option.text();

				/* 과세율 노출 */
				var is_currency_krw = ( currency == 'KRW' );
				$('#tax_rate_wrap').toggle(! is_currency_krw);
				$('#tax_free_wrap').toggle(is_currency_krw);

				/* 통화 표시 방식 - option 재호출 */
				var $currencyFormat = $('#currencyFormat');
				load_currency_format_html(currency, $currencyFormat.val(), function(res) {
					$currencyFormat.html(res.option_html);
				});

				var o = $('#currency_exchange_wrap');
				if (currency!=current_currency){
					o.find('span._current_currency').text(current_currency_string);
					o.find('span._target_currency').text(currency_string);
					getCurrencyExchangeRate(current_currency, currency, function(res){
						exchange_rate = res.rate;
						o.find('span._exchange_rate').text(res.rate  + ' ('+res.rate_time+')');
						o.find('input._currency_exchange').val(res.user_rate);
						o.show();
						$('#shop-config-list').masonry({
							// options
							itemSelector: '.ma-item'
						});
					});
				}else{
					o.hide();
				}
			}, 150, that);
		};
	}();

	var load_currency_format_html = function(currency, default_format, callback) {
		$.ajax({
			type: 'POST',
			data: {currency: currency, default_format: default_format},
			url: ('/admin/ajax/config/localize/currency_format_list.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: callback
		});
	};

	var submit = function(){
		var data = $form.serializeObject();
		if(current_currency != data.currency){
			if(confirm(getLocalizeString("설명_통화단위변경시쿠폰삭제안내", "", "통화 단위 변경 시 변경 전 생성한 쿠폰은 모두 삭제됩니다."))){
				$.ajax({
					type: 'POST',
					data: data,
					url: ('/admin/ajax/config/localize.cm'),
					dataType: 'json',
					async: false,
					cache: false,
					success: function (res) {
						if(res.msg == 'SUCCESS'){
							header_ctl.save();
							window.location.reload();
						}else
							alert(res.msg);
					}
				});
			}
		}else{
			$.ajax({
				type: 'POST',
				data: data,
				url: ('/admin/ajax/config/localize.cm'),
				dataType: 'json',
				async: false,
				cache: false,
				success: function (res) {
					if(res.msg == 'SUCCESS'){
						header_ctl.save();
						window.location.reload();
					}else
						alert(res.msg);
				}
			});
		}
	};

	var createEvent = function(){
		$form.find('input, textarea').off('change, keyup').on('change, keyup, blur',function(){
			header_ctl.change();
		});
		$form.find('select').change(function(){
			header_ctl.change();
		});
		$form.find('input[type=checkbox],input[type=radio]').off('click').on('click',function(){
			header_ctl.change();
		});
	};

	return {
		init : function(){
			init();
		},
		submit : function(){
			submit();
		},
		'currencyChange' : function(that){
			currencyChange(that);
		},
		'setCurrentCurrency' : function(currency, currency_string){
			current_currency = currency;
			current_currency_string = currency_string;
		},
		'changeRate' : function(){
			$('#currency_exchange_rate').val(exchange_rate);
		},
		'load_currency_format_html' : function(currency, format, callback) {
			load_currency_format_html(currency, format, callback);
		}
	}
}();

function getItemElement() {
	var elem = document.createElement('div');
	var wRand = Math.random();
	var hRand = Math.random();
	var widthClass = wRand > 0.92 ? 'w4' : wRand > 0.8 ? 'w3' : wRand > 0.6 ? 'w2' : '';
	var heightClass = hRand > 0.85 ? 'h4' : hRand > 0.6 ? 'h3' : hRand > 0.35 ? 'h2' : '';
	elem.className = 'item ' + widthClass + ' ' + heightClass;
	return elem;
}

function configOpenDialog(dialog){
	var dialog_wrap = $('<div id="dialog" class="dialog" />');
	if(!($('#dialog').length>0)){
		$("body").append(dialog_wrap);
	}

	$('#dialog').dialog({
		autoOpen: false,
		modal:true,
		minWidth: 320,
		resizable: false,
		draggable: false,
		open: function(event, ui) {
			var this_dialog = $(this);
			$('.ui-widget-header').remove();
			this_dialog.find(".widget_basic").detach();
			this_dialog.empty().append(dialog).dialog({"position":"center"});
			$('.ui-widget-overlay').bind('click', function(e) {
				if(!$('body').hasClass('_selected_box'))
					this_dialog.dialog('close');
			});
			$('body').bind('keyup',function(e){
				if(e.keyCode == 27){
					// if esc key pressed, dialog close
					$('#dialog').dialog('close');
				}
			});
		},
		close: function( event, ui ) {
			$('.ui-widget-overlay').unbind('click');
			$('body').unbind('keyup');
		}
	});

	$("#dialog").parent().draggable({
		handle:"header"
	});

	$('#dialog').dialog("open");
}



//입력 항목 형식 변경 했을 때, 기존 사용자 데이터 처리 방식
var join_form_type_change_list = {
	'text' : {
		'text' : {'is_delete' : false},
		'textarea' : {'is_delete' : false},
		'url' : {'is_delete' : true},
		'tel' : {'is_delete' : true},
		'radio' : {'is_delete' : false},
		'select' : {'is_delete' : false},
		'checkbox' : {'is_delete' : false},
		'date' : {'is_delete' : true},
		'time' : {'is_delete' : true},
		'address' : {'is_delete' : true},
		'file' : {'is_delete' : true}
	},
	'textarea' : {
		'text' : {'is_delete' : false},
		'textarea' : {'is_delete' : false},
		'url' : {'is_delete' : true},
		'tel' : {'is_delete' : true},
		'radio' : {'is_delete' : false},
		'select' : {'is_delete' : false},
		'checkbox' : {'is_delete' : false},
		'date' : {'is_delete' : true},
		'time' : {'is_delete' : true},
		'address' : {'is_delete' : true},
		'file' : {'is_delete' : true}
	},
	'url' : {
		'text' : {'is_delete' : false},
		'textarea' : {'is_delete' : false},
		'url' : {'is_delete' : false},
		'tel' : {'is_delete' : true},
		'radio' : {'is_delete' : false},
		'select' : {'is_delete' : false},
		'checkbox' : {'is_delete' : false},
		'date' : {'is_delete' : true},
		'time' : {'is_delete' : true},
		'address' : {'is_delete' : true},
		'file' : {'is_delete' : true}
	},
	'tel' : {
		'text' : {'is_delete' : false},
		'textarea' : {'is_delete' : false},
		'url' : {'is_delete' : true},
		'tel' : {'is_delete' : false},
		'radio' : {'is_delete' : false},
		'select' : {'is_delete' : false},
		'checkbox' : {'is_delete' : false},
		'date' : {'is_delete' : true},
		'time' : {'is_delete' : true},
		'address' : {'is_delete' : true},
		'file' : {'is_delete' : true}
	},
	'radio' : {
		'text' : {'is_delete' : false},
		'textarea' : {'is_delete' : false},
		'url' : {'is_delete' : true},
		'tel' : {'is_delete' : true},
		'radio' : {'is_delete' : false},
		'select' : {'is_delete' : false},
		'checkbox' : {'is_delete' : false},
		'date' : {'is_delete' : true},
		'time' : {'is_delete' : true},
		'address' : {'is_delete' : true},
		'file' : {'is_delete' : true}
	},
	'select' : {
		'text' : {'is_delete' : false},
		'textarea' : {'is_delete' : false},
		'url' : {'is_delete' : true},
		'tel' : {'is_delete' : true},
		'radio' : {'is_delete' : false},
		'select' : {'is_delete' : false},
		'checkbox' : {'is_delete' : false},
		'date' : {'is_delete' : true},
		'time' : {'is_delete' : true},
		'address' : {'is_delete' : true},
		'file' : {'is_delete' : true}
	},
	'checkbox' : {
		'text' : {'is_delete' : false},
		'textarea' : {'is_delete' : false},
		'url' : {'is_delete' : true},
		'tel' : {'is_delete' : true},
		'radio' : {'is_delete' : true},
		'select' : {'is_delete' : true},
		'checkbox' : {'is_delete' : false},
		'date' : {'is_delete' : true},
		'time' : {'is_delete' : true},
		'address' : {'is_delete' : true},
		'file' : {'is_delete' : true}
	},
	'date' : {
		'text' : {'is_delete' : true},
		'textarea' : {'is_delete' : true},
		'url' : {'is_delete' : true},
		'tel' : {'is_delete' : true},
		'radio' : {'is_delete' : true},
		'select' : {'is_delete' : true},
		'checkbox' : {'is_delete' : true},
		'date' : {'is_delete' : false},
		'time' : {'is_delete' : true},
		'address' : {'is_delete' : true},
		'file' : {'is_delete' : true}
	},
	'time' : {
		'text' : {'is_delete' : true},
		'textarea' : {'is_delete' : true},
		'url' : {'is_delete' : true},
		'tel' : {'is_delete' : true},
		'radio' : {'is_delete' : true},
		'select' : {'is_delete' : true},
		'checkbox' : {'is_delete' : true},
		'date' : {'is_delete' : true},
		'time' : {'is_delete' : false},
		'address' : {'is_delete' : true},
		'file' : {'is_delete' : true}
	},
	'address' : {
		'text' : {'is_delete' : true},
		'textarea' : {'is_delete' : true},
		'url' : {'is_delete' : true},
		'tel' : {'is_delete' : true},
		'radio' : {'is_delete' : true},
		'select' : {'is_delete' : true},
		'checkbox' : {'is_delete' : true},
		'date' : {'is_delete' : true},
		'time' : {'is_delete' : true},
		'address' : {'is_delete' : false},
		'file' : {'is_delete' : true}
	},
	'file' : {
		'text' : {'is_delete' : true},
		'textarea' : {'is_delete' : true},
		'url' : {'is_delete' : true},
		'tel' : {'is_delete' : true},
		'radio' : {'is_delete' : true},
		'select' : {'is_delete' : true},
		'checkbox' : {'is_delete' : true},
		'date' : {'is_delete' : true},
		'time' : {'is_delete' : true},
		'address' : {'is_delete' : true},
		'file' : {'is_delete' : false}
	}
};





function cancelGroupForm(){
	$.cocoaDialog.close();
}

var siteStat = {
	page : 0,
	more : true,
	getSiteStatList : function(list_body_obj,type){
		var that = this;
		if(that.more){
			$.ajax({
				type: 'POST',
				data: {type:type,page:that.page,list_type:'list'},
				url: ('/admin/ajax/config/get_site_stat_list.cm'),
				dataType: 'json',
				async: false,
				cache: false,
				success: function (obj) {
					list_body_obj.append(obj.html);
					that.page = obj.page;
					that.more = obj.more=="Y";
				}
			});
		}
	}
};
var siteStatUrl = {
	page : 0,
	more : true,
	getSiteStatList : function(list_body_obj,type){
		var that = this;
		if(that.more){
			$.ajax({
				type: 'POST',
				data: {type:type,page:that.page,list_type:'url_list'},
				url: ('/admin/ajax/config/get_site_stat_list.cm'),
				dataType: 'json',
				async: false,
				cache: false,
				success: function (obj) {
					list_body_obj.append(obj.html);
					that.page = obj.page;
					that.more = obj.more=="Y";
				}
			});
		}
	}
};

var keywordStat = {
	page : 0,
	more : true,
	getKeywordStatList : function(list_body_obj,type){
		var that = this;
		if(that.more){
			$.ajax({
				type: 'POST',
				data: {type:type,page:that.page},
				url: ('/admin/ajax/config/get_keyword_stat_list.cm'),
				dataType: 'json',
				async: false,
				cache: false,
				success: function (obj) {
					list_body_obj.append(obj.html);
					that.page = obj.page;
					that.more = obj.more=="Y";
				}
			});
		}
	}
};

var pageStat = {
	page : 0,
	more : true,
	getPageStatList : function(list_body_obj,type){
		var that = this;
		if(that.more){
			$.ajax({
				type: 'POST',
				data: {type:type,page:that.page},
				url: ('/admin/ajax/config/get_page_stat_list.cm'),
				dataType: 'json',
				async: false,
				cache: false,
				success: function (obj) {
					list_body_obj.append(obj.html);
					that.page = obj.page;
					that.more = obj.more=="Y";
				}
			});
		}
	}
};

var joinStat = {
	page : 0,
	more : true,
	getJoinStatList : function(){
		var s_date;

		if($("#select_year").val() != null && $("#select_month").val() != null){
			s_date = $("#select_year").val() + '-' + $("#select_month").val();
		}

		$.ajax({
			type: 'POST',
			data: {s_date:s_date},
			url: ('/admin/ajax/stat/get_join_stat_list.cm'),
			dataType: 'json',
			cache: false,
			success: function (res) {
				$("#select_year").html(res.year_select_html);
				$("#select_month").html(res.month_select_html);
				$("#join_stat_list").html(res.list_html);
			}
		});
	},
};

var trafficStat = {
	page : 0,
	more : true,
	getTrafficStatList : function(list_body_obj,s_date){
		var that = this;
		if(that.more){
			$.ajax({
				type: 'POST',
				data: {s_date:s_date,page:that.page},
				url: ('/admin/ajax/config/get_traffic_stat_list.cm'),
				dataType: 'json',
				async: false,
				cache: false,
				success: function (obj) {
					list_body_obj.append(obj.html);
					that.page = obj.page;
					that.more = obj.more=="Y";
				}
			});
		}
	}
};


$(function() {
	$.widget("ui.spinner", $.ui.spinner, {
		_buttonHtml: function() {
			return '<a class="ui-spinner-button ui-spinner-up ui-corner-tr" tabindex="-1" role="button"><i class="'+this.options.icons.up+'"></i></a>' +
				'<a class="ui-spinner-button ui-spinner-down ui-corner-br" tabindex="-1"  role="button"><i class="'+this.options.icons.down+'"></i></a>';
		},
		_uiSpinnerHtml: function() {
			return '';
		}
	});
	$('#point_join_value, #point_login_value, #point_post_value, #point_comment_value ').spinner({
		min: 0,
		max: 999999,
		icons: { down: "zmdi zmdi-arrow-drop-down ", up: "zmdi zmdi-arrow-drop-up " },
		create: function( event, ui ) {
			$(this).attr('class','form-control');
			$(this).parent().find('a').addClass(' col-position ');
		}
	}).check_num();
});
(function ($) {
	$.fn.extend({
		limiter: function (minLimit, maxLimit, elem) {
			$(this).on("keydown keyup focus keypress", function (e) {
				setCount(this, elem, e);
			});

			function setCount(src, elem, e) {
				var chars = src.value.length;
				if (chars == maxLimit) {
					//e.preventDefault();
					elem.html(maxLimit - chars);
					elem.addClass('maxLimit');
					return false;

				} else if (chars > maxLimit) {
					src.value = src.value.substr(0, maxLimit);
					chars = maxLimit;
					elem.addClass('maxLimit');
				} else {
					elem.removeClass('maxLimit');
				}
				if (chars < minLimit) {
					elem.addClass('minLimit');
				} else {
					elem.removeClass('minLimit');
				}
				elem.html(maxLimit - chars);
			}
			setCount($(this)[0], elem);
		}
	});
})(jQuery);

var SHOP_PG_CONFIG = function() {
	var mode;
	var header_ctl;
	var $form;
	var $save_button;
	var $save_btn_bottom_wrap;
	var $disable_pg_wrap;
	var $enable_pg_wrap;
	var $virtual_wrap;
	var $pg_data_wrap;
	var $pg_detail_wrap;
	var $paypal_detail_wrap;
	var $paypal_view_status_wrap;
	var $paypal_sandbox_wrap;
	var cash_cnt = 0;
	var cash_list = [];
	var $save_ecpay_config;
	var prev_use_cash_receipt;

	var init = function(m){
		mode = m;
		$disable_pg_wrap = $('#disable_pg_wrap');
		$enable_pg_wrap= $('#enable_pg_wrap');
		$virtual_wrap= $('#virtual_wrap');
		$pg_data_wrap= $('#pg_data_wrap');
		$pg_detail_wrap = $('#pg_detail_wrap');
		$paypal_detail_wrap = $('#paypal_detail_wrap');
		$paypal_view_status_wrap = $('#paypal_view_status_wrap');
		$paypal_sandbox_wrap = $('#paypal_sandbox_wrap');
		$save_button = $('#shop_config_save_button');
		$save_btn_bottom_wrap = $('#save_btn_bottom_wrap');

		$save_ecpay_config = $('#save_ecpay_config');

		prev_use_cash_receipt =  $('#use_cash_receipt').val();

		$form = $('#shop_config');
		if(m != 'deposit_confirmation'){
			header_ctl = new HEADER_CONTROL();
			header_ctl.init2($save_btn_bottom_wrap);
			header_ctl.addBtn('save',function(){
				submit(mode);
			});

			$form.find('input, textarea, select').off('change').on('change',function(){
				header_ctl.change();
				$save_ecpay_config.removeClass('btn-default').addClass('btn-dark-blue');
				$save_button.removeClass('disabled');
			});
			$form.find('input, textarea').off('keyup').on('keyup',function(){
				header_ctl.change();
				$save_ecpay_config.removeClass('btn-default').addClass('btn-dark-blue');
				$save_button.removeClass('disabled');
			});
			$form.find('input[type=checkbox],input[type=radio]').off('click').on('click',function(){
				header_ctl.change();
				$save_ecpay_config.removeClass('btn-default').addClass('btn-dark-blue');
				$save_button.removeClass('disabled');
			});
		}

		activeCurrentMenu();
	};

	var addTWEvent = function(){
		// 회원 유형에 따라 전자영수증 사용가능 여부 추가
		$form.find(':radio[name="ecpay_member_type"]').on('change', function(){
			var is_special_member = ($(this).val() === 'special');
			$form.find(':checkbox[name="ecpay_permission"][value="invoice"]').prop('disabled', !is_special_member);
			if ( !is_special_member ) {
				$form.find(':checkbox[name="ecpay_permission"][value="invoice"]').prop('checked', false);
			}
		});
		// 배송 api 사용 여부에 따라 물류 유형 추가
		$form.find(':checkbox[name="ecpay_permission"]').on('change',function(){
			var is_use_payment = false;
			var is_use_shipping = false;
			var is_use_invoice = false;
			if ( $form.find(':checkbox[name="ecpay_permission"]:checked').length > 0 ) {
				$form.find(':checkbox[name="ecpay_permission"]:checked').each(function(){
					if ( $(this).val() === 'shipping' ) {
						is_use_shipping = true;
					}
					if ( $(this).val() === 'payment' ) {
						is_use_payment = true;
					}
					if ( $(this).val() === 'invoice' ) {
						is_use_invoice = true;
					}
				});
			}
			$form.find('.shipping_service_type_wrapper').toggle(is_use_shipping);
			$form.find('.payment_service_type_wrapper').toggle(is_use_payment);
			$form.find('.invoice_service_type_wrapper').toggle(is_use_invoice);
		});

		$form.find('._ecpay_info_btn').each(function(){
			$(this).on('click', function(){
				openEcpayLinkInfo($(this).data('type'));
			});
		});

	};

	var openEcpayLinkInfo = function(type){
		$.ajax({
			type: 'POST',
			data: {"type" : type},
			url: ('/admin/ajax/config/ecpay_link_info.cm'),
			dataType: 'HTML',
			async: false,
			cache: false,
			success: function (res) {
				var $html = $(res);
				$.cocoaDialog.open({type:'admin',custom_popup:$html});
			}
		});
	};


	var submit = function(mode){
		var data = $form.serializeObject();
		var $bank_info_from = $('#bank_info_from').find('._cash_from');
		var bank_info_list = [];

		if($bank_info_from.length > 0){
			$bank_info_from.each(function(){
				var $this = $(this);

				var bank = $this.find('input[name=bank]').val();
				var bank_num = $this.find('input[name=bank_num]').val();
				var name = $this.find('input[name=name]').val();

				var bank_info_data = {bank:"",bank_num:"",name:""};
				bank_info_data.bank = bank;
				bank_info_data.bank_num = bank_num;
				bank_info_data.name = name;

				bank_info_list.push(bank_info_data);
			});

			data['bank_info_list'] = bank_info_list;
		}

		$.ajax({
			type: 'POST',
			data: {'mode': mode, 'data': data},
			url: ('/admin/ajax/shop/save_pg_config.cm'),
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					header_ctl.save();
					$save_ecpay_config.removeClass('btn-dark-blue').addClass('btn-default');
					//window.location.reload();
					$save_button.addClass('disabled');
					if(data.reexam){
						alert('재심사 요청이 접수되었습니다. \n심사요청 이후 약 영업일 3일 이내 재심사가 진행되며 심사 결과는 문자로 안내합니다.');
					}
					if(res.is_reload == 'Y'){
						location.reload();
					}
				}else{
					if(res.msg === 'only_use_deposit'){
						openDepositInfoModal(true);
					}else{
						alert(res.msg);
					}
				}
			}
		});
	};

	var setINICIS = function(){
		$pg_detail_wrap.find('._inicis_mcert').fileupload({
			url: '/admin/ajax/shop/upload_inicis_key.cm',
			formData: {type: 'inicis_mcert'},
			dataType: 'json',
			singleFileUploads: true,
			limitMultiFileUploads: 1,
			dropZone: false,
			start: function(e, data){},
			progress: function(e, data){},
			done: function(e, data){
				$.each(data.result['inicis_mcert'], function(e, tmp){
					if(tmp.error == null){
						if(tmp.org_name == 'mcert.pem'){
							$pg_detail_wrap.find('._inicis_mcert_input').val(tmp.url);
							$pg_detail_wrap.find('._inicis_mcert_txt').text(getLocalizeString("설명_업로드됨저장버튼", "", "업로드됨. 저장 버튼을 클릭하면 적용됩니다."));
						}else{
							$pg_detail_wrap.find('._inicis_mcert_txt').text(getLocalizeString("설명_mcertpem파일이아닙니다", "", "mcert.pem 파일이 아닙니다."));
							alert(getLocalizeString("설명_mcertpem파일이아닙니다", "", "mcert.pem 파일이 아닙니다."));
						}
					}else{
						alert(tmp.error);
					}
				});
			},
			fail: function(e, data){
				alert('업로드에 실패 하였습니다.');
			}
		});
		$pg_detail_wrap.find('._inicis_mpriv').fileupload({
			url: '/admin/ajax/shop/upload_inicis_key.cm',
			formData: {type: 'inicis_mpriv'},
			dataType: 'json',
			singleFileUploads: true,
			limitMultiFileUploads: 1,
			dropZone: false,
			start: function(e, data){},
			progress: function(e, data){},
			done: function(e, data){
				$.each(data.result['inicis_mpriv'], function(e, tmp){
					if(tmp.error == null){
						if(tmp.org_name == 'mpriv.pem'){
							$pg_detail_wrap.find('._inicis_mpriv_input').val(tmp.url);
							$pg_detail_wrap.find('._inicis_mpriv_txt').text(getLocalizeString("설명_업로드됨저장버튼", "", "업로드됨. 저장 버튼을 클릭하면 적용됩니다."));
						}else{
							$pg_detail_wrap.find('._inicis_mpriv_txt').text(getLocalizeString("설명_mprivpem파일이아닙니다", "", "mpriv.pem 파일이 아닙니다."));
							alert(getLocalizeString("설명_mprivpem파일이아닙니다", "", "mpriv.pem 파일이 아닙니다."));
						}
					}else{
						alert(tmp.error);
					}
				});
			},
			fail: function(e, data){
				alert(getLocalizeString("설명_업로드에실패하였습니다", "", "업로드에 실패 하였습니다."));
			}
		});
		$pg_detail_wrap.find('._inicis_keypass').fileupload({
			url: '/admin/ajax/shop/upload_inicis_key.cm',
			formData: {type: 'inicis_keypass'},
			dataType: 'json',
			singleFileUploads: true,
			limitMultiFileUploads: 1,
			dropZone: false,
			start: function(e, data){},
			progress: function(e, data){},
			done: function(e, data){
				$.each(data.result['inicis_keypass'], function(e, tmp){
					if(tmp.error == null){
						if(tmp.org_name == 'keypass.enc'){
							$pg_detail_wrap.find('._inicis_keypass_input').val(tmp.url);
							$pg_detail_wrap.find('._inicis_keypass_txt').text(getLocalizeString("설명_업로드됨저장버튼", "", "업로드됨. 저장 버튼을 클릭하면 적용됩니다."));
						}else{
							$pg_detail_wrap.find('._inicis_keypass_txt').text(getLocalizeString("설명_keypassenc파일이아닙니다", "", "keypass.enc 파일이 아닙니다."));
							alert(getLocalizeString("설명_keypassenc파일이아닙니다", "", "keypass.enc 파일이 아닙니다."));
						}
					}else{
						alert(tmp.error);
					}
				});
			},
			fail: function(e, data){
				alert(getLocalizeString("설명_업로드에실패하였습니다", "", "업로드에 실패 하였습니다."));
			}
		});
	};
	var changePGType = function(type, old_pg){
		switch(mode){
			case 'common':
				addCashForm();
				break;
			case 'domestic':
				addCardConfig();
				if(type == 'inicis'){
					setINICIS();
				}
				break;
			case 'naver':
				break;
			case 'deposit_confirmation':
				break;
			case 'paypal':
				break;
			case 'eximbay':
				break;
		}

		$('.btn-popover').popover({
			container: 'body',
			html: true
		});

		$('#shop-config-list').imagesLoaded().always(function(ins){
			$('#shop-config-list').masonry({
				itemSelector: '.ma-item'
			});
		})
	};

	var changePaypalStatus = function(status){
		if (status=='live'){
			$paypal_detail_wrap.show();
			$paypal_view_status_wrap.show();
			$paypal_sandbox_wrap.hide();
		}else if(status=='sandbox'){
			$paypal_detail_wrap.hide();
			$paypal_view_status_wrap.show();
		}else{
			$paypal_detail_wrap.hide();
			$paypal_view_status_wrap.hide();
			$paypal_sandbox_wrap.show();
		}
		header_ctl.change();
		$save_button.removeClass('disabled');
	};

	var openVirtualSettingModal = function(){
		// 가상계좌 체크시 모달(가상계좌통보 URL 설정 권고) 띄우기
		if($('._virtual').length > 0){
			// PG사에 직접 가상계좌 리턴 URL 설정이 필요한 경우에만
			$.ajax({
				type : 'POST',
				data : {},
				url : ('/admin/ajax/dialog/config_pg_virtual_setting_manual.cm'),
				dataType : 'html',
				async : false,
				cache : false,
				success : function(res){
					var $html = $(res);
					$.cocoaDialog.open({type : 'virtual_setting', custom_popup : $html});
				}
			});
		}

	};

	var changePayType = function(type,chk){
		if(type == 'virtual'){
			$pg_detail_wrap.find('._virtual').toggle(chk);
			if(chk){
				openVirtualSettingModal();
			}
		}else if (type=='cash'){
			$pg_detail_wrap.find('#bank_info_from').toggle(chk);
			$pg_detail_wrap.find('._cash_receipt_wrap').toggle(chk);
			if(chk && $pg_detail_wrap.find('.deposit_limit').val() == 'N'){
				openDepositInfoModal(false);
			}
		}else if(type == 'card'){
			$pg_detail_wrap.find('._card').toggle(chk);
		}

		toggleDefaultPayTypeOption(type, chk);

		header_ctl.change();
		$save_button.removeClass('disabled');
	};

	var toggleDefaultPayTypeOption = function(type, chk) {
		var $defaultType = $pg_detail_wrap.find('#select_default_type');
		$defaultType.find('[value="' + type + '"]').prop('disabled', ! chk).toggle(chk);
		var $enableOpts = $defaultType.find('option:enabled');
		var $selectOpt = $defaultType.find(':selected');
		if ( $selectOpt.length == 0 || $selectOpt.is(':disabled') ) {
			$enableOpts.eq(0).prop('selected', true);
		}

		$pg_detail_wrap.find('#select_default_type_wrap').toggle($enableOpts.length > 0);
	};

	var changeDefaultPayType = function() {
		header_ctl.change();
		$save_button.removeClass('disabled');
	};

	var changePgEscrowStatus = function(chk){
		var $pg_is_escrow_wrap = $pg_detail_wrap.find('._pg_is_escrow_wrap');
		var $pg_is_interlocking_wrap = $pg_detail_wrap.find('._pg_is_interlocking_wrap');

		var pg_is_interlocking_check = $pg_is_interlocking_wrap.find("._pg_is_interlocking_check").prop("checked");
		$pg_is_interlocking_wrap.find("._pg_is_interlocking_check").prop("disabled",!chk);
		$pg_is_interlocking_wrap.find("._pg_is_interlocking_text").toggleClass("text-gray-bright");
		if(pg_is_interlocking_check && !chk) $pg_is_interlocking_wrap.find("._pg_is_interlocking_check").prop("checked",false);

		header_ctl.change();
		$save_button.removeClass('disabled');
	};

	var changePgInterlockingStatus = function(chk){
		header_ctl.change();
		$save_button.removeClass('disabled');
	};

	var changeUsePgCardCustomProductName = function(value){
		var $pg_card_custom_product_name_wrap = $pg_detail_wrap.find('._pg_card_custom_product_name_wrap');
		if(value == 'Y'){
			$pg_card_custom_product_name_wrap.show();
		}else{
			$pg_card_custom_product_name_wrap.hide();
		}
		header_ctl.change();
		$save_button.removeClass('disabled');
	};

	var changePgCardCustomProductName = function(){
		header_ctl.change();
		$save_button.removeClass('disabled');
	};

	var changePgProdTypeStatus = function(chk){
		header_ctl.change();
		$save_button.removeClass('disabled');
	};

	var changeCashReceiptStatus = function(pg_type,$avl_auto_receipt){
		var use_cash_receipt_value = $('#use_cash_receipt').val();
		if($avl_auto_receipt == 'N' && use_cash_receipt_value == 'AUTO'){
			$('#use_cash_receipt').val(prev_use_cash_receipt);
			alert("현금영수증 자동발행은 PG사 연동과 뱅크다 자동입금확인 서비스가 모두 연동되어 있는 경우에만 적용이 가능합니다.");
			return false;
		}
		if(pg_type == 'inicis' && use_cash_receipt_value == 'AUTO'){
			alert("주문/예약시 이메일 정보가 누락된 주문은 자동발행이 진행되지 않습니다. (이니시스)");
		}
		header_ctl.change();
		$save_button.removeClass('disabled');
	};

	var changePGReal = function(check_url){
		$.ajax({
			type : 'post',
			data : {},
			url : ('/admin/ajax/shop/load_config.cm'),
			dataType : 'json',
			cache : false,
			async : false,
			success : function(result){
				if(result.config_data.pg_check == 'Y'){

				}else{
					//openPgInfo(check_url);
				}
			}
		});
	};

	var setPGData = function(arg){
		var $pg_data_wrap = $('#pg_data_wrap');
		switch($('#user_pg').val()){
			case 'kcp':
				$pg_data_wrap.find('input[name=kcp_site_code]').val(arg.PGOriginMallID);
				break;
		}
	};
	var openPgInfo = function(check_url){
		if($('#user_pg').val() == ''){
			alert(getLocalizeString("설명_사용PG사를반드시선택", "", "사용 PG사를 반드시 선택해야 합니다."));
			$('#user_pg').focus();
			return false;
		}
		switch($('#user_pg').val()){
			case 'kcp':
				windowOpen("popupPgInfo", "https://cpay.kcp.co.kr/ws/pgMallCheck.jsp?NCUrl="+check_url+"", 419, 459, 'yes');
				break;
			case 'lguplus':
				windowOpen("popupPgInfo", "http://pgweb.lgtelecom.com/NHNFlowCtrl/pg/wmp/Home/cooperate/NHN/popupCheckOut.jsp?NCUrl="+check_url+"", 20, 20, 'no');
				break;
			case 'inicis':
				windowOpen("popupPgInfo", "https://iniweb-api.inicis.com/nik/niklogin_inicis_pop.jsp?NCUrl="+check_url+"", 419, 400, 'yes');
				break;
			case 'allat':
				windowOpen("popupPgInfo", "http://www.allatpay.com/servlet/AllatBizNone/nc/pop_confirm_allatinfo.jsp?NCUrl="+check_url+"", 419, 400, 'yes');
				break;
			case 'ksnet':
				windowOpen("popupPgInfo", "https://pgims.ksnet.co.kr/src/nc_checkout/NCAuth01.jsp?NCUrl="+check_url+"", 419, 400, 'yes');
				break;
			case 'kicc':
				windowOpen("popupPgInfo", "https://api.easypay.co.kr/nc/popExistingMallInfo.jsp?NCUrl="+check_url+"", 419, 400, 'yes');
				break;
			case 'allthegate':
				windowOpen("popupPgInfo", "https://www.allthegate.com/agsPayment/jsp/nhn/agent/pop_approve.jsp?RecvCD=nhn&NCUrl="+check_url+"", 419, 400, 'yes');
				break;
		}
	};

	var openDepositInfoModal = function(is_deposit_limit){
		$.ajax({
			type : 'POST',
			data : {'is_deposit_limit' : is_deposit_limit},
			url : ('/admin/ajax/dialog/config_pg_deposit_info.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type:'deposit_setting', custom_popup:html});
			}
		});
	};

	var  addCashForm = function(type){
		$.ajax({
			type : 'post',
			data : {'type':type,'cnt':cash_cnt},
			url : ('/admin/ajax/config/add_cash_form.cm'),
			dataType : 'json',
			cache : false,
			async : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					cash_cnt = res.cnt;
					cash_list.push(res.cash_list);
					var $bank_info_from = $('#bank_info_from');
					$bank_info_from.append(res.html);
					if(type){
						header_ctl.change();
						$save_button.removeClass('disabled');
					}
				}
			}
		});
	};

	var removeCashForm = function(id){
		$pg_detail_wrap.find('._cash_idx_'+id).remove();
		delete cash_list[id];//delete를 써야 중간에 삭제하더라도 size를 그대로 유지함 새로고침하여 다시 생성할필요가 없기에 delete를 사용
		header_ctl.change();
		$save_button.removeClass('disabled');
	};

	function addCardConfig(){
		var $card_config_btn = $pg_detail_wrap.find("._card_config_btn");
		if($card_config_btn.length > 0){
			$card_config_btn.off("click._card_config_btn").on("click._card_config_btn",function(){
				$.ajax({
					type: 'POST',
					url: ('/admin/ajax/dialog/card_config.cm'),
					dataType: 'html',
					async: false,
					cache: false,
					success: function (res) {

						var $html = $(res);
						$.cocoaDialog.open({type:'card_config',custom_popup:$html},function(){
							var $cocoaModal = $("#cocoaModal");
							$cocoaModal.find("._save").off("click._save").on("click._save",function(){
								SHOP_PG_CONFIG.changeCardConfig();
							});
						});

					}
				});
			});
		}
	}

	/***
	 * 카드사 정보변경
	 * @param data
	 */
	var changeCardConfig = function(){
		var data = $("#card_cofig_form").serializeObject2();
		$.ajax({
			type: 'POST',
			data : data,
			url: ('/admin/ajax/shop/change_card_config.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if ( res.msg == 'SUCCESS' ) {
					$.cocoaDialog.close();
				} else {
					alert(res.msg);
				}
			}
		});
	};

	var openEscrowGuideModal = function(pg_type){
		if(pg_type == '') return false;
		$.ajax({
			type: 'POST',
			data: {'pg_type': pg_type},
			url: ('/admin/ajax/shop/escrow_guide_modal.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function(res){
				if(res.msg == 'SUCCESS'){
					$('.modal_admin_escrow_guide_modal').find('.modal-content').html('');
					$.cocoaDialog.open({type : 'admin_escrow_guide_modal', custom_popup : res.html});
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var activeCurrentMenu = function(){
		var $target_element = $('._config_' + mode);
		if($target_element.length > 0){
			$target_element.addClass('active-border');
		}
	};

	var applyEasyPayment = function(type){
		$.ajax({
			type: 'POST',
			data: {"payment_type": type},
			url: ('/admin/ajax/shop/apply_easy_payment.cm'),
			dataType: 'json',
			success: function(res){
				if(res.msg == "SUCCESS"){
					alert(getLocalizeString("설명_신청이접수되었습니다", "", "신청이 접수되었습니다."));
					window.location.reload();
				}else{
					alert(res.msg);
				}
			}
		});
	};

	return {
		init: function (mode) {
			init(mode);
		},
		"addTWEvent": function(){
			addTWEvent();
		},
		"submit": function(mode){
			submit(mode);
		},
		'changePGType' : function(type, old_pg){
			changePGType(type, old_pg);
		},
		'changePGReal' : function(check_url){
			changePGReal(check_url);
		},
		'changePayType' : function(type,chk){
			changePayType(type,chk);
		},
		changeDefaultPayType : function() {
			changeDefaultPayType();
		},
		'changePaypalStatus' : function(status){
			changePaypalStatus(status);
		},
		'setPGData' : function(a){
			setPGData(a);
		},
		'enableSave': function(){
			header_ctl.change();
			$save_button.removeClass('disabled');
		},
		'addCashForm': function(type){
			addCashForm(type);
		},
		'removeCashForm': function(id){
			removeCashForm(id);
		},
		"changePgEscrowStatus" : function(chk){
			changePgEscrowStatus(chk);
		},
		'changePgInterlockingStatus' : function(chk){
			changePgInterlockingStatus(chk);
		},
		'changeCardConfig' : function(data){
			changeCardConfig(data);
		},
		'changeUsePgCardCustomProductName': function(value){
			changeUsePgCardCustomProductName(value);
		},
		'changePgCardCustomProductName': function(){
			changePgCardCustomProductName();
		},
		'changePgProdTypeStatus' : function(chk){
			changePgProdTypeStatus(chk);
		},
		'changeCashReceiptStatus' : function(pg_type,$avl_auto_receipt){
			changeCashReceiptStatus(pg_type,$avl_auto_receipt);
		},
		'openEscrowGuideModal': function(pg_type){
			openEscrowGuideModal(pg_type);
		},
		'activeCurrentMenu': function(){
			activeCurrentMenu();
		},
		'applyEasyPayment': function(type){
			applyEasyPayment(type);
		}
	}
}();

var SHOP_DEPOSIT_CONFIRMATION_CONFIG = function(){
	/***
	 * 뱅크다 신청 기본설정
	 */
	function initDepositConfirmationRequest(){
		//신청폼
		var $deposit_confirmation_form = $("#deposit_confirmation_form");
		//기간선택 영역
		var $period_select = $deposit_confirmation_form.find("select[name='period']");
		//금액영역
		var $price = $deposit_confirmation_form.find("._price");
		//계좌수
		var account_count = $deposit_confirmation_form.find("input[name='account_count']").val();
		//기본금액
		var default_with_tax_price = $deposit_confirmation_form.find("input[name='default_with_tax_price']").val();

		var $submit = $deposit_confirmation_form.find("._submit");

		//기본금액 * 계좌수
		default_with_tax_price = default_with_tax_price * account_count;

		//금액 기본설정
		$price.html(money_format(default_with_tax_price));

		//기간선택 셀렉트 이벤트 설정
		$period_select.off("change.period_select").on("change.period_select",function(){
			var selected_month = $(this).val();
			//기본금액 * 계좌수 * 기간
			var price = default_with_tax_price * selected_month;
			price = money_format(price);
			$price.html(price);
		});


		//결제하기 버튼 이벤트
		$submit.off("click.submit").on("click.submit",function(){
			$deposit_confirmation_form.submit();
			// var data = $deposit_confirmation_form.serializeArray();
			// $.ajax({
			// 	type : 'POST',
			// 	data : data,
			// 	url : ('/admin/ajax/config/deposit_confirmation_request.cm'),
			// 	dataType : 'json',
			// 	async : false,
			// 	cache : false,
			// 	success : function(res){
			// 		if(res.msg === "SUCCESS"){
			// 			$.cocoaDialog.close();
			// 			location.reload();
			// 		}else{
			// 			alert(res.msg);
			// 		}
			// 	}
			// });
		});

	}


	/***
	 * 뱅크다 서비스 신청 모달 뛰우기
	 */
	var openDepositConfirmationRequestDialog = function(){
		$.ajax({
			type : 'POST',
			url : ('/admin/ajax/dialog/deposit_confirmation_request.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type : 'deposit_confirmation_request_form', custom_popup : html},function(){
					//신청모달 기본설정
					initDepositConfirmationRequest();
				});

			}
		});
	};

	/***
	 * 계좌관리 모달 뛰우기
	 */
	var openDepositConfirmationAccountConfigDialog = function(){
		$.ajax({
			type : 'POST',
			url : ('/admin/ajax/dialog/deposit_confirmation_account_config.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type : 'deposit_confirmation_account_config_form', custom_popup : html});
			}
		});
	};

	var $account_add_form,$bank_code,$bank_division,$account_number,$account_pw,$personal_number,$business_license_number,$bank_id,$bank_pw,$regist_title,$regist_personal_body,$regist_crop_body;
	var bank_data_list;
	/***
	 * 계좌추가 모달 뛰우기
	 */
	var openDepositConfirmationAccountAddDialog = function(_bank_data_list,account_code){
		//뱅크다 기존 계좌정보 가져오기
		bank_data_list = jQuery.parseJSON(base64Decode(_bank_data_list));
		$.ajax({
			type : 'POST',
			data : {account_code : account_code},
			url : ('/admin/ajax/dialog/deposit_confirmation_account_add.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.close();
				$.cocoaDialog.open({type : 'deposit_confirmation_account_add_form', custom_popup : html},function(){
					//기본변수 설정
					initDepositConfirmationAccountAddDialog();
					//은행 선택시
					$bank_code.off("change.bank_code").on("change.bank_code",function(){
						setLayoutDepositConfirmationAccountAddDialog();
					});
					//법인 /개인 선택시
					$bank_division.off("change.bank_division").on("change.bank_division",function(){
						setLayoutDepositConfirmationAccountAddDialog();
					});

					//레이아웃 기본값설정
					setLayoutDepositConfirmationAccountAddDialog();
				});

			}
		});
	};

	/***
	 * 계좌추가 모달 변수설정
	 */
	function initDepositConfirmationAccountAddDialog (){
		$account_add_form			= $("#account_add_form");
		$bank_code					= $account_add_form.find("select[name='bank_code']");
		$bank_division				= $account_add_form.find("select[name='bank_division']");
		$account_number				= $account_add_form.find("input[name='account_number']");
		$account_pw					= $account_add_form.find("input[name='account_pw']");
		$personal_number			= $account_add_form.find("input[name='personal_number']");
		$business_license_number	= $account_add_form.find("input[name='business_license_number']");
		$bank_id					= $account_add_form.find("input[name='bank_id']");
		$bank_pw					= $account_add_form.find("input[name='bank_pw']");
		$regist_title				= $account_add_form.find("._regist_title");
		$regist_personal_body		= $account_add_form.find("._regist_personal_body");
		$regist_crop_body			= $account_add_form.find("._regist_crop_body");

	}

	/***
	 * 계좌추가 모달 레이아웃 설정
	 */
	function setLayoutDepositConfirmationAccountAddDialog(){
		var selected_bank_code = $bank_code.val();//현재 선택된 은행코드
		var use_bank_id = $bank_code.find("option:selected").data("use-bank-id") === "Y"; //해당 은행에서 계좌 조회용 아이디를 사용하는지 유무
		var use_bank_pw = $bank_code.find("option:selected").data("use-bank-pw") === "Y"; //해당 은행에서 계좌 조회용 비밀번호를 사용하는지 유무
		var use_business_license_number = $bank_division.val() === "crop"; //법인 사용자인지
		var personal_number = $bank_division.val() === "personal"; //개인 사용자인지
		var regist_data = bank_data_list[selected_bank_code].regist_data;//현재 선택된 은행의 계좌등록절차 정보
		var regist_title = regist_data['title'];//계좌 등록절차 제목
		var regist_corp_body_list = regist_data['corp_body'];//기업용 계좌 등록절차 설명
		var regist_personal_body_list = regist_data['personal_body'];//개인용 계좌 등록절차 설명
		var regist_url = regist_data['url'];//개인용 계좌 등록절차 설명


		//기업용 계좌 등록절차 설명 본문생성
		var html = "";
		for(var i = 0 ; i < regist_corp_body_list.length ; i++){
			if(i === 0)regist_corp_body_list[i] = "<a href='"+regist_url+"' target='_blank' class='text-primary'>"+regist_corp_body_list[i]+"</a>";
			html += "<li>"+regist_corp_body_list[i]+"</li>";
		}
		$regist_crop_body.html(html);

		//개인용 계좌 등록절차 설명 본문생성
		html = "";
		for(i = 0 ; i < regist_personal_body_list.length ; i++){
			if(i === 0)regist_personal_body_list[i] = "<a href='"+regist_url+"' target='_blank' class='text-primary'>"+regist_personal_body_list[i]+"</a>";
			html += "<li>"+regist_personal_body_list[i]+"</li>";
		}
		$regist_personal_body.html(html);
		$regist_title.html(regist_title);


		$bank_id.closest(".form-group")[use_bank_id?'show':'hide']();
		$bank_pw.closest(".form-group")[use_bank_pw?'show':'hide']();
		$business_license_number.closest(".form-group")[use_business_license_number?'show':'hide']();
		$personal_number.closest(".form-group")[personal_number?'show':'hide']();

	}



	/***
	 * 계좌추가요청
	 */
	var depositConfirmationAccountAdd = function(){
		//dozProgress.start();
		var data = $account_add_form.serializeArray();
		$.ajax({
			type : 'POST',
			url : ('/admin/ajax/config/deposit_confirmation_account_add_request.cm'),
			data : data,
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				//dozProgress.done();
				if(res.msg === "SUCCESS"){
					$.cocoaDialog.close();
					alert(getLocalizeString("설명_계좌등록완료알람", "", "계좌등록이 완료되었습니다."));
				}else{
					alert(res.msg == "" ? getLocalizeString("설명_계좌추가실패알람", "", "계좌 추가실패(계좌정보를 확인해주세요)") : res.msg);
				}
			}
		});
	};

	/***
	 * 계좌삭제요청
	 */
	var depositConfirmationAccountDelete = function(){
		if(confirm(getLocalizeString("설명_해당계좌를삭제하시겠습니까", "", "해당계좌를 삭제하시겠습니까?"))){
			//dozProgress.start();
			var data = $account_add_form.serializeArray();
			$.ajax({
				type : 'POST',
				url : ('/admin/ajax/config/deposit_confirmation_account_delete_request.cm'),
				data : data,
				dataType : 'json',
				async : false,
				cache : false,
				success : function(res){
					//dozProgress.done();
					if(res.msg === "SUCCESS"){
						$.cocoaDialog.close();
						alert(getLocalizeString("설명_계좌삭제알람", "", "계좌가 삭제되었습니다."));
					}else{
						alert(res.msg);
					}
				}
			});
		}
	};


	/***
	 * 회원정보 수정 모달창 뛰우기
	 */
	var openDepositConfirmationMemberModifyDialog = function(){
		$.ajax({
			type : 'POST',
			url : ('/admin/ajax/dialog/deposit_confirmation_member_modify.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type : 'deposit_confirmation_member_modify_form', custom_popup : html},function(){
					var $member_modify_form = $("#member_modify_form");
					var $submit = $member_modify_form.find("._submit");
					var $delete_member = $member_modify_form.find("._delete_member");

					//정보수정 이벤트
					$submit.off("click.submit").on("click.submit",function(){
						depositConfirmationMemberModify();
					});

					//회원탈퇴 이벤트
					$delete_member.off("click.delete_member").on("click.delete_member",function(){
						if(confirm(getLocalizeString("설명_뱅크다회원탈퇴시서비스가", "", "뱅크다 회원탈퇴시 서비스가 해지되며 잔여분에 대해 환불되지 않습니다. \n회원탈퇴를 하시겠습니까?"))){
							depositConfirmationMemberDelete();
						}
					});
				});

			}
		});
	};

	/***
	 * 회원정보 수정처리
	 */
	function depositConfirmationMemberModify(){
		var data = $("#member_modify_form").serializeArray();
		//dozProgress.start();
		$.ajax({
			type : 'POST',
			data : data,
			url : ('/admin/ajax/config/deposit_confirmation_member_modify.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				//dozProgress.done();
				if(res.msg === "SUCCESS"){
					$.cocoaDialog.close();
					alert(getLocalizeString("설명_회원정보가수정", "", "회원정보가 수정되었습니다."));
				}else{
					alert(res.msg);
				}
			}
		});
	}

	/***
	 *  회원 탈퇴처리
	 */
	function depositConfirmationMemberDelete(){
		var data = $("#member_modify_form").serializeArray();
		$.ajax({
			type : 'POST',
			data : data,
			url : ('/admin/ajax/config/deposit_confirmation_member_delete.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg === "SUCCESS"){
					$.cocoaDialog.close();
					alert(getLocalizeString("설명_회원탈퇴처리가", "", "회원탈퇴처리가 완료되었습니다."));
					location.reload();
				}else{
					alert(res.msg);
				}
			}
		});
	}

	/**
	 * input 입력 값에 숫자만 허용하는 함수
	 * 통합적으로 사용하려면 공통 스크립트에 이동시켜도 무방함
	 * @param e
	 * @returns {boolean}
	 */
	var checkNumber = function(e){
		var key_value = e.keyCode;

		if(key_value < 48 || key_value > 57) e.returnValue = false;
	};

	return {
		'openDepositConfirmationRequestDialog' : function(){
			openDepositConfirmationRequestDialog();
		},
		'openDepositConfirmationAccountConfigDialog' : function(){
			openDepositConfirmationAccountConfigDialog();
		},
		'openDepositConfirmationAccountAddDialog' : function(bank_data_list,account_code){
			openDepositConfirmationAccountAddDialog(bank_data_list,account_code);
		},
		'depositConfirmationAccountAdd' : function(){
			depositConfirmationAccountAdd();
		},
		'depositConfirmationAccountDelete' : function(){
			depositConfirmationAccountDelete();
		},
		'openDepositConfirmationMemberModifyDialog' : function(){
			openDepositConfirmationMemberModifyDialog();
		},
		'checkNumber' : function(e){
			checkNumber(e);
		}
	}
}();

var SHOP_PG_REQUEST = function() {
	var $dialog, $pg_request;
	var $header, $main_header;
	var $info;
	var $html;
	var $form;
	var $sub_modal;
	var $payco_wrap;
	var $nicepay_category;
	var $nicepay_reqid;
	var $nicepay_co_no2_wrap;
	var $btn_wrap;
	var $check_use_default_mer;
	var $mer_data_wrap;
	var $easy_inicis_bank_wrap;

	var latest_check_id = '';
	var is_nicepay_checked_id_progress = false;

	var default_options = {};
	var _options = {};

	var init = function(options){
		_options = $.extend({}, default_options, options);

		$dialog				= $('#pg_form_wrap');
		$pg_request			= $dialog.find('._request');
		$header				= $dialog.find('._header');
		$main_header		= $dialog.find('#pg_rq_h1');
		$html				= $dialog.find('._html');
		$nicepay_category	= $dialog.find('._nicepay_category');
		$nicepay_reqid		= $dialog.find('._nicepay_reqid');
		$nicepay_co_no2_wrap = $dialog.find('#nicepayCoNo2');
		$easy_inicis_bank_wrap = $dialog.find('#easyInicisBankWrap');

		if ( options.status == '' ) {
			$btn_wrap = $('._option_list');
			$btn_wrap.hide();
			setTimeout(function(){
				$('#save_btn_bottom_wrap').hide();
			}, 100);
		}

		$check_use_default_mer = $dialog.find('._check_use_default_mer');
		$mer_data_wrap = $dialog.find('._mer_data_wrap');

		$payco_wrap = $dialog.find('._payco_wrap');

		var fileupload_config = {
			url: '/admin/ajax/upload_file.cm',
			formData: {temp: 'Y'},
			dataType: 'json',
			singleFileUploads: true,
			limitMultiFileUploads: 1,
			dropZone: false,
			start: function(e, data){
				// TODO site 에서는 preloader 변수가 아직 없음
				//$preloader.show();
			},
			progress: function(e, data){
				// Calculate the completion percentage of the upload
				var progress = parseInt(data.loaded / data.total * 100, 10);
				if(progress == 100){
					//	data.context.removeClass('working');
				}
			},
			done: function(e, data){
				var target_pg = $(e.target).attr('data-pg');
				$.each(data.result.files, function(e, tmp){
					if(tmp.error == null){
						var $_target;
						switch( target_pg ) {
							case 'nicepay':
								target_pg = 'nicepay';
								//$_target = $dialog.find('._html._nicepay');
								break;
							case 'paynuri':
								$_target = $dialog.find('._html._paynuri');
								break;
							case 'kicc':
								target_pg = 'kicc';
								break;
							default:
								target_pg = 'default';
								$_target = $dialog.find('._html._default');
						}

						var $_form = $dialog.find('#pg_form_'+target_pg);
						$_form.find('._file_idx').val(tmp.tmp_idx);
						$_form.find('._preview').show().attr('src',CDN_UPLOAD_URL + tmp.site_code +"/"+tmp.name);
					}else{
						alert(tmp.error);
					}
				});
			},
			fail: function(e, data){
				alert(getLocalizeString("설명_업로드에실패하였습니다", "", "업로드에 실패 하였습니다."));
			}
		};

		$dialog.find('._fileupload').fileupload(fileupload_config);

		// 나이스페이 관련 - 상품 카테고리 선택
		$nicepay_category.on('change', function() {
			$.ajax({
				type: 'POST',
				data: { category: $(this).val() },
				url: ('/admin/ajax/config/get_nicepay_category.cm'),
				dataType: 'json',
				success: function (res) {
					if(res.msg == 'SUCCESS'){
						$("#mnBsKind").html(res.html);
					}else
						alert(res.msg);
				}
			});
		});

		// 나이스페이 아이디 엔터 처리
		$nicepay_reqid.off('keydown').on('keydown', function(evt) {
			if ( evt.keyCode == 13 ) {
				nicepayCheckId();
			}
		});

		// 나이스페이 기본정보와 동일시 체크 처리
		$check_use_default_mer.on('change', function() {
			var checked = this.checked;

			if ( checked ) {
				$_target = $dialog.find('._html._nicepay');
				$_target.find("[name='merEmpCp']").val($_target.find("[name='boss_phone']").val());
				$_target.find("[name='merEmpTel']").val($_target.find("[name='represent_callnum']").val());
				$_target.find("[name='merEmpEmail']").val($_target.find("[name='email']").val());
			} else {
				$mer_data_wrap.find('input').val('');
			}
		});
	};

	/**
	 * 담당자 정보 계약자 정보와 동일하게 설정
	 */
	var setWorkerData = function(type){
		$form.find("[name='worker_phone']").val($form.find("[name='callnum']").val());
		$form.find("[name='worker_callnum']").val($form.find("[name='represent_callnum']").val());
		$form.find("[name='worker_email']").val($form.find("[name='email']").val());
		if(type == 'inicis' || type == 'kicc'){
			$form.find("[name='worker_name']").val($form.find("[name='name']").val());
		}

	};

	var showPgForm = function(type){
		var form_type = type == 'kcp' ? 'default' : type;
		$pg_type = type == 'kcp' ? 'default' : type;
		$form = $dialog.find('#pg_form_'+form_type);
		var $pg_detail_wrap = $('#pg_detail_wrap');
		var $pg_form_wrap = $('#pg_form_wrap');
		var $payco_wrap = $pg_form_wrap.find('._payco_wrap');
		var msg = getLocalizeString("설명_신청", "", "신청");

		if ( _options.promotion_pg && _options.promotion_pg != type && !confirm(getLocalizeString("설명_선택하신PG사는가입비가발생됩니다그래도신청하시겠습니까", [], "선택하신 PG사는 가입비 22만원이 발생됩니다. 그래도 신청하시겠습니까?")) ) {
			return false;
		}
		$pg_form_wrap.show();
		$btn_wrap.show();
		$btn_wrap.html('<li><a class="btn btn-default-bright" onclick="SHOP_PG_REQUEST.hidePgForm();">' + getLocalizeString("버튼_취소", "", "취소") + '</a></li><li><a class="btn btn-primary" href="#infoDetail" onclick="SHOP_PG_REQUEST.submit($pg_type)">'+ getLocalizeString("설명_신청", "", "신청") +'</a></li>');
		$pg_detail_wrap.find('._step_01').hide();
		$pg_detail_wrap.find('._step_02').show();
		$pg_detail_wrap.find('._step_03').hide();

		$pg_detail_wrap.find('.step_wrap .step_02').toggleClass('active', true);
		$pg_detail_wrap.find('.step_wrap .step_01').toggleClass('active', false);
		$pg_detail_wrap.find('.step_wrap .step_03').toggleClass('active', false);

		$pg_detail_wrap.toggleClass(type, true);
		$("._info").hide();
		$('._'+type+'_info').show();
		var $_target;
		switch( type ) {
			case 'nicepay':
				$_target = $pg_form_wrap.find('._html._nicepay');
				break;
			case 'paynuri':
				$_target = $pg_form_wrap.find('._html._paynuri');
				break;
			case 'inicis':
				$_target = $pg_form_wrap.find('._html._inicis');
				break;
			case 'kicc':
				$_target = $pg_form_wrap.find('._html._kicc');
				break;
			default:
				$_target = $pg_form_wrap.find('._html._default');
		}

		$form.find('#pg_type').val(type);

		$("._info_detail").hide();

		$_target.siblings('._html').hide();
		$_target.show();

		if(type == 'kcp'){
			$payco_wrap.show();
		}else{
			$payco_wrap.hide();
		}
	};

	var hidePgForm = function(){

		var $pg_detail_wrap = $('#pg_detail_wrap');
		var $pg_form_wrap = $('#pg_form_wrap');

		$pg_form_wrap.hide();
		$btn_wrap.hide();
		$pg_detail_wrap.find('._step_01').show();
		$pg_detail_wrap.find('._step_02').hide();
		$pg_detail_wrap.find('._step_03').hide();
		$pg_detail_wrap.find('.step_wrap .step_01').toggleClass('active', true);
		$pg_detail_wrap.find('.step_wrap .step_02').toggleClass('active', false);
		$pg_detail_wrap.find('.step_wrap .step_03').toggleClass('active', false);

	};

	var moveUrlMain = function(){
		$dialog.find('._btn_wrap').show();
		$main_header.show();
		$pg_request.hide();
		$header.hide();
		$html.hide();
		$info.show();
	};

	var closeSubModal = function(){
		$sub_modal = $('#pg_rq_sub_dialog');
		$sub_modal.hide();
	};

	var showComplete = function(type, is_pg_exemption){
		var $pg_detail_wrap = $('#pg_detail_wrap');
		var $pg_form_wrap = $('#pg_form_wrap');

		$pg_form_wrap.hide();
		$pg_detail_wrap.find('._step_01').hide();
		$pg_detail_wrap.find('._step_02').hide();

		//바로오픈 바로사용 가능시
		if((type == 'inicis' || type == 'kicc') && is_pg_exemption == 'Y'){
			$pg_detail_wrap.find('._step_03_pg_immediately_open').show();
		}else{
			$pg_detail_wrap.find('._step_03').show();
		}

		$btn_wrap.hide();

		$pg_detail_wrap.find('.step_wrap .step_02').toggleClass('active', false);
		$pg_detail_wrap.find('.step_wrap .step_01').toggleClass('active', false);
		$pg_detail_wrap.find('.step_wrap .step_03').toggleClass('active', true);
	};

	var is_submit = false;
	var submit = function(type){
		if ( is_submit ) return false;
		is_submit = true;
		var $_form = $dialog.find('#pg_form_'+type);
		var data = $_form.serializeObject();
		$.ajax({
			type: 'POST',
			data: { 'data':data },
			url: ('/admin/ajax/shop/add_pg_request.cm'),
			dataType: 'json',
		}).done(function(res) {
			if( res.msg == 'SUCCESS' ) {
				if(type == 'kicc' && res.is_pg_exemption == 'N'){
					if(confirm('신청이 완료 되었습니다 가입비 결제 페이지로 넘어가시겠습니까?')){
						window.open(res.kicc_fee_uri);
					}
				}
				showComplete(type, res.is_pg_exemption);
			} else {
				alert(res.msg);
			}

			is_submit = false;
		}).fail(function(e, status, data) {
			is_submit = false;
		});
	};

	var checkAllAgree = function(check) {
		$dialog.find('input[name^="termsAgreeCl"]').prop('checked', check);
	};

	var nicepayCheckId = function(id) {
		id = id || $dialog.find('._nicepay_reqid').val();
		// if ( id == latest_check_id ) return;


		if ( id.length < 7 ) {
			alert(getLocalizeString("설명_나이스페이아이디는","", "나이스페이 아이디는 7자리로 입력해주세요."));
			return;
		}

		if ( is_nicepay_checked_id_progress ) return;
		is_nicepay_checked_id_progress = true;

		latest_check_id = id;

		$.ajax({
			type: 'POST',
			data: {'id': id},
			url: ('/admin/ajax/shop/check_nicepay_id.cm'),
			dataType: 'json',
			success: function (res) {
				alert(res.msg);
				is_nicepay_checked_id_progress = false;
			}
		});
	};

	var openEasyPaymentInfo = function(type){
		var url = '/admin/ajax/config/easy_payment_info.cm?type=' + type;
		var pop_name = type+'_info';

		var popupWidth = 400;
		var popupHeight = 600;
		var popupX = (document.body.offsetWidth / 2) - (popupWidth / 2);
		var popupY= (document.body.offsetHeight / 2) - (popupHeight / 2);
		var popup = window.open(url, pop_name,'height='+popupHeight+', width='+popupWidth+', left='+popupX+', top='+popupY+', status=yes, toolbar=no, menubar=no,location=no');
	};

	var callbackApplyWithKakaopay = function(checked) {
		if ( checked ) {
			$easy_inicis_bank_wrap.show();
		} else {
			$easy_inicis_bank_wrap.hide();
		}
	};

	var toggleNicepayCoNo2 = function(visible) {
		$nicepay_co_no2_wrap.toggle(visible);
	};


	var pre_mid = "";
	var checkPgImmediatelyOpenMidCode = function(pg_type, mid){
		$.ajax({
			type: 'POST',
			data: {'pg_type': pg_type,'mid':mid},
			url: ('/admin/ajax/shop/check_pg_immediately_open_mid_code.cm'),
			dataType: 'json',
			success: function (res) {
				if(res.data.success){
					pre_mid = mid;
					$("#is_check_pg_mid").val('Y');
				}else{
					$("#is_check_pg_mid").val('N');
				}
				alert(res.data.msg);
			}
		});
	};

	var initKicc = function(){
		var option = {};
		option.addr_container = $("._address_wrap_kicc");
		option.addr_pop = $("._address_wrap_kicc ._add_list_kicc");
		option.post_code = $("._zipcode_kicc");
		option.addr = $("._address_kicc");
		option.onShow = function(){
			$("._address_wrap_kicc").show();
		};
		option.onClose = function(){
			$("._address_wrap_kicc").hide();
		};
		option.onComplete = function(){

		};
		var addr_daum = new ZIPCODE_DAUM();
		addr_daum.init(option);
		$("._find_address_kicc").click(function(){
			addr_daum.showFindAddress();
		});
		$("._brand_type_input").hide();
		$("._business_license_number").show();
		$("input:radio[name='brand_type']").click(function(){
			$("._brand_type_input").hide();

			if($(this).val() == "P"){
				$("._business_license_number").show();
			}else{
				$("._business_license_number").show();
				$("._corporate_registration_number").show();
			}

		});
	}

	var initInicis = function(){

		var option = {};
		option.addr_container = $("._address_wrap");
		option.addr_pop = $("._address_wrap ._add_list");
		option.post_code = $("._zipcode");
		option.addr = $("._address");
		option.onShow = function(){
			$("._address_wrap").show();
		};
		option.onClose = function(){
			$("._address_wrap").hide();
		};
		option.onComplete = function(){

		};
		var addr_daum = new ZIPCODE_DAUM();
		addr_daum.init(option);
		$("._find_address").click(function(){
			addr_daum.showFindAddress();
		});


		$("._brand_type_input").hide();
		$("._business_license_number").show();
		$("input:radio[name='brand_type']").click(function(){
			$("._brand_type_input").hide();

			if($(this).val() == 1){
				$("._business_license_number").show();
			}else{
				$("._business_license_number").show();
				$("._corporate_registration_number").show();
			}

		});
		$("#pg_mid").keyup(function(e){
			if($(this).val() === pre_mid){
				$("#is_check_pg_mid").val('Y');
			}else{
				$("#is_check_pg_mid").val('N');
			}
		});

		$("#pg_mid").keyup(function(event){

			if (!(event.keyCode >=37 && event.keyCode<=40)) {

				var inputVal = $(this).val();

				$(this).val(inputVal.replace(/[^a-z0-9]/gi,''));
			}
		});
	};

	return {
		init: function (options) {
			init(options);
		},
		initInicis : function(){
			initInicis();
		},
		submit : function(type){
			submit(type);
		},
		initKicc : function(){
			initKicc();
		},
		checkPgImmediatelyOpenMidCode : function(type, mid){
			checkPgImmediatelyOpenMidCode(type, mid);
		},
		nicepayCheckId : function(id) {
			nicepayCheckId(id);
		},
		toggleNicepayCoNo2 : function(visible) {
			toggleNicepayCoNo2(visible);
		},
		setWorkerData : function(type){
			setWorkerData(type);
		},
		showPgForm : function(type){
			showPgForm(type);
		},
		hidePgForm : function(){
			hidePgForm()
		},
		showComplete : function(type) {
			showComplete(type)
		},
		moveUrlMain : function(){
			moveUrlMain();
		},
		closeSubModal : function(){
			closeSubModal();
		},
		checkAllAgree : function(check) {
			checkAllAgree(check);
		},
		"openEasyPaymentInfo": function (type) {
			openEasyPaymentInfo(type);
		},
		callbackApplyWithKakaopay: function(checked) {
			callbackApplyWithKakaopay(checked);
		}
	}
}();

var SHOP_NP_SETTING = function() {
	var $np_setting_form;
	var header_ctl;

	var init = function(){
		$np_setting_form = $('#np_setting_form');
		header_ctl = new HEADER_CONTROL();
		header_ctl.init();
		header_ctl.addBtn('save',function(){
			submit();
		});
		$np_setting_form.find('input[type=text], select').off('change').on('change',function(){
			header_ctl.change();
		});
		$np_setting_form.find('input[type=checkbox],input[type=radio]').off('click').on('click',function(){
			header_ctl.change();
		});


		var $use_naver = $("#use_naver");
		var $use_daum = $("#use_daum");

		$use_naver.off("click.use_naver").on("click.use_naver",function(){

			if($(this).prop('checked')){
				if(confirm(getLocalizeString("설명_연동에필요한DBURL생성까지최대1시간소요", "", "연동에 필요한 DB URL(EP URL) 생성까지 최대 1시간이 소요되며 완료된 이후 DB URL 제출이 가능합니다. \n 지금 생성하시겠습니까?"))){
					$('#naver_db_url,#naver_db_interval').toggle($(this).prop('checked'));
				}else{
					$(this).prop('checked',false);
				}
			}else{
				$('#naver_db_url,#naver_db_interval').toggle($(this).prop('checked'));
			}

		});

		$use_daum.off("click.use_daum").on("click.use_daum",function(){
			if($(this).prop('checked')){
				if(confirm(getLocalizeString("설명_연동에필요한DBURL생성까지최대1시간소요", "", "연동에 필요한 DB URL(EP URL) 생성까지 최대 1시간이 소요되며 완료된 이후 DB URL 제출이 가능합니다. \n 지금 생성하시겠습니까?"))){
					$('#daum_db_url,#daum_db_interval').toggle($(this).prop('checked'));
				}else{
					$(this).prop('checked',false);
				}
			}else{
				$('#daum_db_url,#daum_db_interval').toggle($(this).prop('checked'));
			}

		});

	};

	var submit = function(){
		var data = $np_setting_form.serializeObject();
		$.ajax({
			type: 'POST',
			data: { 'data':data },
			url: ('/admin/ajax/shop/save_npay_setting.cm'),
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					header_ctl.save();
				}else
					alert(res.msg);
			}
		});
	};


	return {
		init: function () {
			init();
		},
		submit : function(){
			submit();
		}
	}
}();

var SHOP_REVIEW_MANAGE = function(){

	var $review_forms;
	var $content;
	var $review_remind_text;
	var $review_placeholder_text;
	var init = function(){
		var hash_temp = location.hash.split('!/');
		if(hash_temp[1]){
			SHOP_REVIEW_MANAGE.viewAdminReviewDetail(hash_temp[1]);
		}
		$review_forms = $('#content').find('._review_form');
		$content = $('#content');
		$review_forms.find('textarea').on('keydown keyup', function () {
			$(this).height(20).height( $(this).prop('scrollHeight')+12 );
		});
		$('#review_filter_list').chosen('destroy');
		$('#review_filter_list').chosen().change(function(e){
			var val = $(this).val();
			reviewSearchByFilter('cancel',val);
		});
		createEvent();
	};

	var createEvent = function(){
		$('.review_config_opt').off('click').on('click',function(){
			Configsubmit();
		});
		$('#shop_review_remind_text').focusout(function() {
			Configsubmit();
		});
	};

	var Configsubmit = function(){
		var review_config_opt = {
			'shop_use_multi_lang_review' 		: $('#shop_use_multi_lang_review').prop('checked')? 'Y':'N',
			'shop_review_manager_one_page' 		: $('#shop_review_manager_one_page').prop('checked')? 'Y':'N',
			'shop_review_level_order' 	     	: $('#shop_review_level_order').prop('checked')? 'Y':'N',
			'shop_review_remind_check' 	: $('#shop_review_remind_check').prop('checked')? 'Y':'N'
		};
		$.ajax({
			type : 'POST',
			data : {'review_config_opt' : review_config_opt , only_remind_text : 'N'},
			url : ('/admin/ajax/shop/save_shop_etc_config.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					alert(getLocalizeString("설명_저장되었습니다", "", "저장되었습니다."));
					location.reload();
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var RemindTextsubmit = function(){
		var review_config_opt = {
			'shop_use_multi_lang_review' 		: $('#shop_use_multi_lang_review').prop('checked')? 'Y':'N',
			'shop_review_manager_one_page' 		: $('#shop_review_manager_one_page').prop('checked')? 'Y':'N',
			'shop_review_level_order' 		    : $('#shop_review_level_order').prop('checked')? 'Y':'N',
			'shop_review_remind_check' 	: $('#shop_review_remind_check').prop('checked')? 'Y':'N',
			'shop_review_remind_text'  : $review_remind_text.val(),
		};
		$.ajax({
			type : 'POST',
			data : {'review_config_opt' : review_config_opt, only_remind_text : 'Y'},
			url : ('/admin/ajax/shop/save_shop_etc_config.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					location.reload();
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var PlaceHoderTextsubmit = function(){
		var review_config_opt = {
			'shop_use_multi_lang_review' 		: $('#shop_use_multi_lang_review').prop('checked')? 'Y':'N',
			'shop_review_manager_one_page' 		: $('#shop_review_manager_one_page').prop('checked')? 'Y':'N',
			'shop_review_level_order' 		    : $('#shop_review_level_order').prop('checked')? 'Y':'N',
			'shop_review_remind_check' 	: $('#shop_review_remind_check').prop('checked')? 'Y':'N',
			'review_placeholder_text'  : $review_placeholder_text.val()
		};
		$.ajax({
			type : 'POST',
			data : {'review_config_opt' : review_config_opt, only_placehoder_text : 'Y'},
			url : ('/admin/ajax/shop/save_shop_etc_config.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					location.reload();
				}else{
					alert(res.msg);
				}
			}
		});
	};
	var viewAdminReviewDetail = function(idx,review_page){
		$.ajax({
			type: 'POST',
			data: {idx:idx, review_page: review_page},
			url: ('/admin/ajax/shop/admin_review_detail_view.cm'),
			dataType: 'json',
			cache: false,
			success: function (res) {
				if(res.msg === 'SUCCESS'){
					$.cocoaDialog.open({type : 'prod_detail', custom_popup : res.html, width : 800, hide_event : function(){
							removeAdminReviewHash();
						}});
					location.hash = "admin_review_detail!/"+res.idx;
				}else{
					alert(res.msg);
				}
			}
		});
	};
	var removeAdminReviewHash = function(){
		location.href = '#admin_review_detail';
	};

	var showForm = function(idx){
		hideForm();
		$('#review_form_'+idx).show();
	};

	var hideForm = function(){
		$review_forms.find('textarea').val('');
		$review_forms.hide();
	};

	var deleteReview = function(code,isbook){
		if(confirm(getLocalizeString("설명_정말삭제하시겠습니까", "", "정말 삭제 하시겠습니까?"))){
			$.ajax({
				type        : 'POST',
				data        : {code : code,isbook:isbook},
				url         : ('/admin/ajax/shop/delete_review.cm'),
				dataType    : 'json',
				cache       : false,
				success     : function (result) {
					if(result.msg=='SUCCESS') {
						removeAdminReviewHash();
						location.reload();
					}else
						alert(result.msg);
				}
			});
		}
	};

	var submit = function(idx,is_book){
		var data = $('#review_form_'+idx).serializeObject();
		$.ajax({
			type        : 'POST',
			data        : {data : data, isbook : is_book},
			url         : ('/admin/ajax/shop/add_review.cm'),
			dataType    : 'json',
			cache       : false,
			success     : function (result) {
				if(result.msg=='SUCCESS') {
					location.reload();
				}else
					alert(result.msg);
			},
			error:function(request,status,error){
				console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
			}
		});
	};

	var setVisible = function(code, is_visible) {
		var msg = '';
		if(is_visible == 'N'){
			msg = getLocalizeString("설명_리뷰를숨김처리하시겠습니까", "", "숨김 처리 하시겠습니까?");
		}else{
			msg = getLocalizeString("설명_숨김처리를해제하시겠습니까", "", "숨김 처리를 해제하시겠습니까?");
		}


		if(confirm(msg)){
			$.ajax({
				type : 'POST',
				data : {code : code, is_visible : is_visible},
				url : ('/admin/ajax/shop/delete_review.cm'),
				dataType : 'json',
				cache : false,
				success : function(result){
					if(result.msg == 'SUCCESS'){
						location.reload();
					}else
						alert(result.msg);
				}
			});
		}
	};

	var showShopMultiReviewAdd = function(){
		$.cocoaDialog.close();
		$.ajax({
			type: 'POST',
			data: {},
			url: ('/admin/ajax/shop/open_review_batch.cm'),
			dataType: 'html',
			async: true,
			cache: false,
			success: function(html){
				var $html = $(html);
				$.cocoaDialog.open({type: 'multi_prod_add', custom_popup: $html});
			}
		});
	};

	var showBookingMultiReviewAdd = function(){
		$.cocoaDialog.close();
		$.ajax({
			type: 'POST',
			data: {},
			url: ('/admin/ajax/booking/open_review_batch.cm'),
			dataType: 'html',
			async: true,
			cache: false,
			success: function(html){
				var $html = $(html);
				$.cocoaDialog.open({type: 'multi_prod_add', custom_popup: $html});
			}
		});
	};

	var openDeleteReviewForm = function(code,isbook){
		$.cocoaDialog.close();
		$.ajax({
			type: 'POST',
			data: {code : code,isbook:isbook},
			url: ('/admin/ajax/shop/delete_review_form.cm'),
			dataType: 'html',
			async: true,
			cache: false,
			success: function(html){
				var $html = $(html);
				$.cocoaDialog.open({type: 'admin', custom_popup: $html,width:550,reopen:true, use_enter: true, hide_event:function(){
						$(window).unbind('keydown');
					}});
			}
		});
	};

	var updateReviewWtimeForm = function(code){
		$.ajax({
			type: 'POST',
			data: {code : code},
			url: ('/admin/ajax/shop/update_review_wtime_form.cm'),
			dataType: 'html',
			async: true,
			cache: false,
			success: function(html){
				var $html = $(html);
				$.cocoaDialog.open({type: 'admin', custom_popup: $html,width:550,reopen:true, use_enter: true, hide_event:function(){
						$(window).unbind('keydown');
					}});
			}
		});
	};

	var updateReviewWtime = function(code){
		var date = $('._datepicker_input_obj').val();
		var time = $('._timepicker_input_obj').val();
		if(date == '' || date == null || time == '' || time == null) {
			alert(getLocalizeString("설명_작성시각날짜시간입력", "", "날짜와 시간을 입력해 주세요."));
			return false;
		}
		$.ajax({
			type: 'POST',
			data: {code : code, date : date, time : time},
			url: ('/admin/ajax/shop/update_review_wtime.cm'),
			dataType: 'json',
			async: true,
			cache: false,
			success     : function (result) {
				if(result.msg=='SUCCESS') {
					location.reload();
				}else
					alert(result.msg);
			}
		});
	};

	var openReviewPointManager = function(code){
		$.ajax({
			type: 'POST',
			data: {code : code},
			url: ('/admin/ajax/shop/open_review_point_manager.cm'),
			dataType: 'html',
			async: true,
			cache: false,
			success: function(html){
				var $html = $(html);
				$.cocoaDialog.open({type: 'admin', custom_popup: $html,width:550,reopen:true, hide_event:function(){
						$(window).unbind('keydown');
					}});
			}
		});
	};

	var updateReviewPoint = function(code){
		if(confirm(getLocalizeString("설명_리뷰의포인트지급을승인", "", "구매평의 적립금 지급을 승인하시겠습니까?"))){
			$.ajax({
				type        : 'POST',
				data        : {code : code},
				url         : ('/admin/ajax/shop/update_review_point.cm'),
				dataType    : 'json',
				cache       : false,
				success     : function (result) {
					if(result.msg=='SUCCESS') {
						location.reload();
					}else
						alert(result.msg);
				}
			});
		}
	};

	var updateReviewLevel = function(type,code){
		var msg = '';
		switch(type){
			case 'best':
				msg = getLocalizeString("설명_베스트리뷰로지정하시겠습니까", "", "선택된 구매평를 베스트로 지정하시겠습니까? 지정 후에도 언제든지 해제 가능합니다");
				break;
			case 'worst':
				msg = getLocalizeString("설명_워스트리뷰로지정하시겠습니까", "", "선택된 구매평를 워스트로 지정하시겠습니까? 지정 후에도 언제든지 해제 가능합니다");
				break;
			case 'release_best':
				msg = getLocalizeString("설명_베스트리뷰지정을해제하시겠습니까", "", "선택된 구매평의 베스트 지정을 해제하시겠습니까?");
				break;
			case 'release_worst':
				msg = getLocalizeString("설명_워스트리뷰지정을해제하시겠습니까", "", "선택된 구매평의 워스트 지정을 해제하시겠습니까?");
				break;
			case 'release':
				msg = getLocalizeString("설명_베스트워스트리뷰지정을해제하시겠습니까", "", "선택된 구매평의 베스트/워스트 지정을 해제하시겠습니까?");
				break;
		}
		if(confirm(msg)){
			$.ajax({
				type : 'POST',
				data : {type : type, code : code},
				url : ('/admin/ajax/shop/update_review_level.cm'),
				dataType : 'json',
				cache : false,
				success : function(result){
					if(result.msg == 'SUCCESS'){
						location.reload();
					}else
						alert(result.msg);
				}
			});
		}
	};

	var reviewSearchByFilter = function(type,cancel_filter){
		var data = $('#search_review_form').serializeObject();
		data['keyword'] = $('#keyword').val();
		data['pagesize'] = $('#pagesize').val();
		$.ajax({
			type        : 'POST',
			data        : {data : data, type: type ,cancel_filter : cancel_filter},
			url         : ('/admin/shopping/review/review_search.cm'),
			dataType    : 'json',
			cache       : false,
			success     : function (result) {
				if(result.msg=='SUCCESS') {
					window.location.href = 'review?q='+result.q;
				}
			}
		});
	};

	var reviewFilterReset = function(){
		$('#search_review_form').find('.form-control').val('');
	};

	var openReviewRemindText = function(){
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/shop/open_review_remind_text.cm'),
			dataType: 'html',
			async: true,
			cache: false,
			success: function(html){
				$.cocoaDialog.open({type:'review_guide_setting',widget_type:'review_guide_setting',custom_popup:html});
				$review_remind_text = $('#review_remind_text');
				$('._add_btn').off('click').on('click', function(){
					RemindTextsubmit();
				});
			}
		});
	};

	var openReviewPlaceHolderText = function(){
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/shop/open_review_placeholder_text.cm'),
			dataType: 'html',
			async: true,
			cache: false,
			success: function(html){
				$.cocoaDialog.open({type:'review_guide_setting',widget_type:'review_guide_setting',custom_popup:html});
				$review_placeholder_text = $('#review_placeholder_text');
				$('._add_btn').off('click').on('click', function(){
					PlaceHoderTextsubmit();
				});
			}
		});
	};

	return{
		init: function(){
			init();
		},
		submit : function(idx,isbook){
			submit(idx,isbook);
		},
		showForm : function(idx){
			showForm(idx);
		},
		hideForm : function(){
			hideForm();
		},
		delete : function(code,isbook){
			deleteReview(code,isbook);
		},
		setVisible : function(code, is_visible) {
			setVisible(code, is_visible);
		},
		showShopMultiReviewAdd : function(){
			showShopMultiReviewAdd();
		},
		showBookingMultiReviewAdd : function(){
			showBookingMultiReviewAdd();
		},
		showReviewExcelDownload : function(q){
			showReviewExcelDownload(q);
		},
		openDeleteReviewForm : function(code,isbook){
			openDeleteReviewForm(code,isbook);
		},
		updateReviewWtimeForm : function(code){
			updateReviewWtimeForm(code);
		},
		updateReviewWtime : function(code){
			updateReviewWtime(code);
		},
		openReviewPointManager : function(code){
			openReviewPointManager(code);
		},
		updateReviewPoint : function(code){
			updateReviewPoint(code);
		},
		viewAdminReviewDetail : function(idx,r_p){
			viewAdminReviewDetail(idx,r_p);
		},
		updateReviewLevel : function(type,code){
			updateReviewLevel(type,code);
		},
		reviewSearchByFilter : function(type,cancel_filter){
			reviewSearchByFilter(type,cancel_filter);
		},
		reviewFilterReset : function (){
			reviewFilterReset();
		},
		openReviewRemindText : function(){
			openReviewRemindText();
		},
		openReviewPlaceHolderText : function(){
			openReviewPlaceHolderText();
		},
		Configsubmit : function(){
			Configsubmit();
		},
	}
}();

var SHOP_REVIEW_EDIT_MANAGE = function(){
	var body_input;
	var review_body;
	var $review_wrap;
	var $review_form;
	var $rating;
	var $star;
	var page = 1;
	var $product_search_input;
	var $product_search_btn;
	var $product_search_list;
	var $product_more_btn;
	var images = {};
	var init = function(){
		$review_wrap = $('._review_wrap');
		$review_form = $('#review_form');
		$rating = $('#rating');
		review_body = $('#review_body');
		body_input = $('#body_input');
		$star = $('._star');
		images = {};

		if(android_version() == 4){
			review_body.addClass('legacy_webview');
		}

		$review_form.find('#review_image_upload_btn').fileupload({
			url: '/admin/ajax/upload_file_mongo.cm',
			formData: {temp: 'Y', target: 'site_review', type: 'image'},
			dataType: 'json',
			singleFileUploads: true,
			limitMultiFileUploads: 1,
			start: function(e, data){
			},
			progress: function(e, data){
			},
			done: function(e, data){
				$.each(data.result.files, function(e, tmp){
					if(tmp.error == null){
						var url = tmp.url;
						images[tmp.code] = url;
						var html = '<div class="img_area_wrap _img_'+tmp.code+'"><img src="' + CDN_UPLOAD_URL + url + '" style="width:120px; height:120px;"><a href="javascript:;" onclick="SHOP_REVIEW_EDIT_MANAGE.deleteImage(\''+tmp.code+ '\')" class="btl bt-times-circle"></a></div>';
						$("#review_image_box").append(html);
					}else{
						alert(tmp.error);
					}
				});
			},
			fail: function(e, data){
				alert(getLocalizeString("설명_업로드에실패하였습니다", "", "업로드에 실패 하였습니다."));

			}
		});


	};

	var submit = function(){
		var data = $review_form.serializeObject();
		data.images = images;
		$.ajax({
			type        : 'POST',
			data 		: data,
			url         : ('/admin/shopping/review/add.cm'),
			dataType    : 'json',
			success     : function (res) {
				if(res.msg == 'SUCCESS'){
					window.top.location.href=res.backurl;
				}else{
					alert(res.msg);
				}
			}
		});
	} ;

	var changeRating = function(t,n){
		if(t == 'desktop'){
			$rating.val(n + 1);
			$star.each(function(e){
				if(n <= 0 && e == 0){
					if(n == -1){
						$(this).removeClass('active');
					}else{
						$(this).addClass('active');
					}
				}else{
					$(this).removeClass('active');
					if(e <= n){
						$(this).addClass('active');
					}
				}
			});
		}
	};

	var openReviewProdEditForm = function(){
		page = 1;
		$.ajax({
			type        : 'POST',
			url         : ('/admin/ajax/shop/open_review_prod_edit_form.cm'),
			dataType    : 'html',
			cache       : false,
			success     : function (res) {
				var $html = $(res);
				$.cocoaDialog.open({type:'coupon_product_search',custom_popup:$html},function(){
					$product_search_input = $("#product_search_input");
					$product_search_btn = $("#product_search_btn");
					$product_search_list = $("#product_search_list");
					$product_more_btn = $("#product_more_btn");
					getProductList(true);
					$product_search_input.off("keyup.product_search_input").on("keyup.product_search_input",function(e){
						if(e.which == 13){
							getProductList(true);
						}
					});
					$product_search_btn.off("click.product_search_btn").on("click.product_search_btn",function(){
						getProductList(true);
					});

					$product_more_btn.off("click.product_more_btn").on("click.product_more_btn",function(){
						getProductList(false);
					});
				});
			}
		});

	};

	var getProductList = function(list_clear){
		if(list_clear) $product_search_list.empty();
		var search_data = $product_search_input.val();
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/shop/get_review_prod_list.cm'),
			data : {search_data:search_data,page:page},
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				$product_more_btn.hide();
				$product_search_list.append(res.html);
				if(res.is_more == "Y")$product_more_btn.show();
				page+=1;
			}
		});
	};

	var changeReviewProd = function(code,img_url,name){
		$('#prod_name').text(name);
		$("#prod_url").attr("src", img_url);
		$('#prod_code').val(code);
		$.cocoaDialog.close();
	};

	var convertImage = function(img_list){
		for(var i = 0; i < img_list.length; i++){
			images[i] = img_list[i];
		}
	};

	var deleteImage =function(code){
		if ( typeof images[code] != 'undefined' ) {
			delete images[code];
		}
		$("._img_"+code).remove();
	};

	return{
		init: function(){
			init();
		},
		submit : function(){
			submit();
		},
		changeRating : function(t,n){
			changeRating(t,n);
		},
		openReviewProdEditForm : function(){
			openReviewProdEditForm();
		},
		changeReviewProd : function(code,img_url,name){
			changeReviewProd(code,img_url,name);
		},
		convertImage : function(img_list){
			convertImage(img_list);
		},
		deleteImage : function(code){
			deleteImage(code);
		}
	}
}();

var SHOP_REVIEW_COMMENT_MANAGE = function(){
	var review_code;
	var $form;
	var init = function(code){
		review_code = code;
		if(code != '') getAdminReviewCommentHtml(code);
	};
	var addReviewComment = function(type,id,one_page){
		switch(type){
			case 'main' :
				$form = $('#review_comment_form');
				var data = $form.serializeObject();
				break;
			case 'sub' :
				$form = $('#review_comment_sub_form_'+id);
				var data = $form.serializeObject();
				break;
			case 'one_page' :
				$form = $('#review_form_'+id);
				var data = $form.serializeObject();
				break;
			case 'edit' :
				$form = $('#review_comment_sub_edit_form_'+id);
				var data = $form.serializeObject();
				break;
			default:
				break;
		}
		$.ajax({
			type : 'POST',
			data : {data : data},
			url : ('/admin/ajax/shop/add_review_comment.cm'),
			dataType : 'json',
			cache : false,
			success : function(result){
				if(result.msg == 'SUCCESS'){
					if(one_page == 'Y'){
						location.reload();
					}else{
						getAdminReviewCommentHtml(review_code);
					}
				}else
					alert(result.msg);
			}
		});
	};
	var deleteReviewComment = function(code,one_page){
		if(confirm(getLocalizeString("설명_해당답글을삭제합니다", "", "해당 답글을 삭제합니다. 삭제한 답글은 복원할 수 없습니다."))){
			$.ajax({
				type        : 'POST',
				data        : {code : code},
				url         : ('/admin/ajax/shop/delete_review_comment.cm'),
				dataType    : 'json',
				cache       : false,
				success     : function (result) {
					if(result.msg=='SUCCESS') {
						if(one_page == 'Y'){
							location.reload();
						}else{
							getAdminReviewCommentHtml(review_code);
						}
					}else
						alert(result.msg);
				}
			});
		}
	};

	var getAdminReviewCommentHtml = function(code){
		var $admin_review_comment_section = $('#admin_review_comment_section');
		$.ajax({
			type : 'POST',
			data : {review_code : code},
			url : ('/admin/ajax/shop/get_admin_review_comment_list.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$admin_review_comment_section.html(html);
			}
		});
	};

	var setVisible = function(code,is_visible){
		$.ajax({
			type        : 'POST',
			data        : {code : code,is_visible:is_visible},
			url         : ('/admin/ajax/shop/delete_review.cm'),
			dataType    : 'json',
			cache       : false,
			success     : function (result) {
				if(result.msg=='SUCCESS') {
					getAdminReviewCommentHtml(review_code);
				}else
					alert(result.msg);
			}
		});
	};

	var reviewCommentCancel = function(id,type){
		if(type == 'main'){
			$('#' + id).find('textarea').val('');
		}else if(type == 'sub'){
			$('.review_comment_sub_form_' + id).hide();
			$('.review_comment_sub_form_' + id).find('textarea').val('');
		}else{
			$('._sub_review_editor_form_' + id).hide();
			$('._sub_review_editor_form_' + id).siblings().show();
		}

	};

	var showForm = function(idx){
		var sub_form = $(".review_comment_sub_form_" + idx);

		sub_form.show();
		var comment_add_body = sub_form.find('._comment_add_body_' + idx);

		$('body').off('mouseup.sub_comment')
			.on('mouseup.sub_comment', function(e){
				var $c_target = $(e.target);
				var $s_form = $c_target.closest('._sub_form_' + idx + ', ._show_sub_form_btn_' + idx);
				if($s_form.length == 0){

					var text = comment_add_body.val();
					sub_form.data('show', 'N');
					if(text == ''){
						$('body').off('mouseup.sub_comment');
						reviewCommentFormHide();
					}
				}
			});
	};

	var reviewCommentFormHide = function(){
		$("._sub_review_form").hide();
	};
	var showEditForm = function(idx){
		var editor_form = $("._sub_review_editor_form_" + idx);
		editor_form.siblings().hide();

		editor_form.data('show', 'Y');
		editor_form.show();
		autosize.update(editor_form.find('textarea'));
	};

	return{
		init : function(code){
			init(code);
		},
		submit : function(type,id,one_page){
			addReviewComment(type,id,one_page);
		},
		delete : function(code,one_page){
			deleteReviewComment(code,one_page);
		},
		getAdminReviewCommentHtml : function(code){
			getAdminReviewCommentHtml(code);
		},
		setVisible : function(code,is_visible){
			setVisible(code,is_visible);
		},
		reviewCommentCancel : function(id,type){
			reviewCommentCancel(id,type);
		},
		showForm : function(idx){
			showForm(idx);
		},
		showEditForm : function(idx){
			showEditForm(idx);
		}
	}
}();

var SHOP_ANSWERS_MANAGE = function(){
	var $answers_form;
	var $answers_edit_form;
	var $answers_body_wrap;
	var init = function(){
		var hash_temp = location.hash.split('!/');
		if(hash_temp[1]){
			SHOP_ANSWERS_MANAGE.viewAdminQnaDetail(hash_temp[1]);
		}
		$answers_form = $('#content').find('._answers_form');
		$answers_edit_form = $('#content').find('._answers_edit_form');
		$answers_body_wrap = $('#content').find('._answers_body_wrap');
		autosize(document.querySelectorAll('textarea'));

		$('#qna_filter_list').chosen('destroy');
		$('#qna_filter_list').chosen().change(function(e){
			var val = $(this).val();
			qnaSearchByFilter('cancel',val);
		});

	};

	var viewAdminQnaDetail = function(idx,qna_page){
		$.ajax({
			type: 'POST',
			data: {idx:idx, qna_page: qna_page},
			url: ('/admin/ajax/shop/admin_qna_detail_view.cm'),
			dataType: 'json',
			cache: false,
			success: function (res) {
				if(res.msg === 'SUCCESS'){
					$.cocoaDialog.open({type : 'prod_detail', custom_popup : res.html, width : 800, hide_event : function(){
							removeAdminQnaHash();
							$('html').toggleClass('modal-scroll-control', false);
						}});
					location.hash = "admin_qna_detail!/"+res.idx;
				}else{
					alert(res.msg);
				}
			}
		});
	};
	var removeAdminQnaHash = function(){
		location.href = '#admin_qna_detail';
	};

	var showForm = function(idx){
		hideForm();
		hideEditForm();
		$('#answers_form_'+idx).show();
	};

	var hideForm = function(){
		$answers_form.find('textarea').val('');
		$answers_form.hide();
	};

	var showEditForm = function(idx){
		hideForm();
		hideEditForm();
		$('._answers_body_wrap_' + idx).hide();
		$('#answers_edit_form_' + idx).show();
		autosize.update($('#answers_edit_form_' + idx).find('textarea'));
	};

	var hideEditForm = function(idx){
		$answers_edit_form.hide();
		$answers_body_wrap.show();
	};

	var openDeleteAnswersForm = function(code, isbook){
		$.cocoaDialog.close();
		$.ajax({
			type: 'POST',
			data: {code : code, isbook : isbook},
			url: ('/admin/ajax/shop/delete_answers_form.cm'),
			dataType: 'html',
			async: true,
			cache: false,
			success: function(html){
				var $html = $(html);
				$.cocoaDialog.open({type: 'admin', custom_popup: $html,width:550,reopen:true, use_enter: true, hide_event:function(){
						$(window).unbind('keydown');
					}});
			}
		});
	};

	var deleteAnswers = function(code,isbook){
		if(confirm(getLocalizeString("설명_정말삭제하시겠습니까", "", "정말 삭제 하시겠습니까?"))){
			$.ajax({
				type        : 'POST',
				data        : {code : code, isbook : isbook},
				url         : ('/admin/ajax/shop/delete_answers.cm'),
				dataType    : 'json',
				cache       : false,
				success     : function (result) {
					if(result.msg=='SUCCESS') {
						location.reload();
					}else
						alert(result.msg);
				}
			});
		}
	};

	var submit = function(idx,isbook, sub_code){
		var data;
		if(sub_code != '' && typeof sub_code != 'undefined'){
			data = $('#answers_edit_form_' + idx).serializeObject();
		}else{
			data = $('#answers_form_'+idx).serializeObject();
		}
		$.ajax({
			type        : 'POST',
			data        : {data : data, isbook : isbook, sub_code : sub_code},
			url         : ('/admin/ajax/shop/add_answers.cm'),
			dataType    : 'json',
			cache       : false,
			success     : function (result) {
				if(result.msg=='SUCCESS') {
					location.reload();
				}else
					alert(result.msg);
			}
		});
	};

	var setVisible = function(code, is_visible) {
		var msg = '';
		if(is_visible == 'N'){
			msg = getLocalizeString("설명_문의를숨김처리하시겠습니까", "", "문의를 숨김처리 하시겠습니까?");
		}else{
			msg = getLocalizeString("설명_숨김처리를해제하시겠습니까", "", "숨김 처리를 해제하시겠습니까?");
		}
		if(confirm(msg)){
			$.ajax({
				type : 'POST',
				data : {code : code, is_visible : is_visible},
				url : ('/admin/ajax/shop/delete_answers.cm'),
				dataType : 'json',
				cache : false,
				success : function(result){
					if(result.msg == 'SUCCESS'){
						location.reload();
					}else
						alert(result.msg);
				}
			});
		}
	};
	var updateQnaStatusForm = function(type,code){
		$.cocoaDialog.close();
		$.ajax({
			type: 'POST',
			data: { type : type, code : code},
			url: ('/admin/ajax/shop/update_qna_status_form.cm'),
			dataType: 'html',
			async: true,
			cache: false,
			success: function(html){
				var $html = $(html);
				$.cocoaDialog.open({type: 'admin', custom_popup: $html,width:550,reopen:true, use_enter: true, hide_event:function(){
						$(window).unbind('keydown');
					}});
			}
		});
	};

	var updateQnaStatus = function(type, code){
		var msg = type == 'complete' ? getLocalizeString("설명_답변완료처리가완료됐습니다", "", "답변 완료처리가 완료됐습니다.") : getLocalizeString("설명_답변대기처리가완료됐습니다", "", "답변 대기처리가 완료됐습니다.");
		$.ajax({
			type : 'POST',
			data : {code : code, type : type},
			url : ('/admin/ajax/shop/update_qna_status.cm'),
			dataType : 'json',
			cache : false,
			success : function(result){
				if(result.msg == 'SUCCESS'){
					alert(msg);
					location.reload();
				}else
					alert(result.msg);
			}
		});
	};
	var qnaFilterReset = function(){
		$('#search_qna_form').find('.form-control').val('');
	};

	var qnaSearchByFilter = function(type,cancel_filter){
		var data = $('#search_qna_form').serializeObject();
		data['keyword'] = $('#keyword').val();
		data['pagesize'] = $('#pagesize').val();
		$.ajax({
			type        : 'POST',
			data        : {data : data, type: type ,cancel_filter : cancel_filter},
			url         : ('/admin/shopping/answers/qna_search.cm'),
			dataType    : 'json',
			cache       : false,
			success     : function (result) {
				if(result.msg=='SUCCESS') {
					window.location.href = 'answers?q='+result.q;
				}
			}
		});
	};

	var updateQnaSecretForm = function(type, code){
		$.cocoaDialog.close();
		$.ajax({
			type: 'POST',
			data: { type : type, code : code},
			url: ('/admin/ajax/shop/update_qna_secret_form.cm'),
			dataType: 'html',
			async: true,
			cache: false,
			success: function(html){
				var $html = $(html);
				$.cocoaDialog.open({type: 'admin', custom_popup: $html,width:550,reopen:true, use_enter: true, hide_event:function(){
						$(window).unbind('keydown');
					}});
			}
		});
	};

	var updateQnaSecret = function(type,code){
		var msg = type == 'Y' ? getLocalizeString("설명_비밀문의설정완료", "", "비밀문의 설정이 완료되었습니다.") : getLocalizeString("설명_비밀문의해제완료", "", "비밀문의 해제가 완료되었습니다.");
		$.ajax({
			type : 'POST',
			data : {code : code, type : type},
			url : ('/admin/ajax/shop/update_qna_secret.cm'),
			dataType : 'json',
			cache : false,
			success : function(result){
				if(result.msg == 'SUCCESS'){
					alert(msg);
					location.reload();
				}else
					alert(result.msg);
			}
		});
	};

	return{
		init: function(){
			init();
		},
		viewAdminQnaDetail : function(idx,q_p){
			viewAdminQnaDetail(idx,q_p);
		},
		submit : function(idx,isbook, sub_code){
			submit(idx,isbook, sub_code);
		},
		showForm : function(idx){
			showForm(idx);
		},
		hideForm : function(){
			hideForm();
		},
		showEditForm : function(idx){
			showEditForm(idx);
		},
		hideEditForm : function(){
			hideEditForm();
		},
		delete : function(code,isbook){
			deleteAnswers(code,isbook);
		},
		setVisible : function(code, is_visible) {
			setVisible(code, is_visible);
		},
		openDeleteAnswersForm : function(code,isbook){
			openDeleteAnswersForm(code,isbook);
		},
		updateQnaStatusForm : function(type,code){
			updateQnaStatusForm(type,code);
		},
		updateQnaStatus : function(type,code){
			updateQnaStatus(type,code);
		},
		qnaFilterReset : function(){
			qnaFilterReset();
		},
		qnaSearchByFilter : function(type,cancel_filter){
			qnaSearchByFilter(type,cancel_filter);
		},
		updateQnaSecretForm : function(type, code){
			updateQnaSecretForm(type, code);
		},
		updateQnaSecret : function(type,code){
			updateQnaSecret(type,code);
		},
	}
}();
var SHOP_ONE_PAGE_QNA_COMMENT_MANAGE = function(){

	var showForm = function(idx){
		$('.comment_qna_form_'+idx).show();
	};

	var hideForm = function(idx){
		$('.comment_qna_form_'+idx).hide();
		$('.comment_qna_form_'+idx).find('textarea').val('');
	};

	var showEditForm = function(idx){
		var editor_form = $("._sub_qna_editor_form_" + idx);
		editor_form.siblings().hide();

		editor_form.data('show', 'Y');
		editor_form.show();
		autosize.update(editor_form.find('textarea'));
	};

	return{
		showForm : function(idx){
			showForm(idx);
		},
		hideForm : function(idx){
			hideForm(idx);
		},
		showEditForm : function(idx){
			showEditForm(idx);
		}
	}
}();

var SHOP_QNA_COMMENT_MANAGE = function(){
	var qna_code;
	var $form;
	var init = function(code){
		qna_code = code;
		if(code != '') getAdminQnaCommentHtml(code);
	};
	var addQnaComment = function(type,id,one_page){
		switch(type){
			case 'main' :
				$form = $('#qna_comment_form');
				var data = $form.serializeObject();
				break;
			case 'sub' :
				$form = $('#qna_comment_sub_form_'+id);
				var data = $form.serializeObject();
				break;
			case 'one_page' :
				$form = $('#qna_comment_form_'+id);
				var data = $form.serializeObject();
				break;
			case 'edit' :
				$form = $('#qna_comment_sub_edit_form_'+id);
				var data = $form.serializeObject();
				break;
			default:
				break;
		}
		$.ajax({
			type : 'POST',
			data : {data : data},
			url : ('/admin/ajax/shop/add_qna_comment.cm'),
			dataType : 'json',
			cache : false,
			success : function(result){
				if(result.msg == 'SUCCESS'){
					if(type == 'one_page' || one_page == 'Y'){
						location.reload();
					}else{
						getAdminQnaCommentHtml(qna_code);
					}
				}else
					alert(result.msg);
			}
		});
	};
	var deleteQnaComment = function(code,one_page){
		if(confirm(getLocalizeString("설명_해당답글을삭제합니다", "", "해당 답글을 삭제합니다. 삭제한 답글은 복원할 수 없습니다."))){
			$.ajax({
				type        : 'POST',
				data        : {code : code},
				url         : ('/admin/ajax/shop/delete_qna_comment.cm'),
				dataType    : 'json',
				cache       : false,
				success     : function (result) {
					if(result.msg=='SUCCESS') {
						if(one_page == 'Y'){
							location.reload();
						}else{
							getAdminQnaCommentHtml(qna_code);
						}
					}else
						alert(result.msg);
				}
			});
		}
	};

	var getAdminQnaCommentHtml = function(code){
		var $admin_qna_comment_section = $('#admin_qna_comment_section');
		$.ajax({
			type : 'POST',
			data : {qna_code : code},
			url : ('/admin/ajax/shop/get_admin_qna_comment_list.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$admin_qna_comment_section.html(html);
			}
		});
	};

	var setVisible = function(code,is_visible){
		$.ajax({
			type        : 'POST',
			data        : {code : code,is_visible:is_visible},
			url         : ('/admin/ajax/shop/delete_answers.cm'),
			dataType    : 'json',
			cache       : false,
			success     : function (result) {
				if(result.msg=='SUCCESS') {
					getAdminQnaCommentHtml(qna_code);
				}else
					alert(result.msg);
			}
		});
	};

	var qnaCommentCancel = function(id,type){
		if(type == 'main'){
			$('#' + id).find('textarea').val('');
		}else if(type == 'sub'){
			$('.qna_comment_sub_form_' + id).hide();
			$('.qna_comment_sub_form_' + id).find('textarea').val('');
		}else{
			$('._sub_qna_editor_form_' + id).hide();
			$('._sub_qna_editor_form_' + id).siblings().show();
		}
	};

	var showForm = function(idx){
		var sub_form = $(".qna_comment_sub_form_" + idx);

		sub_form.show();
		var comment_add_body = sub_form.find('._comment_add_body_' + idx);

		$('body').off('mouseup.sub_comment')
			.on('mouseup.sub_comment', function(e){
				var $c_target = $(e.target);
				var $s_form = $c_target.closest('._sub_form_' + idx + ', ._show_sub_form_btn_' + idx);
				if($s_form.length == 0){

					var text = comment_add_body.val();
					sub_form.data('show', 'N');
					if(text == ''){
						$('body').off('mouseup.sub_comment');
						QnaCommentFormHide();
					}
				}
			});
	};

	var QnaCommentFormHide = function(){
		$("._sub_qna_form").hide();
	};

	var showEditForm = function(idx){
		var editor_form = $("._sub_qna_editor_form_" + idx);
		editor_form.siblings().hide();

		editor_form.data('show', 'Y');
		editor_form.show();
		autosize.update(editor_form.find('textarea'));
	};

	return{
		init : function(code){
			init(code);
		},
		submit : function(type,id,one_page){
			addQnaComment(type,id,one_page);
		},
		delete : function(code,one_page){
			deleteQnaComment(code,one_page);
		},
		getAdminQnaCommentHtml : function(code){
			getAdminQnaCommentHtml(code);
		},
		setVisible : function(code,is_visible){
			setVisible(code,is_visible);
		},
		qnaCommentCancel : function(id,type){
			qnaCommentCancel(id,type);
		},
		showForm : function(idx){
			showForm(idx);
		},
		showEditForm : function(idx){
			showEditForm(idx);
		}
	}
}();

var SHOP_PROD_MULTI_ADD = function(){
	var $form;
	var images = [];
	var $prod_multi_add_status;
	var $prod_multi_add_status_msg;
	var upload_complete = false;
	var init = function(){
		$form = $('#prod_multi_add');
		$prod_multi_add_status = $('#prod_multi_add_status');
		$prod_multi_add_status_msg = $('#prod_multi_add_status_msg');
		$('#prod_multi_add_image_upload').fileupload({
			url: '/admin/ajax/upload_file_mongo.cm',
			formData: {temp: 'Y', target: 'shopping_prod', target_code: 'multi_prod_img', type: 'image', overwrite:'Y', upload_count:'Y'},
			dataType: 'json',
			singleFileUploads: false,
			limitMultiFileUploads: 300,
			//dropZone: $('#prod_image_dropzone2'),
			start: function(e, data){
				// TODO site 에서는 preloader 변수가 아직 없음
				//$preloader.show();
				$prod_multi_add_status.addClass('img-loading');
			},
			progress: function(e, data){
				// Calculate the completion percentage of the upload
				var progress = parseInt(data.loaded / data.total * 100, 10);
				if(progress == 100){
					//	data.context.removeClass('working');
				}
			},
			done: function(e, data){
				$prod_multi_add_status.removeClass('img-loading');
				$.each(data.result.files, function(e, tmp){
					if(tmp.error == null){
						//$('#prod_image_dropzone').hide();
						images.push(tmp.code);
						$prod_multi_add_status_msg.addClass('alert-success');
						$prod_multi_add_status_msg.removeClass('alert-danger');
						var msg = getLocalizeString("설명_이미지전송n개완료", data.result.upload_count, "이미지 전송 %1개 완료. 이미지를 더 업로드하거나<br>");
						msg += getLocalizeString("설명_엑셀CSV파일업로드가능", "", "엑셀, CSV 파일을 업로드 할 수 있습니다.<a href=\"/admin/ajax/shop/download_prod_batch_sample.cm\" class=\"text-primary\"> 샘플 파일 다운로드</a>");<!-- (버전: 2016년 11월 29일)-->
						$prod_multi_add_status_msg.html(msg).show();
					}else{
						alert(tmp.error);
					}
				});
			},
			fail: function(e, data){
				$prod_multi_add_status.removeClass('img-loading');
				alert(getLocalizeString("설명_업로드에실패하였습니다", "", "업로드에 실패 하였습니다."));
			}
		});
		$('#prod_multi_add_upload').fileupload({
			url: '/admin/ajax/upload_excel_file_mongo.cm',
			formData: {temp: 'Y', target: 'shopping_prod', target_code: 'multi_prod_excel', type: 'excel,csv' },
			dataType: 'json',
			singleFileUploads: true,
			limitMultiFileUploads: 1,
			//dropZone: $('#prod_image_dropzone2'),
			start: function(e, data){
				// TODO site 에서는 preloader 변수가 아직 없음
				//$preloader.show();
				$prod_multi_add_status.addClass('file-loading');
			},
			progress: function(e, data){
				// Calculate the completion percentage of the upload
				var progress = parseInt(data.loaded / data.total * 100, 10);
				if(progress == 100){
					//	data.context.removeClass('working');
				}
			},
			done: function(e, data){
				$.each(data.result.files, function(e, tmp){
					if(tmp.error == null){
						//$('#prod_image_dropzone').hide();
						$.ajax({
							type : 'POST',
							data : {'excel_file_code' : tmp.code},
							url : ('/admin/ajax/shop/run_prod_batch.cm'),
							dataType : 'json',
							success : function(res){
								$prod_multi_add_status.removeClass('file-loading');
								if(res.msg=='SUCCESS'){
									$prod_multi_add_status_msg.addClass('alert-success');
									$prod_multi_add_status_msg.removeClass('alert-danger');
									var msg = getLocalizeString("설명_n개새상품m개이미지등록완료", [res.success_cnt, res.image_cnt], "%1개의 새로운 상품과 %2개의 이미지 등록이 완료되었습니다.<br/>닫기를 누르면 자동으로 새로고침되어 상품 확인이 가능합니다.");
									$prod_multi_add_status_msg.html(msg).show();
									upload_complete=true;
								}else if(res.msg=='EXCEL_ERROR'){
									$prod_multi_add_status_msg.removeClass('alert-success');
									$prod_multi_add_status_msg.addClass('alert-danger');
									var msg = getLocalizeString("설명_엑셀등록실패", "", "엑셀 등록을 실패하였습니다. 오류 내역을 수정하시고 다시 업로드 해주세요.<br/>CSV 업로드인 경우 UTF-8 형식만 지원합니다.");
									if (res.error_list){
										msg += '<div style="padding-top: 20px;">';
										msg += getLocalizeString("설명_오류상품목록총n개",res.error_list.length ,"<strong>오류 상품 목록 (총 %1개)</strong>");
										msg += '<ul>';
										for(var i = 0; i < res.error_list.length; i++){
											msg += '<li><span class="text-gray line">' + getLocalizeString("설명_n1행_n2열", [res.error_list[i].row_index, res.error_list[i].cell_char], "%1행 %2열") + ' </span><span>' + res.error_list[i].error_msg + '</span></li>';
											if (i>10) break;	//최대 10개만 뿌림
										}
										msg += '</ul></div>';
									}
									$prod_multi_add_status_msg.html(msg).show();
								}else{
									$prod_multi_add_status_msg.removeClass('alert-success');
									$prod_multi_add_status_msg.addClass('alert-danger');
									$prod_multi_add_status_msg.html(res.msg).show();
								}
							}
						});
					}else{
						alert(tmp.error);
					}
				});
			},
			fail: function(e, data){
				$prod_multi_add_status.removeClass('file-loading');
				alert(getLocalizeString("설명_업로드에실패하였습니다", "", "업로드에 실패 하였습니다."));
			}
		});

	};
	return{
		init: function(){
			init();
		},
		check_upload_complete: function(){
			return upload_complete;
		}
	}
}();


var SHOP_REVIEW_MULTI_ADD = function(){
	var $form;
	var images = [];
	var $prod_multi_add_status;
	var $prod_multi_add_status_msg;
	var upload_complete = false;
	var init = function(){
		$form = $('#prod_multi_add');
		$prod_multi_add_status = $('#prod_multi_add_status');
		$prod_multi_add_status_msg = $('#prod_multi_add_status_msg');
		$('#prod_multi_add_image_upload').fileupload({
			url: '/admin/ajax/upload_file_mongo.cm',
			formData: {temp: 'Y', target: 'shopping_review', target_code: 'multi_review_img', type: 'image', overwrite:'Y', upload_count:'Y'},
			dataType: 'json',
			singleFileUploads: false,
			limitMultiFileUploads: 300,
			//dropZone: $('#prod_image_dropzone2'),
			start: function(e, data){
				// TODO site 에서는 preloader 변수가 아직 없음
				//$preloader.show();
				$prod_multi_add_status.addClass('img-loading');
			},
			progress: function(e, data){
				// Calculate the completion percentage of the upload
				var progress = parseInt(data.loaded / data.total * 100, 10);
				if(progress == 100){
					//	data.context.removeClass('working');
				}
			},
			done: function(e, data){
				$prod_multi_add_status.removeClass('img-loading');
				$.each(data.result.files, function(e, tmp){
					if(tmp.error == null){
						//$('#prod_image_dropzone').hide();
						images.push(tmp.code);
						$prod_multi_add_status_msg.addClass('alert-success');
						$prod_multi_add_status_msg.removeClass('alert-danger');
						var msg = getLocalizeString("설명_구매평일괄이미지업로드n개완료", data.result.upload_count, "이미지 전송 %1개 완료. 이미지를 더 업로드하거나<br>엑셀, CSV 파일을 업로드 할 수 있습니다.<a href=\"/admin/ajax/shop/download_prod_batch_sample.cm\" class=\"text-primary\"> 샘플 파일 다운로드</a>");
						$prod_multi_add_status_msg.html(msg).show();
					}else{
						alert(tmp.error);
					}
				});
			},
			fail: function(e, data){
				$prod_multi_add_status.removeClass('img-loading');
				alert(getLocalizeString("설명_업로드에실패하였습니다", "", "업로드에 실패 하였습니다."));
			}
		});
		$('#prod_multi_add_upload').fileupload({
			url: '/admin/ajax/upload_excel_file_mongo.cm',
			formData: {temp: 'Y', target: 'shopping_review', target_code: 'multi_review_excel', type: 'excel,csv' },
			dataType: 'json',
			singleFileUploads: true,
			limitMultiFileUploads: 1,
			//dropZone: $('#prod_image_dropzone2'),
			start: function(e, data){
				// TODO site 에서는 preloader 변수가 아직 없음
				//$preloader.show();
				$prod_multi_add_status.addClass('file-loading');
			},
			progress: function(e, data){
				// Calculate the completion percentage of the upload
				var progress = parseInt(data.loaded / data.total * 100, 10);
				if(progress == 100){
					//	data.context.removeClass('working');
				}
			},
			done: function(e, data){
				$.each(data.result.files, function(e, tmp){
					if(tmp.error == null){
						//$('#prod_image_dropzone').hide();
						$.ajax({
							type : 'POST',
							data : {'excel_file_code' : tmp.code},
							url : ('/admin/ajax/shop/run_review_batch.cm'),
							dataType : 'json',
							success : function(res){
								$prod_multi_add_status.removeClass('file-loading');
								if(res.msg=='SUCCESS'){
									$prod_multi_add_status_msg.addClass('alert-success');
									$prod_multi_add_status_msg.removeClass('alert-danger');
									var msg = getLocalizeString("설명_n개리뷰m개이미지등록완료", [res.success_cnt, res.image_cnt], "%1개의 새로운 구매평과 %2개의 이미지 등록이 완료되었습니다.<br/>닫기를 누르면 자동으로 새로고침되어 상품 확인이 가능합니다.");
									$prod_multi_add_status_msg.html(msg).show();
									upload_complete=true;
								}else if(res.msg=='EXCEL_ERROR'){
									$prod_multi_add_status_msg.removeClass('alert-success');
									$prod_multi_add_status_msg.addClass('alert-danger');
									var msg = getLocalizeString("설명_엑셀등록실패", "", "엑셀 등록을 실패하였습니다. 오류 내역을 수정하시고 다시 업로드 해주세요.<br/>CSV 업로드인 경우 UTF-8 형식만 지원합니다.");
									if (res.error_list){
										msg += '<div style="padding-top: 20px;">';
										msg += '<strong>' + getLocalizeString("설명_오류상품목록총n개", res.error_list.length, "<strong>오류 상품 목록 (총 %1개)</strong>") + '</strong>';
										msg += '<ul>';
										for(var i = 0; i < res.error_list.length; i++){
											msg += '<li><span class="text-gray line">' + getLocalizeString("설명_n1행_n2열", [res.error_list[i].row_index, res.error_list[i].cell_char], "%1행 %2열") + ' </span><span>' + res.error_list[i].error_msg + '</span></li>';
											if (i>10) break;	//최대 10개만 뿌림
										}
										msg += '</ul></div>';
									}
									$prod_multi_add_status_msg.html(msg).show();
								}else{
									$prod_multi_add_status_msg.removeClass('alert-success');
									$prod_multi_add_status_msg.addClass('alert-danger');
									$prod_multi_add_status_msg.html(res.msg).show();
								}
							}
						});
					}else{
						alert(tmp.error);
					}
				});
			},
			fail: function(e, data){
				$prod_multi_add_status.removeClass('file-loading');
				alert(getLocalizeString("설명_업로드에실패하였습니다", "", "업로드에 실패 하였습니다."));
			}
		});

	};
	return{
		init: function(){
			init();
		},
		check_upload_complete: function(){
			return upload_complete;
		}
	}
}();

var CONFIG_FIND_DESIGNER = function(){
	var $form;
	var header_ctl;

	var init = function(){
		$form = $('#dof');
		header_ctl = new HEADER_CONTROL();
		header_ctl.init();
		header_ctl.addBtn('save',function(){
			submit();
		});
		createEvent();
	};

	var submit = function(){
		var data = $form.serializeObject();
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/config/find_designer/find_designer.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					alert(res.msg);
					header_ctl.save();
					location.reload();
				}else
					alert(res.msg);
			}
		});
	};

	var createEvent = function(){
		$form.find('input, textarea').off('change, keyup').on('change, keyup, blur',function(){
			header_ctl.change();
		});
	};

	var changeResellerMembershipSiteStatus = function(type){
		switch(type){
			case 'approval_cancel':
				var confirm_msg =
					getLocalizeString("설명_신청을취소하시겠습니까", "", "신청을 취소하시겠습니까? 취소 후 동일한 리셀러 또는 \n다른 리셀러에게 재신청 가능하며 즉시 처리됩니다.");
				break;
			case 'revocation_wait':
				var confirm_msg =
					getLocalizeString("설명_디자이너리셀러와계약을해지할까요", "", "해당 디자이너/리셀러와 계약을 해지할까요? 확인을 누르시면 해지요청이 전달되며 담당 디자이너/리셀러가 해지승인을 해야 해지완료 처리됩니다.\n\n담당 디자이너/리셀러가 불합리한 이유로 해지요청을 거부할 경우 고객지원에 문의 주시기 바랍니다.");
				break;
			case 'revocation_cancel':
				var confirm_msg =
					getLocalizeString("설명_해지요청을철회하시겠습니까", "", "해지 요청을 철회하시겠습니까? 확인 클릭시 즉시 해지요청이 철회됩니다.");
				break;
			case 'revocation_complete':
				var confirm_msg =
					getLocalizeString("설명_추천인등록을해지하시겠습니까", "", "추천인 등록을 해지하시겠습니까? 해지는 즉시 처리되며 비용 발생은 없습니다.");
				break;
		}
		if(confirm_msg !== undefined){
			if(confirm(confirm_msg)){
				$.ajax({
					type : 'POST',
					data : {type : type},
					url : ('/admin/ajax/config/find_designer/change_reseller_membership_site_status.cm'),
					dataType : 'json',
					async : false,
					cache : false,
					success : function(res){
						if(res.msg == 'SUCCESS'){
							header_ctl.save();
							location.reload();
						}else
							alert(res.msg);
					}
				});
			}
		}
	};

	var openRevocationRefuseReason = function(idx){
		$.ajax({
			type : 'POST',
			data : {idx : idx},
			url : ('/admin/ajax/config/find_designer/open_revocation_refuse_reason.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				if(html !== ''){
					$.cocoaDialog.open({type:'admin',custom_popup:html});
				}else{
					alert("ERROR");
				}
			}
		});
	};

	var syncDirect = function(referral_code){
		$.ajax({
			type: 'POST',
			data: {referral_code : referral_code},
			url: ('/admin/ajax/config/find_designer/sync_direct.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg === 'SUCCESS'){
					alert(res.msg);
					header_ctl.save();
					location.reload();
				}else
					alert(res.msg);
			}
		});
	};

	var giveAdminPermission = function(){
		var confirm_msg = getLocalizeString("설명_담당리셀러에게관리권한을부여하시겠습니까", "", "담당 리셀러에게 관리권한을 부여하시겠습니까? 관리권한을 부여\n하게 되면, 사이트의 디자인과 각종 설정을 제어할 수 있는 모든 권한이 부\n여됩니다.");
		if(confirm_msg !== undefined){
			if(confirm(confirm_msg)){
				$.ajax({
					type: 'POST',
					data: '',
					url: ('/admin/ajax/config/find_designer/give_admin_permission.cm'),
					dataType: 'json',
					async: false,
					cache: false,
					success: function (res) {
						if(res.msg === 'SUCCESS'){
							alert(res.msg);
							header_ctl.save();
							location.reload();
						}else
							alert(res.msg);
					}
				});
			}
		}
	};

	return {
		'init' : function(){
			init();
		},
		'changeResellerMembershipSiteStatus' : function(type){
			changeResellerMembershipSiteStatus(type);
		},
		'openRevocationRefuseReason' : function(idx){
			openRevocationRefuseReason(idx);
		},
		'syncDirect' : function(referral_code){
			syncDirect(referral_code);
		},
		'giveAdminPermission' : function(){
			giveAdminPermission();
		}
	}
}();

var CONFIG_REST = function() {
	var header_ctl;

	var $form;
	var $apiKey;
	var $secretKey;

	var init = function() {
		$form = $('#restForm');
		$apiKey = $('#apiKey');
		$secretKey = $('#secretKey');
	};

	var submit = function() {
		var data = $form.serializeObject();
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/config/save_rest.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					header_ctl.save();
					location.reload();
				}else
					alert(res.msg);
			}
		});
	};

	var makeApiKey = function() {
		if ( confirm(getLocalizeString('타이틀_API키를재생성하시겠습니까', '', 'Rest API 키를 재생성 하시겠습니까?')) ) {
			$.ajax({
				type: 'POST',
				data: '',
				url: ('/admin/ajax/config/rest_make_api_key.cm'),
				dataType: 'json',
				async: false,
				cache: false,
				success: function (res) {
					if(res.msg === 'SUCCESS'){
						$('#apiKey').val(res.key);
						$('#secretKey').val(res.secret);
						if ( header_ctl ) {
							header_ctl.change();
						}
					} else {
						alert(res.msg);
					}
				}
			});
		}
	};

	return {
		init: function() {
			init();
		},
		makeApiKey : function() {
			makeApiKey();
		}
	};
}();


var CONFIG_ACE = function(){
	var $form;
	var $login_form;

	var init = function(){
		$form = $('#dof');
	};

	var loginInit =function(){
		$login_form = $('#login_dof');
	};


	var openAceForm = function(is_complete){
		$.ajax({
			type: 'POST',
			data: {'is_complete' : is_complete},
			url: ('/admin/ajax/dialog/open_ace_form.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					$.cocoaDialog.open({type:'ace_form', custom_popup:res.html});
				}else{
					alert(res.msg);
				}
			}
		});
	};


	var submit = function(){
		var data = $form.serializeObject();
		$.ajax({
			type : 'POST',
			data : data,
			url : ('/admin/ajax/config/ace_counter_proc.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					if(res.is_complete == 'Y'){
						alert(getLocalizeString("설명_회원가입이완료되었습니다관리페이지버튼을통해", "", "회원가입이 완료되었습니다.\n관리페이지 버튼을 통해 관리자 페이지로 이동할 수 있습니다."));
						window.location.href = '/admin/marketing/ace_counter';
					}else{
						alert(getLocalizeString("설명_회원가입이완료되었습니다모바일버전추가신청", "", "회원가입이 완료되었습니다.\n모바일 버전 추가 신청을 해주셔야 합니다."));
						window.location.href = '/admin/marketing/ace_counter?is_complete=N';
					}
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var requestLoginApi = function(){
		var data = $login_form.serializeObject();
		$.ajax({
			type : 'POST',
			data : data,
			url : ('/admin/ajax/config/ace_counter_log.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					$login_form.submit();
				}else
					alert(res.msg);
			}
		});
	};

	return{
		'init': function(){
			init();
		},
		'loginInit' : function(){
			loginInit();
		},
		'openAceForm': function(is_complete){
			openAceForm(is_complete);
		},
		'submit' : function(){
			submit();
		},
		'login' : function(){
			requestLoginApi();
		}
	}
}();
