var COUPON = function(){
	var $coupon_add_form;
	var header_ctl;
	var $content;
	var $coupon_issue_list = '';

	var is_modify = false;
	var type_group_code_list = [];
	var apply_type_category_list = [];
	var select_group_name = "";
	var select_group_code = "";
	var select_category_code = "";
	var current_base_url='';
	var current_page = 1;
	var old_data = {
		apply_sale_percent : '',
		apply_sale_price : '',
		apply_sale_type : 'price',
		apply_sale_type_minimum_price : '',
		apply_sale_type_percent_max_price : '',
		apply_type : '',
		apply_type_category_list : '',
		apply_type_product_list : '',
		code : '',
		create_date : '',
		currency : '',
		end_date : '',
		is_limit : '',
		is_overlap : '',
		is_unlimited_date : '',
		limit_count : '',
		is_duplication : '',
		is_alarm : true,
		menu_type : '',
		name : '',
		start_date : '',
		type : 'down',
		type_coupon_code : '',
		type_coupon_create_count : '',
		type_group_code : '',
		type_is_mult_coupon : '',
		type_target : 'all',
		unit_code : '',
		member_limit_count : '',
		use_guest : ''
	};
	var group_count = 0;
	var category_count = 0;
	var $group_name = "";
	var $product_search_input;
	var $product_search_btn;
	var $product_search_list;
	var product_list = [];
	var product_list_data = [];
	var $product_add_btn;
	var $product_more_btn;
	var $product_apply_list;
	var page = 1;
	var init = function(){
		$content = $("#content");
	};
	var is_submit = false;
	var is_issue_list_loading = false;

	//쿠폰 리스트 페이지 기본설정
	var listInit = function(base_url){
		current_base_url = base_url;
		var $coupon_list_table = $("#coupon_list_table");

		//체크박스 전체체크 설정 및 삭제버튼 표시 이벤트 설정
		$coupon_list_table.find("input[type='checkbox']").off("click.coupon_list_table").on("click.coupon_list_table",function(){
			if($(this).hasClass("_all_check")) $coupon_list_table.find("input[type='checkbox']").prop("checked",$(this).prop("checked"));

			if($coupon_list_table.find("input[type='checkbox']:checked").length > 0) showDeleteBtn();
			else hideDeleteBtn();
		});

		$content.find("._delete_btn").off("click._delete_btn").on("click._delete_btn",function(){
			deleteCoupon($(this).data("code"));
		});
		$content.find("._coupon_search").off("keyup._coupon_search").on("keyup._coupon_search",function(e){
			if (e.keyCode == 13) startKeywordSearch();
		});
		$content.find("._coupon_search_btn").off("click._coupon_search_btn").on("click._coupon_search_btn",function(e){
			startKeywordSearch();
		});


		$content.find("._issue_btn").off("click._issue_btn").on("click._issue_btn",function(){
			var code = $(this).data("code");
			var is_create_mult_couon = $(this).data("create-mult-type") == "Y" ? true : false;
			if(code != "")  openIssueDialog(code,is_create_mult_couon);
		});

		$content.find("._modify_btn").off("click._modify_btn").on("click._modify_btn",function(){
			window.location.href = current_base_url+'&mode=add&code='+$(this).data("code");
		});
	};

	//쿠폰 추가페이지 기본설정
	var addInit = function(data,_product_list_data){
		//그룹선택 이벤트 설정
		$group_name = $content.find("._group_name");
		$product_apply_list =  $content.find("._product_apply_list");
		var _old_data = JSON.parse(data);
		if(!isBlank(_old_data)){
			$.each(old_data,function(k,v){
				old_data[k] = _old_data[k];
			});
			type_group_code_list = old_data.type_group_code;
			apply_type_category_list = old_data.apply_type_category_list;
			product_list = old_data.apply_type_product_list;
			is_modify = true;
		}
		if(!isBlank(_product_list_data))product_list_data = JSON.parse(_product_list_data);

		setHeaderCtlEvent();
		//쿠폰명 기본값 설정
		$content.find("input[name=name]").val(old_data.name);
		$content.find("input[name=name]").off("blur.name").on("blur.name",function(){
			var option = {max_byte : 80};
			$(this).limitLength(option);
		});

		//쿠폰 적용형식 이벤트 설정
		$content.find("select[name=apply_type]").off("change.apply_type").on("change.apply_type",function(){
			if(is_modify){
				$content.find("select[name=apply_type]").val(old_data.apply_type);
				alert(getLocalizeString("설명_쿠폰정보수정시쿠폰형식변경불가", "", "쿠폰정보 수정시에는 쿠폰형식을 변경할 수 없습니다."));
				return false;
			}
			setLayoutByCouponApplyType($(this).val());
		});

		//쿠폰형식 이벤트 설정
		$content.find("select[name=type]").off("change.apply_sale_type").on("change.apply_sale_type",function(){
			if(is_modify){
				$content.find("select[name=type]").val(old_data.type);
				alert(getLocalizeString("설명_쿠폰정보수정시쿠폰형식변경불가", "", "쿠폰정보 수정시에는 쿠폰형식을 변경할 수 없습니다."));
				return false;
			}
			setLayoutByCouponType($(this).val());
		});
		//쿠폰형식 기본값 설정

		$content.find("select[name=type]").val(old_data.type);



		$content.find("._check_drop_group_list li a").off("click._check_drop_group_list").on("click._check_drop_group_list",function(){
			if(is_modify){
				alert(getLocalizeString("설명_쿠폰정보수정시적용그룹변경불가", "", "쿠폰정보 수정시에는 적용그룹을 변경할 수 없습니다."));
				return false;
			}
			var group_code = $(this).data("code");
			group_count = 0;

			if($(this).parent().hasClass("active")){
				deleteArrayValue(type_group_code_list,group_code);
				$(this).parent().removeClass("active checked");
			}else{
				type_group_code_list.push(group_code);
				$(this).parent().addClass("active checked");
			}
			setGroupSelect();
		});
		if(old_data.type_target == "group" || old_data.type_target == "app_group"){
			$.each(type_group_code_list,function(i,code){
				$content.find("._check_drop_group_list li a[data-code='"+code+"']").parent().addClass("active checked");
			});
			setGroupSelect();
		}



		$content.find("._check_drop_category_list li a").off("click._check_drop_category_list").on("click._check_drop_category_list",function(){
			// if(is_modify){
			// 	alert("쿠폰정보 수정시에는 적용그룹을 변경할 수 없습니다.");
			// 	return false;
			// }
			var category_code = $(this).data("code");
			var parent_code = isBlank($(this).data("parent")) ? "" : $(this).data("parent");
			category_count = 0;

			if($(this).parent().hasClass("active")){
				deleteArrayValue(apply_type_category_list,category_code);
				$(this).parent().removeClass("active checked");

				if(parent_code != "") delCategory(parent_code,'parent');
				if(category_code != "") delCategory(category_code,'child');



			}else{
				apply_type_category_list.push(category_code);
				$(this).parent().addClass("active checked");

				if(parent_code != "") setCategory(parent_code,'parent');
				if(category_code != "") setCategory(category_code,'child');
			}

			setCategorySelect();
			header_ctl.change();
		});


		$content.find("._product_search_btn").off("click._product_search_btn").on("click._product_search_btn",function(){
			openProductSearchDialog();
		});
		setProductList();


		if(old_data.apply_type == "category"){
			$.each(apply_type_category_list,function(i,code){
				$content.find("._check_drop_category_list li a[data-code='"+code+"']").parent().addClass("active checked");
			});
			setCategorySelect();
		}



		//시작일 및 종료일 데이트 피커 설정
		var date_option = {
			dayViewHeaderFormat: 'YYYY MMMM',
			locale: getMomentLangCode(ADMIN_LANG_CODE),
			icons: {
				time: 'zmdi zmdi-time',
				date: 'zmdi zmdi-calendar',
				up: 'zmdi zmdi-chevron-up',
				down: 'zmdi zmdi-chevron-down',
				previous: 'zmdi zmdi-chevron-left',
				next: 'zmdi zmdi-chevron-right',
				today: 'glyphicon glyphicon-screenshot',
				clear: 'glyphicon glyphicon-trash'
			},
			format:"YYYY/MM/DD HH:mm"
		};
		var $start_date = $content.find("input[name='start_date']");
		var $end_date = $content.find("input[name='end_date']");

		if(is_modify)date_option['defaultDate'] = old_data.start_date;
		else date_option['defaultDate'] = new Date();


		$start_date.datetimepicker(date_option).on("dp.change",function(e){
			$end_date.data("DateTimePicker").minDate(e.date);
			header_ctl.change();
		});

		if(is_modify) date_option['defaultDate'] = old_data.end_date;
		else{
			date_option['defaultDate']  = $start_date.data("DateTimePicker").date().add("+7",'days').set({'hour':23,'minute':59});
		}

		$end_date.datetimepicker(date_option).on("dp.change",function(e){
			header_ctl.change();
		});
		if(is_modify){
			if(old_data.is_unlimited_date){
				$end_date.data("DateTimePicker").disable();
			}else{
				$end_date.data("DateTimePicker").minDate(old_data.start_date);
			}
		}
		else{
			$end_date.data("DateTimePicker").minDate($start_date.data("DateTimePicker").date());
		}

		$content.find("input[name='is_alarm']").off("change").on("change",function(){
			var $_that = $(this);

			if ( $_that.prop('checked') ) {
				$content.find("._is_alarm_booking").show();
			} else {
				$content.find("._is_alarm_booking").hide();
			}
		});

		//시작일 및 종료일 이벤트 설정
		$content.find("input[name='is_unlimited_date']").off("click.is_unlimited_date").on("click.is_unlimited_date",function(){
			if($(this).prop("checked")){
				$content.find("._is_alarm_booking").css({ "display": "none" });
				$end_date.data("DateTimePicker").disable();
			}else{
				$content.find("._is_alarm_booking").css({ "display": "table-cell" });
				$end_date.data("DateTimePicker").minDate($start_date.data("DateTimePicker").date());
				$end_date.data("DateTimePicker").enable();
			}
		});

		$content.find("input[name='is_unlimited_date']").prop("checked",old_data.is_unlimited_date);
		$content.find("input[name='is_unlimited_date']").prop("checked") ? $end_date.data("DateTimePicker").disable() : $end_date.data("DateTimePicker").enable();

		setLayoutByCouponApplyType(old_data.apply_type);
		setLayoutByCouponType(old_data.type);
		setLayoutByApplySaleType(old_data.apply_sale_type);

		$content.find("input[name='apply_sale_price']").val(old_data.apply_sale_type=="percent"? old_data.apply_sale_percent : old_data.apply_sale_price);
		$content.find("input[name='apply_sale_type_minimum_price']").val(old_data.apply_sale_type_minimum_price);
		$content.find("input[name='apply_sale_type_percent_max_price']").val(old_data.apply_sale_type_percent_max_price);

		$content.find("input[name='is_overlap']").prop("checked",old_data.is_overlap);
		$content.find("input[name='is_duplication']").prop("checked",old_data.is_duplication);

		set_money_format($content.find("input[name='apply_sale_price']"));
		set_money_format($content.find("input[name='apply_sale_type_minimum_price']"));
		set_money_format($content.find("input[name='apply_sale_type_percent_max_price']"));
	};

	function setGroupSelect(){
		if(type_group_code_list.length > 0){
			select_group_code = select_group_code == "" ? type_group_code_list[0] : select_group_code;
			if($.inArray(select_group_code,type_group_code_list) == -1) select_group_code = type_group_code_list[0];
			select_group_name = $content.find("._check_drop_group_list li a[data-code="+select_group_code+"]").html();
			$group_name.find("._group_name_text").html(select_group_name);

		}else{
			$group_name.find("._group_name_text").html("그룹선택");
		}
		group_count = type_group_code_list.length - 1;
		group_count = group_count > 0 ? "+"+group_count : "";
		$group_name.find("._group_count").html(group_count);
	}

	function clearCategorySelect(){
		apply_type_category_list = [];
		$content.find("._check_drop_category_list li").removeClass("active checked");
		$group_name.find("._category_name_text").html(getLocalizeString("설명_카테고리선택", "", "카테고리선택"));
		$group_name.find("._category_count").html("");
	}
	function setCategorySelect(){
		if(apply_type_category_list.length > 0){
			select_category_code = select_category_code == "" ? apply_type_category_list[0] : select_category_code;
			if($.inArray(select_category_code,apply_type_category_list) == -1) select_category_code = apply_type_category_list[0];
			select_group_name = $content.find("._check_drop_category_list li a[data-code="+select_category_code+"]").html();
			$group_name.find("._category_name_text").html(select_group_name);
		}else{
			$group_name.find("._category_name_text").html(getLocalizeString("설명_카테고리선택", "", "카테고리선택"));
		}
		category_count = apply_type_category_list.length - 1;
		category_count = category_count > 0 ? "+"+category_count : "";
		$group_name.find("._category_count").html(category_count);
	}

	function setCategory(code,type){
		if(type == "parent"){
			var $parent_obj = $content.find("a[data-code='"+code+"']");
			$parent_obj.parent().addClass("active checked");
			deleteArrayValue(apply_type_category_list,code);
			apply_type_category_list.push(code);

			select_category_code = select_category_code == "" ? code : select_category_code;

			var is_parent = !isBlank($parent_obj.attr("data-parent"));
			if(is_parent) setCategory($parent_obj.attr("data-parent"),'parent');
		}else{
			var $child_obj = $content.find("a[data-parent='"+code+"']");
			$child_obj.each(function(){
				var code = $(this).data("code");
				deleteArrayValue(apply_type_category_list,code);
				apply_type_category_list.push(code);
				$(this).parent().addClass("active checked");

				var child_list = $content.find("a[data-parent='"+code+"']");
				if(child_list.length > 0){
					setCategory(code,'child');
				}

			});
		}
	}

	function delCategory(code,type){
		if(type == "parent"){

			if($content.find("a[data-parent='"+code+"']").parents(".active").length == 0){

				var $parent_obj = $content.find("a[data-code='"+code+"']");
				$parent_obj.parent().removeClass("active checked");
				deleteArrayValue(apply_type_category_list,code);

				var is_parent = !isBlank($parent_obj.attr("data-parent"));
				if(is_parent) delCategory($parent_obj.attr("data-parent"),'parent');

			}

		}else{
			var $child_obj = $content.find("a[data-parent='"+code+"']");
			$child_obj.each(function(){
				var code = $(this).data("code");

				deleteArrayValue(apply_type_category_list,code);
				$(this).parent().removeClass("active checked");

				var child_list = $content.find("a[data-parent='"+code+"']");
				if(child_list.length > 0){
					delCategory(code,'child');
				}

			});
		}
	}

	//쿠폰 적용형식에 따른 레이아웃 설정
	function setLayoutByCouponApplyType(type){
		$content.find("._apply_type").hide();
		$content.find("._product_list").hide();
		switch(type){
			case 'category':
				//수정상태가 아닐경우 선택된 카테고리 초기화
				if(!is_modify) clearCategorySelect();
				$content.find("._apply_type").show();
				break;
			case 'product':
				$content.find("._product_list").show();
			default :

				break;
		}
	}


	//쿠폰형식에 따른 레이아웃 설정
	function setLayoutByCouponType(type){
		$content.find("._type_target, ._type_group_code,._type_is_mult_coupon, ._type_coupon_code, ._type_coupon_create_count, ._is_limit, ._limit_count, ._is_alarm, ._is_alarm_booking, ._is_only_app_helper, ._use_guest_coupon_wrap").hide();

		$content.find("input[name='is_duplication']").off("click.is_duplication").on("click.is_duplication",function(){
			$content.find("._member_limit_count").css({
				"display":$(this).prop("checked")?"table-cell":"none"
			});
			if(type == "create"){
				$content.find("._use_guest_coupon_wrap").css({
					"display" : $(this).prop("checked") ? "none" : "table-cell"
				});
			}
		}).prop("checked",old_data.member_limit_count);

		$content.find("input[name='use_guest']").off("click.use_guest").on("click.use_guest",function(){
			$content.find("._is_duplication_wrap").css({
				"display":$(this).prop("checked")?"none" : "table-cell"
			});
		}).prop("checked",old_data.use_guest);

		if(is_modify){
			$content.find("input[name='member_limit_count']").off("click.member_limit_count").on("click.member_limit_count",function(){
				alert(getLocalizeString("설명_쿠폰정보수정시에는동일회원최대", "", "쿠폰정보 수정시에는 동일 회원 최대 중복 사용 수 변경이 불가합니다."));
				return false;
			});
			$content.find("input[name='is_duplication']").off("click.is_duplication").on("click.is_duplication",function(){
				alert(getLocalizeString("설명_쿠폰정보수정시에는중복사용", "", "쿠폰정보 수정시에는 중복 사용 가능 수정이 변경이 불가합니다."));
				return false;
			});
		}
		$content.find("input[name='member_limit_count']").attr('placeholder',getLocalizeString("설명_공백시무제한", "", "공백 시 무제한")).prop("readOnly",is_modify);

		if(type == "create"){//쿠폰 생성시 설정
			$content.find("input[name='type_is_mult_coupon']").off("click.type_is_mult_coupon").on("click.type_is_mult_coupon",function(){

				if(is_modify){
					alert(getLocalizeString("설명_쿠폰정보수정시에는쿠폰수제한을변경", "", "쿠폰정보 수정시에는 쿠폰 수 제한을 변경할 수 없습니다."));
					$(this).prop("checked",old_data.type_is_mult_coupon);
				}

				$content.find("._type_coupon_create_count").css({
					"display":$(this).prop("checked")?"table-cell":"none"
				});
				$content.find("._type_coupon_code").css({
					"display":$(this).prop("checked")?"none":"table-cell"
				});
			});
			$content.find("._type_is_mult_coupon").css({"display":"block"});
			$content.find("._use_guest_coupon_wrap").css({"display":"table-cell"});

			$content.find("input[name='is_duplication']").prop({
				"checked":old_data.is_duplication
			});
			$content.find("input[name='type_is_mult_coupon']").prop({
				"checked":old_data.type_is_mult_coupon
			});
			$content.find("input[name='use_guest']").prop({
				"checked":old_data.use_guest
			});
			$content.find("._type_coupon_create_count").css({
				"display":$content.find("input[name='type_is_mult_coupon']").prop("checked")?"table-cell":"none"
			});
			$content.find("._type_coupon_code").css({
				"display":$content.find("input[name='type_coupon_code']").prop("checked")?"none":"table-cell"
			});
			$content.find("input[name='type_coupon_code']").val(old_data.type_coupon_code).prop("readOnly",is_modify);
			$content.find("input[name='type_coupon_create_count']").val(old_data.type_coupon_create_count).prop("readOnly",is_modify);
			$content.find("input[name='type_coupon_create_count']").off("keyup.type_coupon_create_count").on("keyup.type_coupon_create_count",function(){
				$(this).val($(this).val() > 1000 ? 1000 : $(this).val());
			});

		}else{//고객 다운로드시 설정
			$content.find("select[name='type_target']").val(old_data.type_target);
			$content.find("select[name='type_target']").off("change.type_target").on("change.type_target",function(){
				if(is_modify){
					$(this).val(old_data.type_target);
					alert(getLocalizeString("설명_쿠폰정보수정시에는대상을변경", "", "쿠폰정보 수정시에는 대상을 변경할 수 없습니다."));
					return false;
				}

				var type_target_list_value = $(this).val();
				$content.find("._use_guest_coupon_wrap").css({"display":"none"});

				switch( type_target_list_value ) {
					case 'group':
						if(!is_modify) $content.find("._is_alarm").css({ "display": "inline-block" });
						if(!is_modify) $content.find("._is_alarm_booking").css({ "display": "inline-block" });
						$content.find("._type_group_code").css({ "display": "table-cell" });
						$content.find("._is_only_app_helper").css({ "display": "none" });
						break;
					case 'app_group':
						$content.find("._type_group_code").css({ "display": "table-cell" });
						$content.find("._is_only_app_helper").css({ "display": "table-cell" });
						if(!is_modify) $content.find("._is_alarm").css({ "display": "inline-block" });
						if(!is_modify) $content.find("._is_alarm_booking").css({ "display": "inline-block" });
						break;
					case 'app_all':
						$content.find("._type_group_code").css({ "display": "none" });
						$content.find("._is_only_app_helper").css({ "display": "table-cell" });
						break;
					default:
						$content.find("._type_group_code").css({ "display": "none" });
						$content.find("._is_only_app_helper").css({ "display": "none" });
						if(!is_modify) $content.find("._is_alarm").css({ "display": "inline-block" });
						if(!is_modify) $content.find("._is_alarm_booking").css({ "display": "inline-block" });
						break;
				}
			});


			$content.find("input[name='is_limit']").off("click.is_limit").on("click.is_limit",function(){
				if(is_modify){
					$(this).prop("checked",old_data.is_limit);
					alert(getLocalizeString("설명_쿠폰정보수정시에는쿠폰수제한을변경", "", "쿠폰정보 수정시에는 쿠폰 수 제한을 변경할 수 없습니다."));
					return false;
				}
				$content.find("._limit_count").css({
					"display":$(this).prop("checked")?"table-cell":"none"
				});
			}).prop("checked",old_data.is_limit);

			switch( $content.find("select[name='type_target']").val() ) {
				case 'group':
					if(!is_modify) $content.find("._is_alarm").css({ "display": "inline-block" });
					// if(!is_modify) $content.find("._is_alarm_booking").css({ "display": "table-cell" });
					$content.find("._type_group_code").css({ "display": "table-cell" });
					$content.find("._is_only_app_helper").css({ "display": "none" });
					break;
				case 'app_group':
					$content.find("._type_group_code").css({ "display": "table-cell" });
					$content.find("._is_only_app_helper").css({ "display": "table-cell" });
					if(!is_modify) $content.find("._is_alarm").css({ "display": "inline-block" });
					if(!is_modify) $content.find("._is_alarm_booking").css({ "display": "inline-block" });
					break;
				case 'app_all':
					$content.find("._type_group_code").css({ "display": "none" });
					$content.find("._is_only_app_helper").css({ "display": "table-cell" });
					break;
				default:
					$content.find("._type_group_code").css({ "display": "none" });
					$content.find("._is_only_app_helper").css({ "display": "none" });
					if(!is_modify) $content.find("._is_alarm").css({ "display": "inline-block" });
					if(!is_modify) $content.find("._is_alarm_booking").css({ "display": "inline-block" });
					break;
			}

			$content.find("._type_target").css({"display":"block"});
			$content.find("._is_limit").show();

			if(old_data.is_limit) $content.find("._limit_count").show();

			$content.find("input[name='limit_count']").val(old_data.limit_count).prop("readOnly",is_modify);
			$content.find("input[name='is_alarm']").prop("checked",!is_modify);

		}
	}

	//쿠폰 할인형식에 따른 레이아웃 설정
	function setLayoutByApplySaleType(type){
		var $_apply_sale_type = $content.find('._apply_sale_type');
		$_apply_sale_type.val(type);

		$_apply_sale_type.off("change.apply_sale_type").on("change.apply_sale_type",function(){
			var apply_sale_type_value = $(this).val();

			$content.find("._apply_sale_type_percent_max_price").css({
				"display":apply_sale_type_value == "percent"?"block":"none"
			});

			switch( apply_sale_type_value ) {
				case 'price':
					set_money_format($content.find("input[name='apply_sale_price']"));
					break;
				case 'percent':
					set_money_format($content.find("input[name='apply_sale_price']"), 0);
					break;
			}

			srtPriceInput(apply_sale_type_value);
		}).trigger('change');

		$content.find("._apply_sale_type_percent_max_price").css({
			"display":type == "percent"?"block":"none"
		});


		srtPriceInput(type);
	}

	function srtPriceInput(type){
		$content.find("input[name='apply_sale_price']").off("blur.percent").on("blur.percent",function(){
			if(type == "percent"){
				var max_pernect = 100;
				$(this).val($(this).val() > max_pernect ? max_pernect : $(this).val());
			}else{
				var option = {max_byte : 8};
				$(this).limitLength(option);
			}
		});
		$content.find("input[name='apply_sale_type_minimum_price']").off("blur.apply_sale_type_minimum_price").on("blur.apply_sale_type_minimum_price",function(){
			var option = {max_byte : 8};
			$(this).limitLength(option);
		});
	}


	//리스트 체크박스 체크시 삭제버튼 표시
	function showDeleteBtn(){
		$content.find("._list_header").hide();
		$content.find("._list_delete_header").css({"display":"table-header-group"});
	}
	//리스트 체크박스 체크 해지시 삭제버튼 숨김
	function hideDeleteBtn(){
		$content.find("._list_header").css({"display":"table-header-group"});
		$content.find("._list_delete_header").hide();
	}

	var setHeaderCtlEvent = function(){
		//쿠폰만들기 버튼 생성
		header_ctl = new HEADER_CONTROL();
		header_ctl.init();
		header_ctl.addBtn('cancel',function(){
			header_ctl.save();
			history.go(-1);
		});
		header_ctl.addBtn('save',function(){
			submit();
		});

		$content.find('input, textarea').off('change, keyup').on('change, keyup',function(){
			header_ctl.change();
		});
		$content.find('select').change(function(){
			header_ctl.change();
		});
		$content.find('input[type=checkbox],input[type=radio]').off('click').on('click',function(){
			header_ctl.change();
		});
	};


	//쿠폰데이터 체크 및 전송
	function submit(){
		if ( is_submit ) return;
		var data = $content.find("._coupon_add_form").serializeObject();
		data['type_group_code'] = type_group_code_list;
		data['apply_type_category_list'] = apply_type_category_list;
		data['apply_type_product_list'] = product_list;

		is_submit = true;
		$.ajax({
			type: 'POST',
			data: data ,
			url: ('/admin/ajax/coupon/add_coupon.cm'),
			dataType: 'json',
			success: function (res) {
				if(res.msg == 'SUCCESS'){
					header_ctl.save();
					history.go(-1);
				}else{
					alert(res.msg);
					is_submit = false;
				}
			}
		});
	}

	//쿠폰 삭제하기
	function deleteCoupon(code){
		if(confirm(getLocalizeString("설명_쿠폰을삭제하시겠습니까", "", "쿠폰을 삭제하시겠습니까?"))){
			var delete_list = [];
			if(isBlank(code)){
				var list = $content.find("._check_list:checked");
				$content.find("._check_list:checked").each(function(){
					delete_list.push($(this).val());
				});
			}else{
				delete_list.push(code);
			}

			if(delete_list.length > 0){
				$.ajax({
					type: 'POST',
					data: {list : delete_list} ,
					url: ('/admin/ajax/coupon/delete_coupon.cm'),
					dataType: 'json',
					success: function (res) {
						if(res.msg == 'SUCCESS'){
							history.go(0);
						}else
							alert(res.msg);
					}
				});
			}
		}
	}

	/**
	 * 키워드 서치 시작
	 */
	function startKeywordSearch(){
		var keyword = $.trim($content.find("._coupon_search").val());
		var status = $content.find("input[name='status']").val();
		window.location.href = current_base_url+'&search_data='+encodeURIComponent(keyword)+'&status='+status+'&page=1';
	}

	/***
	 * 쿠폰 내역확인 다이일로그 열기
	 */
	function openIssueDialog(code,is_create_mult_couon){
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/dialog/coupon_detail.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (res) {
				var $html = $(res);
				$.cocoaDialog.open({type:'coupon_detail',custom_popup:$html},function(){

					current_page = 1;
					getIssueDataList(code,current_page);

					if(is_create_mult_couon ){
						$("#excel_download").show();
						$("#excel_download").off("click.excel_download").on("click.excel_download",function(){
							downloadCreateCouponIssueList(code);
						});
					}else{
						$("#excel_download").hide();
					}

				});

			}
		});
	}

	/***
	 * 쿠폰적용상품 선택용 상품검색 다이얼로그 열기
	 */
	function openProductSearchDialog(){
		page = 1;
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/dialog/coupon_product_search.cm'),
			dataType: 'html',
			async: false,
			cache: false,
			success: function (res) {
				var $html = $(res);
				$.cocoaDialog.open({type:'coupon_product_search',custom_popup:$html},function(){
					$product_search_input = $("#product_search_input");
					$product_search_btn = $("#product_search_btn");
					$product_search_list = $("#product_search_list");
					$product_add_btn = $("#product_add_btn");
					$product_more_btn = $("#product_more_btn");
					getProductList(true);
					$product_search_input.off("keyup.product_search_input").on("keyup.product_search_input",function(e){
						if(e.which == 13){
							getProductList(true);
						}
					});
					$product_search_btn.off("click.product_search_btn").on("click.product_search_btn",function(){
						getProductList(true);
					});

					$product_more_btn.off("click.product_more_btn").on("click.product_more_btn",function(){
						getProductList(false);
					});
				});

			}
		});
	}
	function getProductList(list_clear){
		if(list_clear) {
			page = 0;
			$product_search_list.empty();
		}
		var search_data = $product_search_input.val();
		$.ajax({
			type: 'POST',
			url: ('/admin/ajax/coupon/get_product_list.cm'),
			data : {search_data:search_data,page:page},
			dataType: 'json',
			async: false,
			cache: false,
			success: function (res) {
				$product_add_btn.off("click.product_add_btn").on("click.product_add_btn",function(){
					if($product_search_list.find("._prodListCheck:checked").length > 0){
						//product_list = [];
						$product_search_list.find("._prodListCheck:checked").each(function(){
							addProductList($(this).val());
						});
						setProductList();
						$.cocoaDialog.close();
					}else{
					}
				});

				$product_add_btn.hide();
				$product_more_btn.hide();
				$product_search_list.append(res.html);

				product_list_data = $.extend({}, product_list_data, res.data);

				if(res.count > 0) $product_add_btn.show();
				if(res.is_more == "Y")$product_more_btn.show();
				page+=1;
			}
		});
	}

	/***
	 * 발행쿠폰 리스트 가져오기
	 * @param code
	 * @param page
	 */
	function getIssueDataList(code,page){
		is_issue_list_loading = true;
		$.ajax({
			type: 'POST',
			data: {code:code,page:page},
			url: ('/admin/ajax/coupon/get_issue_list.cm'),
			dataType: 'json',
			async: true,
			cache: false,
			success: function (res) {
				if(res.msg == "SUCCESS"){
					is_issue_list_loading = false;
					if(current_page == 1){
						$("#coupon_issue_list_wrap").html(res.html);

						$coupon_issue_list = $("#coupon_issue_list");
						$coupon_issue_list.scroll(function(){
							if(!is_issue_list_loading){
								var $that = $(this);
								if($that[0].scrollHeight - $that.scrollTop() <= $that.outerHeight()){
									getIssueDataList(code,current_page);
								}
							}
						});
					}else{
						$coupon_issue_list.append(res.html);
					}
					current_page = current_page+1;
				}else if(res.msg === "NO_MORE"){
					$coupon_issue_list = $("#coupon_issue_list");
					if($coupon_issue_list.length > 0){
						$coupon_issue_list.off('scroll');
					}
				}
			},
			done: function(res){
				is_issue_list_loading = false;
			}
		});
	}

	function setProductList(){
		if(isBlank(product_list) || product_list.length == 0) return false;
		var list_html = "";
		$.each(product_list,function(k,code){
			var $obj = $("#product_"+code);
			if($obj.length > 0) return true;
			var name = product_list_data[code].name;
			var thumb = product_list_data[code].thumb;
			var option = product_list_data[code].option;
			list_html = "<table class='table' id='product_"+code+"'>";
			list_html += "<tbody>";
			list_html += "<tr>";
			list_html += "<td class='vertical-top no-padding-left'>";
			list_html += "<div class='clearfix'>";
			list_html += "<img src='"+thumb+"' width='50' height='50' class='item-thumb float_l'>";
			list_html += "<div class='float_l' style='padding-left: 15px;'>";
			list_html += "<div>"+name+"</div>";
			list_html += "<div class='text-13 text-gray-bright'>"+option+"</div>";
			list_html += "</div>";
			list_html += "<span class='text-primary float_r'> <a href='javascript:;' onclick=\"COUPON.delProductList('"+code+"')\">" + getLocalizeString("버튼_삭제", "", "삭제")+ "</a> </span>";
			list_html += "</div>";
			list_html += "</td>";
			list_html += "</tr>";
			list_html += "</tbody>";
			list_html += "</table>";
			$product_apply_list.append(list_html);
		});
	}

	function addProductList(code){
		if($.inArray(code,product_list) > -1) return false;
		product_list.push(code);
		header_ctl.change();
	}

	var delProductList = function(code){
		if(isBlank(code)) return;
		deleteArrayValue(product_list,code);

		var $obj = $("#product_"+code);
		$obj.remove();
		header_ctl.change();
	};

	var downloadCreateCouponIssueList = function(coupon_code){
		location.href="/admin/ajax/coupon/download_create_coupon_issue_list.cm?code="+coupon_code;

	};

	return {
		init : function(){
			init();
		},
		listInit : function(base_url){
			listInit(base_url);
		},
		addInit : function(data,_product_list_data){
			addInit(data,_product_list_data);
		},
		downloadCreateCouponIssueList : function(coupon_code){
			downloadCreateCouponIssueList(coupon_code);
		},
		delProductList : function(code){
			delProductList(code);
		}
	}
}();