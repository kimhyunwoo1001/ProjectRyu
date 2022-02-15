var gl_option_select_ver				= '';
var gl_basic_currency					= 'KRW';
var gl_skin_currency					= 'KRW';
var gl_basic_currency_symbol			= '원';
var gl_basic_currency_symbol_position	= 'after';


$(document).ready(function(){

	// option js 동적 로드
	if	(!gl_option_select_ver){
		var dynamic_js	= document.createElement('script');
		dynamic_js.src	= '/app/javascript/js/goods-option.js';
		document.getElementsByTagName('head')[0].appendChild(dynamic_js);
	}

	// 가격대체문구 상품 필수/추가옵션 비활성화 처리 leewh 2015-01-15
	if((typeof gl_string_price_use != 'undefined' && gl_string_price_use) || (typeof gl_string_button_use != 'undefined' && gl_string_button_use)){
		try{
			if((typeof gl_string_price_use != 'undefined' && gl_string_price_use) || (typeof gl_string_button_use != 'undefined' && gl_string_button_use)){
				$("select").attr("disabled",true).selectbox("disable");
				return false;
			}
		}catch(e){};
	}

	$('#couponDownload, #mbox, .couponDownload').bind("click",function() {
		var memberSeq = gl_member_seq;

		if( !memberSeq ){
			location.href="/member/login?return_url="+gl_request_uri;
			return false;
		}

		if ( $(this).hasClass('resStyle') ) { // 반응형인 경우 껍데기 변경
			coupondownlist_res(gl_goods_seq,gl_request_uri);
		} else {
			coupondownlist(gl_goods_seq,gl_request_uri);
		}
	});

	//상품에 사용가능한 코드리스트
	$('#codeSaleView, #mbox, .codeSaleView').bind("click",function() {
		if ( $(this).hasClass('resStyle') ) { // 반응형인 경우 껍데기 변경
			codesalelist_res(gl_goods_seq,gl_request_uri);
		} else {
			codesalelist(gl_goods_seq,gl_request_uri);
		}
	});


	$("button[name='couponDownloadButton']").die().live("click",function(){
		var url = '../coupon/download?goods='+$(this).attr('goods')+'&coupon='+$(this).attr('coupon');
		actionFrame.location.href = url;
	});

	if( $(".couponDownloadlay").html() ){

		$.getJSON('../coupon/goods_coupon_max?no='+gl_goods_seq, function(data) {
			if(data){
				$(".couponDownloadlay").show();

				var couponDetailpricelayhtml = '<div>';
				var couponDetailhelphtml = '<ul>';
				couponDetailhelphtml +=  "<li>- <b>" + data.download_enddatetitle + "</b> </li>";
				couponDetailhelphtml +=  "<li>- <b>" + data.issue_enddatetitle + "</b> </li>";
				if(data.sale_type == 'percent'){
					var realpercent = (data.percent_goods_sale);
					//할인, 최대
					couponDetailhelphtml +=  "<li>- <b>" + realpercent + "% "+getAlert('gv043')+" ("+getAlert('gv044')+" " + get_currency_price(data.max_percent_goods_sale,2,gl_basic_currency) + ")</b></li>";
					$(".cb_percent").html( realpercent + '%' );
					for (var i = 0; i < realpercent.length ; i++) {
						var number = parseInt(realpercent.substring(i,i+1));
						if(number >= 0 ) couponDetailpricelayhtml += "<img src='/data/coupon/coupon_i_no"+number+".png' >";
					}
					couponDetailpricelayhtml +=  "<img src='/data/coupon/coupon_i_per.png' >";
					couponDetailpricelayhtml +=  "<img src='/data/coupon/coupon_i_dc.png' >";
				}else{
					var realprice = get_cutting_price(data.won_goods_sale,'basic');

					couponDetailhelphtml +=  "<li>- <b>"+ get_currency_price(realprice,2,gl_basic_currency) +" "+getAlert('gv043')+" </b></li>";
					$(".cb_percent").html( get_currency_price(realprice,2,gl_basic_currency) );
					for (var i = 0; i < realprice.length ; i++) {
						var number = (realprice.substring(i,i+1));
						if(number == ',') {
							couponDetailpricelayhtml += "<img src='/data/coupon/coupon_i_comma.png' >";
						}else{
							couponDetailpricelayhtml += "<img src='/data/coupon/coupon_i_no"+number+".png' >";
						}
					}
					couponDetailpricelayhtml +=  "<img src='/data/coupon/coupon_i_won.png' >";
				}
				//이상 구매 시
				couponDetailhelphtml +=  "<li>- "+ get_currency_price(data.limit_goods_price,2,gl_basic_currency) +" "+getAlert('gv045')+"</li>";
				if(data.categoryhtml) {
					if(data.issue_type == 'except'){
						//카테고리 사용 불가
						couponDetailhelphtml +=  "<li>- "+ data.categoryhtml +" "+getAlert('gv046')+"</li>";
					}else if(data.issue_type == 'issue'){
						//카테고리 사용 가능
						couponDetailhelphtml +=  "<li>- "+ data.categoryhtml +" "+getAlert('gv047')+"</li>";
					}else{
						//전체 상품 사용 가능
						couponDetailhelphtml +=  "<li>- "+getAlert('gv048')+"</li>";
					}
				}

				//동시사용불가
				if( data.coupon_same_time  == 'N' ){
					//단독 쿠폰( 타 쿠폰과 함께 사용 불가)
					couponDetailhelphtml +=  "<li>- "+getAlert('gv049')+"</li>";
				}

				//중복사용여부
				if( data.duplication_use  == '1' ){
					//중복 다운로드 가능(사용 후 다시 다운로드 가능)
					couponDetailhelphtml +=  "<li>- "+getAlert('gv050')+"</li>";
				}

				couponDetailhelphtml +=  "</ul>";
				couponDetailpricelayhtml +=  "</div>";

				if( data.coupon_img == 4 ) {
					$(".lt").css('background', 'url(/data/coupon/' + data.coupon_image4 + ')');
					$(".rt").css('background', 'url(/data/coupon/' + data.coupon_image4 + ')');
					$(".lb").css('background', 'url(/data/coupon/' + data.coupon_image4 + ')');
					$(".rb").css('background', 'url(/data/coupon/' + data.coupon_image4 + ')');

					$("#couponDetailhelplay").html(couponDetailhelphtml);//우측 기본정보
				}else{
					$(".lt").css('background', 'url(/data/coupon/coupon' + data.couponsametimeimg + '_skin_0' + data.coupon_img + '.gif)');
					$(".rt").css('background', 'url(/data/coupon/coupon' + data.couponsametimeimg + '_skin_0' + data.coupon_img + '.gif)');
					$(".lb").css('background', 'url(/data/coupon/coupon' + data.couponsametimeimg + '_skin_0' + data.coupon_img + '.gif)');
					$(".rb").css('background', 'url(/data/coupon/coupon' + data.couponsametimeimg + '_skin_0' + data.coupon_img + '.gif)');
					$("#couponDetailhelplay").html(couponDetailhelphtml);//우측 기본정보
					$("#couponDetailpricelay").html(couponDetailpricelayhtml);//좌측 쿠폰이미지
				}
				$("#couponDetaillay").html(data.couponDetaillay);//
			}else{
				$(".couponDownloadlay").hide();
			}
		});
	}

	$.getJSON('/promotion/goods_coupon_max?no='+gl_goods_seq+'&price='+gl_goods_price, function(data) {
		if(data){
			if(data.codenumber) $(".promotion_code_area").show();
			$(".promotion_code_area span.cb_codepercent").html(data.benifit);
			$(".promotion_code_area span.cb_codenumber").html(data.codenumber);
		}
	});

	$("#buy").bind("click",function(){
		//희망 배송일 관련
		var hop_status = $(".hop > .desc").text();
		var hop_date = $(".hop > .hop_view_date").text();
		if(hop_status == '(필수)' && hop_date == '(미선택)'){
			alert('희망배송일이 선택 되지 않았습니다.');
			return false;
		}
		
		if( check_option() ){
			var f = $("form[name='goodsForm']");
			f.attr("action","../order/add?mode=direct");
			f.submit();
			f.attr("action","../order/add");
		}
	});

	// 210503. ry4nkim. 모바일 전용 주문하기 버튼
	$("#buy_mo").bind("click",function(){
		//희망 배송일 관련
		var hop_status = $(".hop > .desc").text();
		var hop_date = $(".hop > .hop_view_date").text();
		if(hop_status == '(필수)' && hop_date == '(미선택)'){
			alert('희망배송일이 선택 되지 않았습니다.');
			return false;
		}

		if( check_option_without_msg() ){
			var f = $("form[name='goodsForm']");
			f.attr("action","../order/add?mode=direct");
			f.submit();
			f.attr("action","../order/add");
		} else {
			$('#buy_btn').click();
		}
	});

	// 매장 픽업 구매 :: 2016-07-21 lwh
	$("#direct_store").bind("click",function(){
		var grp_seq = $("select[name='shipping_method'] option:selected").attr('grp_seq');
		$.ajax({
			'url' : '/goods/shipping_detail_info',
			'data' : {'grp_seq':grp_seq,'direct_store':'Y'},
			'success' : function(html){
				if(html){
					if (typeof gl_operation_type != 'undefined' && gl_operation_type == 'light') { // 반응형인 경우
						$("#shipping_detail_lay .title").find("span").html(getAlert('gv051'));
						$("#shipping_detail_lay .layer_pop_contents").html(html);
						showCenterLayer('#shipping_detail_lay');
					} else { // 전용스킨인 경우
						$("#shipping_detail_lay").html(html);
						//매장픽업 구매
						openDialog(getAlert('gv051'), "shipping_detail_lay", {"width":500,"height":650});
					}
				}else{
					//오류가 발생했습니다. 새로고침 후 다시시도해주세요.
					alert(getAlert('gv052'));
					document.location.reload();
				}
			}
		});
	});

	// 배송상세 안내 자세히 버튼 :: 2016-07-21 lwh
	$("#shipping_detail_info").bind("click",function(){
		var grp_seq		= $("select[name='shipping_method'] option:selected").attr('grp_seq');
		var nation		= $("select[name='shipping_method'] option:selected").attr('nation');
		var set_seq		= $("select[name='shipping_method'] option:selected").val();
		var prepay_info	= $("#shipping_prepay_info").val();
		$.ajax({
			'url' : '/goods/shipping_detail_info',
			'data' : {'grp_seq':grp_seq,'set_seq':set_seq,'nation':nation,'goods_seq':gl_goods_seq,'prepay_info':prepay_info},
			'success' : function(html){
				if(html){
					if (typeof gl_operation_type != 'undefined' && gl_operation_type == 'light') {
						$("#shipping_detail_lay .title").find("span").html(getAlert('gv053'));
						 $("#shipping_detail_lay .layer_pop_contents").html(html);
						 showCenterLayer('#shipping_detail_lay');
					} else {
						$("#shipping_detail_lay").html(html);
						//배송비 안내
						openDialog(getAlert('gv053'), "shipping_detail_lay", {"width":500,"height":650});
					}
				}else{
					//오류가 발생했습니다. 새로고침 후 다시시도해주세요.
					alert(getAlert('gv054'));
					document.location.reload();
				}
			}
		});
	});
	$("#shipping_detail_info_resp").bind("click",function(){
		var grp_seq		= $("select[name='shipping_method'] option:selected").attr('grp_seq');
		var nation		= $("select[name='shipping_method'] option:selected").attr('nation');
		var set_seq		= $("select[name='shipping_method'] option:selected").val();
		var prepay_info	= $("#shipping_prepay_info").val();
		$.ajax({
			'url' : '/goods/shipping_detail_info',
			'data' : {'grp_seq':grp_seq,'set_seq':set_seq,'nation':nation,'goods_seq':gl_goods_seq,'prepay_info':prepay_info},
			'success' : function(html){
				if(html){
				   $("#shipping_detail_lay .title").find("span").html(getAlert('gv053'));
					$("#shipping_detail_lay .layer_pop_contents").html(html);
					showCenterLayer('#shipping_detail_lay');
					//배송비 안내
					//openDialog(getAlert('gv053'), "shipping_detail_lay", {"width":500,"height":650});
				}else{
					//오류가 발생했습니다. 새로고침 후 다시시도해주세요.
					alert(getAlert('gv054'));
					document.location.reload();
				}
			}
		});
	});
	/*
	$("#shipping_detail_info").bind("click",function(){
		var grp_seq		= $("select[name='shipping_method'] option:selected").attr('grp_seq');
		var nation		= $("select[name='shipping_method'] option:selected").attr('nation');
		var set_seq		= $("select[name='shipping_method'] option:selected").val();
		var prepay_info	= $("#shipping_prepay_info").val();

		var title = getAlert('gv053');

		$.ajax({
			'url' : '/goods/shipping_detail_info',
			'data' : {'grp_seq':grp_seq,'set_seq':set_seq,'nation':nation,'goods_seq':gl_goods_seq,'prepay_info':prepay_info},
			'success' : function(html){
				if(html){
					var iframe = '<div class="sub_division_title">'+title+'<div class="sub_division_arw sub_division_arw_x" onclick="hideCenterLayer(\'#shipping_detail_lay\')"></div></div>';
					iframe += '<div class="y_scroll_auto">';
					iframe += html;
					iframe += '</div>';
					$("#shipping_detail_lay").html(iframe);
					$("body").append("<div class='resp_layer_bg'></div>");
					showCenterLayer('#shipping_detail_lay');
				}else{
					//오류가 발생했습니다. 새로고침 후 다시시도해주세요.
					alert(getAlert('gv054'));
					document.location.reload();
				}
			}
		});
	});
	*/

	// 희망배송일 달력 팝업 :: 2016-07-21 lwh
	$(".calendarBtn").bind("click",function(){
		var grp_seq = $(this).attr('grp_seq');
		var set_seq = $(this).attr('set_seq');
		hop_calendar_pop(grp_seq, set_seq);
	});

	// 모바일2에서 사용 2014-01-13 lwh
	$('#addCart_option').bind("click",function(){
		if	($(this).hasClass('isopen')){
			var f = $("form[name='goodsForm']");
			if( check_option() ) f.submit();
		}else{
			showGoodsOptionLayer();
		}
	});

	$(".addCart").bind("click",function(){
		//희망 배송일 관련
		var hop_status = $(".hop > .desc").text();
		var hop_date = $(".hop > .hop_view_date").text();
		if(hop_status == '(필수)' && hop_date == '(미선택)'){
			alert('희망배송일이 선택 되지 않았습니다.');
			return false;
		}
		
		var f = $("form[name='goodsForm']");
		f.attr("action","/order/add");
		if( check_option() ) f.submit();
	});

	$("#price_area").bind("mouseover",function(){
		$(this).closest("td").find("div").removeClass("hide");
		$(".goods_spec_table").find(".fb-like").css('z-index','1');
		$(".sale_price_layer").parent().css('z-index','2');
	}).bind("mouseout",function(){
		$(this).closest("td").find("div").addClass("hide");
		$(".goods_spec_table").find(".fb-like").css('z-index','100');
	});

	$(".gift_goods").bind("mouseover",function(){
		$(this).closest("td").find("div").removeClass("hide");
	}).bind("mouseout",function(){
		$(this).closest("td").find("div").addClass("hide");
	});

	$('#nointerest').toggle(function() {
		$(this).closest("td").find("div").removeClass("hide");
	}, function() {
		$(this).closest("td").find("div").addClass("hide");
	});

	$("#nointerest_event").bind("click",function(){
		$(this).closest("div").hide();
	});

	if(typeof gl_goods_seq!="undefined" && gl_goods_seq){
		setFacebooklikeopsave(gl_goods_seq);
	}
});

function getCouponDownlayerclose(){
	$('#couponDownloadDialog').dialog('close');
}

// 레이어 팝업 닫기 버튼 :: 2016-07-21 lwh
function closeLayer(obj){
	$(obj).closest('.detailDescriptionLayer').attr('display','none');
}

//좋아요박스 op 자체작업
function setFacebooklikeopsave(no){
	var datahost = $(".fblikeopengrapybtn").attr("data-host");

	if(typeof datahost!="undefined" && datahost){
		var url = (document.location.protocol == "https:")?'https://'+datahost:'http://'+datahost;
		url = url+'/snsredirect/setFacebooklikeopsave?no='+no;
		actionFrame.location.href = url;
	}
}
