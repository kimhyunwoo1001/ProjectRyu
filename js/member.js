var MEMBER_MANAGE = function(){
	var $form;
	var $member_agree_wrap;
	var header_ctl;
	var $fileupload_profile_img, $profile_img, $photo_tmp_idx;
	var member_code;
	var passwd_html_show_click = false;
	var $admin_group_list_wrap;
	var tw_address = {};
	var init = function(type, code){
		member_code = code;
		$form = $('#dof');
		$member_agree_wrap = $('#member_agree_wrap');
		$fileupload_profile_img = $('#fileupload_profile_img');
		$profile_img = $('#profile_img');
		$photo_tmp_idx = $('#photo_tmp_idx');

		header_ctl = new HEADER_CONTROL();
		header_ctl.init();
		if(type == 'add'){
			header_ctl.addBtn('cancel', function(){
				history.go(-1);
			});
			header_ctl.addBtn('add', function(){
				submit('add');
			});
		}else{
			header_ctl.addBtn('delete', function(){
				adminMember.openDeleteMember(JSON.stringify([{'member_code': member_code, 'delete_old_auth_log': false}]));
			});
			header_ctl.addBtn('save', function(){
				submit('save');
			});
		}
		createEvent();
		setUpload();

		$admin_group_list_wrap = $('._admin_group_list_wrap');
		if($admin_group_list_wrap.find('input[type=checkbox]:checked').length > 0){
			$('._manager_info_wrap').show();
		}else{
			$('._manager_info_wrap').hide();
		}
		$admin_group_list_wrap.find('input[type=checkbox]').off('click').on('click', function(){
			if($admin_group_list_wrap.find('input[type=checkbox]:checked').length > 0){
				$('._manager_info_wrap').show();
			}else{
				$('._manager_info_wrap').hide();
			}
			header_ctl.change();
		});

	};

	var changeCountry = function(country, code){
		$form.find("._addr_form_wrap").hide();
		if(country.trim() === ""){
			return false;
		}
		$.ajax({
			"url" : "/admin/ajax/member/get_site_address_format.cm",
			"data" : {"country_code" : country, "unit_code" : code},
			"type" : "POST",
			"dataType" : "json",
			"success" : function(res){
				var format = res["format"];
				switch(format){
					case "KR":
						$form.find("#kr_addr_form_wrap").show();
						break;
					case "TW":
						$form.find("#tw_addr_form_wrap").show();
						break;
					case "VN":
						$form.find('#vn_addr_form_wrap').show();
						break;
					case "HK":
						$form.find('#hk_addr_form_wrap').show();
						break;
					case "3":
						$form.find("#jp_addr_form_wrap").show();
						break;
					case "5":
						$form.find("#en_addr_form_wrap").show();
						break;
				}
			}
		});
	};

	var checkSubscribePeriodChange = function(){
		var subscribe_check = false;
		$form.find('._subscribe_left_date').each(function(){
			if($(this).prop('disabled')) return false;
			if($(this).val() != $(this).attr('placeholder')){
				subscribe_check = true;
				return false;
			}
		});
		return (!subscribe_check || confirm(getLocalizeString('설명_회원그룹이용권기간변경안내', '', "회원그룹 이용권 기간에 변경된 데이터가 있습니다.\n저장하시겠습니까?")));
	};

	var submit = function(type){
		var data = $form.serializeObject();
		data.member_agree_info = $member_agree_wrap.serializeObject();
		if(!checkSubscribePeriodChange()) return false;
		$.ajax({
			type : 'POST',
			data : data,
			url : ('/admin/ajax/member/add.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					header_ctl.save();
					if(res.admin_group_fail === 'Y'){
						alert(getLocalizeString('설명_운영진설정권한이없어운영진그룹은설정되지않았습니다', '', '운영진 설정 권한이 없어 운영진 그룹은 설정되지 않았습니다.'));
					}
					if(type == 'add') history.go(-1);
					else location.reload();
				}else
					alert(res.msg);
			}
		});
	};

	var createEvent = function(){
		$form.find('input, textarea, select').off('change, keyup').on('change, keyup, blur', function(){
			header_ctl.change();
		});
		$form.find('input[type=checkbox],input[type=radio],input[type=file],._file_remove').off('click').on('click', function(){
			if($(this).attr('name') == 'default_group[]' && $(this).data('subscribe') == 'Y'){
				var group_idx = $(this).val();
				var is_checked = $(this).prop('checked');
				if(!is_checked && !confirm(getLocalizeString('설명_회원그룹이용권구매로지정된그룹제거시안내', '', "이 그룹은 회원그룹 이용권 구매로 자동 지정된 그룹입니다. \n그룹지정을 해제하고 나중에 다시 그룹을 지정하더라도 자동 그룹 해제일에 자동 해제가 되지 않게 됩니다.\n\n그룹 지정을 해제하시겠습니까?"))){
					return false;
				}

				// 이용권 해제 예정이므로 기간 수정못하게 disabled 처리
				$form.find('._subscribe_left_date').each(function(){
					if(group_idx == $(this).data('group_idx')){
						$(this).prop('disabled', !is_checked);
					}
				});
			}
			header_ctl.change();
		});
		$form.find('select').change(function(){
			header_ctl.change();
		});

		$form.find('._subscribe_left_date').on('keypress', function(e){
			$(this).val($(this).val().replace(/[^0-9]/g, ''));
			return (e.keyCode >= 48 && e.keyCode <= 57);
		});
		$form.find('._subscribe_left_date').on('keyup', function(e){
			$(this).val($(this).val().replace(/[^0-9]/g, ''));
			return (e.keyCode >= 48 && e.keyCode <= 57);
		});

		$member_agree_wrap.find('input[type=checkbox]').off('click').on('click', function(){
			header_ctl.change();
		});


		var $admin_memo_chars_title = $("#admin_memo_chars_title");
		var $admin_memo = $("#admin_memo");
		var $btn_admin_memo = $("#btn_admin_memo");
		if($admin_memo.length > 0){
			autosize($admin_memo);
			var pre_admin_memo = $admin_memo.val();
			$admin_memo_chars_title.html(getByteLength(pre_admin_memo) + '/500');
			$admin_memo.keyup(function(e){
				var content = $(this).val();
				$admin_memo_chars_title.html(getByteLength(content) + '/500');
			});
		}
		$btn_admin_memo.click(function(){
			var memo = $admin_memo.val();
			if(pre_admin_memo !== memo){
				pre_admin_memo = memo;
				var code = $form.find("input[name='code']").val();
				if(code !== ""){
					adminMember.updateAdminMemo(code, memo, function(res){
						if(res.msg !== 'SUCCESS') alert(res.msg);
						else location.reload();
					});
				}

			}
		});


		$("#create_recommend_code_btn").click(function(){
			var is_create_recommend_code = false;
			if(!is_create_recommend_code){
				var member_code = $(this).data('member-code');

				$.ajax({
					type : 'POST',
					data : {member_code : member_code},
					url : ('/admin/ajax/member/create_recommend_code.cm'),
					dataType : 'json',
					async : true,
					cache : false,
					success : function(res){
						is_create_recommend_code = true;
						if(res.msg === 'SUCCESS'){
							$('._recommend_code_wrap').html(res.recommend_code);
							$('._recommend_tmp_input').val(res.recommend_code);
							$('._recommend_create_set').addClass('hide');
							$('._recommend_set').removeClass('hide');
						}else{
							alert(res.msg)
						}
					}
				});
			}
		});


	};

	var setUpload = function(){
		$fileupload_profile_img.setUploadImage({
			url : '/admin/ajax/upload_image.cm',
			formData : {temp : 'Y', target : 'member'}
		}, function(res, data){
			$.each(data, function(e, tmp){
				if(tmp.tmp_idx > 0){
					header_ctl.change();
				}
				if(tmp.url != ''){
					$profile_img.attr('src', CDN_UPLOAD_URL + tmp.url);
					$photo_tmp_idx.val(tmp.tmp_idx);
				}else{
					alert(tmp.error);
				}
			})

		});
	};

	var changeJoinTypeForm = function(){
		var join_type_code = $form.find('select[name=join_type_select]').val();
		$form.find('input[name=join_type_code]').val(join_type_code);
		$.ajax({
			type : 'POST',
			data : {join_type_code : join_type_code},
			url : ('/admin/ajax/member/change_join_type_form.cm'),
			dataType : 'json',
			async : true,
			cache : false,
			success : function(res){
				if(res.msg === 'SUCCESS'){
					$form.find('._type_form_wrap').html(res.html);
					setDaumZipcode();
					changeCountry('', UNIT_CODE);
				}else{
					alert(res.msg)
				}
			}
		});
	};

	var setDaumZipcode = function(){
		var join_addr = new ZIPCODE_DAUM();
		var address = "";
		var splitAddress ="";
		var building = "";
		var street= "";
		var city= "";
		var state= "";

		join_addr.init({
			'addr_container' : $('#join_addr_container'),
			'addr_pop' : $('#join_addr_container ._add_list'),
			'post_code' : $('#join_addr_postcode'),
			'addr' : $('#join_addr'),
			'onShow' : function(){
				$('#join_addr_container').css({'top':-50+'px'});
				$('#join_addr_detail').parent().css({'top':-50+'px'});
			},
			'onComplete' : function(data){
				$('#join_addr_detail').focus();
				address = data.addressEnglish;
				if(address == 'undefined') address = data.jibunAddressEnglish;
				splitAddress= address.split(',');
				if(splitAddress.length > 5){
					building = splitAddress[0];
					street = splitAddress[1];
					city = splitAddress[2];
					state = splitAddress[3] + " " + splitAddress[4];
				} else {
					building = splitAddress[0];
					street = splitAddress[1];
					city = splitAddress[2];
					state = splitAddress[3];
				}
				$("input[name='addr_building']").val(building);
				$("input[name='addr_street']").val(street);
				$("input[name='addr_city']").val(city);
				$("input[name='addr_state']").val(state);
				$("input[name='addr_zipcode']").val(data.zonecode);
			},
			'onClose' : function(){
				$('#join_addr_detail').parent().css({'top':0+'px'});
			},
			'height' : '470'
		});
	};

	return {
		init : function(type, code){
			init(type, code);
		},
		'changeCountry' : function(country, code){
			changeCountry(country, code);
		},
		'showPasswdHtml' : function(){
			if(!passwd_html_show_click){
				passwd_html_show_click = true;
				var placeholder_text = getLocalizeString('설명_비밀번호', '', '비밀번호');
				if(member_code !== ''){
					placeholder_text = getLocalizeString('설명_비밀번호변경시에만입력', '', '비밀번호 변경시에만 입력해주세요');
				}
				var passwd_html = "<input type='password'  autocomplete='off' name='passwd' id='user_password' class='form-control' placeholder='" + placeholder_text + "'>";
				$('#password_wrap .col-md-9').append(passwd_html);

				$form.find('input[name="passwd"]').off('change, keyup').on('change, keyup, blur', function(){
					header_ctl.change();
				});
			}
		},

		'changeJoinTypeForm' : function(){
			changeJoinTypeForm();
		},
		'setDaumZipcode' : function(){
			setDaumZipcode();
		}
	}
}();

