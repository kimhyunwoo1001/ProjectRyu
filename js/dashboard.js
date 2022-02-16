var DASHBOARD = (function(){

	var notice_list_page = 1;
	var notice_list_page_more = true;
	var activity_list_page = 1;
	var activity_list_page_more = true;
	var activity_list_cnt = 1;
	/*var re = /(?:(?=(?:http|https):)([a-zA-Z][-+.a-zA-Z\d]*):(?:((?:[-_.!~*'()a-zA-Z\d;?:@&=+$,]|%[a-fA-F\d]{2})(?:[-_.!~*'()a-zA-Z\d;\/?:@&=+$,\[\]]|%[a-fA-F\d]{2})*)|(?:(?:\/\/(?:(?:(?:((?:[-_.!~*'()a-zA-Z\d;:&=+$,]|%[a-fA-F\d]{2})*)@)?(?:((?:(?:(?:[a-zA-Z\d](?:[-a-zA-Z\d]*[a-zA-Z\d])?)\.)*(?:[a-zA-Z](?:[-a-zA-Z\d]*[a-zA-Z\d])?)\.?|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\[(?:(?:[a-fA-F\d]{1,4}:)*(?:[a-fA-F\d]{1,4}|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|(?:(?:[a-fA-F\d]{1,4}:)*[a-fA-F\d]{1,4})?::(?:(?:[a-fA-F\d]{1,4}:)*(?:[a-fA-F\d]{1,4}|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}))?)\]))(?::(\d*))?))?|((?:[-_.!~*'()a-zA-Z\d$,;:@&=+]|%[a-fA-F\d]{2})+))|(?!\/\/))(\/(?:[-_.!~*'()a-zA-Z\d:@&=+$,]|%[a-fA-F\d]{2})*(?:;(?:[-_.!~*'()a-zA-Z\d:@&=+$,]|%[a-fA-F\d]{2})*)*(?:\/(?:[-_.!~*'()a-zA-Z\d:@&=+$,]|%[a-fA-F\d]{2})*(?:;(?:[-_.!~*'()a-zA-Z\d:@&=+$,]|%[a-fA-F\d]{2})*)*)*)?)(?:\?((?:[-_.!~*'()a-zA-Z\d;\/?:@&=+$,\[\]]|%[a-fA-F\d]{2})*))?)(?:\#((?:[-_.!~*'()a-zA-Z\d;\/?:@&=+$,\[\]]|%[a-fA-F\d]{2})*))?)/img;*/

	var getNoticeList = function(list_body_obj){
		if(notice_list_page_more){
			$.ajax({
				type : 'POST',
				data : {page : notice_list_page},
				url : ('/admin/ajax/support/get_notice_list.cm'),
				dataType : 'json',
				async : true,
				cache : false,
				success : function(obj){
					list_body_obj.append(obj.html);
					notice_list_page = obj.page;
					notice_list_page_more = obj.more == "Y";

					$('#notice_list').imagesLoaded()
						.always(function(ins){
							$('#notice_list').masonry({
								// options
								itemSelector : '.ma-item'
							});
						});

				}
			});
		}
	};

	var getActivityList = function(list_body_obj){
		if(activity_list_page_more){
			$.ajax({
				type : 'POST',
				data : {page : activity_list_page, cnt : activity_list_cnt},
				url : ('/admin/ajax/stat/get_activity_list.cm'),
				dataType : 'json',
				async : true,
				cache : false,
				success : function(obj){
					list_body_obj.append(obj.html);
					activity_list_page = obj.page;
					activity_list_page_more = obj.more == "Y";
					activity_list_cnt = obj.cnt;
				}
			});
		}
	};

	var dashboard_init = function(){
		$('#dashboard_list').imagesLoaded().always(function(ins) {
			$('#dashboard_list').masonry({ itemSelector: '.ma-item' });
		});

		var autolinker = new Autolinker({	//자동으로 url 링크로 전환
			urls: {
				schemeMatches: true,
				wwwMatches: true,
				tldMatches: true
			},
			email: false,
			stripPrefix: false,
			newWindow: true,

			truncate: {
				length: 0,
				location: 'end'
			},
			className: ''
		});

		$('._memo_body').each(function (i, elem) {
			$(elem).html(autolinker.link($(elem).html()));
		});
		autosize(document.querySelectorAll('textarea'));
		// var owl = $('#DashboardBanner');
		//
		// owl.owlCarousel({
		// 	'items': 1,
		// 	'nav' : true,
		// 	'loop' : true,
		// 	'dots' : true
		// });
	};

	var updateIsDashboardFirstEnter = function(){
		$.ajax({
			type : 'POST',
			url : ('/admin/ajax/dashboard/update_is_dashboard_first_enter.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(result){
				if(result.msg === "SUCCESS"){
					// location.reload();
				}else{
					alert(result.msg);
				}
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
							$('._custom_popover._dashboard_reseller_popover_before').hide();
							$('._custom_popover._dashboard_reseller_popover_before').popover('hide');

							$('._custom_popover._dashboard_reseller_popover_after').show();
							$('._custom_popover._dashboard_reseller_popover_after').popover('show');
						}else
							alert(res.msg);
					}
				});
			}
		}
	};

	var showUpdateMemoForm = function(memo_idx){
		$('#old_memo_'+memo_idx).hide();
		$('#update_memo_wrap_'+memo_idx).show();
		var height = $('#update_memo_wrap_'+memo_idx).find("#update_memo").prop('scrollHeight');
		$('#update_memo_wrap_'+memo_idx).find("#update_memo").css('height', height+5);
	};

	var hideUpdateMemoForm = function(memo_idx){
		$('#old_memo_'+memo_idx).show();
		$('#update_memo_wrap_'+memo_idx).hide();
		$('#update_memo_wrap_'+memo_idx).find('#update_memo').val($('#old_memo_'+memo_idx).text());
	};

	var releaseTopMemo = function(memo_idx){
		$.ajax({
			type : 'POST',
			data : {memo_idx :memo_idx},
			url : ('/admin/ajax/dashboard/release_top_memo.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(result){
				if(result.msg === "SUCCESS"){
					location.reload();
				}else{
					alert(result.msg);
				}
			}
		});
	};
	var moveTopMemo = function(memo_idx){
		$.ajax({
			type : 'POST',
			data : {memo_idx :memo_idx},
			url : ('/admin/ajax/dashboard/move_top_memo.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(result){
				if(result.msg === "SUCCESS"){
					location.reload();
				}else{
					alert(result.msg);
				}
			}
		});
	};

	var deleteMemo = function(memo_idx){
		if(confirm(getLocalizeString("설명_정말로삭제하시겠습니까", "", "정말로 삭제하시겠습니까?"))){
			$.ajax({
				type : 'POST',
				data : {memo_idx :memo_idx},
				url : ('/admin/ajax/dashboard/delete_managers_memo.cm'),
				dataType : 'json',
				async : false,
				cache : false,
				success : function(result){
					if(result.msg === "SUCCESS"){
						location.reload();
					}else{
						alert(result.msg);
					}
				}
			});
		}else
			return false;
	};

	var addMemo = function($obj){
		var data = $obj.serializeObject();
		if($obj.find('#memo').val() === ''){
			alert(getLocalizeString("설명_내용을입력해주세요", "", "내용을 입력해주세요."));
			return;
		}
		$.ajax({
			type : 'POST',
			data : data,
			url : ('/admin/ajax/dashboard/add_managers_memo.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(result){
				if(result.msg === "SUCCESS"){
					location.reload();
				}else{
					alert(result.msg);
				}
			}
		});
	};

	var openSiteManagementDialog = function(btn){
		if($.cocoaStickerModal.isOpen()){
			$.cocoaStickerModal.close();
		}
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/dialog/site_management.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (html) {
				$.cocoaStickerModal.open({
					target: btn,
					html: html,
					width: '320px',
					top: -4,
					left: 193
				});
			}
		});
	};

	/**
	 * 쇼핑, 예약 메뉴를 애니메이션 처리로 숨김/노출 처리함
	 * @param name
	 * @param is_show
	 */
	var toggleHiddenMenu = function(name, is_show){
		var $target = $('#main-menu').find('li[data-title=' + name + ']');
		if($target.length > 0){
			if(is_show){
				$target.addClass('animated');
				setTimeout(function(){
					$target.removeClass('animated-hidden');
					setTimeout(function(){
						$target.removeClass('animated');
					}, 200);
				}, 10);
			}else{
				if($target.hasClass('expanded')){
					// 메뉴 확장되었을 때 닫고 애니메이션 실행
					$target.find('> ul').stop().slideUp(170, function (){
						$target.removeClass('expanded').addClass('animated');
						setTimeout(function(){
							$target.addClass('animated-hidden');
						}, 10);
					});
				}else{
					$target.addClass('animated');
					setTimeout(function(){
						$target.addClass('animated-hidden');
					}, 10);
				}

			}
		}
	};

	return {
		'dashboard_init' : function(){
			dashboard_init();
		},
		'updateIsDashboardFirstEnter' : function(){
			updateIsDashboardFirstEnter();
		},
		'giveAdminPermission' : function(){
			giveAdminPermission();
		},
		'getNoticeList' : function(list_body_obj){
			getNoticeList(list_body_obj);
		},
		'getActivityList' : function(list_body_obj){
			getActivityList(list_body_obj);
		},
		'moveTopMemo' : function(memo_idx){
			moveTopMemo(memo_idx);
		},
		'releaseTopMemo' : function(memo_idx){
			releaseTopMemo(memo_idx);
		},
		'showUpdateMemoForm' : function(memo_idx){
			showUpdateMemoForm(memo_idx);
		},
		'hideUpdateMemoForm' : function(memo_idx){
			hideUpdateMemoForm(memo_idx);
		},
		'deleteMemo' : function(memo_idx){
			deleteMemo(memo_idx);
		},
		'addMemo' : function($obj){
			addMemo($obj);
		},
		'openSiteManagementDialog' : function(btn){
			openSiteManagementDialog(btn);
		},
		'toggleHiddenMenu': function(name, is_show){
			toggleHiddenMenu(name, is_show);
		}
	};
})();