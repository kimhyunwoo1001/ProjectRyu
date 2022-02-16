var SHOP_ORDER_MANAGE = function() {
	var $order_list_wrap;
	var $order_list_empty;
	var $order_list_empty_new;
	var $order_list;
	var $order_list_body;
	var $order_list_paging;
	var $order_status_tab;
	var selected_order_list = [];
	var selected_prod_order_list = [];
	var current_page=1;
	var current_base_url='';
	var current_search_data={};
	var $order_search_form;
	var $interlocking_repeat_wrap;
	var current_list_type = '';	/* order:주문관리 return:반품교환관리*/
	var is_run_order_action_process = false;

	var initList = function(type){
		current_list_type = type;
		$order_list_empty = $('#order_list_empty');
		$order_list_empty_new = $('#order_list_empty_new');
		$order_list_wrap = $('#order_list_wrap');
		$order_list = $('#order_list');
		$order_list_body = $('#order_list_body');
		$order_list_paging = $('#order_list_paging');
		$order_status_tab = $('#order_status_tab');
		$interlocking_repeat_wrap = $('#interlocking_repeat_wrap');
		$order_search_form = $('#order_search_form');
	};

	var createEventHover = function(){
		var target_tr;
		$order_list_body.find('tr td').hover(
			function(){
				target_tr = $(this).closest('tr'); // hover된 td의 부모 tr
				if(target_tr.find('td:first').prop('rowSpan') > 1){ // tr의 첫행 (주문번호/시간) 의 rowSpan이 2이상일때
					if($(this).prop('rowSpan') > 1){ // hover된 td의 rowSpan이 2이상일때 (주문번호/시각, 배송정보, 결제내역 등)
						if(!target_tr.find('td:eq(0) [type=checkbox]').prop('checked')){ // 체크가 안되어 있을때만 이벤트 처리
							target_tr.css("background-color", "#F6F6F8");
							for(var i = target_tr.prop('rowIndex'); i < $(this).prop('rowSpan') + target_tr.prop('rowIndex') - 1; i++){ // 묶음주문일때 해당 주문에 포함되는 품목들 모두 같이 처리
								$(this).closest('tbody').find('tr:eq(' + i + ')').css("background-color", "#F6F6F8");
							}
						}
					}else{  // 묶음주문일때 첫행
						if(!target_tr.find('td:eq(2) [type=checkbox]').prop('checked')){ // 첫행의 체크박스 체크여부 확인
							target_tr.find('td').each(function(){
								if($(this).prop('rowSpan') == 1){
									$(this).css("background-color", "#F6F6F8");
								}
							});
						}
					}
				}else{ // 단일주문이거나 묶음주문의 첫번째가 아닌 행들 일때
					target_tr.css("background-color", "#F6F6F8");
				}
			},
			function(){
				if($(this).prop('rowSpan') > 1){
					if(!target_tr.find('td:eq(0) [type=checkbox]').prop('checked')){ // 체크가 안되어 있을때만 이벤트 처리
						for(var i = target_tr.prop('rowIndex') - 1; i < $(this).prop('rowSpan') + target_tr.prop('rowIndex'); i++){ // 묶음주문일때 해당 주문에 포함되는 품목들 모두 같이 처리
							$(this).closest('tbody').find('tr:eq(' + i + ')').css("background-color", "");
						}
					}
				}else{
					var checked = false;
					target_tr.find('[type=checkbox]').each(function(){
						if($(this).prop('checked')){
							checked = true;
						}
					});
					if(!checked){
						target_tr.css("background-color", "");
						target_tr.find('td').css("background-color", "");
					}
				}
			}
		);
	};

	var createEventCellClickCheck = function(){
		var code;
		var target_type;
		var target_tr; // 클릭한 td의 tr

		$order_list_body.find('td').off('click').on('click',function(e){
			if(e.target.tagName == 'TD'){
				target_tr = $(e.target).closest('tr');
				if(target_tr.find('td:first').prop('rowSpan') > 1){ // 주문번호/시각 열이 1보다 클때 (묶음주문)
					if($(e.target).prop('rowSpan') > 1){ // 묶음주문의 합쳐져 있는 셀 (배송정보, 결제내역 등) 클릭시 주문 전체 체크
						if(target_tr.find('td:first input[type="checkbox"]').prop('disabled')) return;
						target_type = 'order';
						code = target_tr.find('td:first input[type="checkbox"]').val();
					}else{ // 묶음 주문의 첫번째 행만 체크되도록
						if(target_tr.find('input[id^="prod_order_list_check"]').prop('disabled')) return;
						target_type = 'prodOrder';
						code = target_tr.find('input[id^="prod_order_list_check"]').val();
					}
				}else{
					code = target_tr.find('td:first input[type="checkbox"]').val();
					if(target_tr.find('td:first input[type="checkbox"]').hasClass('_orderListCheck')){ // 묶음주문 아닐때
						target_type = 'order';
					}else{ // 묶음주문의 첫번째가 아닌 행 클릭시 체크되도록
						if(target_tr.find('input[id^="prod_order_list_check"]').prop('disabled')) return;
						target_type = 'prodOrder';
					}
				}

				if(target_type == 'order'){
					if (checkSelectedByOrder(code)==-1){
						setSelectedByOrder(code);
					}else{
						unsetSelectedByOrder(code);
					}
				}else{ // target == 'prodOrder'
					if (checkSelectedByProdOrder(code)==-1){
						setSelectedByProdOrder(code);
					}else{
						unsetSelectedByProdOrder(code);
					}
				}
			}
		})
	};

	var changeBackGroundByOrder = function(order_code, selected){
		var e = $('#order_list_check_'+order_code).closest('tr').find('td');
		if(selected){
			e.css("background-color", "#F6F6F8");
		}else{
			e.css("background-color",'');
		}
	};

	var changeBackGroundByProdOrder = function(prod_order_code, selected){
		var e = $('#prod_order_list_check_'+prod_order_code).closest('tr');
		if(selected){
			e.find('td').each(function(e, v){
				if(v.rowSpan == 1){
					$(this).css("background-color", "#F6F6F8");
				}
			})
		}else{
			e.css("background-color",'');
			e.find('td').css("background-color",'');
		}
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
		selected_order_list = [];
		selected_prod_order_list = [];
		var $order_list_loader_sub = $('#order_list_loader_sub');
		$.ajax({
			type: 'POST',
			data: {'page':page, 'search_data':search_data, 'base_url':base_url},
			url: ('/admin/ajax/shop/order_list.cm'),
			dataType: 'json',
			beforeSend : function() {
				$order_list_wrap.hide();
				$order_list_loader_sub.show();
			},
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					SHOP_ORDER_MANAGE.unsetAllSelected();
					$order_status_tab.find('._count').text(0);
					$.each(res.status_count, function(status_key,count){
						$order_status_tab.find('._'+status_key+' ._count').text(count);
					});
					//배송정보 등록실패건이 있는경우 표시
					if(res.interlocking_repeat_count > 0){
						$interlocking_repeat_wrap.show();
						$interlocking_repeat_wrap.find("._interlocking_repeat_count").text(res.interlocking_repeat_count);
					}

					if (res.order_count>0){
						$order_list_wrap.show();
						$order_list_empty.hide();
						$order_list_empty_new.hide();
						$order_list_body.html(res.html);
						createEventHover();
						createEventCellClickCheck();
						$order_list_paging.html(res.html_paging);
					}else{
						$order_list_wrap.hide();
						if (search_data.status=='NEW'){	/* 신규주문이 없음 */
							$order_list_empty_new.show();
						}else
							$order_list_empty.show();
					}

					$order_list.find('._order-popover').popover({
						container: 'body',
						html : true
					});
				}else
					alert(res.msg);
				$order_list_loader_sub.hide();
			},
			error : function(res) {
				$order_list_loader_sub.hide();
			}
		});
	};

	/**
	 * 교환 목록 로드
	 * @param page
	 * @param base_url
	 */
	var loadExchangeList = function(page,search_data,base_url){
		current_page = page;
		current_base_url = base_url;
		current_search_data = search_data;
		selected_prod_order_list = [];

		var $order_list_loader_sub = $('#order_list_loader_sub');

		$.ajax({
			type: 'POST',
			data: {'page':page, 'search_data':search_data, 'base_url':base_url},
			url: ('/admin/ajax/shop/order_exchange_list.cm'),
			dataType: 'json',
			beforeSend : function() {
				$order_list_wrap.hide();
				$order_list_loader_sub.show();
			},
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					$order_status_tab.find('._count').text(0);
					$.each(res.status_count, function(status_key, count){
						$order_status_tab.find('._' + status_key + ' ._count').text(count);
					});
					if (res.order_count>0){
						$order_list_empty.hide();
						$order_list_empty_new.hide();
						$order_list_wrap.show();
						$order_list_body.html(res.html);
						createEventHover();
						createEventCellClickCheck();
						$order_list_paging.html(res.html_paging);

						$order_list.find('._order-popover').popover({
							container: 'body',
							html : true
						});
					}else{
						$order_list_wrap.hide();
						if (search_data.status=='NEW'){	/* 신규교환처리 내역이 없음 */
							$order_list_empty_new.show();
						}else
							$order_list_empty.show();
					}
				}else
					alert(res.msg);

				$order_list_loader_sub.hide();
			},
			error : function(res) {
				$order_list_loader_sub.hide();
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
		selected_prod_order_list = [];

		var $order_list_loader_sub = $('#order_list_loader_sub');

		$.ajax({
			type: 'POST',
			data: {'page':page, 'search_data':search_data, 'base_url':base_url},
			url: ('/admin/ajax/shop/order_return_list.cm'),
			dataType: 'json',
			beforeSend : function() {
				$order_list_wrap.hide();
				$order_list_loader_sub.show();
			},
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					$order_status_tab.find('._count').text(0);
					$.each(res.status_count, function(status_key, count){
						$order_status_tab.find('._' + status_key + ' ._count').text(count);
					});
					if (res.order_count>0){
						$order_list_empty.hide();
						$order_list_empty_new.hide();
						$order_list_wrap.show();
						$order_list_body.html(res.html);
						createEventHover();
						createEventCellClickCheck();
						$order_list_paging.html(res.html_paging);

						$order_list.find('._order-popover').popover({
							container: 'body',
							html : true
						});
					}else{
						$order_list_wrap.hide();
						if (search_data.status=='NEW'){	/* 신규반품교환처리 내역이 없음 */
							$order_list_empty_new.show();
						}else
							$order_list_empty.show();
					}
				}else
					alert(res.msg);
				$order_list_loader_sub.hide();
			},
			error : function(res) {
				$order_list_loader_sub.hide();
			}
		});
	};

	/**
	 * 취소 목록 로드
	 * @param page
	 * @param base_url
	 */
	var loadCancelList = function(page,search_data,base_url){
		current_page = page;
		current_base_url = base_url;
		current_search_data = search_data;
		selected_prod_order_list = [];

		var $order_list_loader_sub = $('#order_list_loader_sub');

		$.ajax({
			type: 'POST',
			data: {'page':page, 'search_data':search_data, 'base_url':base_url},
			url: ('/admin/ajax/shop/order_cancel_list.cm'),
			dataType: 'json',
			beforeSend : function() {
				$order_list_wrap.hide();
				$order_list_loader_sub.show();
			},
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					$order_status_tab.find('._count').text(0);
					$.each(res.status_count, function(status_key, count){
						$order_status_tab.find('._' + status_key + ' ._count').text(count);
					});
					if (res.order_count>0){
						$order_list_empty.hide();
						$order_list_empty_new.hide();
						$order_list_wrap.show();
						$order_list_body.html(res.html);
						createEventHover();
						createEventCellClickCheck();
						$order_list_paging.html(res.html_paging);

						$order_list.find('._order-popover').popover({
							container: 'body',
							html : true
						});
					}else{
						$order_list_wrap.hide();
						if (search_data.status=='NEW'){	/* 신규반품교환처리 내역이 없음 */
							$order_list_empty_new.show();
						}else
							$order_list_empty.show();
					}
				}else
					alert(res.msg);
				$order_list_loader_sub.hide();
			},
			error : function(res) {
				$order_list_loader_sub.hide();
			}
		});
	};

	/**
	 * 주문 목록 재로드
	 */
	var reloadList = function(){
		if (current_list_type=='return')
			loadReturnList(current_page, current_search_data, current_base_url);
		else if (current_list_type=='cancel')
			loadCancelList(current_page, current_search_data, current_base_url);
		else if (current_list_type=='exchange')
			loadExchangeList(current_page, current_search_data, current_base_url);
		else
			loadList(current_page, current_search_data, current_base_url);
	};

	/**
	 * 특정 주문 코드가 선택되어있는지 확인
	 * @param order_code
	 * @returns {number}
	 */
	var checkSelectedByOrder = function(order_code) {
		var i = 0;
		for (i = 0; i < selected_order_list.length; i++) {
			if (selected_order_list[i] == order_code) return i;
		}
		return -1;
	};

	/**
	 * 특정 품목 주문 코드가 선택되어있는지 확인
	 * @param prod_order_code
	 * @returns {number}
	 */
	var checkSelectedByProdOrder = function(prod_order_code) {
		var i = 0;
		for (i = 0; i < selected_prod_order_list.length; i++) {
			if (selected_prod_order_list[i] == prod_order_code) return i;
		}
		return -1;
	};

	/**
	 * 전체 주문 선택 처리
	 * @param order_code
	 */
	var setAllSelected = function(){
		$('#order_list_allcheck').prop('checked', true);
		var chkList = $order_list.find("input._orderListCheck");
		chkList.each(function(){
			setSelectedByOrder($(this).val());
		});
	};

	/**
	 * 전체 주문 선택 해제 처리
	 * @param order_code
	 */
	var unsetAllSelected = function(){
		$('#order_list_allcheck').prop('checked', false);
		var chkList = $order_list.find("input._orderListCheck");
		chkList.each(function(){
			unsetSelectedByOrder($(this).val());
		});
	};

	/**
	 * 특정 주문코드 선택 처리
	 * @param order_code
	 */
	var setSelectedByOrder = function(order_code){
		var n = checkSelectedByOrder(order_code);
		if (n==-1){
			selected_order_list.push(order_code);
			$('#order_list_check_'+order_code).prop('checked',true);
			changeBackGroundByOrder(order_code, true);

			/* 해당 주문에 속한 품목주문들을 모두 체크 처리 */
			$order_list.find("input._prodOrderListCheck_"+order_code).each(function(){
				if ($(this).hasClass('_disabled')) return;
				setSelectedByProdOrder($(this).val());
			});
		}
	};

	/**
	 * 특정 주문코드 선택 해제 처리
	 * @param order_code
	 */
	var unsetSelectedByOrder = function(order_code){
		var n = checkSelectedByOrder(order_code);
		if (n>=0){
			selected_order_list.splice(n,1);
			$('#order_list_check_'+order_code).prop('checked',false);
			changeBackGroundByOrder(order_code, false);

			/* 해당 주문에 속한 품목주문들을 모두 체크 해제 처리 */
			$order_list.find("input._prodOrderListCheck_"+order_code).each(function(){
				unsetSelectedByProdOrder($(this).val());
			});
		}
	};

	/**
	 * 특정 품목 주문코드 선택 처리
	 * @param prod_order_code
	 */
	var setSelectedByProdOrder = function(prod_order_code){
		var n = checkSelectedByProdOrder(prod_order_code);
		if (n==-1){
			selected_prod_order_list.push(prod_order_code);
			$('#prod_order_list_check_'+prod_order_code).prop('checked',true);
			changeBackGroundByProdOrder(prod_order_code, true);
		}
	};

	/**
	 * 특정 품목 주문코드 선택 해제 처리
	 * @param prod_order_code
	 */
	var unsetSelectedByProdOrder = function(prod_order_code){
		var n = checkSelectedByProdOrder(prod_order_code);
		if (n>=0){
			selected_prod_order_list.splice(n,1);
			$('#prod_order_list_check_'+prod_order_code).prop('checked',false);
			changeBackGroundByProdOrder(prod_order_code, false);
		}
	};

	/**
	 * 주문 액션 처리전 컨펌
	 * @param action_code 주문액션코드
	 * @param prod_order_code_list
	 */
	var runOrderActionConfirm = function(action_code, prod_order_code_list){
		if (prod_order_code_list.length==0){
			alert(getLocalizeString("설명_선택한주문이없습니다", "", "선택한 주문이 없습니다"));
			return;
		}
		$.ajax({
			type : 'POST',
			data : {'prod_order_code_list' : prod_order_code_list, 'action_code': action_code},
			url : ('/admin/ajax/shop/order_action_confirm.cm'),
			dataType : 'json',
			success : function(res){
				if (res.msg=='SUCCESS'){
					var $html = $(res.html);
					var $submit = $html.find('._submit');
					var $cancel = $html.find('._cancel');
					var $form = $html.find('#order_action_confirm_form');
					$cancel.on('click', function(){	/* 취소 처리 */
						$.cocoaDialog.hide();
					});
					$submit.on('click', function(){	/* 확인 처리 */
						if (res.prod_order_code_list.length>0){	/* 처리가능한 주문이 있을 경우 */
							$('#button_loading').show();
							var param = $form.serializeObject();
							runOrderAction(action_code, res.prod_order_code_list, param);
						}else{
							$.cocoaDialog.hide();
						}

					});
					// 폼 유효성 검사 추가
					$form.bind('submit', function(){
						if ( res.prod_order_code_list.length>0 ) {	/* 처리가능한 주문이 있을 경우 */
							$('#button_loading').show();
							var param = $(this).serializeObject();
							runOrderAction(action_code, res.prod_order_code_list, param);
						}
						return false;
					});
					// 여러 번 클릭시 계산오류 방지
					$.cocoaDialog.hide();
					$.cocoaDialog.open({type : 'admin_' + action_code.toLowerCase(), custom_popup : $html, width : res.dialog_width});
				}else{
					alert(res.msg);
				}
			}
		});
	};

	/**
	 * 주문 액션 처리
	 * @param action_code 변경하려는상태
	 * @param prod_order_list array
	 * @param param
	 */
	var runOrderAction = function(action_code, prod_order_code_list, param) {
		if ( is_run_order_action_process ) return;
		is_run_order_action_process = true;
		$.ajax({
			type : 'POST',
			data : {'prod_order_code_list' : prod_order_code_list, 'action_code' : action_code, 'param': param},
			url : ('/admin/ajax/shop/order_action.cm'),
			dataType : 'json',
			success : function(res){
				$('#button_loading').hide();
				if (res.msg=='SUCCESS'){
					runOrderActionComplete(res.result_log, action_code);
				}else{
					alert(res.msg);
					is_run_order_action_process = false;
					if (res.hide_dialog=='Y'){
						$.cocoaDialog.hide();
						reloadList();
					}
				}
			}
		});
	};

	var runOrderActionComplete = function(result_log, action_code){
		$.ajax({
			type : 'POST',
			data : {'result_log' : result_log, 'action_code' : action_code},
			url : ('/admin/ajax/shop/order_action_complete.cm'),
			dataType : 'json',
			success : function(res){
				if(res.msg == 'SUCCESS'){
					ADMIN.hideLoader();
					$.cocoaDialog.hide();
					var $html = $(res.html);
					var $submit = $html.find('._submit');
					$submit.on('click', function(){    /* 확인 처리 */
						$.cocoaDialog.hide();
						reloadList();
					});
					$.cocoaDialog.open({type : 'admin', custom_popup : $html, width : 550});
					is_run_order_action_process = false;
				}else{
					alert(res.msg);
					$.cocoaDialog.hide();
					reloadList();
				}
			}
		});
	};


	var openCreateLogisticsOrder = function(prod_order_code){
		$.ajax({
			"type": "POST",
			"data": {"prod_order_code":prod_order_code},
			"url": "/admin/ajax/shop/open_logistics_order_create.cm",
			"dataType": "json",
			"success": function (res) {
				if ( typeof res['html'] != "undefined" ) {
					var $html = $(res.html);
					var $submit = $html.find('._confirm');
					$submit.on('click', function(){
						var update_status = $(this).data('action');
						createLogisticsOrder(prod_order_code, update_status);
					});
					$.cocoaDialog.open({type: 'admin',custom_popup: $html});

				}
			}
		});
	};

	var createLogisticsOrder = function(prod_order_code, action) {
		$.ajax({
			"type": "POST",
			"data": {"prod_order_code":prod_order_code, "action": action},
			"url": "/admin/ajax/shop/create_logistics_order.cm",
			"dataType": "json",
			"success": function (res) {
				$.ajax({
					"type": "POST",
					"data": {"result": res.msg, "prod_order_code": prod_order_code, "mode": "create"},
					"url": "/admin/ajax/shop/open_logistics_order_end.cm",
					"dataType": "json",
					"success": function(res){
						if ( typeof res['html'] != "undefined" ) {
							// 확인 버튼 액션 추가
							var $html = $(res.html);
							var $submit = $html.find('._submit, ._confirm');
							$submit.on('click', function(){
								if ( res.action_code !== '' ) {
									runOrderAction(res.action_code, res.prod_order_code_list);
								} else {
									$.cocoaDialog.hide();
									if ( res['msg'] === 'SUCCESS' ) {
										reloadList();
									}
								}
							});
							$.cocoaDialog.open({type: 'admin',custom_popup: $html});
						}
					}
				});
			}
		});

	};

	var openCancelLogisticsOrder = function(prod_order_code, type){
		$.ajax({
			"type": "POST",
			"data": {"prod_order_code":prod_order_code, "type": type},
			"url": "/admin/ajax/shop/open_logistics_order_cancel.cm",
			"dataType": "json",
			"success": function (res) {
				if ( typeof res['html'] != "undefined" ) {
					var $html = $(res.html);
					if ( res['msg'] === 'SUCCESS' ) {
						var $submit = $html.find('._confirm');
						$submit.on('click', function(){
							cancelLogisticsOrder(prod_order_code, type);
						});
					}
					$.cocoaDialog.open({type: 'admin',custom_popup: $html});
				}
			}
		});
	};

	var cancelLogisticsOrder = function(prod_order_code, type){
		$.ajax({
			"type": "POST",
			"data": {"prod_order_code":prod_order_code, "type": type},
			"url": "/admin/ajax/shop/cancel_logistics_order.cm",
			"dataType": "json",
			"success": function (res) {
				$.ajax({
					"type": "POST",
					"data": {"result": res.msg, "prod_order_code": prod_order_code, "mode": "cancel"},
					"url": "/admin/ajax/shop/open_logistics_order_end.cm",
					"dataType": "json",
					"success": function(res){
						if ( typeof res['html'] != "undefined" ) {
							// 확인 버튼 액션 추가
							var $html = $(res.html);
							var $submit = $html.find('._submit, ._confirm');
							$submit.on('click', function(){
								$.cocoaDialog.hide();
								if ( res['msg'] === 'SUCCESS' ) {
									reloadList();
								}
							});
							$.cocoaDialog.open({type: 'admin',custom_popup: $html});
						}
					}
				});
			}
		});
	};

	var openCreateReturnLogisticsOrder = function(prod_order_code){
		$.ajax({
			"type": "POST",
			"data": {"prod_order_code":prod_order_code},
			"url": "/admin/ajax/shop/open_return_logistics_order_create.cm",
			"dataType": "json",
			"success": function (res) {
				if ( typeof res['html'] != "undefined" ) {
					var $html = $(res.html);
					var $submit = $html.find('._confirm');
					$submit.on('click', function(){
						createReturnLogisticsOrder(prod_order_code);
					});
					$.cocoaDialog.open({type: 'admin',custom_popup: $html});

				}
			}
		});
	};

	var createReturnLogisticsOrder = function(prod_order_code) {
		$.ajax({
			"type": "POST",
			"data": {"prod_order_code":prod_order_code},
			"url": "/admin/ajax/shop/create_return_logistics_order.cm",
			"dataType": "json",
			"success": function (res) {
				$.ajax({
					"type": "POST",
					"data": {"result": res.msg, "prod_order_code": prod_order_code, "mode": "create"},
					"url": "/admin/ajax/shop/open_logistics_order_end.cm",
					"dataType": "json",
					"success": function(res){
						if ( typeof res['html'] != "undefined" ) {
							// 확인 버튼 액션 추가
							var $html = $(res.html);
							var $submit = $html.find('._submit, ._confirm');
							$submit.on('click', function(){
								if ( res.action_code !== '' ) {
									runOrderAction(res.action_code, res.prod_order_code_list);
								} else {
									$.cocoaDialog.hide();
									if ( res['msg'] === 'SUCCESS' ) {
										reloadList();
									}
								}
							});
							$.cocoaDialog.open({type: 'admin',custom_popup: $html});
						}
					}
				});
			}
		});

	};


	var openLogisticsOrderQuery = function(prod_order_code) {
		$.ajax({
			"type": "POST",
			"data": {"prod_order_code":prod_order_code},
			"url": "/admin/ajax/shop/open_logistics_order_query.cm",
			"dataType": "json",
			"success": function (res) {
				if ( typeof res['html'] != "undefined" ) {
					var $html = $(res.html);
					$.cocoaDialog.open({type: 'admin',custom_popup: $html});
				}
			},
			"complete": function(res){
				//console.log(res);
			}
		});
	};

	/**
	 * 주문 데이터 변경
	 * @param type parcel_company/parcel_no
	 * @param prod_order_code 품목주문코드
	 * @param deliv_group_code
	 * @param value 택배사코드/송장번호
	 */
	var updateOrderData = function(type, prod_order_code, deliv_group_code, value){
		var $shipping_wrapper = $('.'+prod_order_code+'_shipping_wrapper');
		$shipping_wrapper.find('.shipping_wrapper ').hide();
		if ( value === 'ecpay_auto' ) {
			$shipping_wrapper.find('.ecpay_shipping_order_wrapper').show();
		} else {
			$shipping_wrapper.find('.normal_shipping_order_wrapper').show();
		}

		$('#status2_loading_' + prod_order_code).show();
		$.ajax({
			type: 'POST',
			data: {'prod_order_code':prod_order_code, 'deliv_group_code':deliv_group_code, 'type':type, 'value':value},
			url: ('/admin/ajax/shop/order_update_data.cm'),
			dataType: 'json',
			success: function (res) {
				$('#status2_loading_' + prod_order_code).hide();
				if(res.msg == 'SUCCESS'){
					if (type=='parcel_company'){
						$('#parcel_no_' + prod_order_code).val('').focus();
					}else if (type=='parcel_no'){
						if (res.send_available=='Y'){
							if ( res.is_changed_deliv_data == 'Y' ){ alert(getLocalizeString("설명_해당주문서의배송정보가변경되었습니다발송전확인바랍니다", "", "해당 주문서의 배송정보가 변경되었습니다.\n발송 전 확인 바랍니다.")); }
							if ( confirm(getLocalizeString("설명_해당주문을발송처리하시겠습니까", "", "해당 주문을 발송 처리 하시겠습니까?")) ) {
								ADMIN.showLoader();
								runOrderAction('SEND', res.relative_prod_order_list,{});
							} else {
								reloadList();
							}
						}else{
							reloadList();
						}
					}
				}else{
					alert(res.msg);

				}
			}
		});
	};

	var openOrdererInfo = function(prod_order_code){
		$.ajax({
			type: 'POST',
			data: {'prod_order_code':prod_order_code},
			url: ('/admin/ajax/shop/get_orderer_info.cm'),
			dataType: 'html',
			success: function (html) {
				$.cocoaDialog.open({type:'admin',custom_popup:html,width:550});
			}
		});
	};

	var openShopWriterInfo = function(member_code){
		$.ajax({
			type: 'POST',
			data: {'member_code': member_code},
			url: ('/admin/ajax/shop/get_shop_writer_info.cm'),
			dataType: 'json',
			success: function(res){
				if(res.msg == 'SUCCESS'){
					$.cocoaDialog.open({type: 'admin',custom_popup: res.html});
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var openOrderPrint = function(order_no){
		$.ajax({
			type : 'POST',
			data : {'order_no' : order_no},
			url : ('/admin/ajax/shop/get_order_print.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					$.cocoaDialog.open({type : 'admin_order_print', custom_popup : res.html});
					$('.modal_admin_order_print').find('.modal-content').css('border', '0px');		// 모달창 자체 border 때문에 프린트시 border 도 같이 인쇄표시되므로 없애줌
					$('.modal_admin_order_print').find('.modal-content').print();
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var openOrderPrintPopup = function(){
		if ( selected_order_list.length ) {
			var _width = 1180;
			var _height = 840;

			var popupX = (window.screen.width / 2) - (_width / 2);
			var popupY= (window.screen.height / 2) - (_height * 0.6);

			var _args = "width={width},height={height},left={left},top={top}";
			_args = _args.replace("{width}", _width);
			_args = _args.replace("{height}", _height);
			_args = _args.replace("{left}", popupX);
			_args = _args.replace("{top}", popupY);

			console.log(_args);
			var order_print_popup = window.open('/admin/ajax/shop/get_order_print_popup.cm', 'order_print_popup', _args);
			var $_form = $('#formOrderPrintMulti');

			$_form.empty();
			var _fragment = document.createDocumentFragment();
			selected_order_list.forEach(function(order_code, v) {
				_fragment.append($('<input type="hidden" name="order_code[]" value="' + order_code + '">')[0])
			});

			$_form.append(_fragment);
			$_form.submit();

			order_print_popup.print();
		} else {
			alert(getLocalizeString("설명_선택한주문이없습니다", "", "선택한 주문이 없습니다"));
		}
	};

	var openLogisticsOrderPopup = function(prod_order_code){
		var $form = $(document.createElement('form'));
		var popname = 'logistics_order_print';

		$form.attr("method","post");
		$form.attr("action", "/admin/ajax/shop/get_logistics_order_print.cm");
		$form.attr("target", popname);

		var $input = $("<input />");
		$input.attr("type", "hidden");
		$input.attr("name", "prod_order_code");
		$input.attr("value", prod_order_code);
		$form.append($input);
		var $body = $('body');
		if ( $body.find('.logistics_order_frm').length == 0 ) {
			$body.append($('<div class="logistics_order_frm"></div>'));
		}
		$body.find('.logistics_order_frm').html($form);


		var popup_w = 800;
		var popup_h = 620;
		var popup_top = Math.ceil((window.screen.height - popup_h) / 2 );
		var popup_left = Math.ceil((window.screen.width - popup_w) / 2 );

		var popup_style = '';
		popup_style += 'top=' + popup_top + ',';
		popup_style += 'left=' + popup_left + ',';
		popup_style += 'height=' + popup_h + 'px,';
		popup_style += 'width=' + popup_w + 'px';

		window.open('', popname, 'toolbar=no, channelmode=no, location=no, directories=no, menubar=no, scrollbars=yes, resizable=yes, status=yes, '+popup_style);
		$form.submit();
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
			dataType : 'json',
			success : function(res){
				if ( res.msg == 'SUCCESS' ) {
					$.cocoaDialog.open({type : 'admin', custom_popup : res.html, width : 550});
				} else {
					alert(res.msg);
				}
			}
		});
	};

	/**
	 * 키워드 서치 시작
	 */
	var startKeywordSearch = function(){
		var keyword = $.trim($order_search_form.find("input._keyword_search").val());
		var is_all_status_search = ( $order_search_form.find("input._is_all_status_search").prop('checked') ? 'Y' : 'N' );

		var url = current_base_url+'&keyword='+encodeURIComponent(keyword)+'&page=1&reset_status=Y';

		var $_is_all_status_search = $order_search_form.find("input._is_all_status_search");
		if ( $_is_all_status_search.length && $_is_all_status_search.prop('checked') ) {
			url += '&is_all_status_search=' + is_all_status_search;
		} else {
			url += '&is_all_status_search=N';
		}

		//alert(current_base_url);
		window.location.href = url;
	};

	var template_list = {};
	var loadTemplate = function(code, data) {
		if ( template_list[code] == void 0 ) { template_list[code] = $("#" + code).html();}
		var template = template_list[code];

		if ( data != void 0 ) {
			Object.keys(data).forEach(function(k) {
				template = template.replace(new RegExp("\\{" + k + "\\}", "g"), data[k]);
			});
		}

		return template;
	};

	var openParcelBatch = function(){
		var file_name = "";
		$.ajax({
			type: 'POST',
			data: {},
			url: ('/admin/ajax/shop/open_order_batch.cm'),
			dataType: 'html',
			success: function (html) {
				var $modal_admin_parcel_batch;
				var handle_interval = 0;
				var $html = $(html);
				var $upload_btn = $html.find('._upload');
				var $_order_batch_request_list = $html.find('#order_batch_request_list');

				var loadOrderBatchRequestList = function() {
					$.ajax({
						type : 'POST',
						data : {},
						url : ('/admin/ajax/shop/load_order_batch_request_list.cm'),
						dataType : 'json',
						success : function(res){
							if ( res.msg == 'SUCCESS' ) {
								$_order_batch_request_list.html(res.html);
								if ( $modal_admin_parcel_batch && $modal_admin_parcel_batch.is(':visible') ) {
									if ( res.is_processing ) {
										clearTimeout(handle_interval);
										handle_interval = setTimeout(function() { loadOrderBatchRequestList(); }, 1000);
									}
								}
							} else {
								$_order_batch_request_list.empty();
							}
						}
					});
				};

				$upload_btn.fileupload({
					url: '/admin/ajax/excel_upload.cm',
					formData: {type: 'invoice'},
					dataType: 'json',
					singleFileUploads: false,
					limitMultiFileUploads: 1,
					dropZone: null,
					start: function(e, data){},
					progress: function(e, data){},
					done: function(e, data){
						file_name = data.result.file_name;
						loadOrderBatchRequestList();
					},
					fail: function(e, data){
						alert(getLocalizeString("설명_업로드에실패하였습니다", "", "업로드에 실패 하였습니다."));
					}
				});

				$.cocoaDialog.open({type : 'admin_parcel_batch', custom_popup : $html});
				$('[data-toggle="tabs"] a').click(function(e){ e.preventDefault(); $(this).tab('show'); });
				$modal_admin_parcel_batch = $(".modal_admin_parcel_batch");
				loadOrderBatchRequestList();
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

	/* 주문관리 도움말 다이얼로그 */
	var showOrderHelp = function(type){
		$.ajax({
			type: 'POST',
			data: {},
			url: ('/admin/ajax/shop/order_help_' + type + '.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (res) {
				var $html = $(res);
				$.cocoaDialog.open({type:'admin',custom_popup:$html});
			}
		});
	};

	/**
	 * 통합송장입력/개별송장입력 전환
	 * @param value 개별(N)/통합(Y)
	 **/
	var setMixParcelNo = function(order_code, deliv_group_code, mix_code, value){
		$.ajax({
			type: 'POST',
			data: {"order_code":order_code, "deliv_group_code":deliv_group_code, 'mix_code': mix_code, "value":value},
			url: ('/admin/ajax/shop/set_mix_parcel_no.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if ( res['msg'] === 'SUCCESS' ) {
					reloadList();
				} else {
					alert(res['msg']);
				}
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

	var openOrderDetail = function(order_no){
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/shop/open_order_detail.cm'),
			data: {order_no: order_no},
			dataType: 'html',
			async: false,
			cache: false,
			success: function (html) {
				$.cocoaDialog.open({type : 'open_order_detail', custom_popup : html, width : 550});
			}
		});
	};

	var openModalOrderExcelDownload = function(type, filter){
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/shop/open_download_excel_order_list.cm'),
			data: {'type': type, 'filter': filter},
			dataType: 'html',
			async: false,
			cache: false,
			success: function (html) {
				var $_html = $(html);
				$.cocoaDialog.open({type : 'admin_order_excel_download', custom_popup : $_html, width : 350});
				SHOP_ORDER_MANAGE.changeOrderExcelDownloadTarget($_html.find('input[name="target"]').val());
			}
		});
	};

	var openGoodsflowDlvmgrConfirm = function(request_type){
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/shop/check_goodsflow_delivery_service_setting.cm'),
			data: {},
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if(res.msg === 'SUCCESS'){
					if(res.detail_list === 'Y'){
						if (selected_prod_order_list.length === 0){
							alert(getLocalizeString("설명_선택한주문이없습니다", "", "선택한 주문이 없습니다"));
						}else{
							$.ajax({
								type : 'POST',
								data : { 'prod_order_code_list' : selected_prod_order_list, 'request_type' : request_type },
								url : ('/admin/ajax/shop/goodsflow_delivery_service_orders_confirm.cm'),
								dataType : 'json',
								success : function(res){
									if (res.msg === 'SUCCESS'){
										var $html = $(res.html);
										var $submit = $html.find('._submit');
										var $cancel = $html.find('._cancel');
										var $form = $html.find('#orders_confirm_form');

										$submit.on('click', function(){	/* 확인 처리 */
											if ( Object.keys(res.available_list).length > 0 ){	/* 처리가능한 주문이 있을 경우 */
												$('#button_loading').show();
												$cancel.hide();
												$submit.hide();
												var param = $form.serializeObject();
												requestGoodsflowOrders(res.available_list);
											}else{
												$.cocoaDialog.hide();
											}
										});

										// 여러 번 클릭시 계산오류 방지
										$.cocoaDialog.hide();
										$.cocoaDialog.open({type : 'admin_test', custom_popup : $html, "close_block" : true});
									}else{
										alert(res.msg);
									}
								}
							});
						}
					}else{
						$.cocoaDialog.open({
							type: 'alert_responsive',
							content: getLocalizeString("설명_자동송장출력을위해서는서비스신청필요", "", "자동 송장출력을 위해서는 서비스 신청이 필요합니다.<br/><strong>결제 부가서비스 > 자동 송장출력 신청/관리</strong> 메뉴를 통해 택배회사를 등록해 주세요."),
							confirm_text: getLocalizeString('버튼_등록하기', '', '등록하기'),
							cancel_text: getLocalizeString('버튼_취소', '', '취소')
						}, function(){
							window.open('/admin/config/goodsflow');
						});
					}
				}else{
					alert(res.msg);
				}
			},
			error : function (error_res){
				alert(error_res.responseText);
			}
		});
	};

	var openGoodsflowDlvmgrConfirmInBatch = function(){
		var data = $('#goodsflow_form').serializeObject();
		$.ajax({
			type : 'POST',
			url : ('/admin/ajax/shop/get_invoice_output_list.cm'),
			data : data,
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg === 'SUCCESS'){
					if ( Object.keys(res.available_list).length > 0 ){	/* 처리가능한 주문이 있을 경우 */
						requestGoodsflowOrders(res.available_list);
					}else{
						alert(getLocalizeString('설명_송장을출력할수있는주문이없습니다', '', '송장을 출력할 수 있는 주문이 없습니다.'))
					}
				}else{
					alert(res.msg);
				}
			},
			error : function(error_res){
				alert(error_res.responseText);
			}
		});
	};

	var requestGoodsflowOrders = function(available_list){
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/shop/request_goodsflow_delivery_service_orders.cm'),
			data: { available_list : available_list},
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				var $submit = $('._submit');
				var $cancel = $('._cancel');
				var $button_loading = $('#button_loading');
				var $form = $('#orders_confirm_form');
				$button_loading.hide();
				if(res.msg === 'SUCCESS'){
					var url = '';
					url += res.url + '?';
					url += 'OTP=' + res.otp;
					url += '&responseURL=' + res.response_url;
					url += '&id=' + res.id;

					var popupWidth = 1200;
					var popupHeight = 800;
					var popupX = (document.body.offsetWidth / 2) - (popupWidth / 2);
					var popupY= (document.body.offsetHeight / 2) - (popupHeight / 2);
					windowOpen('GoodsFlowDeliveryService', url, popupWidth, popupHeight, 'yes', 'post', popupX, popupY);

					$.cocoaDialog.close();

					runOrderActionComplete('', 'goodsflow_dlvmgr');
				}else{
					$submit.show();
					$cancel.show();
					alert(res.msg);
				}
			},
			error : function (error_res){
				alert(error_res.responseText);
			}
		});
	};

	var checkGoodsflowContracts = function(request_claim_type){
		if ( selected_prod_order_list.length === 0 ){
			alert(getLocalizeString("설명_선택한주문이없습니다", "", "선택한 주문이 없습니다"));
			return;
		}
		$.ajax({
			type : 'POST',
			url : ('/admin/ajax/shop/check_goodsflow_contracts.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if ( res.msg === 'plural' ){ /* 택배사 복수 등록. 택배사 선택 */
					choiceGoodsflowContracts(request_claim_type);
				} else if( res.msg === 'singular' ) { /* 택배사 1개. 바로 진행 */
					openGoodsflowReturnConfirm(res.center_code,request_claim_type);
				} else {
					alert(res.msg);
				}
			},
			error : function(error_res){
				alert(error_res.responseText);
			}
		});
	};

	var choiceGoodsflowContracts = function(request_claim_type){
		$.ajax({
			type : 'POST',
			data : {},
			url : ('/admin/ajax/shop/choice_goodsflow_contracts.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg === 'SUCCESS'){
					var $html = $(res.html);
					var $submit = $html.find('._submit');
					var $form = $html.find('#choice_goodsflow_contracts_form');
					$submit.on('click', function(){	/* 확인 처리 */
						var param = $form.serializeObject();
						openGoodsflowReturnConfirm(param.center_code, request_claim_type);
					});
					$form.bind('submit', function(){
						var param = $(this).serializeObject();
						openGoodsflowReturnConfirm(param.center_code, request_claim_type);
					});

					$.cocoaDialog.hide();
					$.cocoaDialog.open({type : 'admin', custom_popup : $html, width : 550});
				}else{
					alert(res.msg);
				}
			},
			error : function(error_res){
				alert(error_res.responseText);
			}
		});
	};

	var openGoodsflowReturnConfirm = function(center_code, request_claim_type){
		if ( selected_prod_order_list.length === 0 ){
			alert(getLocalizeString("설명_선택한주문이없습니다", "", "선택한 주문이 없습니다"));
			return;
		}

		var action_code = '';
		if( request_claim_type === 'RETURN' ) {
			action_code = 'RETURN_AUTO_COLLECT';
		}else if ( request_claim_type === 'EXCHANGE' ) {
			action_code = 'EXCHANGE_AUTO_COLLECT';
		}


		$.ajax({
			type : 'POST',
			data : {'prod_order_code_list' : selected_prod_order_list, 'action_code': action_code, 'center_code' : center_code},
			url : ('/admin/ajax/shop/order_action_confirm.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if ( res.msg === 'SUCCESS' ){
					var $html = $(res.html);
					var $submit = $html.find('._submit');
					var $cancel = $html.find('._cancel');
					var $form = $html.find('#order_action_confirm_form');
					$cancel.on('click', function(){	/* 취소 처리 */
						$.cocoaDialog.hide();
					});

					$submit.on('click', function(){	/* 확인 처리 */
						if (res.prod_order_code_list.length>0){	/* 처리가능한 주문이 있을 경우 */
							$('#button_loading').show();
							var param = $form.serializeObject();
							requestGoodsflowReturn(center_code, res.prod_order_code_list, request_claim_type);
						}else{
							$.cocoaDialog.hide();
						}

					});
					// 폼 유효성 검사 추가
					$form.bind('submit', function(){
						if ( res.prod_order_code_list.length>0 ) {	/* 처리가능한 주문이 있을 경우 */
							$('#button_loading').show();
							var param = $(this).serializeObject();
							requestGoodsflowReturn(center_code, res.prod_order_code_list, request_claim_type);
						}
						return false;
					});
					// 여러 번 클릭시 계산오류 방지
					$.cocoaDialog.hide();
					$.cocoaDialog.open({type : 'admin_' + action_code.toLowerCase(), custom_popup : $html, width : res.dialog_width});
				}else{
					alert(res.msg);
				}
			},
			error : function(error_res){
				alert(error_res.responseText);
			}
		});
	};

	var requestGoodsflowReturn = function(center_code, prod_order_code_list, request_claim_type){
		if ( center_code === undefined ){
			$.cocoaDialog.close();
			return false;
		}

		$.ajax({
			type : 'POST',
			data : { prod_order_code_list : prod_order_code_list, center_code : center_code, request_claim_type : request_claim_type},
			url : ('/admin/ajax/shop/request_goodsflow_delivery_service_return.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg === 'SUCCESS'){
					var action_code = '';
					if( request_claim_type === 'RETURN' ) {
						action_code = 'RETURN_AUTO_COLLECT';
					}else if ( request_claim_type === 'EXCHANGE' ) {
						action_code = 'EXCHANGE_AUTO_COLLECT';
					}
					runOrderActionComplete(res.result_log, action_code);
				}else{
					$('#button_loading').hide();
					alert(res.msg);
				}
			},
			error : function(error_res){
				alert(error_res.responseText);
			}
		});
	};

	var openModalOrderAdvancedSearch = function(advanced_type, param){
		$.ajax({
			type: 'POST',
			data: {'advanced_type': advanced_type, 'param': param},
			url: ('/admin/ajax/shop/open_advanced_search_form.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				if ( res.msg == 'SUCCESS' ) {
					$.cocoaDialog.open({type : 'admin_order_advanced_search', custom_popup : res.html, width : 800});
				} else {
					alert(res.msg);
				}
			}
		});
	};

	var loadExcelList = function(type){
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/shop/get_excel_order_list.cm'),
			data: {type: type},
			dataType: 'json',
			async: false,
			cache: false,
			success: function(res){
				if(res.msg == 'SUCCESS'){
					$('.modal_admin_order_excel_download').find('._excel_empty_wrap').hide();
					$('.modal_admin_order_excel_download').find('#_excel_list_body').html(res.html);
				}else{
					$('.modal_admin_order_excel_download').find('#_excel_list_body').empty();
					$('.modal_admin_order_excel_download').find('._excel_empty_wrap').show();
				}
			}
		});
	};

	var changeOrderExcelDownloadTarget = function(type) {
		var $_default = $("#order_download_form ._download_list_default");
		var $_search = $("#order_download_form ._download_list_search");

		var $_type = $("#order_download_form input[name='type']");
		var $_select_download_form = $("#downloadFileForm");
		var local_setting = IMWEB_LOCALSTORAGE.get("EXCEL_ORDER_DOWNLOAD_SETTING_" + $_type.val() + "_" + type);

		switch( type ) {
			case 'search':
				$_default.hide().prop('disabled', true);
				$_search.show().prop('disabled', false);

				if ( local_setting ) {
					$_search.val(local_setting.download_type);
					$_select_download_form.val(local_setting.download_file_form);
				}
				break;
			case 'default':
			default:
				$_search.hide().prop('disabled', true);
				$_default.show().prop('disabled', false);

				if ( local_setting ) {
					$_default.val(local_setting.download_type);
					$_select_download_form.val(local_setting.download_file_form);
				}
				break;
		}
	};

	var runOrderExcelMake = function(type){
		var $dashboard_loader_sub = $('#dashboard_loader_sub');
		var excel_setting = $("#order_download_form").serializeObject();
		$.ajax({
			type: 'POST',
			data: excel_setting,
			url: '/admin/ajax/shop/request_excel_order_list.cm',
			dataType: 'json',
			cache: false,
			beforeSend : function() {
				$dashboard_loader_sub.show();
			},
			success: function (res) {
				/* 최근 주문 다운로드 요청 설정 저장 */
				IMWEB_LOCALSTORAGE.set("EXCEL_ORDER_DOWNLOAD_SETTING_" + excel_setting.type + "_" + excel_setting.target, {
					'download_type': excel_setting.download_type,
					'download_file_form': excel_setting.download_file_form,
				});

				/* ******************* */
				if ( res.msg == 'SUCCESS' ) {
					var interval = setInterval(function(){
						$dashboard_loader_sub.hide();
						loadExcelList(type);
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

		return;
		var address_combine;
		var blank_fill;
		var callnum_display_only_number;
		//주소 표시 방식
		$("input[name='address_combine']").each(function(){
			if($(this).prop('checked')){
				address_combine = $(this).val();
			}
		});

		//품목 주문 처리방식
		$("input[name='blank_fill']").each(function(){
			if($(this).prop('checked')){
				blank_fill = $(this).val();
			}
		});

		// 전화번호 표시방식
		callnum_display_only_number = $('.modal_admin_order_excel_download').find('#callnum_display_only_number').prop('checked') == true ? 'Y' : 'N';

		var $dashboard_loader_sub = $('#dashboard_loader_sub');
		$.ajax({
			type: 'GET',
			data: {'status' : type, 'address_combine' : address_combine, 'blank_fill' : blank_fill, 'callnum_display_only_number': callnum_display_only_number},
			url: '/admin/ajax/shop/request_excel_order_list.cm',
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

	var runOrderExcelDownload = function(idx){
		$.ajax({
			type: 'POST',
			data: {'idx': idx},
			url: ('/admin/ajax/shop/download_excel_order.cm'),
			dataType: 'json',
			async: false,
			cache: false,
			success: function(res){
			}
		});
	};

	var deleteOrderExcel = function(type, idx){
		if(confirm(getLocalizeString("설명_삭제하시겠습니까", "", "삭제하시겠습니까?"))){
			$.ajax({
				type: 'POST',
				data: {'idx': idx},
				url: ('/admin/ajax/shop/delete_excel_order.cm'),
				dataType: 'json',
				async: false,
				cache: false,
				success: function(res){
					if(res.msg == 'SUCCESS'){
						loadExcelList(type);
					}else{
						alert(res.msg);
					}
				}
			});
		}
	};

	var openCashReceiptInfo = function(order_no){
		$.ajax({
			type : 'POST',
			data : {'order_no' : order_no},
			url : ('/admin/ajax/shop/get_cash_receipt_info.cm'),
			dataType : 'json',
			success : function(res){
				if(res.msg == 'SUCCESS'){
					$.cocoaDialog.open({type : 'admin', custom_popup : res.html, width : 750});
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var openECPayInvoiceInfo = function(order_no){
		$.cocoaDialog.close();
		$.ajax({
			"type": "POST",
			"data": {"order_no": order_no},
			"url": "/admin/ajax/shop/get_ecpay_invoice_info.cm",
			"dataType": "JSON",
			"success": function(res){
				if(res.msg == 'SUCCESS'){
					$.cocoaDialog.open({type : 'admin', custom_popup : res.html, width : 750});
					var $edit_form = $('#_edit_form');
					if ( $edit_form.length > 0 ) {
						// 유형 변경 시
						$edit_form.find('._invoice_type:radio').on('change', function(){
							$edit_form.find('._invoice_wrapper').hide();
							$edit_form.find('._invoice_wrapper._invoice_'+$(this).val()).show();
						});

						// 수정 버튼
						$edit_form.find('._edit_toggle ._btn_edit').click(function(){
							$edit_form.find('._edit_target div').hide();
							$edit_form.find('._edit_target ._edit_mode').show();
							$edit_form.find('._edit_toggle button').toggle();
						});

						// 취소 버튼
						$edit_form.find('._edit_toggle ._btn_cancel').click(function(){
							// 적어둔 항목 리셋
							$edit_form.each(function(){
								this.reset();
							});
							// 유형 리셋
							var form_data = $edit_form.serializeObject2();
							$edit_form.find('._invoice_wrapper').hide();
							$edit_form.find('._invoice_wrapper._invoice_'+form_data['invoice_type']).show();

							$edit_form.find('._edit_target div').hide();
							$edit_form.find('._edit_target ._view').show();
							$edit_form.find('._edit_toggle button').toggle();
						});

						// 저장 버튼
						$edit_form.find('._edit_toggle ._btn_save').click(function(){
							SHOP_ORDER_MANAGE.editECPayInvoiceRequestData(order_no, $edit_form.serializeObject2());
						});
					}


				}else{
					alert(res.msg);
				}
			}
		});
	};

	var editECPayInvoiceRequestData = function(order_no, data){
		$.ajax({
			"type": "POST",
			"data": {"order_no": order_no, "data": data},
			"url": "/admin/ajax/shop/edit_ecpay_invoice_data.cm",
			"dataType": "JSON",
			"success": function(res){
				if(res.msg == 'SUCCESS'){
					openECPayInvoiceInfo(order_no);
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var issueECPayInvoice = function(order_no){
		$.ajax({
			"type": "POST",
			"data": {"order_no": order_no},
			"url": "/admin/ajax/shop/issue_ecpay_invoice.cm",
			"dataType": "JSON",
			"success": function(res){
				if(res.msg == 'SUCCESS'){
					openECPayInvoiceInfo(order_no);
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var cancelECPayInvoice = function(order_no){
		$.ajax({
			"type": "POST",
			"data": {"order_no": order_no},
			"url": "/admin/ajax/shop/cancel_ecpay_invoice.cm",
			"dataType": "JSON",
			"success": function(res){
				if(res.msg == 'SUCCESS'){
					openECPayInvoiceInfo(order_no);
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var changeCashReceiptStatus = function(order_no, status, use_pg){
		var data = {};
		data.order_no = order_no;
		data.status = status;
		data.use_pg = use_pg;
		data.cash_receipt_value = $('#cash_receipt_value').val();
		data.cash_receipt_type = $('#cash_receipt_type:checked').val();
		data.cash_receipt_mail = $('#cash_receipt_mail').val();
		if(status == "COMPLETE"){
			if(use_pg == 'Y'){
				if(confirm("PG사를 통해 현금영수증 발행을 요청하시겠습니까? \n" + "(발행된 현금영수증은 PG 관리페이지에서 확인 가능하며, 취소가 불가합니다.)")){
					$.ajax({
						type : 'POST',
						data : data,
						url : ('/admin/ajax/shop/change_cash_receipt_status.cm'),
						dataType : 'json',
						async : false,
						cache : false,
						success : function(res){
							if(res.msg == 'SUCCESS'){
								alert(getLocalizeString("설명_정상적으로처리되었습니다", "", "정상적으로 처리되었습니다."));
								window.location.reload();
							}else{
								alert(res.msg);
							}
						}
					});
				}
			}else{
				if(confirm("현금영수증 발행 완료 상태로 변경하시겠습니까? \n" + "(가입된 PG사 또는 국세청 홈택스 등을 통해 직접 발행 후 완료상태로 처리하시기 바랍니다.)")){
					$.ajax({
						type : 'POST',
						data : data,
						url : ('/admin/ajax/shop/change_cash_receipt_status.cm'),
						dataType : 'json',
						async : false,
						cache : false,
						success : function(res){
							if(res.msg == 'SUCCESS'){
								alert(getLocalizeString("설명_정상적으로처리되었습니다", "", "정상적으로 처리되었습니다."));
								window.location.reload();
							}else{
								alert(res.msg);
							}
						}
					});
				}
			}
		}else{
			$.ajax({
				type : 'POST',
				data : data,
				url : ('/admin/ajax/shop/change_cash_receipt_status.cm'),
				dataType : 'json',
				async : false,
				cache : false,
				success : function(res){
					if(res.msg == 'SUCCESS'){
						alert(getLocalizeString("설명_정상적으로처리되었습니다", "", "정상적으로 처리되었습니다."));
						window.location.reload();
					}else{
						alert(res.msg);
					}
				}
			});
		}
	};

	var updateCashReceiptData = function(order_no){
		var data = {};
		data.order_no = order_no;
		data.cash_receipt_value = $('#cash_receipt_value').val();
		data.cash_receipt_type = $('#cash_receipt_type:checked').val();
		data.cash_receipt_mail = $('#cash_receipt_mail').val();
		$.ajax({
			type : 'POST',
			data : data,
			url : ('/admin/ajax/shop/update_cash_receipt_data.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					$.cocoaDialog.close();
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var mod_prod_order_code = '';
	var openModifyOrderAddress = function(prod_order_code, type) {
		$.ajax({
			type : 'POST',
			data : {'prod_order_code' : prod_order_code, 'type' : type},
			url : ('/admin/ajax/shop/modify_order_address.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					mod_prod_order_code = prod_order_code;
					$.cocoaDialog.open({type : 'admin', custom_popup : res.html});

					var $form = $('#modify_address_form');
					$form.find('._add_btn').on('click', function() {
						$.ajax({
							type: 'POST',
							data: $form.serialize(),
							url: ('/admin/ajax/shop/update_modify_order_address.cm'),
							dataType: 'json',
							async: false,
							cache: false,
							success: function (res2) {
								if (res2.msg == 'SUCCESS') {
									mod_prod_order_code = '';
									$.cocoaDialog.close();
									location.reload();
								} else {
									alert(res2.msg);
								}
							}
						});
					});
				} else {
					alert(res.msg);
				}
			}
		});
	};

	var openChangeCVSAddress = function(cvs, prod_order_code) {
		var popname = 'change_emap';

		var popup_w = 400;
		var popup_h = 600;
		var popup_top = Math.ceil((window.screen.height - popup_h) / 2 );
		var popup_left = Math.ceil((window.screen.width - popup_w) / 2 );

		var popup_style = '';
		popup_style += 'top=' + popup_top + ',';
		popup_style += 'left=' + popup_left + ',';
		popup_style += 'height=' + popup_h + 'px,';
		popup_style += 'width=' + popup_w + 'px';

		var url = '/admin/ajax/shop/modify_cvs_address.cm?cvs='+cvs+'&code='+prod_order_code;
		window.open(url, popname, 'toolbar=no, channelmode=no, location=no, directories=no, menubar=no, scrollbars=yes, resizable=yes, status=yes, '+popup_style);

	};

	var updateCVSAddress = function(address_data){
		console.log(address_data);
		if ( mod_prod_order_code === '' )	return;
		if ( typeof address_data == "undefined") return;
		if ( mod_prod_order_code != address_data['prod_order_code'] ) return;

		var $cvs_wrapper = $('.cvs_wrapper');

		$cvs_wrapper.find('.cvs_address_info').html(address_data['address_str']).addClass('text-danger');

		for ( var _key in address_data ) {
			if ( $cvs_wrapper.find('input[name="'+_key+'"]').length > 0 ) {
				$cvs_wrapper.find('input[name="'+_key+'"]').val(address_data[_key]);
			}
		}
		$cvs_wrapper.find('.cvs_list_wrapper').hide();
	};

	var changeDelivAddressCountrySelect = function(prod_order_code, country_code, type) {
		var $form = $('#modify_address_form');
		$.ajax({
			type : 'POST',
			data : {'prod_order_code' : prod_order_code, 'country_code':country_code, 'type':type},
			url : ('/admin/ajax/shop/modify_order_address_form.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					var $_address_wrap = $form.find('._deliv_address_wrap').find('._address_wrap');
					$_address_wrap.html(res.html);

					if ( res.use_daum_api == 'Y' ) {
						var addr_daum = new ZIPCODE_DAUM();
						addr_daum.init({
							'addr_container' : $('#order_find_address'),
							'addr_pop' : $('#address_search_popup .search_popup_body'),
							'post_code' : $('#order_postcode_input'),
							'addr' : $('#order_address_input'),
							'onStart' : function(){
							},
							'onComplete' : function(key){
								$('#order_address_detail_input').focus();
								address = key.jibunAddressEnglish;
								splitAddress= address.split(',');

								if(key.addressEnglish != "undefined"){
									address = key.addressEnglish;
									splitAddress= address.split(',');
									if(splitAddress.length > 5){
										street = splitAddress[0] + " " + splitAddress[1];
										city = splitAddress[2] + " " + splitAddress[3];
										state = splitAddress[4];
									} else {
										street = splitAddress[0] + " " + splitAddress[1];
										city = splitAddress[2];
										state = splitAddress[3];
									}
								} else if(key.jibunAddressEnglish != "undefined"){
									address = key.jibunAddressEnglish;
									splitAddress= address.split(',');
									if(splitAddress.length > 5){
										street = splitAddress[0] + " " + splitAddress[1];
										city = splitAddress[2] + " " + splitAddress[3];
										state = splitAddress[4];
									} else {
										street = splitAddress[0] + " " + splitAddress[1];
										city = splitAddress[2];
										state = splitAddress[3];
									}
								}

								$("input[name='address_street']").val(street);
								$("input[name='address_city']").val(city);
								$("input[name='address_state']").val(state);
								$("input[name='address_zipcode']").val(key.zonecode);
							},
							'onShow' : function() {
								$('#address_search_popup').show();
							},
							'onClose' : function(){
								$('#address_search_popup').hide();
							}
						});
					}
				}
			}
		});
	};

	var updateOrderAdminMemo = function(order_code, code) {
		code = code || '';
		var $wrap = $("#memo_add_" + order_code);
		var memo = $wrap.find('textarea[data-mcode="' + code + '"]').val();
		if ( memo.length <= 0 ) {
			deleteOrderAdminMemo(order_code, code);
			return true;
		} else {
			$.ajax({
				type: 'POST',
				data: {
					'order_code' : order_code,
					'code' : code,
					'memo' : memo
				},
				url: ('/admin/ajax/shop/update_order_admin_memo.cm'),
				dataType: 'json',
				async: false,
				cache: false,
				success: function (res) {
					if ( res.msg == 'SUCCESS' ) {
						if ( res.mode == 'add' ) {
							$wrap.find('._admin_memo_list').prepend(res.html);
							toggleAddOrderAdminMemo(order_code, false);
						} else {
							var $post = $wrap.find('._post[data-mcode="' + code + '"]');
							if ( $post.length <= 0 ) return false;
							$post.find('._body').html(res.memo);
							toggleEditOrderAdminMemo(order_code, code, false);
						}
					} else {
						alert(res.msg);
					}
				}
			});
		}
	};

	var toggleAddOrderAdminMemo = function(order_code, is_visible) {
		var $wrap = $('#memo_add_' + order_code);
		var $add = $wrap.find('._add');

		if ( is_visible == void 0 ) {
			is_visible = $add.css('display') == 'none';
		}

		if ( is_visible ) {
			(function() {
				var is_changed_memo = false;
				var $_textarea = $add.find('textarea');
				$_textarea.val('').focus();
				$_textarea.off('change').on('change', function() {
					is_changed_memo = true;
				});

				var _body_click_callback = function() {
					if ( $add.css('display') != 'none' ) {
						if ( is_changed_memo ) {
							if ( confirm(getLocalizeString("설명_관리자메모저장하지않고벗어나려고할때메세지", "", "저장하지 않은 내용은 반영되지 않습니다.\\n관리자 메모를 저장하지 않고 나가시겠습니까?")) ) {
								$add.hide();
							} else {
								// 팝업을 닫지 않았다면 닫는 이벤트는 계속 실행되어야한다.
								$('body').one('click', _body_click_callback);
							}
						} else {
							$add.hide();
						}
					}
				};

				$('body').one('click', _body_click_callback);
				event.cancelBubble = true;
			})();
		}

		$add.toggle( is_visible );
	};

	var toggleEditOrderAdminMemo = function(order_code, code, is_visible) {
		var $wrap = $('#memo_add_' + order_code);
		var $post = $wrap.find('._post[data-mcode="' + code + '"]');
		if ( $post.length <= 0 ) return false;

		var $body = $post.find('._body');
		var $editor = $post.find('._editor');
		var $editor_toolbar = $post.find('._editor_toolbar');

		if ( is_visible ) {
			$body.hide();
			$editor.show();
			$editor_toolbar.show();
		} else {
			$body.show();
			$editor.hide();
			$editor_toolbar.hide();
		}
	};

	var deleteOrderAdminMemo = function(order_code, code) {
		if ( confirm(getLocalizeString("설명_메모를삭제하시겠습니까", "", "메모를 삭제하시겠습니까?")) ) {
			$.ajax({
				type: 'POST',
				data: {
					'order_code' : order_code,
					'code' : code,
				},
				url: ('/admin/ajax/shop/delete_order_admin_memo.cm'),
				dataType: 'json',
				async: false,
				cache: false,
				success: function (res) {
					if ( res.msg == 'SUCCESS' ) {
						var $wrap = $('#memo_add_' + order_code);
						$wrap.find('._post[data-mcode="' + code + '"]').remove();
					} else {
						alert(getLocalizeString("설명_메모를삭제할수없습니다", "", "메모를 삭제할 수 없습니다."));
					}
				}
			});
		}
	};

	var openRefundData = function(prod_order_no){
		$.ajax({
			"url": "/admin/ajax/shop/modify_order_refund_account_info.cm",
			"type": "post",
			"data": {"prod_order_no": prod_order_no, "mode": "open"},
			"dataType": "json",
			"success": function(res){
				if ( res.msg == "SUCCESS" ) {
					$.cocoaDialog.close();

					var $modal_html = $(res.html);
					$modal_html.find('._add_btn').on('click', function(){
						var _data = $modal_html.find('#modify_refund_form').serializeObject2();
						_data['prod_order_no'] = prod_order_no;
						_data['mode'] = 'update';
						$.ajax({
							type: 'POST',
							data: _data,
							url: ('/admin/ajax/shop/modify_order_refund_account_info.cm'),
							dataType: 'json',
							async: false,
							cache: false,
							success: function (res2) {
								if (res2.msg == 'SUCCESS') {
									$.cocoaDialog.close();
									location.reload();
								} else {
									alert(res2.msg);
								}
							}
						});
					});
					$.cocoaDialog.open({type : 'admin', custom_popup : $modal_html});
				} else {
					alert(res.msg);
				}
			}
		});
	};

	var changeRefundPrice = function(prod_order_code, order_code, item_price, etc_fee, order_remain_price, order_deliv_price, order_return_deliv_fee, is_particular){
		var $order_wrap = $('._table_' + order_code);
		var $refund_price_wrap = $order_wrap.find('._refund_price_' + prod_order_code);
		var $auto_refund_alert = $order_wrap.find('._auto_refund_alert_' + order_code);
		var $total_etc_fee_wrap = $order_wrap.find('._total_etc_fee_' + order_code);
		var $total_refund_price_wrap = $order_wrap.find('._total_refund_price_' + order_code);
		var refund_price = item_price - etc_fee;

		$refund_price_wrap.text(refund_price);

		var total_etc_fee = 0;
		$order_wrap.find('input[data-id="etc_fee_' + order_code + '"]').each(function(k, v){
			total_etc_fee += Number($(v).val());
		});

		$total_etc_fee_wrap.text(total_etc_fee * -1);

		var total_refund_price = 0;
		if(is_particular){
			$order_wrap.find('input[data-id="period_fee_' + order_code + '"]').each(function(k, v){
				total_refund_price -= Number($(v).val());
			});
		}

		if(is_particular){
			$order_wrap.find('span[data-id="refund_price_' + order_code + '"]').each(function(k, v){
				total_refund_price += Number($(v).text());
			});

			total_refund_price += Number(order_deliv_price);
		}else{
			// 부동소수점 대비 처리 / 최대 4자리
			var _order_remain_price = parseInt(order_remain_price * 10000);
			var _total_etc_fee = parseInt(total_etc_fee * 10000);
			total_refund_price = (_order_remain_price - _total_etc_fee) / 10000;
		}

		total_refund_price -= order_return_deliv_fee;
		total_refund_price = Math.round(total_refund_price);
		if(total_refund_price < 0){
			$order_wrap.find('input[data-id="etc_fee_' + order_code + '"]').each(function(k, v){
				$(this).val(0);
			});
			$total_etc_fee_wrap.text('0');

			var total_item_price = 0;
			$order_wrap.find('td[data-id="item_price_' + order_code + '"]').each(function(k, v){
				$(v).next().next().children().text($(v).text());
				total_item_price += Number($(v).text());
			});
			$total_refund_price_wrap.text(total_item_price - order_return_deliv_fee);
			alert(getLocalizeString("설명_환불금액0원이상이여야합니다", "", "환불 금액은 0원 이상이여야 합니다."));
			return false;
		}

		$total_refund_price_wrap.text(total_refund_price);
		if(order_remain_price >= total_refund_price){
			$auto_refund_alert.hide();
		}else{
			$auto_refund_alert.show();
		}
	};

	var changeRefundPoint = function(prod_order_code, order_code, order_remain_point, refund_point){
		var $order_wrap = $('._table_' + order_code);
		var $refund_point_wrap = $order_wrap.find('._refund_point_' + prod_order_code);
		var $total_refund_point_value_wrap = $order_wrap.find('._total_refund_point_value_' + order_code);

		var total_refund_point = 0;
		$order_wrap.find('input[data-id="refund_point_' + order_code + '"]').each(function(k, v){
			total_refund_point += Number($(v).val());
		});

		if(refund_point < 0){
			$refund_point_wrap.val(0);
			alert(getLocalizeString("설명_이필드에는정수만입력가능", "", "이 필드에는 정수만 입력 가능합니다."));
			return false;
		}

		if(total_refund_point > order_remain_point){
			$refund_point_wrap.val(0);
			alert(getLocalizeString("설명_잔여포인트초과입력불가능", "", "잔여 적립금을 초과하는 숫자는 입력이 불가능합니다."));
			return false;
		}

		$total_refund_point_value_wrap.text(total_refund_point);

	};

	var showOrderChangedLog = function(order_code){
		$.ajax({
			type : 'POST',
			data : {type: 'shopping', order_code: order_code},
			url : ('/admin/ajax/shop/order_changed_log.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					$.cocoaDialog.open({type : 'admin_order_changed_log', custom_popup : res.html});
				}
			}
		});
	};

	var showTrackingError = function(prod_order_code, parcel_company, invoice_no) {
		$.ajax({
			type : 'POST',
			data : {parcel_company: parcel_company, invoice_no: invoice_no},
			url : ('/admin/ajax/shop/open_tracking_error.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if ( res.code == 999 ) {
					alert(res.msg);
				} else {
					var $_html = $(res.html);
					var $_btn_submit = $_html.find('._submit');
					$_btn_submit.on('click', function(e) {
						$('#button_loading').show();
						retryTrackingError(prod_order_code, function(res) {
							location.reload();
						});
					});
					$.cocoaDialog.open({type : 'admin_order_tracking_error_log', custom_popup : $_html});
				}
			}
		});
	};

	var retryTrackingError = function(prod_order_code, callback) {
		$.ajax({
			type : 'POST',
			data : {prod_order_code: prod_order_code},
			url : ('/admin/ajax/shop/open_tracking_error_action.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res) {
				if ( callback ) callback.apply(this, [res]);
			}
		});
	};

	var openCancelCollectCargoConfirm = function(request_type, trans_unique_cd){
		$.ajax({
			type : 'POST',
			data : { request_type : request_type},
			url : ('/admin/ajax/shop/cancel_collect_cargo_confirm.cm'),
			dataType : 'json',
			success : function(res){
				if (res.msg === 'SUCCESS'){
					var $html = $(res.html);
					var $submit = $html.find('._submit');
					var $cancel = $html.find('._cancel');
					var $form = $html.find('#orders_confirm_form');

					$submit.on('click', function(){	/* 확인 처리 */
						cancelCollectCargo(trans_unique_cd, request_type);
					});

					// 여러 번 클릭시 계산오류 방지
					$.cocoaDialog.hide();
					$.cocoaDialog.open({type : 'admin_test', custom_popup : $html});
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var openCancelMultiCollectCargoConfirm = function(){
		if (selected_prod_order_list.length === 0){
			alert(getLocalizeString("설명_선택한주문이없습니다", "", "선택한 주문이 없습니다"));
			return;
		}
		$.ajax({
			type : 'POST',
			data : { selected_prod_order_list : selected_prod_order_list },
			url : ('/admin/ajax/shop/cancel_multi_collect_cargo_confirm.cm'),
			dataType : 'json',
			success : function(res){
				if (res.msg === 'SUCCESS'){
					var $html = $(res.html);
					var $submit = $html.find('._submit');

					$submit.on('click', function(){	/* 확인 처리 */
						cancelCollectCargo(res.available_code_list);
					});

					// 여러 번 클릭시 계산오류 방지
					$.cocoaDialog.hide();
					$.cocoaDialog.open({type : 'admin_test', custom_popup : $html});
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var cancelCollectCargo = function(trans_unique_cd, request_type){
		$.ajax({
			type : 'POST',
			data : { trans_unique_cd : trans_unique_cd, request_type : request_type},
			url : ('/admin/ajax/shop/cancel_collect_cargo.cm'),
			dataType : 'json',
			success : function(res){
				if (res.msg === 'SUCCESS'){
					$.cocoaDialog.hide();
					reloadList();
				}else{
					alert(res.msg);
				}
			}
		});
	};

	var AdvancedSearch = (function() {
		var CONST = {
			TEMPLATE: {
				ADVANCED_SEARCH_WRAP : 'advanced_search_wrap_template',
				ADVANCED_SEARCH_TXT : 'advanced_search_txt_template',
				ADVANCED_SEARCH_PAY_TYPE : 'advanced_search_pay_type_template',
				ADVANCED_SEARCH_CASH_RECEIPT : 'advanced_search_cash_receipt_template',
				ADVANCED_SEARCH_REASON : 'advanced_search_reason_template',
			},
			MAX_DETAIL_ITEM: 5
		};

		var isBtnClick;

		var $advanced_search_form;
		var $detail_list;

		var template_list = {};
		var loadTemplate = function(code, data) {
			if ( template_list[code] == void 0 ) { template_list[code] = $("#" + code).html();}
			var template = template_list[code];

			if ( data != void 0 ) {
				Object.keys(data).forEach(function(k) {
					template = template.replace(new RegExp("\\{" + k + "\\}", "g"), data[k]);
				});
			}

			return template;
		};

		var Init = function() {
			(function(){
				// dom
				$advanced_search_form = $("#advanced_search_form");
				$detail_list = $advanced_search_form.find('._detail_list_wrap');

				// 날짜 세팅
				var $btn_ranges = $advanced_search_form.find('._btn_range');
				var $start_time = $advanced_search_form.find('._start_time');
				var $end_time = $advanced_search_form.find('._end_time');

				var advancedDateCallback = function(e){
					if(!isBtnClick){
						$btn_ranges.filter('.btn-primary').removeClass('btn-primary').addClass('btn-default-bright');
					}

					// 만약 판매 종료날이 판매 시작일보다 이전일 경우 판매 시작일로 세팅.
					var start_date = $start_time.val();
					var end_date = $end_time.val();

					if(start_date.length && end_date.length){
						var start_moment = moment(start_date);
						var end_moment = moment(end_date);

						if(end_moment.unix() < start_moment.unix()){
							$end_time.data('DateTimePicker').date(start_moment);
						}
					}
				};

				setDatePicker($start_time, advancedDateCallback);
				setDatePicker($end_time, advancedDateCallback);

				// 날짜 관련 버튼 클릭 시 이벤트 처리
				$btn_ranges.on('click', function(e){
					isBtnClick = true;

					var $that = $(this);
					var day = $that.data('day');

					$that.siblings().removeClass('btn-primary').addClass('btn-default-bright');
					$that.removeClass('btn-default-bright').addClass('btn-primary');

					var m = moment();
					$end_time.data('DateTimePicker').date(m.format('YYYY-MM-DD'));

					switch(day){
						case 'today':
							$start_time.data('DateTimePicker').date(m.format('YYYY-MM-DD'));
							break;
						case 'week':
							m.add('day', -7);
							$start_time.data('DateTimePicker').date(m);
							break;
						case 'month':
							m.add('month', -1);
							$start_time.data('DateTimePicker').date(m);
							break;
						case '3month':
							m.add('month', -3);
							$start_time.data('DateTimePicker').date(m);
							break;
					}

					isBtnClick = false;
				});

				if ( $start_time.val() == '' || $end_time.val() == '' ) {
					// 기본 값
					$btn_ranges.siblings('[data-day="month"]').trigger('click');
				}
				// 검색어 세팅 등
			})();
		};

		var setDatePicker = function(obj, callback) {
			var date_option = {
				dayViewHeaderFormat: 'YYYY MMMM',
				maxDate: moment().format('YYYY-MM-DD'),
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
				format:'YYYY-MM-DD',
			};

			var d = new Date(obj.val());
			obj.datetimepicker(date_option);
			obj.data('DateTimePicker').date(d);

			if ( typeof callback == "function" ) {
				obj.on('dp.change', callback);
			}
		};

		var addAdvancedSearchDetailItem = function() {
			var item_cnt = $detail_list.find('._advanced_search_item').length;
			if ( item_cnt >= CONST.MAX_DETAIL_ITEM ) {
				alert(getLocalizeString("설명_주문정보는최대n개까지추가할수있습니다", CONST.MAX_DETAIL_ITEM, "주문정보는 최대 %1개 까지 추가할 수 있습니다."));
			} else {
				var $_wrap = $(loadTemplate(CONST.TEMPLATE.ADVANCED_SEARCH_WRAP, {no : item_cnt}));
				$detail_list.append($_wrap);
			}
		};

		var deleteAdvancedSearchDetailItem = function(no) {
			var $target = $detail_list.find('._advanced_search_item[data-no="' + no + '"]');
			if ( $target.length ) {
				if ( confirm(getLocalizeString("설명_주문정보항목을제거하시겠습니까", "", "주문정보 항목을 제거하시겠습니까?")) ) {
					$target.remove();
				}
			}
		};

		var changeAdvancedSearchDetailType = function(target) {
			var type = target.value;
			var $_parent = $(target).parents('._advanced_search_item');
			var no = $_parent.data('no');

			var dupli_dom = $("._select_detail").filter(function(idx) { return ( $(this).prop('value') == type ); });
			if ( dupli_dom.length >= 2) {
				alert(getLocalizeString("설명_동일한주문정보항목은선택할수없습니다", "", "동일한 주문정보 항목은 선택할 수 없습니다."));
				$(target).prop('value', '');
				return;
			}

			var value_html = '';
			switch( type ) {
				case 'pay_type':
					value_html = loadTemplate(CONST.TEMPLATE.ADVANCED_SEARCH_PAY_TYPE, {'no' : no});
					break;
				case 'cash_receipt':
					value_html = loadTemplate(CONST.TEMPLATE.ADVANCED_SEARCH_CASH_RECEIPT, {'no' : no});
					break;
				case 'reason':
					value_html = loadTemplate(CONST.TEMPLATE.ADVANCED_SEARCH_REASON, {'no' : no});
					break;
				default:
					var opt = {'no' : no, 'value' : ''};
					var $_adv_search_txt = $_parent.find('._advanced_search_txt_wrap').find('input');

					if ( $_adv_search_txt.prop('type') == 'text' ) { opt.value = $_adv_search_txt.val(); }
					value_html = loadTemplate(CONST.TEMPLATE.ADVANCED_SEARCH_TXT, opt);
			}

			$_parent.find('._advanced_search_txt_wrap').html(value_html);
		};

		var startSubmit = function(url) {
			// 상세조건 미선택 항목이 있는지...
			var $_detail_types = $advanced_search_form.find('select[name^="detail"]');

			var err_msg = '';
			$_detail_types.each(function(index, data) {
				if ( index == 0 ) return true;
				var val = $(data).prop('value');
				if ( val == '' ) {
					err_msg = getLocalizeString("설명_주문정보항목을선택또는제거하신후검색해주세요", "", "주문정보 항목을 선택 또는 제거하신 후 검색해 주세요.");
				}
			});

			if ( err_msg != '' ) {
				alert(err_msg);
				return;
			}

			var data = $advanced_search_form.serialize();

			$.ajax({
				type: 'POST',
				data: data,
				url: ('/admin/ajax/shop/open_advanced_search_proc.cm'),
				dataType: 'json',
				async: false,
				cache: false,
				success: function (res2) {
					if (res2.msg == 'SUCCESS') {
						$.cocoaDialog.close();
						location.href = url + '?s_type=advanced&s_filter=' + res2.search + '&reset_status=Y';
					} else {
						alert(res2.msg);
					}
				}
			});
		};

		return {
			Init: function() {
				Init();
			},
			addAdvancedSearchDetailItem: function() {
				addAdvancedSearchDetailItem();
			},
			deleteAdvancedSearchDetailItem: function(no) {
				deleteAdvancedSearchDetailItem(no);
			},
			changeAdvancedSearchDetailType: function(target) {
				changeAdvancedSearchDetailType(target);
			},
			startSubmit : function(url) {
				startSubmit(url);
			}
		};
	})();

	return {
		initList: function(type){	/* type - order(주문관리), return (반품교환관리) */
			initList(type);
		},
		loadList: function (page, search_data, base_url) {
			loadList(page, search_data, base_url);
		},
		loadReturnList: function (page, search_data, base_url) {
			loadReturnList(page, search_data, base_url);
		},
		loadCancelList: function (page, search_data, base_url) {
			loadCancelList(page, search_data, base_url);
		},
		loadExchangeList: function (page, search_data, base_url) {
			loadExchangeList(page, search_data, base_url);
		},
		'unsetAllSelected' : function (){
			unsetAllSelected();
		},

		'toggleAllSelected' : function (){
			if ($('#order_list_allcheck').prop('checked')){
				setAllSelected();
			}else{
				unsetAllSelected();
			}
		},

		'toggleSelectedByOrder' : function (order_code){
			if (checkSelectedByOrder(order_code)==-1){
				setSelectedByOrder(order_code);
			}else{
				unsetSelectedByOrder(order_code);
			}

		},
		'toggleSelectedByProdOrder' : function (prod_order_code){
			if (checkSelectedByProdOrder(prod_order_code)==-1){
				setSelectedByProdOrder(prod_order_code);
			}else{
				unsetSelectedByProdOrder(prod_order_code);
			}
		},
		openOrderDetail : function(order_no) {
			openOrderDetail(order_no);
		},
		"runOrderAction" : function (action_code){
			runOrderActionConfirm(action_code, selected_prod_order_list);
		},
		"openCancelLogisticsOrder": function(prod_order_code, type){
			openCancelLogisticsOrder(prod_order_code, type);
		},
		"openCreateReturnLogisticsOrder": function(prod_order_code){
			openCreateReturnLogisticsOrder(prod_order_code);
		},
		"openLogisticsOrderQuery": function(prod_order_code){
			openLogisticsOrderQuery(prod_order_code);
		},
		"openLogisticsOrderPopup": function(prod_order_code){
			openLogisticsOrderPopup(prod_order_code);
		},
		"openCreateLogisticsOrder": function(prod_order_code){
			openCreateLogisticsOrder(prod_order_code);
		},
		"updateOrderData" : function(type, prod_order_code, deliv_group_code, value){
			updateOrderData(type, prod_order_code, deliv_group_code, value);
		},
		"openOrdererInfo" : function(prod_order_code){
			openOrdererInfo(prod_order_code);
		},
		'openShopWriterInfo' : function(member_code){
			openShopWriterInfo(member_code);
		},
		'openOrderPrint' : function(order_no){
			openOrderPrint(order_no);
		},
		'openOrderPrintPopup' : function(){
			openOrderPrintPopup();
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
		},
		'showOrderHelp' : function(type){
			showOrderHelp(type);
		},
		'setMixParcelNo' : function(order_code, deliv_group_code, mix_code, value){
			setMixParcelNo(order_code, deliv_group_code, mix_code, value);
		},
		'openModalOrderExcelDownload' : function(type, filter){
			openModalOrderExcelDownload(type, filter);
		},
		'openModalOrderAdvancedSearch' : function(advanced_type, param){
			openModalOrderAdvancedSearch(advanced_type, param);
		},
		'loadExcelList' : function(type){
			loadExcelList(type);
		},
		'changeOrderExcelDownloadTarget': function(value) {
			changeOrderExcelDownloadTarget(value);
		},
		'runOrderExcelMake' : function(type){
			runOrderExcelMake(type);
		},
		'runOrderExcelDownload' : function(idx){
			runOrderExcelDownload(idx);
		},
		'deleteOrderExcel' : function(type, idx){
			deleteOrderExcel(type, idx);
		},
		'openCashReceiptInfo' : function(order_no){
			openCashReceiptInfo(order_no);
		},
		'openECPayInvoiceInfo': function(order_no){
			openECPayInvoiceInfo(order_no);
		},
		'editECPayInvoiceRequestData': function(order_no, data){
			editECPayInvoiceRequestData(order_no, data);
		},
		'issueECPayInvoice': function(order_no){
			issueECPayInvoice(order_no);
		},
		'cancelECPayInvoice': function(order_no){
			cancelECPayInvoice(order_no);
		},
		'changeCashReceiptStatus' : function(order_no, status,use_pg){
			changeCashReceiptStatus(order_no, status,use_pg);
		},
		'updateCashReceiptData' : function(order_no){
			updateCashReceiptData(order_no);
		},
		'openModifyOrderAddress' : function(prod_order_code, type) {
			openModifyOrderAddress(prod_order_code, type);
		},
		"openChangeCVSAddress": function(cvs, prod_order_code){
			openChangeCVSAddress(cvs, prod_order_code);
		},
		"updateCVSAddress": function(data) {
			updateCVSAddress(data);
		},
		'changeDelivAddressCountrySelect' : function(prod_order_code, country_code, type) {
			changeDelivAddressCountrySelect(prod_order_code, country_code, type);
		},
		'toggleAddOrderAdminMemo' : function(order_code, is_visible) {
			toggleAddOrderAdminMemo(order_code, is_visible);
		},
		'toggleEditOrderAdminMemo' : function(order_code, code, is_visible) {
			toggleEditOrderAdminMemo(order_code, code, is_visible);
		},
		'updateOrderAdminMemo' : function(order_code, code) {
			updateOrderAdminMemo(order_code, code);
		},
		'deleteOrderAdminMemo' : function(order_code, code) {
			deleteOrderAdminMemo(order_code, code);
		},
		"openRefundData": function(order_no) {
			openRefundData(order_no);
		},
		'changeRefundPrice' : function(prod_order_code, order_code, item_price, etc_fee, order_remain_price, order_deliv_price, order_return_deliv_fee, is_particular){
			changeRefundPrice(prod_order_code, order_code, item_price, etc_fee, order_remain_price, order_deliv_price, order_return_deliv_fee, is_particular);
		},
		'changeRefundPoint' : function(prod_order_code, order_code, order_remain_point, refund_point){
			changeRefundPoint(prod_order_code, order_code, order_remain_point, refund_point);
		},
		'showOrderChangedLog' : function(order_code) {
			showOrderChangedLog(order_code);
		},
		'AdvancedSearch' : AdvancedSearch,
		'showTrackingError': function(prod_order_code, parcel_company, invoice_no) {
			showTrackingError(prod_order_code, parcel_company, invoice_no);
		},
		'openGoodsflowDlvmgrConfirm' : function(request_type){
			openGoodsflowDlvmgrConfirm(request_type);
		},
		'openGoodsflowDlvmgrConfirmInBatch' : function(status){
			openGoodsflowDlvmgrConfirmInBatch(status);
		},
		'openGoodsflowReturnConfirm' : function(){
			openGoodsflowReturnConfirm();
		},
		'checkGoodsflowContracts' : function(request_claim_type){
			checkGoodsflowContracts(request_claim_type);
		},
		'openCancelCollectCargoConfirm' : function(request_type, trans_unique_cd){
			openCancelCollectCargoConfirm(request_type, trans_unique_cd);
		},
		'openCancelMultiCollectCargoConfirm' : function(){
			openCancelMultiCollectCargoConfirm();
		},
	}
}();