var CONTENTS_LIST = function(){
	var that, contents_obj, selected_class, all_check, all_chk_len, default_header, select_header, select_cnt_obj,
		content_body, mobile_header;
	var check_idx;

	var init = function(obj){
		that = this;
		contents_obj = obj;
		content_body = $('._content_body');
		check_idx = [];
		selected_class = 'selected';
		default_header = $('#header');
		select_header = $('#select_header');
		select_cnt_obj = $('#select_cnt');
		mobile_header = $('#mobile_header');
		all_check = contents_obj.find('._all_check');
		all_chk_len = content_body.find('input:checkbox').length;
	};

	var allCheckToggle = function(callback){
		if(all_check.prop('checked')){
			allCheckItem(callback);
		}else{
			cancelCheckItem(callback);
		}
	};
	var allCheckItem = function(callback){
		contents_obj.find('input:checkbox').prop('checked',true);
		all_check.prop('checked',true);
		checkItem(callback);
	};
	var cancelCheckItem = function(callback){
		contents_obj.find('input:checkbox').prop('checked',false);
		all_check.prop('checked',false);
		checkItem(callback);
	};

	var checkItem = function(callback){
		var chk_len = content_body.find('input:checkbox:checked').length;
		check_idx = [];
		contents_obj.find('input:checkbox:checked').each(function(){
			check_idx.push($(this).data('idx'));
		});
		if(chk_len>0){
			select_header.show();
			default_header.hide();
			mobile_header.hide();
		}else{
			select_header.hide();
			default_header.show();
			mobile_header.show();
		}
		select_cnt_obj.text(chk_len);

		if(all_chk_len === 0){
			all_check.prop('checked', false);
			alert('선택할 데이터가 없습니다.');
		}else{
			if(all_chk_len != chk_len) all_check.prop('checked',false);
			else all_check.prop('checked',true);
		}

		if(typeof callback == 'function'){
			callback(check_idx);
		}
	};

	var checkActionWithReviewCode = function(callback){
		var item = [];
		contents_obj.find('input:checkbox:checked').each(function() {
			item.push($(this).val());
		});
		return callback(item);
	};


	return {
		init: function(obj) {
			init(obj);
		},
		checkItem: function(callback){
			checkItem(callback);
		},
		allCheckItem : function(callback){
			allCheckItem(callback);
		},
		cancelCheckItem : function(callback){
			cancelCheckItem(callback);
		},
		allCheckToggle : function(callback){
			allCheckToggle(callback);
		},
		checkActionWithReviewCode : function(callback){
			checkActionWithReviewCode(callback);
		}
	};

}();