var MEMBER_GROUP = function(){
	var modal_type = 'list';
	var current_member_code, base_url, managers_setting_permission;
	var $group_list, $drop_group_list, $drop_shopping_group_list, $check_drop_group_list,
		$check_drop_shopping_group_list, $no_group_cnt;
	var group_list_item_tmp, drop_group_list_tmp;

	var group_item_html_class = '_group_item';
	var group_list_data = new DATA();

	var addGroupList = function(data){
		data.idx = parseInt(data.idx);
		group_list_data.add(data.code, data);
		addGroupListHtml(data);
	};

	var updateGroupList = function(code, data){
		group_list_data.add(code, data);
		resetGroupListHtml();
	};

	var modifyGroupList = function(type, data){
		if(type == 'delete'){
			group_list_data.remove(data.code);
		}else{
			if(type == 'add'){
				data.idx = parseInt(data.idx);
			}
			group_list_data.add(data.code, data);
		}
	};

	var addGroupListHtml = function(data){
		var concede_script = '';
		var group_type = data['group_type'];
		var edit_script = "adminMember.openGroupForm('" + data.idx + "');";
		var li_id = "group_item_" + data['code'];
		switch(data.group_type){
			case 'shopping':
			case 'activity':
				concede_script = "MEMBER_GROUP.concedeChangeSpecialGroup('" + group_type + "',$(this),'" + data.idx + "')";
				if(data['code'] == group_type){
					edit_script = "CONFIG_SHOPPING_GROUP.openShoppingGroupDefaultForm();";
					li_id = group_type + "_group_default";
				}
				break;
			case 'admin':
				if(managers_setting_permission){
					concede_script = "MEMBER_GROUP.concedeToggleGroup($(this),'" + data.idx + "')";
				}else{
					concede_script = "alert(getLocalizeString('설명_운영진그룹설정권한이없습니다', '', '운영진 그룹 설정 권한이 없습니다.'))";
				}
				break;
			case 'member':
				concede_script = "MEMBER_GROUP.concedeToggleGroup($(this),'" + data.idx + "')";
				break;
		}


		var tmp_data = {
			"id" : li_id,
			"class" : (data.is_default ? 'default_' : '') + group_type + ' ' + (current_member_code == data.code ? 'active checked ' + group_item_html_class : group_item_html_class),
			"code" : data.code,
			"href" : base_url + "member_group=" + data.code,
			"title" : group_type === 'member' ? data.title : data['group_type_name'] + ' - ' + data.title,
			"group_type" : data['group_type_name'],
			"cnt" : data.member_cnt > 0 ? parseInt(data.member_cnt) : '',
			"edit_script" : edit_script + "return false;"
		};

		var $group_list_html = $(getTemplateConvert(group_list_item_tmp, tmp_data)).data(data);
		appendGroupHtml($group_list, $group_list_html, group_type, data.is_default, true);


		var $drop_list = (data['group_type'] == 'shopping') ? $drop_shopping_group_list : $drop_group_list;
		$drop_list.each(function(){
			var group_data = $(this).data('groups');
			var drop_tmp_data = {
				"class" : (data.is_default ? 'default_' : '') + group_type + ' ' + ($.inArray(data.idx, group_data) !== -1 ? 'active checked ' + group_item_html_class : group_item_html_class),
				"idx" : data.idx,
				"concede_script" : concede_script
			};

			drop_tmp_data = $.extend(tmp_data, drop_tmp_data);
			var $drop_group_list_html = $(getTemplateConvert(drop_group_list_tmp, drop_tmp_data)).data(data);
			appendGroupHtml($(this), $drop_group_list_html, group_type, data.is_default, true);
		});


		var $check_drop_list = (data['group_type'] == 'shopping') ? $check_drop_shopping_group_list : $check_drop_group_list;
		var check_group = $check_drop_list.data('groups');
		var check_drop_tmp_data = {
			"class" : (data.is_default ? 'default_' : '') + group_type + ' ' + ($.inArray(data.idx, check_group) !== -1 ? 'active checked ' + group_item_html_class : group_item_html_class),
			"idx" : data.idx,
			"concede_script" : concede_script
		};
		check_drop_tmp_data = $.extend(tmp_data, check_drop_tmp_data);
		var $check_drop_group_list_html = $(getTemplateConvert(drop_group_list_tmp, check_drop_tmp_data)).data(data);
		appendGroupHtml($check_drop_list, $check_drop_group_list_html, group_type, data.is_default, true);

	};

	// 관리자페이지 - 그룹 HTML 추가할 위치 지정
	var appendGroupHtml = function($obj, $html, _group_type, is_default, use_divider ){
		var group_type = (is_default ? 'default_' : '') + _group_type;
		use_divider = (use_divider === true);
		var $divider = '<li class="divider ' + group_item_html_class + '"></li>';
		if($obj.find('.' + group_type).length === 0){
			var next_element = [];
			switch(group_type){
				case 'default_member' :
					next_element.push('.member');
					break;
				case 'member':
					next_element.push('.admin');
					break;
				case 'admin':
					next_element.push('.shopping');
					break;
				case 'shopping':
					break;
			}
			next_element = next_element.length > 0 ? next_element.join(',') : '';
			var is_first = ($obj.find('.' + group_item_html_class).length === 0);

			if(next_element === '' || $obj.find(next_element).length === 0){
				if(use_divider && !is_first) $obj.append($divider);
				$obj.append($html);
			}else{
				$obj.find(next_element).first().before($html);
				if(use_divider) $obj.find(next_element).first().before($divider);
			}
		}else{
			$obj.find('.' + group_type + ':last').after($html);
		}
	};

	var resetGroupListHtml = function(){
		$('.' + group_item_html_class).remove();
		$.each(group_list_data.data, function(code, data){
			addGroupListHtml(data);
		});
	};

	var init = function(code, url, permission, type){
		current_member_code = code;
		base_url = url;
		managers_setting_permission = permission;
		$group_list = $('#group_list');
		$no_group_cnt = $('._no_group_cnt');
		modal_type = type;
		group_list_item_tmp = '<li class="{class}" id="{id}"><a href="{href}"><span id="group_item_title_{code}">{title}</span> <small class="margin-left-lg text-bold opacity-75">{cnt}</small><button onclick="{edit_script}" class="pull-right btn btn-flat no-padding hover-visible"><i class="zmdi zmdi-settings"></i></button></a></li>';
		drop_group_list_tmp = '<li class="{class}"><a href="javascript:;" data-idx="{idx}" onclick="{concede_script}">{title}</a></li>';

		$drop_group_list = $('._drop_group_list');
		$drop_shopping_group_list = $('._drop_shopping_group_list');

		$drop_group_list.each(function(){
			// 기본 그룹
			var _new_d = [];
			$.each($(this).data('groups').toString().split(','), function(e, v){
				v = v == "" ? 0 : parseInt(v);
				if(v > 0)
					_new_d.push(v);
			});
			$(this).data('groups', _new_d);

			// 이용권 그룹
			_new_d = [];
			$.each($(this).data('subscribe_groups').toString().split(','), function(e, v){
				v = v == "" ? 0 : parseInt(v);
				if(v > 0)
					_new_d.push(v);
			});
			$(this).data('subscribe_groups', _new_d);
		});


		$drop_shopping_group_list.each(function(){
			var member_data = "" + $(this).data('groups');
			member_data = member_data.split(',');
			var _new_d = [];
			$.each(member_data, function(e, v){
				v = v == "" ? 0 : parseInt(v);
				_new_d.push(v);
			});
			$(this).data('groups', _new_d);
		});

		$check_drop_group_list = $('._check_drop_group_list');
		$check_drop_group_list.data('member', []);
		$check_drop_group_list.data('groups', []);

		$check_drop_shopping_group_list = $('._check_drop_shopping_group_list');
		$check_drop_shopping_group_list.data('member', []);
		$check_drop_shopping_group_list.data('groups', []);
	};

	var openGroupForm = function(idx, group_type){
		$.ajax({
			type : 'POST',
			data : {'idx' : idx, 'type' : modal_type, 'group_type' : group_type},
			url : ('/admin/ajax/config/membership/group_form.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(result){
				if(result.msg == 'SUCCESS'){
					$.cocoaDialog.open({type : 'admin_group_form', custom_popup : result.html, width : 550});
				}else{
					alert(result.msg);
				}
			}
		});
	};

	var concedeChangeSpecialGroup = function(type, obj, idx){
		var $list = obj.closest('._drop_shopping_group_list, ._check_drop_shopping_group_list');
		var member_idx = $list.data('member');

		var _idx = -1;

		if(!$.isArray(member_idx)){
			if($list.find('.' + type + '.active.checked').length == 0) return false;
			_idx = $list.find('.' + type + '.active.checked').data('idx');
		}

		if(idx != _idx){
			idx = parseInt(idx);

			var old_data = {};
			$.ajax({
				"type" : "POST",
				"data" : {"group_type" : type, "member_idx" : member_idx, "new_group_code" : idx},
				"url" : "/admin/ajax/member/group_concede_proc.cm",
				"dataType" : "json",
				"async" : true,
				"cache" : false,
				"success" : function(result){
					if(result.msg == 'SUCCESS'){
						var new_data = group_list_data.get(obj.parent().data('code'));
						var _group = new_data['title'];

						if($.isArray(member_idx)){
							$.each(member_idx, function(e, v){
								$('._drop_shopping_group_btn_' + v).html(_group);
								$('._drop_shopping_group_list_' + v).data('groups', [idx]);

								old_data = group_list_data.get($('._drop_shopping_group_list_' + v).find('.active.checked').data('code'));
								old_data['member_cnt'] -= 1;
								new_data['member_cnt'] = new_data['member_cnt'] == '' ? 0 : new_data['member_cnt'];
								new_data['member_cnt'] += 1;

							});
						}else{
							$('._drop_shopping_group_btn_' + member_idx).html(_group);
							$('._drop_shopping_group_list_' + member_idx).data('groups', [idx]);

							old_data = group_list_data.get($('._drop_shopping_group_list_' + member_idx).find('.active.checked').data('code'));
							old_data['member_cnt'] -= 1;
							new_data['member_cnt'] = new_data['member_cnt'] == '' ? 0 : new_data['member_cnt'];
							new_data['member_cnt'] += 1;
						}

						resetGroupListHtml();
					}else{
						alert(result.msg);
					}

				}
			});

			$list.data('groups', [idx]);
		}

	};

	var concedeToggleGroup = function(obj, idx){
		idx = parseInt(idx);
		var $list = obj.closest('._drop_group_list, ._check_drop_group_list');
		var member_item_group_data = $list.data('groups');
		var member_item_subscribe_data = $list.data('subscribe_groups');
		var member_idx = $list.data('member');

		var $item = obj.parent();
		var item_data = $item.data();
		var _old_data = group_list_data.get(item_data.code);

		// 다중 선택 시
		if($.isArray(member_idx)){

			// 변경될 데이터 만들어 주기
			if($.inArray(idx, member_item_group_data) !== -1){ //제거
				member_item_group_data = deleteArrayValue(member_item_group_data, idx);
			}else{ //추가
				member_item_group_data.push(idx);
			}

			// 회원그룹이용권 구매 회원이 포함되어있는지 체크
			var subscribe_group_exist_check = 0;
			$.each(member_idx, function(e, v){
				var $drop_list = $('._drop_group_list_' + v);
				var _member_item_subscribe_data = $drop_list.data('subscribe_groups');
				if(_member_item_subscribe_data.length > 0){ // 이용권 구매해서 포함된 회원이 존재 시
					subscribe_group_exist_check++;
				}
			});
			if((subscribe_group_exist_check != 0)
				&& !confirm(getLocalizeString('설명_회원그룹이용권구매회원포함안내', subscribe_group_exist_check, "해당 그룹에 회원그룹 이용권 구매로 자동 지정된 그룹 사용자가 %1명 이상 포함되어 있습니다. 그룹 지정을 해제하고 나중에 다시 그룹을 지정하더라도 자동 그룹 해제일에 자동 해제가 되지 않게됩니다.\n\n그룹 지정을 해제하시겠습니까?"))){
				return false;
			}
			$list.data('groups', member_item_group_data);

			$.each(member_idx, function(e, v){
				var $drop_list = $('._drop_group_list_' + v);
				var _member_item_group_data = $drop_list.data('groups');
				$.each(member_item_group_data, function(_e, _v){
					if($.inArray(_v, _member_item_group_data) === -1){ //없으면 추가
						_old_data.member_cnt = _old_data.member_cnt == '' ? 0 : _old_data.member_cnt;
						_old_data.member_cnt = 1 + parseInt(_old_data.member_cnt);
					}
				});
				$.each(_member_item_group_data, function(_e, _v){
					if($.inArray(_v, member_item_group_data) === -1){ //없으면 제거
						var __old_data = false;
						$.each(group_list_data.data, function(__e, __v){
							if(__v.idx == _v){
								__old_data = group_list_data.get(__e);
								return false;
							}
						});
						if(__old_data !== false){
							__old_data.member_cnt = parseInt(__old_data.member_cnt) - 1;
						}
					}
				});
				$drop_list.data('groups', member_item_group_data.concat());
				$drop_list.data('subscribe_groups', []);
			});
		}
		// 대상 회원 수 한명
		else{
			if($.inArray(idx, member_item_group_data) !== -1){ //제거
				if($.inArray(idx, member_item_subscribe_data) !== -1){ //제거
					if(!confirm(getLocalizeString('설명_회원그룹이용권구매로지정된그룹제거시안내', '', "이 그룹은 회원그룹 이용권 구매로 자동 지정된 그룹입니다. \n그룹지정을 해제하고 나중에 다시 그룹을 지정하더라도 자동 그룹 해제일에 자동 해제가 되지 않게 됩니다.\n\n그룹 지정을 해제하시겠습니까?"))){
						return false;
					}
					member_item_subscribe_data = deleteArrayValue(member_item_subscribe_data, idx);
					$list.data('subscribe_groups', member_item_subscribe_data);
				}

				member_item_group_data = deleteArrayValue(member_item_group_data, idx);
				$list.data('groups', member_item_group_data);
				_old_data.member_cnt = parseInt(_old_data.member_cnt) - 1;
			}else{ //추가
				member_item_group_data.push(idx);
				$list.data('groups', member_item_group_data);
				_old_data.member_cnt = _old_data.member_cnt == '' ? 0 : _old_data.member_cnt;
				_old_data.member_cnt = 1 + parseInt(_old_data.member_cnt);
			}
		}

		$.ajax({
			type : 'POST',
			data : {"member_idx" : member_idx, "new_group_code" : member_item_group_data},
			url : ('/admin/ajax/member/group_concede_proc.cm'),
			dataType : 'json',
			async : true,
			cache : false,
			success : function(result){
				if(result.msg == 'SUCCESS'){
					var check_member = $check_drop_group_list.data('member');
					checkMember(check_member);
					resetGroupListHtml();

					var main_group_title = '';
					var i = 0;
					if($.isArray(member_idx)){
						$.each(member_idx, function(e, v){
							var main_group_title = '';
							var i = 0;
							var $drop_list = $('._drop_group_list_' + v);
							var _member_item_group_data = $drop_list.data('groups');
							$.each(group_list_data.data, function(code, data){
								data.idx = parseInt(data.idx);
								if($.inArray(data.idx, _member_item_group_data) !== -1){
									if(i == 0)
										main_group_title = data.title;
									i++;
								}
							});
							var _group = '';
							if(i == 0){
								_group = getLocalizeString('설명_그룹없음', '', '그룹없음');
							}else{
								_group = main_group_title + '<span class="text-primary">' + (i > 1 ? "+" + (i - 1) : '') + '</span>';
							}

							calculateNoGroup($drop_list, i);
							$('._drop_group_btn_' + v).html(_group);

						});
					}else{
						$.each(group_list_data.data, function(code, data){
							if($.inArray(data.idx, member_item_group_data) !== -1){
								if(i == 0)
									main_group_title = data.title;
								i++;
							}
						});
						var _group = '';
						if(i == 0){
							_group = getLocalizeString('설명_그룹없음', '', '그룹없음');
						}else{
							_group = main_group_title + '<span class="text-primary">' + (i > 1 ? "+" + (i - 1) : '') + '</span>';
						}

						calculateNoGroup($list, i);

						$('._drop_group_btn_' + member_idx).html(_group);
					}

				}else{
					alert(result.msg);
				}
			}
		});
	};

	var calculateNoGroup = function(obj, cnt){
		var _no_group_cnt = $no_group_cnt.text().trim();
		_no_group_cnt = _no_group_cnt == '' ? 0 : _no_group_cnt;
		_no_group_cnt = parseInt(_no_group_cnt);
		if(cnt == 0){
			if(obj.data('nogroup') == 'N'){
				obj.data('nogroup', 'Y');
				_no_group_cnt = _no_group_cnt + 1;
				$no_group_cnt.text(_no_group_cnt);
			}
		}else{
			if(obj.data('nogroup') == 'Y'){
				obj.data('nogroup', 'N');
				_no_group_cnt = _no_group_cnt - 1;
				$no_group_cnt.text(_no_group_cnt);
			}
		}
	};

	var checkMember = function(idxs){
		var $list = $('._drop_group_list_' + idxs[0]);

		// console.log($list);

		if($list.length > 0){
			var res = $list.data('groups').concat();
			$.each(idxs, function(e, v){
				res = array_intersect(res, $('._drop_group_list_' + v).data('groups').concat());
			});
			var result = [];
			$.each(res, function(e, v){
				v = v == "" ? 0 : parseInt(v);
				if(v > 0)
					result.push(v);
			});
			$check_drop_group_list.data('groups', result);
			$check_drop_group_list.data('member', idxs);
		}

		// 쇼핑등급
		var $shopping_list = $('._drop_shopping_group_list_' + idxs[0]);
		if($shopping_list.length > 0){
			var res = $shopping_list.data('groups').concat();
			$.each(idxs, function(e, v){
				res = array_intersect(res, $('._drop_shopping_group_list_' + v).data('groups').concat());
			});
			var result = [];
			$.each(res, function(e, v){
				v = v == "" ? 0 : parseInt(v);
				result.push(v);
			});
			$check_drop_shopping_group_list.data('member', idxs);
			$check_drop_shopping_group_list.data('groups', result);
		}

		resetGroupListHtml();
	};

	var getGroupList = function(){
		return group_list_data;
	};

	var changeJoinTypeDefaultGroup = function(type_code, group_code){
		$.ajax({
			type : 'POST',
			data : {type_code : type_code, group_code : group_code},
			url : ('/admin/ajax/member/update_join_type_default_group.cm'),
			dataType : 'json',
			async : true,
			cache : false,
			success : function(result){
				if(result.msg !== 'SUCCESS'){
					alert(result.msg);
				}
			}
		});
	};

	return {
		'init' : function(code, base_url, permission, type){
			init(code, base_url, permission, type);
		},
		'getModalType' : function(){
			return modal_type;
		},
		'addGroupList' : function(data){
			addGroupList(data);
		},
		'updateGroupList' : function(code, data){
			updateGroupList(code, data);
		},
		'modifyGroupList' : function(type, data){
			modifyGroupList(type, data);
		},
		'openGroupForm' : function(idx, type){
			openGroupForm(idx, type);
		},
		'concedeChangeSpecialGroup' : function(type, obj, idx){
			concedeChangeSpecialGroup(type, obj, idx);
		},
		'concedeToggleGroup' : function(obj, idx){
			concedeToggleGroup(obj, idx);
		},
		'checkMember' : function(idxs){
			checkMember(idxs);
		},
		'getGroupList' : function(){
			return getGroupList();
		},
		'changeJoinTypeDefaultGroup' : function(type_code, group_code){
			return changeJoinTypeDefaultGroup(type_code, group_code);
		}
	}

}();


