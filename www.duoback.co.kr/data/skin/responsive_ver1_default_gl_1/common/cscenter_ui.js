function pageRefresh() {
	var returnurl = $('#cmtreturnurl').val();
	$( document ).ajaxComplete(function() {
		location.href = returnurl;
	});
}

$(document).ready(function() {

	// 페이징 노출 UI
	var pagingTotalNum = $('#pagingDisplay a').length;
	if ( pagingTotalNum < 2 ) {
		$('#pagingDisplay').hide();
	}

	$('#bbslist .res_table .tbody span.now').closest('.tbody').addClass('now_list');
	$('#bbslist .res_table .tbody span.now').text('현재글');

	// 고객센터 LNB 열고 닫기
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

	// 게시판 보기 상단 반응형 테이블
	respTable( 'table[data-responsive=yes]', 640 );

	// 댓글, 답글 리프레쉬 안되는 오류 임시 해결
	$('[name=boad_cmt_delete_btn], [name=board_commentsend_reply], [name=boad_cmt_delete_reply_btn]').on('click', function() {
		pageRefresh()
	});

});