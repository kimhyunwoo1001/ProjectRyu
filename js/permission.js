var PERMISSION_GROUP = function(){
	var $check_drop_group_list, $drop_group_list, $group_list;
	var managers_setting_permission, base_url, modal_type, current_member_code, drop_group_list_tmp;
	var group_list_item_tmp;
	var mode;
	var group_item_html_class = '_group_item';
	var group_list_data = new DATA();

	var init = function(code, url, permission, type, m){
		mode = m;
		current_member_code = code;
		$drop_group_list = $('._drop_group_list');
		$group_list = $('#group_list');
		base_url = url;
		modal_type = type;
		managers_setting_permission = permission;
		group_list_item_tmp = '<li class="{class}" id="{id}"><a href="{href}"><span id="group_item_title_{code}">{group_type} - <span class="title">{title}</span></span> <small class="margin-left-lg text-bold opacity-75">{cnt}</small><button onclick="{edit_script}" class="pull-right btn btn-flat no-padding hover-visible"><i class="zmdi zmdi-settings"></i></button></a></li>';
		drop_group_list_tmp = '<li class="{class}"><a href="javascript:;" data-idx="{idx}" onclick="{concede_script}">{group_type} - {title}</a></li>';

		$drop_group_list.each(function(){
			// 기본 그룹
			var _new_d = [];
			$.each($(this).data('groups').toString().split(','), function(e, v){
				v = v == "" ? 0 : parseInt(v);
				if(v > 0)
					_new_d.push(v);
			});
			$(this).data('groups', _new_d);

		});

		$check_drop_group_list = $('._check_drop_group_list');
		$check_drop_group_list.data('member', []);
		$check_drop_group_list.data('groups', []);

	};

	headerInit = function(){
		var $list_form = $('#groupf_list');
		$list_form.find('input[type=checkbox]').off('click').on('click', function(){
			var btn = $('._list_add_btn');
			if(typeof btn !== "undefined"){
				btn.removeClass('btn-default');
				btn.addClass('btn-primary')
			}
		});
	};

	var addGroupList = function(data){
		data.idx = parseInt(data.idx);
		group_list_data.add(data.code, data);
		addGroupListHtml(data);
	};

	var addGroupListHtml = function(data){
		var concede_script = '';
		var group_type = data['group_type'];
		var edit_script = "PERMISSION_GROUP.openAdminGroupForm('" + data.idx + "');";
		var li_id = "group_item_" + data['code'];

		if(managers_setting_permission){
			concede_script = "PERMISSION_GROUP.concedeToggleGroup($(this),'" + data.idx + "')";
		}else{
			concede_script = "alert(getLocalizeString('설명_운영진그룹설정권한이없습니다', '', '운영진 그룹 설정 권한이 없습니다.'))";
		}

		var tmp_data = {
			"id" : li_id,
			"class" : group_type + ' ' + (current_member_code == data.code ? 'active checked ' + group_item_html_class : group_item_html_class),
			"code" : data.code,
			"href" : base_url + "member_group=" + data.code + "&mode=" + mode,
			"title" : data.title,
			"group_type" : data['group_type_name'],
			"cnt" : data.member_cnt > 0 ? parseInt(data.member_cnt) : '',
			"edit_script" : edit_script + "return false;"
		};

		var $group_list_html = $(getTemplateConvert(group_list_item_tmp, tmp_data)).data(data);
		appendGroupHtml($group_list, $group_list_html, group_type, true);

		var $droup_list = $drop_group_list;

		$droup_list.each(function(){
			var group_data = $(this).data('groups');
			var drop_tmp_data = {
				"class" : group_type + ' ' + ($.inArray(data.idx, group_data) !== -1 ? 'active checked ' + group_item_html_class : group_item_html_class),
				"idx" : data.idx,
				"concede_script" : concede_script
			};

			drop_tmp_data = $.extend(tmp_data, drop_tmp_data);
			var $drop_group_list_html = $(getTemplateConvert(drop_group_list_tmp, drop_tmp_data)).data(data);
			appendGroupHtml($(this), $drop_group_list_html, group_type, true);
		});

		var $check_droup_list = $check_drop_group_list;
		var check_group = $check_droup_list.data('groups');
		var check_drop_tmp_data = {
			"class" : group_type + ' ' + ($.inArray(data.idx, check_group) !== -1 ? 'active checked ' + group_item_html_class : group_item_html_class),
			"idx" : data.idx,
			"concede_script" : concede_script
		};
		check_drop_tmp_data = $.extend(tmp_data, check_drop_tmp_data);
		var $check_drop_group_list_html = $(getTemplateConvert(drop_group_list_tmp, check_drop_tmp_data)).data(data);
		appendGroupHtml($check_droup_list, $check_drop_group_list_html, group_type, true);
	};

	var appendGroupHtml = function($obj, $html, group_type, use_divider){
		use_divider = (use_divider == true);
		var $divider = '<li class="divider ' + group_item_html_class + '"></li>';
		if($obj.find('.' + group_type).length == 0){
			var next_element = [];
			next_element.push('.shopping');
			next_element = next_element.length > 0 ? next_element.join(',') : '';
			var is_first = ($obj.find('.' + group_item_html_class).length == 0);

			if(next_element == '' || $obj.find(next_element).length == 0){
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

	var concedeToggleGroup = function(obj, idx){
		idx = parseInt(idx);
		var $list = obj.closest('._drop_group_list, ._check_drop_group_list');
		var member_item_group_data = $list.data('groups');
		var member_idx = $list.data('member');

		var $item = obj.parent();
		var item_data = $item.data();
		var _old_data = group_list_data.get(item_data.code);

		if($.isArray(member_idx)){
			if($.inArray(idx, member_item_group_data) !== -1){ //제거
				member_item_group_data = deleteArrayValue(member_item_group_data, idx);
			}else{ //추가
				member_item_group_data.push(idx);
			}

			// 회원그룹 이용권 체크
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
			});
		}else{
			if($.inArray(idx, member_item_group_data) !== -1){ //제거
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
			url : ('/admin/member/list/group_concede_proc.cm'),
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
						$('._drop_group_btn_' + member_idx).html(_group);
					}
				}else{
					alert(result.msg);
				}
			}
		});
	};

	var openAdminGroupForm = function(idx){
		$.ajax({
			type : 'POST',
			data : {'idx' : idx, 'type' : 'list'},
			url : ('/admin/ajax/config/membership/admin_group_form.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(result){
				if(result.msg == 'SUCCESS'){
					$.cocoaDialog.open({type : 'admin', custom_popup : result.html, width : 550});
				}else{
					alert(result.msg);
				}
			}
		});
	};

	var saveAdminGroupForm = function(idx, type){
		var f = $('#groupf_' + type);
		var data = f.serializeObject();
		if(idx > 0 && Object.keys(data).length <= 1){
			if(confirm(getLocalizeString("설명_1개이상의권한이부여되지않은그룹은일반그룹으로전환됩니다", "", "1개 이상의 권한이 부여되지 않은 그룹은 일반그룹으로 전환되며\n해당 운영 그룹에만 속한 사용자들은 일반회원으로 전환됩니다.\n그룹 권한을 저장하시겠습니까?"))){
				$.ajax({
					type : 'POST',
					data : {'data' : data, 'idx' : idx},
					url : ('/admin/ajax/config/membership/admin_group_form_proc.cm'),
					dataType : 'json',
					async : false,
					cache : false,
					success : function(result){
						if(result.msg == 'SUCCESS'){
							if(type == 'modal'){
								saveCallBack(result);
								$.cocoaDialog.close();
							}else{
								location.reload();
							}
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
				data : {'data' : data, 'idx' : idx},
				url : ('/admin/ajax/config/membership/admin_group_form_proc.cm'),
				dataType : 'json',
				async : false,
				cache : false,
				success : function(result){
					if(result.msg == 'SUCCESS'){
						if(type == 'modal'){
							saveCallBack(result);
							$.cocoaDialog.close();
						}else{
							location.reload();
						}
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

	var saveCallBack = function(result){
		result['data']['idx'] = parseInt(result['data']['idx']);
		if(result['mode'] == 'add'){
			PERMISSION_GROUP.addGroupList(result['data']);
			window.doznutadmin.AppForm.initialize();
		}else if(result['mode'] == 'update'){
			PERMISSION_GROUP.updateGroupList(result['data']['code'], result['data']);
		}
		// }
	};

	var updateGroupList = function(code, data){
		group_list_data.add(code, data);
		resetGroupListHtml();
	};

	var allCheckToggle = function(cl, type, m){
		if(m == 'list'){
			var btn = $('._list_add_btn');
			if(typeof btn !== "undefined") btn.removeClass('disabled');
		}
		if(type == 'view'){
			var class_name = cl + "_";
			var checkboxes = $("[class*=" + m + "_view_" + class_name + "]");
			var checkall = $("._" + m + "_view_" + cl);
			for(var i = 0; i < checkboxes.length; i++){
				checkboxes[i].checked = checkall.prop('checked');
			}
		}else{
			var class_name = cl + "_";
			var checkboxes = $("[class*=" + m + "_edit_" + class_name + "]");
			var checkall = $("._" + m + "_edit_" + cl);
			for(var i = 0; i < checkboxes.length; i++){
				checkboxes[i].checked = checkall.prop('checked');
			}
		}
	};

	var CheckToggle = function(cl, type, m){
		if(m == 'list'){
			var btn = $('._list_add_btn');
			if(typeof btn !== "undefined") btn.removeClass('disabled');
		}
		var checkall = document.getElementById(cl + '_' + type + '_allToggle_' + m);
		var class_name = cl + "_";
		var checkboxes = $("[class*=" + m + "_" + type + "_" + class_name + "]");
		var checkboxes_checked_cnt = $("[class*=" + m + "_" + type + "_" + class_name + "]:checked").length;
		for(var i = 0; i < checkboxes.length; i++){
			checkall.checked = checkboxes_checked_cnt > 0;
			checkall.indeterminate = checkboxes_checked_cnt > 0 && checkboxes_checked_cnt < checkboxes.length;
		}
	};

	var checkMember = function(idxs){
		var $list = $('._drop_group_list_' + idxs[0]);
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
		resetGroupListHtml();
	};

	var resetGroupListHtml = function(){
		$('.' + group_item_html_class).remove();
		$.each(group_list_data.data, function(code, data){
			addGroupListHtml(data);
		});
	};

	var createEvent = function(){
		var btn = $('._list_add_btn');
		if(typeof btn !== "undefined") btn.removeClass('disabled');
	};

	return {
		'init' : function(code, url, permission, type, mode){
			init(code, url, permission, type, mode);
		},
		'headerInit' : function(){
			headerInit();
		},
		'openAdminGroupForm' : function(idx){
			openAdminGroupForm(idx);
		},
		'saveAdminGroupForm' : function(idx, type){
			saveAdminGroupForm(idx, type);
		},
		'allCheckToggle' : function(cl, type, m){
			allCheckToggle(cl, type, m);
		},
		'CheckToggle' : function(cl, type, m){
			CheckToggle(cl, type, m);
		},
		'checkMember' : function(idxs){
			checkMember(idxs);
		},
		'concedeToggleGroup' : function(obj, idx){
			concedeToggleGroup(obj, idx);
		},
		'addGroupList' : function(data){
			addGroupList(data);
		},
		'createEvent' : function(){
			createEvent();
		},
		'updateGroupList' : function(code, data){
			updateGroupList(code, data);
		}
	}
}();

var MEMBER_PERMISSION_MANAGE = function(){
	var $form;
	var header_ctl;
	var $fileupload_profile_img, $profile_img, $photo_tmp_idx;
	var member_code;
	var $kr_addr_form_wrap, $jp_addr_form_wrap, $en_addr_form_wrap;
	var passwd_html_show_click = false;
	var $admin_group_list_wrap;

	var init = function(type, code){
		member_code = code;
		$form = $('#dof');
		$fileupload_profile_img = $('#fileupload_profile_img');
		$profile_img = $('#profile_img');
		$photo_tmp_idx = $('#photo_tmp_idx');
		$kr_addr_form_wrap = $form.find("#kr_addr_form_wrap");
		$jp_addr_form_wrap = $form.find("#jp_addr_form_wrap");
		$en_addr_form_wrap = $form.find("#en_addr_form_wrap");

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
		$admin_group_list_wrap.find('input[type=checkbox]').off('click').on('click', function(){
			if($admin_group_list_wrap.find('input[type=checkbox]:checked').length > 0){
				$('._manager_info_wrap').show();
			}else{
				$('._manager_info_wrap').hide();
			}
			header_ctl.change();
		});

	};

	var createEvent = function(){
		$form.find('input, textarea, select').off('change, keyup').on('change, keyup', function(){
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

	var submit = function(type){
		var data = $form.serializeObject();
		$.ajax({
			type : 'POST',
			data : data,
			url : ('/admin/member/permission/add.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					header_ctl.save();
					if(type == 'add') history.go(-1);
					else location.reload();
				}else
					alert(res.msg);
			}
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
						$kr_addr_form_wrap.show();
						break;
					case "3":
						$jp_addr_form_wrap.show();
						break;
					case "5":
						$en_addr_form_wrap.show();
						break;
				}
			}
		});
	};
	return {
		'init' : function(type, code){
			init(type, code);
		},
		'changeCountry' : function(country, code){
			changeCountry(country, code);
		}
	}
}();