$(function(){
    $("input[name='userid']").blur(function() {
        if($(this).val()){
            // if(!CheckEmail($(this).val())){
            //     const text = "이메일형식으로 입력해주세요."
            //     $("#id_info").html(text);
            //     return;
            // }
            $.post("../member_process/id_chk", { userid : $(this).val() }, function(response){
                //debug(response);
                var text = response.return_result;
                var userid = response.userid;
                $("#id_info").html(text);
                $("input[name='userid']").val(userid);
            },'json');
        }
    });

    if(mtype=='business' && bno_use=='Y'){
        $("input[name='bno']").blur(function() {
            if($(this).val()){
                $.post("../member_process/bno_chk", { bno : $(this).val() }, function(response){
                    //debug(response);
                    var text = response.return_result;
                    var bno = response.bno;
                    $("#bno_info").html(text);
                    //$("input[name='bno']").val(bno);
                },'json');
            }
        });
    }

	$('#find_email').change(function() {
		if($(this).val() == "select"){
			$("input[name='email[1]']").val("");
			// $("input[name='email[1]']").hide();
			return;
		}
		$("input[name='email[1]']").val($(this).val());
		if(!$(this).val()){
			// $("input[name='email[1]']").show();
			$("input[name='email[1]']").attr("readonly",false);
		}else{
			// $("input[name='email[1]']").hide();
			$("input[name='email[1]']").attr("readonly",true);
		}
	});


    $(".selectLabelSet").each(function(){
        var selectLabelSetObj = $(this);
        $("select.selectLabelDepth1",selectLabelSetObj).bind('change',function(){
            var childs = $("option:selected",this).attr('childs').split(';');
            var joinform_seq = $(this).attr('joinform_seq');
            var select2 = $("input.hiddenLabelDepth[type='hidden'][joinform_seq='"+joinform_seq+"']").val();
            if(childs[0]){
                $(".selectsubDepth",selectLabelSetObj).show();
                $("select.selectLabelDepth2[joinform_seq='"+joinform_seq+"']").empty();
                for(var i=0; i< childs.length ; i++){
                    $("select.selectLabelDepth2[joinform_seq='"+joinform_seq+"']")
                    .append("<option value='"+childs[i]+"'>"+childs[i]+"</option>");
                }
            }else{
                $(".selectsubDepth",selectLabelSetObj).hide();
            }
            $("select.selectLabelDepth2 option[value='"+select2+"']").attr('selected',true);
        }).trigger('change');
    });


    /* ========== 반응형 프론트엔드 추가 ========= */
    // designed radio UI
    $('.designed_radio_checkbox input[type=radio]').closest('.designed_radio_checkbox').addClass('type_radio');
    $('.designed_radio_checkbox input[checked]').parent('label').addClass('on');

    $('.designed_radio_checkbox input[type=radio]').on('change', function() {
        $(this).parent().parent().find('label').removeClass('on');
        $(this).parent('label').addClass('on');
    });
    // designed checkbox UI
    $('.designed_radio_checkbox input[type=checkbox]').on('change', function() {
        if ( $(this).prop('checked') ) {
            $(this).parent('label').addClass('on');
        } else {
            $(this).parent('label').removeClass('on');
        }
    });
    /* ========== //반응형 프론트엔드 추가 ========= */


    // 약관 전체동의
    $('#pilsuAgreeAll > input[type=checkbox]').on('change', function() {
        if ( $(this).prop('checked') ) {
            $(this).closest('.mem_agree_area').find('input[type=checkbox].pilsu').attr('checked', 'checked');
            $(this).closest('.mem_agree_area').find('input[type=checkbox].pilsu').closest('li').addClass('end');
        } else {
            $(this).closest('.mem_agree_area').find('input[type=checkbox].pilsu').removeAttr('checked');
            $(this).closest('.mem_agree_area').find('input[type=checkbox].pilsu').closest('li').removeClass('end');
        }
    });

    // 개별 약관 선택시
    $('#agreeList input[type=checkbox]').on('change', function() {
        if ( $(this).prop('checked') ) {
            $(this).closest('li').addClass('end');
        } else {
            $(this).closest('li').removeClass('end');
        }
    });
    $('#ab_chkt3').on('change', function() {
        if ( $(this).prop('checked') ) {
            $(".get_agree input").attr('checked', 'checked');
        } else {
            $(".get_agree input").removeAttr('checked');
        }
    });


	$('#btn_submit').click(function() {
		if(!$("input[name='agree']").is(":checked")){
			//이용약관에 동의하셔야합니다.
			alert(getAlert('mb001'));
			return false;
		}
		if(!$("input[name='agree2']").is(":checked")){
			//개인정보처리방침에 동의하셔야합니다.
			alert(getAlert('mb002'));
			return false;
		}

		$('#agreeFrm').submit();
	});
});