var MEMBER_GROUP_SETTING_MODAL = function(){
	var $form, $group_benefit;
	var group_list = {};
	var current_group_type = 'member';
	var current_unit_code = '';

	var init = function(unit_code, code, type){
		$form = $('#groupf');
		$group_benefit = $('#group_benefit_setting');
		setGroupListData(code);

		current_unit_code = unit_code;
		addEvent();

		if(typeof type != 'undefined' && type != ''){
			changeGroupType(type);
		}
	};
	var addEvent = function(){
		$form.find('#group_type').on('change', function(){
			changeGroupType($(this).val());
		});

		// 자동등급 조건 설정
		$form.find('#shopping_auto_grouping_not_used').on('change', function(){
			changeUseAutoGrouping($(this).prop('checked'));
		});

		$form.find('.auto_grouping_flag').on('blur', function(){
			changeFlagAmount($(this));
		});

		// 구매혜택 설정부분
		$form.find('.benefit_type_radio').find(':radio').on('change', function(){
			changeBenefitType();
		});
		$group_benefit.find('.group_benefit select').on('change', function(){
			var is_percent = ($(this).val() == 'percent');
			$(this).parents('.input-group').find('.benefit_maximum').toggle(is_percent);
			$(this).parents('.input-group').find('.benefit_maximum').find('input').prop('disabled', !is_percent);

			// 변경시 혜택 값 초기화
			var $amount = $(this).parents('.input-group').find('._benefit_money_format:nth-child(1)');
			$amount.val(0);
			makeMoneyFormat($amount, !is_percent);
		});

		$group_benefit.find('input[type="text"]').on('blur', function(){
			var v = parseFloat($(this).val());
			if(v === 0) $(this).val(v);
		});

		$form.find('.auto_grouping_flag').each(function(){
			makeMoneyFormat($(this), true);
		});
		$form.find('._benefit_money_format').each(function(){
			var use_format = true;
			if($(this).hasClass('_benefit_amount')){
				use_format = ($(this).parents('.input-group').find('select').val() == 'price');
			}
			makeMoneyFormat($(this), use_format);
		});
	};

	var makeMoneyFormat = function($obj, use_format){
		$obj.unbind('keydown.format keyup.format');
		if(use_format){
			set_money_format($obj, $obj.data('decimal-count'), $obj.data('decimal-char'), $obj.data('thousand-char'));
		}
	};

	// 현재 그룹 데이터 기준 조건 리스트 생성
	var setGroupListData = function(cd){
		var group_list_data = MEMBER_GROUP.getGroupList();
		group_list = {'shopping' : [], 'activity' : []};

		var auto_set_group_list = ['shopping', 'activity'];
		$.each(group_list_data.data, function(code, data){
			if(cd === code){
				current_group_type = data['group_type'];
				return true;
			}
			if(auto_set_group_list.indexOf(data['group_type']) < 0) return true;
			var auto_grouping_data = data['auto_grouping_data'];

			switch(data['group_type']){
				case 'shopping':
					if(data['use_auto_change'] != 'Y') break;
					for(var key in auto_grouping_data){
						if(typeof group_list[data['group_type']][key] == 'undefined'){
							group_list[data['group_type']][key] = [];
						}
						auto_grouping_data[key] = parseFloat(auto_grouping_data[key]);
						group_list[data['group_type']][key].push(auto_grouping_data[key]);
					}
					break;
				case 'activity':
					auto_grouping_data = parseFloat(auto_grouping_data);
					group_list[data['group_type']].push(auto_grouping_data);
					break;
			}
		});
	};

	// 그룹 유형 변경 시
	var changeGroupType = function(type){
		current_group_type = type;
		$form.find('.group_setting').hide();
		$form.find('.group_setting.' + type + '_group_setting').show();
		switch(type){
			case 'member':
			case 'admin':
				//changeBenefitType();
				break;
			case 'shopping':
				changeBenefitType();
				changeUseAutoGrouping($form.find('#shopping_auto_grouping_not_used').prop('checked'));
				break;
			case 'activity':
				$group_benefit.hide();
				break;
		}
	};

	// 쇼핑설정 - 자동 등급 사용 안함
	var changeUseAutoGrouping = function(b){
		$('#auto_grouping_setting').toggle(!b);
	};


	// 자동등급 조건 금액 변경시 on blur 처리
	var changeFlagAmount = function($obj){
		if($obj.length <= 0) return false;

		var v = parseFloat($obj.val());
		v = (isNaN(v)) ? 0 : v;
		$obj.val(v);
		var code = $obj.data('code');

		$form.find('.help_group_flag_setting_' + code).hide();

		if(v < 0){
			$form.find('.help_group_flag_setting_' + $obj.data('code')).html(getLocalizeString('설명_자동등급조건은0보다큰값을입력해야합니다', '', '자동 등급 조건은 0보다 큰 값을 입력해야 합니다.')).show();
			return 'MINUS';
		}else{
			// 이미 등록된 조건인지 체크
			if(typeof group_list[current_group_type] != 'undefined'){
				var auto_grouping_list = group_list[current_group_type];
				if(typeof code != 'undefined' && typeof auto_grouping_list[code] != 'undefined'){
					auto_grouping_list = auto_grouping_list[code];
				}

				if(auto_grouping_list.indexOf(v) > -1){
					$form.find('.help_group_flag_setting_' + code).html(getLocalizeString('설명_다른그룹에서설정한조건과동일한조건은입력할수없습니다', '', '다른 그룹에서 설정한 조건과 동일한 조건은 입력할 수 없습니다.')).show();
					return 'EXIST';
				}
			}
		}

		return true;
	};

	// ( 글로벌 사이트 ) 구매혜택 탭 변경시
	var changeBenefitTarget = function(obj){
		var $obj = $(obj);
		var unit_code = $obj.data('code');
		current_unit_code = unit_code;

		$('#benefit_setting_tab').find('li.active').removeClass('active');
		$obj.parent('li').addClass('active');

		$group_benefit.find('.tab-content').addClass('hidden');
		$group_benefit.find('.tab-content#group_benefit_' + unit_code).removeClass('hidden');
	};

	// 그룹 혜택 변경 시
	var changeBenefitType = function(){
		$group_benefit.show();
		var $group_benefit_obj = $group_benefit.find('#group_benefit_' + current_unit_code);
		$group_benefit_obj.find('.group_benefit').hide();

		var benefit_type = $group_benefit_obj.find(':radio:checked').val();
		switch(benefit_type){
			case 'dc':
			case 'point':
				$group_benefit_obj.find('.group_benefit.benefit_type_' + benefit_type).show();
				break;
			case 'all':
				$group_benefit_obj.find('.group_benefit').show();
				break;
		}
	};

	// 구몌혜택 체크
	var checkBenefit = function(){
		if(current_group_type != 'shopping') return true;	// 쇼핑그룹만 사용함
		if($group_benefit.length <= 0) return true; // 쇼핑 사용 안함 등의 이슈로 혜택이 없을 경우

		var $target;
		var benefit_type = $group_benefit.find(':radio[name=benefit_type]:checked').val();
		switch(benefit_type){
			case 'dc':
			case 'point':
				$target = $group_benefit.find('.group_benefit.benefit_type_' + benefit_type);
				break;
			case 'all':
				$target = $group_benefit.find('.group_benefit');
				break;
		}

		if(typeof $target == 'undefined') return true;

		var benefit_error = false;
		$target.find('input').each(function(){
			if($(this).prop('disabled')) return true;
			var amt = parseFloat($(this).val());
			if(isNaN(amt) || amt <= 0){
				benefit_error = true;
			}
		});
		return !benefit_error;
	};

	// 유효성 검사
	var checkValidateForm = function(){
		if(current_group_type == 'activity' || current_group_type == 'shopping'){
			var check = true;
			var $obj = $form.find('.' + current_group_type + '_group_setting').find('.auto_grouping_flag');
			if($obj.length > 0){
				$obj.each(function(){
					if(check !== true) return true;
					check = changeFlagAmount($(this));
				});
			}
			if(check !== true){
				switch(check){
					case 'MINUS':
						alert(getLocalizeString('설명_자동등급조건은0보다큰값을입력해야합니다', '', '자동 등급 조건은 0보다 큰 값을 입력해야 합니다.'));
						break;
					case 'EXIST':
						alert(getLocalizeString('설명_자동등급조건이다른등급과동일합니다자동등급조건을수정해주세요', '', '자동 등급 조건이 다른 등급과 동일합니다. 자동 등급 조건을 수정해 주세요.'));
						break;
				}
				return false;
			}
		}
		if(!checkBenefit()){
			alert(getLocalizeString('설명_할인금액및최대할인금액은0보다큰값을입력해야합니다', '', '할인 금액 및 최대 할인 금액은 0보다 큰 값을 입력해야 합니다.'));
			return false;
		}
		return true;
	};

	// 그룹설정저장
	var saveGroupForm = function(){
		if(!checkValidateForm()){
			return false;
		}
		var data = $form.serializeObject();
		var admin_group_setting = $('.admin_group_setting').find("input").serialize();
		data['modal_type'] = MEMBER_GROUP.getModalType();
		if(admin_group_setting == '' && data['group_type'] == 'admin'){
			if(confirm(getLocalizeString('설명_1개이상의권한이부여되지않은그룹은일반그룹으로전환됩니다', '', '1개 이상의 권한이 부여되지 않은 그룹은 일반그룹으로 전환되며\n해당 운영 그룹에만 속한 사용자들은 일반회원으로 전환됩니다.\n그룹 권한을 저장하시겠습니까?'))){
				$.ajax({
					type : 'POST',
					data : data,
					url : ('/admin/ajax/config/membership/group_form_proc.cm'),
					dataType : 'json',
					async : false,
					cache : false,
					success : function(result){
						if(result.msg == 'SUCCESS'){
							location.reload();
						}else{
							if(result.msg == 'VERSION ERROR'){
								if(confirm(LOCALIZE_ADMIN.설명_업그레이드페이지로이동할까요())){
									window.location.href = "/admin/payment?mode=detail&type=upgrade";
								}
							}else{
								alert(result.msg);
							}
						}
					}
				});
			}else{
				return false;
			}
		}else{
			$.ajax({
				type : 'POST',
				data : data,
				url : ('/admin/ajax/config/membership/group_form_proc.cm'),
				dataType : 'json',
				async : false,
				cache : false,
				success : function(result){
					if(result.msg == 'SUCCESS'){
						location.reload();
					}else{
						if(result.msg == 'VERSION ERROR'){
							if(confirm(LOCALIZE_ADMIN.설명_업그레이드페이지로이동할까요())){
								window.location.href = "/admin/payment?mode=detail&type=upgrade";
							}
						}else{
							alert(result.msg);
						}
					}
				}
			});
		}
	};


	// 종료시 콜백
	var saveCallBack = function(result){
		var modal_type = MEMBER_GROUP.getModalType();
		result['data']['idx'] = parseInt(result['data']['idx']);
		if(modal_type == 'config'){
			// 쇼핑이면 쇼핑으로 붙게끔 해야함
			MEMBER_GROUP.modifyGroupList(result['mode'], result['data']);
			if(typeof CONFIG_MEMBERSHIP != 'undefined'){
				CONFIG_MEMBERSHIP.addGroupHtml(result['data']);
			}
		}else{
			if(result['mode'] == 'add'){
				MEMBER_GROUP.addGroupList(result['data']);
				window.doznutadmin.AppForm.initialize();
			}else if(result['mode'] == 'update'){
				MEMBER_GROUP.updateGroupList(result['data']['code'], result['data']);
			}
		}
	};

	return {
		'init' : function(unit_code, code, type){
			init(unit_code, code, type);
		},
		'changeBenefitTarget' : function(obj){
			changeBenefitTarget(obj);
		},
		'saveGroupForm' : function(){
			saveGroupForm();
		}
	};
}();

