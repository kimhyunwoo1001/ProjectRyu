/* **************************************************************************************
* 스킨 사용자/제작자 JS
************************************************************************************** */
$(function() {
	// jQuery
});

function openDialogAlert(msg,width,height,callback,op=null,customCallback=null){
	// console.log(msg,width,height,callback,customCallback);
	msg = msg.replaceAll("<br \\/>","\n");
	msg = msg.replaceAll("<br\\/>","\n");
	msg = msg.replaceAll("<br>","\n");
	msg = strip_tags(msg);
    if(customCallback){
		customCallback(msg);
    }else{
		alert(decodeEntities(msg));
		if(callback) callback();
	}
}
