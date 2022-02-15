function mshopadd(bObj, member_seq){
	var obj = $(bObj);
	var alert_timer = null;
	var sShopNo = obj.data('shop');
	$.ajax({
		'url' : '/mshop_process/add_myshop',
		'type' : 'post',
		'dataType': 'json',
		'data' : {'ajax':'true', 'shop_no':sShopNo},
		'success' : function(res){
			if( res.result ) {
				if(res.reg == 'on') {
					obj.addClass('on');
					$("#myshop_favorite_alert .cfa_on").show();
					$("#myshop_favorite_alert .cfa_off").hide();
					$("#myshop_favorite_alert .cfa_msg").html(getAlert('et063')); //단골미니샵으로 <br />등록되었습니다.
				}else if(res.reg == 'off') {
					obj.removeClass('on');
					$("#myshop_favorite_alert .cfa_on").hide();
					$("#myshop_favorite_alert .cfa_off").show();
					$("#myshop_favorite_alert .cfa_msg").html(getAlert('et064')); //단골미니샵에서 <br />삭제되었습니다.
				}
			}else{
				if( !member_seq ) {
					//회원만 사용가능합니다.\n로그인하시겠습니까?
					if(confirm(getAlert('et065'))){
						var url = "/member/login";
						top.document.location.href = url;
						return;
					}else{
						return;
					}
				}else{
					alert(res.msg);
				}
			}
			$("#myshop_favorite_alert").stop(true,true).show();
			clearInterval(alert_timer);
			alert_timer = setInterval(function(){
				clearInterval(alert_timer);
				$("#myshop_favorite_alert").stop(true,true).show().fadeOut('slow');
			},1000);
		}
	});
}

function snsLink(){
	if ( $('.btn_sns_share').hasClass('on') ) {
		$('.btn_sns_share').removeClass('on');
		$('.snsbox_area').hide();
	} else {
		$('.btn_sns_share').addClass('on');
		$('.snsbox_area').show();
	}
}