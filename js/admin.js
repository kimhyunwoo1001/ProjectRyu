var ADMIN = (function(){
	
	var init = function(){
		
	};
	
	var openProfile = function(){
		$.ajax({
			type: 'POST',
			data: {},
			url: ('/admin/ajax/dialog/profile.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (res) {
				var $html = $(res);
				$.cocoaDialog.open({type:'mypage',custom_popup:$html});
			}
		});
	};

	var openOpinion = function(){
		$.ajax({
			type: 'POST',
			data: {},
			url: ('/admin/ajax/dialog/opinion.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (res) {
				var $html = $(res);
				$.cocoaDialog.open({type:'opinion',custom_popup:$html});
			}
		});
	};

	var showLoader = function(){
		$('#dashboard_loader').show();
	};

	var hideLoader = function(){
		$('#dashboard_loader').hide();
	};

    /***
	 * 관리자페이지 언어 변경처리
     * @param lang
     */
	var changeAdminLang = function(lang){
        $.ajax({
            type: 'POST',
            data: {'lang':lang},
            url: ('/admin/ajax/change_admin_lang.cm'),
            dataType: 'json',
            async: false,
            cache: false,
            success: function (res) {
            	if(res.msg == 'SUCCESS'){
					location.href = res.back_url;
				}else{
            		console.log(res.msg);
				}
            }
        });
	};

	return {
		init : function(){
			init();
		},
		openProfile : function(){
			openProfile();
		},
		openOpinion : function(){
			openOpinion();
		},
		showLoader : function(){
			showLoader();
		},
		hideLoader : function(){
			hideLoader();
		},
        changeAdminLang : function(lang){
			changeAdminLang(lang);
		}
	};
})();
var HEADER_CONTROL = function(){
	var $header, $option_list,$footer_option_list;
	var btn_list = [];
	var btn_type = {
		"save": {
			key : 'save',
			name : getLocalizeString("버튼_저장", "", "저장"),
			changing : true
		},
		"add": {
			key : 'add',
			name : getLocalizeString("버튼_추가", "", "추가"),
			changing : true
		},
		"cancel": {
			key : 'cancel',
			name : getLocalizeString("버튼_취소", "", "취소"),
			changing : false
		},
		"delete": {
			key : 'delete',
			name : getLocalizeString("버튼_삭제", "", "삭제"),
			changing : false
		},
		"navi": {
			key : 'navi',
			name : 'navi',
			changing : false
		}
	};
	var init = function(){
		$header = $('#header');
		$option_list = $header.find('._option_list');
		$footer_option_list = $('<div />');
		$('#content').find("section").append($footer_option_list);

		$(window).bind('beforeunload', function(){
			if(!$(".headerbar").find(".btn-primary").hasClass('disabled')){
				return getLocalizeString("설명_변경사항이저장되지않을", "", "변경사항이 저장되지 않을 수 있습니다.");
			}
		});
	};

	var init2 = function($save_btn_bottom_wrap){
		$header = $('#header');
		$option_list = $header.find('._option_list');
		$footer_option_list = $('<div />');
		$save_btn_bottom_wrap.append($footer_option_list);


		$(window).bind('beforeunload', function(){
			if(!$(".headerbar").find(".btn-primary").hasClass('disabled')){
				return getLocalizeString("설명_변경사항이저장되지않을", "", "변경사항이 저장되지 않을 수 있습니다.");
			}
		});
	};

	var addBtn = function(type, callback){
		switch(type){
			case 'save' :
			case 'add' :
				var $footer_btn_wrap;
				var $footer_btn;
				var $btn_wrap = $('<li />');
				var $btn = $('<a class="btn btn-primary" />')
					.text(btn_type[type].name)
					.toggleClass('disabled', btn_type[type].changing)
					.data({
						btn_data : btn_type[type],
						changing : false
					});
				if(typeof callback == 'function'){
					$btn.off('click').on('click', function(){
						if($(this).data('changing') || !btn_type[type].changing){
							callback();
						}
					});
				}
				$footer_btn_wrap = $btn_wrap.clone();
				$footer_btn = $btn.clone(true);

				$btn_wrap.append($btn);
				$option_list.append($btn_wrap);
				btn_list.push($btn);

				$footer_option_list.append($footer_btn);
				btn_list.push($footer_btn);
				break;
			case 'delete' :
			case 'cancel' :
				var $btn_wrap = $('<li />');
				var $btn = $('<a class="btn btn-default-bright" href="javascript:;" />')
					.text(btn_type[type].name)
					.data({
					btn_data : btn_type[type]
				});
				if(typeof callback == 'function'){
					$btn.off('click').on('click', function(){
						callback();
					});
				}

				$btn_wrap.append($btn);
				$option_list.append($btn_wrap);
				btn_list.push($btn);
				break;
			case 'navi' :
				var $btn_wrap = $('<li />');
				var $btn_group = $('<div class="btn-group" role="group" aria-label="button group" />');
				var $btn_prev = $('<a class="btn btn-default-bright" href="javascript:;" role="button"/><i class="btl bt-angle-left" /></a>').data({
					btn_data : btn_type[type]
				});
				var $btn_next = $('<a class="btn btn-default-bright" href="javascript:;" role="button"/><i class="btl bt-angle-right" /></a>').data({
					btn_data : btn_type[type]
				});
				if(typeof callback == 'function'){
					$btn_prev.off('click').on('click', function(){
						callback('prev');
					});
					$btn_next.off('click').on('click', function(){
						callback('next');
					});
				}
				$btn_group.append($btn_prev);
				$btn_group.append($btn_next);
				$btn_wrap.append($btn_group);
				$option_list.append($btn_wrap);
				btn_list.push($btn);
				break;
		}

	};
	var change = function(){
		$.each(btn_list, function(e, $v){
			if($v.data('btn_data').changing){
				$v.toggleClass('disabled', false).data({
					changing : true
				});
			}
		});
	};

	var save = function(){
		$.each(btn_list, function(e, $v){
			if($v.data('btn_data').changing){
				$v.toggleClass('disabled', true).data({
					changing : false
				});
			}
		});
	};

	var isChange = function(){
		var is = false;
		$.each(btn_list, function(e, $v){
			if($v.data('btn_data').changing){
				if($v.data('changing')){
					is = true;
					return false;
				}
			}
		});
		return is;
	};


	return {
		init : function(){
			init();
		},
		init2: function($save_btn_bottom_wrap){
			init2($save_btn_bottom_wrap);
		},
		change : function(){
			change();
		},
		save : function(){
			save();
		},
		addBtn : function(type, callback){
			addBtn(type, callback);
		},
		isChange : function(){
			return isChange();
		}
	};
};