var MEMBER_EXCEL = function(){
	var $member_multi_add_status, $msg_section;
	var memberExcelUploadInit = function(){
		$member_multi_add_status = $('#member_multi_add_status');
		$member_multi_add_status.fileupload({
			url : '/admin/ajax/excel_upload.cm',
			formData : {target_code : 'multi_member_excel'},
			dataType : 'json',
			singleFileUploads : true,
			limitMultiFileUploads : 1,
			start : function(){
				$member_multi_add_status.addClass('file-loading');
			},
			done : function(e, data){
				var res_data = data.result;
				$.ajax({
					type : 'POST',
					data : {'file_name' : res_data.file_name},
					url : ('/admin/ajax/member/upload_excel_member.cm'),
					dataType : 'json',
					success : function(res){
						if(res.msg === 'SUCCESS'){
							var interval = setInterval(function(){
								$member_multi_add_status.removeClass('file-loading');
								drawExcelUploadResult();
								clearInterval(interval);
							}, 2000);
						}else{
							alert(res.msg);
							$member_multi_add_status.removeClass('file-loading');
						}
					}
				});

			},
			fail : function(){

			}
		});
	};

	var drawExcelUploadResult = function(){
		$msg_section = $('#msg_section');
		$.ajax({
			type : 'POST',
			url : ('/admin/ajax/member/get_excel_member_upload.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg === 'SUCCESS'){
					$msg_section.html(res.html).show();
				}
			},
			error : function(request, status, error){
				// alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
			}

		});
	};


	var showMultiMemberAdd = function(){
		$.cocoaDialog.close();
		$.ajax({
			type : 'POST',
			data : {},
			url : ('/admin/ajax/open_member_batch.cm'),
			dataType : 'html',
			async : true,
			cache : false,
			success : function(html){
				var $html = $(html);
				$.cocoaDialog.open({type : 'multi_member_add', custom_popup : $html});
			}
		});
	};

	var openModalMemberExcelDownload = function(member_group){
		$.ajax({
			type : 'POST',
			url : ('/admin/ajax/member/open_download_excel_member_list.cm'),
			data : {'member_group' : member_group},
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg === 'SUCCESS'){
					$.cocoaDialog.open({type : 'admin_member_excel_download', custom_popup : res.html, width : 550});
				}else{
					alert(res.msg);
				}
			}
		});
	};


	var loadExcelList = function(){
		$.ajax({
			type : 'POST',
			url : ('/admin/ajax/member/get_excel_member_list.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					$('.modal_admin_member_excel_download').find('._excel_empty_wrap').hide();
					$('.modal_admin_member_excel_download').find('#_excel_list_body').html(res.html);
				}else{
					$('.modal_admin_member_excel_download').find('#_excel_list_body').empty();
					$('.modal_admin_member_excel_download').find('._excel_empty_wrap').show();
				}
			}
		});
	};

	var runMemberExcelMake = function(member_group){
		var $dashboard_loader_sub = $('#dashboard_loader_sub');
		var member_privacy = $('#member_privacy').is(":checked");
		var join_type = $('#join_type').val();

		$.ajax({
			type : 'POST',
			url : '/admin/ajax/member/request_excel_member_list.cm',
			dataType : 'json',
			data : {'member_group' : member_group, 'member_privacy' : member_privacy, join_type : join_type},
			cache : false,
			beforeSend : function(){
				$dashboard_loader_sub.show();
			},
			success : function(res){
				if(res.msg == 'SUCCESS'){
					var interval = setInterval(function(){
						$dashboard_loader_sub.hide();
						loadExcelList();

						var all_download = true;
						$('.excel_status').each(function (key, el) {
							if (el.value === 'progress') {
								all_download = false;
							}
						});

						if (all_download) {
							clearInterval(interval);
						}

					}, 2000);
				}else{
					alert(res.msg);
					$dashboard_loader_sub.hide();
				}
			},
			error : function(res){
				$dashboard_loader_sub.hide();
			}
		});
	};

	var deleteMemberExcel = function(idx){
		if(confirm(getLocalizeString("설명_삭제하시겠습니까", '', "삭제하시겠습니까?"))){
			$.ajax({
				type : 'POST',
				data : {'idx' : idx},
				url : ('/admin/ajax/member/delete_excel_member.cm'),
				dataType : 'json',
				async : false,
				cache : false,
				success : function(res){
					if(res.msg == 'SUCCESS'){
						loadExcelList();
					}else{
						alert(res.msg);
					}
				}
			});
		}
	};

	var deleteMemberUploadExcel = function(idx){
		if(confirm(getLocalizeString("설명_삭제하시겠습니까", '', "삭제하시겠습니까?"))){
			$.ajax({
				type : 'POST',
				data : {'idx' : idx},
				url : ('/admin/ajax/member/delete_excel_upload_member.cm'),
				dataType : 'json',
				async : false,
				cache : false,
				success : function(res){
					if(res.msg == 'SUCCESS'){
						drawExcelUploadResult();
					}else{
						alert(res.msg);
					}
				}
			});
		}
	};

	return {
		'init' : function(){
			init();
		},
		'memberExcelUploadInit' : function(){
			memberExcelUploadInit();
		},
		'drawExcelUploadResult' : function(){
			drawExcelUploadResult();
		},
		'showMultiMemberAdd' : function(){
			showMultiMemberAdd();
		},
		'openModalMemberExcelDownload' : function(member_group){
			openModalMemberExcelDownload(member_group);
		},
		'loadExcelList' : function(){
			loadExcelList();
		},
		'runMemberExcelMake' : function(member_group){
			runMemberExcelMake(member_group);
		},
		'deleteMemberExcel' : function(idx){
			deleteMemberExcel(idx);
		},
		'deleteMemberUploadExcel' : function(idx){
			deleteMemberUploadExcel(idx);
		},
	}
}();

