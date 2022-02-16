var adminContents = {
	openBoardForm: function(board_code){
		$.ajax({
			type: 'POST',
			data: {board_code: board_code},
			url: ('/admin/contents/post/board_form.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if (res.msg == 'SUCCESS'){
					$.cocoaDialog.open({type : 'admin', custom_popup : res.html, width : 550});
				}else alert(res.msg);
			}
		});
	},
	addBoardForm: function () {
		var f = $('#boardf');
		var data = f.serializeObject();
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/contents/post/board_form_proc.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (result) {
				if (result.msg == 'SUCCESS') {
					if (result.mode == 'add') {
						var base_url = $('#new_board_btn').data('base_url');
						var html = '<li id="board_item_' + result.code + '"><a href=\"'+base_url+'&board_code='+result.code+'\">' + result.name + '<small class=\"pull-right text-bold opacity-75\"></small></a></li>';
						$('#new_board_btn').before(html);
						window.doznutadmin.AppForm.initialize();
					}else if(result.mode == 'update'){
						location.reload();
					}
					$.cocoaDialog.close();
				} else
					alert(result.msg);
			}
		});
	},
	editBoardForm : function (type) {
		var f = $('#boardf');
		var data = f.serializeObject();
		data.type = type;
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/contents/post/board_edit_form_proc.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (result) {
				if (result.msg == 'SUCCESS') {
					location.reload();
					$.cocoaDialog.close();
				} else
					alert(result.msg);
			}
		});
	},
	editFormAdminContents: function(){
		var f = $('#formf_modal');
		var data = f.serializeObject();
		data['type'] = 'dropdown';
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/contents/form/form_edit_form_proc.cm'),
			dataType: 'json',
			success: function (result) {
				if (result.msg == 'SUCCESS') {
					location.reload();
				} else
					alert(result.msg);
			}
		});
	},
	editFormForm: function () {
		var f = $('#formf');
		var data = f.serializeObject();
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/contents/form/form_edit_form_proc.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (result) {
				if (result.msg == 'SUCCESS') {
					$.cocoaDialog.close();
					location.reload();
				} else
					alert(result.msg);
			}
		});
	},
	openDeleteBoardForm: function(board_code){
		$.ajax({
			type: 'POST',
			data: {board_code: board_code},
			url: ('/admin/contents/post/delete_board_form.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (html) {
				$.cocoaDialog.open({type:'admin',custom_popup:html,width:550,reopen:true, use_enter: true, hide_event:function(){
						$(window).unbind('keydown');
					}});
			}
		});
	},
	deleteBoardForm: function(board_code,type){
		$.ajax({
			type: 'POST',
			data: {board_code: board_code,type:type},
			url: ('/admin/contents/post/delete_board_form_proc.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (obj) {
				if(obj.msg=="SUCCESS"){
					if(obj.type == 'map'){
						location.href="/admin/contents/map";
					}else if(obj.type == 'calendar'){
						location.href="/admin/contents/calendar";
					}else if(obj.type == 'gallery'){
						location.href="/admin/contents/gallery";
					}else{
						location.href="/admin/contents/post";
					}
				}else{
					alert(obj.msg);
				}
			}
		});
	},
	openEditBoardForm : function(board_code, type){
		$.ajax({
			type: 'POST',
			data: {board_code: board_code, type: type},
			url: ('/admin/contents/post/board_edit_form.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if (res.msg == 'SUCCESS') {
					$.cocoaDialog.open({type:'admin',custom_popup:res.html,width:550,reopen:true});
				} else
					alert(res.msg);
			}
		});
	},
	openEditFormForm : function(board_code, type){
		// 입력폼 수정시
		$.ajax({
			type: 'POST',
			data: {board_code: board_code, type: type},
			url: ('/admin/contents/form/form_edit_form.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if (res.msg == 'SUCCESS'){
					$.cocoaDialog.open({type : 'admin', custom_popup : res.html, width : 550, reopen : true});
				}else  alert(res.msg);
			}
		});
	},
	openDeleteForm : function(board_code, type){
		$.ajax({
			type: 'POST',
			data: {board_code: board_code, type: type},
			url: ('/admin/contents/post/delete_form.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (html) {
				$.cocoaDialog.open({type:'admin',custom_popup:html,width:550,reopen:true, use_enter: true, hide_event:function(){
						$(window).unbind('keydown');
					}});
			}
		});
	},
	addComment : function(id){
		var that = this;
		var form = $('#'+id);
		var data = form.serializeObject();
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/contents/post/add_comment_proc.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (result) {
				if (result.msg == 'SUCCESS') {
					$('#comment_list_html').append(result.html);
					that.cancelComment(id);
				} else
					alert(result.msg);
			}
		});

	},
	addSubComment : function(id){
		var that = this;
		var form = $('#'+id);
		var data = form.serializeObject();
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/contents/post/add_comment_proc.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (result) {
				if (result.msg == 'SUCCESS') {
					var id = result.data.parent_code;
					$('#child_w_'+id).append(result.html);
					that.cancelComment(id);
				} else
					alert(result.msg);
			}
		});

	},
	addManageComment : function (id){
		var that = this;
		var form = $('#'+id);
		var data = form.serializeObject();
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/contents/comment/add_comment_proc.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (result) {
				if (result.msg == 'SUCCESS') {
					$('#comment_manage_list').prepend(result.html);
					that.cancelComment(id);
				} else
					alert(result.msg);
			}
		});
	},
	cancelComment : function(id){
		$('#'+id).find('textarea').val('');
	},
	deleteComment : function (id){
		$.ajax({
			type: 'POST',
			data: {code:id},
			url: ('/admin/contents/post/delete_comment.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (html) {
				$.cocoaDialog.open({type:'admin',custom_popup:html,width:550,reopen:true, use_enter: true, hide_event:function(){
						$(window).unbind('keydown');
					}});
			}
		});
	},
	deleteCommentProc : function (id){
		$.ajax({
			type: 'POST',
			data: {code:id},
			url: ('/admin/contents/post/delete_comment_proc.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (result) {
				if (result.msg == 'SUCCESS') {
					if(result.mode == 'delete'){
						$('#comment_wrap').find('#delete_'+id).text(getLocalizeString("설명_삭제된댓글", "", "삭제된 댓글"));
						$('#comment_wrap').find('#body_'+id).text('');

					}else if(result.mode == 'destroy'){
						$('#comment_wrap').find('#'+id).remove();

					}

					$.cocoaDialog.close();
				} else
					alert(result.msg);
			}
		});
	},
	deleteManageComment : function (id){
		$.cocoaDialog.open({
			type:'delete',
			terms : getLocalizeString("설명_삭제하시겠", "","삭제 하시겠습니까?")
		},function(){
			$.ajax({
				type: 'POST',
				data: {code:id},
				url: ('/admin/contents/comment/delete_comment_proc.cm'),
				dataType: 'json',
				async: false,
				cache: false,
				success: function (result) {
					if (result.msg == 'SUCCESS') {
						if(result.mode == 'delete'){
							$('#comment_manage_list').find('._delete_'+id).text(getLocalizeString("설명_삭제된댓글", "", "삭제된 댓글"));

						}else if(result.mode == 'destroy'){
							$('#comment_manage_list').find('#'+id).remove();

						}

					} else
						alert(result.msg);
				}
			});

		});
	},
	chkCommentItem : function(){
		var list =  $('#comment_manage_list');
		var chk_len = list.find('input:checkbox:checked').length;
		if(chk_len>0){
			$('#select_header').show();
			$('#default_header').hide();
		}else{
			$('#select_header').hide();
			$('#default_header').show();
		}
		$('#select_cnt').text(chk_len);
	},
	allChkCommentItem : function(){
		var list =  $('#comment_manage_list');
		list.find('input:checkbox').prop('checked',true);
		this.chkCommentItem();
	},
	cancelChkCommentItem : function(){
		var list =  $('#comment_manage_list');
		list.find('input:checkbox').prop('checked',false);
		this.chkCommentItem();
	},
	openDeleteCommentForm:function(code){
		var chk_item = [];
		if(code!="" && typeof code !="undefined")chk_item.push(code);
		else{
			var list =  $('#comment_manage_list');
			list.find('input:checkbox:checked').each(function(){
				var v = $(this).val();
				chk_item.push(v);
			});
		}

		$.ajax({
			type: 'POST',
			data: {comment_list: chk_item},
			url: ('/admin/contents/comment/delete_comment_form.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (html) {
				$.cocoaDialog.open({type:'admin',custom_popup:html,width:550,reopen:true, use_enter: true, hide_event:function(){
						$(window).unbind('keydown');
					}});
			}
		});

	},
	deleteCommentForm:function(code){

		$.ajax({
			type: 'POST',
			data: {mode:'multi',code: code},
			url: ('/admin/contents/comment/delete_comment_proc.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (result) {
				if (result.msg == 'SUCCESS') {
					$.each(result.multi,function(id,mode){
						var comment_count = $('#comment_count');
						if(mode == 'delete'){
							$('#comment_manage_list').find('._delete_'+id).text(getLocalizeString("설명_삭제된댓글",'', "삭제된 댓글"));
							comment_count.text(comment_count.text() - 1);
						}else if(mode == 'destroy'){
							$('#comment_manage_list').find('#'+id).remove();
							comment_count.text(comment_count.text() - 1);
						}
					});

					$('#select_header').hide();
					$('#default_header').show();
					$.cocoaDialog.close();
				} else
					alert(result.msg);
			}
		});

	},
	openUpdateWtimeForm:function(code){
		var chk_item = [];
		if(code!="" && typeof code !="undefined")chk_item.push(code);
		else{
			var list =  $('#comment_manage_list');
			list.find('input:checkbox:checked').each(function(){
				var v = $(this).val();
				chk_item.push(v);
			});
		}

		$.ajax({
			type: 'POST',
			data: {comment_list: chk_item},
			url: ('/admin/contents/comment/update_wtime_form.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (html) {
				$.cocoaDialog.open({type:'admin',custom_popup:html,width:550,reopen:true, use_enter: true, hide_event:function(){
						$(window).unbind('keydown');
					}});
			}
		});

	},
	updateWriteTimeCommentForm:function(code){
		var date = $('._datepicker_input_obj').val();
		var time = $('._timepicker_input_obj').val();
		if(date == '' || date == null || time == '' || time == null) {
			alert(getLocalizeString("설명_작성시각날짜시간입력", '', "날짜와 시간을 입력해 주세요."));
			return false;
		}
		$.ajax({
			type: 'POST',
			data: {code : code, date : date, time : time},
			url: ('/admin/contents/comment/update_wtime_commnet_form_proc.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (result) {
				if(result.msg == "SUCCESS") {
					alert(getLocalizeString("설명_변경되었습니다", '', "변경 되었습니다."));
					$.cocoaDialog.close();
					location.reload();
				}else
					alert(result.msg);
			}
		});
	},
	hidePost : function(code, board_type, mode, view_type){
		$.ajax({
			type : 'POST',
			data : {code : code, board_type : board_type, mode : mode},
			url : ('/admin/contents/post/hide_post.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(result){
				if(result.msg == 'SUCCESS'){
					if(result.multi == false){
						$('._post_subject_' + code).toggleClass('hide_post_subject', result.hide_status == 'N' ? false : true);
						$('._hide_badge_' + code).css('display', result.hide_status == 'N' ? 'none' : '');
						//다국어처리시 문자열 비교 불가로 버튼 문구 변환 이슈 발생 - 전부 다국어 처리하면 기능상 문제 없으나 혹시모를 경우 대비 로직변경 (문자열 비교 -> 상태 값 비교)
						$('._hide_post_btn_' + code).text(result.hide_status == 'Y' ? getLocalizeString("버튼_복원",'', "복원") : getLocalizeString("버튼_숨기기",'', "숨기기"));
						if(view_type == 'view'){		// 게시물 본문에서 변경하는 경우
							$('._post_subject').toggleClass('hide_post_subject', result.hide_status == 'N' ? false : true);
							$('._hide_badge').css('display', result.hide_status == 'N' ? 'none' : '');
							$('._hide_post_btn').text(result.hide_status == 'Y' ? getLocalizeString("버튼_복원",'', "복원") : getLocalizeString("버튼_숨기기",'', "숨기기"));
						}
					}else{
						$.each(code, function(key, val){
							$('._post_subject_' + val).toggleClass('hide_post_subject', mode == 'N' ? false : true);
							$('._hide_badge_' + val).css('display', mode == 'N' ? 'none' : '');
							$('._hide_post_btn_' + val).text(mode == 'N' ? getLocalizeString("버튼_복원",'', "복원") : getLocalizeString("버튼_숨기기",'', "숨기기"));
						});
					}
					$('#select_header').hide();
					$('#default_header').show();
				}else{
					alert(result.msg);
				}
			}
		});
	},
	openDeletePostForm:function(board_code, type, b_code, mode){
		$.ajax({
			type: 'POST',
			data: {board_code:board_code, type:type, b_code:b_code, mode:mode},
			url: ('/admin/contents/post/delete_post_form.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (html) {
				$.cocoaDialog.open({type:'admin',custom_popup:html,width:550,reopen:true, use_enter: true, hide_event:function(){
						$(window).unbind('keydown');
					}});
			}
		});
	},
	openMovePostForm:function(post_code,type,board_code){
		$.ajax({
			type: 'POST',
			data: {'post_code': post_code,'type':type,'board_code':board_code},
			url: ('/admin/contents/post/move_post_form.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (html) {
				$.cocoaDialog.open({type:'admin',custom_popup:html,width:550,reopen:true, use_enter : true, hide_event:function(){
						$(window).unbind('keydown');
					}});
			}
		});
	},
	openEditViewsPostForm:function(target,post_code, board_type){
		$.ajax({
			type: 'POST',
			data: {'target': target, 'post_code' : post_code, 'board_type' : board_type},
			url: ('/admin/contents/post/editviews_post_form.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (html) {
				$.cocoaDialog.open({type:'admin',custom_popup:html,width:550,reopen:true, use_enter : true, hide_event:function(){
						$(window).unbind('keydown');
					}});
			}
		});
	},
	openEditWriterPostForm:function(post_code, board_type, writer){
		$.ajax({
			type: 'POST',
			data: {'post_code' : post_code, 'board_type' : board_type, 'writer' : writer},
			url: ('/admin/contents/post/edit_writer_post_form.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (html) {
				$.cocoaDialog.open({type:'admin',custom_popup:html,width:550,reopen:true, use_enter : true, hide_event:function(){
						$(window).unbind('keydown');
					}});
			}
		});
	},
	openEditWriteTimePostForm:function(post_code, board_type){
		$.ajax({
			type: 'POST',
			data: {'post_code' : post_code, 'board_type' : board_type},
			url: ('/admin/contents/post/edit_writetime_post_form.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (html) {
				$.cocoaDialog.open({type:'admin',custom_popup:html,width:550,reopen:true, use_enter : true, hide_event:function(){
						$(window).unbind('keydown');
					}});
			}
		});
	},
	deletePostUploadExcel:function(idx, type){
		if(confirm(getLocalizeString("설명_삭제하시겠습니까", '', "삭제하시겠습니까?"))){
			$.ajax({
				type : 'POST',
				data : {'idx' : idx},
				url : ('/admin/ajax/delete_excel_upload_contents.cm'),
				dataType : 'json',
				async : false,
				cache : false,
				success : function(res){
					if(res.msg == 'SUCCESS'){
						adminContents.drawExcelUploadResult('', type);
					}else{
						alert(res.msg);
					}
				}
			});
		}
	},
	deletePostForm:function(code_list, type, board_code_list, mode){
		$.ajax({
			type: 'POST',
			data: {code_list:code_list, type:type, board_code_list:board_code_list},
			url: ('/admin/contents/post/delete_post_form_proc.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (result){
				if(result.msg == 'SUCCESS'){
					if(mode != 'view'){
						var comment_count = $('#comment_count');
						var total_list_comment_count = $('#total_list_comment_count');
						var all_check_btn = $('._all_check');

						if(all_check_btn.length > 0 && all_check_btn.prop('checked') === true){
							all_check_btn.prop('checked', false);
						}
						if($.isArray(code_list)){
							$.each(code_list, function(k, v){
								$('#post_item_' + v).remove();
								comment_count.text(comment_count.text() - 1);
								total_list_comment_count.text(total_list_comment_count.text() - 1);
							})
						}else{
							$('#post_item_' + code_list).remove();
							comment_count.text(comment_count.text() - 1);
							total_list_comment_count.text(total_list_comment_count.text() - 1);
						}
						if($.isArray(board_code_list)){
							$.each(board_code_list, function(k, v){
								var list_comment_count = $('#list_comment_count_' + v);
								list_comment_count.text(list_comment_count.text() - 1);
							})
						}else{
							var list_comment_count = $('#list_comment_count_' + board_code_list);
							list_comment_count.text(list_comment_count.text() - 1);
						}
						$('#select_header').hide();
						$('#default_header').show();
						$.cocoaDialog.close();
					}else{
						location.href = '/admin/contents/post';		// 게시물을 상세페이지에서 삭제할 경우 전체 게시물 관리페이지로 이동시킴
					}
				}else{
					alert(result.msg);
				}
			},
			error: function(){
				alert(getLocalizeString('설명_잠시후다시시도해주세요', '', '잠시 후 다시 시도해주세요.'));
			}
		});
	},
	EditNoticePost:function(post_code, board_type, mode, writer, view_type){
		$.ajax({
			type: 'POST',
			data: {post_code : post_code, board_type : board_type, mode : mode, writer : writer},
			url: ('/admin/contents/post/edit_notice_post.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (result) {
				if(result.msg == 'SUCCESS'){
					if(result.multi == false){
						$('._icon_notice_' + post_code).css('display', result.notice_status == 'N' ? 'none' : '');
						$('._notice_post_btn_' + post_code).text(result.notice_status == 'Y' ? getLocalizeString("버튼_공지해제",'', "공지해제") : getLocalizeString("버튼_공지설정",'', "공지설정"));
						if(view_type == 'view'){		// 게시물 본문에서 변경하는 경우
							$('._icon_notice').css('display', result.notice_status == 'N' ? 'none' : '');
							$('._notice_post_btn').text(result.notice_status == 'Y' ? getLocalizeString("버튼_공지해제",'', "공지해제") : getLocalizeString("버튼_공지설정",'', "공지설정"));
						}
					}else{
						$.each(post_code, function(key, val){
							$('._icon_notice_' + val).css('display', mode == 'N' ? 'none' : '');
							$('._notice_post_btn_' + val).text(mode == 'Y' ? getLocalizeString("버튼_공지해제",'', "공지해제") : getLocalizeString("버튼_공지설정",'', "공지설정"));
						});
					}
					$('#select_header').hide();
					$('#default_header').show();
				}else{
					alert(result.msg);
				}
			}
		});
	},
	movePostForm:function(code_list,type,change_board_code,msg,update){
		if(isBlank(change_board_code)){
			alert(getLocalizeString("설명_이동할s선택", msg, "이동할 %1 선택하세요."));
			return false;
		}
		$.ajax({
			type: 'POST',
			data: {code_list:code_list, type:type, 'change_board_code':change_board_code, update:update},
			url: ('/admin/contents/post/move_post_form_proc.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (result) {
				if(result.msg == 'SUCCESS'){
					alert(getLocalizeString("설명_게시물이이동되었습니다", '', "게시물이 이동 되었습니다."));
				}else{
					alert(result.msg);
				}
				$.cocoaDialog.close();
				location.reload();
			}
		});
	},
	editViewsPostForm:function(target,type, code, board_type){
		var cnt = $('#target_cnt').val();
		if(cnt == '' || cnt == null) {
			alert(getLocalizeString("설명_숫자를입력해주세요", '', "숫자를 입력해 주세요."));
			return false;
		}
		$.ajax({
			type: 'POST',
			data: {'target' : target, 'type' : type, 'code' : code, 'cnt' : cnt, 'board_type' : board_type},
			url: ('/admin/contents/post/editviews_post_form_proc.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (result) {
				if(result.msg == "SUCCESS") {
					alert(getLocalizeString("설명_변경되었습니다", '', "변경 되었습니다."));
					$.cocoaDialog.close();
					location.reload();
				}else
					alert(result.msg);
			}
		});
	},
	editWriterPostForm:function(code, board_type){
		var type = $('._edit_writer_type_val').val();
		var writer = $('#modify_writer').val();
		var writer_uid = $('#modify_writer_uid').val();
		if(type != 'writer' && type != 'writer_uid'){
			alert('ERROR : ' + getLocalizeString("설명_변경타입이없습니다", '', "변경 타입이 없습니다."));
			return false;
		}
		if(type == 'writer' && writer == '') {
			alert(getLocalizeString("설명_필명입력", '', "필명을 입력해 주세요."));
			return false;
		}
		if(type == 'writer_uid' && writer_uid == ''){
			alert(getLocalizeString("설명_회원ID입", '', "회원ID를 입력해 주세요."));
			return false;
		}
		$.ajax({
			type: 'POST',
			data: {code : code, type : type, writer : writer, writer_uid : writer_uid, board_type : board_type},
			url: ('/admin/contents/post/edit_writer_post_form_proc.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (result) {
				if(result.msg == "SUCCESS") {
					alert(getLocalizeString("설명_변경되었습니다", '', "변경 되었습니다."));
					$.cocoaDialog.close();
					location.reload();
				}else
					alert(result.msg);
			}
		});
	},
	editWriteTimePostForm:function(code, board_type){
		var date = $('._datepicker_input_obj').val();
		var time = $('._timepicker_input_obj').val();
		if(date == '' || date == null || time == '' || time == null) {
			alert(getLocalizeString("설명_작성시각날짜시간입력", '', "날짜와 시간을 입력해 주세요."));
			return false;
		}
		$.ajax({
			type: 'POST',
			data: {code : code, date : date, time : time, board_type : board_type},
			url: ('/admin/contents/post/edit_writetime_post_form_proc.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (result) {
				if(result.msg == "SUCCESS") {
					alert(getLocalizeString("설명_변경되었습니다", '', "변경 되었습니다."));
					$.cocoaDialog.close();
					location.reload();
				}else
					alert(result.msg);
			}
		});
	},
	DeleteBoardForm:function(board_code){
		$.ajax({
			type: 'POST',
			data: {board_code: board_code},
			url: ('/admin/contents/form/delect_board_form.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (html) {
				$.cocoaDialog.open({type:'admin',custom_popup:html,width:550,reopen:true, use_enter: true, hide_event:function(){
						$(window).unbind('keydown');
					}});
			}
		});
	},
	DeleteBoardFormProc:function(board_code){
		$.ajax({
			type: 'POST',
			data: {board_code: board_code},
			url: ('/admin/contents/form/delete_board_form_proc.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (obj) {
				if(obj.msg=="SUCCESS") location.href="/admin/contents/form";
				else alert(obj.msg);
			}
		});
	},
	DeleteFormItem:function(form_code,url){
		$.ajax({
			type: 'POST',
			data: {form_code: form_code,url: url},
			url: ('/admin/contents/form/delect_form_item.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (html) {
				$.cocoaDialog.open({type:'admin',custom_popup:html,width:550,reopen:true, use_enter: true, hide_event:function(){
						$(window).unbind('keydown');
					}});
			}
		});
	},
	DeleteFormItemList: function(codes){
		// 모달로 변경해서 더이상 사용하지 않음
		if(confirm(getLocalizeString("설명_선택한n개응답들을삭제하시겠습니까", codes.length, "선택한 %1개 응답들을 삭제하시겠습니까? 삭제된 응답은 복원할 수 없습니다."))) {
			$.ajax({
				type: 'POST',
				data: {'form_codes': codes},
				url: ('/admin/contents/form/delete_form_item_list.cm'),
				dataType: 'json',
				async: false,
				cache: false,
				success: function (obj) {
					if(obj.msg=="SUCCESS") location.reload();
					else alert(obj.msg);
				}
			});
		}
	},
	openDeleteFormItemListForm:function(codes){
		$.ajax({
			type: 'POST',
			data: { "codes": codes},
			url: ('/admin/contents/form/delete_form_item.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (html) {
				$.cocoaDialog.open({type:'admin',custom_popup:html,width:550,reopen:true, use_enter: true, hide_event:function(){$(window).unbind('keydown');}});
			}
		});
	},
	DeleteFormItemListProc: function(codes){
		$.ajax({
			type: 'POST',
			data: {'form_codes': codes},
			url: ('/admin/contents/form/delete_form_item_list.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (obj) {
				if(obj.msg=="SUCCESS") location.reload();
				else alert(obj.msg);
			}
		});
	},
	DeleteFormItemProc:function(form_code,url){
		$.ajax({
			type: 'POST',
			data: {form_code: form_code,url: url},
			url: ('/admin/contents/form/delete_board_item_proc.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (obj) {
				if(obj.msg=="SUCCESS") location.href=obj.url;
				else alert(obj.msg);
			}
		});
	},
	// 2021.08.05 제거
	/*	DeleteFormItemAll:function(board_code){
			$.ajax({
				type: 'POST',
				data: {board_code: board_code},
				url: ('/admin/contents/form/delect_form_item_all.cm'),
				dataType: 'html',
				async: false,
				cache: false,
				success: function (html) {
					$.cocoaDialog.open({type:'admin',custom_popup:html,width:550,reopen:true, use_enter: true, hide_event:function(){
							$(window).unbind('keydown');
						}});
				}
			});
		},*/
	// 2021.08.05 제거
	/*	DeleteFormItemProcAll:function(board_code){
			$.ajax({
				type: 'POST',
				data: {board_code: board_code},
				url: ('/admin/contents/form/delete_board_item_proc_all.cm'),
				dataType: 'json',
				async: false,
				cache: false,
				success: function (obj) {
					if(obj.msg=="SUCCESS") location.href="/admin/contents/form";
					else alert(obj.msg);
				}
			});
		},*/
	formUpdate:function($obj){
		$.ajax({
			type        : 'POST',
			data        : $obj.serialize(),
			url         : ('/ajax/form_edit.cm'),
			dataType    : 'json',
			async       : true,
			cache       : false,
			success     : function (result) {
				if(result.msg == 'SUCCESS'){
					alert(getLocalizeString("설명_수정되었습니다", '', "수정 되었습니다."));
				}else{
					alert(result.msg);
				}
			}
		});
	},
	formUpdateBookmark: function (form_code, status) {
		$.ajax({
			type        : 'POST',
			data		: {code: form_code},
			url			: ('/admin/contents/form/form_update_bookmark.cm'),
			dataType    : 'json',
			async       : true,
			cache       : false,
			success     : function (result) {
				if (result.msg == 'SUCCESS') {
					var $bookmark_counter = $('#bookmark_counter');
					if (status === 'all') {
						if (result.bookmark === 'Y') // bookmark 에 등록 되었을 때 #bookmark-counter +1 증가
							$bookmark_counter.text(parseInt($bookmark_counter.text()) + 1);
						else // bookmark 에 제거 되었을 때 #bookmark-counter -1 감소
							$bookmark_counter.text(parseInt($bookmark_counter.text()) - 1);
					}

					// bookmark 클릭 시 css 변경
					$('._bookmark_' + form_code).css({
						color : result.bookmark === 'Y' ? '#1168FF' : '#E5E6E6',
					});

					// status 가 bookmark 인 경우 삭제를 함.
					if (status === 'bookmark') {
						$('#_content-' + form_code).remove();
						$bookmark_counter.text(parseInt($bookmark_counter.text()) - 1);

						var comment_count = $('#comment_count');
						if (result.bookmark === 'Y')
							comment_count.text(parseInt(comment_count.text()) + 1);
						else
							comment_count.text(parseInt(comment_count.text()) - 1);
					}
				} else {
					alert(result.msg);
				}
			}
		});
	},
	gallerySyncSiteSelect : function(unit_code){
		var $html = "<option value=''>" + getLocalizeString("설명_갤러리선택", '', "갤러리 선택") + "</option>";
		$.ajax({
			type:'POST',
			data : {unit_code: unit_code},
			url : ('/admin/contents/post/change_sync_gallery_list.cm'),
			dataType : 'json',
			cache : false,
			success : function(result){
				if(result.boards != null){
					result.boards.list.forEach(function(e){
						$html += "<option value='" + e.code + "'>" + e.name + "</option>";
					});
				}
				$("#sync_board").html($html);
			}
		});
	},
	galleryCopySubmit : function(unit_code, board_code){
		var sync_unit = $('#sync_unit').val();
		var sync_board = $('#sync_board').val();
		$.ajax({
			type:'POST',
			data : {unit_code:unit_code, board_code: board_code,sync_unit:sync_unit,sync_board:sync_board},
			url : ('/admin/contents/post/sync_gallery.cm'),
			dataType : 'json',
			cache : false,
			success : function(result){
				if(result.msg == "SUCCESS"){
					location.reload();
				}else{
					alert(result.msg);
				}
			}
		});
	},
	openExcelUploadPostForm:function(board_code, type){
		$.ajax({
			type: 'POST',
			data: {board_code: board_code, type: type},
			url: ('/admin/contents/form/post_excel_upload_form.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (html) {
				$.cocoaDialog.open({type:'admin',custom_popup:html,width:550,reopen:true});
			}
		});
	},
	changeMapAPIForm: function(type){
		var ncp_map_api_form = $('#_ncp_map_api_form');
		var google_map_api_form = $('#_google_map_api_form');
		if(type == 'google'){
			ncp_map_api_form.hide();
			google_map_api_form.show();
		}else{
			ncp_map_api_form.show();
			google_map_api_form.hide();
		}
	},
	changeMapBoard: function(){
		var excel_up_board_code = $('#excel_up_board_code');
		if(excel_up_board_code.val()){
			$('#show_map_category_code').show().on('click', function(){
				adminContents.showBoardCategoryCode(excel_up_board_code.val());
			});
		}else{
			$('#show_map_category_code').hide();
		}
		excel_up_board_code.on('change', function(){
			if(excel_up_board_code.val()){
				$('#show_map_category_code').show().on('click', function(){
					adminContents.showBoardCategoryCode(excel_up_board_code.val());
				})
			}else{
				$('#show_map_category_code').hide();
			}
		});
	},
	mapExcelUploadInit: function(){
		$('#post_excel_file_upload').fileupload({
			url: '/admin/ajax/excel_upload.cm',
			formData: {target_code: 'map_excel'},
			dataType: 'json',
			singleFileUploads: true,
			limitMultiFileUploads: 1,
			start: function(e, data){
				$('#post_excel_file_upload').addClass('file-loading');
			},
			progress: function(e, data){
				var progress = parseInt(data.loaded / data.total * 100, 10);
				if(progress == 100){
				}
			},
			done: function(e, data){
				var $google_map_api_key = $('#_google_map_api_key');
				var $ncp_map_api_key = $('#_ncp_map_api_key');
				var $ncp_map_api_secret = $('#_ncp_map_api_secret');
				var $board_code	= $('#excel_up_board_code');
				var api_type = 'naver';
				api_type = $('input[name=map_api_type]:checked').val();

				if(api_type === 'google'){
					if($google_map_api_key.val().trim() == ''){
						alert(getLocalizeString("설명_GoogleMapsAPIkey를입력해주세요", "", "Google Maps API key를 입력해 주세요."));
						$google_map_api_key.focus();
						$('#post_excel_file_upload').removeClass('file-loading');
						$('#post_excel_file_upload').val('');
						return false;
					}
				}else{
					if($ncp_map_api_key.val().trim() == ''){
						alert(getLocalizeString("설명_네이버클라우드지도APIID를입력해주세요", "", "네이버 클라우드 플랫폼 지도 API Client ID를 입력해 주세요."));
						$ncp_map_api_key.focus();
						$('#post_excel_file_upload').removeClass('file-loading');
						$('#post_excel_file_upload').val('');
						return false;
					}else if($ncp_map_api_secret.val().trim() == ''){
						alert(getLocalizeString("설명_네이버클라우드지도APISecret을입력해주세요", "", "네이버 클라우드 플랫폼 지도 API Client Secret을 입력해 주세요."));
						$ncp_map_api_secret.focus();
						$('#post_excel_file_upload').removeClass('file-loading');
						$('#post_excel_file_upload').val('');
						return false;
					}
				}

				if($board_code.val().trim() == ''){
					alert(getLocalizeString("설명_업로드할지도게시판선택해주세요", "", "업로드할 지도 게시판을 선택해 주세요."));
					$('#post_excel_file_upload').removeClass('file-loading');
					$('#post_excel_file_upload').val('');
				}else{
					var res_data = data.result;
					$.ajax({
						type : 'POST',
						data : {'file_name': res_data.file_name, 'board_code': $board_code.val()},
						url : ('/admin/ajax/run_map_batch.cm'),
						dataType : 'json',
						success : function(res){
							if(res.msg == 'SUCCESS'){
								EXCEL_UPLOAD_MAP_LIST.init({
									'file_name': res_data.file_name,
									'total':res.total_cnt,
									'board_code': $board_code.val(),
									'google_api_key': $google_map_api_key.val(),
									'ncp_api_key': $ncp_map_api_key.val(),
									'ncp_api_secret': $ncp_map_api_secret.val(),
									'api_type': api_type
								});
							}else{
								$('#post_excel_file_upload').removeClass('file-loading');
								$('#post_excel_file_upload').val('');
								if(res.msg == 'EXCEL_ERROR'){

									$('#post_file_upload_add_status_msg').removeClass('alert-success');
									$('#post_file_upload_add_status_msg').addClass('alert-danger');
									var msg = getLocalizeString("설명_엑셀등록실패", '', "엑셀 등록을 실패하였습니다. 오류 내역을 수정하시고 다시 업로드 해주세요.<br/>CSV 업로드인 경우 UTF-8 형식만 지원합니다.");
									var api_error = {"API_KEY_INVALID": getLocalizeString("설명_API키오류", '', "API 키 오류"), "API_OVER_LIMIT": getLocalizeString("설명_API최대호출수초과", '', "API 1일 최대 호출 수를 초과")};
									if (res.error_list){
										msg += '<div style="padding-top: 20px;">';
										msg += getLocalizeString("설명_오류게시물목록총n개", res.error_list.length, "<strong>오류 게시물 목록 (총 %1개)</strong>");
										msg += '<ul>';
										for(var i = 0; i < res.error_list.length; i++){
											if(api_error[res.error_list[i].error_msg] != undefined){
												res.error_list[i].error_msg = api_error[res.error_list[i].error_msg];
											}
											msg += '<li><span class="text-gray line">' + getLocalizeString("설명_n1행_n2열", [res.error_list[i].row_index, res.error_list[i].cell_char], "%1행 %2열") + ' </span><span>' + res.error_list[i].error_msg + '</span></li>';
											if (i>10) break;	//최대 10개만 뿌림
										}
										msg += '</ul></div>';
									}
									$('#post_file_upload_add_status_msg').html(msg).show();
								} else {
									alert(res.msg);
								}
							}
						}
					});
				}
			},
			fail: function(e, data){
				$('#post_excel_file_upload').removeClass('file-loading');
				alert(getLocalizeString("설명_업로드에실패하였습니다", '', "업로드에 실패 하였습니다."));
			}
		});

	},
	deleteFile: function(file_name){
		$.ajax({
			type: 'POST',
			data: {'type': 'delete', 'file_name':file_name},
			url: ('/admin/contents/form/excel_upload_end.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (res) {
				if(res == 'SUCCESS'){
					location.reload();
				}
			}
		});
	},
	postExcelUploadInit:function(board_code){
		$('#post_excel_file_upload').fileupload({
			url: '/admin/ajax/excel_upload.cm',
			formData: {target_code: 'post_excel'},
			dataType: 'json',
			singleFileUploads: true,
			limitMultiFileUploads: 1,
			start: function(e, data){
				$('#post_excel_file_upload').addClass('file-loading');
			},
			progress: function(e, data){
				var progress = parseInt(data.loaded / data.total * 100, 10);
				if(progress == 100){
				}
			},
			done: function(e, data){
				var res_data = data.result;
				$.ajax({
					type : 'POST',
					data : {'file_name':res_data.file_name,'board_code':board_code},
					url : ('/admin/ajax/run_post_batch.cm'),
					dataType : 'json',
					success : function(res){
						$('#post_excel_file_upload').removeClass('file-loading');
						if(res.msg=='SUCCESS'){
							$('#post_file_upload_add_status_msg').addClass('alert-success');
							$('#post_file_upload_add_status_msg').removeClass('alert-danger');
							var msg = getLocalizeString("설명_n개게시물등록완료", res.success_cnt, "%1개의 게시물 등록이 완료되었습니다.");
							$('#post_file_upload_add_status_msg').html(msg).show();
						}else if(res.msg=='EXCEL_ERROR'){
							$('#post_file_upload_add_status_msg').removeClass('alert-success');
							$('#post_file_upload_add_status_msg').addClass('alert-danger');
							var msg = getLocalizeString("설명_엑셀등록실패", "", "엑셀 등록을 실패하였습니다. 오류 내역을 수정하시고 다시 업로드 해주세요.<br/>CSV 업로드인 경우 UTF-8 형식만 지원합니다.");
							if (res.error_list){
								msg += '<div style="padding-top: 20px;">';
								msg += getLocalizeString("설명_오류게시물목록총n개", res.error_list.length, "<strong>오류 게시물 목록 (총 %1개)</strong>");
								msg += '<ul>';
								for(var i = 0; i < res.error_list.length; i++){
									msg += '<li><span class="text-gray line">' + getLocalizeString("설명_n1행_n2열", [res.error_list[i].row_index, res.error_list[i].cell_char ], "%1행 %2열") + ' </span><span>' + res.error_list[i].error_msg + '</span></li>';
									if (i>10) break;	//최대 10개만 뿌림
								}
								msg += '</ul></div>';
							}
							$('#post_file_upload_add_status_msg').html(msg).show();
						}else{
							$('#post_file_upload_add_status_msg').removeClass('alert-success');
							$('#post_file_upload_add_status_msg').addClass('alert-danger');
							$('#post_file_upload_add_status_msg').html(res.msg).show();
						}
					}
				});
			},
			fail: function(e, data){
				$('#post_excel_file_upload').removeClass('file-loading');
				alert(getLocalizeString("설명_업로드에실패하였습니다", '', "업로드에 실패 하였습니다."));
			}
		});
	},
	contentsExcelUploadInit:function(board_code, type){
		$('#post_excel_file_upload').fileupload({
			url: '/admin/ajax/excel_upload.cm',
			formData: {target_code: 'post_excel'},
			dataType: 'json',
			singleFileUploads: true,
			limitMultiFileUploads: 1,
			start: function(e, data){
				$('#post_excel_file_upload').addClass('file-loading');
			},
			progress: function(e, data){
				var progress = parseInt(data.loaded / data.total * 100, 10);
				if(progress == 100){
				}
			},
			done: function(e, data){
				var res_data = data.result;
				if(type === 'map') {
					var $google_map_api_key = $('#_google_map_api_key');
					var $ncp_map_api_key = $('#_ncp_map_api_key');
					var $ncp_map_api_secret = $('#_ncp_map_api_secret');
					var $board_code	= $('#excel_up_board_code');
					var api_type = 'naver';
					api_type = $('input[name=map_api_type]:checked').val();

					if(api_type === 'google'){
						if($google_map_api_key.val().trim() == ''){
							alert(getLocalizeString("설명_GoogleMapsAPIkey를입력해주세요", '', "Google Maps API key를 입력해 주세요."));
							$google_map_api_key.focus();
							$('#post_excel_file_upload').removeClass('file-loading');
							$('#post_excel_file_upload').val('');
							return false;
						}
					}else{
						if($ncp_map_api_key.val().trim() == ''){
							alert(getLocalizeString("설명_네이버클라우드지도APIID를입력해주세요", '', "네이버 클라우드 플랫폼 지도 API Client ID를 입력해 주세요."));
							$ncp_map_api_key.focus();
							$('#post_excel_file_upload').removeClass('file-loading');
							$('#post_excel_file_upload').val('');
							return false;
						}else if($ncp_map_api_secret.val().trim() == ''){
							alert(getLocalizeString("설명_네이버클라우드지도APISecret을입력해주세요", '', "네이버 클라우드 플랫폼 지도 API Client ID를 입력해 주세요."));
							$ncp_map_api_secret.focus();
							$('#post_excel_file_upload').removeClass('file-loading');
							$('#post_excel_file_upload').val('');
							return false;
						}
					}
					if($board_code.val().trim() == ''){
						alert(getLocalizeString("설명_업로드할지도게시판선택해주세요", '', "업로드할 지도 게시판을 선택해 주세요."));
						$('#post_excel_file_upload').removeClass('file-loading');
						$('#post_excel_file_upload').val('');
					}

					var post_data = {
						'file_name' : res_data.file_name,
						'board_code' : $board_code.val(),
						'type' : type,
						'google_map_api_key' : $google_map_api_key.val(),
						'ncp_map_api_secret' : $ncp_map_api_secret.val(),
						'ncp_map_api_key' : $ncp_map_api_key.val(),
						'api_type' : api_type
					};
				} else {
					var post_data = {
						'file_name' : res_data.file_name,
						'board_code' : board_code,
						'type' : type
					}
				}

				$.ajax({
					type : 'POST',
					data : post_data,
					url : ('/admin/ajax/upload_excel_contents.cm'),
					dataType : 'json',
					success : function(res){
						if (res.msg === 'SUCCESS') {
							var interval = setInterval(function(){
								$('#post_excel_file_upload').removeClass('file-loading');
								adminContents.drawExcelUploadResult(board_code, type);
								clearInterval(interval);
							}, 2000);
						} else {
							alert(res.msg);
							$('#post_excel_file_upload').removeClass('file-loading');
						}
					}
				});
			},
			fail: function(e, data){
				$('#post_excel_file_upload').removeClass('file-loading');
				alert(getLocalizeString("설명_업로드에실패하였습니다", '', "업로드에 실패 하였습니다."));
			}
		});
	},
	drawExcelUploadResult : function(board_code, type) {
		$.ajax({
			type : 'POST',
			url : ('/admin/ajax/get_excel_contents_upload.cm'),
			dataType : 'json',
			data : {'board_code' : board_code, 'type' : type},
			async : false,
			cache : false,
			success : function(res){
				if(res.msg === 'SUCCESS') {
					if(type === 'map'){
						$('#msg_section').html(res.html).show();
					}else {
						if($('#log_list_table_wrap').css('display') === 'none'){
							$('#inform_expire_msg').show();
							$('#log_list_table_wrap').show();
						}
						if(res.html == "\t\t" || !res.html) { // row 값이 존재하지 않을때
							$('#inform_expire_msg').hide();
							$('#log_list_table_wrap').hide();
						} else {
							$('#inform_expire_msg').show();
							$('#log_list_table').html(res.html);
						}

					}
				}
			}
		});
	},
	openMemberInfo:function(member_code){
		$.ajax({
			type: 'POST',
			data: {'member_code':member_code},
			url: ('/admin/contents/post/get_member_info.cm'),
			dataType: 'html',
			success: function(html){
				$.cocoaDialog.open({type:'admin', custom_popup:html, width:550});
			}
		})
	},
	showBoardCategoryCode : function(board_code){
		$.ajax({
			type : 'POST',
			data : {board_code : board_code},
			url : ('/admin/contents/post/show_board_category_code.cm'),
			dataType : 'html',
			success : function(html){
				$.cocoaDialog.open({type : 'admin', custom_popup : html, width:550});
			}
		})
	},
	editPostCategory : function(code, category_code, type){
		$.ajax({
			type : 'POST',
			data : {'code' : code, 'category_code' : category_code, 'type' : type},
			url : ('/admin/contents/post/edit_post_category.cm'),
			dataType : 'json',
			success : function(result){
				if(result.msg == 'SUCCESS'){
					location.reload();
				}else{
					alert(result.msg);
				}
			}
		})
	},

	openModalBoardExcelDownload : function(board_code, type){
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/open_download_excel_contents_list.cm'),
			data : {'board_code':board_code, 'type':type},
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg === 'SUCCESS'){
					$.cocoaDialog.open({type : 'board_excel_download', custom_popup : res.html, width : 550});
				}else{
					alert(res.msg);
				}
			}
		});
	},

	loadExcelList : function(type){
		$.ajax({
			type : 'POST',
			url : ('/admin/ajax/get_excel_contents_list.cm'),
			dataType : 'json',
			data : {'type' : type},
			async : false,
			cache : false,
			success : function(res){
				if(res.msg === 'SUCCESS'){
					$('.modal_board_excel_download').find('._excel_empty_wrap').hide();
					$('.modal_board_excel_download').find('#_excel_list_body').html(res.html);
				}else{
					$('.modal_board_excel_download').find('#_excel_list_body').empty();
					$('.modal_board_excel_download').find('._excel_empty_wrap').show();
				}
			}
		});
	},

	runBoardContentsExcelMake : function(board_code, type){
		var $dashboard_loader_sub = $('#dashboard_loader_sub');
		$.ajax({
			type: 'POST',
			url: '/admin/ajax/request_excel_contents_list.cm',
			dataType: 'json',
			data : {'board_code' : board_code, 'type' : type},
			cache: false,
			beforeSend : function() {
				$dashboard_loader_sub.show();
			},
			success: function (res) {
				if ( res.msg == 'SUCCESS' ) {
					var interval = setInterval(function(){
						$dashboard_loader_sub.hide();
						adminContents.loadExcelList(type, board_code);
						clearInterval(interval);
					}, 2000);
				} else {
					alert(res.msg);
					$dashboard_loader_sub.hide();
				}
			},
			error : function(res) {
				$dashboard_loader_sub.hide();
			}
		});
	},

	deleteBoardExcel : function(idx, type){
		if(confirm(getLocalizeString("설명_삭제하시겠습니까", '', "삭제하시겠습니까?"))){
			$.ajax({
				type: 'POST',
				data: {'idx': idx},
				url: ('/admin/ajax/delete_excel_contents.cm'),
				dataType: 'json',
				async: false,
				cache: false,
				success: function(res){
					if(res.msg == 'SUCCESS'){
						adminContents.loadExcelList(type);
					}else{
						alert(res.msg);
					}
				}
			});
		}
	},

	deleteBoardUploadExcel : function(idx, type){
		if(confirm(getLocalizeString("설명_삭제하시겠습니까", '', "삭제하시겠습니까?"))){
			$.ajax({
				type: 'POST',
				data: {'idx': idx},
				url: ('/admin/ajax/delete_excel_upload_contents.cm'),
				dataType: 'json',
				async: false,
				cache: false,
				success: function(res){
					if(res.msg == 'SUCCESS'){
						adminContents.drawExcelUploadResult('', type);
					}else{
						alert(res.msg);
					}
				}
			});
		}
	},
	setChangeListSort : function(type, $obj){
		var board_code = null;
		var action_index = null;
		var target_index = null;
		$obj.sortable({
			'handle' : '._sortable_handle',
			'start' : function(event, ui){
				board_code = ui.item.data('code');
				action_index = ui.item.index();
			},
			'stop' : function(event, ui){
				target_index = ui.item.index();
				// 제자리 이동 시 무시
				if ( target_index == action_index ) { return false; }
				if(target_index < action_index){
					var pos = 'up';
					var $target_obj = ui.item.next();
				}else{
					var pos = 'down';
					var $target_obj =  ui.item.prev();
				}
				var target_code = $target_obj.data('code');

				if(isBlank(board_code)) return false;
				if(isBlank(target_code)) return false;
				if(board_code == target_code) return false;

				$.ajax({
					type: 'POST',
					data: {'type' : type,'board_code':board_code, 'target_code':target_code, 'pos' : pos},
					url: ('/admin/ajax/content_change_sort.cm'),
					dataType: 'json',
					success: function (res) {
						if(res.msg == 'SUCCESS'){

						}else
							alert(res.msg);
					}
				});

			}
		});
	}
};