var SADMIN_POPUP = (function(){
	var openPopup = function(issue){
		if(typeof issue == 'undefined')
			issue = '';
		$.ajax({
			type : 'POST',
			data : {'issue' : issue},
			url : ('/admin/ajax/dialog/popup.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (res) {
				var $html = $(res);
				$.cocoaDialog.open({type:'admin',custom_popup:$html});
			}
		});
	};

	return {
		openPopup : function(issue){
			openPopup(issue);
		}
	};
})();

var SADMIN_MENU_ALERT = (function(){
	var openAlert = function(){
		this.ajaxUrl = '/admin/ajax/dialog/menu_alert.cm';
		var str_url = location.pathname;

		if ( IMWEB_SESSIONSTORAGE.get("MENU_ALERT_EMPTY_" + str_url) == 'Y' ) return;

		$.ajax({
			url : this.ajaxUrl,
			type : 'POST',
			dataType : 'HTML',
			data : {'mode' : 'open', 'str_url': str_url},
			success : function(res){
				if ( res.length == 0 ) {
					IMWEB_SESSIONSTORAGE.set("MENU_ALERT_EMPTY_" + str_url, 'Y', 60);
				} else {
					if($("#menu_alert").length == 0 ){
						$("#content section .section-body").prepend(res);
						$("#menu_alert").show();
					}
				}
			}
		});
	};

	var closeAlert = function(idx){
		$.ajax({
			url : this.ajaxUrl,
			type : 'POST',
			dataType : 'HTML',
			data : {mode : 'close', 'idx' : idx},
			success : function(){
				$("#menu_alert").hide();
			}
		});
	};
	return {
		ajaxUrl : null,
		'openAlert' : function(){
			openAlert();
		},
		'closeAlert' : function(idx){
			closeAlert(idx);
		}
	};
})();