var SHOP_MEMBER_POINT = function() {
    var $form;
    var return_url;
    var $search_form;
    var current_base_url;
    var $target_type;		// 포인트 지급대상 변경 select box
	var $target_member_wrap;		// 지급대상 : 회원 영역
	var $target_group_wrap;		// 지급대상 : 그룹 영역
    
    var init = function(base_url,back_url){
        $form = $('#shop_member_point');
        $form.find('input._point').number(true);
        $search_form = $('#point_search_form');
        $target_type = $('#target_type');
        $target_member_wrap = $('#target_member_wrap');
        $target_group_wrap = $('#target_group_wrap');
        current_base_url = base_url;
        return_url = back_url;

        $target_type.on('change', function(e){
        	if($(this).val() == 'member'){
        		$target_member_wrap.show();
        		$target_group_wrap.hide();
			}else{
				$target_member_wrap.hide();
				$target_group_wrap.show();
			}
		});
    };

    var cancelPoint = function(idx){
    	if(confirm(getLocalizeString('설명_포인트지급내역삭제','','내역을 삭제하시면 지급/차감된 포인트도 취소됩니다. 삭제하시겠습니까?'))){
    		$.ajax({
				type: 'POST',
				data: {'action': 'delete', 'idx': idx},
				url: '/admin/ajax/shop/update_member_point.cm',
				dataType: 'JSON',
				success: function(res){
					if(res.msg == 'SUCCESS'){
						window.location.reload();
					} else {
						alert(res.msg);
					}
				}
			});
		}
	};

    var submit = function(){
		if(confirm(getLocalizeString('설명_포인트지급차감을적용하시겠습니까','','포인트지급차감을적용하시겠습니까'))){
			var data = $form.serializeObject();
			$.ajax({
				type : 'POST',
				data : {'data' : data},
				url : ('/admin/ajax/shop/update_member_point.cm'),
				dataType : 'json',
				success : function(res){
					if(res.msg == 'SUCCESS'){
						window.location.href = return_url;
					}else
						alert(res.msg);
				}
			});
		}
    };

	var openModalExcelDownload = function(){
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/shop/open_download_excel_point_list.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (html) {
				$.cocoaDialog.open({type : 'admin_order_excel_download', custom_popup : html, width : 550});
			}
		});
	};

	var loadExcelList = function(){
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/shop/get_excel_point_list.cm'),
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

	var deleteOrderExcel = function(idx){
		if(confirm(getLocalizeString('설명_삭제하시겠습니까','','삭제하시겠습니까?'))){
			$.ajax({
				type: 'POST',
				data: {'idx': idx},
				url: ('/admin/ajax/shop/delete_excel_order.cm'),
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

	var runPointExcelMake = function(type){
		var $dashboard_loader_sub = $('#dashboard_loader_sub');
		$.ajax({
			type: 'GET',
			data: {'status' : type },
			url: '/admin/ajax/shop/request_excel_point_list.cm',
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

    var startSearch = function(){
        var keyword = $.trim($search_form.find("input._search").val());
        if (keyword!=''){
            window.location.href = current_base_url+'&search='+encodeURIComponent(keyword);
        }
    };

    return {
        'init': function (base_url,back_url) {
            init(base_url,back_url);
        },
		'cancelPoint': function(idx){
			cancelPoint(idx);
		},
        'submit': function (){
            submit();
        },
		'loadExcelList' : function(){
			loadExcelList();
		},
		'deleteOrderExcel': function(idx){
			deleteOrderExcel(idx);
		},
		'openModalExcelDownload': function(){
			openModalExcelDownload();
		},
		'runPointExcelMake': function(type){
			runPointExcelMake(type);
		},
        'startSearch': function() {
            startSearch();
        }
    }
}();
