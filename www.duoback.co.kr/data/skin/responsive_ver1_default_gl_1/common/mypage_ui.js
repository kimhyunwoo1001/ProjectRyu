function pageRefresh() {
	var returnurl = $('#cmtreturnurl').val();
	$( document ).ajaxComplete(function() {
		location.href = returnurl;
	});
}

$(document).ready(function() {
	// 마이페이지 LNB 로드, 활성화
	$('#subpageLNB').load('../mypage/mypage_lnb #mypageLnbBasic', function() {
		var mypageLnbLink, mypageCateIndex;
		$('#mypageLnbBasic li').each(function(e) {
			mypageLnbLink = $(this).find('a').attr('href').split('?')[0];

			var ignoreUrl = false;
			var matchUrlMenu = false;

			// 예외처리
			if(mypageLnbLink.indexOf('/mypage/emoney')>-1 && REQURL.indexOf('/mypage/emoney_exchange')>-1){
				ignoreUrl = true;
			}

			// URL 강제 매칭
			if(!matchUrlMenu){
				if(mypageLnbLink.indexOf('/mypage/promotion')>-1 || mypageLnbLink.indexOf('/mypage/point_exchange')>-1){
					if(
						(REQURL.indexOf('/mypage/point_exchange')>-1)		// 포인트->마일리지
						||
						(REQURL.indexOf('/mypage/promotion')>-1)		// 포인트->할인코드
						||
						(REQURL.indexOf('/mypage/emoney_exchange')>-1)		// 마일리지->사은품
					){
						matchUrlMenu = true;
					}
				}
				if(mypageLnbLink.trim() == '/mypage/order_catalog'){
					if(REQURL.indexOf('/mypage/order_view')>-1){
						matchUrlMenu = true;
					}
				}
				if(mypageLnbLink.trim() == '/mypage/order_catalog_ita'){
					if(REQURL.indexOf('/mypage/order_view_ita')>-1){
						matchUrlMenu = true;
					}
				}
				if(mypageLnbLink.indexOf('/mypage/refund_catalog')>-1){
					if(REQURL.indexOf('/mypage/refund_view')>-1){
						matchUrlMenu = true;
					}
				}
				if(mypageLnbLink.indexOf('/mypage/return_catalog')>-1){
					if(REQURL.indexOf('/mypage/return_view')>-1){
						matchUrlMenu = true;
					}
				}
				if(mypageLnbLink.indexOf('/mypage/mygdreview_catalog')>-1){
					if(REQURL.indexOf('/mypage/mygdreview_view')>-1){
						matchUrlMenu = true;
					}
					if(REQURL.indexOf('/mypage/mygdreview_write')>-1){
						matchUrlMenu = true;
					}
				}
				if(mypageLnbLink.indexOf('/mypage/mygdqna_catalog')>-1){
					if(REQURL.indexOf('/mypage/mygdqna_view')>-1){
						matchUrlMenu = true;
					}
					if(REQURL.indexOf('/mypage/mygdqna_write')>-1){
						matchUrlMenu = true;
					}
				}
				if(mypageLnbLink.indexOf('/mypage/myqna_catalog')>-1){
					if(REQURL.indexOf('/mypage/myqna_view')>-1){
						matchUrlMenu = true;
					}
					if(REQURL.indexOf('/mypage/myqna_write')>-1){
						matchUrlMenu = true;
					}
				}
			}


			// URL 매칭 여부
			if( REQURL.indexOf(mypageLnbLink) > -1 && !ignoreUrl && !matchUrlMenu){
				matchUrlMenu = true;
			}

			if (matchUrlMenu) {
				mypageCateIndex = e
			}
		});
		$('#mypageLnbBasic li').eq(mypageCateIndex).addClass('on');

		// 마이페이지 LNB 텍스트 수정기능으로 삭제시, 클라이언트단에서 삭제 처리
		$('#mypageLnbBasic a').each(function(e) {
			if ( $(this).text() == '' ) {
				$(this).parent('li, h2, h3').remove();
			}
		});
	});

	// 마이페이지 LNB 열고 닫기
	$('#subAllButton').click(function() {
		if ( $(this).hasClass('active') ) {
			$('#subpageLNB').removeClass('active');
			$(this).removeClass('active');
			hideModal();
		} else {
			$('#subpageLNB').addClass('active');
			$(this).addClass('active');
			showModal( 'gonID' );
		}
	});
	$(document).on('click', '#gonID', function() {
		$('#subpageLNB').removeClass('active');
		$('#subAllButton').removeClass('active');
		hideModal();
	});

	// [나의 1:1문의, 나의 상품문의, 나의 상품후기] 보기 상단 테이블
	respTable( 'table[data-responsive=yes]', 640 );

	// 댓글, 답글 리프레쉬 안되는 오류 임시 해결
	$('[name=boad_cmt_delete_btn], [name=board_commentsend_reply], [name=boad_cmt_delete_reply_btn]').on('click', function() {
		pageRefresh()
	});

});