var EXCEL_UPLOAD_MAP_LIST = {
	post_data: {},
	global_error : '',
	location_err_list : [],
	total: 0,
	success: 0,
	idx: 0,
	init : function(data){
		this.post_data = data;
		this.total = data.total;

		this.upload();
	},
	upload: function(){
		var progress = Math.round((this.idx/this.total) * 100);
		var msg = '<span class="text-gray-light">'+this.idx+'/'+this.total+' ('+progress+'%)</span>';
		msg += '<div class="progress progress-striped active">';
		msg += '<div class="progress-bar progress-bar-primary" id="map_progress" style="width:'+progress+'%"></div>';
		msg += '</div>';
		$('#post_file_upload_add_status_msg').html(msg).show();


		var post_data = this.post_data;
		post_data['start'] = this.idx;
		$.ajax({
			type : 'POST',
			data : post_data,
			url : ('/admin/ajax/run_map_batch_exe.cm'),
			dataType : 'json',
			success : function(res){
				if(res.location_err_list.length > 0){
					var loca_err = res.location_err_list;
					for(var i=0; i<loca_err.length;i++){
						EXCEL_UPLOAD_MAP_LIST.location_err_list.push(loca_err[i]);
					}
				}
				if(res.global_error != '')
					EXCEL_UPLOAD_MAP_LIST.global_error = res.global_error;
				EXCEL_UPLOAD_MAP_LIST.success += res.success_cnt;
				EXCEL_UPLOAD_MAP_LIST.idx = (res.next_idx);
				EXCEL_UPLOAD_MAP_LIST.next();
			}
		});
	},
	next : function(){
		if(this.global_error == '' && this.total > this.idx){
			setTimeout(function(){
				EXCEL_UPLOAD_MAP_LIST.upload();
			},1000);
		}else {
			//업로드 다 끝남
			var result = {'global_error': this.global_error, 'last': this.idx, 'total_cnt': this.total, 'success_cnt': this.success,'location_err_list': this.location_err_list};
			var file_name = this.post_data['file_name'];

			$('#post_excel_file_upload').removeClass('file-loading');
			$('#post_file_upload_add_status_msg').addClass('alert-success');
			$('#post_file_upload_add_status_msg').removeClass('alert-danger');
			$.cocoaDialog.close();
			$.ajax({
				type: 'POST',
				data: {'data': result, 'file_name': file_name},
				url: ('/admin/contents/form/excel_upload_end.cm'),
				dataType: 'html',
				async: false,
				cache: false,
				success: function (html) {
					$.cocoaDialog.open({type:'admin',custom_popup:html,width:500,reopen:true});
				}
			});
		}

	}


};