var remove_group_list = [];
var is_writing = false;
var is_join_confirm = false;
var adminMember = {
	openGroupForm : function(idx){
		$.ajax({
			type : 'POST',
			data : {idx : idx},
			url : ('/admin/ajax/config/membership/group_form.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(result){
				if(result.msg == 'SUCCESS'){
					$.cocoaDialog.open({type : 'admin_group_form', custom_popup : result.html, width : 550});
				}else{
					alert(result.msg);
				}
			}
		});
	},
	deleteGroupForm : function(idx){
		$.ajax({
			type : 'POST',
			data : {mode : 'delete', idx : idx},
			url : ('/admin/ajax/config/membership/group_form_proc.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(result){
				if(result.msg == 'SUCCESS') location.reload();
				else alert(result['msg']);
			}
		});
	},
	addGroupForm : function(){
		var f = $('#groupf');
		var data = f.serializeObject();
		$.ajax({
			type : 'POST',
			data : data,
			url : ('/admin/ajax/config/membership/group_form_proc.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(result){
				if(result.msg == 'SUCCESS'){
					if(result.mode == 'add'){
						var base_url = $('#new_group_btn').data('base_url');
						var html = '<li id="group_item_' + result.code + '"><a href=\"' + base_url + '&member_group=' + result.code + '\">' + result.title + '<small class=\"margin-left-lg text-bold opacity-75\"></small></a></li>';
						$('#new_group_btn').before(html);

						window.doznutadmin.AppForm.initialize();
					}else if(result.mode == 'update'){
						$("#group_item_title_" + result.code).html(result.title);
						$("#group_hidden_item_title_" + result.code).html(result.title);
						$("#group_hidden_list_title").html(result.title);
					}
					$.cocoaDialog.close();
				}else{
					if(result.msg == 'VERSION ERROR'){
						if(confirm(LOCALIZE_ADMIN.설명_업그레이드페이지로이동할까요())){
							window.location.href = "/admin/payment?mode=detail&type=upgrade";
						}
					}else{
						alert(result.msg);
					}
				}
			}
		});
	}
	, openDeleteMemberGroup : function(code, group_code){
		$.ajax({
			type : 'POST',
			data : {code : code, group_code : group_code},
			url : ('/admin/ajax/member/delete_member_group.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res['msg'] == 'SUCCESS'){
					$.cocoaDialog.open({
						"type" : "admin",
						"custom_popup" : res['html'],
						"width" : 550,
						"reopen" : true,
						"use_enter" : true,
						"hide_event" : function(){
							$(window).unbind('keydown');
						}
					});
				}else{
					alert(res['msg']);
				}
			}
		});
	},
	openUpdateMemberConfirm : function(code, type){
		$.ajax({
			type : 'POST',
			data : {code : code, type : type},
			url : ('/admin/ajax/member/update_member_confirm.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type : 'admin', custom_popup : html});
			}
		});
	},
	UpdateMemberConfirm : function(code, type){
		if(is_join_confirm) return;
		is_join_confirm = true;
		$.ajax({
			type : 'POST',
			data : {code : code},
			url : ('/admin/ajax/member/update_member_confirm_proc.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(result){
				if(result.msg == 'SUCCESS'){
					location.reload();
				}else{
					alert(result.msg);
					is_join_confirm = false;
				}
			}
		});
	},
	openDeleteMember : function(data){
		console.log(data);
		$.ajax({
			type : 'POST',
			data : {'data' : data},
			url : ('/admin/ajax/member/delete_member.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type : 'admin', custom_popup : html});
			},
			error: function(){
				alert(getLocalizeString('설명_잠시후다시시도해주세요', '', '잠시 후 다시 시도해주세요.'));
			}
		});
	},
	openDeleteInactiveMember : function(code){
		$.ajax({
			type : 'POST',
			data : {code : JSON.stringify(code)},
			url : ('/admin/ajax/member/delete_inactive_member.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type : 'admin', custom_popup : html});
			}
		});
	},
	openInactiveMember : function(code){
		$.ajax({
			type : 'POST',
			data : {code : JSON.stringify(code)},
			url : ('/admin/ajax/member/inactive_member.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type : 'admin', custom_popup : html});
			}
		});
	},
	UpdateMemberAutoGroupingSetting : function(code, use){
		$.ajax({
			"type" : "POST",
			"data" : {"code" : code, "use" : use},
			"url" : "/admin/ajax/member/member_autogrouping_setting_proc.cm",
			"dataType" : "json",
			"async" : false,
			"cache" : false,
			success : function(result){
				if(result.msg == 'SUCCESS'){
					location.reload();
				}else
					alert(result.msg);
			}
		});
	},
	deleteMember : function(data){
		$.ajax({
			type : 'POST',
			data : {'data' : data},
			url : ('/admin/ajax/member/delete_member_proc.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(result){
				if(result.msg == 'SUCCESS'){
					location.reload();
				}else
					alert(result.msg);
			}
		});
	},
	deleteInactiveMember : function(code){
		$.ajax({
			type : 'POST',
			data : {mode : 'delete', code : code},
			url : ('/admin/ajax/member/delete_inactive_member_proc.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(result){
				if(result.msg == 'SUCCESS'){
					location.reload();
				}else
					alert(result.msg);
			}
		});
	},
	updateInactiveMember : function(code){
		$.ajax({
			type : 'POST',
			data : {code : code},
			url : ('/admin/ajax/member/inactive_member_proc.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(result){
				if(result.msg == 'SUCCESS'){
					location.reload();
				}else
					alert(result.msg);
			}
		});
	},
	openBlockMember : function(idx){
		$.ajax({
			type : 'POST',
			data : {idx : idx},
			url : ('/admin/member/list/block_member.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type : 'admin', custom_popup : html});
			}
		});
	},
	blockMember : function(idx){
		$.ajax({
			type : 'POST',
			data : {idx : idx},
			url : ('/admin/member/list/block_member_proc.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(result){
				if(result.msg == 'SUCCESS')
					$('#member_item_' + idx).addClass('block');
				else
					alert(result.msg);
			}
		});
	},
	openMemberPushForm : function(member_code_list){
		$.ajax({
			type : 'POST',
			data : {'member_code_list' : member_code_list},
			url : ('/admin/member/send/member_push_form.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type : 'admin', custom_popup : html, width : 600});
			}
		});
	},
	openMemberSmsForm : function(member_code_list, order_code){
		$.ajax({
			type : 'POST',
			data : {'member_code_list' : member_code_list, 'order_code' : order_code},
			url : ('/admin/member/send/member_sms_form.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type : 'admin', custom_popup : html, width : 600});
			}
		});
	},
	sendPush : function(receiver, alarm_subject, alarm_content, url, alarm_img_tmp_idx, alarm_img, all_send, is_booking, booking_time){
		$.ajax({
			type : 'POST',
			data : {
				receiver : receiver,
				alarm_subject : alarm_subject,
				alarm_content : alarm_content,
				url : url,
				alarm_img_tmp_idx : alarm_img_tmp_idx,
				alarm_img : alarm_img,
				all_send : (all_send ? 'Y' : 'N'),
				is_booking : (is_booking ? 'Y' : 'N'),
				booking_time : booking_time
			},
			url : ('/admin/ajax/send_alarm.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == "SUCCESS"){
					$.cocoaDialog.open({type : 'admin', custom_popup : res.html, width : 550});
				}else{
					if(res.html !== undefined){
						$.cocoaDialog.open({type : 'admin', custom_popup : res.html, width : 550});
					}else{
						alert(res.msg);
					}
				}
			}
		});
	},
	sendSms : function(receiver, title, msg, chk_agree, booking_time, is_booking ){
		if(!is_writing){
			is_writing = true;
			$.ajax({
				type : 'POST',
				data : {'receiver' : receiver, 'title' : title, 'msg' : msg, 'chk_agree' : chk_agree, 'booking_time' : booking_time, 'is_booking' : (is_booking ? 'Y' : 'N') },
				url : ('/admin/ajax/sms/send_sms.cm'),
				dataType : 'json',
				async : false,
				cache : false,
				success : function(res){
					if(res.msg == "SUCCESS"){
						$.cocoaDialog.open({type : 'admin', custom_popup : res.html, width : 550, 'close_block':true});
					}else{
						if(res.html !== undefined){
							$.cocoaDialog.open({type : 'admin', custom_popup : res.html, width : 550});
						}else{
							alert(res.msg);
						}
					}
					is_writing = false;
				}
			});
		}else{
			alert("전송중입니다.");
			window.location.reload();
		}
	},
	deleteBookingSms : function(sms_log_idx){
	if (!confirm(LOCALIZE_ADMIN.설명_여러명에게전송한메세지의경우일괄취소됩니다())) return false;
	$.ajax({
		type: 'POST',
		data: {'sms_log_idx':sms_log_idx},
		url: ('/admin/ajax/sms/delete_booking_sms.cm'),
		dataType: 'json',
		async: false,
		cache: false,
		success: function (obj) {
			if(obj.msg === "SUCCESS"){
				window.location.reload();
			}else{
				if(obj.msg === 'CONFLICT'){
					alert(getLocalizeString('설명_이미발송된메세지는취소할수없습니다', '', '이미 발송된 메세지는 취소할 수 없습니다'));
					window.location.reload();
				}else{
					alert(obj.msg);
				}
			}
		}
	});
},
	openChargeSmsform : function(type){
		$.ajax({
			type : 'POST',
			data : {'type' : type},
			url : ('/admin/ajax/sms/charge_sms.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({
					type : 'admin_sms', custom_popup : html, use_enter : true, hide_event : function(){
						$(window).unbind('keydown');
					}
				});
			}
		});
	},
	sendSmsInit : function(){
		var url = decodeURIComponent(location.href);
		url = decodeURIComponent(url);
		url = url.split('#');
		if(url.length > 1 && url[1] == 'typednumber'){
			$('input[name="send_to"]:radio[value="number"]').attr('checked', true);
			$('.form-group.send_to').hide();
			$('.form-group.send_to.number').show();
		}
	},
	openManageMemberPoint : function(code){
		$.ajax({
			type : 'POST',
			data : {code : code},
			url : ('/admin/ajax/member/manage_member_point.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type : 'admin', custom_popup : html});
			}
		});
	},
	manageMemberPoint : function(code){
		var $form = $('#shop_member_point');
		var data = $form.serializeObject();
		$.ajax({
			type : 'POST',
			data : {code : code, data : data},
			url : ('/admin/ajax/member/manage_member_point_proc.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(result){
				if(result.msg == 'SUCCESS'){
					location.reload();
				}else
					alert(result.msg);
			}
		});
	},
	updateAdminMemo : function(member_code, memo, callback){
		$.ajax({
			type : 'POST',
			data : {
				'admin_memo' : memo,
				'code' : member_code
			},
			url : ('/admin/ajax/member/update_admin_memo.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				callback(res);
			}
		});
	},
	openAdminMemoForm : function(member_code){

		$.ajax({
			type : 'POST',
			data : {'member_code' : member_code},
			url : ('/admin/ajax/member/admin_memo_form.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type : 'admin', custom_popup : html, width : 550}, function(){

					var $btn_admin_memo = $("#btn_admin_memo");
					var $admin_memo = $("#admin_memo");
					if($admin_memo.length > 0){
						var $admin_memo_chars_title = $("#admin_memo_chars_title");
						var pre_admin_memo = $admin_memo.val();
						$admin_memo_chars_title.html(getByteLength(pre_admin_memo) + '/500');
						$admin_memo.off("keyup.admin_memo").on("keyup.admin_memo", (function(e){
							var content = $(this).val();
							$admin_memo_chars_title.html(getByteLength(content) + '/500');
						}));
					}

					$btn_admin_memo.off("click.btn_admin_memo").on("click.btn_admin_memo", function(){
						var memo = $admin_memo.val();
						if(pre_admin_memo !== memo){
							pre_admin_memo = memo;


							if(member_code !== ""){
								adminMember.updateAdminMemo(member_code, memo, function(res){
									if(res.msg !== 'SUCCESS') alert(res.msg);
									else location.reload();
								});
							}

						}
					});
				});

			}
		});
	}
};

