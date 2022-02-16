var SITE_MANAGE = function(){
	var type;
	var url_prefix = '/admin/ajax/site_manage/';
	var init = function(t){
		type = t;
		url_prefix = '/admin/ajax/site_manage/';
		if(type == 'main'){
			url_prefix = '/ajax/site_manage/';
		}else if(type=='site'){
			url_prefix = '/admin/ajax/site_manage/';
		}
	};
	var openDeleteSite = function(site_code){
		if(IS_MAIN) init('main');
		$.cocoaDialog.close();
		$.ajax({
			type : 'POST',
			data : {code : site_code},
			url : (url_prefix+'dialog_delete_site.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					var $html = $(res.html);
					$html.find('._confirm').on('click', function(){
						deleteSite(site_code, res.delete_key);
					});
					$.cocoaDialog.open({'type' : 'global_del', 'custom_popup' : $html});
				}else
					alert(res.msg);
			}
		});
	};

	var deleteSiteFlag=false;
	var deleteSite = function(site_code, token){
		if (deleteSiteFlag) { alert(getLocalizeString("설명_버튼은1번만눌러주세요", "", "버튼은 1번만 눌러주세요")); return false; }
		deleteSiteFlag=true;
		$.ajax({
			type : 'POST',
			data : {'code' : site_code, 'token':token},
			url : (url_prefix+'delete_site.cm'),
			dataType : 'json',
			cache : false,
			success : function(result){
				deleteSiteFlag=false;
				if(result.msg == 'SUCCESS'){
					location.reload();
				}else{
					alert(result.msg);

				}
			}
		});
	};

	var openAddUnit = function(site_code){
		$.ajax({
			type : 'POST',
			data : {'site_code' : site_code},
			url : (url_prefix+'dialog_add_unit.cm'),
			dataType : 'json',
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					var $html = $(res.html);
					$html.find('._confirm').on('click',function(){
						addUnit();
					});
					$.cocoaDialog.open({'type': 'global_add', 'custom_popup': $html});
				}else{
					alert(res.msg);
				}
			}
		});

	};

	var addUnit_flag=false;
	var addUnit = function(){
		$('.se-pre-con').css("display","");
		if (addUnit_flag) { alert(getLocalizeString("설명_버튼은1번만눌러주세요", "", "버튼은 1번만 눌러주세요")); return false; }
		var $f = $('#add_unit_form');
		var data = $f.serializeObject();
		addUnit_flag=true;
		$.ajax({
			type : 'POST',
			data : data,
			url : (url_prefix+'add_unit.cm'),
			dataType : 'json',
			cache : false,
			success : function(result){
				addUnit_flag=false;
				if(result.msg == 'SUCCESS'){
					location.reload();
				}else{
					alert(result.msg);
				}
				$('.se-pre-con').css("display","none");
			}
		});
	};

	var openDeleteUnit = function(site_code,unit_code){
		$.cocoaDialog.close();
		$.ajax({
			type : 'POST',
			data : {'site_code' : site_code, 'unit_code' : unit_code},
			url : (url_prefix+'dialog_delete_unit.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(res){
				if(res.msg == 'SUCCESS'){
					var $html = $(res.html);
					$html.find('._confirm').on('click', function(){
						deleteUnit(site_code, unit_code, res.delete_key);
					});
					$.cocoaDialog.open({'type' : 'global_del', 'custom_popup' : $html});
				}else
					alert(res.msg);
			}
		});

	};
	
	var deleteUnit = function(site_code, unit_code, token){
		$.ajax({
			type : 'POST',
			data : {'site_code' : site_code, 'unit_code' : unit_code, 'token':token},
			url : (url_prefix+'delete_unit.cm'),
			dataType : 'json',
			async : false,
			cache : false,
			success : function(result){
				if(result.msg == 'SUCCESS'){
					if(result.move_default_unit){
						window.location.href='http://'+result.default_unit_domain+'/admin/'
					}else{
						location.reload();
					}
				}else{
					alert(result.msg);
				}
			}
		});
	};
	
	return {
		'init' : function(t){
			init(t);
		},
		'openAddUnit' : function(s){
			openAddUnit(s);
		},
		'openDeleteSite' : function(site_code){
			openDeleteSite(site_code);
		},
		'openDeleteUnit' : function(s,u){
			openDeleteUnit(s,u);
		}
	}
}();