// 추천인 확인
function chkRecommend(type){
    var recommend	= $("#recommend").val();
    if(type=="b")	recommend = $("#brecommend").val();
    if	(!recommend){
        //추천인명을 입력하세요
        openDialogAlert(getAlert('mb009'), 400, 150);
        return;
    }
    actionFrame.location.href	= '/member/recommend_confirm?recomid='+recommend+'&type='+type;
}

//본인인증:휴대폰
function phonePopup(){
    if($("#cellphone").attr("readonly")){
        return;
    }
	var link_url = url + "realnametype=phone";
	window.open(link_url, 'popupChk', 'width=500, height=550, top=100, left=100, fullscreen=no, menubar=no, status=no, toolbar=no, titlebar=yes, location=no, scrollbar=no');
}



function filterKey(e) {
	var keycode;
	var prevent = null;
	var filter = "[0-9a-z]";
	if(filter){
		// for something else IE
		if (e != null) {
			keycode = e.which;
			prevent = function() {
				e.which = 0;
				e.preventDefault();
			};
		}
		// for IE
		else {
			keycode = window.event.keyCode;
			prevent = function() {
				window.event.keyCode = 0;
				window.event.returnValue = false;
			};
		}

		// fromCharCode : 매개 변수에서 ASCII 값이 나타내는 문자들로 구성된 문자열을 반환합니다
		var sKey = String.fromCharCode(keycode);
		// RegExp
		// 정규표현을 취급하는 객체로 new를 사용하지 않고 정규표현 문자열을 변수에 대입하는 것으로도 동일한 결과
		var re = new RegExp(filter);
		// test() : 일치하는 문자열이 있는 경우 true, 없으면 false
		if(!re.test(sKey)) {
			prevent();
		}
	}
}
//회원가입버튼 클릭시 버튼 숨기기
function registAct(){
    if(cellphone_use=="Y"){
        if(!isAgreementOk){
            alert("먼저 본인 인증을 해주세요.");
            return false;
        }
    }

    // 사업자 회원인 경우
    if(mtype=="business"){
        if(!$("input[name='bname']").val()){
            alert("상호명을 입력해주세요.");
            $("input[name='bname']").focus()
            return false;
        }
        if(!$("input[name='bno']").val()){
            alert("사업자등록번호를 입력해주세요.");
            $("input[name='bno']").focus()
            return false;
        }
    }

    if(!$("input[name='agree']").is(":checked")){
        //이용약관에 동의하셔야합니다.
        alert(getAlert('mb001'));
        return false;
    }
    if(!$("input[name='agree2']").is(":checked")){
        //개인정보처리방침에 동의하셔야합니다.
        alert(getAlert('mb002'));
        return false;
    }

	$('#btn_register').hide();
}

function CheckEmail(str){
     var reg_email = /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
     if(!reg_email.test(str)) {
          return false;
     }
     else {
          return true;
     }
}


function agreementOk(name,hpnumber){
    // console.log("agreementOk",name,hpnumber);
    if(name && hpnumber){
        isAgreementOk = 1;
        var hpnumberArr = hpnumber.split("-");
        if(mtype=="business"){
            $("#bcellphone").val(hpnumber).prop("readonly",true);
            $("#bcellphone1").val(hpnumberArr[0]).prop("readonly",true);
            $("#bcellphone2").val(hpnumberArr[1]).prop("readonly",true);
            $("#bcellphone3").val(hpnumberArr[2]).prop("readonly",true);
            $("input[name=bceo]").val(name).prop("readonly",true);
            $("#bcellphone+input[type=button]").val("본인인증완료");
        }else{
            $("#cellphone").val(hpnumber).prop("readonly",true);
            $("#cellphone1").val(hpnumberArr[0]).prop("readonly",true);
            $("#cellphone2").val(hpnumberArr[1]).prop("readonly",true);
            $("#cellphone3").val(hpnumberArr[2]).prop("readonly",true);
            $("input[name=user_name]").val(name).prop("readonly",true);
            $("#cellphone+input[type=button]").val("본인인증완료");
        }
    }

}

function openPopBno(){
    if(!$("input[name=bname]").val()){
        alert("상호명을 입력해주세요.");
        $("input[name=bname]").focus();
        return;
    }
    if(!$("input[name=bno]").val()){
        alert("사업자등록번호를 입력해주세요.");
        $("input[name=bno]").focus();
        return;
    }
    var win;
	win = window.open('/comcheck?bno='+$("input[name=bno]").val()+'&bname='+$("input[name=bname]").val(), 'com_ck', 'width=335, height=225, left=100, top=100, toolbar=no, location=no, directories=no, status=no, menubar=no, resizable=no, scrollbars=no, copyhistory=no');
	win.focus();
}