var ADMIN_SMS_SEND = function(){
	var send_type;
	var push_member_data;
	var $receiver, $sender, $title, $content;

	var init = function(type){
		send_type = type;
		$sender = $('#sms_num');
		$content = $('#sms_content');
		$title = $('#sms_subject');

		// 전화번호 형식 체크
		$(".phonenumber").on('keydown').check_callnum();

		// 내용 작성시 바이트 표기
		var lms_max_byte = 2000;
		$content.keyup(function (e){
			var content = $(this).val();
			var msg_byte = getByteLengthForKorean(content);

			if(msg_byte > 90){
				if(msg_byte > lms_max_byte){
					alert(LOCALIZE_ADMIN.설명_n바이트를초과한메시지는보낼수없습니다(lms_max_byte));
					$(this).val(cutByLen(content,lms_max_byte));
					msg_byte = 2000;
				}
				$('#chars_app_title').html(msg_byte + '/2000');
			}else{
				$('#chars_app_title').html(msg_byte + '/90');
			}
		});

		var lms_max_subject_byte = 40;
		$title.keyup(function (e){
			var content = $(this).val();
			var msg_byte = getByteLengthForKorean(content);


			if(msg_byte > lms_max_subject_byte){
				alert(LOCALIZE_ADMIN.설명_n바이트를초과한메시지는보낼수없습니다(lms_max_subject_byte));
				$(this).val(cutByLen(content,40));
				msg_byte = 40;
			}
			$('#chars_subject_cnt').html(msg_byte + '/40');

		});

		$('#sms_subject,#sms_content').keyup();

		// 주문리스트에서 호출 시 추가 설정
		if(send_type == 'order'){
			$receiver = $('#receiver_num');

			// 라디오 버튼 변경시 수신번호 인풋 제어
			$('input[name="receiver_type"]').on('change', function(){
				$receiver.val($(this).data('number'));
				$receiver.data('number', $(this).data('number'));
			});

			// 번호 직접 수정시에 라디오 체크 해제
			$receiver.on('keyup', function(){
				if($(this).data('number') != $(this).val()){
					$('input[name="receiver_type"]:checked').prop('checked', false);
				}
			});
		}
	};

	var send_push = function(){
		makeReceiver();
		if(push_member_data.length <= 0){
			alert(getLocalizeString("설명_받는사람필수항목", '', "받는사람은 필수항목입니다."));
			return false;
		}
		if($content.val().trim() === ''){
			alert(getLocalizeString("설명_내용필수항목", '', "내용은 필수 항목입니다."));
			return false;
		}
		adminMember.sendSms(push_member_data, $title.val(), $content.val());
	};

	var makeReceiver = function(){
		//초기화
		push_member_data = [];
		switch(send_type){
			case 'npay':
			case 'order':
				push_member_data.push({"type" : "number", "value" : $receiver.val()});
				break;
			case 'member':
				$('.receiver_list:checked').each(function(){
					push_member_data.push({"type" : "member", "value" : $(this).val()});
				});
				break;
		}
	};
	return {
		'init' : function(type){
			init(type);
		},
		'send_push' : function(){
			send_push();
		}
	};
}();

