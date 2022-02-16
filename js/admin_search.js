var ADMIN_SEARCH = function(){
	var search_form, search_input, ico_search, ico_back, ico_close;
	var init = function(obj){
		search_form = obj;
		search_input = search_form.find('._input');
		ico_search = search_form.find('._ico_search');
		ico_back = search_form.find('._ico_back');
		ico_close = search_form.find('._ico_search');

		search_input.keypress(function(event){
			if(checkEnter(event)){
				search_form.submit();
			}
		});

		search_input.keyup(function(event){
			var keyword = $(this).val();
			keyword = $.trim(keyword);
			if(keyword.length>0){
				ico_search.hide();
				ico_back.hide();
				ico_close.show();
			}else{
				ico_search.show();
				ico_back.hide();
				ico_close.hide();
			}
		});

	};

	var submit = function(){
		search_form.submit();
	};

	var reset = function(){
		search_input.val('');
		submit();
	};


	return {
		init : function(obj){
			init(obj);
		},
		submit : function(){
			submit();
		},
		reset : function(){
			reset();
		}
	};
}();