$(function(){
	$('.btnUploader').click(function(){
		var select_value = $(".select_img" ).val();
		$('input[name=insert_image]').val(select_value);	

		window.open('/app/javascript/plugin/editor/pages/trex/file_mobile.html?board_id='+board_id+"&insert_image=" + select_value,'','width=600,height=720,toolbar=no,titlebar=no,scrollbars=yes,resizeable');		
	});
	configSelectValue();
	$(".select_img").change(configSelectValue);
});

function configSelectValue() {
	var select_value = $(".select_img" ).val();
	$('input[name=insert_image]').val(select_value);	
}

//////////////////////////////////////////////////////////////////////
// 제거 시 호출 됨
// 실제 제거는 서버에서...
// 듀오백 커스텀
function removeDiv(obj, no) {
	obj = $(obj);
	var oTr	= obj.closest('div');
	var sRemoveiImg = '';

	if( $("input[name='remove_img']").length == 0 ){
		$("input[name='remove_no']").parent().append("<input type='hidden' name='remove_img'>");
	}

	var oRemoveiImg = $("input[name='remove_img']");
	if (oTr.find(".realfilelist").length > 0) {
		if( !oRemoveiImg.val() ){
			sRemoveiImg = oTr.find(".realfilelist").html();
		}else{
			sRemoveiImg = oRemoveiImg.val() + ',' + oTr.find(".realfilelist").html();
		}
	} else {
		if( !oRemoveiImg.val() ){
			sRemoveiImg = $(obj).parent().find("img").attr("src").replace(/^.*[\\\/]/, '');
		}else{
			sRemoveiImg = oRemoveiImg.val() + ',' + $(obj).parent().find("img").attr("src").replace(/^.*[\\\/]/, '');
		}
	}

	oRemoveiImg.val(sRemoveiImg);
	oTr.remove();
}
//////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////
// 파일 업로드 완료 후 호출 됨.
// 듀오백 커스텀
var is_attachimage	= false;
var file_cnt		= 0;
var board_id = $("#board_id").val();

function getFilepath(){

	var filepath="";
	if(board_id == "goods_qna") {
		filepath = "/data/board/goods_qna/";
	} else if (board_id == "mbqna"){
		filepath = "/data/board/mbqna/";
	} else if (board_id == "affiliate"){
		filepath = "/data/board/affiliate/";
	}else if (board_id == "goods_review_ex"){
		filepath = "/data/board/goods_review_ex/";
	}

	return filepath;
}
function addAttachImage(realfilename, incimage)
{
	$("#img_viewer").show();
	var viewer = "";
	
	for( var i = 0; i < realfilename.length; i++) {
		var newImg	= realfilename[i].split("^^")[0];
 	
		viewer += "<div class=\"img_pre_wrap\">";
		viewer += "	<span class='realfilelist' style='display:none' >" + newImg +"</span>";
		viewer += '<img src="' + getFilepath() +  newImg + '" alt="" /><a href="javascript:;"  onclick=\"removeDiv(this)\">삭제</a></div>'
		viewer += "</div>";
		
	}	

	file_cnt = file_cnt + realfilename.length;
	$("#img_viewer").append(viewer);

	var newfilename = realfilename;
	if(modifyfile.length > 0 ) {
		for( var i = 0; i < modifyfile.length; i++ ) {
			newfilename += "," + modifyfile[i];
		}
	}

	changefile(newfilename, incimage);
	is_attachimage = true;
}

// 210611. ry4nkim. 제휴/입점 파일 업로드 예외처리
function addAttachFile(realfilename, incimage)
{
	$("#img_viewer").show();
	var viewer = "";

	for( var i = 0; i < realfilename.length; i++) {
		var newImg	= realfilename[i].split("^^")[0];

		viewer += "<div class=\"img_pre_wrap\">";
		viewer += "	<span class='realfilelist' style='display:none' >" + newImg +"</span>";
		viewer += '<a target="_blank" href="' + getFilepath() +  newImg + '" >' + realfilename[i].split("^^")[1] + '&nbsp;&nbsp;&nbsp;</a><a href="javascript:;"  onclick=\"removeDiv(this)\">삭제</a></div>'
		viewer += "</div>";

	}

	file_cnt = file_cnt + realfilename.length;
	$("#img_viewer").append(viewer);

	var newfilename = realfilename;
	if(modifyfile.length > 0 ) {
		for( var i = 0; i < modifyfile.length; i++ ) {
			newfilename += "," + modifyfile[i];
		}
	}

	changefile(newfilename, incimage);
	is_attachimage = true;
}

function changefile(newfilename, incimage) {
	$_realfile = $('input[name="realfilename"]');
	$_incimage = $('input[name="incimage"]');
	$_delimeter1 = $_realfile.val() != '' ? ',' : '';
	$_delimeter2 = $_realfile.val() != '' ? ',' : '';
	
	$_realfile.val($_realfile.val() + $_delimeter1 + newfilename);
	$_incimage.val($_incimage.val() + $_delimeter2 + incimage);

}
///////////////////////////////////////////////////////////////////////


// 래퍼 페이지에서 호출함..
function checkAttachImage() {
	if( is_attachimage ) {
		is_attachimage = false;
		return;	
	} 	
	// 이미지 삽입 위치 추가..
	configSelectValue();

}

///////////////////////////////////////////////////////////////////////////
// 수정 모드에서 첨부파일 재 구성..
var modifyfile = [];
function modifyAttachImage(realfilename) {	
	
	modifyfile.push(realfilename);	
}

//-->