var AUTO_MAIL_SETTING = function(){
	var $dialog;
	var header_ctl;
	var $form;
	var old_smtp_data;
	var redis_data;
	var $post_new_detail_close, $form_new_detail_close;
	var low_security_warning;

	var init = function($obj){
		$dialog = $obj;
		$form = $dialog.find('#mail_setting_form');
		$post_new_detail_close = $form.find('#post_new_detail_close');
		$form_new_detail_close = $form.find('#form_new_detail_close');
		header_ctl = new HEADER_CONTROL();
		header_ctl.init();
		header_ctl.addBtn('save', function(){
			submit();
		});
		createEvent();
	};

	var initSmtp = function(data, _redis_data){
		low_security_warning = getLocalizeString("설명_보안수준이낮은앱연결방식은기존사용자만지원", '',"보안 수준이 낮은 앱 연결 방식은 기존 사용자만 지원됩니다.\n더 안전하고 편리한 OAuth 연결 방식으로 메일 설정을 다시 해주시기바랍니다.");
		old_smtp_data = data;
		redis_data = _redis_data;
		setMailSmtpForm(old_smtp_data['type']);
	};

	var createEvent = function(){
		$form.find('input, textarea').off('change, keyup').on('change, keyup, blur',function(){
			header_ctl.change();
		});
		$dialog.find("input[name='smtp_data[sender_mail]']").blur(function(){
			changeSmtpData();
		});
		$dialog.find("input[name='smtp_data[user_id]']").blur(function(){
			changeSmtpData();
		});
		$dialog.find("input[name='smtp_data[user_password]']").blur(function(){
			changeSmtpData();
		});
		$dialog.find("input[name='smtp_data[custom_smtp_server]']").blur(function(){
			changeSmtpData();
		});
		$dialog.find("input[name='smtp_data[custom_smtp_port]']").blur(function(){
			changeSmtpData();
		});
		$dialog.find("input[name='smtp_data[custom_auth]']").change(function(){
			changeSmtpData();
		});
		$dialog.find("input[name='smtp_data[custom_user_id]']").blur(function(){
			changeSmtpData();
		});
		$dialog.find("input[name='smtp_data[custom_user_password]']").blur(function(){
			changeSmtpData();
		});
		$dialog.find("input[name='smtp_data[custom_sender_name]']").blur(function(){
			changeSmtpData();
		});
		$dialog.find("input[name='smtp_data[custom_sender_email]']").blur(function(){
			changeSmtpData();
		});
		$dialog.find("input[name='smtp_data[auth_email]']").blur(function(){
			changeSmtpData();
		});
		$dialog.find("input[name='smtp_data[gmail_oauth_auth]']").on('change',function(){
			setMailSmtpForm($dialog.find('#smtp_type_select').val());
		});
		$dialog.find('#smtp_type_select').change(function(){
			if($(this).val() === 'default' && !(old_smtp_data['type'] === 'default' || old_smtp_data['type'] === null)){
				if(confirm(getLocalizeString("설명_기본설정으로변경하시겠습니까", '', "기본설정으로 변경 하시겠습니까?"))){
					var data = $form.serializeObject();
					$.ajax({
						type : "POST",
						data : data,
						url : ('/admin/ajax/member/update_smtp_default_setting.cm'),
						dataType : 'json',
						async : false,
						cache : false,
						success : function(res){
							if(res.msg === 'SUCCESS'){
								location.reload();
							}else{
								alert(res.msg);
							}
						}
					});
				}else{
					$dialog.find('#smtp_type_select').val(old_smtp_data['type']);
					$dialog.find('#smtp_type_select').chosen().val(old_smtp_data['type']).trigger("chosen:updated");
					setMailSmtpForm(old_smtp_data['type']);
				}
			}else{
				setMailSmtpForm($dialog.find('#smtp_type_select').val());
			}
		});
		addSelectEvent($dialog);
	};

	var setMailSmtpForm = function(type){

		if( old_smtp_data['type'] === type ){
			if( (typeof redis_data === 'object' && Object.keys(redis_data).length > 0) && old_smtp_data['authentic'] === false){
				$form.find("._auth_btn").show();
			}
			$dialog.find("input[name='smtp_data[sender_mail]']").val(old_smtp_data['sender_mail']);
			$dialog.find("input[name='smtp_data[user_id]']").val(old_smtp_data['user_id']);
			$dialog.find("input[name='smtp_data[custom_smtp_server]']").val(old_smtp_data['custom_smtp_server']);
			$dialog.find("input[name='smtp_data[custom_smtp_port]']").val(old_smtp_data['custom_smtp_port']);
			$dialog.find("input[name='smtp_data[custom_auth]']").prop('checked', old_smtp_data['custom_auth'] === 'Y');
			$dialog.find("input[name='smtp_data[custom_user_id]']").val(old_smtp_data['custom_user_id']);
			$dialog.find("input[name='smtp_data[custom_sender_name]']").val(old_smtp_data['custom_sender_name']);
			$dialog.find("input[name='smtp_data[custom_sender_email]']").val(old_smtp_data['custom_sender_email']);
			$dialog.find("input[name='smtp_data[auth_email]']").val(old_smtp_data['auth_email']);
		}else{
			if( typeof redis_data === 'object' && Object.keys(redis_data).length > 0 ){
				if( redis_data['type'] === type && old_smtp_data['type'] !== 'default' ){
					$form.find("._auth_btn").show();
				}else{
					$form.find("._auth_btn").hide();
				}
			}
			$dialog.find("input[name='smtp_data[sender_mail]']").val('');
			$dialog.find("input[name='smtp_data[user_id]']").val('');
			$dialog.find("input[name='smtp_data[user_password]']").val('');
			$dialog.find("input[name='smtp_data[custom_smtp_server]']").val('');
			$dialog.find("input[name='smtp_data[custom_smtp_port]']").val('');
			$dialog.find("input[name='smtp_data[custom_auth]']").prop('checked', false);
			$dialog.find("input[name='smtp_data[custom_user_id]']").val('');
			$dialog.find("input[name='smtp_data[custom_user_password]']").val('');
			$dialog.find("input[name='smtp_data[custom_sender_name]']").val('');
			$dialog.find("input[name='smtp_data[custom_sender_email]']").val('');
			$dialog.find("input[name='smtp_data[auth_email]']").val('');
		}

		switch(type){
			case "naver":
			case "daum":
			case "nate":
				$form.find("._default_help").hide();
				$form.find("._gmail_type_wrap").hide();
				$form.find("._gmail_oauth_wrap").hide();
				$form.find("._external_smtp_wrap").show();
				$form.find("._custom_smtp_wrap").hide();
				$form.find("._smtp_auth_wrap").show();
				$form.find("._gmail_oauth_wrap").hide();
				break;
			case "gmail": //gmail OAuth연결과 보안 수준이 낮은 앱 연결 선택, 기존 회원인 경우 보안수준이 낮은 앱 연결 선택되어 있음
				$form.find("._default_help").hide();
				if($dialog.find("input[name='smtp_data[gmail_oauth_auth]']:checked").val() === 'N'){
					$form.find("._external_smtp_wrap").show();
					$form.find("._smtp_auth_wrap").show();
					$form.find("._gmail_oauth_wrap").hide();
					$form.find("._gmail_type_wrap").show();
					$('._external_smtp_wrap input').attr('readonly',true).off('click').on('click', function(){
						alert(low_security_warning);
					});
				}else{
					$form.find("._external_smtp_wrap").hide();
					$form.find("._smtp_auth_wrap").hide();
					$form.find("._gmail_oauth_wrap").show();
					$form.find("._gmail_type_wrap").hide();
					if(old_smtp_data['authentic'] === true && old_smtp_data['gmail_oauth_auth'] === false){
					}else{
						$form.find("._gmail_type_wrap #lowSecurity").attr('disabled', true);
					}
				}

				$form.find("._custom_smtp_wrap").hide();
				break;
			case "custom":
				$form.find("._default_help").hide();
				$form.find("._gmail_type_wrap").hide();
				$form.find("._gmail_oauth_wrap").hide();
				$form.find("._external_smtp_wrap").hide();
				$form.find("._custom_smtp_wrap").show();
				$form.find("._smtp_auth_wrap").show();
				$form.find("._gmail_oauth_wrap").hide();
				break;
			case "default":
			default:
				$form.find("._default_help").show();
				$form.find("._gmail_type_wrap").hide();
				$form.find("._gmail_oauth_wrap").hide();
				$form.find("._external_smtp_wrap").hide();
				$form.find("._custom_smtp_wrap").hide();
				$form.find("._smtp_auth_wrap").hide();
				$form.find("._gmail_oauth_wrap").hide();
				break;
		}
		if(type === 'default'){
			$form.find("._mail_wrap").hide();
		}else{
			if(type !== 'gmail')
				$('._external_smtp_wrap input').attr('readonly',false).off('click');
			$form.find("._mail_wrap").show();
		}
		changeSmtpData();
	};

	var changeSmtpData = function(){
		var old_data;
		var new_data;
		var authentication_required;
		if($dialog.find('#smtp_type_select').val() === 'gmail' && $dialog.find("input[name='smtp_data[gmail_oauth_auth]']:checked").val() === 'Y'){
			if(old_smtp_data['type'] === 'gmail' && old_smtp_data['authentic'] === true && old_smtp_data['gmail_oauth_auth'] === true){
				$dialog.find("._gmail_oauth_btn").hide();
				$dialog.find("._smtp_check_request_wrap").hide();
				$dialog.find("._gmail_oauth_complete").show();
			}else if(old_smtp_data['type'] === 'gmail' && old_smtp_data['authentic'] === false && old_smtp_data['gmail_oauth_auth'] === true){
				// 재인증 필요한 경우
				$dialog.find("._gmail_oauth_btn").show();
				$dialog.find("._smtp_check_request_wrap").show();
				$dialog.find("._gmail_oauth_complete").hide();
			}else{
				$dialog.find("._gmail_oauth_btn").show();
				$dialog.find("._smtp_check_request_wrap").hide();
				$dialog.find("._gmail_oauth_complete").hide();
			}
		}else{
			$.each(old_smtp_data, function(k, v){
				if(k === 'idx' || k === 'site_code' || k === 'authentic' || k === 'auth_email' || k === 'gmail_oauth_auth' || k === 'oauth_refresh_token' || k === 'client_id' || k === 'client_secret') return true;
				authentication_required = false;
				old_data = v;
				switch(k){
					case 'type' :
						new_data = $dialog.find("select[name='smtp_data[" + k + "]']").val();
						if(old_data !== new_data){
							authentication_required = true;
						}
						break;
					case 'custom_auth' :
						new_data = $dialog.find("input[name='smtp_data[" + k + "]']").prop('checked') ? 'Y' : 'N';
						if(old_data !== new_data){
							authentication_required = true;
						}
						break;
					case 'user_password' :
						new_data = $dialog.find("input[name='smtp_data[" + k + "]']").val();
						if((old_smtp_data['type'] === 'naver' || old_smtp_data['type'] === 'gmail' || old_smtp_data['type'] === 'daum' || old_smtp_data['type'] === 'nate') && old_smtp_data['authentic']){
							if(new_data !== ''){
								authentication_required = true;
							}
						}
						break;
					case 'custom_user_password' :
						new_data = $dialog.find("input[name='smtp_data[" + k + "]']").val();
						if((old_smtp_data['type'] === 'custom') && old_smtp_data['authentic']){
							if(new_data !== ''){
								authentication_required = true;
							}
						}
						break;
					default:
						new_data = $dialog.find("input[name='smtp_data[" + k + "]']").val();
						if(old_data !== new_data){
							authentication_required = true;
						}
						break;
				}
				if(authentication_required){
					$dialog.find("._auth_mail_send_btn").show();
					$dialog.find("._auth_complete").hide();
					return false;
				}else{
					if(old_smtp_data['authentic'] === true){
						$dialog.find("._auth_mail_send_btn").hide();
						$dialog.find("._auth_complete").show();
					}
				}
			});
		}
	};


	var group_chang = function(type, $obj, name, code){
		var old_text, new_text;

		old_text = $obj.find('span').text();
		$obj.find('span').text(name);
		new_text = $obj.find('span').text();

		if(name == '지정안함'){
			$('#group_' + type).val('');
			$('#group_' + type + '_name').val('');
		}else{
			$('#group_' + type).val(code);
			$('#group_' + type + '_name').val(name);
		}

		if(old_text != new_text){
			header_ctl.change();
		}
	};

	var sendAuthMail = function(){
		var error_msg = '';
		switch($form.find("#smtp_type_select").val()){
			case 'naver' :
			case 'gmail' :
			case 'daum' :
			case 'nate' :
				if($form.find("input[name='smtp_data[sender_mail]']").val() == ''){
					error_msg = getLocalizeString("설명_발신자메일주소입력", '', "발신자 메일주소를 입력해 주세요.");
					break;
				}
				if($form.find("input[name='smtp_data[user_id]']").val() == ''){
					error_msg = getLocalizeString("설명_로그인ID입력", '', "로그인 ID를 입력해 주세요.");
					break;
				}
				if($form.find("input[name='smtp_data[user_password]']").val() == ''){
					error_msg = getLocalizeString("설명_패스워드입력", '', "패스워드를 입력해 주세요.");
					break;
				}
				if($form.find("#auth_email").val() == ''){
					error_msg = getLocalizeString("설명_인증메일주소입력", '', "인증 메일 주소를 입력해주세요.");
					break;
				}
				break;
			case 'custom' :
				if($form.find("input[name='smtp_data[custom_smtp_server]']").val() == ''){
					error_msg = getLocalizeString("설명_SMTP서버입력", '', "SMTP 서버를 입력해 주세요.");
					break;
				}
				if($form.find("input[name='smtp_data[custom_smtp_port]']").val() == ''){
					error_msg = getLocalizeString("설명_SMTP포트입력", '', "SMTP 포트를 입력해 주세요.");
					break;
				}
				if($form.find("input[name='smtp_data[custom_user_id]']").val() == ''){
					error_msg = getLocalizeString("설명_로그인ID입력", '', "로그인 ID를 입력해 주세요.");
					break;
				}
				if($form.find("input[name='smtp_data[custom_user_password]']").val() == ''){
					error_msg = getLocalizeString("설명_패스워드입력", '', "패스워드를 입력해 주세요.");
					break;
				}
				if($form.find("input[name='smtp_data[custom_sender_email]']").val() == ''){
					error_msg = getLocalizeString("설명_발신자메일주소입력", '', "발신자 메일주소를 입력해 주세요.");
					break;
				}
				if($form.find("#auth_email").val() == ''){
					error_msg = getLocalizeString("설명_인증메일주소입력", '', "인증 메일 주소를 입력해주세요.");
					break;
				}
				break;
			case 'default' :
			default:
				error_msg = 'Error.';
				break;
		}

		if(error_msg != ''){
			alert(error_msg);
			return false;
		}

		var data = $form.serializeObject();
		$.ajax({
			type : 'POST',
			data : data,
			url : ('/admin/ajax/member/send_auth_mail.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					if( typeof res.redis_data === 'object' && Object.keys(res.redis_data).length > 0){
						redis_data = res.redis_data;
					}
					$form.find("#auth_mail_send_btn").html(getLocalizeString("설명_인증메일재발송", '', "인증 메일 재발송"));
					$form.find("._auth_btn").show();
				}
				$.cocoaDialog.open({type : 'admin', custom_popup : res.html, width : 600});
			}
		});
	};

	var runAuth = function(code){
		var data = $form.serializeObject();
		$.ajax({
			type : 'POST',
			data : data,
			url : ('/admin/ajax/member/run_smtp_setting_auth.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					alert(getLocalizeString("설명_인증에성공하였습니다", '', "인증에 성공 하였습니다."));
					location.reload();
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var openSmtpHelpForm = function(){
		$.ajax({
			url : ('/admin/ajax/member/smtp_help_form.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(res){
				var $html = $(res);
				$.cocoaDialog.open({type : 'admin', custom_popup : $html, width : 600});
			}
		});
	};

	var submit = function(){
		var data = $form.serializeObject();
		$.ajax({
			type : 'POST',
			data : data,
			url : ('/admin/ajax/member/mail_setting_update.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					header_ctl.save();
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var openDetailSet = function(type){
		var configurable_detail_list = ['post', 'form'];
		if(configurable_detail_list.indexOf(type) < 0) return false;
		var $detail = $('#' + type + '_detail_set');

		if($detail.find('.detail-row').length == 0){
			$detail.html('<div class="text-center"><i class="fa fa-spinner fa-2x fa-spin text-muted"></i></div>');
			$.ajax({
				url : '/admin/ajax/member/get_mail_detail_setting.cm',
				type : 'POST',
				data : {'type' : type},
				dataType : 'HTML',
				success : function(res){
					$detail.html(res);
					addSelectEvent($detail);
				}
			});
		}

		$detail.toggleClass('hidden');
		$detail.parents('.card').find('.card-head').find('i').toggle();

		if($detail.hasClass('hidden')){
			if(type === 'post'){
				$post_new_detail_close.val('true');
			}else{
				$form_new_detail_close.val('true');
			}
		}else{
			if(type === 'post'){
				$post_new_detail_close.val('false');
			}else{
				$form_new_detail_close.val('false');
			}
		}
	};

	var addSelectEvent = function($obj){
		if($obj == undefined) return false;

		//하단공간 없으면 리스트 위로 띄움
		$obj.find('.group.on-click').on("mousedown", function(e){
			// 리스트박스 위치 + 리스트크기 + 약간의 여백
			var chosen_height = $(this).offset().top - $(window).scrollTop() + $(this).find((".chosen-drop")).height() + 50;
			if(chosen_height >= $(window).height()){
				$(this).find(".chosen-drop").addClass("dropup");
			}else{
				$(this).find(".chosen-drop").removeClass("dropup");
			}
		});

		$obj.find('select').not('#smtp_type_select').chosen({
			width : "100%",
			no_results_text : getLocalizeString("설명_그룹이없습니다", '', "그룹이 없습니다."),
		}).change(function(e){
		});

		$obj.find('#smtp_type_select').chosen({
			disable_search_threshold: 30
		}).change(function(e){
		});



		$obj.find('select').not('#smtp_type_select').change(function(){
			header_ctl.change();
		});
		$obj.find('input[type=checkbox],input[type=radio]').not('._gmail_type').off('click').on('click', function(){
			header_ctl.change();
		});
	};

	var openGoogleOauth = function(_client_id, _redirect_url){
		if(header_ctl !== undefined){
			header_ctl.save();
		}
		if(_client_id === '' || _redirect_url === ''){
			alert('실패');
			return false;
		}

		var client_id = _client_id;
		var redirect_url = _redirect_url;
		var popupWidth = 450;
		var popupHeight = 800;
		var popupX = (window.screen.width / 2) - (popupWidth / 2);
		var popupY= (window.screen.height / 2) - (popupHeight / 2);

		var data = {
			'approval_prompt' : 'auto',
			'response_type' : 'code',
			'scope' : 'email profile https://www.googleapis.com/auth/gmail.send',
			'redirect_uri' : redirect_url,
			'access_type' : 'offline',
			'client_id' : client_id,
			'state' : SITE_CODE
		};

		var data2 = new URLSearchParams(data);

		window.open('https://accounts.google.com/o/oauth2/auth?' + data2.toString(), '', 'width='+ popupWidth +', height='+ popupHeight +', left=' + popupX + ', top='+ popupY);
		window.location.href = '//' + CURRENT_DOMAIN + '/admin/member/mail?mode=gmail_oauth';
	};

	var revokeGmailOauth = function(){
		if(confirm(getLocalizeString('설명_Gmail연결을해제하면메일이정상적으로', '', "Gmail 연결을 해제하면 메일이 정상적으로 발송되지 않을 수 있습니다.\n정말 연결을 해제하시겠습니까?"))){
			$.ajax({
				type : 'POST',
				data : '',
				url : ('/admin/ajax/member/revoke_gmail_oauth.cm'),
				dataType : 'json',
				async : false,
				cache : false,
				success : function(res){
					if(res.msg == 'SUCCESS'){
						window.location.reload();
					}else{
						alert(res.msg);
					}
				}
			});
		}
	};

	return {
		'init' : function($obj){
			init($obj);
		},
		'initSmtp' : function(data, redis_data){
			initSmtp(data, redis_data);
		},
		'group_chang' : function(type, $obj, name, code){
			group_chang(type, $obj, name, code);
		},
		'setMailSmtpForm' : function(type){
			setMailSmtpForm(type);
		},
		'sendAuthMail' : function(){
			sendAuthMail();
		},
		'runAuth' : function(code){
			runAuth(code);
		},
		'openDetailSet' : function(type){
			openDetailSet(type);
		},
		'openSmtpHelpForm' : function(){
			openSmtpHelpForm();
		},
		'openGoogleOauth' : function(client_id, redirect_url){
			openGoogleOauth(client_id, redirect_url);
		},
		'revokeGmailOauth' : function(){
			revokeGmailOauth();
		}
	}
}();


var AUTO_SMS_SETTING = function(){
	var $dialog;
	var header_ctl;
	var $form;
	var $certification_sender_number;
	var $sms_config_wrap;

	var init = function($obj){
		$dialog = $obj;
		$form = $dialog.find('#sms_setting_form');
		$sms_config_wrap = $dialog.find('#sms_config_wrap');

		header_ctl = new HEADER_CONTROL();
		header_ctl.init();
		header_ctl.addBtn('save', function(){
			submit();
		});

		createEvent();
	};

	var createEvent = function(){
		$dialog.find('input[type=checkbox],input[type=radio]').off('click').on('click', function(){
			header_ctl.change();
		});
		$dialog.find('input[type=text]').off('keydown').on('keydown, change, blur', function(){
			header_ctl.change();
		});
		$dialog.find('select').off('change').on('change', function(){
			header_ctl.change();
		});
		$dialog.find('input[name="is_use"]').on('change', function(){
			if($(this).prop('checked')){
				$sms_config_wrap.show();
				$form.find('#admin_receive_callnum_wrap').show();
				$form.find('#sender_callnum_wrap').show();
				$form.find('#sms_count_wrap').show();
				$form.find('#use_type_wrap').show();
				if($dialog.find('input[name="use_type"]:checked').val() === 'kakao_alimtalk'){
					$form.find('#kakao_alimtalk_wrap').show();
				}
			}else{
				$sms_config_wrap.hide();
				$form.find('#admin_receive_callnum_wrap').hide();
				$form.find('#sender_callnum_wrap').hide();
				$form.find('#sms_count_wrap').hide();
				$form.find('#kakao_alimtalk_wrap').hide();
				$form.find('#use_type_wrap').hide();
			}
		});

		$dialog.find('input[name="use_type"]').on('change', function(){
			if($(this).val() === 'kakao_alimtalk'){
				$form.find('#kakao_alimtalk_wrap').show();
			}else{
				$form.find('#kakao_alimtalk_wrap').hide();
			}
		});
		setSmsCertification();
	};

	/***
	 * 문자발신번호 인증
	 */
	function setSmsCertification(){
		$certification_sender_number = $("#certification_sender_number");
		$certification_sender_number.find("input[name='type']").click(function(){
			var type = $(this).val();
			setSmsCertificationLayout(type);
		});

		setSmsCertificationLayout($certification_sender_number.find("input[name='type']:checked").val());
	}

	/***
	 * 문자 발신번호 인증 레이아웃 구성
	 * @param type
	 */
	function setSmsCertificationLayout(type){
		var interval_time_event = "";
		var $sms_ars_form = $certification_sender_number.find("._sms_ars_form");
		var $document_from = $certification_sender_number.find("._document_from");

		if(type === 'SMS' || type === 'ARS'){
			$document_from.hide();
			$sms_ars_form.show();
		}else if(type === 'DOCUMENT'){
			$document_from.show();
			$sms_ars_form.hide();
		}else{
			$document_from.hide();
			$sms_ars_form.hide();
		}

		var $cert_save_btn = $certification_sender_number.find('._cert_save_btn');
		var $cert_request_btn = $sms_ars_form.find('._cert_request_btn');
		var $sender_callnum_sms_arc = $sms_ars_form.find("input[name='sender_callnum']");
		var $cert_input_wrap = $sms_ars_form.find("._cert_input_wrap");
		var $cert_code = $sms_ars_form.find("input[name='cert_code']");
		var $sender_callnum_document = $document_from.find("input[name='sender_callnum']");
		var $cert_document_comment = $document_from.find("textarea[name='cert_document_comment']");
		var $limit_time_wrap = $certification_sender_number.find("._limit_time_wrap");
		var limit_time = $certification_sender_number.find("input[name='limit_time']").val();

		var $attach_1_upload = $certification_sender_number.find("._attach_1_upload");
		var $attach_1_upload_text = $certification_sender_number.find("._attach_1_upload_text");
		var $cert_document_attach1 = $certification_sender_number.find("input[name='cert_document_attach1']");

		$cert_input_wrap.hide();
		//모달 오픈시 남은시간 영역 가리기
		$certification_sender_number.off('shown.bs.modal').on('shown.bs.modal', function(){
			$limit_time_wrap.hide();
		});

		//모달 닫을때 이벤트
		$certification_sender_number.off('hide.bs.modal').on('hide.bs.modal', function(){

			$certification_sender_number.find("[data-toggle='popover']").popover('hide');
			if(type !== 'DOCUMENT'){
				$sender_callnum_sms_arc.val('');
				$cert_code.val('');
				$cert_input_wrap.hide();
			}

		});

		if(type === 'SMS' || type === 'ARS'){
			//인증번호 요청 이벤트
			$cert_request_btn.off("click.cert_request_btn").on("click.cert_request_btn", function(){
				if($cert_request_btn.hasClass("disabled")) return false;
				var sender_callnum = $sender_callnum_sms_arc.val();
				if(sender_callnum === ""){
					alert(getLocalizeString("설명_발신번호입력", '', "발신번호를 입력해주세요"));
					$sender_callnum_sms_arc.focus();
					return false;
				}
				$.ajax({
					type : 'POST',
					data : {
						'type' : type,
						'sender_callnum' : sender_callnum
					},
					url : ('/admin/ajax/member/sender_number_certification_request.cm'),
					dataType : 'json',
					async : true,
					cache : false,
					success : function(res){
						if(res.msg !== 'SUCCESS'){
							alert(res.msg);
						}else{
							$cert_input_wrap.show();
							$cert_request_btn.addClass("disabled");
							setTimeout(function(){
								$cert_request_btn.removeClass("disabled");
							}, 5000);

							clearInterval(interval_time_event);
							//모달을때 이벤트 제거
							$certification_sender_number.on('hidden.bs.modal', function(){
								clearInterval(interval_time_event);
							});

							$limit_time_wrap.show();
							$certification_sender_number.find("._lime_time_obj").html(limit_time);
							interval_time_event = setInterval(function(){
								var _limit_time = $certification_sender_number.find("._lime_time_obj").html();
								$certification_sender_number.find("._lime_time_obj").html(_limit_time - 1);
								if((_limit_time - 1) <= 0) clearInterval(interval_time_event);
							}, 1000);
						}
					}
				});

			});
		}else{
			$attach_1_upload.fileupload({
				url : '/admin/ajax/upload_file.cm',
				formData : {temp : 'Y'},
				dataType : 'json',
				target : 'sms_config',
				singleFileUploads : true,
				limitMultiFileUploads : 1,
				dropZone : false,
				acceptFileTypes : /(\.|\/)(gif|jpe?g|png|pdf|zip)$/i,
				start : function(e, data){

				},
				progress : function(e, data){

				},
				done : function(e, data){
					$.each(data.result.files, function(e, tmp){
						if(tmp.error == null){
							$cert_document_attach1.val(tmp.tmp_idx);
							$attach_1_upload_text.html(getLocalizeString("설명_업로드완료", '', "업로드 완료"));
						}else{
							alert(tmp.error);
						}
					});
				},
				fail : function(e, data){
					alert(getLocalizeString("설명_업로드에실패하였습니다", '', "업로드에 실패 하였습니다."));
				}
			});
		}


		//발신번호 등록 이벤트
		$cert_save_btn.off("click.cert_save_btn").on("click.cert_save_btn", function(){
			if(type === 'SMS' || type === 'ARS'){
				var sender_callnum = $sender_callnum_sms_arc.val();
				if(sender_callnum === ""){
					alert(getLocalizeString("설명_발신번호입력", "", "발신번호를 입력해주세요"));
					$sender_callnum_sms_arc.focus();
					return false;
				}
				var cert_code = $cert_code.val();
				if(cert_code === ""){
					alert(getLocalizeString("설명_인증번호를입력해주세요", "", "인증번호를 입력해주세요"));
					$cert_code.focus();
					return false;
				}

				$.ajax({
					type : 'POST',
					data : {
						'type' : type,
						'sender_callnum' : sender_callnum,
						'cert_code' : cert_code
					},
					url : ('/admin/ajax/member/sender_number_certification_update.cm'),
					dataType : 'json',
					async : true,
					cache : false,
					success : function(res){
						if(res.msg === 'SUCCESS'){
							alert(getLocalizeString("설명_인증이완료되었습니다", '', "인증이 완료되었습니다."));
							location.reload();
						}else{
							alert(res.msg);
						}
					}
				});
			}else{
				var sender_callnum = $sender_callnum_document.val();
				var cert_document_attach1 = $cert_document_attach1.val();
				var cert_document_comment = $cert_document_comment.val();
				if(sender_callnum === ""){
					alert(getLocalizeString("설명_발신번호입력", '', "발신번호를 입력해주세요"));
					$sender_callnum_document.focus();
					return false;
				}

				if(cert_document_attach1 === ""){
					alert(getLocalizeString("설명_통신서비스이용증명원을첨부해주세요", '', "통신 서비스 이용증명원을 첨부해주세요"));
					return false;
				}

				if(cert_document_comment === ""){
					alert(getLocalizeString("설명_요청사유입력", '', "요청사유를 입력해주세요"));
					$cert_document_comment.focus();
					return false;
				}
				$.ajax({
					type : 'POST',
					data : {
						'type' : type,
						'sender_callnum' : sender_callnum,
						'cert_document_attach1' : cert_document_attach1,
						'cert_document_comment' : cert_document_comment
					},
					url : ('/admin/ajax/member/sender_number_certification_update.cm'),
					dataType : 'json',
					async : true,
					cache : false,
					success : function(res){
						if(res.msg === 'SUCCESS'){
							if(type === "DOCUMENT"){
								alert(getLocalizeString("설명_발신번호서류인증신청완료", '', "발신번호 서류 인증신청이 완료되었습니다. 1~2 영업일 이내에 처리될 예정이며 처리가 완료되기 전까진 SMS 발송이 제한됩니다."));
							}else{
								alert(getLocalizeString("설명_발신번호인증완료", '', "발신번호 인증이 완료되었습니다."));
							}
							location.reload();
						}else{
							alert(res.msg);
						}
					}
				});

			}
		});
	}


	var group_chang = function(type, $obj, name, code){
		var old_text, new_text;

		old_text = $obj.find('span').text();
		$obj.find('span').text(name);
		new_text = $obj.find('span').text();

		if(name == '지정안함'){
			$('#group_' + type).val('');
			$('#group_' + type + '_name').val('');
		}else{
			$('#group_' + type).val(code);
			$('#group_' + type + '_name').val(name);
		}

		if(old_text != new_text){
			header_ctl.change();
		}
	};


	var submit = function(){
		var data = $form.serializeObject();
		$.ajax({
			type : 'POST',
			data : data,
			url : ('/admin/ajax/member/sms_setting_update.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					header_ctl.save();
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var openSmsPreview = function(type){
		$.ajax({
			type : 'GET',
			data : {'type' : type},
			url : ('/admin/ajax/member/sms_preview.cm'),
			dataType : 'html',
			async : false,
			cache : true,
			success : function(res){
				var $html = $(res);
				$.cocoaDialog.open({type : 'admin', custom_popup : $html, width : 600});
			}
		});
	};

	var openSmsSettingNum = function(){
		$.ajax({
			type : 'POST',
			// data : {'type' : type},
			url : ('/admin/ajax/member/sms_setting_num.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(res){
				var $html = $(res);
				$.cocoaDialog.open({type : 'admin_sms_num', custom_popup : $html});
			}
		});

		setSmsCertification();
	};

	var openSmsChargeComplete = function(sms_count){
		$.ajax({
			type : 'POST',
			data : {'sms_count' : sms_count},
			url : ('/admin/ajax/sms/sms_charge_complete.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type : 'admin_sms', custom_popup : html});
			}
		});
	};

	var openRequestKakaoAlimTalk = function(idx){
		$.ajax({
			type : 'POST',
			data : {'idx' : idx},
			url : ('/admin/ajax/sms/open_kakao_alimtalk_request.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type : 'admin_sms', custom_popup : html});
			}
		});
	};

	var requestKakaoAlimTalk = function(){
		var data = $('#request_form_kakao_alimtalk').serializeObject();
		$.ajax({
			type : 'POST',
			data : {data : data},
			url : ('/admin/ajax/sms/request_kakao_alimtalk.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg === 'SUCCESS'){
					header_ctl.save(); // 저장시 새로고침 컨펌 안뜨게 하기 위해
					location.reload();
				}else{
					alert(res.msg);
				}
			}
		});
	};

	return {
		'init' : function($obj){
			init($obj);
		},
		'group_chang' : function(type, $obj, name, code){
			group_chang(type, $obj, name, code);
		},
		'openSmsPreview' : function(type){
			openSmsPreview(type);
		},
		'openSmsSettingNum' : function(){
			openSmsSettingNum();
		},
		'openSmsChargeComplete' : function(sms_count){
			openSmsChargeComplete(sms_count);
		},
		'openRequestKakaoAlimTalk' : function(idx){
			openRequestKakaoAlimTalk(idx);
		},
		'requestKakaoAlimTalk' : function(){
			requestKakaoAlimTalk();
		},
	}
}();
var MEMBER_BLOCK = function(){
	var openBlockMember = function(member_code,block_member_code,site_code){
		$.ajax({
			type : 'post',
			data : {
				'member_code' : member_code,
				'block_member_code' : block_member_code,
				'site_code' : site_code,
			},
			url : '/admin/ajax/member/delete_block_member.cm',
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type : 'admin', custom_popup : html});
			}
		});
	};
	var deleteBlock = function(member_code,block_member_code,site_code){
		$.ajax({
			type : 'post',
			data : {
				'member_code' : member_code,
				'block_member_code' : block_member_code,
				'site_code' : site_code,
			},
			url : '/admin/ajax/member/delete_block.cm',
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg === 'SUCCESS'){
					//header_ctl.save(); // 저장시 새로고침 컨펌 안뜨게 하기 위해
					location.reload();
				}else{
					alert(res.msg);
				}
			}
		});
	};
	return {
		'openBlockMember' : function(member_code,block_member_code,site_code){
			openBlockMember(member_code,block_member_code,site_code);
		},
		'deleteBlock' : function(member_code,block_member_code,site_code){
			deleteBlock(member_code,block_member_code,site_code);
		},
	}
}();
