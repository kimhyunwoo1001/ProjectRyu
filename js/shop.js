var SHOP_ORDER_MANAGE = function() {
	var $order_list;
	var $order_list_body;
	var $order_list_paging;
	var $order_status_tab;
	var selected_order_list = [];
	var current_page=1;
	var current_base_url='';
	var current_search_data={};
	var $order_search_form;
	var $interlocking_repeat_wrap;

	var initList = function(){
		$order_list = $('#order_list');
		$order_list_body = $('#order_list_body');
		$order_list_paging = $('#order_list_paging');
		$order_status_tab = $('#order_status_tab');
		$interlocking_repeat_wrap = $('#interlocking_repeat_wrap');
		$order_search_form = $('#order_search_form');
	};

	/**
	 * 주문 목록 로드
	 * @param page
	 * @param base_url
	 */
	var loadList = function(page,search_data,base_url){
		current_page = page;
		current_base_url = base_url;
		current_search_data = search_data;
		$.ajax({
			type: 'POST',
			data: {'page':page, 'search_data':search_data, 'base_url':base_url},
			url: ('/admin/ajax/shop/order_list.cm'),
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					SHOP_ORDER_MANAGE.listSetAllSelect(false);
					$order_list.find('input._orderListAllCheck').prop('checked', false);
					$order_status_tab.find('._count').text(0);
					$.each(res.status_count, function(status_key,count){
						$order_status_tab.find('._'+status_key+' ._count').text(count);
					});
					//배송정보 등록실패건이 있는경우 표시
					if(res.interlocking_count.repeat > 0){
						$interlocking_repeat_wrap.show();
						$interlocking_repeat_wrap.find("._interlocking_repeat_count").text(res.interlocking_count.repeat);
					}

					$order_list_body.html(res.html);
					$order_list_paging.html(res.html_paging);

					$order_list.find('._order-popover').popover({
						container: 'body',
						html : true
					});
				}else
					alert(res.msg);
			}
		});
	};

	/**
	 * 반품 목록 로드
	 * @param page
	 * @param base_url
	 */
	var loadReturnList = function(page,search_data,base_url){
		current_page = page;
		current_base_url = base_url;
		current_search_data = search_data;
		$.ajax({
			type: 'POST',
			data: {'page':page, 'search_data':search_data, 'base_url':base_url},
			url: ('/admin/ajax/shop/order_return_list.cm'),
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					SHOP_ORDER_MANAGE.listSetAllSelect(false);
					$order_list.find('input._orderListAllCheck').prop('checked', false);
					$order_status_tab.find('._count').text(0);
					$.each(res.status_count, function(status_key,count){
						$order_status_tab.find('._'+status_key+' ._count').text(count);
					});
					$order_list_body.html(res.html);
					$order_list_paging.html(res.html_paging);

					$order_list.find('._order-popover').popover({
						container: 'body',
						html : true
					});
				}else
					alert(res.msg);
			}
		});
	};

	/**
	 * 주문 목록 재로드
	 * @param type order(주문내역) / return (반품내역)
	 */
	var reloadList = function(type){
		if (type=='return')
			loadReturnList(current_page, current_search_data, current_base_url);
		else
			loadList(current_page, current_search_data, current_base_url);
	};

	/**
	 * 특정 주문 코드가 선택되어있는지 확인
	 * @param order_code
	 * @returns {number}
	 */
	var listFindSelected = function(order_code) {
		var i = 0;
		for (i = 0; i < selected_order_list.length; i++) {
			if (selected_order_list[i] == order_code) return i;
		}
		return -1;
	};

	/**
	 * 특정 주문코드 선택(선택해제) 처리
	 * @param order_code
	 */
	var listSetSelect = function(order_code){
		var o = $('#order_list_'+order_code);
		var n = listFindSelected(order_code);
		if (n==-1){
			selected_order_list.push(order_code);
			o.addClass('on');
			$order_list.addClass('check');
		}else{
			selected_order_list.splice(n,1);
			o.removeClass('on');
			if (selected_order_list.length==0)
				$order_list.removeClass('check');
		}
	};

	/**
	 * 특정 주문코드 전체 선택(선택해제) 처리
	 * @param order_code
	 */
	var listSetAllSelect = function(chk){
		$order_list.find('input._orderListAllCheck').prop('checked', chk);
		selected_order_list = [];
		$order_list.find('tr._orderListItem').each(function(no){
			var o = $(this).find('input._orderListCheck');
			if (o.hasClass('_disabled')) return;
			var order_code = o.val();
			o.prop('checked',chk);
			if (chk){
				$(this).addClass('on');
				selected_order_list.push(order_code);
			}else{
				$(this).removeClass('on');
			}
		});
		if (chk)
			$order_list.addClass('check');
		else
			$order_list.removeClass('check');
	};

	/**
	 * 주문 상태 변경
	 */
	var deleteOrder = function(order_code_list){
		$.ajax({
			type: 'POST',
			data: {'order_code_list':order_code_list},
			url: ('/admin/ajax/shop/delete_order.cm'),
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					if (res.failed_cnt>0) alert(getLocalizeString("설명_n개의주문삭제실패", res.failed_cnt, "%1 개의 주문 삭제 실패"));
					reloadList('order');
				}else
					alert(res.msg);
			}
		});
	};

	/**
	 * 주문 데이터 변경
	 * @param is_confirm 확인다이얼로그를 띄울지 여부 (Y안띄움/N띄움)
	 */
	var updateOrderData = function(type, order_code, value, is_confirm){
		$('#status2_loading_' + order_code).show();
		$.ajax({
			type: 'POST',
			data: {'order_code':order_code, 'type':type, 'value':value, 'is_confirm':is_confirm},
			url: ('/admin/ajax/shop/order_update_data.cm'),
			dataType: 'json',
			success: function (res) {
				$('#status2_loading_' + order_code).hide();
				if(res.msg == 'SUCCESS'){
					if (res.confirm_msg!=''){
						if (confirm(res.confirm_msg)){
							updateOrderData(type,order_code,value,'Y');
						}else{
							reloadList('order');
						}
					}else{
						if (res.request_send=='Y'){
							if (confirm(getLocalizeString("설명_발송처리하시겠습니까", "", "발송 처리 하시겠습니까?"))){
								if (res.is_npay=='Y')
									updateStatusNPay([order_code], res.order_status, 'COMPLETE',[]);
								else
									updateStatus([order_code], 'DELIVERING', 'N', 'N');
							}
						}
					}
				}else{
					alert(res.msg);

				}
			}
		});
	};

	var openOrdererInfo = function(order_code){
		$.ajax({
			type: 'POST',
			data: {'order_code':order_code},
			url: ('/admin/ajax/shop/get_orderer_info.cm'),
			dataType: 'html',
			success: function (html) {
				$.cocoaDialog.open({type:'admin',custom_popup:html,width:550});
			}
		});
	};

	var trackingParcel = function(code,no){
		if(isBlank(code) || isBlank(no)){
			alert(getLocalizeString("설명_택배사또는송장번호가입력되지않았습니다", "", "택배사 또는 송장번호가 입력되지 않았습니다."));
			return;
		}
		$.ajax({
			type : 'POST',
			data : {'code':code, 'invoice':no},
			url : ('/admin/ajax/shop/get_parcel_info_admin.cm'),
			dataType : 'html',
			success : function(html){
				$.cocoaDialog.open({type : 'admin', custom_popup : html, width : 550});
			}
		});
	};

	/**
	 * 키워드 서치 시작
	 */
	var startKeywordSearch = function(){
		var keyword = $.trim($order_search_form.find("input._keyword_search").val());
		window.location.href = current_base_url+'&keyword='+encodeURIComponent(keyword)+'&page=1';
	};

	var openParcelBatch = function(){
		$.ajax({
			type: 'POST',
			data: {},
			url: ('/admin/ajax/shop/open_order_batch.cm'),
			dataType: 'html',
			success: function (html) {
				var $html = $(html);

				var $upload_btn = $html.find('._upload');
				var $submit = $html.find('._submit');
				var $result = $html.find('._result');
				var tmp_idx = null;
				$upload_btn.fileupload({
					url: '/admin/ajax/shop/upload_order_batch.cm',
					formData: {},
					dataType: 'json',
					singleFileUploads: false,
					limitMultiFileUploads: 1,
					dropZone: null,
					start: function(e, data){
					},
					progress: function(e, data){
					},
					done: function(e, data){
						$.each(data.result.files, function(e, tmp){
							$result.text(getLocalizeString("설명_업로드성공", "", "업로드 성공") + '('+tmp.org_name+')');
							tmp_idx = tmp.tmp_idx;
						});
					},
					fail: function(e, data){
						alert(getLocalizeString("설명_업로드에실패하였습니다", "", "업로드에 실패 하였습니다."));
					}
				});
				$submit.on('click',function(){
					if(isBlank(tmp_idx)){
						alert(getLocalizeString("설명_excel파일을업로드해주세요", "", "excel 파일을 업로드 해주세요."));
					}else{
						$('#button_loading').show();
						$.ajax({
							type : 'POST',
							data : {'tmp_idx' : tmp_idx},
							url : ('/admin/ajax/shop/run_order_batch.cm'),
							dataType : 'json',
							success : function(res){
								$('#button_loading').hide();
								if(res.msg=='SUCCESS'){
									alert(getLocalizeString("설명_총n1개의주문업데이트성공n2개완료n3개변동사항없음n4개실패n5개", [res.total_cnt, res.update_cnt, res.complete_cnt, res.skip_cnt, res.fail_cnt], "총%1개의 주문(업데이트 성공 : %2개 / 발송 완료처리 : %3개 / 변동사항없음 : %4개 / 업데이트 실패 : %5개)"));
									reloadList('order');

								}else{
									alert(res.msg);
								}
								$.cocoaDialog.close();
							}
						});
					}
				});
				$.cocoaDialog.open({type : 'admin', custom_popup : $html, width : 550});
				$('[data-toggle="tabs"] a').click(function(e){ e.preventDefault(); $(this).tab('show'); });
			}
		});
	};
	var openOrderMemoList = function(){
		$.ajax({
			type: 'POST',
			data: {},
			url: ('/admin/ajax/shop/order_memo_list.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (res) {
				var $html = $(res);
				$.cocoaDialog.open({type:'admin',custom_popup:$html});
			}
		});
	};

	//pg 배송연동 등록 재 요청
	var pgInterlockingRequestRepeat = function(obj,order_code){

		$.ajax({
			type: 'POST',
			data: {order_code : order_code},
			url: ('/admin/ajax/shop/pg_interlocking_request_repeat.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg == "SUCCESS"){
					obj.closest("._pg_interlocking_request_repeat_wrap").hide();
				}else{
					alert(res.msg);
				}
			}
		});
	};

	return {
		initList: function(){
			initList();
		},
		loadList: function (page, search_data, base_url) {
			loadList(page, search_data, base_url);
		},
		loadReturnList: function (page, search_data, base_url) {
			loadReturnList(page, search_data, base_url);
		},
		listSetSelect : function (order_code){
			listSetSelect(order_code);
		},
		listSetAllSelect : function (chk){
			listSetAllSelect(chk);
		},
		updateStatus : function(order_code,status){
			updateStatus([order_code], status, 'N','N');
		},
		updateStatusNPay : function(order_code,current_status, status){
			updateStatusNPay([order_code], current_status, status);
		},
		updateSubStatusNPay : function(order_code,current_status, current_sub_status, sub_status){
			updateSubStatusNPay([order_code], current_status, current_sub_status, sub_status);
		},
		updateStatusMulti : function(status){
			if (selected_order_list.length>0)
				updateStatus(selected_order_list, status, 'N', 'N');
			else alert(getLocalizeString("설명_선택된주문이없습니다", "", "선택된 주문이 없습니다"));
		},
		deleteOrderMulti : function(status){
			if (selected_order_list.length>0)
				deleteOrder(selected_order_list);
			else alert(getLocalizeString("설명_선택된주문이없습니다", "", "선택된 주문이 없습니다"));
		},
		updateOrderData : function(type, order_code,value, is_confirm){
			updateOrderData(type, order_code, value, is_confirm);
		},
		'openOrdererInfo' : function(order_code){
			openOrdererInfo(order_code);
		},
		"trackingParcel" : function(code, no){
			trackingParcel(code,no);
		},
		'startKeywordSearch' : function(){
			startKeywordSearch();
		},
		'openParcelBatch' : function(){
			openParcelBatch();
		},
		'openOrderMemoList' : function(){
			openOrderMemoList();
		},
		'pgInterlockingRequestRepeat' : function(obj,order_code){
			pgInterlockingRequestRepeat(obj,order_code);
		}
	}
}();

var SHOP_PROD_LIST = function(){
	var $prod_list;
	var $prod_list_body;
	var $prod_list_header_selected;
	var $prod_list_header_deselected;
	var $prod_list_paging;
	var $prod_list_no_prod;
	var $showcase_list_no_prod;
	var $prod_list_no_search;
	var $prod_search_form;
	var $prod_status_tab;
	var $category_list;
	var selected_prod_list = [];	//선택되어있는 상품 코드 (코드문자열배열)
	var current_page=1;
	var current_base_url='';
	var current_search_data={};
	var copy_prod_progress_check = false;		// 상품 복제 진행 중 확인

	var init = function(){
		$prod_list = $('#prod_list');
		$prod_list_no_prod = $('#prod_list_no_prod');
		$showcase_list_no_prod = $('#showcase_list_no_prod');
		$prod_list_no_search = $('#prod_list_no_search');
		$prod_list_body = $('#prod_list_body');
		$prod_list_paging = $('#prod_list_paging');
		$prod_list_header_selected = $('#prod_list_header_selected');
		$prod_list_header_deselected = $('#prod_list_header_deselected');
		$prod_status_tab = $('#prod_status_tab');
		$prod_search_form = $('#prod_search_form');
		$category_list = $('#category_list');
	};

	/**
	 * 상품 목록 로드
	 * @param page
	 * @param base_url
	 */
	var loadList = function(page,search_data,base_url){
		selected_prod_list = [];
		current_page = page;
		current_base_url = base_url;
		current_search_data = search_data;
		$.ajax({
			type: 'POST',
			data: {'page':page, 'search_data':search_data, 'base_url':base_url},
			url: ('/admin/ajax/shop/prod_list.cm'),
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					$prod_list.find('input._prodListAllCheck').prop('checked', false);
					$prod_list_header_selected.hide();
					$prod_list_header_deselected.show();
					$prod_status_tab.find('._count').text(0);
					$.each(res.status_count, function(status_key,count){
						$prod_status_tab.find('._'+status_key+' ._count').text(count);
					});
					if (res.prod_count>0){
						$prod_list.show();
						$prod_list_body.html(res.html);
						$prod_list_paging.show().html(res.html_paging);
					}else{
						if(res.is_showcase == 'Y'){
							$showcase_list_no_prod.show();
							$prod_list_paging.hide();
						}else{
							$prod_list_no_prod.show();
						}
						$prod_list_paging.empty().hide();
						$prod_list_body.empty();
						$prod_list.hide();
					}
					if(res.is_showcase == 'Y' && !isBlank(res.showcase)){
						setShowcaseOrder(res.showcase);
					}else{
						if(res.status == 'all'){
							setCategoryOrder();
						}
					}
					if(typeof callback == 'function'){
						callback(res);
					}

					initShowcase(res.showcase, '/admin/shopping/product/?', res.all_showcase_list);

				}else
					alert(res.msg);
			}
		});
	};

	var setShowcaseOrder = function(showcase_code){
		var action_code = null;
		var action_index = null;
		var target_index = null;
		$prod_list_body.sortable({
			'handle' : '._showcase_handle',
			'start' : function(event, ui){
				action_code = ui.item.data('code');
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
				changeShowcaseOrder(showcase_code,action_code,target_code, pos);
			}
		});
		$prod_list_body.disableSelection();
	};

	var setCategoryOrder = function(){
		var action_code = null;
		var action_index = null;
		var target_index = null;
		$prod_list_body.sortable({
			'handle' : '._showcase_handle',
			'start' : function(event, ui){
				action_code = ui.item.data('code');
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
				changeCategoryOrder(action_code,target_code, pos);
			}
		});
		$prod_list_body.disableSelection();
	};

	var changeProdOrder = function(type,action_code){
		if(isBlank(action_code)) return false;

		$.ajax({
			type: 'POST',
			data: {'prod_code':action_code, 'pos' : type},
			url: ('/admin/ajax/shop/prod_change_order.cm'),
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					loadList(current_page,current_search_data,current_base_url);
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var changeShowcaseOrder = function(showcase_code,action_code,target_code, pos){
		if(isBlank(showcase_code)) return false;
		if(isBlank(action_code)) return false;
		if(isBlank(target_code)) return false;
		if(action_code == target_code) return false;
		$.ajax({
			type: 'POST',
			data: {'showcase_code':showcase_code, 'prod_code':action_code, 'target_code':target_code, 'pos' : pos},
			url: ('/admin/ajax/shop/showcase_change_order.cm'),
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){

				}else
					alert(res.msg);
			}
		});
	};

	var changeCategoryOrder = function(action_code,target_code, pos){
		if(isBlank(action_code)) return false;
		if(isBlank(target_code)) return false;
		if(action_code == target_code) return false;
		$.ajax({
			type: 'POST',
			data: {'prod_code':action_code, 'target_code':target_code, 'pos' : pos},
			url: ('/admin/ajax/shop/prod_change_order.cm'),
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){

				}else
					alert(res.msg);
			}
		});
	};

	var changeShowcaseProdOrder = function(type, showcase_code,action_code){
		if(isBlank(showcase_code)) return false;
		if(isBlank(action_code)) return false;
		$.ajax({
			type: 'POST',
			data: {'showcase_code': showcase_code, 'prod_code':action_code, 'pos' : type},
			url: ('/admin/ajax/shop/showcase_change_order.cm'),
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					loadList(current_page,current_search_data,current_base_url);
				}else
					alert(res.msg);
			}
		});
	};


	/**
	 * 상품 목록 재로드
	 */
	var reloadList = function(){
		loadList(current_page, current_search_data, current_base_url);
	};

	/**
	 * 키워드 서치 시작
	 */
	var startKeywordSearch = function(){
		var keyword = $.trim($prod_search_form.find("input._keyword_search").val());
		window.location.href = current_base_url+'&prod_name='+encodeURIComponent(keyword)+'&page=1';
	};

	var startCategorySearch = function(idx){
		window.location.href = current_base_url+'&category='+encodeURIComponent(idx)+'&page=1';
	};

	/**
	 * 상품 상태 변경
	 */
	var updateStatus = function(prod_code_list, status, callback){
		$.ajax({
			type: 'POST',
			data: {'prod_code_list':prod_code_list, 'status':status},
			url: ('/admin/ajax/shop/check_prod_status.cm'),
			dataType: 'json',
			success: function (res) {
				var is_success = true;
				if ( res.code == 1 ) {
					is_success = confirm(res.msg);
				} else {
					if ( res.msg != 'SUCCESS' ) {
						alert(res.msg);
						return;
					}
				}

				if ( is_success ) {
					$.ajax({
						type: 'POST',
						data: {'prod_code_list':prod_code_list, 'status':status},
						url: ('/admin/ajax/shop/update_prod_status.cm'),
						dataType: 'json',
						success: function (res2) {
							if(res2.msg == 'SUCCESS'){
								if (res2.failed_cnt>0) alert(getLocalizeString("설명_n개상품상태변경실패", res2.failed_cnt, "%1개의 상품 상태 변경 실패"));
								reloadList(callback);
							}else{
								if(typeof callback == 'function')
									callback(res2);
								alert(res2.msg);
							}
						}
					});
				}
			}
		});
	};
	/**
	 * 상품 삭제
	 */
	var deleteProd = function(prod_code_list, callback){
		$.ajax({
			type: 'POST',
			data: {'prod_code_list':prod_code_list},
			url: ('/admin/ajax/shop/delete_prod.cm'),
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					if (res.failed_cnt>0) alert(getLocalizeString("설명_n개의상품삭제실패", res.failed_cnt, "%1개의 상품 삭제 실패"));
					//reloadList(callback);
					window.location.reload();
				}else{
					if(typeof callback == 'function')
						callback(res);
					alert(res.msg);
				}
			}
		});
	};

	/**
	 * 상품 복제
	 */
	var copyProd = function(prod_code_list, callback){
		if(copy_prod_progress_check) return false;

		copy_prod_progress_check = true;
		$.ajax({
			type: 'POST',
			data: {'prod_code_list':prod_code_list},
			url: ('/admin/ajax/shop/copy_prod.cm'),
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					reloadList(callback);
				}else{
					alert(res.msg);
				}

				copy_prod_progress_check = false;
			}
		});
	};




	/**
	 * 특정 코드가 선택되어있는지 확인
	 * @param order_code
	 * @returns {number}
	 */
	var listFindSelected = function(prod_code) {
		var i = 0;
		for (i = 0; i < selected_prod_list.length; i++) {
			if (selected_prod_list[i] == prod_code) return i;
		}
		return -1;
	};

	/**
	 * 특정 코드 선택(선택해제) 처리
	 * @param prod_code
	 */
	var listSetSelect = function(prod_code, callback){
		var o = $('#prod_list_'+prod_code);
		var n = listFindSelected(prod_code);
		if (n==-1){
			selected_prod_list.push(prod_code);
			$prod_list_header_selected.show();
			$prod_list_header_deselected.hide();
		}else{
			selected_prod_list.splice(n,1);
			if (selected_prod_list.length>0){
				$prod_list_header_selected.show();
				$prod_list_header_deselected.hide();
			}else{
				$prod_list_header_selected.hide();
				$prod_list_header_deselected.show();
			}
		}

		if(typeof callback == 'function'){
			callback(selected_prod_list);
		}

	};

	/**
	 * 특정 코드 전체 선택(선택해제) 처리
	 * @param order_code
	 */
	var listSetAllSelect = function(chk, callback){
		$prod_list.find('input._prodListAllCheck').prop('checked', chk);
		selected_prod_list = [];
		$prod_list.find('tr._prodListItem').each(function(no){
			var o = $(this).find('input._prodListCheck');
			var prod_code = o.val();
			o.prop('checked',chk);
			if (chk){
				$(this).addClass('on');
				selected_prod_list.push(prod_code);
			}else{
				$(this).removeClass('on');
			}
		});
		if (chk){
			$prod_list_header_selected.show();
			$prod_list_header_deselected.hide();
		}else{
			$prod_list_header_selected.hide();
			$prod_list_header_deselected.show();
		}

		if(typeof callback == 'function'){
			callback(selected_prod_list);
		}
	};


	var openShowcaseForm = function (code, mode) {
		if(typeof mode == 'undefined')
			mode = 'list';
		$.ajax({
			type: 'POST',
			data: {'code' : code, 'mode' : mode},
			url: ('/admin/ajax/shop/showcase_form.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (html) {
				$.cocoaDialog.open({type:'admin',custom_popup:html,width:550});
			}
		});
	};

	/**
	 * 상품 아이콘 관리
	 */
	var openIconManage = function (codes) {
		$.ajax({
			'type' : 'POST',
			'data' : {'codes' : codes, 'mode' : 'dialog'},
			'url' : ('/admin/ajax/shop/prod_icon_manage.cm'),
			'dataType' : 'html',
			'async' : false,
			'cache' : false,
			'success' : function (html) {
				var $dialog = $(html);
				$.cocoaDialog.open({type:'admin',custom_popup:$dialog,width:550});
			}
		});
	};

	var openProdDetailManage = function(codes,type){
		$.ajax({
			'type' : 'POST',
			'data' : {'codes' : codes, 'mode' : 'dialog','type' : type},
			'url' : ('/admin/ajax/shop/prod_detail_manage.cm'),
			'dataType' : 'json',
			'async' : false,
			'cache' : false,
			'success' : function (res) {
				if (res.msg=='SUCCESS') {
					var $dialog = res.html;
					$.cocoaDialog.open({type:'admin',custom_popup:$dialog,width:960});
				}else{
					alert(res.msg);
				}

				$('._submit').on('click', function(){
					saveProdDetailManage(codes);
				});
			}
		});
	};

	var saveProdDetailManage = function(codes){
		var $_form = $('#prod_list_detail_multi_form');
		var form_data = $_form.serializeObject2();

		dozProgress.start();
		$.ajax({
			type: 'POST',
			data: form_data,
			url: ('/admin/ajax/shop/prod_detail_multi_save.cm'),
			dataType: 'json',
			cache: false,
			success: function (res) {
				if (res.msg=='SUCCESS') {
					openProdDetailManageComplete();
				} else {
					alert(res.msg);
				}
				dozProgress.done();
			}
		});
	};

	var openProdDetailManageComplete = function(){
		$.cocoaDialog.close();
		$.ajax({
			"type" : "POST",
			"data" : {"mode" : "complete"},
			'url' : ('/admin/ajax/shop/prod_detail_manage.cm'),
			"dataType" : "json",
			"async" : false,
			"cache" : false,
			"success" : function (res) {
				var $dialog = res.html;
				$.cocoaDialog.open({type:"admin",custom_popup:$dialog,width:960,'hide_event' : function(){window.location.reload();}});
			}
		});
	};

	var changeProdDetailType = function(type){
		$.cocoaDialog.close();
		openProdDetailManage(selected_prod_list,type);
	};

	/**
	 * 상품 정보 일괄 수정 ( 회사 IP 전용 )
	 */
	var openProdModifyBatch = function (codes) {
		$.ajax({
			'type' : 'POST',
			'data' : {'codes' : codes, 'mode' : 'dialog'},
			'url' : ('/admin/ajax/shop/prod_modify_batch.cm'),
			'dataType' : 'html',
			'async' : false,
			'cache' : false,
			'success' : function (html) {
				var $dialog = $(html);
				$.cocoaDialog.open({type:'admin', custom_popup:$dialog,width:550});
			}
		});
	};

	var openProdModifyBatchComplete = function () {
		$.cocoaDialog.close();
		$.ajax({
			'type' : 'POST',
			'data' : {'mode' : 'complete'},
			'url' : ('/admin/ajax/shop/prod_modify_batch.cm'),
			'dataType' : 'html',
			'async' : false,
			'cache' : false,
			'success' : function (html) {
				var $dialog = $(html);
				$.cocoaDialog.open({type:'admin', custom_popup:$dialog,width:550});
				if ( typeof load_prod_list != 'undefined' ) {
					load_prod_list();
				}
			}
		});
	};

	var openCategoryModifyManage = function (codes) {
		$.cocoaDialog.close();
		$.ajax({
			'type' : 'POST',
			'data' : {'codes' : codes, 'mode' : 'dialog'},
			'url' : ('/admin/ajax/shop/prod_category_modify_manage.cm'),
			'dataType' : 'html',
			'async' : false,
			'cache' : false,
			'success' : function (html) {
				var $dialog = $(html);
				$.cocoaDialog.open({type:'admin',custom_popup:$dialog,width:550});
			}
		});
	};

	var openCategoryModifyManageComplete = function() {
		$.cocoaDialog.close();
		$.ajax({
			'type' : 'POST',
			'data' : {'mode' : 'complete'},
			'url' : ('/admin/ajax/shop/prod_category_modify_manage.cm'),
			'dataType' : 'html',
			'async' : false,
			'cache' : false,
			'success' : function (html) {
				var $dialog = $(html);
				// 페이지 다시 불러오기 ( list.sub 에만 있는 함수 )
				if ( typeof load_prod_list == 'function' ) load_prod_list();
				$.cocoaDialog.open({type:'admin',custom_popup:$dialog,width:550});
			}
		});
	};


	// 쇼케이스(기획전) 데이터 리스트 html 생성
	var loadShowcaseModifyManageList = function() {
		// HTML 생성 시작
		var html = '';
		if ( showcase_list_data.count() == 0 ) {
			html += getLocalizeString('설명_데이터가없습니다','','데이터가 없습니다.');
		} else {
			$.each(showcase_list_data.data, function(no,data){
				html += '<div class="checkbox checkbox-styled dropdown-handle">';
				html += '<label class="category-item">';
				html += '<input type="checkbox" name="showcase_list[]" value="' + data.code + '">';
				html += '<span class="check-item">' + data.title + '</span>';
				html += '</label>';
				html += '</div>';
			});
		}
		return html;
	};

	// 상품 리스트에서 일괄변경 하는경우 사용 통합
	// (카테고리, 기획전)
	var openProdListModifyManage = function(codes, type){
		$.cocoaDialog.close();
		$.ajax({
			"type" : "POST",
			"data" : {"codes" : codes, "mode" : "dialog", "type": type},
			"url" : ("/admin/ajax/shop/prod_list_modify_manage.cm"),
			"dataType" : "html",
			"async" : false,
			"cache" : false,
			"success" : function (html) {
				var $dialog = $(html);
				$.cocoaDialog.open({type:"admin",custom_popup:$dialog,width:550});

				var $list = '';
				switch ( type ) {
					case "category":
						$list = SHOP_PROD_MANAGE.loadCategoryModifyManageList();
						break;
					case "showcase":
						$list = loadShowcaseModifyManageList();
						break;
				}

				$dialog.find("#prod_manager_list").html($list);
				$dialog.find('button._submit').on('click', function(){
					saveProdListModifyManageList(type);
				});
			}
		});
	};


	var saveProdListModifyManageList = function(type) {
		var $_form = $('#prod_list_modify_manage_form');
		var form_data = $_form.serializeObject2();
		form_data['type'] = type;

		dozProgress.start();
		$.ajax({
			type: 'POST',
			data: form_data,
			url: ('/admin/ajax/shop/prod_list_modify_manage_save.cm'),
			dataType: 'json',
			cache: false,
			success: function (res) {
				if (res.msg=='SUCCESS') {
					openProdListModifyManageComplete(type);
				} else {
					alert(res.msg);
				}
				dozProgress.done();
			}
		});
	};

	var openProdListModifyManageComplete = function(type){
		$.cocoaDialog.close();
		$.ajax({
			"type" : "POST",
			"data" : {"mode" : "complete", "type": type},
			"url" : ("/admin/ajax/shop/prod_list_modify_manage.cm"),
			"dataType" : "html",
			"async" : false,
			"cache" : false,
			"success" : function (html) {
				var $dialog = $(html);
				// 페이지 다시 불러오기 ( list.sub 에만 있는 함수 )
				if ( typeof load_prod_list == "function" ) load_prod_list();
				$.cocoaDialog.open({type:"admin",custom_popup:$dialog,width:550});
			}
		});
	};

	var openSaveProdPreSaleManageComplete = function() {
		$.cocoaDialog.close();
		$.ajax({
			'type' : 'POST',
			'data' : {'mode' : 'complete'},
			'url' : ('/admin/ajax/shop/prod_pre_sale_manage.cm'),
			'dataType' : 'html',
			'async' : false,
			'cache' : false,
			'success' : function (html) {
				var $dialog = $(html);
				// 페이지 다시 불러오기 ( list.sub 에만 있는 함수 )
				// if ( typeof load_prod_list == 'function' ) load_prod_list();
				$.cocoaDialog.open({type:'admin',custom_popup:$dialog,width:550});
				if ( typeof load_prod_list != 'undefined' ) {
					load_prod_list();
				}
			}
		});
	};

	var openModifyProdPriceMulti = function (codes) {
		$.cocoaDialog.close();
		$.ajax({
			'type' : 'POST',
			'data' : {'codes' : codes, 'mode' : 'dialog'},
			'url' : ('/admin/ajax/shop/prod_price_manage.cm'),
			'dataType' : 'html',
			'async' : false,
			'cache' : false,
			'success' : function (html) {
				var $dialog = $(html);
				$.cocoaDialog.open({type:'admin',custom_popup:$dialog,width:550});

				var $_type = $dialog.find('._type');
				var $_product_digits = $dialog.find('._product_digits');
				var $_product_price_type = $dialog.find('._product_price_type');
				var $_product_price = $dialog.find('._product_price');
				var $_product_ratio_type = $dialog.find('._product_ratio_type');
				var $_form_round_type = $dialog.find('._form_round_type');
				var $_form_product_digits = $dialog.find('._form_product_digits');
				var $_ratio_currency = $dialog.find('._ratio_currency');
				var $_fix_price_type = $dialog.find('._fix_price_type');
				var $_fix_price = $dialog.find('._fix_price');

				$_type.on('change', function() {
					var val = this.value;
					switch( val ) {
						case 'product': // 기준
							$dialog.find('#form_fix').hide();
							$dialog.find('#form_product').show();
							break;
						case 'fix': // 입력
							$dialog.find('#form_product').hide();
							$dialog.find('#form_fix').show();
							break;
					}
				}).eq(0).trigger('change');

				$_product_price_type.on('change', function() {
					var val = this.value;
					var $_that = $(this);
					$_ratio_currency.text(currency_char_list[val]);

					// 소수점 자릿수 세팅
					$_product_price.unbind('keydown.format keyup.format keyup.format');
					var $_selected = $_that.find(':selected');
					set_money_format($_product_price, ( $_product_ratio_type.val() == 'Y' ? 0 : $_selected.data('decimal') ), $_selected.data('decimal-char'), $_selected.data('thousand-char'));
				}).trigger('change');

				$_product_ratio_type.on('change', function() {
					var val = this.value;
					var $_selected = $_product_price_type.find(':selected');
					$_product_price.unbind('keydown.format keyup.format keyup.format');
					if ( val == 'Y' ) {
						// 소수점 자릿수 세팅
						set_money_format($_product_price, 0);
						$_form_product_digits.show();
					} else {
						// 소수점 자릿수 세팅
						set_money_format($_product_price, $_selected.data('decimal'), $_selected.data('decimal-char'), $_selected.data('thousand-char'));
						$_form_product_digits.hide();
					}
				}).trigger('change');

				$_product_digits.on('change', function() {
					var val = this.value;

					if ( val == 0 ) {
						$_form_round_type.hide();
					} else {
						$_form_round_type.show();
					}
				});

				$_fix_price_type.on('change', function() {
					var $_that = $(this);
					$_fix_price.unbind('keydown.format keyup.format keyup.format');
					var $_selected = $_that.find(':selected');
					set_money_format($_fix_price, $_selected.data('decimal'), $_selected.data('decimal-char'), $_selected.data('thousand-char') );
				}).trigger('change');
			}
		});
	};

	var openModifyDiscount = function (codes) {
		$.cocoaDialog.close();
		$.ajax({
			'type' : 'POST',
			'data' : {'codes' : codes, 'mode' : 'dialog'},
			'url' : ('/admin/ajax/shop/prod_discount_manage.cm'),
			'dataType' : 'html',
			'async' : false,
			'cache' : false,
			'success' : function (html) {
				var $dialog = $(html);
				$.cocoaDialog.open({type:'admin',custom_popup:$dialog,width:600});
				$('[data-toggle="tabs"] a, .enable-tabs a').click(function(e){ e.preventDefault(); $(this).tab('show'); });
			}
		});
	};

	var openSaveProdDiscountComplete = function(){
		$.cocoaDialog.close();
		$.ajax({
			'type' : 'POST',
			'data' : {'mode' : 'complete'},
			'url' : ('/admin/ajax/shop/prod_discount_manage.cm'),
			'dataType' : 'html',
			'async' : false,
			'cache' : false,
			'success' : function (html) {
				var $dialog = $(html);
				$.cocoaDialog.open({type:'admin',custom_popup:$dialog,width:600});
				if ( typeof load_prod_list != 'undefined' ) {
					load_prod_list();
				}
			}
		});
	};

	var openModifyPreSale = function (codes) {
		$.cocoaDialog.close();
		$.ajax({
			'type' : 'POST',
			'data' : {'codes' : codes, 'mode' : 'dialog'},
			'url' : ('/admin/ajax/shop/prod_pre_sale_manage.cm'),
			'dataType' : 'html',
			'async' : false,
			'cache' : false,
			'success' : function (html) {
				var $dialog = $(html);
				$.cocoaDialog.open({type:'admin',custom_popup:$dialog,width:600});
				SHOP_PROD_MANAGE.initPreSale($dialog);
				$dialog.find('._pre_sale_simple_day[data-day="7"]').trigger('click');
			}
		});
	};

	var completeIconManage = function(){
		$.cocoaDialog.close();
		$.ajax({
			'type' : 'POST',
			'data' : {'mode' : 'complete'},
			'url' : ('/admin/ajax/shop/prod_icon_manage.cm'),
			'dataType' : 'html',
			'async' : false,
			'cache' : false,
			'success' : function (html) {
				var $dialog = $(html);
				$.cocoaDialog.open({
					'type':'admin',
					'custom_popup':$dialog,
					'width':550,
					'hide_event' : function(){
						window.location.reload();
					}
				});
			}
		});
	};

	var addShowcaseForm = function (mode) {
		if(typeof mode == 'undefined')
			mode = 'list';
		var f = $('#showcasef');
		var data = f.serializeObject();
		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/shop/showcase_form_proc.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (result) {
				if (result.msg == 'SUCCESS') {
					if(mode == 'list'){
						if(result.mode == 'add'){
							addShowcaseList(result.data);
							//window.doznutadmin.AppForm.initialize();
						}else if(result.mode == 'update'){
							showcase_list_data.add(result.data.code, result.data);
							resetShowcaseListHtml();
						}
					}else if(mode == 'add'){
						$('#prod_showcase').append('<option value="'+result.data.code+'">'+RemoveTag(result.data.title)+'</option>');
						$('#prod_showcase').chosen('destroy');
						$('#prod_showcase').chosen({width: "100%",no_results_text: getLocalizeString("설명_선택된기획전이없습니다", "", "선택된 기획전이 없습니다.")});
					}
					$.cocoaDialog.close();
				} else
					alert(result.msg);
			}
		});
	};
	var showcase_list_data = new DATA();
	var addShowcaseList = function(data){
		// data.idx = parseInt(data.idx);
		showcase_list_data.add(data.code,data);
		addShowcaseListHtml(data);
	};
	var resetShowcaseListHtml = function(){
		$('.'+showcase_item_html_class).remove();
		$showcase_list.empty();
		$.each(showcase_list_data.data,function(code,data){
			addShowcaseListHtml(data);
		});
	};

	var showcase_item_html_class = '_showcase_item';
	var showcase_data_text = 'showcase';

	var current_member_code;
	var base_url;
	var $showcase_list;
	var showcase_list_item_tmp;
	var hidden_showcase_list_tmp;
	var drop_showcase_list_tmp;
	var $hidden_showcase_list;
	var $drop_showcase_list;
	var $check_drop_showcase_list;

	var initShowcase = function(code,url, data_list){
		current_member_code = code;
		base_url = url;
		$showcase_list = $('#showcase_list').empty();
		showcase_list_item_tmp = '<li class="{class}" id="showcase_item_{code}"><a href="{href}"><span id="showcase_item_title_{code}">{title}</span> <small class="margin-left-lg text-bold opacity-75">{cnt}</small><button onclick="{edit_script}" class="pull-right btn btn-flat no-padding hover-visible"><i class="zmdi zmdi-settings"></i></button></a></li>';
		hidden_showcase_list_tmp = '<li class="{class}" id="showcase_hidden_item_{code}"><a href="{href}"><span id="showcase_hidden_item_title_{code}">{title}</span></a></li>';
		drop_showcase_list_tmp = '<li class="{class}"><a href="javascript:;" onclick="{concede_script}" class="_{code}">{title}</a></li>';

		$hidden_showcase_list = $('#hidden_showcase_list');
		$drop_showcase_list = $('._drop_showcase_list');

		$check_drop_showcase_list = $('#check_drop_showcase_list');
		$check_drop_showcase_list.data('prod',[]);
		$check_drop_showcase_list.data(showcase_data_text,[]);


		$drop_showcase_list.each(function(){
			var member_data = ""+$(this).data(showcase_data_text);
			member_data = member_data.split(',');
			var _new_d = [];
			$.each(member_data,function(e,v){
				if(v != '')
					_new_d.push(v);
			});
			$(this).data(showcase_data_text,_new_d);
		});


		$.each(data_list,function(e,_showcase_data){
			addShowcaseList(_showcase_data);
		});

	};

	var addShowcaseListHtml = function(data){
		data.title = RemoveTag(data.title);
		var tmp_data = {
			class : current_member_code == data.code ? 'active checked '+showcase_item_html_class : showcase_item_html_class,
			code : data.code,
			href :base_url+"&showcase="+data.code,
			title : data.title,
			cnt : data.prod_cnt>0?parseInt(data.prod_cnt):'',
			edit_script : "SHOP_PROD_LIST.openShowcaseForm('"+data.code+"');return false;"
		};
		var $showcase_list_html = $(getTemplateConvert(showcase_list_item_tmp,tmp_data)).data(data);
		$showcase_list.append($showcase_list_html);
		var $hidden_showcase_list_html = $(getTemplateConvert(hidden_showcase_list_tmp,tmp_data)).data(data);
		$hidden_showcase_list.append($hidden_showcase_list_html);

		$drop_showcase_list.each(function(){
			var showcase_data = $(this).data(showcase_data_text);
			var drop_tmp_data = {
				code : data.code,
				class : $.inArray(data.code,showcase_data)!==-1 ? 'active checked '+showcase_item_html_class : showcase_item_html_class,
				concede_script : "SHOP_PROD_LIST.concedeToggleShowcase($(this),'"+data.code+"')"
			};
			drop_tmp_data = $.extend(tmp_data,drop_tmp_data);
			var $drop_showcase_list_html = $(getTemplateConvert(drop_showcase_list_tmp,drop_tmp_data)).data(data);
			$(this).append($drop_showcase_list_html);
		});

		var check_showcase = $check_drop_showcase_list.data(showcase_data_text);
		var check_drop_tmp_data = {
			class : $.inArray(data.code,check_showcase)!==-1 ? 'active checked '+showcase_item_html_class : showcase_item_html_class,
			concede_script : "SHOP_PROD_LIST.concedeToggleShowcase($(this),'"+data.code+"')"
		};
		check_drop_tmp_data = $.extend(tmp_data,check_drop_tmp_data);

		var $check_drop_showcase_list_html = $(getTemplateConvert(drop_showcase_list_tmp,check_drop_tmp_data)).data(data);
		$check_drop_showcase_list.append($check_drop_showcase_list_html);
	};

	var concedeToggleShowcase = function(obj,showcase_code){
		var $list = obj.closest('._drop_showcase_list, #check_drop_showcase_list');
		var prod_item_showcase_data = $list.data(showcase_data_text);

		var selected_prod_list = $list.data('prod');
		var $item = obj.parent();
		var item_data = $item.data();
		var _old_data = showcase_list_data.get(item_data.code);

		if($.isArray(selected_prod_list)){ //선택 변경 일때

			if ($.inArray(showcase_code, prod_item_showcase_data) !== -1) { //제거
				prod_item_showcase_data = deleteArrayValue(prod_item_showcase_data, showcase_code);
				$list.data(showcase_data_text, prod_item_showcase_data);
			} else { //추가
				prod_item_showcase_data.push(showcase_code);
				$list.data(showcase_data_text, prod_item_showcase_data);
			}

			$.each(selected_prod_list,function(e,v){
				var $drop_list = $('._drop_showcase_list_'+v);
				var _prod_item_showcase_data = $drop_list.data(showcase_data_text);
				$.each(prod_item_showcase_data,function(_e,_v){
					if($.inArray(_v, _prod_item_showcase_data) === -1){ //없으면 추가
						_old_data.prod_cnt = _old_data.prod_cnt==''?0:_old_data.prod_cnt;
						_old_data.prod_cnt = 1 + parseInt(_old_data.prod_cnt);
					}
				});
				$.each(_prod_item_showcase_data,function(_e,_v){
					if($.inArray(_v, prod_item_showcase_data) === -1){ //없으면 제거
						var __old_data = false;
						$.each(showcase_list_data.data,function(__e,__v){
							if(__v.code == _v){
								__old_data = showcase_list_data.get(__e);
								return false;
							}
						});
						if(__old_data !== false) {
							__old_data.prod_cnt = parseInt(__old_data.prod_cnt) - 1;
						}
					}
				});
				$drop_list.data(showcase_data_text, prod_item_showcase_data.concat());
			});



		}else {
			if ($.inArray(showcase_code, prod_item_showcase_data) !== -1) { //제거
				prod_item_showcase_data = deleteArrayValue(prod_item_showcase_data, showcase_code);
				$list.data(showcase_data_text, prod_item_showcase_data);
				_old_data.prod_cnt = parseInt(_old_data.prod_cnt) - 1;
			} else { //추가
				prod_item_showcase_data.push(showcase_code);
				$list.data(showcase_data_text, prod_item_showcase_data);
				_old_data.prod_cnt = _old_data.prod_cnt==''?0:_old_data.prod_cnt;
				_old_data.prod_cnt = 1 + parseInt(_old_data.prod_cnt);
			}
		}

		$.ajax({
			type: 'POST',
			data: {prod_code:selected_prod_list,default_showcase: prod_item_showcase_data},
			url: ('/admin/ajax/shop/showcase_concede_proc.cm'),
			dataType: 'json',
			async: true,
			cache: false,
			success: function (result) {
				if(result.msg == 'SUCCESS'){
					checkProd(selected_prod_list);
					resetShowcaseListHtml();


					var main_showcase_title = '';
					var i = 0;

					if($.isArray(selected_prod_list)){
						$.each(selected_prod_list,function(e,v){
							var main_showcase_title = '';
							var i = 0;
							var $drop_list = $('._drop_showcase_list_'+v);
							var _prod_item_showcase_data = $drop_list.data(showcase_data_text);
							$.each(showcase_list_data.data, function (code, data) {
								if ($.inArray(data.code, _prod_item_showcase_data) !== -1) {
									if (i == 0)
										main_showcase_title = data.title;
									i++;
								}
							});
							var _showcase = '';
							if (i == 0) {
								_showcase = getLocalizeString("설명_기획전없음", "", "기획전 없음");
							}else {
								_showcase = main_showcase_title + '<span class="text-primary">' + (i > 1 ? "+" + (i - 1) : '') + '</span>';
							}
							$('._drop_showcase_btn_' + v).html(_showcase);

						});

					}else {
						$.each(showcase_list_data.data, function (code, data) {
							if ($.inArray(data.code, prod_item_showcase_data) !== -1) {
								if (i == 0)
									main_showcase_title = data.title;
								i++;
							}
						});
						var _showcase = '';
						if (i == 0) {
							_showcase = getLocalizeString("설명_기획전없음", "", "기획전 없음");
						}else {
							_showcase = main_showcase_title + '<span class="text-primary">' + (i > 1 ? "+" + (i - 1) : '') + '</span>';
						}

						$('._drop_showcase_btn_' + selected_prod_list).html(_showcase);
					}

					location.reload();
				}else
					alert(result.msg);
			}
		});
	};

	var deleteProdFromShowcase = function(code, selected_list){
		var _old_data = showcase_list_data.get(code);
		if ( typeof _old_data == "undefined" ) return false;

		$.ajax({
			type: 'POST',
			data: {
				"type": "showcase",
				"mode": "delete",
				"showcase_list": code,
				"codes": selected_list
			},
			url: ('/admin/ajax/shop/prod_list_modify_manage_save.cm'),
			dataType: 'json',
			cache: false,
			success: function (res) {
				if (res.msg=='SUCCESS') {
					location.reload();
				} else {
					alert(result.msg);
				}
			}
		});
	};


	var checkProd = function(codes){
		var $list = $('._drop_showcase_list_' + codes[0]);
		if($list.length>0) {
			var res = $list.data('showcase').concat();
			$.each(codes, function (e, v) {
				res = array_intersect(res, $('._drop_showcase_list_' + v).data('showcase').concat());
			});
			var result = [];
			$.each(res, function (e, v) {
				if(v != '')
					result.push(v);
			});
			$check_drop_showcase_list.data('showcase', result);
			$check_drop_showcase_list.data('prod', codes);
			resetShowcaseListHtml();
		}
	};

	var openDeleteShowcase = function (showcase_code,mode) {
		if(typeof mode == 'undefined')
			mode = 'list';
		$.ajax({
			type: 'POST',
			data: {showcase_code : showcase_code,'mode':mode},
			url: ('/admin/ajax/shop/showcase_delete.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (html) {
				$.cocoaDialog.open({type:'admin',custom_popup:html,width:550,reopen:true});
			}
		});
	};
	var deleteShowcase =  function (showcase_code,mode) {
		if(typeof mode == 'undefined')
			mode = 'list';
		$.ajax({
			type: 'POST',
			data: {mode: 'delete', showcase_code : showcase_code},
			url: ('/admin/ajax/shop/showcase_form_proc.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (result) {
				if (result.msg == 'SUCCESS'){
					if(mode == 'list')
						window.location.reload();
					else if(mode == 'add'){

					}
				}else
					alert(result.msg);
			}
		});
	};


	return {
		init: function () {
			init();
		},
		listSetAllSelect : function(chk,callback) {
			listSetAllSelect(chk,callback);
		},
		listSetSelect : function(prod_code,callback) {
			listSetSelect(prod_code, callback);
		},
		loadList : function(page,search_data,base_url){
			loadList(page,search_data,base_url)
		},
		updateStatus : function(prod_code,status, callback){
			updateStatus([prod_code], status, callback);
		},
		updateStatusMulti : function(status){
			if (selected_prod_list.length>0)
				updateStatus(selected_prod_list, status);
			else alert(getLocalizeString("설명_선택된상품이없습니다", "", "선택된 상품이 없습니다"));
		},
		deleteProd : function(prod_code, callback){
			deleteProd([prod_code], callback);
		},
		deleteProdMulti : function(){
			if(selected_prod_list.length > 0){
				if(confirm(getLocalizeString("설명_n개의상품을삭제하시겠습니까", selected_prod_list.length, "%1개의 상품을 삭제 하시겠습니까")))
					deleteProd(selected_prod_list);
			}else alert(getLocalizeString("설명_선택된상품이없습니다", "", "선택된 상품이 없습니다"));
		},
		copyProdMulti : function(){
			if(selected_prod_list.length > 0){
				//if(confirm(selected_prod_list.length + " 개의 상품을 복제 하시겠습니까"))
				copyProd(selected_prod_list);
			}else alert(getLocalizeString("설명_선택된상품이없습니다", "", "선택된 상품이 없습니다"));
		},
		startKeywordSearch : function(){
			startKeywordSearch();
		},
		'startCategorySearch' : function(idx){
			startCategorySearch(idx);
		},
		'initShowcase' : function(code,url, data_list){
			initShowcase(code,url, data_list);
		},
		'openShowcaseForm' : function(code, mode){
			$.cocoaDialog.close();
			openShowcaseForm(code, mode);
		},
		'openIconManageMulti' : function(){
			if(selected_prod_list.length > 0){
				openIconManage(selected_prod_list);
			}else alert(getLocalizeString("설명_선택된상품이없습니다", "", "선택된 상품이 없습니다"));
		},
		'openProdDetailMulti' : function(type){
			if(selected_prod_list.length > 0){
				openProdDetailManage(selected_prod_list,type);
			}else alert(getLocalizeString("설명_선택된상품이없습니다", "", "선택된 상품이 없습니다"));
		},
		'saveProdDetailManage' : function(codes,type){
			saveProdDetailManage(codes,type);
		},
		'openProdDetailManageComplete' : function(type){
			openProdDetailManageComplete(type);
		},
		'changeProdDetailType' : function(type){
			changeProdDetailType(type);
		},
		'openProdModifyBatch' : function(){
			if(selected_prod_list.length > 0){
				openProdModifyBatch(selected_prod_list);
			}else alert(getLocalizeString("설명_선택된상품이없습니다", "", "선택된 상품이 없습니다"));
		},
		'openProdModifyBatchComplete' : function(){
			openProdModifyBatchComplete();
		},
		'openCategoryModifyManage' : function(){
			if(selected_prod_list.length > 0){
				openCategoryModifyManage(selected_prod_list);
			}else alert(getLocalizeString("설명_선택된상품이없습니다", "", "선택된 상품이 없습니다"));
		},
		'openCategoryModifyManageComplete' : function(){
			openCategoryModifyManageComplete();
		},
		"openProdListModifyManage": function(type){
			if(selected_prod_list.length > 0){
				openProdListModifyManage(selected_prod_list, type);
			}else alert(getLocalizeString("설명_선택된상품이없습니다", "", "선택된 상품이 없습니다"));
		},
		'openSaveProdPreSaleManageComplete' : function(){
			openSaveProdPreSaleManageComplete();
		},
		'openSaveProdDiscountComplete' : function(){
			openSaveProdDiscountComplete();
		},
		'openModifyProdPriceMulti' : function(){
			if(selected_prod_list.length > 0){
				openModifyProdPriceMulti(selected_prod_list);
			}else alert(getLocalizeString("설명_선택된상품이없습니다", "", "선택된 상품이 없습니다"));
		},
		'openModifyDiscount' : function(){
			if(selected_prod_list.length > 0){
				openModifyDiscount(selected_prod_list);
			}else alert(getLocalizeString("설명_선택된상품이없습니다", "", "선택된 상품이 없습니다"));
		},
		'openModifyPreSale' : function(){
			if(selected_prod_list.length > 0){
				openModifyPreSale(selected_prod_list);
			}else alert(getLocalizeString("설명_선택된상품이없습니다", "", "선택된 상품이 없습니다"));
		},
		'openIconManage' : function(prod_code,callback){
			openIconManage([prod_code], callback);
		},
		'completeIconManage' : function(){
			completeIconManage();
		},
		'addShowcaseForm' : function(m){
			addShowcaseForm(m);
		},
		'addShowcaseList' : function(data){
			addShowcaseList(data);
		},
		'checkProd' : function(codes){
			checkProd(codes);
		},
		"deleteProdFromShowcase": function(showcase_code){
			if ( selected_prod_list.length > 0 ) {
				deleteProdFromShowcase(showcase_code, selected_prod_list);
			} else {
				alert(getLocalizeString("설명_선택된상품이없습니다", "", "선택된 상품이 없습니다"));
			}
		},
		'concedeToggleShowcase' : function(obj,showcase_code){
			concedeToggleShowcase(obj,showcase_code);
		},
		'openDeleteShowcase' : function(c,m){
			openDeleteShowcase(c,m);
		},
		'deleteShowcase' : function(c,m){
			deleteShowcase(c,m);

		},
		'changeProdOrder' : function(type,action_code, showcase_code){
			if ( isBlank(showcase_code) ) {
				changeProdOrder(type,action_code);
			} else {
				changeShowcaseProdOrder(type, showcase_code, action_code);
			}
		},
		'changeShowcaseProdOrder' : function(type, showcase_code, action_code) {
			changeShowcaseProdOrder(type, showcase_code, action_code);
		}
	}
}();

var SHOP_PROD_MANAGE_CONST = {
	NPAY_INPUT_LENGTH : 20,
};

var SHOP_PROD_MANAGE = function(){

	var $form;
	var $imageList;
	var $categoryList;
	var $categoryManage;
	var $selectedCategoryList;
	var $prod_price;
	var $prod_price_org;
	var $deliv_price_type;
	var $deliv_price_flexable_wrap;
	var $deliv_price_fix_wrap;
	var $mileage_type;
	var $mileage_type_wrap;
	var $mileage_wrap;
	var $give_point_value;
	var $option_wrap;
	var $option_open_button;
	var $option_list;
	var $option_detail_require_wrap;
	var $option_detail_require;
	var $option_detail_optional_wrap;
	var $option_detail_optional;
	var $prod_content_wrap;
	var $simple_content_wrap;
	var $mobile_prod_content_wrap;
	var $optional_limit_type;
	var $optional_limit;
	var option_list = [];
	var option_detail_list = [];
	var option_detail_require_selected = [];
	var option_detail_optional_selected = [];
	var options_type = 'MIX';	/** MIX/SINGLE */
	var header_ctl;
	var $use_mobile_prod_content;
	var mobile_prod_content;
	var prod_content;
	var simple_content;
	var edit_mode = false;
	var images = {};
	var selected_category_code;
	var prodinfoarr = []; // 상품정보제공고시
	/** [{ code:'카테고리코드',filter:true/false, idx:번호, is_leaf_node:true/false, name:카테고리명 parent_code:부모카테고리코드}] */
	var categories = [];
	var categoriesTemp = [];	/** 카테고리 관리에서 임시저장용도 */
	var categoriesTempRemove = []; /* 카테고리 관리에서 임시저장용도 - 삭제용 */
	var categoriesTempDrag = [];	/** 카테고리 관리 드래그 처리용 */
	var prodCategories = [];	/** 선택되어있는 상품 카테고리 (코드문자열 배열) */
	var prod_price = {};
	var stock_use = false;	/** 재고 관리 사용 여부 */
	var option_detail_changed = false;	/** 옵션 상세설정(가격,재고등) 이 변경되었는지 여부 */
	var unitlist = {};	/*  key:unit_code value:{lang_code, currency_char, thousand_char, decimal_char, decimal_count}  */
	var unitcount = 0;
	var default_unit_code='';
	var current_unit_code='';
	var $unit_code = '';
	var $prod_deliv_list = '';
	var default_weight_item = "";
	var default_quantity_item = "";
	var default_amount_item = "";
	var product_submit_callback;
	var timer_checkCustomProdCode;
	var use_relative_option_price = {};
	var save_prod_progress_check = false;		// 상품 저장요청 진행 여부
	var prod_code_org = '';		// 연관상품 원본 상품코드
	var prod_relative_max_limit = 30;		// 연관상품 최대 연결수
	var $prod_relative_list_item_wrap;		// 연관상품 영역
	var prod_relative_data_list = {};		// 연관상품 데이터 리스트
	var prod_relative_data_list_cnt = 0;
	var prod_relative_checked_code_list = [];		// 연관상품 체크된 코드목록
	var page = 1;// 상품 상세 상단 하단 페이징
	var max_child_menu_cnt = 100;		// 자식 메뉴 개수 제한, 쇼핑 하위 카테고리도 제한됨
	var regularly_option_edit = true;	//정기구독 사용 상품은 옵션 수정 불가

	var openManual = function(type){
		var filename = '';
		switch(type){
			case 'option':
				filename='manual_option.cm';
				break;
			default:
				return;
		}
		$.ajax({
			type: 'POST',
			data: {},
			url: ('/admin/ajax/shop/' + filename),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (res) {
				var $html = $(res);
				$.cocoaDialog.open({type:'shop_'+type+'_manual',custom_popup:$html});
			}
		});
	};


	/**
	 * 유닛 데이터를 unitlist 배열에 추가
	 */
	var addUnitData = function(unit_code, lang_code, currency_char, thousand_char, decimal_char, decimal_count,currency_code){
		unitlist[unit_code] = {'lang_code':lang_code, 'currency_char': currency_char, 'thousand_char': thousand_char, 'decimal_char': decimal_char, 'decimal_count': decimal_count,'currency_code':currency_code};
		unitcount++;
	};

	var getUnitData = function(unit_code) {
		return unitlist[unit_code];
	};

	/**
	 * 이미지 업로드 완료 처리
	 * @param code
	 * @param url
	 */
	var imageUploadComplete = function(code,url){
		images[code] = url;
		$imageList.append("<div data-code='" + code + "' class='img_area_wrap _img_" + code + "' data-url='" + url + "'><img src='" + CDN_UPLOAD_URL + url + "' /><a href='javascript:;' class='btl bt-times-circle' onclick=\"SHOP_PROD_MANAGE.deleteImageUpload('" + code + "')\"></a></div>");
	};

	/**
	 * 업로드된 이미지 삭제 처리
	 */
	var deleteImageUpload = function(code){
		if ( typeof images[code] != 'undefined' ) {
			$imageList.find("div._img_"+code).remove();
			delete images[code];
			header_ctl.change();
		}

		if ( Object.keys(images).length == 0 ) {
			$('#prod_image_dropzone').show();
		}
	};

	/**
	 * 카테고리 관리 다이얼로그 초기화
	 */
	var initCategoryManage = function(container){
		$categoryManage = container;
		loadCategoryManage(true);
	};

	/**
	 * 카테고리 리스트 로딩
	 */
	var loadCategoryList = function(callback,reload,type){
		$.ajax({
			type: 'POST',
			data: {},
			url: ('/admin/ajax/shop/prod_category_list.cm'),
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					categories = res.data;
					filterCategoryTree('');
					if (reload) updateCategoryList(type);
					if (typeof callback == 'function') callback();
				}else
					alert(res.msg);
			}
		});
	};

	/**
	 * 카테고리 트리 검색 처리
	 * @param parent_code
	 */
	var filterCategoryTree = function(keyword){
		$.each(categories, function(no,data){
			if (keyword != ''){
				categories[no].filter = data.name[current_unit_code].toLowerCase().indexOf(keyword.toLowerCase()) != -1;
			}else{
				categories[no].filter = true;
			}
			if (categories[no].filter) setFilterCategoryTree(no);	//검색 매칭일경우 부모들도 필터 On
		});
	};

	/**
	 * 카테고리 트리 검색 필터 On 처리 (부모트리 모두 On 처리)
	 */
	var setFilterCategoryTree = function(no){
		categories[no].filter = true;
		if (categories[no].parent_code != '') {
			var no2 = findCategory(categories[no].parent_code);
			if (no2 != -1){
				setFilterCategoryTree(no2);
			}
		}
	};

	/**
	 * 카테고리 트리 HTML 생성
	 * @param html
	 * @param parent_code
	 * @param type : manage(카테고리관리화면용), select(카테고리선택화면용)
	 * @returns {*}
	 */
	var makeCategoryTree = function(html,parent_code,type){
		var categoryList = [];
		$.each((type=='manage' ? categoriesTemp : categories), function(no,data){
			if(data.parent_code == parent_code){
				categoryList.push(data);
			}
		});
		if (categoryList.length>0){
			if (type=='manage' || parent_code!='') {
				if (type =='prod_list') {
					html += '<div class="collapse in" id="collapse_'+parent_code+'">';
				}
				html += '<ol class="dropdown-list dd-list menu_list">';
			}
			$.each(categoryList, function(no,data){
				var custom_class = '';
				if (type=='manage' || parent_code!=''){
					if(!data.is_leaf_node)
						custom_class += ' sonson ';

					if (parent_code=='' && data.is_leaf_node)
						custom_class += ' top-leaf ';
					html += '<li class="dropdown-item dd-item doz_item '+custom_class+'" data-code="' + data.code + '">';
				}

				if (type=='manage'){	//카테고리관리
					html += '<div class="dropdown-handle dd-handle _menu_item" data-code="' + data.code + '" id="prod_category_manage_' + data.code + '" onclick="SHOP_PROD_MANAGE.setSelectCategory(\'' + data.code  + '\')">';
					html += '<span class="_name">' + RemoveTag(typeof data.name[current_unit_code] == "undefined" ? "" : data.name[current_unit_code]) + '</span>';
					//html += '<span class="_name">' + RemoveTag(data.name) + '<span> (' + data.order_no + ')</span></span>';	@TODO 카테고리별 상품숫자


					/* 카테고리명 입력방식 변경됨
					html += '<input style="display:none" type="text" class="_editname form-control" value="' + RemoveTag(data.name)  + '" onblur="SHOP_PROD_MANAGE.setCategoryNameEditMode(\'' + data.code + '\',false)" onchange="SHOP_PROD_MANAGE.changeCategoryName(\'' + data.code + '\', $(this).val())" onkeydown="if(event.keyCode==27) { SHOP_PROD_MANAGE.setCategoryNameEditMode(\'' + data.code + '\',false); event.cancelBubble=true; return false; }" />';
					html += '<input style="display:none" type="text" class="_editname form-control" value="' + RemoveTag(data.name)  + '" onchange="SHOP_PROD_MANAGE.changeCategoryName(\'' + data.code + '\', $(this).val())" />';
					*/

					html += '<div class="i-group">';
					/*html += '<a href="javascript:;" onclick="SHOP_PROD_MANAGE.setCategoryNameEditMode(\'' + data.code + '\',true)"><i class="btl bt-pencil"></i></a>';*/
					html += '<a href="javascript:;" onclick="SHOP_PROD_MANAGE.removeCategory(\'' + data.code + '\')"><i class="btl bt-times-circle"></i></a>';
					html += '</div>';
					html += '<div class="drag">';
					html += '</div>';
					html += '</div>';
				} else if (type=='prod_list'){	//카테고리관리
					html += '<div class="holder">';
					html += '<div class="dropdown-handle dd-handle _menu_item" data-code="' + data.code + '" id="prod_list_category_' + data.code + '" onclick="SHOP_PROD_LIST.startCategorySearch(\'' + data.code  + '\')">';
					html += '<span class="_name">' + RemoveTag(typeof data.name[current_unit_code] == "undefined" ? "" : data.name[current_unit_code]) + '</span>';
					//html += '<span class="_name">' + RemoveTag(data.name) + '<span> (' + data.order_no + ')</span></span>';	@TODO 카테고리별 상품숫자
					html += '</div>';
					if ( !data.is_leaf_node ) html += '<button class="collapse_btn btn" type="button" data-toggle="collapse" data-target="#collapse_' + data.code + '" aria-expanded="true" aria-controls="collapseExample"></button>';
					html += '</div>';
				} else {	//카테고리선택
					if (data.filter){	//검색조건에 해당되는경우에만 출력
						if (data.is_leaf_node) {	//말단노드인경우체크가능
							html += '<div class="checkbox checkbox-styled dropdown-handle">';
							html += '<label>';
							if (findProdCategory(data.code)==-1){
								html += '<input type="checkbox" id="prod_category_select_' + data.code + '" onclick="SHOP_PROD_MANAGE.selectProdCategory(\'' + data.code + '\',$(this).prop(\'checked\'),true)">';
							}else{
								html += '<input type="checkbox" id="prod_category_select_' + data.code + '" onclick="SHOP_PROD_MANAGE.selectProdCategory(\'' + data.code + '\',$(this).prop(\'checked\'),true)" checked="checked">';
							}
							html += '<span class="check-item">' + RemoveTag(typeof data.name[current_unit_code] == "undefined" ? "" : data.name[current_unit_code]) + '</span>';
							html += '</label>';
							html += '</div>';
						}else{
							html += '<div class="dropdown-handle">' + RemoveTag(typeof data.name[current_unit_code] == "undefined" ? "" : data.name[current_unit_code]) + '</div>';
						}
					}
				}
				html = makeCategoryTree(html, data.code, type);	//자식 카테고리 탐색
				if (type=='manage' || parent_code!='')  html += '</li>';
			});
			if (type=='manage' || parent_code!='') {
				html += '</ol>';
				if (type =='prod_list') {
					html += '</div>';
				}
			}

		}
		return html;
	};

	/**
	 *  카테고리 코드로 검색
	 *  @param code
	 */
	var findCategory = function(code){
		var result=-1;
		$.each(categories, function(no,data){
			if (data.code == code) {
				result=no;
				return false;
			}
		});
		return result;
	};
	var findCategoryCodebyNo = function(no){
		var result=-1;
		$.each(categories, function(_no,data){
			if (_no == no) {
				result=data.code;
				return false;
			}
		});
		return result;
	};
	var findCategoryTempChildrenCode = function(code,deep){
		var deep = typeof deep == 'undefined'?false:deep;
		var result = [];
		$.each(categoriesTemp, function(no,data){
			if (data.parent_code == code) {
				result.push(data.code);
				if(deep){
					var deep_result = findCategoryTempChildrenCode(data.code,deep);
					result = $.merge(result, deep_result);
				}
			}
		});
		return result;
	};

	var findFirstCategory = function(){
		var result=-1;
		var sort_no = 100000;
		$.each(categories, function(no,data){
			if (data.parent_code == '') {
				if(data.sort_no <= sort_no){
					sort_no = data.sort_no;
					result=no;
				}
			}
		});
		return result;
	};

	/**
	 *  카테고리 코드로 검색 (임시 저장에서 탐색)
	 *  @param code
	 */
	var findCategoryTemp = function(code){
		for(var i=0; i<categoriesTemp.length; i++){
			if (categoriesTemp[i].code == code) return i;
		}
		return -1;
	};

	/**
	 * 카테고리 목록 랜더링
	 */
	var updateCategoryList = function(type){
		var type = typeof type == 'undefined' ? 'select' : type;
		var html = makeCategoryTree('','',type);
		$categoryList = $('#prod_category_list');
		$categoryList.html(html);

	};

	/**
	 * 카테고리 이름 변경
	 * @param code
	 * @param name
	 */
	var changeCategoryName = function(unit_code,code,name,callback){
		var n = findCategoryTemp(code);
		if (n != -1){
			if($.trim(name) == '')
				name = categoriesTemp[n].name[unit_code];
			categoriesTemp[n].name[unit_code] = $.trim(name);
			callback();
		}
	};

	var changeCategoryPermission = function(code, permission, callback){
		var n = findCategoryTemp(code);
		if (n != -1){
			if($.trim(permission) == '')
				permission = categoriesTemp[n].permission;
			categoriesTemp[n].permission = $.trim(permission);
			callback();
		}
	};

	var changeCategoryPermissionGroup = function(code){
		var n = findCategoryTemp(code);
		var category_permission_group = $('#category_permission_group').val();
		if (n != -1){
			if(category_permission_group == null)
				category_permission_group = categoriesTemp[n].permission_group;
			categoriesTemp[n].permission_group = category_permission_group;
		}
	};

	/**
	 * 카테고리 다이얼로그 랜더링
	 *
	 * @param reloadTemp categories값을 temp로 다시 불러올지 여부
	 */
	var loadCategoryManage = function(reloadTemp){
		if (reloadTemp) {
			categoriesTemp = JSON.parse(JSON.stringify( categories ));	//deep copy
			categoriesTempRemove = [];
		}

		var html = makeCategoryTree('','','manage');
		$categoryManage.html(html);
		$categoryManage.data({'nestable':false,'nestableId':false,'nestableGroup':false});
		if(typeof selected_category_code ==='undefined' || selected_category_code==''){
			selected_category_code = '';
			var first_category_no = findFirstCategory();
			var first_category = categories[first_category_no];
			if(typeof first_category != 'undefined'){
				selected_category_code = categories[findFirstCategory()].code;
			}
		}
		setSelectCategory(selected_category_code);
		$categoryManage.off('doz_change').off('doz_reset');
		$categoryManage.nestable({'maxDepth':3}).off('doz_change').on('doz_change', function(e,type_change,data){
			// 같은 레벨의 카테고리가 제한 개수 초과 시 이동 취소
			var $li = $categoryManage.find('li[data-code='+data.code+']');
			var $parent = $li.parent().parent('li.dd-item');
			var parent_code = '';
			if($parent.length >0)
				parent_code = $parent.data('code');
			// 같은 parent_code 내의 이동은 체크하지 않아야 함
			if(getParentCodeTemp(data.code) == parent_code || categoriesTemp.length <= max_child_menu_cnt || checkAvailableAddCategoryByParentCode(parent_code)){
				categoriesTempDrag = [];
				procCategoryManageDrag($categoryManage.nestable('serialize'), '');
				categoriesTemp = JSON.parse(JSON.stringify( categoriesTempDrag ));	//deep copy
				categoriesTempDrag = null;
				loadCategoryManage(false);
				setSelectCategory(selected_category_code);
			}else{
				alert(getLocalizeString("설명_최상위메뉴와하위메뉴최대n개제한", max_child_menu_cnt, "최상위 메뉴와 특정 메뉴 바로 다음 하위 메뉴의 개수가 최대 %1개를 넘지 않도록 구성해주세요."));
				loadCategoryManage(false);
			}
		}).on('doz_reset', function(e,type_change,data){
			loadCategoryManage(false);
			setSelectCategory(selected_category_code);
		});
	};

	/**
	 * 카테고리 관리 드래그 처리용 함수
	 * @param nodeList [] nestable serialize array
	 */
	var procCategoryManageDrag = function(nodeList,parent_code){
		$.each(nodeList, function(no,node){
			var no2 = findCategoryTemp(node.code);
			if (no2 != -1){
				var is_leaf_node = (typeof node.children == 'undefined');
				var tmp = categoriesTemp[no2];
				tmp.sort_no = no;
				tmp.parent_code = parent_code;
				tmp.is_leaf_node = is_leaf_node;
				categoriesTempDrag.push(tmp);
				if (typeof node.children != 'undefined'){
					procCategoryManageDrag(node.children,node.code);
				}
			}
		});
	};

	/**
	 * 카테고리 관리 스크롤 처리용 함수
	 */
	var prodCategoryManageScroll = function(){
		var mouseY;
		var speed = 0.15;
		var zone = 50;

		$('.category-body.dd').mousemove(function(e){
			mouseY = (e.pageY - 126) - $(window).scrollTop();
		}).mouseover();

		var dragInterval = setInterval(function(){

			if ($('.dd-dragel') && $('.dd-dragel').length > 0 && !$('html, body').is(':animated')) {
				var bottom = $('.category-body').height() - zone;
				if (mouseY > bottom && ($(window).scrollTop() + $('.category-body').height() < $(document).height() - zone)) {
					$('.category-body.dd').animate({scrollTop:  $('.category-body.dd').scrollTop() + ((mouseY + zone - $('.category-body').height()) * speed)},0);
				}
				else if (mouseY < zone && $(window).scrollTop() >= 0) {
					$('.category-body.dd').animate({scrollTop: $('.category-body.dd').scrollTop() + ( (mouseY - zone) * speed) },0);
				} else {
					$('.category-body.dd').finish();
				}
			}
		},30);
	};


	/**
	 * 카테고리 관리모드에서 저장 실행
	 */
	var saveCategoryManage = function(type){

		dozProgress.start();
		$.ajax({
			type: 'POST',
			data: {'categories':categoriesTemp, 'remove_categories':categoriesTempRemove},
			url: ('/admin/ajax/shop/prod_category_save.cm'),
			dataType: 'json',
			cache: false,
			success: function (res) {
				if (res.msg=='SUCCESS'){
					if (type=='dashboard'){
						loadCategoryList(function(){
							loadCategoryManage(true);
							arrangeProdCategory(function(remove_count){ if (remove_count>0) header_ctl.change(); showProdCategory(); });
							$.cocoaDialog.close();
						},true);
					}else if (type=='design'){
						$(window).trigger('shop_category_reload');
						$.cocoaDialog.hide();
					}else if (type=='prod_list'){
						window.location.reload();
					}
				}else{
					alert(res.msg);
					window.location.reload();
				}
				dozProgress.done();
			}
		});
	};

	/**
	 * 카테고리 삭제 (카테고리 관리에서 사용)
	 * @param code
	 */
	var removeCategory = function(code, callback){
		var no = findCategoryTemp(code);
		if (no != -1){
			$.ajax({	//카테고리코드를 생성하기위해 ajax 호출
				type : 'POST',
				data : {'category_code' : code},
				url : ('/admin/ajax/shop/check_category_prod_count.cm'),
				dataType : 'json',
				async: false,
				cache : false,
				success : function(res){
					if(res.msg == 'SUCCESS'){
						var is_remove = (
							res.prod_cnt == 0
								?	true
								:	confirm(getLocalizeString("설명_카테고리미지정상품없도록권장", "", "카테고리 삭제로 상품에 지정된 카테고리가 존재하지 않을 경우 네이버 쇼핑, 다음 쇼핑하우 등 연동시 문제가 발생할 수 있습니다. \n\n카테고리가 미지정 상품이 없도록 권장하며, 연동 게시판 사용 시 카테고리 미지정 상품의 경우 리뷰 및 문의가 노출되지 않을 수 있습니다.\n\n카테고리를 삭제하시겠습니까? \n\n이곳에서 삭제해도 저장하기 전까진 반영되지 않습니다."))
						);

						if ( is_remove ) {
							categoriesTemp.splice(no, 1);
							categoriesTempRemove.push(code);
							var childs = findCategoryTempChildrenCode(code,false);
							if(childs.length > 0){
								$.each(childs, function(e, _code){
									removeCategory(_code);
								});
							}
							if(typeof callback == 'function')
								callback();
						}
					}
				}
			});
		}
	};

	/**
	 * cartgoriesTemp에서 특정 코드의 부모 카테고리 반환
	 * @param code				// 대상 카테고리 코드
	 * @returns {string}		// 부모 카테고리 코드, 최상위일 경우 ''
	 */
	var getParentCodeTemp = function(code){
		var selected_parent_code = '';		// 부모 카테고리가 없을 경우 최상위 카테고리 체크
		for(var i=0; i<categoriesTemp.length; i++){
			if (categoriesTemp[i].code == code){
				selected_parent_code = categoriesTemp[i].parent_code;
				break;
			}
		}
		return selected_parent_code;
	};

	/**
	 * 메뉴 개수 제한에 따른 카테고리 개수 제한 체크
	 * @param parent_code		// 대상의 부모 카테고리 코드(없으면 최상위 카테고리 체크)
	 * @returns {boolean}		// true면 제한에 걸리지 않아 추가 가능, false면 제한에 걸려 추가 제한
	 */
	var checkAvailableAddCategoryByParentCode = function(parent_code){
		var sibling_count = 0;
		for (var i=0; i<categoriesTemp.length; i++) {
			if(categoriesTemp[i].parent_code == parent_code) sibling_count++;
		}
		return sibling_count < max_child_menu_cnt;
	};

	/**
	 * 카테고리 추가 (카테고리 관리에서 사용)
	 * @param code
	 */
	var addCategory = function(name, callback){
		if(categoriesTemp.length <= max_child_menu_cnt || checkAvailableAddCategoryByParentCode(getParentCodeTemp(selected_category_code))){
			$.ajax({	//카테고리코드를 생성하기위해 ajax 호출
				type: 'POST',
				data: {'current_category_count':categoriesTemp.length},
				url: ('/admin/ajax/shop/prod_category_make_code.cm'),
				dataType: 'json',
				cache: false,
				success: function (res) {
					if (res.msg=='SUCCESS'){
						var sort_no=0;
						var parent_code='';
						var pos=-1;
						if (selected_category_code!=''){	//선택한 카테고리가있을경우 다음 위치에
							pos = findCategoryTemp(selected_category_code);
							if (pos != -1){
								sort_no = parseInt(categoriesTemp[pos].sort_no);
								if (categoriesTemp.length > 0) {
									for (var i=0; i<categoriesTemp.length; i++) {
										if (parseInt(categoriesTemp[i].sort_no) > sort_no){
											categoriesTemp[i].sort_no++;
										}
									}
								}
								sort_no++;
								parent_code = categoriesTemp[pos].parent_code;
							}
						}else {
							//가장 마지막 최상위 카테고리의 정렬번호+1 사용
							var tmpNo = 0;
							if (categoriesTemp.length > 0) {
								for (var i = (categoriesTemp.length - 1); i >= 0; i--) {
									if (categoriesTemp[i].parent_code == '') {
										tmpNo = parseInt(categoriesTemp[i].sort_no);
										if (tmpNo > sort_no) sort_no = tmpNo;
									}
								}
								sort_no++;
							}
							pos = categoriesTemp.length - 1;
						}
						var name_list = {};
						$.each(unitlist, function(unit_code, unit_data){
							if(typeof name === 'undefined' || name==''){
								switch(unit_data.lang_code){
									case 'EN' :
										name = 'new category';
										break;
									case 'KR' :
									case 'KO' :
									default :
										name = getLocalizeString("설명_새카테고리", "", "새 카테고리");
										break;
								}
							}
							name_list[unit_code] = name;
						});
						categoriesTemp.splice(pos+1,0,{'code':res.code,'filter':true,'idx':0,'is_leaf_node':true,'name':name_list,'sort_no':sort_no,'parent_code':parent_code});	//idx가0이면신규카테고리
						callback(res.code);
					}else{
						alert(res.msg);
					}
				}
			});
		}else{
			alert(getLocalizeString("설명_최상위메뉴와하위메뉴최대n개제한", max_child_menu_cnt, "최상위 메뉴와 특정 메뉴 바로 다음 하위 메뉴의 개수가 최대 %1개를 넘지 않도록 구성해주세요."));
		}
	};

	/**
	 * 상품 카테고리 전체 선택 해제 처리
	 */
	var deselectAllProdCategory = function(){
		for (var i=0; i<prodCategories.length; i++){
			$('#prod_category_select_' + prodCategories[i]).prop('checked', false);
		}
		prodCategories = [];
	};

	/**
	 * 상품 카테고리 선택
	 * @param categoryCode
	 * @param check (BOOL)
	 */
	var selectProdCategory = function(categoryCode, check, reloadDisplay){
		var no = findProdCategory(categoryCode);
		if (check) {
			if (no==-1) {
				//deselectAllProdCategory();
				prodCategories.push(categoryCode);
				$('#prod_category_select_' + categoryCode).prop('checked', true);
			}
		}else{
			if (no != -1){
				prodCategories.splice(no,1);
				$('#prod_category_select_' + categoryCode).prop('checked', false);
			}
		}
		if (reloadDisplay) {
			header_ctl.change();
			showProdCategory();
		}
	};

	/**
	 * 특정 코드의 상품 카테고리가 선택되어있는지 확인
	 * @param categoryCode
	 * @return selectNo or -1
	 */
	var findProdCategory = function(categoryCode){
		var result=-1;
		$.each(prodCategories, function(no, value){
			if (categoryCode == value){
				result=no;
				return false;
			}
		});
		return result;
	};

	/**
	 * 특정 코드의 상품 카테고리 선택 해제
	 * @param categoryCode
	 */
	var removeProdCategory = function(categoryCode,callback){
		var no = findProdCategory(categoryCode);
		if (no != -1){
			prodCategories.splice(no,1);
			$('#prod_category_select_' + categoryCode).prop('checked', false);
			if (typeof callback != 'undefined') callback();
		}
	};

	/**
	 * 선택된 상품 카테고리중에서 삭제된것과 최하위 카테고리가 아닌것들 제거
	 */
	var arrangeProdCategory = function(callback){
		var isRemoved=false;
		var removeCnt=0;
		while(1){
			isRemoved=false;
			$.each(prodCategories, function(no,data){
				var no2 = findCategory(data);
				if (no2==-1){
					isRemoved=true;
				} else {
					if (!categories[no2].is_leaf_node) isRemoved = true;
				}
				if (isRemoved){
					prodCategories.splice(no,1);
					removeCnt++;
					return false;
				}
			});
			if (!isRemoved) break;
		}
		callback(removeCnt);
	};

	/**
	 * 현재 선택된 상품 카테고리 목록 화면에 출력
	 */
	var showProdCategory = function(){
		var html = '';
		$.each(prodCategories, function(no, value){
			html += '<p class="text-default">';
			html += getCategoryFullString(value);
			html += '<a href="javascript:;" style="float: right" class="on" onclick="SHOP_PROD_MANAGE.removeProdCategory(\'' + value + '\')"><i class="btl bt-times"></i></a>';
			html += '</p>';
		});
		$selectedCategoryList.html(html);
	};

	/**
	 * 카테고리 코드를 이용해서 카테고리 전체 문자열을 구함
	 * @param code
	 * @return Array
	 */
	var getCategoryFullString = function(code){
		var getCategoryFullStringSub= function(code,strArr){
			var no = findCategory(code);
			if (no == -1) {
				strArr.unshift("<span>" + getLocalizeString("설명_삭제된카테고리", "", "삭제된 카테고리") + "</span> ");
			}else{
				strArr.unshift("<span>" + RemoveTag(categories[no].name[current_unit_code]) + "</span> ");
				if (categories[no].parent_code != ''){
					strArr = getCategoryFullStringSub(categories[no].parent_code, strArr);
				}
			}
			return strArr;
		};

		var strArr = [];
		strArr = getCategoryFullStringSub(code,strArr);
		return strArr.join('<span> &gt; </span>');

	};

	/**
	 * 카테고리 관리 다이얼로그 시작
	 */
	var openCategoryManage = function(type){
		if (type=='design'){
			loadCategoryList(function(){
				$.ajax({
					type: 'POST',
					data: {'type': type},
					url: ('/admin/ajax/shop/prod_category_manage_design.cm'),
					dataType: 'json',
					cache: false,
					success: function (res) {
						if (res.msg == 'SUCCESS') {
							var $dialog = $(res.html);
							$.cocoaDialog.open({type: 'category_mgr', custom_popup: $dialog, 'close_block':true});
							initCategoryManage($dialog.find('#prod_category_manage'));
						} else
							alert(res.msg);
					}
				});
			},false);

		}else if (type=='dashboard' || type=='prod_list'){
			$.ajax({
				type: 'POST',
				data: {'type': type},
				url: ('/admin/ajax/shop/prod_category_manage.cm'),
				dataType: 'json',
				cache: false,
				success: function (res) {
					if (res.msg == 'SUCCESS') {
						$.cocoaDialog.open({type : 'admin_category', custom_popup : res.html, hide_event : function(){
								$('.popover').popover('hide');
							}});
						initCategoryManage($('#prod_category_manage'));
						prodCategoryManageScroll();
					} else
						alert(res.msg);
				}
			});
		}
	};

	/**
	 * 카테고리 이름 변경 모드 시작/종료 (카테고리 관리에서 사용
	 * @param code
	 * @param mode (true/false)
	 */
	var categoryNameEditCancelValue = '';
	var isCategoryNameEditMode=false;
	var setCategoryNameEditMode = function(mode){
		isCategoryNameEditMode = mode;
		/* 카테고리이름입력방식변경 */
		/*
		var $o = $('#prod_category_manage_' + code);
		var $oInput = $o.find("input._editname");
		var $oLabel = $o.find("span._name");
		if (mode){
			categoryNameEditCancelValue = $oInput.val();
			$oLabel.hide();
			$oInput.show().focus();
		}else{
			$oInput.val(categoryNameEditCancelValue).hide();
			$oLabel.show();
		}
		*/
	};
	/**
	 * 카테고리 선택 처리
	 * @param code
	 * @param mode
	 */
	var setSelectCategory = function(code){
		var $prod_category_manage_name = $('#prod_category_manage_name');
		var $prod_category_manage_permission = $('#prod_category_manage_permission');
		var $category_permission_group_wrap = $('#category_permission_group_wrap');

		if (selected_category_code!=''){
			$('#prod_category_manage_' + selected_category_code).removeClass('active');
			var no = findCategoryTemp(code);
			if (no>-1){
				$prod_category_manage_name.show();
				$prod_category_manage_permission.show();
				if (isCategoryNameEditMode){
					$prod_category_manage_name.find("input").blur();
				}
				$.each(unitlist, function(unit_code, unit_data){
					$prod_category_manage_name.find("input._" + unit_code).val(typeof categoriesTemp[no].name[unit_code] == "undefined" ? "" : categoriesTemp[no].name[unit_code] );
				});
				$prod_category_manage_permission.find("select").val(categoriesTemp[no].permission == undefined || categoriesTemp[no].permission == "" ? "guest" : categoriesTemp[no].permission ).attr("selected","selected");

				if(categoriesTemp[no].permission == 'group'){
					$.ajax({
						type: 'POST',
						data: {category_code:code},
						url: ('/admin/ajax/shop/category_permission_setting.cm'),
						dataType: 'json',
						success: function (res) {
							if(res.msg == 'SUCCESS'){
								$('#category_permission_group').html(res.html);
								$('#category_permission_group').chosen('destroy');
								$('#category_permission_group').chosen({width: "100%",no_results_text: getLocalizeString("설명_선택된그룹이없습니다", "", "선택된 그룹이 없습니다.")});
							}
						}
					});
					$category_permission_group_wrap.show();
				}else{
					$category_permission_group_wrap.hide();
				}
			}else{
				$prod_category_manage_name.hide();
				$prod_category_manage_permission.hide();
			}
		}else{
			$prod_category_manage_name.hide();
			$prod_category_manage_permission.hide();
		}
		$('#prod_category_manage_' + code).addClass('active');
		selected_category_code = code;
	};

	/**
	 * 다국어 지원용 에디터 내용 셋팅
	 */
	var localize_editor_current_tab = {};
	var loadLocalizeEditor = function(editor_id, unit_code){
		var tab = '';
		if(typeof localize_editor_current_tab[editor_id] == "undefined")
			tab = default_unit_code;
		else
			tab =localize_editor_current_tab[editor_id];
		$('#' + editor_id + '_tab_' + tab).removeClass('active');
		$('#' + editor_id + '_tab_' + unit_code).addClass('active');
		if(FROALA_VERSION >= 300){
			$('#' + editor_id).data('unitcode', unit_code);
			FroalaEditor("#" + editor_id).html.set($('#' + editor_id + '_' + unit_code).val(), true);
		}else{
			$('#' + editor_id).data('unitcode', unit_code).froalaEditor('html.set', $('#' + editor_id + '_' + unit_code).val(), true);
		}
		if($('#' + editor_id + '_tab_' + unit_code).hasClass('KR')){        // 언어가 한국어일때만 상품정보제공고시를 표시함
			$('._product_information').show();
		}else{
			$('._product_information').hide();
		}
		localize_editor_current_tab[editor_id] = unit_code
	};

	var loadLocalizeHeader = function(unit_code){
		$('#common_header_setting_'+unit_code).prevAll().hide();
		$('#common_header_setting_'+unit_code).nextAll().hide();
		$('#common_footer_setting_'+unit_code).prevAll().hide();
		$('#common_footer_setting_'+unit_code).nextAll().hide();
		$('#common_header_setting_'+unit_code).show();
		$('#common_footer_setting_'+unit_code).show();
	};

	/**
	 * 다국어 지원용 에디터 내용 변경시 처리
	 */
	var changeLocalizeEditor = function(editor_id, unit_code){
		$('#' + editor_id + '_' + unit_code).val($('#' + editor_id).val());
	};

	var prod_idx = 0;
	var initAdd = function(type,idx,unit_code,$deliv_list,regularly_exist){
		prod_idx = idx;
		$prod_deliv_list = $deliv_list;
		edit_mode = type=='save';
		$form = $('#prod_add');
		prod_content = $('#prod_content');
		$use_mobile_prod_content = $('#use_mobile_prod_content');
		mobile_prod_content = $('#mobile_prod_content');
		mobile_prod_content.hide();
		simple_content = $('#simple_content');
		$prod_content_wrap = $form.find('._prod_content_wrap');
		$mobile_prod_content_wrap = $form.find('._mobile_prod_content_wrap');
		$simple_content_wrap = $form.find('._simple_content_wrap');
		$optional_limit_type = $form.find('._optional_limit_type');
		$optional_limit = $form.find('._optional_limit');
		var default_weight_item_style = '';
		if(unitlist[unit_code].currency_code !== "KRW"){
			default_weight_item_style = 'dashed';
		}
		$(document).ready(function(){
			default_weight_item = "<div class='input-group' style='line-height: 2.1;padding-bottom: 20px;'>" +
				"<span>" + getLocalizeString('설명_상품무게', '', '상품무게') + "</span>" +
				"<div class='input-group-content width-2 input-number'>" +
				"<input type='text' name='weight_start_size' data-decimal-count='2' class='form-control _weight_start_size' value=''>" +
				"</div>" +
				"<div class='visible-xs'></div><span>" + getLocalizeString('설명_kg부터', '', 'kg 부터') + "</span>" +
				"<div class='input-group-content width-2 input-krw _weight_end_size' style='display: none;'>" +
				"<input type='text' class='form-control _weight_end_size' value=''>" +
				"</div>" +
				"<div class='visible-xs'></div><span class='_weight_end_size_text' style='display: none;'>" + getLocalizeString('설명_kg미만', '', 'kg 미만') + "</span>" +
				"<div class='input-group-content width-2 input-krw'>" +
				"<span class='control-krw'>"+LOCALIZE.getCurrency()+"</span>" +
				"<input type='text' data-decimal-count='"+unitlist[unit_code].decimal_count+"' data-decimal-char='"+unitlist[unit_code].decimal_char+"' data-thousand-char='"+unitlist[unit_code].thousand_char+"' class='form-control _weight_price' name='weight_price' value='' style='padding-left: 20px; border-bottom-style:"+default_weight_item_style+"'>" +
				"</div>" +
				"<span>" + getLocalizeString('설명_부과', '', '부과') + " <a href='javascript:;' class='_delete_weight _delete_row_btn text-primary' style='margin-left: 8px'>" + getLocalizeString('버튼_삭제', '', '삭제') + "</a></span>" +
				"</div>";

			default_quantity_item = "<div class='input-group' style='line-height: 2.1;padding-bottom: 20px;'>" +
				"<div class='input-group-content width-2 input-money'>" +
				"<input type='text' name='quantity_start_count' class='form-control _quantity_start_count' value=''>" +
				"</div>" +
				"<div class='visible-xs'></div><span>" + getLocalizeString("설명_n개이상구매시", "", "%1개 이상 구매시") + "</span>" +
				"<div class='input-group-content width-2 input-krw _quantity_end_count' style='display: none;'>" +
				"<input type='text' class='form-control _quantity_end_count' value=''>" +
				"</div>" +
				"<div class='input-group-content width-2 input-krw'>" +
				"<span class='control-krw'>"+LOCALIZE.getCurrency()+"</span>" +
				"<input type='text' data-decimal-count='"+unitlist[unit_code].decimal_count+"' data-decimal-char='"+unitlist[unit_code].decimal_char+"' data-thousand-char='"+unitlist[unit_code].thousand_char+"' class='form-control _quantity_price' name='quantity_price' value='' style='padding-left: 20px; border-bottom-style:"+default_weight_item_style+"'>" +
				"</div>" +
				"<span>" + getLocalizeString("설명_부과", "", "부과") + " <a href='javascript:;' class='_delete_quantity _delete_row_btn text-primary' style='margin-left: 8px'>" + getLocalizeString("버튼_삭제", "", "삭제") + "</a></span>" +
				"</div>";

			default_amount_item = "<div class='input-group' style='line-height: 2.1;padding-bottom: 20px;'>" +
				"<div class='visible-xs'></div><span>" + getLocalizeString("설명_구매금액합계", "", "구매금액 합계") + "</span>" +
				"<div class='input-group-content width-3 input-krw'>" +
				"<span class='control-krw'>" + LOCALIZE.getCurrency() + "</span>" +
				"<input type='text' class='form-control _amount_start_price' name='amount_start_price' value='0'>" +
				"</div>" +
				"<div class='visible-xs'></div><span>" + getLocalizeString("설명_부터", "", "부터") + "</span>" +
				"<div class='visible-xs'></div>" +
				"<div class='input-group-content width-2 input-krw'>" +
				"<span class='control-krw'>" + LOCALIZE.getCurrency() + "</span>" +
				"<input type='text' class='form-control _amount_price' name='amount_price' value='0'>" +
				"</div>" +
				"<span>" + getLocalizeString("설명_부과", "", "부과") + "<a href='javascript:;' class='_delete_amount _delete_row_btn text-primary' style='margin-left: 8px;'>" + getLocalizeString("버튼_삭제", "", "삭제") + "</a></span>" +
				"</div>";

		})

		$imageList = $('#prod_image_list');
		$categoryList = $('#prod_category_list');
		$selectedCategoryList = $('#prod_selected_category_list');
		$prod_price = $form.find("input._prod_price");
		$prod_price_org = $form.find("input._prod_price_org");
		$deliv_price_flexable_wrap = $form.find("._deliv_price_flexable_wrap");
		$deliv_price_fix_wrap = $form.find("._deliv_price_fix_wrap");
		$deliv_price_type = $('#deliv_price_type');
		$mileage_type = $('#mileage_type_' + unit_code);
		$mileage_type_wrap = $('#mileage_type_wrap_' + unit_code);
		$mileage_wrap = $('#mileage_wrap_' + unit_code);
		$give_point_value = $form.find('input._give_point_value');
		$categoryList.click(function(e) {
			e.stopPropagation();
		});
		$option_list = $('#prod_option_list');
		$option_detail_require_wrap = $('#prod_option_detail_require_wrap');
		$option_detail_require = $('#prod_option_detail_require');
		$option_detail_optional_wrap = $('#prod_option_detail_optional_wrap');
		$option_detail_optional = $('#prod_option_detail_optional');
		$option_wrap = $('#prod_option_wrap');
		$option_open_button = $('#prod_option_open_button');
		$unit_code = unit_code;

		if(regularly_exist == 'Y'){
			regularly_option_edit = false;
		}

		header_ctl = new HEADER_CONTROL();
		header_ctl.init();
		header_ctl.addBtn('cancel',function(){
			history.go(-1);
		});
		header_ctl.addBtn('save',function(){
			submit();
		});

		loadLocalizeHeader(unit_code);

		$('#prod_image_upload').fileupload({
			url: '/admin/ajax/upload_file_mongo.cm',
			formData: {temp: 'Y', target: 'shopping_prod', type: 'image'},
			dataType: 'json',
			singleFileUploads: true,
			limitMultiFileUploads: 1,
			dropZone: $('#prod_image_dropzone2'),
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
						$('#prod_image_dropzone').hide();
						imageUploadComplete(tmp.code,tmp.url);
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

		$imageList.sortable({
			update: function( event, ui ) {
				images = {};
				$imageList.find("div.img_area_wrap").each(function(no, item){
					images[$(item).data('code')] = $(item).data('url');
				});
				header_ctl.change();
			}
		});

		var image_insert_key = 'image_insert_key';
		var image_insert_key2 = 'image_insert_key2';
		var image_replace_key = 'image_replace_key';
		var image_replace_key2 = 'image_replace_key2';
		if(FROALA_VERSION >= 300){
			setFroala('#prod_content', {
				code : '',
				image_upload_url : "/ajax/post_image_upload.cm",
				file_upload_url : "/ajax/post_file_upload.cm",
				file_list_obj : $("#file_list"),
				image_insert_key : image_insert_key,
				image_replace_key : image_replace_key,
				image_align : 'center',
				image_display : 'block',
				toolbarStickyOffset : 38,
				heightMin: 200,
				heightMax: 600,
				toolbarButtons : {
					'moreText': {
						'buttons': ['bold', 'italic', 'underline', 'fontSize', 'textColor', 'strikeThrough', 'inlineStyle', 'superscript', 'subscript', 'backgroundColor', 'emoticons', 'clearFormatting'],
						'buttonsVisible': 5
					},
					'moreParagraph': {
						'buttons': ['|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'lineHeight', 'quote'],
						'buttonsVisible': 4
					},
					'moreRich': {
						'buttons': ['|', image_insert_key, 'insertLink', 'insertTable', 'insertVideo', 'insertHR'],
						'buttonsVisible': 3
					},
					'moreMisc': {
						'buttons': ['|', 'undo', 'redo', 'html', 'fullscreen'],
						'buttonsVisible': 5
					}
				},
				imageEditButtons: [image_replace_key, 'imageAlign', 'imageRemove', 'imageLink', 'linkOpen', 'linkEdit', 'linkRemove', '_', 'imageDisplay', 'imageStyle', 'imageAlt', 'imageSize'],
				change_content: function(){
					SHOP_PROD_MANAGE.changeLocalizeEditor('prod_content', prod_content.data('unitcode'));
					header_ctl.change();
				},
				charCounterCount : false
			}, {
				'blur': function() {
					SHOP_PROD_MANAGE.changeLocalizeEditor('prod_content', prod_content.data('unitcode'));
					header_ctl.change();
				},
				'keyup': function(keyupEvent){
					if(FroalaEditor('#prod_content').fullscreen.isActive()){
						if(keyupEvent.key == 'Escape' || keyupEvent.key == 'Esc'){
							FroalaEditor('#prod_content').fullscreen.toggle();
						}
					}
				}
			});

			setFroala('#simple_content', {
				code : '',
				toolbarStickyOffset : 38,
				change_content: function(){
					SHOP_PROD_MANAGE.changeLocalizeEditor('simple_content', simple_content.data('unitcode'));
					header_ctl.change();
				},
				charCounterCount : false,
				toolbarButtons : {
					'moreText': {
						'buttons': ['fontSize', 'textColor', 'backgroundColor', '|', 'bold', 'italic', 'underline', 'strikeThrough', 'clearFormatting', '|', 'align', 'formatOL', 'formatUL', '|', 'insertTable', 'insertLink', 'insertHR', 'emoticons', 'html'],
						'buttonsVisible': 30
					}
				},
				imageEditButtons: ['imageAlign', 'imageRemove', 'imageLink', 'linkOpen', 'linkEdit', 'linkRemove', '_', 'imageDisplay', 'imageStyle', 'imageAlt', 'imageSize']
			}, {
				'blur': function() {
					SHOP_PROD_MANAGE.changeLocalizeEditor('simple_content', simple_content.data('unitcode'));
					header_ctl.change();
				}
			});

			setFroala('#mobile_prod_content', {
				code : '',
				image_upload_url : "/ajax/post_image_upload.cm",
				file_upload_url : "/ajax/post_file_upload.cm",
				file_list_obj : $("#mobile_file_list"),
				image_insert_key : image_insert_key2,
				image_replace_key : image_replace_key2,
				image_align : 'center',
				image_display : 'block',
				toolbarStickyOffset : 38,
				heightMin: 200,
				heightMax: 600,
				toolbarButtons : {
					'moreText': {
						'buttons': ['bold', 'italic', 'underline', 'fontSize', 'textColor', 'strikeThrough', 'inlineStyle', 'superscript', 'subscript', 'backgroundColor', 'emoticons', 'clearFormatting'],
						'buttonsVisible': 5
					},
					'moreParagraph': {
						'buttons': ['|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'lineHeight', 'quote'],
						'buttonsVisible': 4
					},
					'moreRich': {
						'buttons': ['|', image_insert_key2, 'insertLink', 'insertTable', 'insertVideo', 'insertHR'],
						'buttonsVisible': 3
					},
					'moreMisc': {
						'buttons': ['|', 'undo', 'redo', 'html', 'fullscreen'],
						'buttonsVisible': 5
					}
				},
				imageEditButtons: [image_replace_key2, 'imageAlign', 'imageRemove', 'imageLink', 'linkOpen', 'linkEdit', 'linkRemove', '_', 'imageDisplay', 'imageStyle', 'imageAlt', 'imageSize'],
				change_content: function(){
					SHOP_PROD_MANAGE.changeLocalizeEditor('mobile_prod_content', mobile_prod_content.data('unitcode'));
					header_ctl.change();
				},
				charCounterCount: false
			}, {
				'blur': function() {
					SHOP_PROD_MANAGE.changeLocalizeEditor('mobile_prod_content', mobile_prod_content.data('unitcode'));
					header_ctl.change();
				},
				'keyup': function(keyupEvent){
					if(FroalaEditor('#mobile_prod_content').fullscreen.isActive()){
						if(keyupEvent.key == 'Escape' || keyupEvent.key == 'Esc'){
							FroalaEditor('#mobile_prod_content').fullscreen.toggle();
						}
					}
				}
			});
		}else{
			prod_content.setFroala({
				code : '',
				image_upload_url : "/ajax/post_image_upload.cm",
				file_upload_url : "/ajax/post_file_upload.cm",
				file_list_obj : $("#file_list"),
				toolbarButtons : ["bold", "italic", "underline", "strikeThrough", "fontFamily", "fontSize", 'emoticons', '|', "clearFormatting", "color", "align", "formatOL", "formatUL", "insertHR", 'quote', '|', 'insertLink', image_insert_key, 'insertVideo', 'insertTable', 'html'],
				toolbarButtonsMD : ["bold", "italic", "underline", "strikeThrough", "fontFamily", "fontSize", 'emoticons', '|', "clearFormatting", "color", "align", "formatOL", "formatUL", "insertHR", 'quote', '|', 'insertLink', image_insert_key, 'insertVideo', 'insertTable', 'html'],
				toolbarButtonsSM : ["bold", "italic", "underline", "strikeThrough", "fontFamily", "fontSize", 'emoticons', '|', "clearFormatting", "color", "align", "formatOL", "formatUL", "insertHR", 'quote', '|', 'insertLink', image_insert_key, 'insertVideo', 'insertTable', 'html'],
				toolbarButtonsXS : ["bold", "italic", "underline", "strikeThrough", "fontFamily", "fontSize", 'emoticons', '|', "clearFormatting", "color", "align", "formatOL", "formatUL", "insertHR", 'quote', '|', 'insertLink', image_insert_key, 'insertVideo', 'insertTable', 'html'],
				image_insert_key : image_insert_key,
				image_align : 'center',
				image_display : 'block',
				toolbarStickyOffset : 38,
				heightMin: 200,
				heightMax: 600,
				change_content: function(){
					header_ctl.change();
				},
				charCounterCount : false,
				'emoticonsStep' : 4,
				'emoticonsSet' : [
					{code : '1f600', desc : ''},
					{code : '1f601', desc : ''},
					{code : '1f602', desc : ''},
					{code : '1f603', desc : ''},
					{code : '1f604', desc : ''},
					{code : '1f605', desc : ''},
					{code : '1f606', desc : ''},
					{code : '1f607', desc : ''},
					{code : '1f608', desc : ''},
					{code : '1f609', desc : ''},
					{code : '1f60a', desc : ''},
					{code : '1f60b', desc : ''},
					{code : '1f60c', desc : ''},
					{code : '1f60d', desc : ''},
					{code : '1f60e', desc : ''},
					{code : '1f60f', desc : ''},
					{code : '1f610', desc : ''},
					{code : '1f611', desc : ''},
					{code : '1f612', desc : ''},
					{code : '1f613', desc : ''},
					{code : '1f614', desc : ''},
					{code : '1f615', desc : ''},
					{code : '1f616', desc : ''},
					{code : '1f617', desc : ''},
					{code : '1f618', desc : ''},
					{code : '1f619', desc : ''},
					{code : '1f61a', desc : ''},
					{code : '1f61b', desc : ''},
					{code : '1f61c', desc : ''},
					{code : '1f61d', desc : ''},
					{code : '1f61e', desc : ''},
					{code : '1f61f', desc : ''},
					{code : '1f620', desc : ''},
					{code : '1f621', desc : ''},
					{code : '1f622', desc : ''},
					{code : '1f623', desc : ''},
					{code : '1f624', desc : ''},
					{code : '1f625', desc : ''},
					{code : '1f626', desc : ''},
					{code : '1f627', desc : ''},
					{code : '1f628', desc : ''},
					{code : '1f629', desc : ''},
					{code : '1f62a', desc : ''},
					{code : '1f62b', desc : ''},
					{code : '1f62c', desc : ''},
					{code : '1f62d', desc : ''},
					{code : '1f62e', desc : ''},
					{code : '1f62f', desc : ''},
					{code : '1f630', desc : ''},
					{code : '1f631', desc : ''},
					{code : '1f632', desc : ''},
					{code : '1f633', desc : ''},
					{code : '1f634', desc : ''},
					{code : '1f635', desc : ''},
					{code : '1f636', desc : ''},
					{code : '1f637', desc : ''}
				]
			});
			simple_content.setFroala({
				code : '',
				toolbarButtons : ["bold", "italic", "underline", "strikeThrough", "fontFamily", "fontSize", 'emoticons', '|', "clearFormatting", "color", "align", "formatOL", "formatUL", "insertHR", '|', 'insertLink', 'insertTable', 'html'],
				toolbarButtonsMD : ["bold", "italic", "underline", "strikeThrough", "fontFamily", "fontSize", 'emoticons', '|', "clearFormatting", "color", "align", "formatOL", "formatUL", "insertHR", '|', 'insertLink', 'insertTable', 'html'],
				toolbarButtonsSM : ["bold", "italic", "underline", "strikeThrough", "fontFamily", "fontSize", 'emoticons', '|', "clearFormatting", "color", "align", "formatOL", "formatUL", "insertHR", '|', 'insertLink', 'insertTable', 'html'],
				toolbarButtonsXS : ["bold", "italic", "underline", "strikeThrough", "fontFamily", "fontSize", 'emoticons', '|', "clearFormatting", "color", "align", "formatOL", "formatUL", "insertHR", '|', 'insertLink', 'insertTable', 'html'],
				toolbarStickyOffset : 38,
				change_content: function(){
					header_ctl.change();
				},
				charCounterCount : false,
				'emoticonsStep' : 4,
				'emoticonsSet' : [
					{code : '1f600', desc : ''},
					{code : '1f601', desc : ''},
					{code : '1f602', desc : ''},
					{code : '1f603', desc : ''},
					{code : '1f604', desc : ''},
					{code : '1f605', desc : ''},
					{code : '1f606', desc : ''},
					{code : '1f607', desc : ''},
					{code : '1f608', desc : ''},
					{code : '1f609', desc : ''},
					{code : '1f60a', desc : ''},
					{code : '1f60b', desc : ''},
					{code : '1f60c', desc : ''},
					{code : '1f60d', desc : ''},
					{code : '1f60e', desc : ''},
					{code : '1f60f', desc : ''},
					{code : '1f610', desc : ''},
					{code : '1f611', desc : ''},
					{code : '1f612', desc : ''},
					{code : '1f613', desc : ''},
					{code : '1f614', desc : ''},
					{code : '1f615', desc : ''},
					{code : '1f616', desc : ''},
					{code : '1f617', desc : ''},
					{code : '1f618', desc : ''},
					{code : '1f619', desc : ''},
					{code : '1f61a', desc : ''},
					{code : '1f61b', desc : ''},
					{code : '1f61c', desc : ''},
					{code : '1f61d', desc : ''},
					{code : '1f61e', desc : ''},
					{code : '1f61f', desc : ''},
					{code : '1f620', desc : ''},
					{code : '1f621', desc : ''},
					{code : '1f622', desc : ''},
					{code : '1f623', desc : ''},
					{code : '1f624', desc : ''},
					{code : '1f625', desc : ''},
					{code : '1f626', desc : ''},
					{code : '1f627', desc : ''},
					{code : '1f628', desc : ''},
					{code : '1f629', desc : ''},
					{code : '1f62a', desc : ''},
					{code : '1f62b', desc : ''},
					{code : '1f62c', desc : ''},
					{code : '1f62d', desc : ''},
					{code : '1f62e', desc : ''},
					{code : '1f62f', desc : ''},
					{code : '1f630', desc : ''},
					{code : '1f631', desc : ''},
					{code : '1f632', desc : ''},
					{code : '1f633', desc : ''},
					{code : '1f634', desc : ''},
					{code : '1f635', desc : ''},
					{code : '1f636', desc : ''},
					{code : '1f637', desc : ''}
				]
			});
			mobile_prod_content.setFroala({
				code : '',
				image_upload_url : "/ajax/post_image_upload.cm",
				file_upload_url : "/ajax/post_file_upload.cm",
				file_list_obj : $("#mobile_file_list"),
				toolbarButtons  : ["bold", "italic", "underline", "strikeThrough", "fontFamily", "fontSize", '|', "clearFormatting", "color", "align", "formatOL", "formatUL", "insertHR", '|', 'insertLink', image_insert_key2, 'insertVideo', 'insertTable', 'html'],
				toolbarButtonsMD: ["bold", "italic", "underline", "strikeThrough", "fontFamily", "fontSize", '|', "clearFormatting", "color", "align", "formatOL", "formatUL", "insertHR", '|', 'insertLink', image_insert_key2, 'insertVideo', 'insertTable', 'html'],
				toolbarButtonsSM: ["bold", "italic", "underline", "strikeThrough", "fontFamily", "fontSize", '|', "clearFormatting", "color", "align", "formatOL", "formatUL", "insertHR", '|', 'insertLink', image_insert_key2, 'insertVideo', 'insertTable', 'html'],
				toolbarButtonsXS: ["bold", "italic", "underline", "strikeThrough", "fontFamily", "fontSize", '|', "clearFormatting", "color", "align", "formatOL", "formatUL", "insertHR", '|', 'insertLink', image_insert_key2, 'insertVideo', 'insertTable', 'html'],
				image_insert_key : image_insert_key2,
				image_align : 'center',
				image_display : 'block',
				toolbarStickyOffset : 38,
				heightMin: 200,
				heightMax: 600,
				change_content: function(){
					header_ctl.change();
				},
				charCounterCount: false
			});

			prod_content.on('froalaEditor.blur', function () {
				SHOP_PROD_MANAGE.changeLocalizeEditor('prod_content', prod_content.data('unitcode'));
				header_ctl.change();
			});
			simple_content.on('froalaEditor.blur', function(){
				SHOP_PROD_MANAGE.changeLocalizeEditor('simple_content', simple_content.data('unitcode'));
				header_ctl.change();
			});
			mobile_prod_content.on('froalaEditor.blur', function () {
				SHOP_PROD_MANAGE.changeLocalizeEditor('mobile_prod_content', mobile_prod_content.data('unitcode'));
				header_ctl.change();
			});
		}

		// 수정 시 저장 버튼 활성화되는 부분
		$form.find('input[type=text], textarea, select').off('change').on('change',function(){
			header_ctl.change();
		});
		$form.find('input, textarea').off('keyup').on('keyup',function(){
			header_ctl.change();
		});
		$form.find('input[type=checkbox],input[type=radio]').off('click').on('click',function(){
			header_ctl.change();
		});

		var deliv_price_type_flag=true;
		$deliv_price_type.off('change').on('change', function(v){
			if (!deliv_price_type_flag) header_ctl.change();
			deliv_price_type_flag=false;
			switch ($(this).val()){
				case 'flexable':
					$deliv_price_fix_wrap.hide();
					$deliv_price_flexable_wrap.show();
					break;
				case 'fix':
					$deliv_price_fix_wrap.show();
					$deliv_price_flexable_wrap.hide();
					break;
				case 'standard':
				case 'free':
					$deliv_price_fix_wrap.hide();
					$deliv_price_flexable_wrap.hide();
					break;
			}
		}).trigger('change');

		$give_point_value.each(function(){
			if ($(this).data('value-type')=='percent')
				$(this).number(true,2);
			else
				set_money_format($(this), $(this).data('decimal-count'), $(this).data('decimal-char'), $(this).data('thousand-char'));
		});
		$prod_price.each(function(){
			set_money_format($(this), $(this).data('decimal-count'), $(this).data('decimal-char'), $(this).data('thousand-char'));
		});
		$prod_price_org.each(function(){
			set_money_format($(this), $(this).data('decimal-count'), $(this).data('decimal-char'), $(this).data('thousand-char'));
		});
		set_money_format($form.find('input._deliv_price_flexable_key'));
		set_money_format($form.find('input._deliv_price_flexable_value'));
		$form.find('._digital_item').fileupload({
			url: '/admin/ajax/shop/upload_shop_file.cm',
			formData: {temp: 'Y'},
			dataType: 'json',
			singleFileUploads: true,
			limitMultiFileUploads: 1,
			dropZone: false,
			start: function(e, data){
				// TODO site 에서는 preloader 변수가 아직 없음
				//$preloader.show();
				dozProgress.start();
			},
			progress: function(e, data){
				// Calculate the completion percentage of the upload
				var progress = parseInt(data.loaded / data.total * 100, 10);
				if(progress == 100){
					//	data.context.removeClass('working');
				}
			},
			done: function(e, data){
				$.each(data.result.shop_files, function(e, tmp){
					dozProgress.done();
					var file_list = '';
					if(tmp.error == null){
						$form.find('._no_digital_file').hide();
						$form.find('._digital_file').show();
						$form.find('._file_name').text(tmp.org_name);
						$form.find('._file_size').text(GetFileSize(tmp.size));
						$form.find('._file_tmp_idx').val(tmp.tmp_idx);
						if($form.find('._file_idx').val()){
							$form.find("._delete_file").val($form.find('._file_idx').val());
							$form.find('._file_idx').val('');
						}
					}else{
						alert(tmp.error);
					}
				});
			},
			fail: function(e, data){
				dozProgress.done();
				alert(getLocalizeString("설명_업로드에실패하였습니다", "", "업로드에 실패 하였습니다."));
			}
		});

		$form.find('._digital_file_delete').off('click').on('click',function(){
			$form.find('._digital_file').hide();
			if(idx > 0){
				if($form.find("._delete_file").val() == ''){
					$form.find("._delete_file").val($form.find('._file_idx').val());
				}
				$form.find('._file_idx').val('');
			}
			$form.find('._file_tmp_idx').val('');
		});

		$form.find('._digital_download_limit_wrap').find('input[type="text"]').each(function(){
			setNumberOnly($(this));
		});
		$form.find('._subscribe_form_wrap').find('input[type="text"]').each(function(){
			setNumberOnly($(this));
		});

		$form.find('._subscribe_form_wrap').find('input[type="text"]').on('keyup',function(){
			checkNumberLimit($(this));
		});
		$form.find('._digital_download_limit_wrap').find('input[type="text"]').on('keyup', function(){
			checkNumberLimit($(this));
		});

		$form.find('._show_prod_download_list_btn').on('click', function(){
			showDigitalProdDownloadList();
		});
		SHOP_PROD_MANAGE.delivFormMake(idx,unit_code);
		SHOP_PROD_MANAGE.discountFormMake(unit_code, 'add');
	};

	var submit = function(type){

		if(save_prod_progress_check) return false;

		save_prod_progress_check = true;

		if(FROALA_VERSION >= 300){
			if($prod_content_wrap.find('.fr-box').hasClass('fr-code-view')){
				FroalaEditor('#prod_content').codeView.toggle();
			}
			if($simple_content_wrap.find('.fr-box').hasClass('fr-code-view')){
				FroalaEditor('#simple_content').codeView.toggle();
			}
			if($mobile_prod_content_wrap.find('.fr-box').hasClass('fr-code-view')){
				FroalaEditor('#mobile_prod_content').codeView.toggle();
			}
		}else{
			if($prod_content_wrap.find('.fr-box').hasClass('fr-code-view')){
				prod_content.froalaEditor('codeView.toggle');
			}
			if($simple_content_wrap.find('.fr-box').hasClass('fr-code-view')){
				simple_content.froalaEditor('codeView.toggle');
			}
			if($mobile_prod_content_wrap.find('.fr-box').hasClass('fr-code-view')){
				mobile_prod_content.froalaEditor('codeView.toggle');
			}
		}
		var showcase_list = $('#prod_showcase').val();
		var data = $form.serializeObject();
		data.images = images;
		data.categories = prodCategories;
		data.prodinfo = prodinfoarr;
		data.showcase_list = showcase_list;
		data.deliv_list = $prod_deliv_list;
		data.prod_relative_data_list = prod_relative_data_list;
		data.is_option_changed = SHOP_OPTION_MANAGE.isOptionChanged();
		data.is_prod_price_changed = SHOP_OPTION_MANAGE.isProdPriceChanged();

		// 아직 옵션 처리가 진행중이라면
		if ( SHOP_OPTION_MANAGE.isRepainting() ) {
			alert(getLocalizeString("설명_상품옵션처리로인해저장하실수없습니다", "", "상품 옵션 관련 처리로 인해 저장하실 수 없습니다. 잠시 후 재시도해주세요."));
			save_prod_progress_check = false;
			return false;
		}

		// 옵션값 검증
		if ( SHOP_OPTION_MANAGE.checkedEmptyOptionName() ) {
			alert(getLocalizeString("설명_입력하지않은옵션명이있습니다", "", "입력하지 않은 옵션명이 있습니다."));
			save_prod_progress_check = false;
			return false;
		}

		if ( SHOP_OPTION_MANAGE.checkedEmptyOptionValue() ) {
			alert(getLocalizeString("설명_입력하지않은옵션값이있습니다", "", "입력하지 않은 옵션값이 있습니다."));
			save_prod_progress_check = false;
			return false;
		}

		// 옵션 처리 오류 체크
		if ( SHOP_OPTION_MANAGE.isOptionError() ) {
			alert(SHOP_OPTION_MANAGE.getLastOptionErrorMsg());
			save_prod_progress_check = false;
			return false;
		}

		if ( ! SHOP_PROD_MANAGE.checkSubmitCallback() ) {
			save_prod_progress_check = false;
			return false;
		}

		$option_list.find('select._option_type').removeAttr("readonly");

		$.ajax({
			type: 'POST',
			data: data,
			url: ('/admin/ajax/shop/add_prod.cm'),
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					header_ctl.save();
					history.go(-1);
				}else{
					alert(res.msg);
				}

				save_prod_progress_check = false;
				if($('._prod_relative_list_item_wrap').find('tr[data-id="prod_relative_item"]').length > 0){
					SHOP_PROD_MANAGE.initProdRelative();
				}
			}
		});
	};

	var getCategoryDropdown = function(unit_code,category){
		var drop_list = [];
		$.each(category, function(i, o){
			var down = o.has_child?'<i class="zmdi zmdi-caret-down"></i>':'';
			var depth = o.depth;
			drop_list.push({key: o.code, value:'<span class="txt depth_'+depth+'">'+down+''+ RemoveTag(o.name[unit_code])+'</span>'});
		});
		return drop_list;
	};

	var addEmptyOption = function(){
		if (edit_mode || option_detail_changed) {
			if (getRequireOptionCount()>0) {
				if (options_type == 'MIX') {
					alert(getLocalizeString("설명_옵션가격및재고초기화", "", "필수 옵션으로 추가하면 옵션 가격 및 재고가 초기화 됩니다"));
				}
			}
		}
		$.ajax({
			type: 'POST',
			data: { 'option_list' : option_list, 'option_detail_list' : option_detail_list, 'options_type' : options_type, 'cmd':'NEW_OPTION', 'prod_price': prod_price},
			url: ('/admin/ajax/shop/update_option_data.cm'),
			async: false,
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					option_list = res.option_list;
					option_detail_list = res.option_detail_list;
					$option_list.append(makeOptionHtml(res.new_code, {}, 'N', {}, {}, 'Y'));
				}else
					alert(res.msg);
			}
		});
		return true;
	};

	var addEmptyUserInputOption = function(){
		$.ajax({
			type: 'POST',
			data: { 'option_list' : option_list, 'option_detail_list' : option_detail_list, 'options_type' : options_type, 'cmd':'NEW_USER_INPUT_OPTION', 'prod_price': prod_price},
			url: ('/admin/ajax/shop/update_option_data.cm'),
			async: false,
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					option_list = res.option_list;
					option_detail_list = res.option_detail_list;
					$option_list.append(makeOptionHtml(res.new_code, {}, 'Y', {}, {}, 'N'));
				}else
					alert(res.msg);
			}
		});
	};
	var addEmptyCalculationOption = function(order_code){
		$.ajax({
			type: 'POST',
			data: {'order_code':order_code},
			url: ('/admin/ajax/shop/add_calculation_option.cm'),
			dataType: 'html',
			success: function (html) {
				$.cocoaDialog.open({type:'admin',custom_popup:html,width:550});
			}
		});
	};

	var updateOptionName = function(unit_code, code, name){
		name = $.trim(name);
		$.ajax({
			type: 'POST',
			data: { 'unit_code': unit_code, 'option_list' : option_list, 'option_detail_list' : option_detail_list, 'options_type' : options_type, 'cmd':'CHANGE_OPTION_NAME', 'code':code, 'name':name, 'prod_price': prod_price},
			url: ('/admin/ajax/shop/update_option_data.cm'),
			async: false,
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					option_list = res.option_list;
					option_detail_list = res.option_detail_list;
					if (unit_code==current_unit_code) $option_detail_require.find("._option_name_"+code).html(RemoveTag(name));
					if ( name.length > SHOP_PROD_MANAGE_CONST.NPAY_INPUT_LENGTH ) {
						$("._input_desc[data-unitcode='" + unit_code + "'][data-optcode='" + code + "']").show();
					} else {
						$("._input_desc[data-unitcode='" + unit_code + "'][data-optcode='" + code + "']").hide();
					}
					header_ctl.change();
				}else
					alert(res.msg);
			}
		});
	};

	var getOptionName = function(unit_code,option_code){
		var name='';
		$.each(option_list, function(k,v){
			if (v.code==option_code) {
				name = typeof v.name[unit_code] == "undefined" ? '' : v.name[unit_code];
				return false;
			}
		});
		return name;
	};

	/* 옵션명이 비어 있는것이 존재하는지 확인 */
	var checkEmptyOptionNameExist = function(){
		var res = false;
		$.each(unitlist, function(unit_code, unit_data){
			$.each(option_list, function(k, v){
				if (typeof v.value_list[unit_code] != "undefined"){
					var value_exist=false;
					$.each(v.value_list[unit_code], function(k2, v2){
						value_exist=true;
						return;

					});
					if (value_exist){	/* 옵션값이 있는경우에만 옵션명이 입력되어있는지 확인 */
						if(isBlank(v.name[unit_code])){
							res = true;
							return;
						}
					}
				}
			});
			if(res) return;
		});
		return res;
	};

	/* 옵션값이 비어 있는것이 존재하는지 확인 */
	var checkEmptyOptionValueExist = function(){
		var res = false;
		$.each(unitlist, function(unit_code, unit_data){
			$.each(option_list, function(k, v){
				if (v.is_user_input=='Y') return;
				if(!isBlank(v.name[unit_code])){	/* 옵션명이 비어있는 경우 옵션값이 입력되어있는지 확인 */
					var value_exist=false;
					if (typeof v.value_list[unit_code] != "undefined"){
						$.each(v.value_list[unit_code], function(k2, v2){
							if (!isBlank(v2)){
								value_exist = true;
								return;
							}
						});
					}
					if (!value_exist){
						res=true;
						return;
					}
				}
			});
			if(res) return;
		});
		return res;
	};

	var getOptionValueName = function(unit_code,option_code,value_code){
		var value_name='';
		$.each(option_list, function(k,v){
			if (v.code==option_code) {
				if (typeof v.value_list[unit_code] != "undefined"){
					$.each(v.value_list[unit_code], function(k2, v2){
						if(k2 == value_code){
							value_name = v2;
							return false;
						}
					});
				}
				return false;
			}
		});
		return value_name;
	};

	var updateOptionValue = function(unit_code, code, value){
		$.ajax({
			type: 'POST',
			data: { 'unit_code' : unit_code, 'option_list' : option_list, 'option_detail_list' : option_detail_list, 'options_type' : options_type, 'cmd':'CHANGE_OPTION_VALUE', 'code':code, 'value':value, 'prod_price': prod_price},
			url: ('/admin/ajax/shop/update_option_data.cm'),
			async: false,
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					option_list = res.option_list;
					option_detail_list = res.option_detail_list;
					updateOptionValueTextbox();
					updateOptionDetail('N');
					updateOptionDetail('Y');
					header_ctl.change();
				}else
					alert(res.msg);
			}
		});
	};

	var updateOptionValueTextbox = function(){
		var o,value_list;
		$.each(option_list, function(option_no, option_data){
			o = $('#prod_option_list_' + option_data.code);
			if (typeof option_data.value_list != "undefined"){
				$.each(option_data.value_list, function(unit_code, value_data){
					value_list = [];
					$.each(value_data, function(value_code, value){
						value_list.push(value);
					});
					o.find('input._option_value_' + unit_code).val(value_list.join(','));
				});
			}
		});
	};

	var updateUserInputMsg = function(code, msg){
		$.ajax({
			type: 'POST',
			data: { 'option_list' : option_list, 'option_detail_list' : option_detail_list, 'options_type' : options_type, 'cmd':'CHANGE_USER_INPUT_MSG', 'code':code, 'msg':msg},
			url: ('/admin/ajax/shop/update_option_data.cm'),
			async: false,
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					option_list = res.option_list;
					option_detail_list = res.option_detail_list;
					header_ctl.change();
				}else
					alert(res.msg);
			}
		});
	};

	var updateOptionRequire = function(code, is_require){
		if (edit_mode || option_detail_changed) {
			if (options_type == 'MIX') {
				var o = $('#prod_option_list_' + code);
				if ($.trim(o.find('input._option_name').val()) != '' && $.trim(o.find('input._option_value').val()) != '') {    /**옵션명과 옵션값이 입력된경우에만*/
					if (!o.hasClass('_is_user_input')) {
						if (!checkResetOption()) {
							return false;
						}
					}
				}
			}
		}
		$.ajax({
			type: 'POST',
			data: { 'option_list' : option_list, 'option_detail_list' : option_detail_list, 'options_type' : options_type, 'cmd':'CHANGE_OPTION_REQUIRE', 'code':code, 'is_require':is_require, 'prod_price': prod_price},
			url: ('/admin/ajax/shop/update_option_data.cm'),
			async: false,
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					option_list = res.option_list;
					option_detail_list = res.option_detail_list;
					updateOptionDetail('N');
					updateOptionDetail('Y');
					option_detail_changed=false;
					header_ctl.change();
				}else
					alert(res.msg);
			}
		});
		return true;
	};

	var updateOptionPrice = function(unit_code, value_code_list, price){
		if ( getUseRelativeOptionPrice(unit_code) ) {
			var mark = $('._opt_price_mark[data-unitcode="' + unit_code + '"][data-optcode="' + value_code_list + '"]').val();
			price = Math.abs(price);
			if ( mark == '-' ) price *= -1;
		}
		$.ajax({
			type: 'POST',
			data: { 'unit_code':unit_code, 'option_list' : option_list, 'option_detail_list' : option_detail_list, 'options_type' : options_type, 'cmd':'CHANGE_OPTION_PRICE', 'value_code_list':value_code_list, 'price':price, 'prod_price': prod_price},
			url: ('/admin/ajax/shop/update_option_data.cm'),
			async: false,	/* @TODO 비동기로하면 옵션일괄변경에 문제가있음, 일괄변경용 ajax 를 따로 만들 필요가 있어보임 */
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					option_detail_changed=true;
					option_list = res.option_list;
					option_detail_list = res.option_detail_list;

					var $_option_info = $("#option_price_" + unit_code + "_price_info[data-optcode='" + value_code_list + "']");
					if ( price == 0 ) {
						$_option_info.show();
					} else {
						$_option_info.hide();
					}

					header_ctl.change();
				}else
					alert(res.msg);
			}
		});
	};

	var updateOptionStock = function(value_code_list, stock){
		$.ajax({
			type: 'POST',
			data: { 'option_list' : option_list, 'option_detail_list' : option_detail_list, 'options_type' : options_type, 'cmd':'CHANGE_OPTION_STOCK', 'value_code_list':value_code_list, 'stock':stock, 'prod_price': prod_price},
			url: ('/admin/ajax/shop/update_option_data.cm'),
			async: false,	/* @TODO 비동기로하면 옵션일괄변경에 문제가있음, 일괄변경용 ajax 를 따로 만들 필요가 있어보임 */
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					option_detail_changed=true;
					option_list = res.option_list;
					option_detail_list = res.option_detail_list;
					header_ctl.change();
				}else
					alert(res.msg);
			}
		});
	};

	var updateOptionStockList = (function(){
		var _handle;
		return function() {
			clearTimeout(_handle);
			var value_code_list = [];
			var $input_stock_list = $('._option_stock');
			$input_stock_list.each(function(idx, data) {
				var $_data = $(data);
				value_code_list.push({
					valueCode : $_data.data('vcode'),
					stock : $_data.val().replace(',','') || 0
				});
			});

			$.ajax({
				type: 'POST',
				data: { 'option_list' : option_list, 'option_detail_list' : option_detail_list, 'options_type' : options_type, 'cmd':'CHANGE_OPTION_STOCK_LIST', 'value_code_list':value_code_list, 'prod_price': prod_price},
				url: ('/admin/ajax/shop/update_option_data.cm'),
				async: false,	/* @TODO 비동기로하면 옵션일괄변경에 문제가있음, 일괄변경용 ajax 를 따로 만들 필요가 있어보임 */
				dataType: 'json',
				success: function (res) {
					if(res.msg == 'SUCCESS'){
						option_detail_changed=true;
						option_list = res.option_list;
						option_detail_list = res.option_detail_list;
						header_ctl.change();
					}else
						alert(res.msg);
				}
			});

			// _handle = setTimeout(function() {
			// 	$.ajax({
			// 		type: 'POST',
			// 		data: { 'option_list' : option_list, 'option_detail_list' : option_detail_list, 'options_type' : options_type, 'cmd':'CHANGE_OPTION_STOCK_LIST', 'value_code_list':value_code_list, 'prod_price': prod_price},
			// 		url: ('/admin/ajax/shop/update_option_data.cm'),
			// 		async: false,	/* @TODO 비동기로하면 옵션일괄변경에 문제가있음, 일괄변경용 ajax 를 따로 만들 필요가 있어보임 */
			// 		dataType: 'json',
			// 		success: function (res) {
			// 			if(res.msg == 'SUCCESS'){
			// 				option_detail_changed=true;
			// 				option_list = res.option_list;
			// 				option_detail_list = res.option_detail_list;
			// 				header_ctl.change();
			// 			}else
			// 				alert(res.msg);
			// 		}
			// 	});
			// }, 250);
		};
	})();

	var updateOptionSKU = function(value_code_list, sku){
		$.ajax({
			type: 'POST',
			data: { 'option_list' : option_list, 'option_detail_list' : option_detail_list, 'options_type' : options_type, 'cmd':'CHANGE_OPTION_SKU', 'value_code_list':value_code_list, 'stock_sku':sku, 'prod_price': prod_price},
			url: ('/admin/ajax/shop/update_option_data.cm'),
			async: false,
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					option_detail_changed=true;
					option_list = res.option_list;
					option_detail_list = res.option_detail_list;
					header_ctl.change();
				}else
					alert(res.msg);
			}
		});
	};

	var updateOptionStatus = function(value_code_list, status){
		$.ajax({
			type: 'POST',
			data: { 'option_list' : option_list, 'option_detail_list' : option_detail_list, 'options_type' : options_type, 'cmd':'CHANGE_OPTION_STATUS', 'value_code_list':value_code_list, 'status':status, 'prod_price': prod_price},
			url: ('/admin/ajax/shop/update_option_data.cm'),
			dataType: 'json',
			async: false,	/* @TODO 비동기로하면 옵션일괄변경에 문제가있음, 일괄변경용 ajax 를 따로 만들 필요가 있어보임 */
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					option_detail_changed=true;
					option_list = res.option_list;
					option_detail_list = res.option_detail_list;
					header_ctl.change();
				}else
					alert(res.msg);
			}
		});
	};

	var updateOptionsType = function(type,reload, check_confirm){
		if (reload){
			if (edit_mode || option_detail_changed) {
				if (getRequireOptionCount() > 1) {
					if(check_confirm){
						if (!checkResetOption()) {
							return false;
						}
					}
				}
			}
			$.ajax({
				type: 'POST',
				data: { 'option_list' : option_list, 'option_detail_list' : option_detail_list, 'options_type' : type, 'cmd':'CHANGE_OPTION_TYPE', 'prod_price': prod_price},
				url: ('/admin/ajax/shop/update_option_data.cm'),
				async: false,
				dataType: 'json',
				success: function (res) {
					if(res.msg == 'SUCCESS'){
						options_type = type;
						option_list = res.option_list;
						option_detail_list = res.option_detail_list;
						updateOptionDetail('Y');
						option_detail_changed=false;
						header_ctl.change();
					}else
						alert(res.msg);
				}
			});
		}else{
			options_type = type;
		}
		return true;
	};

	var updateProdPrice = function(unit_code,price){
		prod_price[unit_code] = price;
		SHOP_OPTION_MANAGE.setProdPriceChanged(true);
	};

	var updateStockUse = function(is_use,reload){
		stock_use = is_use;
		if (reload){
			$('#stock_unlimit_wrap').toggle(is_use);
			updateOptionDetail('N');
			updateOptionDetail('Y');
		}
	};

	var checkResetOption = function(){
		return confirm(getLocalizeString("설명_옵션가격및재고가초기화됩니다", "", "옵션 가격 및 재고가 초기화 됩니다 그래도 진행하시겠습니까"));
	};

	/* is_user_input,is_require Y/N */
	var makeOptionHtml = function(code, name, is_user_input, user_input_msg, value_list, is_require) {
		if (is_user_input=='Y')
			var html = '<div class="form-group _is_user_input" id="prod_option_list_' + code + '">';
		else
			var html = '<div class="form-group" id="prod_option_list_' + code + '">';
		html += '<div class="row">';
		if (is_user_input=='Y'){
			html += '<div class="col-md-12 m-margin-bottom-xl">';
			html += '<label class="control-label">' + getLocalizeString("설명_사용자입력옵션명", "", "사용자 입력 옵션명") + '</label>';
		}else{
			html += '<div class="col-md-3 m-margin-bottom-xl">';
			html += '<label class="control-label">' + getLocalizeString("설명_옵션명", "", "옵션명") + '</label>';
		}
		$.each(unitlist, function(unit_code, unit_data){
			var name2 = (typeof name[unit_code]!='undefined') ? RemoveTag(name[unit_code]) : '';
			html += '<div class="prod-title-holder">';
			if (unitcount>1) html += '<img src="/common/img/flag_shapes/flag_' + unit_data.lang_code.toLowerCase() + '_circle.png" width="26">';
			html += '<input type="text" style=" width:79%;" class="form-control _option_name" value="' + name2 + '" onchange="SHOP_PROD_MANAGE.updateOptionName(\'' + unit_code + '\',\'' + code + '\', $(this).val())">';
			if (is_user_input=='Y'){
				html += '<p data-unitcode="' + unit_code + '" data-optcode="' + code + '" class="_input_desc text-12 text-danger" style="' + ( name2.length <= SHOP_PROD_MANAGE_CONST.NPAY_INPUT_LENGTH ? 'display: none;' : '' ) + '">' + getLocalizeString("설명_n자가초과되었습니다초과시네이버페이구매가불가합니다", SHOP_PROD_MANAGE_CONST.NPAY_INPUT_LENGTH, "%1자가 초과되었습니다. 초과시 네이버페이 구매가 불가합니다.") + '</p>';
			}
			html += '</div>';
		});
		html += '</div>';

		html += '<div class="col-md-6 m-margin-bottom-xl">';
		if (is_user_input=='Y') {
			/*
			 html += '<label class="control-label">직접입력 추가 설명</label>';
			 html += '<input type="text" class="form-control" value="' + RemoveTag(user_input_msg) + '" placeholder="예) 주소를 적어주세요" onchange="SHOP_PROD_MANAGE.updateUserInputMsg(\'' + code + '\', $(this).val())">';
			 */
		} else {
			html += '<label class="control-label">' + getLocalizeString("설명_옵션값", "", "옵션값") + '</label>';
			$.each(unitlist, function(unit_code, unit_data){
				var value_list2 = (typeof value_list[unit_code]!='undefined') ? RemoveTag(value_list[unit_code]) : '';
				html += '<div class="prod-title-holder"><input type="text" style="width: 100%;" class="form-control _option_value _option_value_' + unit_code + '" value="' + value_list2 + '" placeholder="' + getLocalizeString("설명_콤마옵션값구분입력", "", "콤마로 옵션값을 구분하여 입력") + '" onchange="SHOP_PROD_MANAGE.updateOptionValue(\'' + unit_code + '\',\'' + code + '\', $(this).val())"></div>';
			});
		}
		html += '</div>';

		if (is_user_input=='N'){
			html += '<div class="col-md-3">';
			html += '<div class="checkbox checkbox-styled list-array">';
			html += '<label>';
			html += "<input type='checkbox' class='_is_require' onclick=\"return SHOP_PROD_MANAGE.updateOptionRequire('" + code + "',$(this).prop('checked')?'Y':'N');\" " + (is_require=='Y' ? 'checked' : '') + " />";
			html += '<span>' + getLocalizeString("설명_필수", "", "필수") + '</span>';
			html += '</label>';
			html += '</div>';
			html += '</div>';
		}
		html += '<a href="javascript:;" style="position: absolute; top: 25px; right: 0;" onclick="return SHOP_PROD_MANAGE.removeOptionData(\'' + code + '\')"><i class="btl bt-times"></i></a>';
		html += '</div>';
		html += '</div>';
		return html;
	};

	/* is_require Y/N */
	var makeOptionDetailHtml = function(is_require){
		var i=0,i2=0;
		var option_list2 = [];
		for (i=0; i<option_list.length; i++){
			var default_name = (typeof option_list[i].name[current_unit_code]) !="undefined" ? option_list[i].name[current_unit_code] : '';
			if (option_list[i].is_require==is_require && default_name !='' && option_list[i].is_user_input=='N'){
				option_list2.push(option_list[i]);
			}
		}
		if (option_list2.length==0) return '';

		var html = '<table class="table no-margin require_wrap">';
		html += '<colgroup>';
		html += '<col width="50">';
		html += '</col>';
		html += '<col width="200">';
		/**check*/
		if (options_type=='MIX' && is_require=='Y') {	/** 조합형, 필수옵션 */
			for (i = 0; i < option_list2.length; i++) {
				html += '<col width="200">';
				/**옵션명*/
			}
		}else{	/** 단독형 */
		html += '<col width="200">';
			/**옵션명*/
			html += '<col width="200">';
			/**옵션값*/
		}
		html += '<col width="150">';
		/**옵션가격*/
		if (stock_use) {
			html += '<col width="120">';
			/**재고*/
			if(edit_mode) html += '<col width="120">';
			/**재고추가*/
			html += '<col width="99">';
			/**SKU*/
		}
		html += '<col width="1">';
		/**상태*/
		html += '</colgroup>';

		html += '<thead class="edit_subject">';
		html += '<tr>';
		html += '<th>';
		html += '<div class="checkbox checkbox-styled no-margin">';
		html += '<label>';
		html += "<input type='checkbox' class='_allCheck' onclick=\"SHOP_PROD_MANAGE.optionSetAllSelect($(this).prop('checked'),'" + is_require + "')\">";
		html += '<span></span>';
		html += '</label>';
		html += '</div>';
		html += '</th>';

		/** 옵션명 **/
		if (options_type=='MIX' && is_require=='Y') { /** 조합형, 필수옵션 */
			for (i = 0; i < option_list2.length; i++) {
				var default_name = isBlank(option_list2[i].name[current_unit_code]) ? '' : RemoveTag(option_list2[i].name[current_unit_code]);
				html += '<th class="_option_name_' + option_list2[i].code + '">' + default_name + '</th>';
			}
		}else{	/** 단독형*/
		html += '<th>' + getLocalizeString("설명_옵션명", "", "옵션명") + '</th>';
			html += '<th>' + getLocalizeString("설명_옵션값", "", "옵션값") + '</th>';
		}

		html += '<th class="op-pay" style="color: #bdbdbd">';
		html += '<span class="_select_currencty_char"></span>';
		$.each(unitlist, function(unit_code, unit_data){
			html += '<input type="text" data-decimal-count="' + unit_data.decimal_count + '" data-decimal-char="' + unit_data.decimal_char + '" data-thousand-char="' + unit_data.thousand_char + '" class="form-control ' + unit_code + '_option_price_multi _number" placeholder="' + unit_data.currency_code +'">';
		});
		html +=	'</th>';
		if (stock_use)
			html += '<th class="op-stock" style="color: #bdbdbd"><input type="text" class="form-control _number2 _option_stock_multi" placeholder="' + getLocalizeString("설명_재고추가", "", "재고추가") + '"></th>';
		html += '<th class="op-sell ">';
		html += '<select class="form-control _option_status_multi">';
		html += '<option value="">' + getLocalizeString("설명_상태변경안함", "", "상태변경안함") + '</option>';
		html += '<option value="SALE">' + getLocalizeString("설명_판매중", "", "판매중") + '</option>';
		html += '<option value="SOLDOUT">' + getLocalizeString("설명_품절처리", "", "품절처리") + '</option>';
		html += '<option value="HIDDEN">' + getLocalizeString("설명_숨김", "", "숨김") + '</option>';
		html += '</select>';
		html += '</th>';
		html += "<th colspan='1'><a class='btn btn-primary' href='javascript:;' onclick=\"SHOP_PROD_MANAGE.optionSetValue('" + is_require + "')\">" + getLocalizeString("버튼_일괄수정", "", "일괄수정") + "</a></th>";
		html += '</tr>';
		html += '</thead>';

		html += '<thead class="subject ">';
		html += '<tr> ';
		html += '<th>';
		html += '<div class="checkbox checkbox-styled no-margin">';
		html += '<label>';
		html += "<input type='checkbox' class='_allCheck' onclick=\"SHOP_PROD_MANAGE.optionSetAllSelect($(this).prop('checked'),'" + is_require + "')\">";
		html += '<span></span>';
		html += '</label>';
		html += '</div>';
		html += '</th>';

		if (options_type=='MIX' && is_require=='Y') {    /** 조합형, 필수옵션 */
			for (i = 0; i < option_list2.length; i++) {
				html += '<th class="_option_name_' + option_list2[i].code + '">';
				html += isBlank(option_list2[i].name[current_unit_code]) ? '' : RemoveTag(option_list2[i].name[current_unit_code]);
				html += '</th>';
			}
		}else{	/** 단독형 또는 선택옵션 */
		html += '<th>' + getLocalizeString("설명_옵션명", "", "옵션명") + '</th>';
			html += '<th>' + getLocalizeString("설명_옵션값", "", "옵션값") + '</th>';
		}
		html += '<th>' + getLocalizeString("설명_옵션가격", "", "옵션가격") + ' <a href="javascript:;" class="btn-popover" role="button" tabindex="0" data-trigger="focus" data-toggle="popover" title="' + getLocalizeString("설명_옵션가격", "", "옵션가격") + '" data-content="' + getLocalizeString("모달_옵션가격설명", "", "<p><strong><a class='text-primary' taget='_blank' href='/admin/shopping/config'>쇼핑 환경설정</a>에서 상대적인 가격으로 옵션 표시 및 관리 사용 안함인 경우</strong></p> <p>선택한 필수옵션 가격 = 구매 가격</p><p><strong>본상품 가격에 추가되는 금액이 아닙니다.</strong></p><p>예: 본상품이 1000원이고 필수옵션 가격이 2000원이면 구매자는 2000원을 지불해야 합니다.</p><p><strong><a class='text-primary' taget='_blank' href='/admin/shopping/config'>쇼핑 환경설정</a>에서 상대적인 가격으로 옵션 표시 및 관리 사용함인 경우</strong></p><p>본 상품 가격 + 선택한 필수옵션 가격 = 구매 가격</p><p>예: 본상품이 1000원이고 필수옵션이 +2000원이면 구매자는 3000원을 지불해야 합니다.</p><p><strong>선택옵션의 경우</strong></p><p>선택옵션인 경우 상대적인 가격으로 옵션 표시 사용 여부에 관계 없이 입력하신 금액 그대로 처리됩니다.</p><p>예: 본상품이 1000원이고 선택옵션 가격이 2000원이고 선택옵션을 선택했다면 구매자는 3000원을 지불해야 합니다.</p><p>선택 옵션가격이 0원인 경우 네이버페이 주문시 수량이 1로만 처리됩니다.</p>") + '"><i class="btm bt-question-circle"></i></a></th>';
		if (stock_use) {
			html += '<th>' + getLocalizeString("설명_재고", "", "재고") + '</th>';
			if (edit_mode) html += '<th>' + getLocalizeString("설명_재고추가", "", "재고추가") + ' <a href="javascript:;" class="btn-popover" role="button" tabindex="0" data-trigger="focus" data-toggle="popover" title="' + getLocalizeString("설명_재고추가", "", "재고추가") + '" data-content="' + getLocalizeString("설명_입력수량만큼재고추가", "", "현재 재고에서 입력한 수량만큼 재고가 추가됩니다. 재고를 차감할 경우 마이너스(-) 기호를 앞에 삽입해 주세요. (예: -50)") + '"><i class="btm bt-question-circle"></i></a></th>';
			html += '<th>' + getLocalizeString("설명_재고번호SKU", "", "재고번호(SKU)") + ' <a href="javascript:;" class="btn-popover" role="button" tabindex="0" data-trigger="focus" data-toggle="popover" title="' + getLocalizeString("설명_옵션재고번호", "", "옵션 재고번호") + '" data-content="' + getLocalizeString("설명_옵션재고번호설명", "", "옵션 재고번호 입력 시, 상품의 각 옵션을 보다 명확하게 분류할 수 있습니다. FASSTO 신청 회원의 경우 한글 입력 시 주문 수집이 불가할 수 있으며, 영문 혹은 숫자로 필수 등록해 주셔야 합니다.") + '"><i class="btm bt-question-circle"></i></a></th>';
		}
		html += '<th>' + getLocalizeString("설명_상태", "", "상태") + '</th>';
		html += '<th></th>';
		html += '</tr>';
		html += '</thead>';
		html += '<tbody>';
		for (i=0; i<option_detail_list.length; i++){
			if (option_detail_list[i].is_require != is_require) continue;
			if (is_require=='Y')
				html += "<tr id='option_detail_require_list_" + i + "'>";
			else
				html += "<tr id='option_detail_optional_list_" + i + "'>";
			html += "<th class=\"no-border-top\"><div class\"checkbox checkbox-styled no-margin\"><label> <input type=\"checkbox\" class=\"_check\" onclick=\"SHOP_PROD_MANAGE.optionSetSelect(" + i + ",'" + is_require +  "')\" value=\"" + i + "\"><span></span> </label> </div> </th>";
			if (options_type == 'MIX' && is_require=='Y') {    /** 조합형, 필수옵션 */
				for (i2 = 0; i2 < option_detail_list[i].value_code_list.length; i2++) {
					html += '<th class="no-border-top" style="max-width: 600px; word-break: break-all; word-wrap: break-word;">';
					$.each(unitlist, function(unit_code, unit_data){
						html += RemoveTag(getOptionValueName(unit_code, option_detail_list[i].option_code_list[i2], option_detail_list[i].value_code_list[i2])) + '<br/>';
					});
					html += '</th>';
				}
			} else {
				/** 선택형, 선택옵션 */
				html += '<th class="no-border-top" >';
				$.each(unitlist, function(unit_code, unit_data){
					html += RemoveTag(getOptionName(unit_code, option_detail_list[i].option_code_list[0]))+'<br/>';
				});
				html += '</th>';
				html += '<th class="no-border-top" style="max-width: 600px; word-break: break-all; word-wrap: break-word; ">';
				$.each(unitlist, function(unit_code, unit_data){
					html += RemoveTag(getOptionValueName(unit_code, option_detail_list[i].option_code_list[0], option_detail_list[i].value_code_list[0])) + '<br/>';
				});
				html += '</th>';
			}

			html += '<th class="no-border-top">';
			$.each(unitlist, function(unit_code, unit_data){
				var opt_price = option_detail_list[i].price[unit_code];
				var opt_code = option_detail_list[i].value_code_list.join(',');

				if ( getUseRelativeOptionPrice(unit_code) && option_detail_list[i].is_require == 'Y' ) {
					html += '<div style="max-width: 190px;">';
					html += '<div style="display: inline-block; width: 40px; margin-right: 5px !important;" class="no-margin">';
					html += '<select data-unitcode="' + unit_code + '" data-optcode="' + opt_code + '" onchange="SHOP_PROD_MANAGE.changeOptionPriceMark(\'' + unit_code + '\', \'' + opt_code+ '\')" class="form-control _opt_price_mark">';
					html += '<option value="+" ' + ( opt_price >= 0 ? 'selected' : '' ) + '>+</option>';
					html += '<option value="-" ' + ( opt_price < 0 ? 'selected' : '' ) + '>-</option>';
					html += '</select>';
					html += '</div>';

					opt_price = Math.abs(option_detail_list[i].price[unit_code]);
					html += '<div style="width: calc(100% - 45px); max-width: 190px;" class="input-krw no-margin">';
				} else {
					html += '<div>';
					html += '<div class="input-krw no-margin">';
				}

				html += '<span class="control-krw">' + unit_data.currency_char + '</span>';
				html += '<input id="option_price_' + unit_code + '" type="text" data-decimal-count="' + unit_data.decimal_count + '" data-decimal-char="' + unit_data.decimal_char + '" data-thousand-char="' + unit_data.thousand_char + '" data-unitcode="' + unit_code + '" data-optcode="' + opt_code + '" class="form-control _option_price _number" onkeydown="if(event.keyCode==13) $(this).trigger(\'blur\')" onblur="SHOP_PROD_MANAGE.updateOptionPrice(\'' + unit_code + '\',\'' + escape_javascript(opt_code) + '\',$(this).val().replace(\'' + unit_data.thousand_char + '\',\'\'))" value="' + opt_price + '" style="text-align: left;">';
				html += '</div>';
				if ( option_detail_list[i].is_require == 'N' ) {
					html += '<p id="option_price_' + unit_code + '_price_info" data-optcode="' + opt_code + '" class="text-12 text-danger" style="' + (opt_price == 0 ? '' : 'display: none;') + '">' + getLocalizeString("설명_선택옵션이0원인경우최대구매수량이제한됩니다", "", "선택옵션이 0원인 경우 최대 구매수량이 제한됩니다.<br/>우측 하단 기타 설정 항목을 참고하세요.") + '</p>';
				}
				html += '</div>';
			});
			html += '</th>';

			if (stock_use) {
				if (edit_mode) {
					/**현재재고량*/
					html += '<th class="no-border-top">';
					html += '<input type="text" class="form-control _number2" value="' + option_detail_list[i].stock + '" readonly />';
					html += '</th>';
				}

				/** 재고입력 */
				html += '<th class="no-border-top">';
				html += '<input type="text" data-vcode="' + option_detail_list[i].value_code_list.join(',') + '" class="form-control _option_stock _number2" onkeydown="if(event.keyCode==13) $(this).trigger(\'blur\')" onblur="SHOP_PROD_MANAGE.updateOptionStockList()" value="' + (option_detail_list[i].stock_change == 0 ? '' : option_detail_list[i].stock_change) + '" />';
				html += '</th>';

				/** SKU입력 */
				html += '<th class="no-border-top">';
				html += '<input type="text" class="form-control" onkeydown="if(event.keyCode==13) $(this).trigger(\'blur\')" onblur="SHOP_PROD_MANAGE.updateOptionSKU(\'' + option_detail_list[i].value_code_list.join(',') + '\',$(this).val())" value="' + RemoveTag(option_detail_list[i].stock_sku) + '" />';
				html += '</th>';
			}

			/** 옵션 상태 */
			html += '<th class="no-border-top">';
			html += '<select class="form-control _option_status" onchange="SHOP_PROD_MANAGE.updateOptionStatus(\'' + option_detail_list[i].value_code_list.join(',') + '\',$(this).val())"> ';
			if (option_detail_list[i].status == 'SALE') {
				html += '<option value="SALE" selected>' + getLocalizeString("설명_판매중", "", "판매중") + '</option>';
			} else {
				html += '<option value="SALE">' + getLocalizeString("설명_판매중", "", "판매중") + '</option>';
			}
			if (option_detail_list[i].status == 'SOLDOUT') {
				html += '<option value="SOLDOUT" selected>' + getLocalizeString("설명_품절처리", "", "품절처리") + '</option>';
			} else {
				html += '<option value="SOLDOUT">' + getLocalizeString("설명_품절처리", "", "품절처리") + '</option>';
			}
			if (option_detail_list[i].status == 'HIDDEN') {
				html += '<option value="HIDDEN" selected>' + getLocalizeString("설명_숨김", "", "숨김") + '</option>';
			} else {
				html += '<option value="HIDDEN">' + getLocalizeString("설명_숨김", "", "숨김") + '</option>';
			}
			html += '</select>';
			html += '</th>';
			html += '<th class="no-border-top"></th>';
			html += '</tr>';
		}
		html += '</tbody>';
		html += '</table>';
		return html;
	};

	var loadOptionData = function(prod_code){
		$.ajax({
			type: 'POST',
			data: { 'prod_code': prod_code},
			async: false,
			url: ('/admin/ajax/shop/load_option_data.cm'),
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					option_list = res.option_list;
					option_detail_list = res.option_detail_list;
					use_relative_option_price = res.use_relative_list;

					var html = '';
					if (option_list.length>0){
						SHOP_PROD_MANAGE.showOptionWrap();
					}else{
						/*
						SHOP_PROD_MANAGE.addEmptyOption();
						*/
					}
					$.each(option_list, function(no,data){
						var value_list = {};
						$.each(data.value_list, function(unit_code, value_list2){
							var value_list3 = [];
							$.each(value_list2, function(no,data){
								value_list3.push(data);
							});
							value_list[unit_code] = value_list3.join(',');
						});
						html += makeOptionHtml(data.code, data.name, data.is_user_input, data.user_input_msg, value_list, data.is_require);
					});
					$option_list.html(html);
					updateOptionDetail('N');
					updateOptionDetail('Y');
				}else
					alert(res.msg);
			}
		});
	};

	/* is_require Y/N */
	var updateOptionDetail = function(is_require){
		if (is_require=='Y'){
			if (getRequireOptionCount()==0) {
				$option_detail_require.empty();
				$option_detail_require_wrap.hide();
			}else{
				$option_detail_require_wrap.show();
				$option_detail_require.html(makeOptionDetailHtml('Y'));
				$option_detail_require.find("input._number").each(function(){
					set_money_format($(this), $(this).data('decimal-count'), $(this).data('decimal-char'), $(this).data('thousand-char'));
				});
				$option_detail_require.find("input._number2").number(true);
				$option_detail_require.find('.btn-popover').popover({
					container: 'body',
					html : true
				});
				optionSetAllSelect(false,'Y');
			}
		}else{
			if (getOptionalOptionCount()==0) {
				$option_detail_optional.empty();
				$option_detail_optional_wrap.hide();
			}else{
				$option_detail_optional_wrap.show();
				$option_detail_optional.html(makeOptionDetailHtml('N'));
				$option_detail_optional.find("input._number").each(function(){
					set_money_format($(this), $(this).data('decimal-count'), $(this).data('decimal-char'), $(this).data('thousand-char'));
				});
				$option_detail_require.find("input._number2").number(true);
				$option_detail_optional.find('.btn-popover').popover({
					container: 'body',
					html : true
				});
				optionSetAllSelect(false,'N');
			}
		}
		$('#stock_no_option_wrap').toggle(getRequireOptionCount()==0 && stock_use);
	};

	var removeOptionData = function(code){
		if (edit_mode || option_detail_changed) {
			if (options_type == 'MIX') {
				var o = $('#prod_option_list_' + code);
				if ($.trim(o.find('input._option_name').val()) != '' && $.trim(o.find('input._option_value').val()) != '') {	/**옵션명과 옵션값이 입력된경우에만*/
					if (!o.hasClass('_is_user_input')) { /**사용자입력옵션이 아닌경우만*/
						if (o.find('input._is_require').prop('checked')) {    /**필수옵션인경우에만경고*/
							if (!checkResetOption()) {
								return false;
							}
						}
					}
				}
			}
		}
		$.ajax({
			type: 'POST',
			data: { 'option_list' : option_list, 'option_detail_list' : option_detail_list, 'options_type' : options_type, 'cmd':'REMOVE_OPTION', 'code': code, 'prod_price':prod_price},
			url: ('/admin/ajax/shop/update_option_data.cm'),
			dataType: 'json',
			async: false,
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					option_list = res.option_list;
					option_detail_list = res.option_detail_list;
					$('#prod_option_list_' + code).remove();
					updateOptionDetail('N');
					updateOptionDetail('Y');
					option_detail_changed=false;
					header_ctl.change();
				}else
					alert(res.msg);
			}
		});
	};

	var getRequireOptionCount = function(){
		var cnt=0;
		$.each(option_list, function(no,data){
			if (data.is_user_input=='N'){
				if (typeof data.name[default_unit_code] != "undefined"){
					if(data.name[default_unit_code] != ''){
						if(data.is_require=='Y') cnt++;
					}
				}
			}
		});
		return cnt;
	};

	var getOptionalOptionCount = function(){
		var cnt=0;
		$.each(option_list, function(no,data){
			if (data.is_user_input=='N' && data.name[default_unit_code]!='') {
				if (data.is_require=='N') cnt++;
			}
		});
		return cnt;
	};

	var toggleOptionWrap = function(){
		if(!regularly_option_edit){
			alert(getLocalizeString("설명_정기구독신청내역이있는경우옵션수정이불가능합니다", "", "정기구독 신청 내역이 있는 경우 옵션 가격/재고번호/상태를 제외한 옵션 수정 및 추가, 삭제는 불가합니다.") );
			return false;
		}
		if ($option_open_button.attr('data-isopen')=='Y'){
			hideOptionWrap();
		}else{
			showOptionWrap();
		}
	};

	var openOtherProdOptionImportModal = function(){
		if(!regularly_option_edit){
			alert(getLocalizeString("설명_정기구독신청내역이있는경우옵션수정이불가능합니다", "", "정기구독 신청 내역이 있는 경우 옵션 가격/재고번호/상태를 제외한 옵션 수정 및 추가, 삭제는 불가합니다.") );
			return false;
		}
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/shop/open_other_prod_option_import.cm'),
			dataType: 'json',
			success: function(res){
				if(res.msg == 'SUCCESS'){
					$.cocoaDialog.open({type : 'admin_other_prod_option_import', custom_popup : res.html});
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var openNaverCategoryList = function(){
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/shop/open_naver_category_list.cm'),
			dataType: 'json',
			success: function(res){
				if(res.msg == 'SUCCESS'){
					$.cocoaDialog.open({type : 'openNaverCategoryList', custom_popup : res.html});
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var searchProd = function(keyword, current_paging_no){
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/shop/get_product_list.cm'),
			data: {'keyword': keyword, 'current_paging_no': current_paging_no},
			dataType: 'json',
			success: function(res){
				if(res.msg == 'SUCCESS'){
					var $modal_admin_other_prod_option_import = $('.modal_admin_other_prod_option_import');
					$modal_admin_other_prod_option_import.find('#product_search_list').html(res.html);
					$modal_admin_other_prod_option_import.find('#prod_list_paging').html(res.html_paging);
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var searchNaverCategory = function(keyword, current_paging_no, callback){
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/shop/get_naver_category_list.cm'),
			data: {'keyword': keyword, 'current_paging_no': current_paging_no},
			dataType: 'json',
			success: function(res){
				if(res.msg == 'SUCCESS'){
					$('#naver_category_list').html(res.html);
					$('#naver_category_paging').html(res.html_paging);
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var getOtherProdOption = function(prod_code){
		if(confirm(getLocalizeString("설명_상품옵션불러오면기존옵션값삭제", "", "상품 옵션을 불러오게 되면 기존에 입력된 옵션값은 삭제됩니다.\n계속 진행하시겠습니까?"))){
			copyOptionData(prod_code);
			$.cocoaDialog.close();
			header_ctl.change();
		}
	};

	var selectNaverCategoryId = function(category_id){
		$("#inputNaverCategory").val(category_id);
		$.cocoaDialog.close();
	};

	var copyOptionData = function(prod_code){
		$.ajax({
			type: 'POST',
			data: { 'prod_code': prod_code},
			async: false,
			url: ('/admin/ajax/shop/copy_option_data.cm'),
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					option_list = res.option_list;
					option_detail_list = res.option_detail_list;
					var html = '';
					if (option_list.length>0){
						SHOP_PROD_MANAGE.showOptionWrap();
					}else{
						/*
						SHOP_PROD_MANAGE.addEmptyOption();
						*/
					}
					$.each(option_list, function(no,data){
						var value_list = {};
						$.each(data.value_list, function(unit_code, value_list2){
							var value_list3 = [];
							$.each(value_list2, function(no,data){
								value_list3.push(data);
							});
							value_list[unit_code] = value_list3.join(',');
						});
						html += makeOptionHtml(data.code, data.name, data.is_user_input, data.user_input_msg, value_list, data.is_require);
					});

					if(options_type != res.option_mix_type){		// 기존 옵션과 불러온 옵션의 조합 방식이 다를 경우
						$('#options_mix').prop("checked", res.option_mix_type == 'MIX' ? true : false);
					}

					$option_list.html(html);
					updateOptionDetail('N');
					updateOptionDetail('Y');
					updateOptionsType(res.option_mix_type, true, false);
				}else
					alert(res.msg);
			}
		});
	};

	var showOptionWrap = function(){
		$option_open_button.attr('data-isopen','Y');
		$option_open_button.text(getLocalizeString("버튼_옵션닫기", "", "옵션 닫기"));
		$option_wrap.show();
	};

	var hideOptionWrap = function(){
		$option_open_button.attr('data-isopen','N');
		$option_open_button.text(getLocalizeString("버튼_옵션열기", "", "옵션 열기"));
		$option_wrap.hide();
	};

	/* is_require Y/N */
	var optionFindSelected = function(no, is_require) {
		var i = 0;
		if (is_require=='Y'){
			for (i = 0; i < option_detail_require_selected.length; i++) {
				if (option_detail_require_selected[i] == no) return i;
			}
		}else {
			for (i = 0; i < option_detail_optional_selected.length; i++) {
				if (option_detail_optional_selected[i] == no) return i;
			}
		}
		return -1;
	};

	/* is_require Y/N */
	var optionSetSelect = function(no, is_require){
		if (is_require=='Y')
			var o = $('#option_detail_require_list_'+no);
		else
			var o = $('#option_detail_optional_list_'+no);
		var n = optionFindSelected(no, is_require);
		if (n==-1){
			if (is_require=='Y') {
				option_detail_require_selected.push(no);
				$option_detail_require_wrap.addClass('check');
			}else {
				option_detail_optional_selected.push(no);
				$option_detail_optional_wrap.addClass('check');
			}
		}else{
			if (is_require=='Y') {
				option_detail_require_selected.splice(n, 1);
				if (option_detail_require_selected.length == 0)
					$option_detail_require_wrap.removeClass('check');
			}else{
				option_detail_optional_selected.splice(n, 1);
				if (option_detail_optional_selected.length == 0)
					$option_detail_optional_wrap.removeClass('check');
			}
		}
	};

	/* is_require Y/N */
	var optionSetAllSelect = function(chk, is_require){
		if (is_require=='Y'){
			var o = $option_detail_require_wrap;
			option_detail_require_selected = [];
		}else{
			var o = $option_detail_optional_wrap;
			option_detail_optional_selected = [];
		}
		o.find('input._allCheck').prop('checked', chk);
		o.find('input._check').each(function(no){
			var opt_no = $(this).val();
			$(this).prop('checked',chk);
			if (chk){
				if (optionFindSelected(opt_no, is_require)==-1) {
					if (is_require=='Y')
						option_detail_require_selected.push(opt_no);
					else
						option_detail_optional_selected.push(opt_no);
				}
			}else{
				var n = optionFindSelected(opt_no, is_require);
				if (n>=0) {
					if (is_require=='Y')
						option_detail_require_selected.splice(n,1);
					else
						option_detail_optional_selected.splice(n,1);
				}
				$(this).removeClass('on');
			}
		});
		if (chk)
			o.addClass('check');
		else
			o.removeClass('check');
	};

	/* is_require Y/N */
	var optionSetValue = function(is_require) {
		if (is_require=='Y') {
			var sel_list = option_detail_require_selected;
			var price = $option_detail_require_wrap.find('input._option_price_multi').val();
			var status = $option_detail_require_wrap.find('select._option_status_multi').val();
			if (stock_use) {
				var stock = $option_detail_require_wrap.find('input._option_stock_multi').val();
			}
		}else {
			var sel_list = option_detail_optional_selected;
			var price = $option_detail_optional_wrap.find('input._option_price_multi').val();
			var status = $option_detail_optional_wrap.find('select._option_status_multi').val();
			if (stock_use) {
				var stock = $option_detail_optional_wrap.find('input._option_stock_multi').val();
			}
		}
		for (var i=0; i<sel_list.length; i++){
			if (is_require=='Y')
				var o = $('#option_detail_require_list_' + sel_list[i]);
			else
				var o = $('#option_detail_optional_list_' + sel_list[i]);
			$.each(unitlist, function(unit_code, unit_data){
				if (is_require=='Y') {
					var price = $option_detail_require_wrap.find('input.' + unit_code + '_option_price_multi').val();
				}else{
					var price = $option_detail_optional_wrap.find('input.' + unit_code + '_option_price_multi').val();
				}
				price = price.replace(LOCALIZE.getCurrencyThousandChar(),'');
				if(price != ''){
					o.find('input#option_price_'+unit_code).data('unitcode',unit_code).val(price).trigger('blur');
				}
			});
			if (stock_use) {
				if (stock != '') {
					stock = stock.replace(',','');
					// o.find('input._option_stock').val(stock).trigger('blur');
					o.find('input._option_stock').val(stock);
				}
			}
			if (status != ''){
				o.find('select._option_status').val(status).trigger('change');
			}
		}
		if (stock_use){
			updateOptionStockList();
		}
	};

	var showMultiProdAdd = function(){
		$.cocoaDialog.close();
		$.ajax({
			type: 'POST',
			data: {},
			url: ('/admin/ajax/shop/open_prod_batch.cm'),
			dataType: 'html',
			async: true,
			cache: false,
			success: function(html){
				var $html = $(html);
				$.cocoaDialog.open({type: 'multi_prod_add', custom_popup: $html, hide_event: function() {
						if (SHOP_PROD_MULTI_ADD.check_upload_complete()) window.location.reload();

						// 닫기 콜백 해제.
						$.cocoaDialog.obj.off('hide.bs.modal');
					}});
			}
		});
	};

	var showCategoryCode = function(){
		$.ajax({
			type: 'POST',
			data: {},
			url: ('/admin/ajax/shop/open_category_code.cm'),
			dataType: 'html',
			async: true,
			cache: false,
			success: function(html){
				var $html = $(html);
				$.cocoaDialog.open({type: 'category_code', custom_popup: $html});
			}
		});
	};

	var delivTypeListChange = function(type){
		if(type == 'download'){
			$form.find('._prod_type_list_wrap').show();
			$form.find('._deliv_price_wrap').hide();
			$form.find('._deliv_option').hide();
			$form.find('._stock_wrap').hide();
			$form.find('._option_wrap').hide();
			$form.find('._prod_display_list_wrap').hide();
			$form.find('._deliv_pay_type_wrap').hide();
		}else if(type == 'default'){
			$form.find('._deliv_pay_type_wrap').hide();
			if($form.find('#default_type').val() == 'send'){
				$form.find('._deliv_option').hide();
				$form.find('._prod_type_list_wrap').hide();
				$form.find('._deliv_price_wrap').show();
				$form.find('._stock_wrap').show();
				$form.find('._option_wrap').show();
				$form.find('._prod_display_list_wrap').show();
			}else if($form.find('#default_type').val() == 'direct'){
				$form.find('._deliv_option').hide();
				$form.find('._prod_type_list_wrap').hide();
				$form.find('._deliv_price_wrap').show();
				$form.find('._stock_wrap').show();
				$form.find('._option_wrap').show();
				$form.find('._prod_display_list_wrap').show();
			}else if($form.find('#default_type').val() == 'no_deliv'){
				$form.find('._deliv_option').hide();
				$form.find('._prod_type_list_wrap').hide();
				$form.find('._deliv_price_wrap').hide();
				$form.find('._stock_wrap').hide();
				$form.find('._option_wrap').show();
				$form.find('._prod_display_list_wrap').hide();
			}else{
				$form.find('._prod_type_list_wrap').show();
				$form.find('._deliv_option').hide();
				$form.find('._deliv_price_wrap').hide();
				$form.find('._stock_wrap').hide();
				$form.find('._option_wrap').hide();
				$form.find('._prod_display_list_wrap').hide();
			}
		}else if(type == 'direct'){
			$form.find('._deliv_option').hide();
			$form.find('._prod_type_list_wrap').hide();
			$form.find('._deliv_price_wrap').show();
			$form.find('._stock_wrap').show();
			$form.find('._option_wrap').show();
			$form.find('._prod_display_list_wrap').show();
			$form.find('._deliv_pay_type_wrap').show();
		}else if(type == 'no_deliv'){
			$form.find('._deliv_option').hide();
			$form.find('._prod_type_list_wrap').hide();
			$form.find('._deliv_price_wrap').hide();
			$form.find('._stock_wrap').hide();
			$form.find('._option_wrap').show();
			$form.find('._prod_display_list_wrap').hide();
			$form.find('._deliv_pay_type_wrap').hide();
		}else{
			$form.find('._prod_type_list_wrap').hide();
			$form.find('._deliv_price_wrap').show();
			$form.find('._deliv_option').show();
			$form.find('._stock_wrap').show();
			$form.find('._option_wrap').show();
			$form.find('._prod_display_list_wrap').show();
			$form.find('._deliv_pay_type_wrap').show();
		}
	};

	var makeFileList = function(file_name,file_size){
		$form.find('._no_digital_file').hide();
		$form.find('._digital_file').show();
		$form.find('._file_name').text(file_name);
		$form.find('._file_size').text(GetFileSize(file_size));
		is_file_uploaded = true;
	};

	var delivGuidTypeChange = function(type, unit_code){
		var $config_deliv_guid = $form.find('._config_deliv_guid[data-unitCode="' + unit_code + '"]');
		var $prod_deliv_guid = $form.find('._prod_deliv_guid[data-unitCode="' + unit_code + '"]');

		if(type == 'config'){
			$prod_deliv_guid.hide();
			$config_deliv_guid.show();
		}else{
			$prod_deliv_guid.show();
			$config_deliv_guid.hide();
		}
	};

	var changeProdPriceNone = function (chk){
		if (chk){
			if(confirm(getLocalizeString("설명_가격없음설정상품옵션정보삭제", "", "가격없음으로 설정된 상품은 옵션 정보가 삭제됩니다. 그래도 진행하시겠습니까?"))){
				$prod_price.prop('readonly',true);
				$prod_price_org.prop('readonly',true);
				SHOP_OPTION_MANAGE.toggleProdOptionCard();
				return true;
			}else{
				SHOP_OPTION_MANAGE.toggleProdOptionCard(true);
				return false;
			}
		}else{
			$prod_price.prop('readonly',false);
			$prod_price_org.prop('readonly',false);
			SHOP_OPTION_MANAGE.toggleProdOptionCard();
			return true;
		}
	};

	var changeProdExchangeRatePrice = function(type,from_unit_code,target_unit_code){
		if(type == 'sale_price'){//판매 가격
			var price = $('#shop_prod_price_'+from_unit_code).val();
			var target = $('#shop_prod_price_'+target_unit_code);
		}else{//할인 이전 가격
			var price = $('#prod_price_org_'+from_unit_code).val();
			var target = $('#prod_price_org_'+target_unit_code);
		}
		$.ajax({
			type : 'POST',
			data : {'target_unit_code' : target_unit_code, 'price' : price},
			url : ('/admin/ajax/shop/get_prod_exchange_rate_price.cm'),
			dataType : 'json',
			async : true,
			cache : false,
			success: function(res){
				target.val(res.exchange_rate_price);
				header_ctl.change();
			}
		});
	};

	var changeGivePointValue = function(unit_code) {
		var $_setting_wrap = $("#point_setting_" + unit_code + "_wrap");
		var $_type = $_setting_wrap.find('._give_point_value_type');

		if ( $_type.prop('value') == 'percent' ) {
			var $_value = $_setting_wrap.find('._give_point_value');


			var $_prod_price = $('#shop_prod_price_' + unit_code);

			var thousand_char = $_value.data('thousand-char');
			var prod_price = $_prod_price.val().replace(thousand_char, '');
			var percent = $_value.val().replace(thousand_char, '');

			var price_chpher = parseInt($_value.data('decimal-count'));
			var preview_point = ( prod_price / 100 ) * percent;

			$_setting_wrap.find('._point_preview_value').text(preview_point.toFixed(price_chpher));
		}
	};

	var changeGivePointValueType = function (type,unit_code,mode){
		var o =	$('#give_point_value_' + unit_code);
		if (type=='percent'){
			if(mode === 'add') $mileage_wrap.find('._point_preview_' + unit_code + '_wrap').show();
			// 적용되어있는 format 이벤트 제거
			o.unbind('keydown.format keyup.format keyup.format');
			o.number(true,2);
		}else{
			if(mode === 'add') $mileage_wrap.find('._point_preview_' + unit_code + '_wrap').hide();
			set_money_format(o, o.data('decimal-count'), o.data('decimal-char'), o.data('thousand-char'));
		}
		o.val('').focus();
	};

	var changeDiscountValueType = function (type,unit_code,key){
		var $discount_target = $('#discount_target_' + key);
		var o =	$discount_target.find('input[name="period_discount_data_' + unit_code + '[target][' + key + '][dc_amount]"]');
		if (type=='percent'){
			// 적용되어있는 format 이벤트 제거
			o.unbind('keydown.format keyup.format keyup.format');
			o.number(true,0);
		}else{
			set_money_format(o, o.data('decimal-count'), o.data('decimal-char'), o.data('thousand-char'));
		}
		if(header_ctl != undefined ) header_ctl.change();
		o.val('').focus();
	};

	var checkDcAmount = function(obj){
		var RegExp = /[\{\}\[\]\/?;:|\)*~`!^\-_+┼<>@\#$%&\'\"\\\(\=]/gi;

		if (RegExp.test(obj.value)){
			obj.value = obj.value.replace(RegExp, '');
		}
	};

	var deliv_modal;
	var openShopDelivForm = function(idx,unit_code){
		deliv_modal = {"idx": parseInt(idx), "unit_code": unit_code};
		SHOP_DELIV.openModal({"type": "prod", "data": $prod_deliv_list[unit_code][idx], "idx": idx, "unit_code": unit_code});
	};
	var updateDelivSetting = function($data){
		if ( typeof deliv_modal['idx'] != 'number' ) return false;
		var idx = deliv_modal['idx'];
		var unit_code = deliv_modal['unit_code'];

		$data.deliv_country_list = $prod_deliv_list[unit_code][idx].deliv_country_list;
		$data.deliv_post_name = $prod_deliv_list[unit_code][idx].deliv_post_name;
		$data.deliv_use = $prod_deliv_list[unit_code][idx].deliv_use;
		$data.deliv_code = $prod_deliv_list[unit_code][idx].deliv_code;
		$prod_deliv_list[unit_code].splice(idx,1,$data);
		$.ajax({
			"type": "POST",
			"data": {"data": $data, "idx": idx, "unit_code": unit_code},
			"url": ('/admin/ajax/shop/prod_deliv_form.cm'),
			"dataType": "json",
			"async": true,
			"cache": false,
			"success": function(res){
				if ( res['msg'] == 'SUCCESS' ){
					$form.find('._deliv_form_wrap_' + idx).replaceWith(res['html']);
					header_ctl.change();
					$.cocoaDialog.close();
				} else {
					alert(res['msg']);
				}
			}
		});
	};

	var deleteProdPurchaseData = function(prod_code){
		if(confirm("확인을 누르면 이전 구매내역이 모두 삭제되어 이전에 구매했던 분들의 구매가 가능하게 되며 복원이 불가합니다.\n진행하시겠습니까?")){
			$.ajax({
				"type" : "POST",
				"data" : {"prod_code" : prod_code},
				"url" : ('/admin/ajax/shop/delete_prod_purchase_data.cm'),
				"dataType" : "json",
				"async" : true,
				"cache" : false,
				"success" : function(res){
					if(res['msg'] == 'SUCCESS'){
						alert('1일 구매 수량을 초기화 했습니다.');
					}else{
						alert(res['msg']);
					}
				}
			});
		}
	};

	var resetProdPurchaseData = function(prod_code){
		if(confirm("확인을 누르면 이전 구매내역이 모두 초기화되어 이전에 구매했던 분들의 구매가 가능하게 되며 복원이 불가합니다.\n진행하시겠습니까?")){
			$.ajax({
				"type" : "POST",
				"data" : {"prod_code" : prod_code},
				"url" : ('/admin/ajax/shop/reset_prod_purchase_data.cm'),
				"dataType" : "json",
				"async" : true,
				"cache" : false,
				"success" : function(res){
					if(res['msg'] == 'SUCCESS'){
						alert('1일 구매 수량을 초기화 했습니다.');
					}else{
						alert(res['msg']);
					}
				}
			});
		}
	};

	var delivUseChange = function(type,idx,unit_code){
		if(type){
			$prod_deliv_list[unit_code][idx].deliv_use = 'true';
		}else{
			$prod_deliv_list[unit_code][idx].deliv_use = '';
		}
		header_ctl.change();
	};

	var delivFormMake = function(idx,unit_code){
		$.ajax({
			type: 'POST',
			data: {idx:idx,unit_code:unit_code,deliv_list:$prod_deliv_list},
			url: ('/admin/ajax/shop/prod_deliv_form_make.cm'),
			dataType: 'json',
			async: true,
			cache: false,
			success: function(result){
				$('._prod_deliv_wrapper ul.nav-tabs > li').removeClass('active');
				$('#prod_deliv_tab_' + unit_code).addClass('active');
				//$prod_deliv_list = $deliv_list;
				$form.find('._card_body_wrap').html($(result.html));
				$form.find('._deliv_guid_item').hide();
				$form.find('._deliv_guid_' + unit_code).show();
			}
		});
	};

	/**
	 * 유닛별 할인 설정 영역 생성
	 * @param unit_code
	 * @param mode			add 상품 추가, list 상품 관리(일괄 설정 모달)
	 */
	var discountFormMake = function(unit_code, mode){
		// 즉시/기간 할인 영역 표시 처리
		$('._prod_discount_wrapper ul.nav-tabs > li').removeClass('active');
		$('#prod_discount_tab_' + unit_code).addClass('active');
		var $discount_unit = $('._discount_' + unit_code);
		var $discount_input_instant = $discount_unit.find('input[name="product_discount_options_' + unit_code + '[period]"]');
		var $discount_instant_group = $discount_unit.find('._discount_instant_group');
		var $discount_input_use_period = $discount_unit.find('input[name="period_discount_data_' + unit_code + '[use_period]"]');
		var $use_period_wrap = $discount_unit.find('._use_period_wrap');
		var $sale_before_price_wrap = $('._sale_before_price_wrap_' + unit_code);
		if($discount_input_instant.is(':checked')){
			$discount_instant_group.show();
			$sale_before_price_wrap.hide();
		}else{
			$discount_instant_group.hide();
			$sale_before_price_wrap.show();
		}
		$discount_input_instant.off('change').on('change', function(event){
			var $that = $(this);
			if($that.is(":checked")){
				if($discount_instant_group.find('._discount_target').length <= 0){
					addDiscountTargetForm(unit_code);
				}
				$discount_instant_group.show();
				$sale_before_price_wrap.hide();
			}else{
				if($discount_instant_group.find('._discount_target').length > 0){
					// 기존 기간할인 데이터 전부 삭제처리
					$discount_instant_group.hide();
					$sale_before_price_wrap.show();
				}else{
					$sale_before_price_wrap.show();
					$discount_instant_group.hide();
				}
			}
		});

		$discount_input_instant.find("input[name='apply_sale_price']").off("blur.percent").on("blur.percent",function(){
			if(type == "percent"){
				var max_pernect = 100;
				$(this).val($(this).val() > max_pernect ? max_pernect : $(this).val());
			}else{
				var option = {max_byte : 8};
				$(this).limitLength(option);
			}
		});

		// 할인기간 datepicker
		var $start_time = $discount_unit.find('input[name="period_discount_data_' + unit_code + '[start_time]"]');
		var $end_time = $discount_unit.find('input[name="period_discount_data_' + unit_code + '[end_time]"]');

		var s_d = $start_time.val();
		var e_d = $end_time.val();

		$start_time.datetimepicker({
			dayViewHeaderFormat: 'YYYY MMMM',
			locale: getMomentLangCode(ADMIN_LANG_CODE),
			icons: {
				time: 'zmdi zmdi-time',
				date: 'zmdi zmdi-calendar',
				up: 'zmdi zmdi-chevron-up',
				down: 'zmdi zmdi-chevron-down',
				previous: 'zmdi zmdi-chevron-left',
				next: 'zmdi zmdi-chevron-right',
				today: 'glyphicon glyphicon-screenshot',
				clear: 'glyphicon glyphicon-trash'
			},
			format : 'YYYY-MM-DD HH:mm',
		}).on('blur',function(data){
			if($start_time.val() > $end_time.val()){
				$end_time.val($start_time.val());
			}
		});
		$end_time.datetimepicker({
			dayViewHeaderFormat: 'YYYY MMMM',
			locale: getMomentLangCode(ADMIN_LANG_CODE),
			minDate: s_d,
			icons: {
				time: 'zmdi zmdi-time',
				date: 'zmdi zmdi-calendar',
				up: 'zmdi zmdi-chevron-up',
				down: 'zmdi zmdi-chevron-down',
				previous: 'zmdi zmdi-chevron-left',
				next: 'zmdi zmdi-chevron-right',
				today: 'glyphicon glyphicon-screenshot',
				clear: 'glyphicon glyphicon-trash'
			},
			format : 'YYYY-MM-DD HH:mm',
		}).on('blur',function(data){
			if($start_time.val() > $end_time.val()){
				$end_time.val($start_time.val());
			}
		});

		$start_time.datetimepicker().data('DateTimePicker').date(s_d);
		$end_time.datetimepicker().data('DateTimePicker').date(e_d);

		$start_time.datetimepicker().on('dp.change', function(data){
			if(header_ctl != undefined ) header_ctl.change();
		});
		$end_time.datetimepicker().on('dp.change', function(data){
			if(header_ctl != undefined ) header_ctl.change();
		});

		if($discount_input_use_period.is(':checked')){
			$use_period_wrap.show();
		}else{
			$use_period_wrap.hide();
		}
		$discount_input_use_period.off('change').on('change', function(event){
			var $that = $(this);
			if($that.is(":checked")){
				$use_period_wrap.show();
			}else{
				$use_period_wrap.hide();
			}
		});

		// 적립금 영역 표시 처리
		$mileage_type = $('#mileage_type_' + unit_code);
		$mileage_type_wrap = $('#mileage_type_wrap_' + unit_code);
		$mileage_wrap = $('#mileage_wrap_' + unit_code);
		var mileage_type_flag=true;
		$mileage_type.off('change').on('change', function(v){
			if (!mileage_type_flag && mode === 'add'){
				if(header_ctl != undefined )header_ctl.change();
			}
			mileage_type_flag = false;
			$mileage_wrap.toggle($(this).val()=='individual');
		}).trigger('change');
		// 변경한 유닛 영역 표시 처리
		$('._discount_item').hide();
		$discount_unit.show();
	};

	var showMemberGroupDropdownSetting = function(key){
		var $discount_unit = $('._discount_wrap');
		var $group_title = $discount_unit.find('#dc_target_title_' + key);
		var $current_group_type = $discount_unit.find('input[name="period_discount_data[target][' + key + '][group_type]"]');
		var $current_group_code = $discount_unit.find('input[name="period_discount_data[target][' + key + '][group_code]"]');
		var current_group_type = $current_group_type.val();
		var current_group_code = $current_group_code.val();
		var $dropdown = $('#discount_group_dropdown');
		var $target_dropdown = $discount_unit.find('#target_group_dropdown_' + key);
		// 그룹은 공통되므로 한 번 생성한 그룹에서 내용만 옮겨줌
		$target_dropdown.html($dropdown.html());
		// 기존에 선택된 그룹 disabled 처리
		$target_dropdown.find('._group_item').each(function(){
			var $that = $(this);
			var group_type = $that.attr('data-group-type');
			if(group_type === 'group'){
				var group_code = $that.attr('data-group-code');

				if($discount_unit.find('._period_discount_data_group_code[value=' + group_code + ']').length > 0){
					if(current_group_code === group_code){
						$that.addClass('checked');
					}else{
						$that.addClass('disabled');
					}
				}
			}else{
				if($discount_unit.find('._period_discount_data_group_type[value=' + group_type + ']').length > 0){
					if(current_group_type === group_type){
						$that.addClass('checked');
					}else{
						$that.addClass('disabled');
					}
				}
			}
		});
		$target_dropdown.find('._group_item:not(.disabled)').off('click').on('click', function(){
			var $that = $(this);
			$group_title.val($that.find('> a').text());
			$current_group_type.val($that.attr('data-group-type'));
			$current_group_code.val($that.attr('data-group-code'));
		});
	};

	var addDiscountTargetFormSetting = function(){
		$.ajax({
			type: 'POST',
			data: {},
			url: ('/admin/ajax/shop/get_prod_discount_instant_item_setting.cm'),
			dataType: 'json',
			async: true,
			cache: false,
			success: function(result){
				$('#discount_instant_target').append($(result.html));
			},
			error: function(){
			}
		});
	};


	var initDiscountSetting = function(){
		var $discount_wrap = $('._discount_wrap');
		var $period_discount_country = $('._period_discount_country');
		var $_ratio_currency = $discount_wrap.find('._ratio_currency');
		var $_period_price = $discount_wrap.find('._period_price');
		var $_product_ratio_type = $discount_wrap.find('._product_ratio_type');
		$period_discount_country.on('change', function() {
			var $_that = $(this);
			var val = $_that.val();
			$_ratio_currency.text(currency_char_list[val]);

			// 소수점 자릿수 세팅
			$_period_price.unbind('keydown.format keyup.format keyup.format');
			var $_selected = $_that.find(':selected');
			set_money_format($_period_price, ( $_product_ratio_type.val() == 'percent' ? 0 : $_selected.data('decimal') ), $_selected.data('decimal-char'), $_selected.data('thousand-char'));
		}).trigger('change');

		$_product_ratio_type.on('change', function() {
			var val = this.value;
			var $_selected = $period_discount_country.find(':selected');
			$_period_price.unbind('keydown.format keyup.format keyup.format');
			if ( val == 'percent' ) {
				// 소수점 자릿수 세팅
				set_money_format($_period_price, 0);
			} else {
				// 소수점 자릿수 세팅
				set_money_format($_period_price, $_selected.data('decimal'), $_selected.data('decimal-char'), $_selected.data('thousand-char'));
			}
		}).trigger('change');

		//즉시/기간할인
		var $discount_input_instant = $discount_wrap.find('input[name="product_discount_options[period]"]');
		var $discount_instant_group = $discount_wrap.find('._discount_instant_group');
		var $discount_input_use_period = $discount_wrap.find('input[name="period_discount_data[use_period]"]');

		//포인트
		var $discount_input_point = $discount_wrap.find('input[name="product_discount_options[point]"]');
		var $mileage_type_wrap = $discount_wrap.find('#mileage_type_wrap');
		var $mileage_type = $discount_wrap.find('#mileage_type');
		var $mileage_wrap = $discount_wrap.find('#mileage_wrap');

		$discount_input_instant.off('change').on('change', function(event){
			var $that = $(this);
			if($that.is(":checked")){
				$discount_instant_group.show();
			}else{
				$discount_instant_group.hide();
			}
		});

		var mileage_type_flag=true;
		$mileage_type.off('change').on('change', function(v){
			mileage_type_flag = false;
			$mileage_wrap.toggle($(this).val()=='individual');
		}).trigger('change');

		// 할인기간 datepicker
		var $start_time = $discount_wrap.find('input[name="period_discount_data[start_time]"]');
		var $end_time = $discount_wrap.find('input[name="period_discount_data[end_time]"]');

		var s_d = $start_time.val();
		var e_d = $end_time.val();
		var $use_period_wrap = $discount_wrap.find('._use_period_wrap');

		$start_time.datetimepicker({
			dayViewHeaderFormat: 'YYYY MMMM',
			locale: getMomentLangCode(ADMIN_LANG_CODE),
			minDate: s_d,
			icons: {
				time: 'zmdi zmdi-time',
				date: 'zmdi zmdi-calendar',
				up: 'zmdi zmdi-chevron-up',
				down: 'zmdi zmdi-chevron-down',
				previous: 'zmdi zmdi-chevron-left',
				next: 'zmdi zmdi-chevron-right',
				today: 'glyphicon glyphicon-screenshot',
				clear: 'glyphicon glyphicon-trash'
			},
			format : 'YYYY-MM-DD HH:mm',
		}).on('blur',function(data){
			if($start_time.val() > $end_time.val()){
				$end_time.val($start_time.val());
			}
		});
		$end_time.datetimepicker({
			dayViewHeaderFormat: 'YYYY MMMM',
			locale: getMomentLangCode(ADMIN_LANG_CODE),
			minDate: s_d,
			icons: {
				time: 'zmdi zmdi-time',
				date: 'zmdi zmdi-calendar',
				up: 'zmdi zmdi-chevron-up',
				down: 'zmdi zmdi-chevron-down',
				previous: 'zmdi zmdi-chevron-left',
				next: 'zmdi zmdi-chevron-right',
				today: 'glyphicon glyphicon-screenshot',
				clear: 'glyphicon glyphicon-trash'
			},
			format : 'YYYY-MM-DD HH:mm',
		}).on('blur',function(data){
			if($start_time.val() > $end_time.val()){
				$end_time.val($start_time.val());
			}
		});

		$start_time.datetimepicker().data('DateTimePicker').date(s_d);
		$end_time.datetimepicker().data('DateTimePicker').date(e_d);

		$discount_input_use_period.off('change').on('change', function(event){
			var $that = $(this);
			if($that.is(":checked")){
				$use_period_wrap.show();
			}else{
				$use_period_wrap.hide();
			}
		});
	};

	/**
	 * 즉시/기간할인 적용대상 드롭다운 노출
	 * @param unit_code
	 * @param key
	 */
	var showMemberGroupDropdown = function(unit_code, key){
		var $discount_unit = $('._discount_' + unit_code);
		var use_shopping_group_dc = $discount_unit.find('input[name="product_discount_options_' + unit_code + '[shopping_group_dc]"]').is(':checked');
		var $group_title = $discount_unit.find('#dc_target_title_' + key);
		var $current_group_type = $discount_unit.find('input[name="period_discount_data_' + unit_code + '[target][' + key + '][group_type]"]');
		var $current_group_code = $discount_unit.find('input[name="period_discount_data_' + unit_code + '[target][' + key + '][group_code]"]');
		var $current_use_shopping = $discount_unit.find('input[name="is_shopping_group_' + unit_code + '[' + key + ']"]');
		var current_group_type = $current_group_type.val();
		var current_group_code = $current_group_code.val();
		var $dropdown = $('#discount_group_dropdown');
		var $target_dropdown = $discount_unit.find('#target_group_dropdown_' + key);
		// 그룹은 공통되므로 한 번 생성한 그룹에서 내용만 옮겨줌
		$target_dropdown.html($dropdown.html());
		// 기존에 선택된 그룹 disabled 처리
		$target_dropdown.find('._group_item').each(function(){
			var $that = $(this);

			var group_type = $that.attr('data-group-type');
			if(group_type === 'group'){
				var group_code = $that.attr('data-group-code');

				if($discount_unit.find('._period_discount_data_group_code[value=' + group_code + ']').length > 0){
					if(current_group_code === group_code){
						$that.addClass('checked');
					}else{
						$that.addClass('disabled');
					}
				}
			}else{
				if($discount_unit.find('._period_discount_data_group_type[value=' + group_type + ']').length > 0){
					if(current_group_type === group_type){
						$that.addClass('checked');
					}else{
						$that.addClass('disabled');
					}
				}
			}
		});
		$target_dropdown.find('._group_item:not(.disabled)').off('click').on('click', function(){
			var $that = $(this);
			$group_title.val($that.find('> a').text());
			$current_group_type.val($that.attr('data-group-type'));
			$current_group_code.val($that.attr('data-group-code'));
			$current_use_shopping.val($that.attr('data-group-shopping'));
		});
	};

	var changeMemberGroupDropdown = function(){
		if(header_ctl != undefined ) header_ctl.change();
	};

	var addDiscountTargetForm = function(unit_code){
		$.ajax({
			type: 'POST',
			data: {unit_code:unit_code},
			url: ('/admin/ajax/shop/get_prod_discount_instant_item.cm'),
			dataType: 'json',
			async: true,
			cache: false,
			success: function(result){
				$('#discount_instant_target_' + unit_code).append($(result.html));
			},
			error: function(){

			}
		});
	};

	var removeDiscountTargetForm = function(key){
		var $discount_target = $('#discount_target_' + key);
		if($discount_target.length > 0){
			if(confirm(getLocalizeString('설명_해당할인설정을삭제하시겠습니까', '', '해당 할인 설정을 삭제하시겠습니까?'))){
				var test = $('._discount_target').index();
				console.log(test);
				$discount_target.remove();
				if(header_ctl != undefined ) header_ctl.change();
			}
		}
	};

	var checkPeriodDiscount = function(unit_code){
		$('input[name="product_discount_options_' + unit_code + '[period]"]').prop('checked', false);
	};

	var saveProdDiscountManage = function($form){
		var form_data = $form.serialize();
		dozProgress.start();
		$.ajax({
			type : 'POST',
			data : form_data,
			url : ('/admin/ajax/shop/prod_discount_manage_proc.cm'),
			dataType : 'json',
			async : true,
			cache : false,
			success : function(res){
				dozProgress.done();
				if(res.msg == 'SUCCESS'){
					SHOP_PROD_LIST.openSaveProdDiscountComplete();
				}else{
					alert(res.msg);
				}
			},
			error : function(res){
				dozProgress.done();
				alert();
			}
		});
	};

	// 판매방식 라디오 변동시
	var changeProdType = function(){
		$form.find('._prod_type_wrap').hide();
		var prod_type = $form.find('input[name="prod_type"]:radio:checked').val();
		var $prod_type_wrap = $form.find('._'+prod_type+'_form_wrap');
		if ( $prod_type_wrap.length > 0 ){
			$prod_type_wrap.show();
		}

		if ( prod_type == 'subscribe' ) {
			if ( $form.find('._option_wrap').find('#prod_option_list').find('.form-group').length > 0 ) {
				$('._option_delete_info').show();
			}
			SHOP_OPTION_MANAGE.toggleProdOptionCard(false);
		} else {
			SHOP_OPTION_MANAGE.toggleProdOptionCard(true);
		}

		// 일반상품에만 설정이 가능한 항목들 제어
		$form.find('._prod_deliv_wrapper').toggle(prod_type == 'normal');
		$form.find('._prod_display_list_wrap').find('input').each(function(){
			if ( $(this).val() == 'FACEBOOK' ) return;
			$(this).prop('disabled', !(prod_type == 'normal') );
		});
	};

	var changeUseDownloadLimit = function(b){
		$form.find('._digital_download_limit_wrap').toggle(b);
	};

	var setNumberOnly = function($obj){
		$obj.on('keypress', function(e){
			$(this).val($(this).val().replace(/[^0-9]/g, ''));
			return ( e.keyCode >= 48 && e.keyCode <= 57 );
		});
		$obj.on('keyup', function(e){
			$(this).val($(this).val().replace(/[^0-9]/g, ''));
			return ( e.keyCode >= 48 && e.keyCode <= 57 );
		});
	};

	var checkNumberLimit = function($obj){
		var maximum = {
			"download_limit_period": 180,
			"download_limit_count": 10000,
			"subscribe_period": 9999
		};

		var v = parseInt($obj.val());
		if ( isNaN(v) ) {
			$obj.val('');
			return false;
		}

		var _name = $obj.attr('name');
		if ( typeof maximum[_name] == 'undefined' ) return false;
		if ( v > maximum[_name]) {
			v = maximum[_name];
		}
		$obj.val(v);
	};

	var is_file_uploaded = false;
	var showDigitalProdDownloadList = function(){
		if ( !is_file_uploaded ) {
			alert(getLocalizeString('설명_아직등록되지않은상품은내역을확인하실수없습니다','', '아직 등록되지 않은 상품은 내역을 확인하실 수 없습니다.'));
			return false;
		}

		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/shop/open_digital_prod_download_list_modal.cm'),
			dataType: 'json',
			success: function(res){
				if(res.msg == 'SUCCESS'){
					$.cocoaDialog.open({type: 'admin_digital_prod_download_list_modal', custom_popup: res.html});
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var getDigitalProdDownloadList = function(keyword, current_page){
		$.ajax({
			"type": "POST",
			"url": "/admin/ajax/shop/get_digital_prod_download_list.cm",
			"data": {"idx": prod_idx, "keyword": keyword, "current_page": current_page},
			"dataType": "json",
			"success": function(res){
				if(res.msg == 'SUCCESS'){
					var $prod_download_list_modal = $('.modal_admin_digital_prod_download_list_modal');
					$prod_download_list_modal.find('._list_body').html(res['html']);
					$prod_download_list_modal.find('._list_paging').html(res['html_paging']);
					$prod_download_list_modal.find('._list_count').html(getLocalizeString('설명_총n회다운로드', res['total_count'], '총 %1 회 다운로드'));
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var loadCategoryModifyManageList = function(html, parent_code) {
		var categoryList = [];
		$.each(categories, function(no,data){
			if ( data.parent_code == parent_code )
				categoryList.push(data);
		});

		// HTML 생성 시작
		if ( categoryList.length ){
			if ( parent_code != '' ) html += '<ol class="sub-category">';
			$.each(categoryList, function(no,data){
				if ( parent_code != '' ) {
					html += '<li class="dd-list" data-code="' + data.code + '">';
				}

				var cateName = RemoveTag(typeof data.name[current_unit_code] == "undefined" ? "" : data.name[current_unit_code])
				if ( data.is_leaf_node ) { //말단노드인경우체크가능
					html += '<div class="checkbox checkbox-styled dropdown-handle">';
					html += '<label class="category-item">';
					html += '<input type="checkbox" name="cate_list[]" value="' + data.code + '">';
					html += '<span class="check-item">' + cateName + '</span>';
					html += '</label>';
					html += '</div>';
				}else{
					html += '<div class="dropdown-handle category-item">' + cateName + '</div>';
				}

				html = loadCategoryModifyManageList(html, data.code); //자식 카테고리 탐색
				if ( parent_code != '' )  html += '</li>';
			});
			if ( parent_code != '' ) html += '</ol>';
		}
		return html;
	};

	var saveCategoryModifyManageList = function() {
		var $_form = $('#prod_category_modify_manege_form');
		var mode = $_form.find('input[name="mode"]').filter(':checked').val();
		if ( mode == 'delete' ) {
			if ( ! confirm(getLocalizeString("설명_카테고리제거로인해카테고리가존재하지않게되는상품문제발생", "", "카테고리 제거로 인해 카테고리가 전혀 존재하지 않게되는 상품은 상품 페이지에 노출되지 않거나 네이버쇼핑 연동에 문제가 발생할 수 있습니다. 그래도 카테고리를 제거하시겠습니까? (나중에 카테고리를 지정하면 문제가 해결됩니다.)")) ) {
				return false;
			}
		}

		var form_data = $_form.serialize();
		dozProgress.start();
		$.ajax({
			type: 'POST',
			data: form_data,
			url: ('/admin/ajax/shop/prod_category_modify_manage_save.cm'),
			dataType: 'json',
			cache: false,
			success: function (res) {
				if (res.msg=='SUCCESS') {
					SHOP_PROD_LIST.openCategoryModifyManageComplete();
				} else {
					alert(res.msg);
				}
				dozProgress.done();
			}
		});
	};

	var saveProdPriceModify = function() {
		var form_data = $('#formProdPriceModify').serialize();
		dozProgress.start();
		$.ajax({
			type: 'POST',
			data: form_data,
			url: ('/admin/ajax/shop/prod_price_manage_proc.cm'),
			dataType: 'json',
			cache: false,
			success: function (res) {
				if (res.msg=='SUCCESS'){
					window.location.reload();
					// SHOP_PROD_LIST.openCategoryModifyManageComplete();
				} else {
					alert(res.msg);
				}
				dozProgress.done();
			}
		});
	};

	var changeMobileContentStatus = function(type){
		if(type == 'N') $mobile_prod_content_wrap.hide();
		else $mobile_prod_content_wrap.show();
	};

	var saveProdPreSaleManage = function($form) {
		var form_data = $form.serialize();
		dozProgress.start();
		$.ajax({
			type: 'POST',
			data: form_data,
			url: ('/admin/ajax/shop/prod_pre_sale_manage_proc.cm'),
			dataType: 'json',
			cache: false,
			success: function (res) {
				dozProgress.done();
				if (res.msg=='SUCCESS'){
					SHOP_PROD_LIST.openSaveProdPreSaleManageComplete();
				} else {
					alert(res.msg);
				}
			}
		});
	};

	var checkCustomProdCode = function(obj) {
		var prod_code = obj.value;

		var callback = function(res) {
			if ( res.msg == 'SUCCESS' ) {
				$('._form_custom_prod_code').removeClass('has-error');
				$('._form_custom_error_msg').hide();
			} else {
				$('._form_custom_prod_code').addClass('has-error');
				$('._form_custom_error_msg').text(res.msg).show();
			}
		};

		// prod_code 가 비어있거나 기존 코드와 동일할 경우 ajax 호출할 필요가 없다.
		if ( prod_code.length == 0 || prod_code == $(obj).data('oricode') ) {
			callback({'msg' : 'SUCCESS'});
		} else {
			$.ajax({
				type: 'POST',
				data: {prod_code : prod_code},
				url: ('/admin/ajax/shop/check_custom_prod_code.cm'),
				dataType: 'json',
				cache: false,
				success: callback
			});
		}
	};

	var openReservationSale = function() {

	};

	var preSaleUseChange = function(checked) {
		var $_form_pre_sale = $('._form_pre_sale');
		if ( checked ) {
			$_form_pre_sale.show();
			if ( $_form_pre_sale.find('._start_time').val().length == 0 ) {
				$_form_pre_sale.find('._pre_sale_simple_day[data-day="7"]').trigger('click');
			}
		} else {
			$_form_pre_sale.hide();
		}
	};

	var setPreSaleDate = function(obj, callback,type) {
		var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
		var isIE = navigator.userAgent.indexOf("MSIE") != -1;
		var minDate;
		if(isSafari || isIE){
			minDate = moment().format('YYYY/MM/DD 00:00:00');
		}else{
			minDate = moment().format('YYYY-MM-DD 00:00:00');
		}
		if(type == 'start' && obj.val() != ''){
			var now_timestamp = new Date(minDate).getTime();
			if(isSafari || isIE){
				var obj_val = obj.val().replace( /-/gi, '/');
				var start_timestamp = new Date(obj_val).getTime();
			}else var start_timestamp = new Date(obj.val()).getTime();
			if(start_timestamp > now_timestamp){
				minDate = moment().format('YYYY-MM-DD 00:00:00');
			}else{
				minDate = obj.val();
			}
		}
		var date_option = {
			dayViewHeaderFormat: 'YYYY MMMM',
			minDate: minDate, // 단순히 현재 시간으로만 하면 문제가 많아서 00:00:00 까지 선택할 수 있게 범위를 넓힘.
			locale: getMomentLangCode(ADMIN_LANG_CODE),
			icons: {
				time: 'zmdi zmdi-time',
				date: 'zmdi zmdi-calendar',
				up: 'zmdi zmdi-chevron-up',
				down: 'zmdi zmdi-chevron-down',
				previous: 'zmdi zmdi-chevron-left',
				next: 'zmdi zmdi-chevron-right',
				today: 'glyphicon glyphicon-screenshot',
				clear: 'glyphicon glyphicon-trash'
			},
			format:'YYYY-MM-DD HH:mm',
		};

		var d = new Date(obj.val());
		obj.datetimepicker(date_option);
		obj.data('DateTimePicker').date(d);

		if ( typeof callback == "function" ) {
			obj.on('dp.change', callback);
		}
	};

	var initPreSale = function($_form) {
		(function() {
			// 버튼 클릭 여부... 당장 로직 생각이 안나서 클로져 사용...
			var isBtnClick = false;

			// SHOP_PROD_MANAGE.preSaleUseChange($(this).prop('checked'))

			// 예약 판매 관련
			var $pre_sale_simple_day = $_form.find('._pre_sale_simple_day');
			var $start_time = $_form.find('._start_time');
			var $end_time = $_form.find('._end_time');

			var preSaleDateCallback = function(e) {
				if ( ! isBtnClick ) {
					$pre_sale_simple_day.filter('.btn-primary').removeClass('btn-primary').addClass('btn-default-bright');
				}

				// 만약 판매 종료날이 판매 시작일보다 이전일 경우 판매 시작일로 세팅.
				var start_date = $start_time.val();
				var end_date = $end_time.val();

				if ( start_date.length &&  end_date.length ) {
					var start_moment = moment(start_date);
					var end_moment = moment(end_date);

					if ( end_moment.unix() < start_moment.unix() ) {
						$end_time.data('DateTimePicker').date(start_moment);
					}
				}

				if ( header_ctl ) {
					header_ctl.change();
				}
			};

			// 판매기간 이벤트 세팅 ( change )
			setPreSaleDate($start_time, preSaleDateCallback,'start');
			setPreSaleDate($end_time, preSaleDateCallback,'end');

			// 판매 기간 버튼 클릭 시 이벤트 처리
			$pre_sale_simple_day.on('click', function(e) {
				isBtnClick = true;

				var $that = $(this);
				var day = $that.data('day');

				$that.siblings().removeClass('btn-primary').addClass('btn-default-bright');
				$that.removeClass('btn-default-bright').addClass('btn-primary');

				var start_date = $start_time.val();
				if ( start_date.length == 0 ) {
					$start_time.data('DateTimePicker').date(moment());
				}

				var m = moment($start_time.val());
				m.add('day', day);
				$end_time.data('DateTimePicker').date(m);
				isBtnClick = false;
			});
		})();
	};

	var setUseRelativeOptionPrice = function(unit_code, bool) {
		use_relative_option_price[unit_code] = bool;
	};

	var getUseRelativeOptionPrice = function(unit_code) {
		return ( use_relative_option_price[unit_code] == void 0 ? false : use_relative_option_price[unit_code] );
	};

	var changeOptionPriceMark = function(unit_code, opt_code) {
		var $_opt_price = $("._option_price[data-unitcode='" + unit_code + "'][data-optcode='" + opt_code + "']");
		var thousand_char = $_opt_price.data('thousand-char');

		updateOptionPrice(unit_code, opt_code, $_opt_price.val().replace(thousand_char,''));
	};

	/**
	 * 연관상품 목록 출력
	 * @param checked
	 */
	var showProdRelativeListWrap = function(checked){
		var $prod_relative_list_wrap = $('._prod_relative_list_wrap');
		if(checked === 'Y'){
			$prod_relative_list_wrap.show();
		}else{
			$prod_relative_list_wrap.hide();
		}
	};

	/**
	 * 연관상품 상품추가 모달 열기
	 */
	var showAddProdRelativeModal = function(){
		if(prod_relative_data_list_cnt == prod_relative_max_limit){
			alert(getLocalizeString("설명_연관상품은최대n개까지설정가능합니다",prod_relative_max_limit, "연관상품은 최대 %1개까지 설정 가능합니다."));
			return false;
		}
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/shop/open_add_prod_relative_modal.cm'),
			dataType: 'json',
			success: function(res){
				if(res.msg == 'SUCCESS'){
					$.cocoaDialog.open({type: 'admin_add_prod_relative_modal', custom_popup: res.html});
				}else{
					alert(res.msg);
				}
			}
		});
	};

	/**
	 * 연관상품 상품추가 모달 내 검색 결과 출력
	 * @param keyword
	 * @param current_paging_no
	 */
	var searchProdRelative = function(keyword, current_paging_no){
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/shop/get_prod_relative_search_list.cm'),
			data: {'keyword': keyword, 'current_paging_no': current_paging_no, 'prod_code_org': prod_code_org, 'prod_relative_data_list': prod_relative_data_list},
			dataType: 'json',
			success: function(res){
				if(res.msg == 'SUCCESS'){
					var $modal_admin_add_prod_relative_modal = $('.modal_admin_add_prod_relative_modal');
					$modal_admin_add_prod_relative_modal.find('#product_search_list').html(res.html);
					$modal_admin_add_prod_relative_modal.find('#prod_list_paging').html(res.html_paging);
				}else{
					alert(res.msg);
				}
			}
		});
	};

	/**
	 * 연관상품 상품추가 모달 내 상품 선택
	 * @param prod_code
	 */
	var selectProdRelativeData = function(prod_code){
		if(prod_code == prod_code_org){
			alert(getLocalizeString("설명_현재상품입니다", "", "현재 상품입니다."));
			return false;
		}

		if(prod_relative_data_list[prod_code] != undefined && prod_relative_data_list[prod_code].mode != 'delete'){
			alert(getLocalizeString("설명_이미선택된상품입니다", "", "이미 선택된 상품입니다."));
			return false;
		}

		addProdRelativeData(prod_code);
	};

	/**
	 * 연관상품 상품추가시 html, 데이터를 가공
	 * @param prod_code
	 */
	var addProdRelativeData = function(prod_code){
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/shop/add_prod_relative_data.cm'),
			data: {'prod_code': prod_code, 'prod_code_org': prod_code_org, 'prod_relative_data_list': prod_relative_data_list},
			dataType: 'json',
			success: function(res){
				if(res.msg == 'SUCCESS'){
					var $prod_relative_list_item_wrap = $('._prod_relative_list_item_wrap');
					$prod_relative_list_item_wrap.append(res.html);
					prod_relative_data_list_cnt++;
					prod_relative_data_list[res.code] = {'is_mutual': '1', 'is_mutual_org': res.is_mutual_org ? '1' : '', 'sort_no': prod_relative_data_list_cnt, 'mode': res.mode};

					$('._prod_relative_list_empty_wrap').hide();

					var $item_btn = $('.modal_admin_add_prod_relative_modal').find('._prod_code_' + prod_code).find('._btn_select');
					$item_btn.text(getLocalizeString("설명_선택", "", "선택"));
					$item_btn.toggleClass('btn-default-bright');
					$item_btn.toggleClass('btn-primary disabled');
					header_ctl.change();
				}else{
					alert(res.msg);
				}
			}
		});
	};

	/**
	 * 연관상품 삭제
	 */
	var deleteProdRelativeData = function(){
		if(prod_relative_checked_code_list.length == 0){
			alert(getLocalizeString("설명_선택하신상품이없습니다상품을선택", "", "선택하신 상품이 없습니다. 상품을 선택해 주세요."));
			return;
		}

		if(confirm(getLocalizeString("설명_선택하신상품을연관상품에서삭제", "", "선택하신 상품을 연관상품에서 삭제하시겠습니까? 실제 상품은 삭제되지 않습니다."))){
			$prod_relative_list_item_wrap.find('tr[data-id="prod_relative_item"]').each(function(k, v){
				var prod_code_temp = $(v).attr('data-code');
				if(prod_relative_checked_code_list.indexOf(prod_code_temp) !== -1){
					var no = findProdRelativeItemNo(prod_code_temp);

					prod_relative_checked_code_list.splice(no, 1);
					$(v).remove();
					prod_relative_data_list[prod_code_temp].mode = 'delete';
					prod_relative_data_list_cnt--;
				}
			});

			updateProdRelativeItemSortNo();
			checkProdRelativeItemAll(false);
			$('._prod_relative_check_all').prop('checked', false);
			if($prod_relative_list_item_wrap.find('tr[data-id="prod_relative_item"]').length == 0) $('._prod_relative_list_empty_wrap').show();
		}
	};

	/**
	 * 연관상품 임시배열에서 prod_code 해당하는 요소의 순서를 반환
	 * @param prod_code
	 */
	var findProdRelativeItemNo = function(prod_code){
		for(var i = 0; i < prod_relative_checked_code_list.length; i++){
			if(prod_relative_checked_code_list[i] == prod_code) return i;
		}

		return -1;
	}

	/**
	 * 연관상품 체크박스 클릭
	 */
	var checkProdRelativeItem = function(checked, prod_code){
		if(checked){
			prod_relative_checked_code_list.push(prod_code);
		}else{
			var no = findProdRelativeItemNo(prod_code);
			prod_relative_checked_code_list.splice(no, 1);
		}
	};

	/**
	 * 연관상품 체크박스 전체선택
	 */
	var checkProdRelativeItemAll = function(checked){

		var $prod_relative_check = $('._prod_relative_check');
		prod_relative_checked_code_list = [];
		if(checked){
			$prod_relative_list_item_wrap.find('tr[data-id="prod_relative_item"]').each(function(k, v){
				prod_relative_checked_code_list.push($(v).attr('data-code'));
			});
			$prod_relative_check.prop('checked', true);
		}else{
			$prod_relative_check.prop('checked', false);
		}
	};

	/**
	 * 연관상품 정렬순서를 재정렬시킴
	 */
	var updateProdRelativeItemSortNo = function(){
		var sort_no_temp = 1;
		$prod_relative_list_item_wrap.find('tr[data-id="prod_relative_item"]').each(function(k, v){
			var prod_code_temp = $(v).attr('data-code');
			if(prod_relative_data_list[prod_code_temp].mode == 'delete') return true;

			prod_relative_data_list[prod_code_temp].sort_no = sort_no_temp;
			if(prod_relative_data_list[prod_code_temp].mode != 'add') prod_relative_data_list[prod_code_temp].mode = 'edit';

			sort_no_temp++;
		});
	};

	/**
	 * 연관상품 연동 방식 변경
	 */
	var changeProdRelativeMutual = function(v, prod_code){
		prod_relative_data_list[prod_code].is_mutual = v == 'Y' ? '1' : '';
		if(prod_relative_data_list[prod_code].mode != 'add') prod_relative_data_list[prod_code].mode = 'edit';

		$prod_relative_list_item_wrap.find('tr[data-code="' + prod_code + '"]').attr('data-mutual-type', v == 'Y' ? '1' : '');
	}

	/**
	 * 연관상품 체크된 상품 연동 방식 변경
	 */
	var changeProdRelativeMutualCheck = function(){
		if(prod_relative_checked_code_list.length == 0){
			alert(getLocalizeString("설명_선택하신상품이없습니다상품을선택", "", "선택하신 상품이 없습니다. 상품을 선택해 주세요."));
			return;
		}

		$prod_relative_list_item_wrap.find('tr[data-id="prod_relative_item"]').each(function(k, v){
			var prod_code_temp = $(v).attr('data-code');
			if(prod_relative_checked_code_list.indexOf(prod_code_temp) !== -1){
				changeProdRelativeMutual($(v).attr('data-mutual-type') == '1' ? 'N' : 'Y', prod_code_temp);

				if($(v).attr('data-mutual-type') == '1'){
					$(v).find('#is_mutual').val('Y').prop('selected', true);
				}else{
					$(v).find('#is_mutual').val('N').prop('selected', true);
				}
			}
		});

		checkProdRelativeItemAll(false);
		$('._prod_relative_check_all').prop('checked', false);
	}

	/**
	 * 상품 수정페이지 진입시 연관상품 관련 데이터를 세팅
	 */
	var initProdRelative = function(prod_code){
		prod_code_org = prod_code;
		$prod_relative_list_item_wrap = $('._prod_relative_list_item_wrap');


		$prod_relative_list_item_wrap.sortable({		// 드래그로 순서 변경
			update: function(event,ui){
				updateProdRelativeItemSortNo();
				header_ctl.change();
			},
			start: function(event, ui){
			},
			stop: function(event, ui){
			}
		});

		prod_relative_data_list_cnt = 0;
		$prod_relative_list_item_wrap.find('tr[data-id="prod_relative_item"]').each(function(k, v){
			prod_relative_data_list_cnt++;
			prod_relative_data_list[$(v).attr('data-code')] = {'is_mutual': $(v).attr('data-mutual-type'), 'is_mutual_org': $(v).attr('data-mutual-type'), 'sort_no': prod_relative_data_list_cnt, 'mode': 'none'};
		});
	};

	var openModalProdExcelDownload = function(category){
		$.ajax({
			type: 'POST',
			data : {category : category},
			url: ('/admin/ajax/shop/open_download_excel_prod_list.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg === 'SUCCESS'){
					$.cocoaDialog.open({type : 'admin_prod_excel_download', custom_popup : res.html, width : 550});
				}else{
					alert(res.msg);
				}
			}
		});
	};

	/**
	 * 상품 다운로드 모달 - 상품 파일 언어가 바뀌었을 때 상품 배송국가 셀렉트박스 초기화
	 * @param string code
	 */
	var ProdExcelDownloadModalChangeUnit = function(code){
		$.ajax({
			type: 'POST',
			data : {"code" : code},
			url: ('/admin/ajax/shop/get_unit_deliv_country_list.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if ( res['msg'] == 'SUCCESS' ) {
					var option_html = '';
					for ( var _country in res['data']) {
						option_html += '<option value="'+_country+'">'+res['data'][_country]+'</option>';
					}
					$('._excel_deliv_country').html(option_html);
				}
			}
		});
	};

	var runProdExcelMake = function(type,category){
		var $dashboard_loader_sub = $('#dashboard_loader_sub');
		var excel_lang_type = $('._excel_lang_type').val();
		var excel_deliv_country = $('._excel_deliv_country').val();

		if (excel_deliv_country.trim() == '') {
			alert(getLocalizeString('설명_상품배송국가를선택해주세요','','상품 배송국가를 선택해 주세요.'));
			return false;
		}

		$.ajax({
			type: 'GET',
			data: {'status' : type, 'lang' : excel_lang_type, 'category' : category, 'deliv_country': excel_deliv_country},
			url: '/admin/ajax/shop/request_excel_prod_list.cm',
			dataType: 'json',
			cache: false,
			beforeSend : function() {
				$dashboard_loader_sub.show();
			},
			success: function (res) {
				if ( res.msg == 'SUCCESS' ) {
					var interval = setInterval(function(){
						$dashboard_loader_sub.hide();
						loadExcelList();
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
	};

	var loadExcelList = function(){
		$.ajax({
			type : 'POST',
			url : ('/admin/ajax/shop/get_excel_prod_list.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					$('.modal_admin_prod_excel_download').find('._excel_empty_wrap').hide();
					$('.modal_admin_prod_excel_download').find('#_excel_list_body').html(res.html);
				}else{
					$('.modal_admin_prod_excel_download').find('#_excel_list_body').empty();
					$('.modal_admin_prod_excel_download').find('._excel_empty_wrap').show();
				}
			}
		});
	};

	var deleteProdExcel = function(idx){
		if(confirm(getLocalizeString("설명_삭제하시겠습니까", "", "삭제하시겠습니까?"))){
			$.ajax({
				type: 'POST',
				data: {'idx': idx},
				url: ('/admin/ajax/shop/delete_excel_prod.cm'),
				dataType: 'json',
				async: false,
				cache: false,
				success: function(res){
					if(res.msg == 'SUCCESS'){
						loadExcelList();
					}else{
						alert(res.msg);
					}
				}
			});
		}
	};

	var changed_optional_limit_type = function(value) {
		if ( value == 'limit' ) {
			$optional_limit.show();
		} else {
			$optional_limit.hide();
		}
	};

	var openShopProdInfoform = function(no){
		$.ajax({
			type : 'POST',
			data : {"no": no, "data": prodinfoarr},
			url : ('/admin/shopping/product/prod_info_form.cm'),
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				$.cocoaDialog.open({type : 'admin_prod_info_form', custom_popup : html});
			}
		});
	};

	return {
		getHeaderCtl : function() {
			return header_ctl;
		},
		openManual : function(type){
			openManual(type);
		},
		initAdd : function(type,idx,unit_code,$deliv_list,regularly_exist){
			initAdd(type,idx,unit_code,$deliv_list,regularly_exist);
		},
		getCategoryDropdown : function(unit_code,list){
			return getCategoryDropdown(unit_code,list);
		},
		imageUploadComplete : function(code,url) {
			imageUploadComplete(code, url);
		},
		loadCategoryList : function(callback,reload,type) {
			loadCategoryList(callback,reload,type);
		},
		searchCategoryTree : function(keyword) {
			filterCategoryTree(keyword);
			updateCategoryList();
		},
		openCategoryManage : function(type){
			openCategoryManage(type);
		},
		changeCategoryName : function(unit_code,code,name){
			changeCategoryName(unit_code,code,name, function(){
				loadCategoryManage(false);
				//setSelectCategory(code);
			});
		},
		changeCategoryPermission : function(code,permission){
			changeCategoryPermission(code, permission, function(){
				loadCategoryManage(false);
			});
		},
		changeCategoryPermissionGroup : function(code){
			changeCategoryPermissionGroup(code);
		},
		setCategoryNameEditMode : function (mode){
			setCategoryNameEditMode(mode);
		},
		getSelectedCategoryCode : function(){
			return selected_category_code;
		},
		setSelectCategory : function (code){
			setSelectCategory(code);
		},
		saveCategoryManage : function (type){
			saveCategoryManage(type);
		},
		removeCategory : function (code){
			removeCategory(code, function(){
				loadCategoryManage(false);
			});

		},
		addCategory : function (){
			addCategory('', function(code){
				loadCategoryManage(false);
				setSelectCategory(code);
				/* 카테고리입력방식변경 setCategoryNameEditMode(code,true);*/
			});
		},
		selectProdCategory : function(categoryCode, check, reloadDisplay){
			selectProdCategory(categoryCode,check, reloadDisplay);
		},
		removeProdCategory : function(categoryCode){
			removeProdCategory(categoryCode, function(){
				showProdCategory();
				header_ctl.change();
			});
		},
		showProdCategory : function(){
			showProdCategory();
		},
		deleteImageUpload : function(code){
			deleteImageUpload(code);
		},
		addEmptyOption : function() {
			addEmptyOption();
		},
		addEmptyUserInputOption : function() {
			addEmptyUserInputOption();
		},
		addEmptyCalculationOption : function() {
			addEmptyCalculationOption();
		},
		updateOptionName : function(unit_code,code, name){
			updateOptionName(unit_code, code, name);
			var o = $('#prod_option_list_' + code);
			var option_value = $.trim(o.find('input._option_value').val());
			if (option_value != ''){
				updateOptionValue(unit_code, code, option_value);
			}
		},
		updateOptionValue : function(unit_code, code, value){
			updateOptionValue(unit_code, code, value);
		},
		updateOptionRequire : function(code, is_require){
			return updateOptionRequire(code,is_require);
		},
		updateOptionsType : function(type,reload, check_confirm){
			return updateOptionsType(type,reload, check_confirm);
		},
		updateOptionPrice : function(unit_code, value_code_list, price){
			updateOptionPrice(unit_code, value_code_list, price);
		},
		updateOptionStock : function(value_code_list, stock){
			updateOptionStock(value_code_list, stock);
		},
		updateOptionStockList : function(){
			updateOptionStockList();
		},
		updateOptionSKU : function(value_code_list, sku){
			updateOptionSKU(value_code_list, sku);
		},
		updateOptionStatus : function(value_code_list, status){
			updateOptionStatus(value_code_list, status);
		},
		updateProdPrice : function(unit_code,price){
			updateProdPrice(unit_code,price);
		},
		updateStockUse : function(is_use,reload){
			updateStockUse(is_use,reload);
		},
		updateUserInputMsg : function(code, value){
			updateUserInputMsg(code,value);
		},
		loadOptionData: function(prod_code){
			loadOptionData(prod_code);
		},
		removeOptionData: function(code){
			return removeOptionData(code);
		},
		toggleOptionWrap : function(){
			toggleOptionWrap();
		},
		openOtherProdOptionImportModal: function(){
			openOtherProdOptionImportModal();
		},
		openNaverCategoryList: function(){
			openNaverCategoryList();
		},
		searchProd: function(keyword, current_paging_no){
			searchProd(keyword, current_paging_no);
		},
		searchNaverCategory: function(keyword, current_paging_no, callback){
			searchNaverCategory(keyword, current_paging_no, callback);
		},
		getOtherProdOption: function(prod_code){
			getOtherProdOption(prod_code);
		},
		selectNaverCategoryId: function(category_id){
			selectNaverCategoryId(category_id);
		},
		showOptionWrap : function(){
			showOptionWrap();
		},
		hideOptionWrap : function(){
			hideOptionWrap();
		},
		optionSetAllSelect : function(chk, is_require) {
			optionSetAllSelect(chk, is_require);
		},
		optionSetSelect : function(no, is_require) {
			optionSetSelect(no, is_require);
		},
		optionSetValue : function(is_require){
			optionSetValue(is_require);
		},
		showMultiProdAdd: function(){
			showMultiProdAdd();
		},
		showCategoryCode: function(){
			showCategoryCode();
		},
		delivTypeListChange : function(type){
			delivTypeListChange(type);
		},
		makeFileList : function(file_name,file_size){
			makeFileList(file_name,file_size);
		},
		"openShopProdInfoform": function(no){
			openShopProdInfoform(no);
		},
		// 상품정보제공고시 임시저장
		setProdinfo : function (prodinfo) {
			prodinfoarr = prodinfo;
			$('#infoformspan').html(prodinfoarr.product);
			header_ctl.change(); // 저장버튼 활성화
		},
		getProdinfo : function () {
			return prodinfoarr;
		},
		delivGuidTypeChange : function(type, unit_code){
			return delivGuidTypeChange(type, unit_code);
		},
		changeProdPriceNone : function (chk){
			return changeProdPriceNone(chk);
		},
		loadLocalizeEditor : function(editor_id, unit_code){
			return loadLocalizeEditor(editor_id, unit_code);
		},
		loadLocalizeHeader : function(type,unit_code){
			return loadLocalizeHeader(type,unit_code);
		},
		changeLocalizeEditor : function(editor_id, unit_code){
			return changeLocalizeEditor(editor_id, unit_code);
		},
		addUnitData : function(unit_code, lang_code, currency_char, thousand_char, decimal_char, decimal_count,currency_code){
			return addUnitData(unit_code, lang_code, currency_char, thousand_char, decimal_char, decimal_count,currency_code);
		},
		getUnitData : function(unit_code){
			return getUnitData(unit_code);
		},
		setDefaultUnitCode : function(unit_code){
			default_unit_code = unit_code;
		},
		setCurrentUnitCode : function(unit_code){
			current_unit_code = unit_code;
		},
		changeGivePointValue : function(unit_code) {
			changeGivePointValue(unit_code);
		},
		changeGivePointValueType : function(type,unit_code,mode){
			changeGivePointValueType(type,unit_code,mode);
		},
		changeDiscountValueType : function(type,unit_code,key){
			changeDiscountValueType(type,unit_code,key);
		},
		openShopDelivForm : function(idx,unit_code){
			return openShopDelivForm(idx,unit_code);
		},
		"updateDelivSetting": function($data){
			updateDelivSetting($data);
		},
		delivUseChange : function(type, idx, unit_code){
			return delivUseChange(type, idx, unit_code);
		},
		delivFormMake : function(idx, unit_code){
			return delivFormMake(idx, unit_code);
		},
		discountFormMake : function(unit_code, mode){
			return discountFormMake(unit_code, mode);
		},
		checkDcAmount : function(obj){
			return checkDcAmount(obj);
		},
		addDiscountTargetFormSetting : function(){
			return addDiscountTargetFormSetting();
		},
		showMemberGroupDropdownSetting : function(key){
			return showMemberGroupDropdownSetting(key);
		},
		initDiscountSetting : function(){
			return initDiscountSetting();
		},
		showMemberGroupDropdown : function(unit_code, key){
			return showMemberGroupDropdown(unit_code, key);
		},
		changeMemberGroupDropdown : function(){
			return changeMemberGroupDropdown();
		},
		addDiscountTargetForm : function(unit_code){
			return addDiscountTargetForm(unit_code);
		},
		removeDiscountTargetForm : function(key){
			return removeDiscountTargetForm(key);
		},
		checkPeriodDiscount : function(unit_code){
			return checkPeriodDiscount(unit_code);
		},
		saveProdDiscountManage: function($form) {
			saveProdDiscountManage($form);
		},
		checkEmptyOptionNameExist : function(){
			return checkEmptyOptionNameExist();
		},
		checkEmptyOptionValueExist : function(){
			return checkEmptyOptionValueExist();
		},
		"changeProdType": function(){
			changeProdType();
		},
		"changeUseDownloadLimit": function(b){
			changeUseDownloadLimit(b);
		},
		"getDigitalProdDownloadList": function(keyword, current_page){
			getDigitalProdDownloadList(keyword, current_page);
		},

		setSubmitCallback : function(callback) {
			product_submit_callback = callback || void 0;
		},
		checkSubmitCallback : function() {
			return (
				typeof product_submit_callback == 'function'
					?   product_submit_callback.call(this)
					:   true
			);
		},
		loadCategoryModifyManageList: function() {
			return loadCategoryModifyManageList('', '', 1);
		},
		saveCategoryModifyManageList: function() {
			saveCategoryModifyManageList();
		},
		saveProdPriceModify: function() {
			saveProdPriceModify();
		},
		checkCustomProdCode : function(obj) {
			// blur, change 등 이벤트가 중복으로 여러번 호출될 수 있어서 timeout 으로 중복 발생 제거.
			if ( timer_checkCustomProdCode ) {
				clearTimeout(timer_checkCustomProdCode);
				timer_checkCustomProdCode = 0;
			}

			timer_checkCustomProdCode = setTimeout(function() { checkCustomProdCode(obj); }, 100);
		},
		preSaleUseChange : function(checked) {
			preSaleUseChange(checked);
		},
		initPreSale : function($_form) {
			initPreSale($_form);
		},
		saveProdPreSaleManage: function($form) {
			saveProdPreSaleManage($form);
		},
		changeMobileContentStatus : function(type){
			changeMobileContentStatus(type);
		},
		setUseRelativeOptionPrice : function(unit_code, bool) {
			setUseRelativeOptionPrice(unit_code, bool);
		},
		getUseRelativeOptionPrice : function(unit_code) {
			return getUseRelativeOptionPrice(unit_code);
		},
		changeOptionPriceMark : function(unit_code, opt_code) {
			changeOptionPriceMark(unit_code, opt_code);
		},
		showProdRelativeListWrap: function(checked){
			showProdRelativeListWrap(checked);
		},
		showAddProdRelativeModal: function(){
			showAddProdRelativeModal();
		},
		searchProdRelative: function(keyword, current_paging_no){
			searchProdRelative(keyword, current_paging_no);
		},
		selectProdRelativeData: function(prod_code){
			selectProdRelativeData(prod_code);
		},
		deleteProdRelativeData: function(){
			deleteProdRelativeData();
		},
		checkProdRelativeItem: function(checked, prod_code){
			checkProdRelativeItem(checked, prod_code);
		},
		checkProdRelativeItemAll: function(checked){
			checkProdRelativeItemAll(checked);
		},
		updateProdRelativeItemSortNo: function(){
			updateProdRelativeItemSortNo()
		},
		changeProdRelativeMutual: function(v, prod_code){
			changeProdRelativeMutual(v, prod_code);
		},
		changeProdRelativeMutualCheck: function(){
			changeProdRelativeMutualCheck();
		},
		initProdRelative: function(prod_code){
			initProdRelative(prod_code);
		},
		openModalProdExcelDownload : function(category){
			openModalProdExcelDownload(category);
		},
		"ProdExcelDownloadModalChangeUnit": function(code){
			ProdExcelDownloadModalChangeUnit(code);
		},
		runProdExcelMake : function(type,category){
			runProdExcelMake(type,category);
		},
		loadExcelList : function(){
			loadExcelList();
		},
		deleteProdExcel : function(idx){
			deleteProdExcel(idx);
		},
		changed_optional_limit_type : function(value) {
			changed_optional_limit_type(value);
		},
		changeProdExchangeRatePrice : function(type,from_unit_code,target_unit_code){
			changeProdExchangeRatePrice(type,from_unit_code,target_unit_code);
		},
		deleteProdPurchaseData : function(prod_code){
			deleteProdPurchaseData(prod_code);
		},
		resetProdPurchaseData : function(prod_code){
			resetProdPurchaseData(prod_code);
		}
	}
}();

var SHOP_OPTION_MANAGE = function() {
	var that = this;
	var CONST = {
		OPTION_TYPE_DEFAULT: 'default',
		OPTION_TYPE_INPUT: 'input',
		OPTION_TYPE_COLOR: 'color',
		OPTION_TYPE_IMAGE: 'image',
		OPTION_TYPE_QUOTATION: 'quotation',
	};

	var default_config = { /* 기본 설정 */
		'prod_code': '',
		'option_prefix' : '',
		'max_input_length' : 20,
		'max_option_length' : null,
		'regularly_option_edit' : 'N' //정기구독 사용 상품은 옵션 수정 불가
	};

	var $_prod_add_form = null;
	var $_prod_price_none = null;
	var $_prod_price_wrap = null;
	var $_prod_stock_wrap = null;
	var $_prod_stock_no_option_wrap = null;
	var $_prod_option_card_wrap = null;
	var $_prod_option_wrap = null;
	var $_prod_option_list = null;
	var $_prod_option_detail_require_wrap = null;
	var $_prod_option_detail_require = null;
	var $_prod_option_detail_optional_wrap = null;
	var $_prod_option_detail_require_list;
	var $_prod_option_detail_optional_list;


	var $_global_div;
	/* var global_input_text_width = null; */

	var is_max_length = {"require": false, "optional": false};
	var is_option_error = {"require": false, "optional": false};
	var last_option_error_msg = '';
	var is_option_changed = false;
	var is_prod_price_changed = false;
	var regularly_option_edit = true;

	var template_list = [];

	var config;
	var is_debug_mode = false;

	var header_ctl;

	var is_repainting_require = false;
	var is_repainting_optional = false;

	var init = function(init_config) {
		debugConsole(arguments.callee.name, arguments);

		config = $.extend({}, default_config, init_config);
		if(config.regularly_option_edit == 'Y') regularly_option_edit = false;

		header_ctl = SHOP_PROD_MANAGE.getHeaderCtl();

		/* dom 세팅 */
		$_prod_add_form = $("#prod_add");
		$_prod_price_none = $("#inputPriceNone");
		$_prod_option_card_wrap = $("#prodOptionCardWrap");
		$_prod_price_wrap = $("#prodPriceWrap");
		$_prod_stock_wrap = $("#prodStockWrap");
		$_prod_stock_no_option_wrap = $("#stock_no_option_wrap");
		$_prod_option_wrap = $("#prod_option_wrap");
		$_prod_option_list = $("#prod_option_list");
		$_prod_option_detail_require_wrap = $("#prod_option_detail_require_wrap");
		$_prod_option_detail_require = $("#prod_option_detail_require");
		$_prod_option_detail_require_list = $("#prod_option_detail_require_list");
		$_prod_option_detail_optional_wrap = $("#prod_option_detail_optional_wrap");
		$_prod_option_detail_optional_list = $("#prod_option_detail_optional_list");

		if(config.regularly_option_edit == 'Y'){
			$(function(){
				$_prod_option_list.find('input._option_name').attr("readonly", "readonly");
				$_prod_option_list.find('select._option_type').attr("disabled", "disabled");
			});
		}

		/* 폼 데이터 변경 감지 */
		$_prod_add_form.on('change', callbackChangeAddForm);

		/* 옵션 타입 변경 */
		$_prod_option_list.off('change', 'select._option_type').on('change', 'select._option_type', callbackChangeOptionType);

		/* 옵션 이름 변경 */
		$_prod_option_list.off('change', 'input._option_name:not([data-type="input"])').on('change', 'input._option_name:not([data-type="input"])', callbackChangeOptionName);

		/* 필수 여부 체크박스 */
		$_prod_option_wrap.off('click', '._btn_require').on('click', '._btn_require', callbackClickOptionRequire);
		$_prod_option_wrap.off('change', '._btn_require').on('change', '._btn_require', callbackChangeOptionRequire);

		/* color picker 수정창 */
		$_prod_option_wrap.off('click', '._color').on('click', '._color', callbackOpenColorForm);

		/* 입력형 옵션 - 글자 수 체크... */
		$_prod_option_list.off('change', '[data-type="input"] ._option_name').on('change', '[data-type="input"] ._option_name', callbackChangeInputName);

		/* 추가 - 옵션값 변경 */
		$_prod_option_wrap.off('change', '._option_value').on('change', '._option_value', callbackChangeInputOptionValue);
		// $_prod_option_wrap.off('blur', '._option_value').on('blur', '._option_value', callbackChangeInputOptionValue);
		$_prod_option_wrap.off('keydown', '._option_value').on('keydown', '._option_value', callbackKeydownInputOptionValue);
		$_prod_option_wrap.off('keyup', '._option_value').on('keyup', '._option_value', refreshInputOptionValueSize);

		/* 옵션 삭제 버튼 */
		$_prod_option_wrap.off('click', '._btn_remove').on('click', '._btn_remove', callbackClickRemoveOption);

		/* 옵션값 붙여넣기... 기본 옵션 타입만 해당 */
		$_prod_option_wrap.off('paste', '._value_name[data-type]').on('paste', '._value_name[data-type]', callbackPasteOptionValue);

		/* 옵션값 - 모드 변경 */
		$_prod_option_wrap.off('click', '.value-item').on('click', '.value-item', callbackClickOptionValue);
		$_prod_option_wrap.off('focusout', '.value-item[data-mode="edit"] ._value_name').on('focusout', '.value-item[data-mode="edit"] ._value_name', callbackBlurOptionValue);

		/* 옵션값 수정 -> 적용 */
		$_prod_option_wrap.off('keydown blur', '._value_name[data-type]').on('keydown blur', '._value_name[data-type]', callbackChangeOptionValue);

		/* 옵션값 삭제 버튼 */
		$_prod_option_wrap.off('click', '._btn_remove_value').on('click', '._btn_remove_value', callbackClickRemoveOptionValue);

		/* 조합형 옵션 체크박스 */
		$_prod_option_wrap.off('click', '._btn_option_mix').on('click', '._btn_option_mix', callbackClickOptionMix);
		$_prod_option_wrap.off('change', '._btn_option_mix').on('change', '._btn_option_mix', callbackChangeOptionMix);

		/* 필수옵션 - 상품가 변경 관련 */
		$_prod_option_detail_require_list.off('change', '._option_price').on('change', '._option_price', function() { header_ctl.change(); });
		$_prod_option_detail_require_list.off('blur', '._option_price').on('blur', '._option_price', function() { is_option_changed = true; }); // @TODO 임시처리, 숫자 라이브러리에서 붙여넣기 했을 때 변경 이벤트가 먹지 않음... jissp
		$_prod_option_detail_require_list.off('change', '._opt_price_mark').on('change', '._opt_price_mark', function() { callbackChangeSelectBox.apply(this); header_ctl.change(); });

		/* 선택옵션 - 상품가 변경 관련 */
		$_prod_option_detail_optional_list.off('change', '._option_price').on('change', '._option_price', callbackChangeOptionalOptionPrice);
		$_prod_option_detail_optional_list.off('blur', '._option_price').on('blur', '._option_price', function() { is_option_changed = true; }); // @TODO 임시처리, 숫자 라이브러리에서 붙여넣기 했을 때 변경 이벤트가 먹지 않음... jissp
		$_prod_option_detail_optional_list.off('change', '._opt_price_mark').on('change', '._opt_price_mark', function() { callbackChangeSelectBox.apply(this); header_ctl.change(); });

		/* 옵션 - 재고 관련 */
		$_prod_option_wrap.off('change', '._input_stock').on('change', '._input_stock', function() { header_ctl.change(); });
		$_prod_option_wrap.off('change', '._input_stock_sku').on('change', '._input_stock_sku', function() { header_ctl.change(); });

		/* 옵션 전체 선택 */
		$_prod_option_wrap.off('change', '._check_all_check').on('change', '._check_all_check', callbackCheckedAllOptionItem);
		/* 옵션 개별 선택 */
		$_prod_option_wrap.off('change', '._option_check_item').on('change', '._option_check_item', callbackCheckedOptionItem);

		/* 옵션 - 상태 변경 */
		$_prod_option_wrap.off('change', '._option_status').on('change', '._option_status', function() { callbackChangeSelectBox.apply(this); header_ctl.change(); });

		/* 옵션 - 일괄수정 상태 변경 */
		$_prod_option_wrap.off('change', '._option_status_multi').on('change', '._option_status_multi', function() { callbackChangeSelectBox.apply(this); });

		/* 일괄 수정 버튼 클릭 */
		$_prod_option_wrap.off('click', '._btn_change_all').on('click', '._btn_change_all', callbackClickAllOptionModifyBtn);

		/* 재고관리 값 변경 */
		$_prod_stock_wrap.off('change', '._select_stock_use').on('change', '._select_stock_use', function() {
			callbackChangeSelectBox.apply(this);
			$_prod_option_wrap.toggleClass('_not_use_stock', (this.value == 'N') );
			$_prod_stock_wrap.attr('data-usestock', this.value);
			$('#stock_unlimit_wrap').toggle(this.value == 'Y');
		});

		/* 옵션 입력 항목 placeholder 문구 사이즈 */
		/*
		$_global_div = $('<span style="display: none; width: auto;" class="form-control"/>');
		$_global_div.text(LOCALIZE_ADMIN.설명_엔터또는tab키를이용해연속입력());
		$_prod_option_wrap.append($_global_div);
		 global_input_text_width = $_global_div.width();
		 */
	};

	var callbackVoid0 = function(evt) {
		debugConsole(arguments.callee.name, arguments);
		evt.stopPropagation();
		return false;
	};

	var callbackPasteOptionValue = function(evt) {
		debugConsole(arguments.callee.name, arguments);
		if(!regularly_option_edit){
			alert(getLocalizeString("설명_정기구독신청내역이있는경우옵션수정이불가능합니다", "", "정기구독 신청 내역이 있는 경우 옵션 가격/재고번호/상태를 제외한 옵션 수정 및 추가, 삭제는 불가합니다.") );
			return false;
		}
		evt.preventDefault();

		/* 복사한 데이터가 있다면... 일반 input text 에 들어가던 양식으로 변환해서 붙여넣기 처리... 잘 될까...? */
		var txt = '';
		var clipboardData = (evt.originalEvent || window || evt).clipboardData;
		if ( !! clipboardData ) {
			var $_input = $('<input type="text" />');
			$_input.val(clipboardData.getData('Text'));
			txt = $_input.val();
		}

		// , 는 제거
		txt = txt.replace(/,/g, '');
		window.document.execCommand('insertHTML', false, txt);
	};

	var callbackClickOptionMix = function(evt) {
		if(!regularly_option_edit){
			alert(getLocalizeString("설명_정기구독신청내역이있는경우옵션수정이불가능합니다", "", "정기구독 신청 내역이 있는 경우 옵션 가격/재고번호/상태를 제외한 옵션 수정 및 추가, 삭제는 불가합니다.") );
			return false;
		}
		if ( !confirm(getLocalizeString("설명_옵션가격및재고가초기화됩니다", "", "옵션 가격 및 재고가 초기화 됩니다 그래도 진행하시겠습니까")) ) {
			callbackVoid0(evt);
			return false;
		}
	};

	var callbackChangeOptionMix = function() {
		debugConsole(arguments.callee.name, arguments);
		if(!regularly_option_edit){
			alert(getLocalizeString("설명_정기구독신청내역이있는경우옵션수정이불가능합니다", "", "정기구독 신청 내역이 있는 경우 옵션 가격/재고번호/상태를 제외한 옵션 수정 및 추가, 삭제는 불가합니다.") );
			return false;
		}
		repaintOption(true);
	};

	var callbackClickOptionRequire = function(evt) {
		if(!regularly_option_edit){
			alert(getLocalizeString("설명_정기구독신청내역이있는경우옵션수정이불가능합니다", "", "정기구독 신청 내역이 있는 경우 옵션 가격/재고번호/상태를 제외한 옵션 수정 및 추가, 삭제는 불가합니다.") );
			return false;
		}
		var $_that = $(this);

		/* 필수 / 선택 변환시킨 옵션의 가격이 초기화되므로 조합형 체크 여부는 확인하지 않는다. */
		/* if ( $_prod_option_detail_require_wrap.find('._btn_option_mix').prop('checked') ) {
		} */

		var opt_code = $_that.data('optcode');
		var _value_item_list = $_prod_option_list.find('.value-item[data-optcode="' + opt_code + '"]');

		if ( _value_item_list.length > 0 && !confirm(getLocalizeString("설명_옵션가격및재고가초기화됩니다", "", "옵션 가격 및 재고가 초기화 됩니다 그래도 진행하시겠습니까")) ) {
			callbackVoid0(evt);
			return false;
		}
	};

	var callbackChangeOptionRequire = function() {
		debugConsole(arguments.callee.name, arguments);
		if(!regularly_option_edit){
			alert(getLocalizeString("설명_정기구독신청내역이있는경우옵션수정이불가능합니다", "", "정기구독 신청 내역이 있는 경우 옵션 가격/재고번호/상태를 제외한 옵션 수정 및 추가, 삭제는 불가합니다.") );
			return false;
		}
		repaintOption(true);
		repaintOption(false);
	};

	var callbackChangeSelectBox = function() {
		debugConsole(arguments.callee.name, arguments);
		var $_that = $(this);
		var _value = $_that.val();
		var $_selected = $_that.find('[selected]');

		if ( $_selected.val() == _value ) return;

		$_that.find('[selected]').removeAttr('selected');
		$_that.find('[value="' + _value + '"]').attr('selected', '');
	};

	var callbackChangeAddForm = function(evt) {
		debugConsole(arguments.callee.name, arguments);
		var target = evt.target;

		// 상품 가격 관련 항목이 변경됐다면
		if ( $_prod_price_wrap.find(target).length ) {
			is_prod_price_changed = true;
		}

		/* **********
		옵션에 영향을 주는 항목이 변경됐다면
		 ********** */
		if ( target.name == "prod_type" ) { // 판매방식
			is_option_changed = true;
		}

		if ( $_prod_option_wrap.find(target).length ) { // 옵션
			is_option_changed = true;
			header_ctl.change();
		}
	};

	var callbackChangeOptionType = function() {
		debugConsole(arguments.callee.name, arguments);
		if(!regularly_option_edit){
			alert(getLocalizeString("설명_정기구독신청내역이있는경우옵션수정이불가능합니다", "", "정기구독 신청 내역이 있는 경우 옵션 가격/재고번호/상태를 제외한 옵션 수정 및 추가, 삭제는 불가합니다.") );
			return false;
		}

		var $_that = $(this);
		var opt_code = $_that.data('optcode');
		var ori_type = $_that.data('oritype');
		var new_type = $_that.val();

		var is_changed = true;

		/* 새로 변경할 타입에 대한 확인 처리 */
		switch( new_type ){
			case CONST.OPTION_TYPE_INPUT:
				if ( $_prod_option_list.find('._option_value_list[data-optcode="' + opt_code + '"] .value-item').length > 0 ) {
					is_changed = confirm(getLocalizeString("설명_입력형옵션으로변경할경우기존옵션값이사라집니다", "", "입력형 옵션으로 변경할 경우 기존 옵션값이 사라집니다. 계속 진행하시겠습니까?"));
				}
				break;
			default:
				/* 입력형이 아닌 경우에만 다시 묻는다. 왜냐하면 입력형은 입력형 만의 confirm 이 존재하기 때문 */
				switch ( ori_type ) {
					case CONST.OPTION_TYPE_COLOR:
					case CONST.OPTION_TYPE_IMAGE:
						is_changed = confirm(getLocalizeString("설명_다른타입으로변경할경우옵션값에적용된색상및이미지가초기화됩니다", "", "다른 타입으로 변경할 경우 옵션값에 적용된 색상 및 이미지가 초기화 됩니다. 계속 진행하시겠습니까?"));
						break;
				}
		}

		var _changed_type = ( is_changed ? new_type : ori_type );

		convertOptionType(opt_code, _changed_type, function(res) {
			if ( res.msg == 'SUCCESS' ) {
				var $_target = $_prod_option_wrap.find('#prod_option_list_' + opt_code);
				var $_html = $(res.html);
				sortableOpt($_html);
				$_target.replaceWith($_html);
				// 만약 타입이 변경되었는데 입력형 -> 기타 또는 기타 -> 입력형일 경우 상세 옵션을 다시 불러온다.
				if ( is_changed && ( ori_type == CONST.OPTION_TYPE_INPUT || _changed_type == CONST.OPTION_TYPE_INPUT ) ) {
					repaintOption(true);
					repaintOption(false);
				}
				header_ctl.change();
			} else {
				alert(res.msg);
			}
		});
	};

	var callbackChangeOptionName = function() {
		debugConsole(arguments.callee.name, arguments);
		console.log(11111);
		if(!regularly_option_edit){
			alert(getLocalizeString("설명_정기구독신청내역이있는경우옵션수정이불가능합니다", "", "정기구독 신청 내역이 있는 경우 옵션 가격/재고번호/상태를 제외한 옵션 수정 및 추가, 삭제는 불가합니다.") );
			return false;
		}

		var $_that = $(this);
		var unit_code = $_that.data('unitcode');
		var opt_code = $_that.data('optcode');

		var opt_name = $_that.val();
		$_prod_option_wrap.find("div._option_name[data-unitcode='" + unit_code + "'][data-optcode='" + opt_code + "']").text(opt_name);
	};

	var callbackChangeInputName = function() {
		debugConsole(arguments.callee.name, arguments);

		var $_that = $(this);
		$_that.toggleClass('_over_length', $_that.val().length > config.max_input_length);
		header_ctl.change();
	};

	var callbackOpenColorForm = function(evt) {
		debugConsole(arguments.callee.name, arguments);
		if(!regularly_option_edit){
			alert(getLocalizeString("설명_정기구독신청내역이있는경우옵션수정이불가능합니다", "", "정기구독 신청 내역이 있는 경우 옵션 가격/재고번호/상태를 제외한 옵션 수정 및 추가, 삭제는 불가합니다.") );
			return false;
		}

		openModifyPopupObject(this);
		evt.stopPropagation();
		return false;
	};

	var callbackChangeInputOptionValue = function(evt) {
		debugConsole(arguments.callee.name, arguments);
		if(!regularly_option_edit){
			alert(getLocalizeString("설명_정기구독신청내역이있는경우옵션수정이불가능합니다", "", "정기구독 신청 내역이 있는 경우 옵션 가격/재고번호/상태를 제외한 옵션 수정 및 추가, 삭제는 불가합니다.") );
			return false;
		}
		addOptionValueByDom(this);
		evt.stopPropagation();
		return false;
	};

	var callbackKeydownInputOptionValue = function(evt) {
		debugConsole(arguments.callee.name, arguments);
		if(!regularly_option_edit){
			alert(getLocalizeString("설명_정기구독신청내역이있는경우옵션수정이불가능합니다", "", "정기구독 신청 내역이 있는 경우 옵션 가격/재고번호/상태를 제외한 옵션 수정 및 추가, 삭제는 불가합니다.") );
			return false;
		}
		switch( evt.keyCode ) {
			// case 8: // backspace
			// 	if ( this.value.length == 0 ) {
			// 		var last_value_item = $(this).parents('._input').siblings('.value-item:last');
			// 		if ( last_value_item.length ) {
			// 			last_value_item.find('._value_name').focus();
			// 		}
			// 		// $(this).parent().find('value-item')
			//
			// 	}
			// 	break;
			case 9: // Tab
			case 188: // ,
				addOptionValueByDom(this);
				evt.stopPropagation();
				return false;
			case 13: // 엔터
				var $_that = $(this);
				$_that.blur();
				$_that.focus();
				break;
			default:
				refreshInputOptionValueSize.apply(this);
		}
	};

	var callbackClickRemoveOption = function() {
		debugConsole(arguments.callee.name, arguments);
		if(!regularly_option_edit){
			alert(getLocalizeString("설명_정기구독신청내역이있는경우옵션수정이불가능합니다", "", "정기구독 신청 내역이 있는 경우 옵션 가격/재고번호/상태를 제외한 옵션 수정 및 추가, 삭제는 불가합니다.") );
			return false;
		}
		deleteOption(this);
	};

	var callbackClickRemoveOptionValue = function() {
		debugConsole(arguments.callee.name, arguments);
		if(!regularly_option_edit){
			alert(getLocalizeString("설명_정기구독신청내역이있는경우옵션수정이불가능합니다", "", "정기구독 신청 내역이 있는 경우 옵션 가격/재고번호/상태를 제외한 옵션 수정 및 추가, 삭제는 불가합니다.") );
			return false;
		}
		deleteOptionValueDom(this);
	};

	var callbackClickOptionValue = function(evt) {
		debugConsole(arguments.callee.name, arguments);
		if(!regularly_option_edit){
			alert(getLocalizeString("설명_정기구독신청내역이있는경우옵션수정이불가능합니다", "", "정기구독 신청 내역이 있는 경우 옵션 가격/재고번호/상태를 제외한 옵션 수정 및 추가, 삭제는 불가합니다.") );
			return false;
		}
		var $_that = $(this);
		$_that.attr('data-mode', 'edit');
		$_that.find('._value_name').focus();
		return callbackVoid0(evt);
	};

	var callbackBlurOptionValue = function(evt) {
		if(!regularly_option_edit){
			alert(getLocalizeString("설명_정기구독신청내역이있는경우옵션수정이불가능합니다", "", "정기구독 신청 내역이 있는 경우 옵션 가격/재고번호/상태를 제외한 옵션 수정 및 추가, 삭제는 불가합니다.") );
			return false;
		}
		var $_that = $(this);
		// var opt_code = $_that.data('optcode');
		// var unit_code = $_that.data('unitcode');
		// var value_code = $_that.data('valuecode');

		$_that.parent().attr('data-mode', '');
	};

	var callbackChangeOptionValue = function(evt) {
		debugConsole(arguments.callee.name, arguments);
		if(!regularly_option_edit){
			alert(getLocalizeString("설명_정기구독신청내역이있는경우옵션수정이불가능합니다", "", "정기구독 신청 내역이 있는 경우 옵션 가격/재고번호/상태를 제외한 옵션 수정 및 추가, 삭제는 불가합니다.") );
			return false;
		}

		var is_changed = false;
		switch( evt.type ) {
			case 'keydown':
				switch( evt.keyCode ) {
					case 9: // TAB
					case 13: // 엔터
					case 188: // ,
						is_changed = true;
						break;
				}
				break;
			case 'blur':
			case 'focusout':
				is_changed = true;
				break;
		}

		if ( is_changed ) {
			var $_that = $(this);
			var $_input = $_that.siblings('input');
			var old_value = $_input.val();
			var new_value = $_that.text().trim();

			if ( new_value.length == 0 ) {
				/* 옵션값이 없으면 삭제 처리 */
				deleteOptionValueDom(this);
			} else {
				if ( old_value != new_value ) {
					if ( isDuplicateOptionValue(this, new_value) ){
						$_that.text(old_value);
						$_input.val(old_value);
						alert(getLocalizeString("설명_동일한옵션값이존재합니다", "", "동일한 옵션값이 존재합니다."));
					} else {
						$_input.val(new_value);
						repaintOption(true);
						repaintOption(false);
					}
				}
			}

			return false;
		}
	};

	var callbackChangeOptionalOptionPrice = function() {
		debugConsole(arguments.callee.name, arguments);

		// 금액이 0원인 경우... 경고 문구 출력
		var $_that = $(this);
		var unit_code = $_that.data('unitcode');
		var opt_code = $_that.data('optcode');
		var uniq = $_that.data('uniq');

		var $_target = $_prod_option_detail_optional_list.find('._optional_price_info[data-unitcode="' + unit_code + '"][data-optcode="' + opt_code + '"][data-uniq="' + uniq + '"]');
		if ( $_that.val() == 0 || $_that.val().trim().length == 0 ) {
			$_target.show();
		} else {
			$_target.hide();
		}
		header_ctl.change();
	};

	var callbackCheckedAllOptionItem = function() {
		debugConsole(arguments.callee.name, arguments);

		var $_that = $(this);
		var is_require = ( $_that.data('require') == 'Y' );
		var $_target = ( is_require ? $_prod_option_detail_require_wrap : $_prod_option_detail_optional_wrap );

		// mode 변경
		setOptionHeaderMode(is_require, ( this.checked ? 'edit' : '' ));

		// 하위 셀렉트 박스 전체 선택
		$_target.find('._option_check_item').prop('checked', this.checked);
	};

	var callbackCheckedOptionItem = function() {
		debugConsole(arguments.callee.name, arguments);

		var $_that = $(this);
		var is_require = ( $_that.data('require') == 'Y' );
		var $_target_wrap = ( is_require ? $_prod_option_detail_require_wrap : $_prod_option_detail_optional_wrap );
		var $_check_list = $_target_wrap.find('._option_check_item:checked');

		setOptionHeaderMode(is_require, ( $_check_list.length ? 'edit' : '' ))
	};

	var callbackClickAllOptionModifyBtn = function() {
		debugConsole(arguments.callee.name, arguments);
		var $_that = $(this);
		var is_require = ( $_that.data('require') == 'Y' );
		var $_target = ( is_require ? $_prod_option_detail_require_wrap : $_prod_option_detail_optional_wrap );

		var $_form = $(document.createElement('form'));
		$_form.append($_target.find('._option_header').clone());

		var data = $_form.serialize();

		$.ajax({
			type : 'POST',
			data : data,
			url : '/admin/ajax/shop/option/check_multi_option_data.cm',
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if ( res.msg == 'SUCCESS' ) {
					$_target.find('._option_check_item:checked').each(function(idx, obj) {
						var $_item = $_target.find('._option-item[data-key="' + obj.value + '"]');
						if ( $_item.length ) {
							// 금액 수정
							for( var _unit_code in res.price ) {
								if ( res.price[_unit_code] == '' ) continue;
								$_item.find('._option_price[data-unitcode="' + _unit_code + '"]').val(res.price[_unit_code]).trigger('change');
							}

							// 상태 일괄 수정
							if ( res.status ) $_item.find('._option_status').val(res.status).trigger('change');

							// 재고 일괄 추가
							$_item.find('._input_stock').val(res.stock).trigger('change');
						}
					});
				} else {
					alert(res.msg);
				}
			}
		});
	};

	var callbackModifyOptionColor = function(opt_code, value_code, data) {
		debugConsole(arguments.callee.name, arguments);

		var $_target_wrap = $_prod_option_list.find('#prod_option_list_' + opt_code);
		var $_target = $_target_wrap.find('._color[data-optcode="' + opt_code + '"][data-valuecode="' + value_code + '"]');

		var _css_data = { 'background-image': '',  'background-color': '' };
		if ( false && data.image_url ) {
			_css_data['background-image'] = 'url(' + CDN_UPLOAD_URL + data.image_url + ')';
		} else {
			_css_data['background-color'] = data.color;
		}

		$_target_wrap.find('._color[data-optcode="' + opt_code + '"][data-valuecode="' + value_code + '"]').css(_css_data).attr('data-color', ( data.image_url ? 'image' : data.color ));

		// data json setting
		var $_data = $_target_wrap.find('input[name="option[' + opt_code + '][data]"]');
		var json_data = JSON.parse($_data.val());
		json_data[value_code] = data;
		$_data.val(JSON.stringify(json_data));

		is_option_changed = true;

		header_ctl.change();
		$.cocoaDialog.close();
	};

	var checkedEmptyOptionName = function() {
		debugConsole(arguments.callee.name, arguments);

		var is_empty_name = false;
		var $option_name_dom_list = $_prod_option_list.find('._option_name');
		if ( $option_name_dom_list.length ) {
			$option_name_dom_list.each( function(idx, input) {
				if ( $(input).val().trim() == '' ) {
					is_empty_name = true;
				}
			});
		}

		return is_empty_name;
	};

	var checkedEmptyOptionValue = function() {
		debugConsole(arguments.callee.name, arguments);

		var is_exist_empty = false;
		var option_value_list = $_prod_option_list.find('._option_value_list');
		if ( option_value_list.length ) {
			option_value_list.each(function(idx, _ul) {
				if ( $(_ul).find('.value-item').length == 0 ) {
					is_exist_empty = true;
				}
			});
		}
		return is_exist_empty;
	};

	var refreshInputOptionValueSize = function() {
		debugConsole(arguments.callee.name, arguments);
		if(!regularly_option_edit){
			alert(getLocalizeString("설명_정기구독신청내역이있는경우옵션수정이불가능합니다", "", "정기구독 신청 내역이 있는 경우 옵션 가격/재고번호/상태를 제외한 옵션 수정 및 추가, 삭제는 불가합니다.") );
			return false;
		}

		var $_that = $(this);
		var unit_code = $_that.data('unitcode');
		var opt_code = $_that.data('optcode');
		var text = $_that.val();

		var _width = calcInputOptionValueSize(text);
		var $_option_list_wrap = $_prod_option_list.find("._option_value_list[data-unitcode='" + unit_code + "'][data-optcode='" + opt_code + "']")
		$_option_list_wrap.find('._input').css('width', _width);
	};

	var calcInputOptionValueSize = function(text) {
		debugConsole(arguments.callee.name, arguments);

		/*
		if ( global_input_text_width == 0 ) {
			global_input_text_width = $_global_div.width();
		}
		*/

		var $_div = $('<div style="display: none;" />');
		$_div.text(text);
		$('body').append($_div);
		var _width = $_div.width() + 25;
		/*
		if ( _width < global_input_text_width ) {
			_width = global_input_text_width;
		}
	 	*/
		$_div.remove();
		return _width;
	};

	var makeCode = function(prefix) {
		debugConsole(arguments.callee.name, arguments);

		var chars = "0123456789abcdef";
		var string_length = 13;
		var random_string = '';
		for(var x = 0; x < string_length; x++){
			var letterOrNumber = Math.floor(Math.random() * 2);
			if(letterOrNumber == 0){
				var newNum = Math.floor(Math.random() * 9);
				random_string += newNum;
			}else{
				var r_num = Math.floor(Math.random() * chars.length);
				random_string += chars.substring(r_num, r_num + 1);
			}
		}
		if(typeof prefix == 'undefined')
			return random_string;
		else
			return prefix + random_string;
	};

	var getAllOptionFormData = function() {
		debugConsole(arguments.callee.name, arguments);

		var $_form = $(document.createElement('form'));
		/* 상품 가격 관련 데이터 */
		$_form.append($_prod_price_wrap.clone());
		/* 상품 옵션 관련 데이터 */
		$_form.append($_prod_option_wrap.clone());
		/* 상품 재고 관리 관련 데이터 */
		$_form.append($_prod_stock_wrap.clone());
		return $_form.serializeArray();
	};

	var getOptionFormData = function(option_code) {
		debugConsole(arguments.callee.name, arguments);

		var $_form = $(document.createElement('form'));
		$_form.append($_prod_option_wrap.find('#prod_option_list_' + option_code).clone());
		return $_form.serializeArray();
	};

	var copyOption = function(prod_code) {
		debugConsole(arguments.callee.name, arguments);

		if(confirm(getLocalizeString("설명_상품옵션불러오면기존옵션값삭제", "", "상품 옵션을 불러오게 되면 기존에 입력된 옵션값은 삭제됩니다.\n계속 진행하시겠습니까?"))){
			loadOption(prod_code, false);
			loadOptionDetail(prod_code, function(res) {
				var msg = getLocalizeString("설명_최대n개까지옵션구성이가능합니다", [config.max_option_length], "설명_최대n개까지옵션구성이가능합니다");
				if ( res.is_require_max_length || res.is_optional_max_length ) {
					alert(msg);
					if ( res.is_require_max_length ){
						setOptionError(msg, true);
					}
					if ( res.is_optional_max_length ){
						setOptionError(msg, false);
					}
				} else {
					releaseOptionError(true);
					releaseOptionError(false);
				}
			});
			is_option_changed = true;
			$.cocoaDialog.close();
			header_ctl.change();
		}
	};

	var getFragmentDom = function(dom) {
		var $_html = dom;
		var _f = document.createDocumentFragment();
		for( var i=0; i<$_html.length; i++ ) {
			_f.appendChild($_html[i]);
		}
		return _f;
	};

	var loadOption = function(prod_code, is_detail_load) {
		debugConsole(arguments.callee.name, arguments);

		$.ajax({
			type : 'POST',
			data : {'prod_code' : prod_code},
			url : ('/admin/ajax/shop/option/load_option_data.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if ( res.msg == 'SUCCESS' ) {
					if ( res.option_count ) {
						$_prod_option_list.html(getFragmentDom($(res.option_html)));
						SHOP_PROD_MANAGE.showOptionWrap();
					}

					$_prod_stock_wrap.attr('data-optcount', res.require_option_count - res.input_option_count);
					SHOP_OPTION_MANAGE.sortableOptSelector($_prod_option_list.find('._option_value_list'));

					if ( is_detail_load ) {
						loadOptionDetail(prod_code);
					}
				} else {
					alert(res.msg);
					setOptionError(res.msg);
				}
			}, error: function() {
				alert(getLocalizeString("설명_상품옵션데이터로드실패잠시후다시시도해주세요", "", "상품 옵션 데이터 로드를 실패하였습니다. 잠시 후 다시 시도해 주세요."));
				location.href = '/admin/shopping/product';
			}
		});
	};

	var loadOptionDetail = function(prod_code, callback) {
		debugConsole(arguments.callee.name, arguments);

		var isCopyMode = false;
		try {
			if ( arguments.callee.caller.name == 'copyOption' ) {
				isCopyMode = true;
			}
		} catch ( e ) {}

		setRepainting(true, true);
		setRepainting(false, true);
		$.ajax({
			type : 'POST',
			data : {'prod_code' : prod_code, isCopyMode: isCopyMode},
			url : ('/admin/ajax/shop/option/load_option_detail_data.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if ( res.msg == 'SUCCESS' ) {
					setOptionMaxLength(true, res.is_require_max_length);
					setOptionMaxLength(false, res.is_optional_max_length);

					// $("#customStyle").html(res.page_style);

					/* 필수옵션 처리 */
					if ( !res.is_require_max_length ) {
						var $_require_header = $(res.require_header_html);
						$_prod_option_detail_require_wrap.find('colgroup').html($_require_header.siblings('colgroup').html());
						$_prod_option_detail_require_wrap.find('thead').html($_require_header.siblings('thead').html());
						$_prod_option_detail_require_wrap.find('thead').find('.btn-popover').popover({html : true});

						$_prod_option_detail_require_list.html(getFragmentDom($(res.require_html)));
					}
					if ( res.require_html.length || res.is_require_max_length ) { $_prod_option_detail_require_wrap.show(); }

					/* 선택옵션 처리 */
					if ( !res.is_optional_max_length ) {
						var $_optional_header = $(res.optional_header_html);
						$_prod_option_detail_optional_wrap.find('colgroup').html($_optional_header.siblings('colgroup').html());
						$_prod_option_detail_optional_wrap.find('thead').html($_optional_header.siblings('thead').html());
						$_prod_option_detail_optional_wrap.find('thead').find('.btn-popover').popover({html : true});

						$_prod_option_detail_optional_list.html(getFragmentDom($(res.optional_html)));
					}
					if ( res.optional_html.length || res.is_optional_max_length ){ $_prod_option_detail_optional_wrap.show(); }

					// 금액 입력 라이브러리 적용
					$_prod_option_wrap.find('._option_price').each(function(idx, obj) {
						var $_obj = $(obj);
						var decimal_cnt = $_obj.data('decimal-count');
						var decimal_char = $_obj.data('decimal-char');
						var thousand_char = $_obj.data('thousand-char');
						set_money_format($_obj, decimal_cnt, decimal_char, thousand_char);
					});

					// 조합형 / 비조합형 체크여부
					$_prod_option_detail_require_wrap.find('._btn_option_mix').prop('checked', res.option_mix_type == 'MIX');

					if ( res.etc_msg ) {
						setOptionError(res.etc_msg);
						alert(res.etc_msg);
					}
				} else {
					setOptionError(res.msg);
					alert(res.msg);
				}

				setRepainting(true, false);
				setRepainting(false, false);

				// 만약 오류가 있다면... 옵션 다시 부르기
				if ( res.require_error_code || res.optional_error_code ) {
					alert(getLocalizeString("설명_상품옵션설정문제재설정문구", "", "상품 옵션 데이터에 문제가 발생하였습니다. 상품 옵션이 초기화됩니다."));
					if ( res.require_error_code ){ repaintOption(true, true); }
					if ( res.optional_error_code ) { repaintOption(false, true); }
				}

				if ( typeof callback == "function" ) {
					callback.apply(this, [res]);
				}
			},
			error: function() {
				alert(getLocalizeString("설명_상품옵션데이터로드실패잠시후다시시도해주세요", "", "상품 옵션 데이터 로드를 실패하였습니다. 잠시 후 다시 시도해 주세요."));
				location.href = '/admin/shopping/product';
			}
		});
	};

	var addOption = function(type) {
		debugConsole(arguments.callee.name, arguments);
		if(!regularly_option_edit){
			alert(getLocalizeString("설명_정기구독신청내역이있는경우옵션수정이불가능합니다", "", "정기구독 신청 내역이 있는 경우 옵션 가격/재고번호/상태를 제외한 옵션 수정 및 추가, 삭제는 불가합니다.") );
			return false;
		}

		var is_add = true;
		var $_btn_require_list = $_prod_option_list.find('._btn_require:checked');

		// 이미 추가된 필수옵션이 존재할 때만 얼럿 띄운다.
		if ( $_btn_require_list.length && $_prod_option_detail_require_wrap.find('._btn_option_mix').prop('checked') ) {
			is_add = confirm(getLocalizeString("설명_옵션가격및재고초기화", "", "필수 옵션으로 추가하면 옵션 가격 및 재고가 초기화 됩니다"));
		}
		if ( is_add ) {
			$.ajax({
				type : 'POST',
				data : {'type' : type},
				url : ('/admin/ajax/shop/option/make_option_data.cm'),
				dataType : 'json',
				async : false,
				cache : false,
				success : function(res){
					if ( res.msg == 'SUCCESS' ) {
						var $_html = $(res.html);
						sortableOpt($_html);
						$_prod_option_list.append($_html);
					} else {
						alert(res.msg);
					}
				}
			});
		}
	};

	var addOptionAutoCalc = function(){
		$.ajax({
			type : 'POST',
			url : '/admin/ajax/shop/option/add_option_auto_calc.cm',
			data : {},
			dataType : 'html',
			async : false,
			cache : false,
			success : function(html){
				var $_html = $(html);
				$.cocoaDialog.open({type : 'add_calc_modal', custom_popup : $_html});
				function step(){
					var this_step = $('input[name="calc"]:checked').attr('data-tab');

					$('._step').css('display','none');
					$('._'+this_step).css('display', 'block');
				}
				$('input[name="calc"]').off('change').on('change', step);
			}
		});
	};

	var addOptionValueByDom = function(that) {
		debugConsole(arguments.callee.name, arguments);

		if ( isMaxLength() ) {
			alert(getLocalizeString("설명_최대n개까지옵션구성이가능합니다", [config.max_option_length], "설명_최대n개까지옵션구성이가능합니다"));
			return false;
		}

		var $_that = $(that);
		switch( $_that.data('type') ) {
			case 'color': /* 색상 관련 옵션 추가 - 옵션명으로 색상 코드를 가져와야하기 때문에 분리 */
				addOptionValueColor(that);
				break;
			default: /* 그냥 옵션값 추가 */
				addOptionValueDefault(that);
		};
	};

	var isDuplicateOptionValue = function(that, name) {
		debugConsole(arguments.callee.name, arguments);

		var $_that = $(that);
		var opt_code = $_that.data('optcode');
		var value_code = $_that.data('valuecode');

		name = name || $_that.val() || $_that.text(); // 이름 또는 value 또는 text 로 처리
		var valueName = name.trim();
		if ( valueName.length <= 0 ) return false;

		var is_duplicate = false;
		var $_option_list_wrap = $_prod_option_list.find("._option_value_list[data-optcode='" + opt_code + "']");

		var input_list = $_option_list_wrap.find('.value-item[data-valuecode!="' + value_code + '"] input');
		$.each(input_list, function(i, obj) {
			if ( $(obj).val() == name ) {
				is_duplicate = true;
			}
		});

		return is_duplicate;
	};

	var addOptionValueDefault = function(that) {
		debugConsole(arguments.callee.name, arguments);

		var $_that = $(that);
		var opt_code = $_that.data('optcode');
		var valueName = $_that.val().trim();
		if ( valueName.length <= 0 ) return;

		var value_name_list = [];
		if ( valueName.indexOf(',') === -1 ) {
			value_name_list.push(valueName);
		} else {
			value_name_list = valueName.split(',');
		}

		var is_add = false;
		var duplicate_name = [];
		value_name_list.forEach(function(_name, _index) {
			_name = _name.trim();
			if ( _name != '' ) {
				if ( isDuplicateOptionValue($_that, _name) ) {
					duplicate_name.push(_name);
				} else {
					var value_code = makeCode('O' + config.option_prefix);
					$.each(config.unit_code, function(k, unit_code) {
						var $_option_list_wrap = $_prod_option_list.find("._option_value_list[data-unitcode='" + unit_code + "'][data-optcode='" + opt_code + "']");
						var _dom = $(loadTemplate('OPTION_VALUE_TEMPLATE_' + opt_code, {
							'unit_code' : unit_code,
							'value_code' : value_code,
							'value_name' : _name,
						}));
						/* 특수문자 처리를 간편하게 하게 위해......흑 */
						_dom.find('input[type="hidden"]').val(_name);
						$_option_list_wrap.find('._input').before(_dom);
						is_add = true;
					});
				}
			}
		});

		if ( duplicate_name.length ) {
			alert(getLocalizeString("설명_동일한옵션값이존재합니다", "", "동일한 옵션값이 존재합니다.") + '( ' + duplicate_name.join(', ') + ' )');
		}

		if ( is_add ) {
			$_that.val('');
			refreshInputOptionValueSize.apply(that);

			var is_require = $_prod_option_wrap.find("#prod_option_list_" + opt_code + ' ._btn_require').prop('checked');
			repaintOption(is_require, false);
		}
	};

	var addOptionValueColor = function(that) {
		debugConsole(arguments.callee.name, arguments);

		var $_that = $(that);
		var type = $_that.data('type');
		var opt_code = $_that.data('optcode');
		var unit_code = $_that.data('unitcode');
		var valueName = $_that.val().trim();
		if ( valueName.length <= 0 ) return;

		var value_name_list = [];
		if ( valueName.indexOf(',') === -1 ) {
			value_name_list.push(valueName);
		} else {
			value_name_list = valueName.split(',');
		}

		var is_add = false;
		var duplicate_name = [];
		var make_value_name_list = [];
		value_name_list.forEach(function(_name, _index) {
			_name = _name.trim();
			if ( _name != '' ) {
				if ( isDuplicateOptionValue($_that, _name) ) {
					duplicate_name.push(_name);
				} else {
					make_value_name_list.push(_name);
				}
			}
		});

		if ( duplicate_name.length ) {
			alert(getLocalizeString("설명_동일한옵션값이존재합니다", "", "동일한 옵션값이 존재합니다.") + '( ' + duplicate_name.join(', ') + ' )');
		}

		if ( make_value_name_list.length ) {
			$.ajax({
				type : 'POST',
				url : '/admin/ajax/shop/option/make_option_value.cm',
				data : {type : type, unit_code : unit_code, value_name : make_value_name_list},
				dataType : 'json',
				async : false,
				cache : false,
				success : function(res){
					if(res.msg == 'SUCCESS'){
						res.data.forEach(function(data) {
							var _name = data.value_name;
							if ( _name.trim() != '' ) {
								if ( isDuplicateOptionValue($_that, _name) ) {
									duplicate_name.push(_name);
								} else {
									$.each(config.unit_code, function(k, unit_code) {
										var $_option_list_wrap = $_prod_option_list.find("._option_value_list[data-unitcode='" + unit_code + "'][data-optcode='" + opt_code + "']");
										data.unit_code = unit_code;
										var _dom = $(loadTemplate('OPTION_VALUE_TEMPLATE_' + opt_code, data));
										/* 특수문자 처리를 간편하게 하게 위해......흑 */
										_dom.find('input[type="hidden"]').val(_name);
										$_option_list_wrap.find('._input').before(_dom);

										SHOP_OPTION_MANAGE.callbackModifyOptionColor(opt_code, data.value_code, data);

										is_add = true;
									});
								}
							}
						});
					} else {
						alert(res.msg);
					}

					if ( is_add ) {
						$_that.val('');

						var is_require = $_prod_option_wrap.find("#prod_option_list_" + opt_code + ' ._btn_require').prop('checked');
						repaintOption(is_require, false);
					}
				}
			});
		}
	};

	var deleteOption = function(that, is_force) {
		debugConsole(arguments.callee.name, arguments);

		if ( is_force === true || confirm(getLocalizeString("설명_해당옵션을삭제하시겠습니까", "", "해당 옵션을 삭제 하시겠습니까")) ) {
			var $_that = $(that);
			var opt_code = $_that.data('optcode');
			var $_target = $_prod_option_list.find('#prod_option_list_' + opt_code);
			$_target.remove();
			repaintOption($_target.find('._btn_require').prop('checked'));
		}
	};

	var deleteOptionValue = function(opt_code, value_code) {
		debugConsole(arguments.callee.name, arguments);

		var $_value_item = $_prod_option_list.find('.value-item[data-optcode="' + opt_code + '"][data-valuecode="' + value_code + '"]');
		if ( $_value_item.length ) {
			$_value_item.remove();
			var is_require = $_prod_option_list.find('input[name="option[' + opt_code + '][is_require]"]').prop('checked');
			repaintOption(is_require, false);
		}
	};

	var deleteOptionValueDom = function(that) {
		debugConsole(arguments.callee.name, arguments);

		var $_that = $(that);
		var valueItem = $_that.parent('.value-item');

		deleteOptionValue(valueItem.data('optcode'), valueItem.data('valuecode'));
	};

	var convertOptionType = function(option_code, type, callback) {
		debugConsole(arguments.callee.name, arguments);
		var data = getOptionFormData(option_code);
		data.push({'name': 'option_code', 'value': option_code});
		data.push({'name': 'type', 'value': type});
		$.ajax({
			type : 'POST',
			url : '/admin/ajax/shop/option/convert_option_type.cm',
			data : data,
			dataType : 'json',
			async : true,
			cache : false,
			success : callback
		});
	};

	var repaintOption = function() {
		var handle = {};
		return function(is_require, is_immediately) {
			debugConsole('repaintOption', arguments);
			if ( typeof is_immediately == 'undefined') { is_immediately = true; }

			setRepainting(is_require, true);

			var func = function() {
				var data = getAllOptionFormData();
				data.push({'name': 'type', 'value': ( is_require ? 'require' : 'optional' )});
				data.push({'name': 'prod_code', 'value': config.prod_code});

				$.ajax({
					type : 'POST',
					url : '/admin/ajax/shop/option/make_option_detail_data.cm',
					data : data,
					dataType : 'json',
					async : !is_immediately,
					cache : false,
					success : function(res) {
						if ( res.msg == 'SUCCESS' ) {
							releaseOptionError(is_require);
							setOptionMaxLength(is_require, res.is_max_length);

							is_option_changed = true;

							if ( res.is_max_length ) {
								var msg = getLocalizeString("설명_최대n개까지옵션구성이가능합니다", [config.max_option_length], "설명_최대n개까지옵션구성이가능합니다");
								setOptionError(msg, is_require);
								alert(msg);

								if ( is_require ) {
									$_prod_option_detail_require_wrap.show();
									$_prod_option_detail_require_list.empty();
								} else {
									$_prod_option_detail_optional_wrap.show();
									$_prod_option_detail_optional_list.empty();
								}
							} else {
								if ( is_require ) {
									// 헤더 추가
									$_prod_option_detail_require_wrap.find('colgroup').remove();
									$_prod_option_detail_require_wrap.find('thead').remove();
									$_prod_option_detail_require_list.before(res.header_html);

									$_prod_option_detail_require_list.html(getFragmentDom($(res.html)));

									setOptionHeaderMode(true, '');
									$_prod_option_detail_require_wrap.find('thead').find('.btn-popover').popover({html : true});
									$_prod_option_detail_require_wrap.show();
									$_prod_option_detail_require.show();
								} else {
									$_prod_option_detail_optional_list.html(getFragmentDom($(res.html)));

									setOptionHeaderMode(false, '');
									$_prod_option_detail_optional_wrap.find('thead').find('.btn-popover').popover({html : true});
									$_prod_option_detail_optional_wrap.show();
								}

								/*필수 옵션이 있으면 상품 자체 재고관리 숨김*/
								if ( is_require ) {
									$_prod_stock_wrap.attr('data-optcount', res.require_option_count);
									if ( res.option_count > 0 ) {
										// $_prod_stock_no_option_wrap.hide();
									} else {
										// if ( $_prod_stock_wrap.find('._select_stock_use').val() == 'Y' ) {
										// 	$_prod_stock_no_option_wrap.show();
										// } else {
										// 	$_prod_stock_no_option_wrap.hide();
										// }
									}
								}

								if ( res.option_count ) {
									/*금액 입력 라이브러리 적용*/
									$_prod_option_wrap.find('._option_price').each(function(idx, obj) {
										var $_obj = $(obj);
										var decimal_cnt = $_obj.data('decimal-count');
										var decimal_char = $_obj.data('decimal-char');
										var thousand_char = $_obj.data('thousand-char');
										set_money_format($_obj, decimal_cnt, decimal_char, thousand_char);
									});
								}

								/* 옵션이 하나도 없다면... 해당 wrap 숨기기 */
								var $_target_wrap = ( is_require ? $_prod_option_detail_require_wrap : $_prod_option_detail_optional_wrap );
								if ( res.option_count == 0 ) {
									$_target_wrap.hide();
								} else {
									$_target_wrap.show();
								}
							}

							header_ctl.change();
						} else {
							setOptionError(res.msg, is_require);
							if ( is_require ) {
								$_prod_option_detail_require_list.html('');
								alert(res.msg);
							}
						}

						setRepainting(is_require, false);
					}
				});
			};

			if ( is_immediately ) { /* 즉시 처리일 때는 디바운싱 X */
				func.call(this);
			} else { /* ajax 호출 시 동기화 문제로 디바운싱 처리 */
				var handle_name = ( is_require ? 'require' : 'optional' );
				clearTimeout(handle[handle_name]);
				handle[handle_name] = setTimeout(func, 150);
			}
		};
	}();

	var setOptionMaxLength = function(require, bool) {
		var type = ( require ? 'require' : 'optional' );
		is_max_length[type] = bool;

		if ( require ) {
			$_prod_option_detail_require_wrap.attr('data-is_max_length', bool ? 'Y' : 'N' );
		} else {
			$_prod_option_detail_optional_wrap.attr('data-is_max_length', bool ? 'Y' : 'N' );
		}

		return bool;
	};

	var loadTemplate = function(code, data) {
		var template = $("#" + code).html();

		if ( data != void 0 ) {
			Object.keys(data).forEach(function(k) {
				template = template.replace(new RegExp("\\{" + k + "\\}", "g"), data[k]);
			});
		}

		return template;
	};

	var openModifyPopup = function(type, data) {
		debugConsole(arguments.callee.name, arguments);
		$.ajax({
			type : 'POST',
			url : '/admin/ajax/shop/option/open_modify_popup.cm',
			data : data,
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res) {
				if ( res.msg == 'SUCCESS' ) {
					$.cocoaDialog.open({type: 'option_popup_' + type, custom_popup: res.html, 'close_block':true, width: 500});
				} else {
					alert(res.msg);
				}
			}
		});
	};

	var openModifyPopupObject = function(obj) {
		debugConsole(arguments.callee.name, arguments);
		var $_that = $(obj);
		var type = $_that.data('type');
		var opt_code = $_that.data('optcode');
		var value_code = $_that.data('valuecode');

		var data = getOptionFormData(opt_code);
		data.push({'name': 'type', 'value': type});
		data.push({'name': 'option_code', 'value': opt_code});
		data.push({'name': 'value_code', 'value': value_code});

		openModifyPopup(type, data);
	};

	var setOptionHeaderMode = function(is_require, mode) {
		debugConsole(arguments.callee.name, arguments);
		var $_target_wrap = ( is_require ? $_prod_option_detail_require_wrap : $_prod_option_detail_optional_wrap );
		var $_target = $_target_wrap.find('[data-mode]');
		$_target.attr('data-mode', mode);
	};

	var setDebugMode = function(is_debug) {
		is_debug_mode = is_debug;
	};

	var debugConsole = function() {
		if ( is_debug_mode ) {
			console.log(arguments[0], arguments[1]);
		}
	};

	var setOptionError = function(msg, is_require_option) {
		debugConsole(arguments.callee.name, arguments);
		var option_type = is_require_option ? "require" : "optional";
		is_option_error[option_type] = true;
		last_option_error_msg = msg;
	};

	var releaseOptionError = function(is_require_option) {
		debugConsole(arguments.callee.name, arguments);
		var option_type = is_require_option ? "require" : "optional";
		is_option_error[option_type] = false;
	};

	var toggleProdOptionCard = function(is_visible) {
		debugConsole(arguments.callee.name, arguments);
		if ( is_visible == void(0) ) {
			is_visible = true;
			if ( $_prod_price_none.prop('checked') ) { is_visible = false; }
			if ( $('._prod_type_list_wrap').find(':radio[name="prod_type"]:checked').val() === 'subscribe' ) { is_visible = false; }
		}
		$_prod_option_card_wrap.toggle(is_visible);
	};

	var sortableOptSelector = function(selector) {
		debugConsole(arguments.callee.name, arguments);
		sortableOpt($(selector));
	};

	var sortableOpt = function($dom) {
		debugConsole(arguments.callee.name, arguments);
		$dom.sortable({
			'handle': '._sort_handle',
			'items': '.value-item',
			'placeholder': 'ui-state-highlight _test',
			distance: 3,
			'start' : function(event, ui){
				var $_target = $(ui.item);
				// $_target.css('width', Math.ceil($_target.outerWidth()));
				$('._test').css('width', $_target.outerWidth());
				$('._test').css('height', $_target.outerHeight());
			},
			'update' : function(event, ui){
				var $_target = $(ui.item);

				var unit_code = $_target.attr('data-unitcode');
				var opt_code = $_target.attr('data-optcode');
				var value_code = $_target.attr('data-valuecode');

				var $_prev = $_target.prev();
				var is_first = ( $_prev.length == 0 );

				var prev_value_code = $_prev.attr('data-valuecode');

				$.each(config.unit_code, function(k, _unit_code) {
					if ( unit_code == _unit_code ) return;
					var $_unit_opt_list = $_prod_option_list.find('._option_value_list[data-unitcode="' + _unit_code + '"][data-optcode="' + opt_code + '"]');
					var $_target_value = $_unit_opt_list.find('.value-item[data-valuecode="' + value_code + '"]');

					if ( is_first ) {
						$_unit_opt_list.find('.value-item').eq(0).before($_target_value);
					} else {
						$_unit_opt_list.find('.value-item[data-valuecode="' + prev_value_code + '"]').after($_target_value);
					}
				});

				// option detail repaint
				var $_target_wrap = $("#prod_option_list_" + opt_code);
				var is_require = $_target_wrap.find('._btn_require').prop('checked');
				repaintOption(is_require, false);
			}
		});
	};

	var setRepainting = function(is_require, is_repainting) {
		debugConsole(arguments.callee.name, arguments);
		if ( is_require ) {
			is_repainting_require = is_repainting;
		} else {
			is_repainting_optional = is_repainting;
		}
	}

	var isRepainting = function() {
		debugConsole(arguments.callee.name, arguments);
		return is_repainting_require || is_repainting_optional;
	};

	var isMaxLength = function() {
		return is_max_length['require'] || is_max_length['optional'];
	};

	return {
		init: function(options) {
			init(options);
		},
		loadTemplate : function(code, data) {
			return loadTemplate(code, data);
		},
		addOption: function(type) {
			addOption(type);
		},
		deleteOptionValue: function(opt_code, value_code) {
			deleteOptionValue(opt_code, value_code);
		},
		deleteOptionValueDom: function(that) {
			deleteOptionValueDom(that);
		},
		copyOption : function(prod_code) {
			copyOption(prod_code);
		},
		loadOption: function(prod_code, is_detail_load) {
			loadOption(prod_code, is_detail_load);
		},
		loadOptionDetail: function(prod_code) {
			loadOptionDetail(prod_code);
		},
		callbackModifyOptionColor : function(opt_code, value_code, data) {
			return callbackModifyOptionColor(opt_code, value_code, data);
		},
		setDebugMode : function(is_debug) {
			setDebugMode(is_debug);
		},
		checkedEmptyOptionName : function() {
			return checkedEmptyOptionName();
		},
		checkedEmptyOptionValue : function() {
			return checkedEmptyOptionValue();
		},
		isOptionError : function() {
			return (is_option_error['require'] || is_option_error['optional']);
		},
		getLastOptionErrorMsg : function() {
			return last_option_error_msg;
		},
		toggleProdOptionCard: function(is_visible) {
			toggleProdOptionCard(is_visible);
		},
		sortableOptSelector: function(selector) {
			sortableOptSelector(selector);
		},
		isRepainting : function() {
			return isRepainting();
		},
		addOptionAutoCalc : function(){
			return addOptionAutoCalc();
		},
		setOptionChanged: function(boolean) {
			is_option_changed = !!boolean;
		},
		isOptionChanged : function() {
			return is_option_changed;
		},
		setProdPriceChanged: function(boolean) {
			is_prod_price_changed = !!boolean;
		},
		isProdPriceChanged : function() {
			return is_prod_price_changed;
		},
	};
}();

var SHOP_CONFIG = function() {
	var header_ctl;
	var $form;
	var $shop_config_list;
	var $save_button;
	var $deliv_price_flexable_wrap;
	var $deliv_price_fix_wrap;
	var $common_content;
	var $common_header;
	var $exchange_refund_content;
	var $non_refundable_content;
	var $common_content_wrap;
	var $common_header_wrap;

	// 결제 폼 관리
	var $shopPayFormItemTemplate; // 템플릿
	var $shopFormEmptyWrap;
	var $shopFormListWrap;
	var $shopFormList;

	var deliv_list = [];//국가별 배송정보 리스트
	var check_country_list = '';//선택된 국가 리스트
	var all_country_count = '';//전체 국가 수
	var $add_country_idx = 0;


	/**
	 * //쇼핑 국가별 배송기능 예외처리
	 * @param $list
	 * @param country_all_count
	 * @param ck_country_list
	 */
	var init = function($list,country_all_count,ck_country_list){
		all_country_count = country_all_count;
		check_country_list = ck_country_list;
		deliv_list = $list;

		$shop_config_list = $("#shop-config-list");
		$exchange_refund_content = $('#exchange_refund_content');
		$non_refundable_content = $('#non_refundable_content');
		$save_button = $('#shop_config_save_button');
		// TODO 상품 상세 상단/하단이 추가되면서 common_content, common_header가 제거됨, 추후 사용 중인 스크립트 확인하여 제거할 것
		$common_content = $('#common_content');
		$common_header = $('#common_header');
		$common_content_wrap = $('._common_content_wrap');
		$common_header_wrap = $('._common_header_wrap');

		// 결제폼 관리
		$shopPayFormItemTemplate = $("#shopPayFormItemTemplate");
		$shopFormEmptyWrap = $("#shopFormEmptyWrap");
		$shopFormListWrap = $("#shopFormListWrap");
		$shopFormList = $("#shopFormList");

		//var deliv_price_type_flag=true;
		$form = $('#shop_config');
		$deliv_price_flexable_wrap = $form.find("._deliv_price_flexable_wrap");
		$deliv_price_fix_wrap = $form.find("._deliv_price_fix_wrap");
		$add_country_idx = $form.find('._deliv_wrap').last().data('type');
		header_ctl = new HEADER_CONTROL();
		header_ctl.init();
		header_ctl.addBtn('save',function(){
			submit();
		});

		$form.find('input, textarea, select').off('change').on('change',function(){
			header_ctl.change();
			$save_button.removeClass('disabled');
		});
		$form.find('input, textarea').off('keyup').on('keyup',function(){
			header_ctl.change();
			$save_button.removeClass('disabled');
		});
		$form.find('input[type=checkbox],input[type=radio]').off('click').on('click',function(){
			header_ctl.change();
			$save_button.removeClass('disabled');
		});


		/*
		set_money_format($form.find('._deliv_price_fix'));
		set_money_format($form.find('._deliv_price_flexable_key'));
		*/
		set_money_format($form.find('._weight_default_price'));
		set_money_format($form.find('._weight_price'));
		set_money_format($form.find('._quantity_default_price'));
		set_money_format($form.find('._quantity_price'));
		set_money_format($form.find('._quantity_repeat_price'));
		set_money_format($form.find('._quantity_repeat_count'));
		set_money_format($form.find('._amount_price'));
		set_money_format($form.find('._amount_start_price'));
		set_money_format($form.find('._jeju_price'));
		set_money_format($form.find('._land_price'));
		set_money_format($form.find('._cvs_land_price'));
		set_money_format($form.find('._exchange_price, ._return_price'));
		/*
		set_money_format($form.find('._deliv_price_flexable_value'));
		*/

		set_money_format($form.find('input._join_point'));
		set_money_format($form.find('input._recommend_join_new_member_point'));
		set_money_format($form.find('input._recommend_join_old_member_point'));

		set_money_format($form.find('input._review_point'));
		set_money_format($form.find('input._photo_review_point'));
		set_money_format($form.find('input._review_char_count_point'));
		set_money_format($form.find('input._use_limit_point'));
		set_money_format($form.find('input._use_limit_price'));
		set_money_format($form.find('input._once_use_limit_value_price'));

		set_money_format($form.find('input._order_minimum_price'));


		var $recommend_join_limit_count = $form.find('input._recommend_join_limit_count');
		set_money_format($recommend_join_limit_count);
		var to;
		$recommend_join_limit_count.keyup(function(){
			var $that = $(this);
			clearTimeout(to);
			to = setTimeout(function(){
				var count = $that.val();
				var limit = $that.attr('maxlength');
				if(count.length+1 > limit){
					count = count.slice(0,-1);
					$that.val(count);
				}
			},300);

		});


		var callback = function(){
			header_ctl.change();
			$shop_config_list.imagesLoaded().always(function(ins) {
				$shop_config_list.masonry('layout');
			});
		};

		if(FROALA_VERSION >= 300){
			var froala_option = setFroalaOption("insertImageExchangeRefund",callback);
			setFroala('#exchange_refund_content', froala_option);

			froala_option = setFroalaOption("insertImageNonRefundable",callback);
			setFroala('#non_refundable_content', froala_option);
		}else{
			var froala_option = setFroalaOption("insertImage", callback);
			$common_content.setFroala(froala_option);

			froala_option = setFroalaOption("insertImage2", callback);
			$common_header.setFroala(froala_option);

			froala_option = setFroalaOption("insertImageExchangeRefund", callback);
			$exchange_refund_content.setFroala(froala_option);

			froala_option = setFroalaOption("insertImageNonRefundable", callback);
			$non_refundable_content.setFroala(froala_option);
		}

		$shop_config_list.imagesLoaded()
			.always(function(ins) {
				$shop_config_list.masonry({
					// options
					itemSelector: '.ma-item',
					percentPosition: true
				});
			});
	};

	function setFroalaOption(insertImage, callback){
		if(FROALA_VERSION >= 300){
			return {
				'code' : '',
				'image_upload_url' : "/ajax/post_image_upload.cm",
				toolbarButtons : {
					'moreText': {
						'buttons': ['fontSize', 'textColor', 'backgroundColor', '|', 'bold', 'italic', 'underline', 'strikeThrough', 'clearFormatting', '|', 'align', 'formatOL', 'formatUL', '|', insertImage, 'insertTable', 'insertLink', 'insertHR', 'html'],
						'buttonsVisible': 30
					}
				},
				'image_insert_key' : insertImage,
				'change_content' : callback,
				'charCounterCount' : false
			};
		}else{
			return {
				'code' : '',
				'image_upload_url' : "/ajax/post_image_upload.cm",
				'toolbarButtons' : ["bold", "italic", "underline", "strikeThrough", "fontFamily", "fontSize", '|', "clearFormatting", "color", "align", "insertHR", '|', 'insertLink', insertImage, 'insertTable', "html"],
				'toolbarButtonsMD' : ["bold", "italic", "underline", "strikeThrough", "fontFamily", "fontSize", '|', "clearFormatting", "color", "align", "insertHR", '|', 'insertLink', insertImage, 'insertTable', "html"],
				'toolbarButtonsSM' : ["bold", "italic", "underline", "strikeThrough", "fontFamily", "fontSize", '|', "clearFormatting", "color", "align", "insertHR", '|', 'insertLink', insertImage, 'insertTable', "html"],
				'toolbarButtonsXS' : ["bold", "italic", "underline", "strikeThrough", "fontFamily", "fontSize", '|', "clearFormatting", "color", "align", "insertHR", '|', 'insertLink', insertImage, 'insertTable', "html"],
				'image_insert_key' : insertImage,
				'change_content' : callback,
				'charCounterCount' : false
			};
		}
	}

	var submit = function(){
		if(FROALA_VERSION >= 300){
			var common_content = [];
			var common_header = [];
			var exchange_refund_content = FroalaEditor('#exchange_refund_content').html.get(true);
			var non_refundable_content = FroalaEditor('#non_refundable_content').html.get(true);
		}else{
			if($common_content_wrap.find('.fr-box').hasClass('fr-code-view')){
				$common_content.froalaEditor('codeView.toggle');
			}
			if($common_header_wrap.find('.fr-box').hasClass('fr-code-view')){
				$common_header.froalaEditor('codeView.toggle');
			}
			var common_content = $common_content.froalaEditor("html.get", true, true);
			var common_header = $common_header.froalaEditor("html.get", true, true);
			var exchange_refund_content = $exchange_refund_content.froalaEditor("html.get", true, true);
			var non_refundable_content = $non_refundable_content.froalaEditor("html.get", true, true);
		}
		var data = $form.serializeObject();
		data['common_content'] = common_content;
		data['common_header'] = common_header;
		data['exchange_refund_content'] = exchange_refund_content;
		data['non_refundable_content'] = non_refundable_content;
		data['deliv_list'] = deliv_list;

		var shop_form_config = _FORM.getFormConfig();
		var shop_header_detail_config = _DETAIL.getHeaderDetailConfig();
		var shop_footer_detail_config = _DETAIL.getFooterDetailConfig();
		$.each(shop_header_detail_config,function(k,v){
			if(v.is_default == '') v.is_default = false;
		});
		$.each(shop_footer_detail_config,function(k,v){
			if(v.is_default == '') v.is_default = false;
		});
		$shopFormList.find('._form_pay_item').each( function(k, v) {
			var $_that = $(v);
			var code = $_that.find('input[name="form_config_code"]').val();
			shop_form_config[code].require = $_that.find('input[name="shop_pay_require_data"]').prop('checked');
		});

		data['shop_form_config'] = shop_form_config;
		data['shop_header_detail_config'] = shop_header_detail_config;
		data['shop_footer_detail_config'] = shop_footer_detail_config;

		$.ajax({
			type: 'POST',
			data: { 'type':'dashboard', 'data':data },
			url: ('/admin/ajax/shop/save_config.cm'),
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					header_ctl.save();
					window.location.reload();
					$save_button.addClass('disabled');
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var deliv_modal;
	var openShopDelivForm = function(type,idx){
		//배송 및 택배 설정하는 폼
		deliv_modal = {"idx": parseInt(idx), "type": type};
		SHOP_DELIV.openModal({"type": "config", "mode": type, "idx": idx, "deliv_list": deliv_list, "check_country_list": check_country_list});
	};
	var updateDelivSetting = function($data){
		if ( typeof deliv_modal['idx'] != 'number' ) return false;
		var idx = deliv_modal['idx'];
		var type = deliv_modal['type'];

		var country_ck_count = 0;

		if ( typeof $data.deliv_country_list == 'undefined' ) {
			alert(getLocalizeString('설명_배송가능국가를1개이상선택해주세요', '', '배송 가능 국가를 1개 이상 선택해주세요.'));
			return false;
		}

		//선택한 국가 데이터가 배열이 아닌경우 배열로 다시 저장
		if(!$.isArray($data.deliv_country_list)){
			$data.deliv_country_list = [$data.deliv_country_list];
		}

		//기존 설정된 국가 리스트에서 현재 변경되거나 추가된 사항들 국가 리스트에 다시 저장
		if(type == 'modify'){
			$.each(deliv_list[idx].deliv_country_list,function(k,v){
				check_country_list.splice($.inArray(v, check_country_list),1);
			});
		}
		if($.isArray($data.deliv_country_list)){
			$.each($data.deliv_country_list,function(k,v){
				check_country_list.push(v);
			});
		}else{
			check_country_list.push($data.deliv_country_list);
		}

		//현재 추가된 국가 리스트 갯수 가져옴
		if($.isArray(check_country_list)){
			if($.inArray('ALL',check_country_list) != -1){
				country_ck_count = check_country_list.length - 1;
			}else{
				country_ck_count = check_country_list.length;
			}
		}else{
			if(check_country_list != 'ALL'){
				country_ck_count = 1;
			}
		}

		if ( $data.cvs ) {
			if ( typeof $data.cvs_list == 'undefined' ) {
				alert(getLocalizeString('설명_배송가능편의점을1개이상선택해주세요', '', '배송 가능 편의점을 1개 이상 선택해주세요.'));
				return false;
			}
			//선택한 편의점 데이터가 배열이 아닌경우 (1개일 경우) 배열로 다시 저장
			if(!$.isArray($data.cvs_list)){
				$data.cvs_list = [$data.cvs_list];
			}
		}

		//배송 리스트 데이터 저장 및 제거
		if(type == 'modify'){
			deliv_list.splice(idx,1,$data);
		}else{
			deliv_list.push($data);
			idx = $add_country_idx + 1;
			$add_country_idx = $add_country_idx + 1;
		}

		//배송 및 택배 설정 값을 가지고 수정한 부분만 다시 그려줌
		$.ajax({
			"type": 'POST',
			"data": {"data": $data, "idx": idx},
			"url": ('/admin/shopping/config/shop_deliv_form.cm'),
			"dataType": 'json',
			"async": false,
			"cache": false,
			"success": function(result){
				if ( result['msg'] == 'SUCCESS'){
					//설정된 값으로 html생성
					if(type == 'modify'){
						$form.find('._deliv_list_' + idx).replaceWith(result.html);
					}else{
						$form.find('._deliv_list_wrap').append(result.html);
					}

					//모든국가 선택된 리스트에는 국가 갯수 변경
					if($form.find('._deliv_list_wrap ._all_country').length > 0){
						$form.find('._deliv_list_wrap ._all_country ._country_text').text(getLocalizeString('설명_그외지역n개국가', (all_country_count - country_ck_count), '그 외 지역 (%1개 국가)'));
					}

					$('#shop-config-list').imagesLoaded()
						.always(function(ins){
							$('#shop-config-list').masonry({
								// options
								itemSelector : '.ma-item'
							});
						});
					$.cocoaDialog.close();
					header_ctl.change();
				} else {
					alert(result['msg']);
				}
			}
		});
	};

	var deleteDelivSetting = function(){
		if ( typeof deliv_modal['idx'] != 'number' ) return false;
		var idx = deliv_modal['idx'];
		var country_ck_count = 0;

		if($form.find('._deliv_wrap').length > 1){
			$.each(deliv_list[idx].deliv_country_list,function(k,v){
				check_country_list.splice($.inArray(v, check_country_list),1);
			});
			if($.isArray(check_country_list)){
				if($.inArray('ALL',check_country_list) != -1){
					country_ck_count = check_country_list.length - 1;
				}else{
					country_ck_count = check_country_list.length;
				}
			}else{
				if(check_country_list != 'ALL'){
					country_ck_count = 1;
				}
			}
			deliv_list.splice(idx,1,'');
			$form.find('._deliv_list_'+idx).remove();
			$form.find('._all_country ._country_text').text(getLocalizeString('설명_그외지역n개국가', (all_country_count - country_ck_count), '그 외 지역 (%1개 국가)'));
			header_ctl.change();
			return true;
		}else{
			alert(getLocalizeString('설명_배송지역두개이상일때삭제', '', '배송 지역은 두 개 이상일 때만 삭제하실 수 있습니다.'));
			return false;
		}
	};


	var onChangePointUse = function(checked) {
		var $config_point_wrap = $("#shop_config_point");
		if ( checked ) {
			$config_point_wrap.find('._point_setting_wrap').show();
		} else {
			$config_point_wrap.find('._point_setting_wrap').hide();
		}

		// 레이아웃 변경이 있기 때문에 Masonry 재호출
		$shop_config_list.masonry({ itemSelector: '.ma-item' });
	};

	var claimSetting = function($data){
		$.ajax({
			type : 'POST',
			url : ('/admin/shopping/config/shop_claim_form.cm'),
			data : {"data" : $data},
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if ( res.msg == 'SUCCESS'){
					$.cocoaDialog.close();
					$("#claim_data").val(res.data);
					$('#claim_guide_text').text(res.guide_text);
					header_ctl.change();
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var restoreRefundableContent = function(){
		if ( confirm(getLocalizeString('설명_반품교환불가능사유를기본값으로되돌리시겠습니까', '', '반품/교환 불가능 사유를 기본값으로 되돌리시겠습니까?')) ) {
			var default_refund_text = IMWEB_TEMPLATE.loadSimple('defaultRefundContent');
			if(FROALA_VERSION >= 300){
				var _froala = FroalaEditor('#non_refundable_content');
				_froala.html.set(default_refund_text, true);
			} else {
				$('#non_refundable_content').froalaEditor("html.set", default_refund_text);
			}

			/* masonry 재배치 */
			$shop_config_list.data('masonry').layout();

			header_ctl.change();
		}
	};

	var _FORM = function() {
		var CONFIG = {
			CONST : {
				MULTI_VALUE_TYPE_LIST : [ 'select', 'radio', 'checkbox' ]
			}
		};

		var shop_form_config = {};
		var template_list = {};

		var loadTemplate = function(id, data) {
			if ( template_list[id] == void 0 ) {
				template_list[id] = $('#' + id).html() || ''; // 기본값은 공백
			}

			var template = template_list[id];
			if ( template.length && data != void 0 ) { // template과 data 가 존재할 경우 치환
				for( var _k in data ) {
					template = template.replace(new RegExp("\\[\\[" + _k + "\\]\\]", "g"), data[_k]);
				}
			}
			return template;
		};

		var init = function() {
			$shopFormList.sortable({
				'handle' : '._showcase_handle',
				'start' : function(event, ui){
				},
				'stop' : function(event, ui){
					SHOP_CONFIG.enableSave();
				}
			}).disableSelection();
		};

		var open = function(code) {
			$.ajax({
				type:'POST',
				data: {type: 'shopping', data : shop_form_config[code] || {}},
				url:('/admin/shopping/config/custom_pay_form.cm'),
				dataType:'html',
				async:false,
				cache:false,
				success:function(html){
					var $_html = $(html);
					$.cocoaDialog.open({ type:'admin_custom_pay_form', custom_popup:$_html });
					$_html.find('#btnItemAdd').on('click', function() {
						// 적용 사항 반영
						var form_data = $_html.serializeObject();

						// 선택 옵션이 입력되는 경우 공백 제거.
						if ( CONFIG.CONST.MULTI_VALUE_TYPE_LIST.indexOf(form_data.type) != -1 ) {
							if ( ! Array.isArray(form_data.value) ) { form_data.value = [form_data.value]; }
							form_data.value = trim(form_data.value);
						}

						if ( checkForm(form_data) ) {
							( code ? updateItem : addItem ).call(null, form_data);
							resetForm();

							// 저장 버튼 활성화 후 팝업 닫음.
							header_ctl.change();
							$.cocoaDialog.close();
						}
					});
					$_html.find('#payform_type').on('change', callbackChangeShopPayFormDataType).trigger('change');
				}
			});
		};

		var checkForm = function(form_data) {
			if ( form_data.title.length == 0 ) {
				alert(getLocalizeString("설명_입력항목제목입력", "", "입력항목 제목을 입력하세요"));
				return false;
			}

			if ( CONFIG.CONST.MULTI_VALUE_TYPE_LIST.indexOf(form_data.type) != -1 ) {
				if ( form_data.value == void 0 || form_data.value.length == 0) {
					alert(getLocalizeString("설명_선택옵션을추가해주세요", "", "선택 옵션을 추가해주세요"));
					return false;
				}
			}

			return true;
		};

		var trim = function(val) {
			if ( Array.isArray(val) ) {
				return val.filter(function(val) { return val != void 0 && val.length > 0; });
			} else {
				return val.trim();
			}
		};

		var addOption = function(type) {
			var uniq_id = makeUniq();
			var html = '<div class="input-group input-option _pay_form_option" id="'+uniq_id+'">' +
				'<div class="input-group-content">' +
				'<input type="text" placeholder="" name="value" class="form-control" value="">' +
				'</div>' +
				'<div class="input-group-btn">' +
				'<button class="btn btn-flat btn-default-light no-padding btn-lg" type="button" onclick="SHOP_CONFIG.FORM.deleteOption(\''+uniq_id+'\')"><i class="md md-close"></i></button>' +
				'</div>' +
				'</div>';
			$('#pay_form_option').append(html);
			resetOption();
		};

		var deleteOption = function(selector) {
			var $_item = $(selector);
			if ( $_item.length ) {
				$_item.remove();
			}
		};

		var resetOption = function() {
			var pay_form_option = $('#pay_form_option ._pay_form_option');
			if( pay_form_option.length == 0 ){
				addOption();
			} else {
				pay_form_option.each(function(e){
					$(this).find('input').attr('placeholder', getLocalizeString("설명_옵션n샘플항목", (e+1), "옵션%1 (샘플 항목)"));
				});
			}
		};

		// 쇼핑 입력폼 항목 추가
		var addItem = function(data) {
			if ( ! data.code ) { data.code = makeUniq('f'); }

			// 템플릿 로드 및 추가
			var _template = loadTemplate('shopPayFormItemTemplate', $.extend({}, data, {require: ( data.require ? ' checked="checked" ' : '')}));
			$shopFormList.append($(_template));
			addArrayItem(data);
		};

		// 쇼핑 입력폼 항목 수정
		var updateItem = function(data) {
			// 템플릿 세팅 및 수정
			var _template = loadTemplate('shopPayFormItemTemplate', $.extend({}, data, {require: ( data.require ? ' checked="checked" ' : '')}));
			$shopFormList.find('._form_pay_item[data-code="' + data.code + '"]').html($(_template).html());
			addArrayItem(data);
		}

		var deleteItem = function(code) {
			var $_item = $shopFormList.find('._form_pay_item[data-code="' + code + '"]');
			if ( $_item.length && confirm(getLocalizeString("설명_삭제하시겠습니까", "", "삭제하시겠습니까?")) ) {
				$_item.remove();
				resetForm();
				header_ctl.change();
			}
		};

		// 쇼핑 입력폼 화면 갱신
		var resetForm = function() {
			if ( $shopFormList.find('._form_pay_item').length ) {
				if ( ! $shopFormListWrap.is(':visible') ) {
					$shopFormListWrap.show();
					$shopFormEmptyWrap.hide();
					$('._form_desc').show();
				}
			} else {
				if ( ! $shopFormEmptyWrap.is(':visible') ) {
					$shopFormListWrap.hide();
					$shopFormEmptyWrap.show();
					$('._form_desc').hide();
				}
			}

			$shop_config_list.masonry({ itemSelector: '.ma-item' });
		};

		var addArrayItem = function(data) {
			shop_form_config[data.code] = data;
		};

		//
		var callbackChangeShopPayFormDataType = function() {
			if ( CONFIG.CONST.MULTI_VALUE_TYPE_LIST.indexOf(this.value) != -1 ) {
				$('#pay_form_option_wrap').show();
				$('#limit_file_size').hide();
			} else if (this.value == 'file') {
				$('#pay_form_option_wrap').hide();
				$('#limit_file_size').show();
			} else {
				$('#pay_form_option_wrap').hide();
				$('#limit_file_size').hide();
			}
		};

		return {
			'init' : function() {
				init();
			},
			'open' : function(code) {
				open(code);
			},
			'addOption' : function () {
				addOption();
			},
			'deleteOption' : function (selector) {
				deleteOption(selector);
			},
			'addItem' : function(data) {
				addItem(data);
			},
			'deleteItem' : function(code) {
				deleteItem(code);
			},
			'resetForm' : function() {
				resetForm();
			},
			'getFormConfig' : function() {
				return shop_form_config;
			},
		}
	}();

	var _DETAIL = function() {
		var detail_editor;
		var shop_header_detail_config = {};
		var shop_footer_detail_config = {};
		var footer_detail;
		var header_detail;
		var template_list = {};
		var init = function(){
			footer_detail = $('._footer_detail');
			header_detail = $('._header_detail');
		};

		var openInit = function(type,code){
			detail_editor = $('._shop_detail_editor');
			var image_insert_key2 = 'image_insert_key2';
			if(type == 'header'){
				if(code != '' && shop_header_detail_config[code].value != '') detail_editor.html(shop_header_detail_config[code].value);
			}else{
				if(code != '' && shop_footer_detail_config[code].value != '') detail_editor.html(shop_footer_detail_config[code].value);
			}
			if(FROALA_VERSION >= 300){
				setFroala('._shop_detail_editor', {
					code : '',
					image_upload_url : "/ajax/post_image_upload.cm",
					file_upload_url : "/ajax/post_file_upload.cm",
					file_list_obj : $("#file_list"),
					toolbarButtons : {
						'moreText': {
							'buttons': ['fontSize', 'textColor', 'backgroundColor', '|', 'bold', 'italic', 'underline', 'strikeThrough', 'clearFormatting', '|', 'align', 'formatOL', 'formatUL', '|', image_insert_key2, 'insertTable', 'insertLink', 'insertHR', 'html'],
							'buttonsVisible': 30
						}
					},
					placeholderText : getLocalizeString("설명_내용을입력해주세요", "", "내용을 입력해주세요."),
					image_insert_key : image_insert_key2,
					image_align : 'center',
					image_display : 'block',
					toolbarStickyOffset : 38,
					heightMin : 200,
					heightMax : 600,
					charCounterCount : false
				});
			}else{
				detail_editor.setFroala({
					code : '',
					image_upload_url : "/ajax/post_image_upload.cm",
					file_upload_url : "/ajax/post_file_upload.cm",
					file_list_obj : $("#file_list"),
					toolbarButtons : ["bold", "italic", "underline", "strikeThrough", "fontFamily", "fontSize", 'emoticons', '|', "clearFormatting", "color", "align", "formatOL", "formatUL", "insertHR", 'quote', '|', 'insertLink', image_insert_key2, 'insertVideo', 'insertTable', 'html'],
					toolbarButtonsMD : ["bold", "italic", "underline", "strikeThrough", "fontFamily", "fontSize", 'emoticons', '|', "clearFormatting", "color", "align", "formatOL", "formatUL", "insertHR", 'quote', '|', 'insertLink', image_insert_key2, 'insertVideo', 'insertTable', 'html'],
					toolbarButtonsSM : ["bold", "italic", "underline", "strikeThrough", "fontFamily", "fontSize", 'emoticons', '|', "clearFormatting", "color", "align", "formatOL", "formatUL", "insertHR", 'quote', '|', 'insertLink', image_insert_key2, 'insertVideo', 'insertTable', 'html'],
					toolbarButtonsXS : ["bold", "italic", "underline", "strikeThrough", "fontFamily", "fontSize", 'emoticons', '|', "clearFormatting", "color", "align", "formatOL", "formatUL", "insertHR", 'quote', '|', 'insertLink', image_insert_key2, 'insertVideo', 'insertTable', 'html'],
					placeholderText : getLocalizeString("설명_내용을입력해주세요", "", "내용을 입력해주세요."),
					image_insert_key : image_insert_key2,
					image_align : 'center',
					image_display : 'block',
					toolbarStickyOffset : 38,
					heightMin : 200,
					heightMax : 600,
					charCounterCount : false,
					'emoticonsStep' : 4,
					'emoticonsSet' : [
						{code : '1f600', desc : ''},
						{code : '1f601', desc : ''},
						{code : '1f602', desc : ''},
						{code : '1f603', desc : ''},
						{code : '1f604', desc : ''},
						{code : '1f605', desc : ''},
						{code : '1f606', desc : ''},
						{code : '1f607', desc : ''},
						{code : '1f608', desc : ''},
						{code : '1f609', desc : ''},
						{code : '1f60a', desc : ''},
						{code : '1f60b', desc : ''},
						{code : '1f60c', desc : ''},
						{code : '1f60d', desc : ''},
						{code : '1f60e', desc : ''},
						{code : '1f60f', desc : ''},
						{code : '1f610', desc : ''},
						{code : '1f611', desc : ''},
						{code : '1f612', desc : ''},
						{code : '1f613', desc : ''},
						{code : '1f614', desc : ''},
						{code : '1f615', desc : ''},
						{code : '1f616', desc : ''},
						{code : '1f617', desc : ''},
						{code : '1f618', desc : ''},
						{code : '1f619', desc : ''},
						{code : '1f61a', desc : ''},
						{code : '1f61b', desc : ''},
						{code : '1f61c', desc : ''},
						{code : '1f61d', desc : ''},
						{code : '1f61e', desc : ''},
						{code : '1f61f', desc : ''},
						{code : '1f620', desc : ''},
						{code : '1f621', desc : ''},
						{code : '1f622', desc : ''},
						{code : '1f623', desc : ''},
						{code : '1f624', desc : ''},
						{code : '1f625', desc : ''},
						{code : '1f626', desc : ''},
						{code : '1f627', desc : ''},
						{code : '1f628', desc : ''},
						{code : '1f629', desc : ''},
						{code : '1f62a', desc : ''},
						{code : '1f62b', desc : ''},
						{code : '1f62c', desc : ''},
						{code : '1f62d', desc : ''},
						{code : '1f62e', desc : ''},
						{code : '1f62f', desc : ''},
						{code : '1f630', desc : ''},
						{code : '1f631', desc : ''},
						{code : '1f632', desc : ''},
						{code : '1f633', desc : ''},
						{code : '1f634', desc : ''},
						{code : '1f635', desc : ''},
						{code : '1f636', desc : ''},
						{code : '1f637', desc : ''}
					]
				});
			}
		};

		var open = function(type,code) {
			var data;
			if(type == 'header') data = shop_header_detail_config[code];
			else data = shop_footer_detail_config[code];
			$.ajax({
				type:'POST',
				data: {type: type, data : data},
				url:('/admin/shopping/config/shop_detail_form.cm'),
				dataType:'html',
				async:false,
				cache:false,
				success:function(html){
					var $_html = $(html);
					$.cocoaDialog.open({ type:'admin_detail_form', custom_popup:$_html });
					$_html.find('#btnItemAdd').on('click', function() {
						// 적용 사항 반영
						var form_data = $_html.serializeObject();
						if(FROALA_VERSION >= 300){
							if(detail_editor.hasClass('fr-code-view')){
								FroalaEditor('._shop_detail_editor').codeView.toggle();
							}
							var tmp_html = FroalaEditor('._shop_detail_editor').html.get(true);
						}else{
							if(detail_editor.hasClass('fr-code-view')){
								detail_editor.froalaEditor('codeView.toggle');
							}
							var tmp_html = detail_editor.froalaEditor("html.get", true, true);
						}
						form_data['value'] = tmp_html;
						if(checkDetail(form_data)){

							if(typeof code != 'undefined'){
								form_data['code'] = code;
								updateItem(type,form_data);
							}else{
								if(type == 'header') form_data['code'] = makeUniq('h');
								else form_data['code'] = makeUniq('f');
								code = form_data['code'];
								addItem(type, form_data);
							}

							header_ctl.change();
							$.cocoaDialog.close();
						}
					});
				}
			});
		};

		var checkDetail = function(data) {
			if(data.is_default){
				if ( typeof data.name != 'undefined' ) {
					alert(getLocalizeString("설명_기본템플릿은이름수정이불가능합니다", "", "기본 템플릿은 이름 수정이 불가능합니다."));
					return false;
				}
			}else{
				if ( data.name.length == 0 ) {
					alert(getLocalizeString("설명_이름을입력해주세요", "", "이름을 입력해세요."));
					return false;
				}
				if(data.value.length == 0){
					alert(getLocalizeString("설명_내용을입력해주세요", "", "내용을 입력해주세요."));
					return false;
				}
			}

			return true;
		};

		var addArrayItem = function(type,data) {
			if(type == 'header') shop_header_detail_config[data.code] = data;
			else shop_footer_detail_config[data.code] = data;
		};

		var addItem = function(type,data) {
			addArrayItem(type,data);
			var html = '<li class="holder medium-padding border-top _item_'+data.code+'">' +
				'<p class="margin-bottom-lg _'+type+'_name_'+data.code+'">'+data.name+'</p>' +
				'<a href="javascript:;" onclick="SHOP_CONFIG.DETAIL.open('+"'"+type+"',"+"'"+data.code+"'"+')" class="text-primary" style="position: absolute; top: 24px; right: 65px;">'+getLocalizeString("버튼_수정","","수정")+'</a>'+
				'<a href="javascript:;" onclick="SHOP_CONFIG.DETAIL.deleteItem('+"'"+type+"',"+"'"+data.code+"'"+')" class="text-primary" style="position: absolute; top: 24px; right: 24px; color:#f44336 !important;">'+getLocalizeString("버튼_삭제","","삭제")+'</a>'+
				'</li>';
			if(type == 'header') header_detail.append(html);
			else footer_detail.append(html);
			$shop_config_list.masonry({ itemSelector: '.ma-item' });
		};

		var updateItem = function(type, data){
			addArrayItem(type,data);
			if(data.is_default == false){
				if(type == 'header') $('._header_name_'+data.code).text(data.name);
				else $('._content_name_'+data.code).text(data.name);
			}else{
				if(data.value.length > 0){
					if(type == 'header'){
						$('._header_no_value_wrap').hide();
					}else{
						$('._footer_no_value_wrap').hide();
					}
				}else{
					if(type == 'header'){
						$('._header_time_wrap').hide();
						$('._header_no_value_wrap').text(getLocalizeString("설명_내용없음", "", "내용 없음"));
						$('._header_no_value_wrap').show();
					}else{
						$('._footer_time_wrap').hide();
						$('._footer_no_value_wrap').text(getLocalizeString("설명_내용없음", "", "내용 없음"));
						$('._footer_no_value_wrap').show();
					}
				}
			}
			$shop_config_list.masonry({ itemSelector: '.ma-item' });
		};

		var deleteItem =function(type,code){
			if (confirm(getLocalizeString("설명_삭제하시겠습니까", "", "삭제하시겠습니까?")) ) {
				if(type == 'header'){
					header_detail.find('._item_'+code).remove();
					delete shop_header_detail_config[code];
				}else{
					footer_detail.find('._item_'+code).remove();
					delete shop_footer_detail_config[code];
				}
				header_ctl.change();
				$shop_config_list.masonry({ itemSelector: '.ma-item' });
			}
		};

		return {
			'init' : function() {
				init();
			},
			'openInit' : function(type,code){
				openInit(type,code);
			},
			'open' : function(type,code) {
				open(type,code);
			},
			'checkDetail' : function(data){
				checkDetail(data);
			},
			'deleteItem' : function(type,code){
				deleteItem(type,code);
			},
			'addArrayItem' : function(type,data){
				addArrayItem(type,data)
			},
			'addItem' : function(type,data){
				addItem(type,data);
			},
			'updateItem' : function(){
				updateItem();
			},
			'getHeaderDetailConfig' : function() {
				return shop_header_detail_config;
			},
			'getFooterDetailConfig' : function() {
				return shop_footer_detail_config;
			},
		}
	}();

	return {
		init: function($list,country_all_count,ck_country_list){
			init($list,country_all_count,ck_country_list);
		},
		submit: function(){
			submit();
		},
		'enableSave': function(){
			header_ctl.change();
			$save_button.removeClass('disabled');
		},
		'openShopDelivForm' : function(type,idx){
			openShopDelivForm(type,idx);
		},
		"updateDelivSetting": function($data){
			updateDelivSetting($data);
		},
		"deleteDelivSetting": function(){
			return deleteDelivSetting();
		},
		'onChangePointUse' : function(checked) {
			onChangePointUse(checked);
		},
		'claimSetting' : function($data){
			claimSetting($data);
		},
		'restoreRefundableContent': function() {
			restoreRefundableContent();
		},
		'FORM' : _FORM,
		'DETAIL' : _DETAIL,
	}
}();

var SHOP_CLAIM = function() {
	var $claim_form, $claim_table;
	var $modal;
	var $claim_wrap;
	var init = function($obj){
		$modal = $obj;
		$claim_form = $('#claim_form');
		$claim_table = $('#claim_table');
		$claim_wrap = $('._claim_wrap');
		$modal.find('._add_btn').on('click',function(){
			submit();
		});
	};

	var openClaimConfigForm = function(){
		var $claim_data = $("#claim_data").val();
		$.ajax({
			type : 'POST',
			url : ('/admin/ajax/shop/open_shop_claim_form.cm'),
			data : {'data' : $claim_data},
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if ( res.msg == 'SUCCESS'){
					var $html = $(res.html);
					$.cocoaDialog.open({type : 'admin', custom_popup : $html, width : 550});
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var makeUniqueId = function () {
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var string_length = 10;
		var random_string = '';

		chars = " akskwkakska" ;


		for (var x = 0; x < string_length; x++) {

			var letterOrNumber = Math.floor(Math.random() * 2);
			if (letterOrNumber === 0) {
				random_string += Math.floor(Math.random() * 9);
			} else {
				var r_num = Math.floor(Math.random() * chars.length);
				random_string += chars.substring(r_num, r_num + 1);
			}

		}
		if($("#"+random_string).length === 0)
			return random_string;
		else
			return this.makeUniqueId();
	};

	var addCustomClaim = function(){
		var code = makeUniqueId();
		var $row_html = $("<tr>" +
			"<td><input name='"+code+"' type='text' placeholder='"+getLocalizeString("타이틀_사유입력", "", "사유 입력")+"' class='form-control'></td>" +
			"<td class='text-center'>" +
			"<div class='checkbox checkbox-styled no-margin'>" +
			"<label>" +
			"<input name='"+code+"' type='checkbox' value='cancel'><span></span>" +
			"</label>" +
			"</div>" +
			"</td>" +
			"<td class='text-center'>" +
			"<div class='checkbox checkbox-styled no-margin'>" +
			"<label>" +
			"<input name='"+code+"' type='checkbox' value='return'><span></span>" +
			"</label>" +
			"</div>" +
			"</td>" +
			"<td class='text-center'>" +
			"<div class='checkbox checkbox-styled no-margin'>" +
			"<label>" +
			"<input name='"+code+"' type='checkbox' value='return_deliv_fee_flag'><span></span>" +
			"</label>" +
			"</div>" +
			"</td>" +
			"<td class='no-padding'>" +
			"<button class='btn btn-icon-toggle btn-default btn-lg' type='button' onclick='SHOP_CLAIM.deleteCustomClaim($(this))'>" +
			"<i class='btl bt-times-circle'></i>" +
			"</button>" +
			"</td>" +
			"</tr>"
		);
		$claim_table.find('tbody:last').append($row_html);
	};

	var deleteCustomClaim = function($obj){
		var input_name = $obj.parent().prev().children().children().children().attr("name");
		var $input_deleted = $(
			"<label>" +
			"<input name='"+input_name+"' type='hidden' value='deleted'><span></span>" +
			"</label>"
		);
		$obj.parent().append($input_deleted);
		$obj.parent().parent().hide();
	};

	var submit = function(){
		var $data = $claim_form.serializeObject();
		$data = JSON.stringify($data);
		SHOP_CONFIG.claimSetting($data);
	};

	return {
		"init" : function($obj){
			init($obj);
		},
		"openClaimConfigForm" : function(){
			openClaimConfigForm();
		},
		"addCustomClaim" : function(){
			addCustomClaim();
		},
		"deleteCustomClaim" : function($obj){
			deleteCustomClaim($obj);
		}
	}
}();

var SHOP_DELIV = function() {
	var modal_type = 'config';
	var shop_deliv_region_list;
	var $modal, $form;
	var header_ctl;
	var $deliv_contry_wrap, $deliv_type_wrap, $deliv_pay_type_wrap, $deliv_price_type_wrap, $deliv_additional_price_wrap, $deliv_price_mix_wrap, $deliv_etc_wrap, $today_deliv_config_type_wrap, $today_deliv_config_wrap, $today_deliv_config_detail_wrap;
	var $parcel_wrapper, $cvs_wrappper;
	var $use_cvs_checkbox;
	var border_bottom_style = '';
	var decimal_data;

	var openModal = function(data){
		$.cocoaDialog.close();
		$.ajax({
			"type": "POST",
			"data": data,
			"url": "/admin/ajax/shop/open_deliv_config.cm",
			"dataType": "HTML",
			"async": false,
			"cache": false,
			"success": function(html){
				$.cocoaDialog.open({type : 'deliv_config', custom_popup : html, width: 650});
			}
		});
	};

	var init = function(type, $obj, region_list, currency_data){
		modal_type = type;
		header_ctl = new HEADER_CONTROL();
		header_ctl.init();

		$modal = $obj;
		$form = $obj.find('form');

		$deliv_contry_wrap 				= $form.find('._deliv_contry_wrap');
		$deliv_type_wrap				= $form.find('._deliv_type_wrap');
		$deliv_pay_type_wrap 			= $form.find('._deliv_pay_type_wrap');
		$deliv_price_type_wrap 			= $form.find('._deliv_price_type_wrap');
		$deliv_additional_price_wrap 	= $form.find('._deliv_additional_price_wrap');
		$deliv_price_mix_wrap 			= $form.find('._deliv_price_mix');
		$deliv_etc_wrap 				= $form.find('._deliv_etc_wrap');
		$parcel_wrapper					= $form.find('._parcel_wrapper');
		$cvs_wrappper 					= $form.find('._cvs_wrapper');
		$today_deliv_config_wrap		= $form.find('._today_deliv_config_wrap');
		$today_deliv_config_type_wrap 	= $today_deliv_config_wrap.find('._today_deliv_config_type_wrap');
		$today_deliv_config_detail_wrap	= $today_deliv_config_wrap.find('._today_deliv_config_detail_wrap');

		setDelivRegionList(region_list);
		setDecimalData(currency_data);

		$use_cvs_checkbox = $deliv_type_wrap.find('._deliv_option').find('input[name="cvs"]:checkbox');
		$cvs_wrappper.toggle($use_cvs_checkbox.prop('checked'));

		addEvent();
		if ( SITE_COUNTRY_CODE == TAIWAN_COUNTRY_CODE ) {
			addTWEvent();
		}
		if ( modal_type == 'config' ) {
			addDelivContryEvent();
		}
		$form.find('._delete_row_btn').off('click').on('click', function(){
			$(this).parents('._delete_row_wrap').remove();
		});
	};

	var addEvent = function(){
		var $parcel_company_wrap = $form.find('._parcel_company_wrap');
		var $refund_wrap = $form.find('._refund_wrap');

		// 배송방법 변경
		$deliv_type_wrap.find('select').on('change', function(){
			var deliv_type = $(this).val();
			$deliv_pay_type_wrap.toggle(deliv_type != 'no_deliv');
			$deliv_price_type_wrap.toggle(deliv_type != 'no_deliv');
			$deliv_additional_price_wrap.toggle(deliv_type != 'no_deliv');
			$refund_wrap.toggle(deliv_type != 'no_deliv');
			$today_deliv_config_wrap.toggle(deliv_type != 'no_deliv');
			$parcel_company_wrap.hide();
			$cvs_wrappper.hide();

			$deliv_type_wrap.find('._deliv_option').toggle(deliv_type == 'send');
			$deliv_etc_wrap.toggle(deliv_type != 'no_deliv');

			if ( deliv_type == 'send' || deliv_type == 'default' ) {
				$parcel_company_wrap.toggle($deliv_type_wrap.find('._deliv_option').find('input[name="parcel"]:checkbox').prop('checked'));
				$cvs_wrappper.toggle($deliv_type_wrap.find('._deliv_option').find('input[name="cvs"]:checkbox').prop('checked'));
			}
		});

		// 배송방법 -> 택배,소포,등기 일 경우 체크박스 변경 시
		$deliv_type_wrap.find('._deliv_option').find('input[name="parcel"]:checkbox').on('change', function(){
			$parcel_company_wrap.toggle($(this).prop('checked'));
		});

		// 배송비 타입 변경시
		$deliv_price_type_wrap.find('select._deliv_price_type').on('change', function(){
			toggleNpayadditionalDelivPriceInfo();
			var deliv_price_type = $(this).val();
			$deliv_price_type_wrap.find('._deliv_price_type_item_wrap').hide();
			if ( $deliv_price_type_wrap.find('._deliv_price_'+deliv_price_type).length > 0 ) {
				$deliv_price_type_wrap.find('._deliv_price_'+deliv_price_type).show();
			}
			$deliv_price_mix_wrap.toggle( (['weight','quantity','amount'].indexOf(deliv_price_type) == -1 ) );
		});

		// 배송비 > 수량별 배송비 유형 변경 시
		$deliv_price_type_wrap.find('._deliv_price_quantity').find('input:radio').on('change', function(){
			var deliv_quantity_type = $(this).val();
			$deliv_price_type_wrap.find('._deliv_price_quantity').find('._quantity_type_item_wrap').hide();
			$deliv_price_type_wrap.find('._deliv_price_quantity').find('._quantity_type_'+deliv_quantity_type).show();
		});

		// 금액 설정부분
		$deliv_price_type_wrap.find('.input-krw').find('input[type="text"]').each(function(){
			setMoneyFormat($(this));
		});

		$deliv_price_type_wrap.find('.input-number').find('input[type="text"]').each(function(){
			var $_that = $(this);
			set_money_format($(this), $_that.data('decimal-count'));
		});

		// 조건 추가 시
		$deliv_price_type_wrap.find('._add_weight, ._add_quantity, ._add_amount').on('click', function(){
			makeDelivPriceRow( $(this).data('target'), $deliv_price_type_wrap);
		});

		// 지역별 배송비 ------------

		if ( modal_type == 'prod' ) {
			// 기본 지역별 배송비 사용
			$deliv_additional_price_wrap.find('input[name="default_island_use"]:checkbox').on('change', function(){
				var $_deliv_additional_price_wrap = $(this).parents('._deliv_additional_price_wrap');
				$_deliv_additional_price_wrap.find('._use_deliv_additional_price_wrap').toggle(!$(this).prop('checked'));
				var use_island_price = (!$(this).prop('checked') && $_deliv_additional_price_wrap.find('._use_deliv_additional_price_wrap').find('select').val() == 'Y');
				$_deliv_additional_price_wrap.find('._deliv_additional_price_use_wrap').toggle(use_island_price);
			});
		}

		// 지역별 배송비 사용여부 변경
		$deliv_additional_price_wrap.find('._use_deliv_additional_price_wrap').find('select').on('change', function(){
			toggleNpayadditionalDelivPriceInfo();

			var $_deliv_additional_price_wrap = $(this).parents('._deliv_additional_price_wrap');
			$_deliv_additional_price_wrap.find('._deliv_additional_price_use_wrap').toggle($(this).val() == 'Y');
			$_deliv_additional_price_wrap.find('._shopping_additional_price_msg').toggle($(this).val() == 'Y');
		});

		// 지역별 배송비 타입 변경
		$deliv_additional_price_wrap.find('._deliv_additional_price_type_wrap').find('input:radio').on('change', function(){
			toggleNpayadditionalDelivPriceInfo();

			var additional_price_type = $(this).val();
			var $_deliv_additional_price_wrap = $(this).parents('._deliv_additional_price_wrap');
			$_deliv_additional_price_wrap.find('._deliv_additional_item_wrap').hide();
			if ( $_deliv_additional_price_wrap.find('._additional_price_type_'+additional_price_type).length > 0 ){
				$_deliv_additional_price_wrap.find('._additional_price_type_' + additional_price_type).show();
			}
		});

		var $deliv_additional_item_wrap = $deliv_additional_price_wrap.find('._deliv_additional_item_wrap');

		/* 국내 지역별 설정일 경우 */
		$deliv_additional_item_wrap.find('._state').on('change', function(){
			changeDelivRegionState($(this));
		});
		$deliv_additional_item_wrap.find('._city').on('change', function(){
			changeDelivRegionCity();
		});
		/* 우편번호별 설정일 경우 */
		$deliv_additional_item_wrap.find('._zipcode').each(function(){
			setZipcodeFormat($(this));
		});
		/* 금액 설정부분 */
		$deliv_additional_item_wrap.find('.input-krw').find('input[type="text"]').each(function(){
			setMoneyFormat($(this));
		});
		/* 추가 눌렀을 경우 */
		$deliv_additional_item_wrap.find('._add_additional_price_row_btn').on('click', function(){
			makeDelivRegionRow( $(this).data('target'), $(this).parents('._deliv_additional_price_wrap') );
		});
		/* 삭제버튼 */
		$deliv_additional_item_wrap.find('._delete_row_btn').off('click').on('click', function(){
			$(this).parents('._delete_row_wrap').remove();
		});

		/* 오늘 출발/도착 여부 */
		$today_deliv_config_wrap.find('._today_deliv_use_type').on('change', function() {
			switch( this.value ) {
				case 'N':
				case 'D':
					$today_deliv_config_type_wrap.hide();
					$today_deliv_config_detail_wrap.hide();
					break;
				case 'Y':
					$today_deliv_config_type_wrap.show();
					$today_deliv_config_detail_wrap.show();
					break;
			}
		});

		var date_option = {
			dayViewHeaderFormat: 'YYYY MMMM',
			locale: getMomentLangCode(ADMIN_LANG_CODE),
			icons: {
				time: 'zmdi zmdi-time',
				date: 'zmdi zmdi-calendar',
				up: 'zmdi zmdi-chevron-up',
				down: 'zmdi zmdi-chevron-down',
				previous: 'zmdi zmdi-chevron-left',
				next: 'zmdi zmdi-chevron-right',
				today: 'glyphicon glyphicon-screenshot',
				clear: 'glyphicon glyphicon-trash'
			},
			useCurrent: false,
			format:'H:mm',
		};

		/* 오늘 출발/도착 여부 테스트서버 예외처리 */
		var $_arrival_time = $today_deliv_config_detail_wrap.find('._today_arrival_time');
		if ( $_arrival_time.length ) {
			var d = new Date($_arrival_time.val());
			$_arrival_time.datetimepicker(date_option);
			$_arrival_time.data('DateTimePicker').date(d);
		}
		/* ---------------------------------------- */

		changeDelivRegionCity();
		toggleNpayadditionalDelivPriceInfo();
		/* 지역별 배송비 ------------ */


		/* 저장 시 */
		$modal.find('._add_btn').on('click',function(){
			submit();
		});
	};

	var addTWEvent = function(){
		var $use_cvs_checkbox = $deliv_type_wrap.find('._deliv_option').find('input[name="cvs"]:checkbox');
		if ( $use_cvs_checkbox.length === 0 ) return false;

		var $cvs_deliv_price_type_wrap 			= $form.find('._cvs_deliv_price_type_wrap');
		var $cvs_deliv_additional_price_wrap	= $form.find('._cvs_deliv_additional_price_wrap');

		$use_cvs_checkbox.on('change',function(){
			$cvs_wrappper.toggle($(this).prop('checked'));
		});

		var $use_parcel_checkbox = $deliv_type_wrap.find('._deliv_option').find('input[name="parcel"]:checkbox');
		$use_parcel_checkbox.on('change',function(){
			$parcel_wrapper.toggle($(this).prop('checked'));
			$cvs_refund_wrap.find('select').find('option[value="Y"]').prop('disabled', !$(this).prop('checked'));
			if ( !$(this).prop('checked') ) {
				$cvs_refund_wrap.find('select').val('N');
				$cvs_refund_wrap.find('._cvs_refund_price_setting_wrap').toggle(true);
			}

			var additional_price = $cvs_deliv_additional_price_wrap.find('select').val();
			$cvs_deliv_additional_price_wrap.find('select').find('option[value="A"]').prop('disabled', !$(this).prop('checked'));
			if ( additional_price == 'A' ) {
				$cvs_deliv_additional_price_wrap.find('select').val('N');
			}
		});

		$cvs_deliv_price_type_wrap.find('select._deliv_price_type').on('change', function(){
			var deliv_price_type = $(this).val();
			$cvs_deliv_price_type_wrap.find('._deliv_price_type_item_wrap').hide();
			if ( $cvs_deliv_price_type_wrap.find('._deliv_price_'+deliv_price_type).length > 0 ) {
				$cvs_deliv_price_type_wrap.find('._deliv_price_'+deliv_price_type).show();
			}
			//$deliv_price_mix_wrap.toggle( (['weight','quantity','amount'].indexOf(deliv_price_type) == -1 ) );
		});

		// 배송비 > 수량별 배송비 유형 변경 시
		$cvs_deliv_price_type_wrap.find('._deliv_price_quantity').find('input:radio').on('change', function(){
			var deliv_quantity_type = $(this).val();
			$cvs_deliv_price_type_wrap.find('._deliv_price_quantity').find('._quantity_type_item_wrap').hide();
			$cvs_deliv_price_type_wrap.find('._deliv_price_quantity').find('._quantity_type_'+deliv_quantity_type).show();
		});

		// 금액 설정부분
		$cvs_deliv_price_type_wrap.find('.input-krw').find('input[type="text"]').each(function(){
			setMoneyFormat($(this));
		});

		// 조건 추가 시
		$cvs_deliv_price_type_wrap.find('._add_weight, ._add_quantity, ._add_amount').on('click', function(){
			makeDelivPriceRow( $(this).data('target'), $cvs_deliv_price_type_wrap);
		});

		// 반품교환비용 관련
		var $cvs_refund_wrap = $form.find('._refund_wrap._cvs_wrapper');
		$cvs_refund_wrap.find('._cvs_refund_price_setting_wrap').toggle($cvs_refund_wrap.find('select').val() == 'N');
		$cvs_refund_wrap.find('select').on('change', function(){
			var $cvs_refund_price_setting_wrap = $cvs_refund_wrap.find('._cvs_refund_price_setting_wrap');
			$cvs_refund_price_setting_wrap.toggle($(this).val() == 'N');
		});

		$cvs_deliv_additional_price_wrap.find('input[name="cvs_default_island_use"]:checkbox').on('change', function(){
			$cvs_deliv_additional_price_wrap.find('._use_deliv_additional_price_wrap').toggle(!$(this).prop('checked'));
			var use_island_price = (!$(this).prop('checked') && $cvs_deliv_additional_price_wrap.find('._use_deliv_additional_price_wrap').find('select').val() == 'Y');
			$cvs_deliv_additional_price_wrap.find('._deliv_additional_price_use_wrap').toggle(use_island_price);
		});

		// 지역별 배송비 사용여부 변경
		$cvs_deliv_additional_price_wrap.find('._use_deliv_additional_price_wrap').find('select').on('change', function(){
			$cvs_deliv_additional_price_wrap.find('._deliv_additional_price_use_wrap').toggle($(this).val() == 'Y');
			$cvs_deliv_additional_price_wrap.find('._shopping_additional_price_msg').toggle($(this).val() == 'Y');
		});

		// 지역별 배송비 타입 변경
		$cvs_deliv_additional_price_wrap.find('input:radio').on('change', function(){
			var additional_price_type = $(this).val();
			$cvs_deliv_additional_price_wrap.find('._deliv_additional_item_wrap').hide();
			if ( $cvs_deliv_additional_price_wrap.find('._additional_price_type_'+additional_price_type).length > 0 ){
				$cvs_deliv_additional_price_wrap.find('._additional_price_type_' + additional_price_type).show();
			}
		});

		// 국내 지역별 설정일 경우
		$cvs_deliv_additional_price_wrap.find('._state').on('change', function(){
			changeDelivRegionState($(this));
		});
		$cvs_deliv_additional_price_wrap.find('._city').on('change', function(){
			changeDelivRegionCity();
		});
		// 우편번호별 설정일 경우
		$cvs_deliv_additional_price_wrap.find('._zipcode').each(function(){
			setZipcodeFormat($(this));
		});
		// 금액 설정부분
		$cvs_deliv_additional_price_wrap.find('.input-krw').find('input[type="text"]').each(function(){
			setMoneyFormat($(this));
		});
		// 추가 눌렀을 경우
		$cvs_deliv_additional_price_wrap.find('._add_additional_price_row_btn').on('click', function(){
			makeDelivRegionRow( $(this).data('target'), $cvs_deliv_additional_price_wrap );
		});
		// 삭제버튼
		$cvs_deliv_additional_price_wrap.find('._delete_row_btn').off('click').on('click', function(){
			$(this).parents('.input-group').remove();
		});

	};

	var addDelivContryEvent = function(){
		if ( modal_type != 'config' ) return false;

		$deliv_contry_wrap.show();
		var $deliv_country_list = $form.find('._deliv_contry_wrap').find('select[name="deliv_country_list"]');
		var $deliv_post_name_wrap = $form.find('._deliv_post_name_wrap');

		$deliv_country_list.off('change').on('change',function(){
			var site_default_country_code = $(this).data('default_country_code');
			var country_list_data = $deliv_country_list.val();
			$deliv_additional_price_wrap.hide();
			$cvs_wrappper.hide();
			$use_cvs_checkbox.prop('disabled', true);
			if(country_list_data){
				if($.inArray(site_default_country_code, country_list_data) != -1){
					$deliv_additional_price_wrap.show();
					$use_cvs_checkbox.prop('disabled', false);
					$cvs_wrappper.toggle($use_cvs_checkbox.prop('checked'));
				}else{
					if($.inArray('ALL',country_list_data) != -1){//모든국가 선택시
						$deliv_additional_price_wrap.show();
						$use_cvs_checkbox.prop('disabled', false);
						$cvs_wrappper.toggle($use_cvs_checkbox.prop('checked'));
					}
				}

				if(country_list_data.length > 1){
					if($.inArray('ALL',country_list_data) != -1){//모든국가 선택시
						$deliv_country_list.val('ALL').trigger('chosen:updated');
					}
					$deliv_post_name_wrap.show();
				}else{
					$deliv_post_name_wrap.hide();
				}
			}
		});

		$modal.find(".select-chosen").chosen({width: "100%"}).change(function(e){});
		$modal.find('._remove_btn').on('click',function(){
			if ( confirm(getLocalizeString('설명_정말이배송지역을삭제하시겠습니까','','정말 이 배송 지역을 삭제하시겠습니까?')) && SHOP_CONFIG.deleteDelivSetting() ){
				$.cocoaDialog.close();
			}
		});
	};

	var setDecimalData = function(data){
		if ( typeof data == 'object') {
			decimal_data = data;
		}
	};

	var setMoneyFormat = function($obj){
		if ( typeof decimal_data != 'undefined' ){
			set_money_format($obj, decimal_data['decimal_count'], decimal_data['decimal_char'], decimal_data['thousand_char']);
		} else {
			set_money_format($obj);
		}
		// 음수 입력 불가
		$obj.on('keyup', function(){
			var _target_price = parseFloat($(this).val());
			if ( !isNaN(_target_price) && _target_price <= 0 ) {
				$(this).val(_target_price * -1);
			}
		});
	};

	var getNamePre = function(logistics_type){
		var name_pre = '';
		switch ( logistics_type ) {
			case 'CVS':
				name_pre = 'cvs_';
				break;
		}
		return name_pre;
	};

	// 배송비 조건 추가
	var makeDelivPriceRow = function(type, $obj){
		var $row_html, $target;
		var name_pre = '';
		var decimal_setting = '';
		var currency_char = LOCALIZE.getCurrencyChar();
		if ( typeof decimal_data != 'undefined' ){
			decimal_setting = "data-decimal-count='" + decimal_data['decimal_count'] + "' data-decimal-char='" + decimal_data['decimal_char'] + "' data-thousand-char='" + decimal_data['thousand_char'] + "'";
			currency_char = decimal_data['code'];
		}
		switch(type){
			case 'weight':
				$row_html = $(IMWEB_TEMPLATE.loadSimple("TEMPLATE_WEIGHT_RANGE", {flag: 0, weight_price: 0}));
				$target = $obj.find('._add_weight_wrap');
				name_pre = getNamePre($target.data('logistics_type'));
				break;
			case 'quantity':
				$row_html = $(IMWEB_TEMPLATE.loadSimple("TEMPLATE_QUANTITY_RANGE", {flag: 0, quantity_price: 0}));
				$target = $obj.find('._add_quantity_wrap');
				name_pre = getNamePre($target.data('logistics_type'));
				break;
			case 'amount':
				$row_html = $(IMWEB_TEMPLATE.loadSimple("TEMPLATE_AMOUNT_RANGE", {flag: 0, amount_price: 0}));
				$target = $obj.find('._deliv_amount_wrap');
				name_pre = getNamePre($target.data('logistics_type'));
				break;
		}

		if ( typeof $row_html == 'undefined' ) 	return false;
		if ( typeof $target == 'undefined' ) 	return false;

		$target.append($row_html);

		// add Event ---------------------------------------
		$row_html.find('.input-krw').find('input[type="text"]').each(function(){
			setMoneyFormat($(this));
		});
		$row_html.find('.input-number').find('input[type="text"]').each(function(){
			var $_that = $(this);
			set_money_format($_that, $_that.data('decimal-count'));
		});
		$row_html.find('._delete_row_btn').off('click').on('click',function(){
			$row_html.remove();
		});
	};

	// 지역별 배송비 관련 START -----------
	var makeDelivRegionRow = function(type, $obj){
		if ( ['region', 'zipcode'].indexOf(type) == -1 ) return false;

		var currency_char = LOCALIZE.getCurrency();
		var decimal_setting = '';
		if ( typeof decimal_data != 'undefined' ){
			decimal_setting = "data-decimal-count='" + decimal_data['decimal_count'] + "' data-decimal-char='" + decimal_data['decimal_char'] + "' data-thousand-char='" + decimal_data['thousand_char'] + "'";
			currency_char = decimal_data['code'];
		}

		var $row_html;
		var name_pre = getNamePre($obj.data('logistics_type'));
		switch( type ) {
			case 'region':
				var state_str = getLocalizeString('설명_광역시도선택', '', '광역시/도 선택');
				var city_str = getLocalizeString('설명_시군구선택', '', '시/군/구 선택');

				$row_html = $(
					'<div class="input-group-content width-3">' +
					'	<select name="" class="form-control _state" >' +
					'		<option value="">'+state_str+'</option>' +
					'	</select>' +
					'</div>' +
					'<span style="margin-right: 15px;"></span>' +
					'<div class="input-group-content width-3">' +
					'	<select name="'+name_pre+'additional_region_code_list" class="form-control _city">' +
					'		<option value="">'+city_str+'</option>' +
					'	</select>' +
					'</div>' +
					'<div class="input-group-content width-100 input-krw">' +
					'	<span class="control-krw">'+currency_char+'</span>' +
					'	<input type="text" name="'+name_pre+'additional_region_price_list" class="form-control" value="" placeholder="'+getLocalizeString('설명_추가배송비입력', '', '추가 배송비')+'" '+ decimal_setting +'>' +
					'</div>'
				);
				// 시/도 만들어주기
				for ( var _state in shop_deliv_region_list ) {
					$row_html.find('._state').append('<option value="' + _state + '">' + _state + '</option>');
				}
				break;
			case 'zipcode':
				$row_html = $(
					'<div class="input-group-content width-2">' +
					'	<input type="text" name="'+name_pre+'additional_zipcode_start_list" class="form-control _zipcode" value="" placeholder="'+getLocalizeString('설명_우편번호', '', '우편번호')+'">' +
					'</div>' +
					'<div class="visible-xs"></div><span style="margin: 0px 10px;">'+getLocalizeString('설명_물결범위', '', '~')+'</span>' +
					'<div class="input-group-content width-2">' +
					'	<input type="text" name="'+name_pre+'additional_zipcode_end_list" class="form-control _zipcode" value="" placeholder="'+getLocalizeString('설명_우편번호', '', '우편번호')+'">' +
					'</div>' +
					'<div class="input-group-content width-100 input-krw">' +
					'	<span class="control-krw">'+currency_char+'</span>' +
					'	<input type="text" name="'+name_pre+'additional_zipcode_price_list" class="form-control" value="" placeholder="'+getLocalizeString('설명_추가배송비입력', '', '추가 배송비')+'" '+ decimal_setting +'>' +
					'</div>'
				);
				break;
		}
		if ( typeof $row_html == 'undefined' ) return false;

		// 공통부분 설정
		$row_html = $(
			'<div class="input-group" style="line-height: 2.1;padding-bottom: 10px;">' +
			'	<span><a href="javascript:;" class="_delete_row_btn text-gray-light"  style="margin-left:8px"><i class="btl bt-times"></i></a></span>'+
			'</div>'
		).prepend($row_html);
		$obj.find('._additional_price_type_'+type).find('._add_'+type).append($row_html);

		// add Event -----------------------------
		$row_html.find('.input-krw').find('input[type="text"]').each(function(){
			setMoneyFormat($(this));
		});
		$row_html.find('._delete_row_btn').off('click').on('click', function(){
			$row_html.remove();
		});
		if ( type == 'region' ) {
			$row_html.find('._state').on('change', function(){
				changeDelivRegionState($(this));
			});

			$row_html.find('._city').on('change',function(){
				changeDelivRegionCity();
			});
		}
		if ( type == 'zipcode' ){
			$row_html.find('._zipcode').each(function(){
				setZipcodeFormat($(this));
			});
		}
	};
	var setZipcodeFormat = function($obj){
		$obj.attr('maxlength',5);
		$obj.unbind('keyup, keypress');
		$obj.on('keypress', function(e){
			$(this).val($(this).val().replace(/[^0-9]/g, ''));
			return ( e.keyCode >= 48 && e.keyCode <= 57 );
		});
		$obj.on('keyup', function(e){
			$(this).val($(this).val().replace(/[^0-9]/g, ''));
			return ( e.keyCode >= 48 && e.keyCode <= 57 );
		});
	};
	// 국내 지역 등록 --
	var setDelivRegionList = function(list){
		shop_deliv_region_list = list;
	};
	var getDelivRegionList = function(state){
		if ( typeof shop_deliv_region_list[state] == 'undefined' ) return [];
		return shop_deliv_region_list[state];
	};
	var changeDelivRegionState = function($obj){
		var $_city_select = $obj.parents('.input-group').find('select._city');

		var _default_string = getLocalizeString('설명_시군구선택','','시/군/구 선택');
		$_city_select.empty().append('<option value="">'+_default_string+'</option>');

		var city_list = getDelivRegionList($obj.val());
		if ( !$.isEmptyObject(city_list) ) {
			var _city_list = Object.keys(city_list).sort();
			var _city_name = '';
			for ( var i in _city_list ) {
				_city_name = _city_list[i];
				if ( _city_name.trim() == '' ) _city_name = getLocalizeString('설명_전체', '', '전체');
				$_city_select.append('<option value="'+city_list[_city_list[i]]+'">'+_city_name+'</option>');
			}
		}
		changeDelivRegionCity();
	};
	var changeDelivRegionCity  = function(){
		var $deliv_additional_item_wrap = $deliv_additional_price_wrap.find('._deliv_additional_item_wrap');
		var selected_city_list = [];
		$deliv_additional_item_wrap.find('select._city').each(function(){
			selected_city_list.push($(this).val());
		});
		$deliv_additional_item_wrap.find('select._city').each(function(){
			$(this).find('option').attr('disabled', false);
			for ( var i = 0; i < selected_city_list.length; i++) {
				var $_city_option = $(this).find('option[value="'+selected_city_list[i]+'"]');
				if ( !$_city_option.prop('selected') ) {
					$_city_option.attr('disabled', true);
				}
			}
		});
	};

	var toggleNpayadditionalDelivPriceInfo = function(){
		var $toggleInfo = $modal.find('._deliv_additional_item_with_quantity');
		var $data = $form.serializeObject();
		$toggleInfo.hide();
		if ( $data['deliv_price_type'] == 'quantity' && $data['use_deliv_additional_price'] == 'Y') {
			if ( ['region','zipcode'].indexOf($data['additional_price_type']) != -1 ) {
				$toggleInfo.show();
			}
		}
	};
	var openZipcodeList = function(){
		var popup_w = 500;
		var popup_h = 800;
		var popup_top = Math.ceil((window.screen.height - popup_h) / 2 );
		var popup_left = Math.ceil((window.screen.width - popup_w) / 2 );

		var popup_style = '';
		popup_style += 'top=' + popup_top + ',';
		popup_style += 'left=' + popup_left + ',';
		popup_style += 'height=' + popup_h + 'px,';
		popup_style += 'width=' + popup_w + 'px';
		window.open('/admin/ajax/shop/open_zipcode_list.cm','_zipcode_list', popup_style);
	};

	var openTWAddressZipcodeList = function(){
		var popup_w = 500;
		var popup_h = 800;
		var popup_top = Math.ceil((window.screen.height - popup_h) / 2 );
		var popup_left = Math.ceil((window.screen.width - popup_w) / 2 );

		var popup_style = '';
		popup_style += 'top=' + popup_top + ',';
		popup_style += 'left=' + popup_left + ',';
		popup_style += 'height=' + popup_h + 'px,';
		popup_style += 'width=' + popup_w + 'px';
		window.open('/admin/ajax/shop/open_tw_address_zipcode_list.cm','_zipcode_list', popup_style);
	};

	// 지역별 배송비 관련 END -----------

	var checkValidateForm = function(){
		if ( $deliv_type_wrap.find('._deliv_option').find('input[type="checkbox"]:checked').length == 0 ) {
			alert(getLocalizeString('설명_배송방법을하나이상선택해주세요','','배송방법을 하나 이상 선택 해 주세요.'));
			return false;
		}

		if ( !checkValidateAdditionalDelivPrice() ) { return false; }
		return true;
	};


	var checkValidateAdditionalDelivPrice = function(){
		// 지역별 배송비 사용하지 않음일 경우 그냥 트루 리턴
		var $data = $form.serializeObject();
		if ( $data['use_deliv_additional_price'] !== 'Y' ) return true;

		var error_type = '';
		var tmp = [];
		var price = [];

		switch ( $data['additional_price_type'] ) {
			case 'region':
				var target 		= ( !$.isArray($data['additional_region_code_list']) ) ? [ $data['additional_region_code_list'] ] : $data['additional_region_code_list'];
				price 		= ( !$.isArray($data['additional_region_price_list']) ) ? [ $data['additional_region_price_list'] ] : $data['additional_region_price_list'];
				if ( target.length > 0 ) {
					for ( var i in target ) {
						if ( target[i].trim() == '' && price[i].trim() == '') {
							// 다 입력이 안 되어있을 경우
							error_type = 'no_data';
							break;
						}
						if ( target[i].trim() == '' ) {
							// 구간 설정 오류
							error_type = 'error';
							break;
						}
						if ( tmp.indexOf(target[i]) != -1 ) {
							// 시작구간 겹침
							error_type = 'overlap';
							break;
						}
						tmp.push(target[i]);

						// 금액 오류 체크

						if ( price[i].trim() == '' ) {
							error_type = 'price_void';
							break;
						}

						price[i] = parseFloat(price[i]);
						if ( isNaN(price[i]) || price[i] <= 0 ) {
							error_type = 'price_error';
							break;
						}
						if ( error_type != '' ) break;
					}
				}
				break;
			case 'zipcode':
				var start 	= ( !$.isArray($data['additional_zipcode_start_list']) ) ? [ $data['additional_zipcode_start_list'] ] : $data['additional_zipcode_start_list'];
				var end 	= ( !$.isArray($data['additional_zipcode_end_list']) ) ? [ $data['additional_zipcode_end_list'] ] : $data['additional_zipcode_end_list'];
				price 		= ( !$.isArray($data['additional_zipcode_price_list']) ) ? [ $data['additional_zipcode_price_list'] ] : $data['additional_zipcode_price_list'];
				if ( start.length > 0 ) {
					for ( var i in start ) {
						if ( start[i].trim() == '' && end[i].trim() == '' && price[i].trim() == '') {
							// 세 개 다 입력이 안 되어있을 경우
							error_type = 'no_data';
							break;
						}
						if ( start[i].trim() == '' || end[i].trim() == '' ) {
							// 구간 설정 오류
							error_type = 'error';
							break;
						}
						if ( tmp.indexOf(start[i]) != -1 ) {
							// 시작구간 겹침
							error_type = 'overlap';
							break;
						}
						tmp.push(start[i]);
						if ( parseInt(start[i]) > parseInt(end[i]) ) {
							// 시작값이 종료값보다 클 경우
							error_type = 'overlap';
							break;
						}
						// 구간 겹침 체크
						for ( var ii  in start ) {
							if ( start[ii] > start[i] ) {
								if ( end[i] >=  start[ii] ) {
									error_type = 'overlap';
									break;
								}
							}
						}
						if ( price[i].trim() == '' ) {
							error_type = 'price_void';
							break;
						}
						// 금액 오류 체크
						price[i] = parseFloat(price[i]);
						if ( isNaN(price[i]) || price[i] <= 0 ) {
							error_type = 'price_error';
							break;
						}
						if ( error_type != '' ) break;
					}
				}
				break;
			case 'easy_setup':
				price.push($data['land_price']);
				if ( SITE_COUNTRY_CODE == KOREA_COUNTRY_CODE ) {
					price.push($data['jeju_price']);
				}

				if(SITE_COUNTRY_CODE == TAIWAN_COUNTRY_CODE){

					// 금액 오류 체크
					for ( i in price ) {
						if(Array.isArray(price[i])){
							for(_price in price[i]){
								if ( _price.trim() == '' ) {
									error_type = 'price_void';
									break;
								}
								_price = parseFloat(_price);
								if ( isNaN(_price) || _price < 0 ) {
									error_type = 'price_error';
									break;
								}
							}

						}else{
							if ( price[i].trim() == '' ) {
								error_type = 'price_void';
								break;
							}
							price[i] = parseFloat(price[i]);
							if ( isNaN(price[i]) || price[i] < 0 ) {
								error_type = 'price_error';
								break;
							}
						}
					}
				}else{
					// 금액 오류 체크
					for ( i in price ) {
						if ( price[i].trim() == '' ) {
							error_type = 'price_void';
							break;
						}
						price[i] = parseFloat(price[i]);
						if ( isNaN(price[i]) || price[i] < 0 ) {
							error_type = 'price_error';
							break;
						}
					}
				}



				break;
		}

		var error_msg = '';
		switch ( error_type ){
			case 'no_data':
				error_msg = getLocalizeString('설명_지역별배송비조건을확인해주세요','','지역별 배송비 조건을 확인해 주세요.');
				break;
			case 'error':
				error_msg = getLocalizeString('설명_지역별배송비조건을확인해주세요','','지역별 배송비 조건을 확인해 주세요.');
				if ( $data['additional_price_type'] == 'zipcode' ) {
					error_msg += "\n※"+ getLocalizeString('설명_우편번호범위오류안내','','우편번호 범위(시작과 끝 값)에 오류가 있습니다.');
				}
				break;
			case 'overlap':
				error_msg = getLocalizeString('설명_지역별배송비조건을확인해주세요','','지역별 배송비 조건을 확인해 주세요.') + "\n" + getLocalizeString('설명_배송비조건이중복되었습니다', '', '배송비 조건이 중복되었습니다.');
				if ( $data['additional_price_type'] == 'zipcode' ) {
					error_msg += "\n\n※"+ getLocalizeString('설명_중복된우편번호구간을지정할수없습니다','','중복된 우편번호 구간을 지정할 수 없습니다.');
				}
				break;
			case 'price_void':
				error_msg = getLocalizeString('설명_지역별배송비금액을확인해주세요','','지역별 배송비 금액을 확인해 주세요.');
				break;
			case 'price_error':
				error_msg = getLocalizeString('설명_지역별배송비금액을확인해주세요','','지역별 배송비 금액을 확인해 주세요.')
					+"\n"+ getLocalizeString('설명_데이터0이하입력','','0보다 큰 값을 입력해야 합니다.');
				break;
		}

		if ( error_msg != '' ) {
			alert(error_msg);
			return false;
		}

		return true;
	};


	var makeAdditionalPriceList = function($_data){
		if ( typeof $_data['use_deliv_additional_price'] == "undefined" ) return [];
		var deliv_additional_price_list = [];
		if ( $_data['use_deliv_additional_price'] === 'Y' ) {
			var _price = 0;
			$_data['deliv_additional_price_list'] = [];
			switch ( $_data['additional_price_type'] ) {
				case 'region':
					if ( !$.isArray($_data['additional_region_code_list']) ) 	$_data['additional_region_code_list'] 	= [ $_data['additional_region_code_list'] ];
					if ( !$.isArray($_data['additional_region_price_list']) ) 	$_data['additional_region_price_list'] 	= [ $_data['additional_region_price_list'] ];

					for( var i in $_data['additional_region_code_list'] ) {
						_price = parseInt($_data['additional_region_price_list'][i]);
						_price = ( isNaN(_price) ) ? 0 : _price;
						if ( _price < 0 ) _price = 0;
						deliv_additional_price_list.push( { "code": $_data['additional_region_code_list'][i], "price": _price } );
					}
					break;
				case 'zipcode':
					if ( !$.isArray($_data['additional_zipcode_start_list']) ) 	$_data['additional_zipcode_start_list'] 	= [ $_data['additional_zipcode_start_list'] ];
					if ( !$.isArray($_data['additional_zipcode_end_list']) ) 	$_data['additional_zipcode_end_list'] 	= [ $_data['additional_zipcode_end_list'] ];
					if ( !$.isArray($_data['additional_zipcode_price_list']) ) 	$_data['additional_zipcode_price_list'] 	= [ $_data['additional_zipcode_price_list'] ];

					for( var i in $_data['additional_zipcode_start_list'] ) {
						_price = parseInt($_data['additional_zipcode_price_list'][i]);
						_price = ( isNaN(_price) ) ? 0 : _price;
						if ( _price < 0 ) _price = 0;
						deliv_additional_price_list.push( { "start": $_data['additional_zipcode_start_list'][i], "end": $_data['additional_zipcode_end_list'][i], "price": _price } );
					}
					break;
			}
		}
		return deliv_additional_price_list;
	};

	var makeCvsData = function($_data){
		var skip_key = ["cvs_list"];
		var cvs_pre = 'cvs_';

		var cvs_data = (typeof $_data['cvs_data'] != "undefined") ? $_data['cvs_data'] : {};
		for ( var _key in $_data ) {
			if ( skip_key.indexOf(_key) !== -1 ) continue;
			if ( _key.substring(0, cvs_pre.length) === cvs_pre ) {
				cvs_data[_key.substring(cvs_pre.length)] = $_data[_key];
				delete $_data[_key];
			}
		}
		if ( Object.keys(cvs_data).length > 0 ) {
			cvs_data['deliv_additional_price_list'] = makeAdditionalPriceList(cvs_data);
		}
		return cvs_data;
	};

	var submit = function(){
		if ( !checkValidateForm() ) return false;
		var $data = $form.serializeObject();

		// 지역별 배송비 값 만들어주기
		$data['deliv_additional_price_list'] = makeAdditionalPriceList($data);
		$data['cvs_data'] = makeCvsData($data);

		var TAGET;
		if ( modal_type == 'config' ) {
			TAGET = SHOP_CONFIG;
		} else if ( modal_type == 'prod' ) {
			TAGET = SHOP_PROD_MANAGE;
		}

		TAGET.updateDelivSetting($data);
	};
	return {
		"openModal": function(data){
			openModal(data);
		},
		"init": function(type, $obj, region_list, currency_data){
			init(type, $obj, region_list, currency_data);
		},
		"openZipcodeList": function(){
			openZipcodeList();
		},
		"openTWAddressZipcodeList": function(){
			openTWAddressZipcodeList();
		}
	};
}();

/**
 * 상품정보 제공고시 입력화면
 * @type {{init, infoform, dbinfoform, saveinfo}}
 */
var  SHOP_PROD_INFO_FORM = function () {
	var $prod_info;
	var $saveitem;
	var $prod_info_form;
	var $modal;
	var init = function () {
		$modal = $('.modal_admin_prod_info_form');
		$prod_info = $modal.find('#prod_info');
		$saveitem = $modal.find('._item_wrap');
		$prod_info_form = $modal.find('#prod_info_form');

		var prodinfo = SHOP_PROD_MANAGE.getProdinfo();

		infoform($prod_info_form.find($('#selectbox option:selected')).val(),prodinfo,
			$prod_info_form.find($("input[name=no]")).val());

		$prod_info_form.find($('#selectbox')).change(function(){
			infoform($('#selectbox option:selected').val());
		});

		$prod_info_form.find($('#checkBoxId')).change(function(){
			if($(this).is(":checked")){
				$prod_info_form.find('._infoview').val(getLocalizeString("설명_상품상세참조", "", "상품상세 참조"));
			}else{
				$prod_info_form.find('._infoview').val('');
			}
		});

		$modal.find('._loadinfo_btn').on('click', function(){
			if ( $prod_info_form.find('ul._item_wrap').find('li').length == 0 ) {
				alert(getLocalizeString('설명_자주쓰는상품정보제공고시가등록되어있지않습니다', '', "자주쓰는 상품정보제공고시가 등록되어 있지 않습니다. \n정보입력 후 하단의 자주쓰는 정보로 등록 버튼을 이용해 등록해 주세요."));
			}
		});
		$modal.find('._addinfo_btn').on('click', function(){
			if ( checkinfoform() ) return false;
		});

	};
	/**
	 * 임시저장된 상품정보제공고시 가져오기 및 새로입력
	 * @param product
	 * @param infodata
	 * @param no
	 */
	var infoform = function(product,infodata,no){
		$.ajax({
			type: 'POST',
			url: ('/admin/shopping/product/prod_change.cm'),
			dataType: 'html',
			async: true,
			cache: false,
			data : {'product':product,'infodata':infodata,'no':no},
			success: function(html){
				$prod_info.html(html);
				$('#selectbox').val($("input[name=pro]").val());
			}
		});
	};
	/**
	 * 상품정보 제공고시 삭제 및 가져오기
	 * @param mode
	 * @param no
	 */
	var dbinfoform = function(mode,no){
		if ( mode == 'del' && !confirm(getLocalizeString('설명_삭제하시겠습니까', '', '삭제하시겠습니까?')) ) {
			return false;
		}
		$.ajax({
			type: 'POST',
			url: ('/admin/shopping/product/prod_change.cm'),
			dataType: 'html',
			async: true,
			cache: false,
			data : {'mode':mode,'no':no},
			success: function(html){
				if(mode == 'del'){
					$saveitem.find('._item_' + no).remove();
				} else {
					$prod_info.html(html);
					$('#selectbox').val($("input[name=pro]").val());
				}
			}
		});
	};

	/**
	 * 상품정보제공고시 입력 항목에 누락 데이터가 없는지 체크 ,
	 * saveinfo, setprodinfo에 공통으로 들어가던 메소드 위로 뺌
	 * @returns {boolean}
	 */
	var checkinfoform = function(){
		var error = false;
		var data = $prod_info_form.serializeObject();
		$.each(data,function (key, value) {
			if( value.trim() == '') {
				error = true;
				alert(getLocalizeString('설명_입력되지않은항목이있습니다', '', '입력되지 않은 항목이 있습니다'));
				return false;
			}
		});

		return error;
	};

	/**
	 * 상품정보 제공고시 저장
	 * @param infodata
	 */
	var saveinfo = function () {
		if ( checkinfoform() ) return false;

		var data = $prod_info_form.serializeObject();
		data.name = $modal.find('#savename').val().trim();
		if ( data['name'] == '' ) {
			alert(getLocalizeString('셜명_자주쓰는상품제공고시상품명입력', '', '자주쓰는 상품정보 제공고시에 등록할 상품명을 입력해주세요.'));
			return false;
		}

		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/shop/save_prodinfo.cm'),
			dataType: 'json',
			data: {'infodata': data},
			success: function (result) {
				if ( result['msg'] == 'SUCCESS') {
					alert(result.msg);
					$saveitem.append(result.html);
					$modal.find('#savename').val('');
				}
			}
		});
	};

	/**
	 * 작성된 삼풍정보제공고시 임시저장
	 */
	var setprodinfo = function () {
		if ( checkinfoform() ) return false;
		var data = $prod_info_form.serializeObject();
		SHOP_PROD_MANAGE.setProdinfo(data);
		$.cocoaDialog.hide();

	};
	return{
		init: function(){
			init();
		},
		saveinfo: function () {
			saveinfo();
		},
		dbinfoform: function (mode,no) {
			dbinfoform(mode,no);
		},setprodinfo: function () {
			setprodinfo();
		},
	}
}();