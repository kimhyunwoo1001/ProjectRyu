function displaySetFilterCategoryPath(filterName, sSearchMode, result){
	var itemObj	= $(".filter_category_section .filter_detail_area .category_all_nav");
	var sTag = '<a href="javascript:void(0)" class="mobile_pre_cate" data-searchname="pre" onclick="setFilterCategory(this, \'auto\');">상위 카테고리</a>';
	if( sSearchMode != 'catalog' ){
		sTag += '<a href="javascript:void(0)" class="pc_all_cate" data-searchname="all" onclick="setFilterCategory(this, \'auto\');"><span class="name">전체</span></a>';
	}
	itemObj.html(sTag);
	if ( filterName != 'all' ) {
		for(var i in result){
			if( result[i].category_code ){
				sTag = '<a href="javascript:void(0)" data-searchname="navi_category_'+result[i].category_code+'" data-value="c'+result[i].category_code+'" onclick="setFilterCategory(this, \'auto\');"><span class="name">'+result[i].category_name+'</span></a>';
				itemObj.append(sTag);
				lastItem = result[i].category_code;
			}
		}
	}
}
function displaySetFilterCategoryChild(result){
	var lastItem	= '';
	var viewCount	= true;
	var objUlFilterItem = $(".filter_category_section .filter_detail_area .filter_detail_item");
	if(result){
		var sTag = '';
		var rowsCnt = 0;
		objUlFilterItem.html('');
		for(var i in result){
			if( result[i].category_code ){
				sTag = '<li>';
				sTag += '<a href="javascript:void(0)" data-searchname="category_'+result[i].category_code+'" data-value="c'+result[i].category_code+'" onclick="setFilterCategory(this, \'auto\');">';
				sTag += '<span class="name">'+result[i].category_name+'</span>';
				sTag += '<span class="desc">'+result[i].cnt+'</span>';
				sTag += '</a>';
				sTag += '</li>';
				objUlFilterItem.append(sTag);
				if(lastItem == result[i].category_code){
					viewCount = false;
				}
				rowsCnt++;
			}
		}
		objUlFilterItem.show();
	}else{
		objUlFilterItem.hide();
	}
	if( rowsCnt > 0 ) {
		sTag = "<span class=\"count_category\">("+rowsCnt+"개 카테고리)</span>";
		$(".filter_category_section .filter_detail_area .category_all_nav").append(sTag);
		if( !viewCount ){
			$(".count_category").hide();
		}
		resp_search_ui();
	}
}

function setFilterCategory(bobj, mode){

	var obj = $(bobj);
	if( obj.data('searchname') == 'pre' ) {
		pObj = $(".category_all_nav a:nth-last-child(3)");
		if( pObj.index() > 0 ){
			obj = pObj;
		}else{
			obj =  $(".category_all_nav a").eq(1);
		}
	}
	var filterName = obj.data('searchname');
	var filterText = obj.children('.name').text();
	var filterValue = obj.data('value');
	var sSearchMode	= $("input[name='searchMode']").val();
	var filterItem;

	$('#searchFilterSelected [data-filtertype=category]').remove();
	obj.closest('.filter_detail_area').find('.filter_detail_item a[data-searchname]').removeClass('active');
	if ( filterName != 'all' ) {
		filterItem = '<li data-filtertype="category" data-type="category" data-filteritem="' + filterName + '" data-value="'+filterValue+'"><a class="remove" href="#">' + filterText + '</a><input type="hidden" name="category" value="'+ filterValue +'"></li>';
		$('#searchFilterSelected .selected_item_area').append( filterItem );
	}

	setFilterCategoryPath(filterName);
	
	if( $(".category_all_nav a").length > 2 && $("body").width() < 1000 ){
		$("a.mobile_pre_cate").show();
	}else{
		$("a.mobile_pre_cate").hide();
	}

	if ( !mode ) {
		goodsSearch('click');
	} else if(mode === 'auto') {
		goodsSearch('auto');
	}
	setAjaxBrand(bobj, mode);
}
function setAjaxBrand(bobj, mode){
	var obj			= $(bobj);
	var code			= obj.data('value');
	var brandList	= "";
	$.ajax({
		'type'		: "get",
		'url'		: '/goods/get_brand_list',
		'data'		: {'code': code},
		'dataType'	: 'json',
		'success'	: function(result){
			for(var i = 0; i < result.length; i++){
				brandList += '<li>';
				brandList += '<label data-searchname="brand_'+result[i].brand_code+'" data-cntindex="'+i+'" data-value="b'+result[i].brand_code+'">';
				brandList += '<input type="checkbox" onclick="setFilterBrand(this, false);" />';
				brandList += result[i].brand_name;
				if(result[i].best == 'Y'){
					brandList += '<img class="icon" src="'+brand_best_icon+'" alt="best" onerror="this.src=\'/data/icon/goods/error/noimage_list.gif\';" />';
				}
				brandList += '</label>';
				brandList += '</li>';
			}
			var ul = $('.brandList');
			$(ul).find('li').remove();
			$(ul).append(brandList);
		}
	});
}
function displaySetFilterLocationPath(filterName, sSearchMode, result){
	var itemObj	= $(".filter_location_section .filter_detail_area .location_all_nav");
	var sTag = '<a href="javascript:void(0)" class="mobile_pre_location" data-searchname="pre" onclick="setFilterLocation(this, \'auto\');">상위 지역</a>';
	if( sSearchMode != 'location' ){
		sTag += '<a href="javascript:void(0)" class="pc_all_location" data-searchname="all" onclick="setFilterLocation(this,  \'auto\');"><span class="name">전체</span></a>';
	}
	itemObj.html(sTag);
	if ( filterName != 'all' ) {
		for(var i in result){
			if( result[i].location_code ){
				sTag = '<a href="javascript:void(0)" data-searchname="navi_location_'+result[i].location_code+'" data-value="l'+result[i].location_code+'" onclick="setFilterLocation(this, \'auto\');"><span class="name">'+result[i].location_name+'</span></a>';
				itemObj.append(sTag);
				lastItem = result[i].location_code;
			}
		}

	}
}
function displaySetFilterLocationChild(result){
	var rowsCnt	= 0;
	var lastItem	= '';
	var viewCount	= true;
	var itemObj		= $(".filter_location_section .filter_detail_area .filter_detail_item");
	if(result){
		var sTag	= '';
		itemObj.html('');
		for(var i in result){
			if( result[i].location_code ){
				sTag = '<li>';
				sTag += '<a href="javascript:void(0)" data-searchname="location_'+result[i].location_code+'" data-value="l'+result[i].location_code+'" onclick="setFilterLocation(this,  \'auto\');">';
				sTag += '<span class="name">'+result[i].location_name+'</span>';
				sTag += '<span class="desc">'+result[i].cnt+'</span>';
				sTag += '</a>';
				sTag += '</li>';
				itemObj.append(sTag);
				if(lastItem == result[i].location_code){
					viewCount = false;
				}
				rowsCnt++;
			}
		}
		itemObj.show();
	}else{
		itemObj.hide();
	}
	if( rowsCnt > 0 ) {
		sTag = "<span class=\"count_location\">("+rowsCnt+"개 지역)</span>";
		$(".filter_location_section .filter_detail_area .location_all_nav").append(sTag);
		if( ! viewCount ){
			$(".count_location").hide();
		}
	}	
}

function setFilterLocation(bobj, mode){
	var obj = $(bobj);
	if( obj.data('searchname') == 'pre' ) {
		pObj = $(".location_all_nav a:nth-last-child(3)");
		if( pObj.index() > 0 ){
			obj = pObj;
		}else{
			obj = $(".location_all_nav a").eq(1);
		}
	}

	var filterName = obj.data('searchname');
	var filterText = obj.children('.name').text();
	var filterValue = obj.data('value');
	var sSearchMode	= $("input[name='searchMode']").val();
	var filterItem;
	$('#searchFilterSelected [data-filtertype=location]').remove();
	obj.closest('.filter_detail_area').find('.filter_detail_item a[data-searchname]').removeClass('active');
	if ( filterName != 'all' ) {
		filterItem = '<li data-filtertype="location" data-type="location" data-filteritem="' + filterName + '" data-value="'+filterValue+'"><a class="remove" href="#">' + filterText + '</a><input type="hidden" name="location" value="'+ filterValue +'"></li>';
		$('#searchFilterSelected .selected_item_area').append( filterItem );
	}
	setFilterLocationPath(filterName);
	
	if( $(".location_all_nav a").length > 2 && $("body").width() < 1000 ){
		$("a.mobile_pre_location").show();
	}else{
		$("a.mobile_pre_location").hide();
	}

	if ( !mode ) {
		goodsSearch('click');
	} else if(mode === 'auto') {
		goodsSearch('auto');
	}
}

function setFilterBrand(bObj, mode){
	var obj = $(bObj);
	if ( mode ) {
		if ( obj.prop('checked') ) {
			obj.prop('checked', false);
		}else{
			obj.prop('checked', true);
		}
	}
	var filterName = obj.parent('label').data('searchname');
	var filterText = obj.parent('label').text();
	var filterValue = obj.parent('label').data('value');
	var sSearchMode	= $("input[name='searchMode']").val();
	var filterItem, filterColor;

	filterItem = '<li data-filtertype="checkbox" data-type="brand" data-filteritem="' + filterName + '" data-value=""><a class="remove" href="#">' + filterText + '</a><input type="hidden" name="brand[]" value="'+filterValue+'"></li>';

	if ( obj.prop('checked') ) {
		obj.parent('label').addClass('active');
		$('#searchFilterSelected .selected_item_area').append( filterItem );
	} else {
		obj.parent('label').removeClass('active');
		$('#searchFilterSelected .selected_item_area [data-filteritem=' + filterName + ']').remove();
	}

	setFilterBrandPath();

	if ( !mode ) {
		goodsSearch('click');
	}
}
function setFilterColor(bObj, mode){
	var obj = $(bObj);
	if ( mode ) {
		if ( obj.prop('checked') ) {
			obj.prop('checked', false);
		}else{
			obj.prop('checked', true);
		}
	}
	var filterName = obj.parent('label').data('searchname');
	var filterText = obj.parent('label').text();
	var filterValue = obj.parent('label').data('value');
	var sSearchMode	= $("input[name='searchMode']").val();
	var filterItem, filterColor;

	filterColor = obj.parent('label').css('background-color');
	filterItem = '<li data-filtertype="checkbox" data-type="color" data-filteritem="' + filterName + '" class="color_type" style="background-color:' + filterColor + '"><a class="remove" href="#"></a><input type="hidden" name="color[]" value="'+filterValue+'"></li>';

	if ( obj.prop('checked') ) {
		obj.parent('label').addClass('active');
		$('#searchFilterSelected .selected_item_area').append( filterItem );
		colorFilter_white( '#searchFilterSelected .color_type' );
	} else {
		obj.parent('label').removeClass('active');
		$('#searchFilterSelected .selected_item_area [data-filteritem=' + filterName + ']').remove();
	}
	if ( !mode ) {
		goodsSearch('click');
	}
}
function setFilterDelivery(bObj, mode){
	var obj = $(bObj);
	if ( mode ) {
		if ( obj.prop('checked') ) {
			obj.prop('checked', false);
		}else{
			obj.prop('checked', true);
		}
	}
	var filterName = obj.parent('label').data('searchname');
	var filterText = obj.parent('label').text();
	var filterValue = obj.parent('label').data('value');
	var sSearchMode	= $("input[name='searchMode']").val();
	var filterItem, filterColor;
	filterItem = '<li data-filtertype="checkbox" data-type="delivery" data-filteritem="' + filterName + '"><a class="remove" href="#">' + filterText + '</a><input type="hidden" name="delivery[]" value="'+filterValue+'"></li>';
	if ( obj.prop('checked') ) {
		obj.parent('label').addClass('active');
		$('#searchFilterSelected .selected_item_area').append( filterItem );
	} else {
		obj.parent('label').removeClass('active');
		$('#searchFilterSelected .selected_item_area [data-filteritem=' + filterName + ']').remove();
	}
	if ( !mode ) {
		goodsSearch('click');
	}
}
function setFilterProvider(bObj, mode){
	var obj = $(bObj);
	if ( mode ) {
		if ( obj.prop('checked') ) {
			obj.prop('checked', false);
		}else{
			obj.prop('checked', true);
		}
	}
	var filterName = obj.parent('label').data('searchname');;
	var filterText = obj.parent('label').text();
	var filterValue = obj.parent('label').data('value');
	var filterItem;
	$('#searchFilterSelected [data-filtertype=provider]').remove();
	obj.closest("ul").find("label.active").removeClass("active");
	if ( obj.prop('checked') ) {
		obj.parent('label').addClass('active');
	}

	filterItem = '<li data-filtertype="provider" data-type="provider" data-filteritem="' + filterName + '"><a class="remove" href="#">' + filterText + '</a><input type="hidden" name="provider" value="'+filterValue+'"></li>';
	$('#searchFilterSelected .selected_item_area').append( filterItem );
	if ( obj.closest('.filter_detail_item').length ) {
		obj.addClass('active');
	}

	if ( !mode ) {
		goodsSearch('click');
	}
}
function setFilterPrice(obj, mode){
	var minPrice = obj.closest('.price_area').find('[data-searchname=min_price]').val();
	var maxPrice = obj.closest('.price_area').find('[data-searchname=max_price]').val();
	var filterItem1, filterItem2;
	$('#searchFilterSelected [data-filteritem=min_price], #searchFilterSelected [data-filteritem=max_price]').remove();
	if ( minPrice ) {
		filterItem1 = '<li data-filtertype="price" data-filteritem="min_price"><a class="remove" href="#">' + minPrice + '</a><input type="hidden" name="min_price" value="'+ minPrice +'"></li>';
	}
	if ( maxPrice ) {
		filterItem2 = '<li data-filtertype="price" data-filteritem="max_price"><a class="remove" href="#">' + maxPrice + '</a><input type="hidden" name="max_price" value="'+ maxPrice +'"></li>';
	}
	$('#searchFilterSelected .selected_item_area').append( filterItem1 );
	$('#searchFilterSelected .selected_item_area').append( filterItem2 );
	if ( !mode ) {
		goodsSearch('click');
	}
}
function setFilterReSearch(obj, mode){
	var searchVal = obj.closest('.reresearch_area').find('[data-searchname=re_search]').val();
	var filterItem;
	$('#searchFilterSelected [data-filteritem=re_search]').remove();
	if ( searchVal ) {
		filterItem = '<li data-filtertype="re_search" data-filteritem="re_search"><a class="remove" href="#">' + searchVal + '</a><input type="hidden" name="re_search" value="'+ searchVal +'"></li>';
	}
	$('#searchFilterSelected .selected_item_area').append( filterItem );
	if ( !mode ) {
		goodsSearch('click');
	}
}
function displaySearchCategoryFilter(){
	var objSection = $(".search_filter .filter_category_section");
	var iCount = objSection.find(".filter_detail_area .category_all_nav a").length - objSection.find(".filter_detail_area .category_all_nav a.mobile_pre_cate").length - objSection.find(".filter_detail_area .category_all_nav a.pc_all_cate").length;
	if(objSection.find(" .filter_detail_area .filter_detail_item li").length < 1 && iCount < 1 ){
		objSection.find(".category_all_nav").hide();
		objSection.find(".filter_detail_item").hide();
		objSection.find(".message").addClass('on');
	}
}
function displaySearchLocationFilter(){
	var objSection = $(".search_filter .filter_location_section");
	var iCount = objSection.find(".filter_detail_area .location_all_nav a").length - objSection.find(".filter_detail_area .location_all_nav a.mobile_pre_cate").length - objSection.find(".filter_detail_area .location_all_nav a.pc_all_cate").length;
	if(objSection.find(" .filter_detail_area .filter_detail_item li").length < 1 && iCount < 1){
		objSection.find(".location_all_nav").hide();
		objSection.find(".filter_detail_item").hide();
		objSection.find(".message").addClass('on');
	}
}
function displaySearchBrandFilter(){
	var objSection = $(".search_filter .filter_brand_section");
	if(objSection.find(" .filter_detail_area .filter_detail_item li").length == 0 && objSection.find(".filter_detail_area .location_all_nav a").length < 2){
		objSection.find(".filter_section_sorting").hide();
		objSection.find(".filter_detail_item").hide();
		objSection.find(".message").addClass('on');
	}
}
function displaySearchSellerFilter(){
	var objSection = $(".search_filter .filter_seller_section");
	if(objSection.find(" .filter_detail_area .filter_detail_item li").length == 0){
		objSection.find(".filter_section_sorting").hide();
		objSection.find(".filter_detail_item").hide();
		objSection.find(".message").addClass('on');
	}
}
function displaySearchDetailFilter(){
	var filterResultCount = $("#filterResultCount").html();
	if( filterResultCount == 0 ){
		$(".filter_detail_section .filter_detail_area .filter_detail_item .shipping_area").addClass("disable");
		$(".filter_detail_section .filter_detail_area .filter_detail_item .reresearch_area").addClass("disable");
		$(".filter_detail_section .filter_detail_area .filter_detail_item .price_area").addClass("disable");
		$(".filter_detail_section .disable *").click(false);
	}else{
		$(".filter_detail_section .filter_detail_area .filter_detail_item .shipping_area").removeClass("disable");
		$(".filter_detail_section .filter_detail_area .filter_detail_item .reresearch_area").removeClass("disable");
		$(".filter_detail_section .filter_detail_area .filter_detail_item .reresearch_area").removeClass("disable");
		$(".filter_detail_section .filter_detail_area .filter_detail_item .price_area").removeClass("disable");
	}
}
function load_seleted_filter(filterType, dataType, filterItem, dataValue, dataTitle, inputName, inputValue){
	var tag = "<li data-filtertype='"+filterType+"'  data-type='"+dataType+"' data-filteritem='"+filterItem+"' data-value='"+dataValue+"'>";
	tag += "<a class='remove' href='#'>"+dataTitle+"</a>";
	tag += "<input type='hidden' name='"+inputName+"' value='"+inputValue+"'></li>";
	return tag;
}
function load_color_filter(idx, sColor){
	var tag = "<li data-filtertype='checkbox' data-type='color' data-filteritem='color_"+idx+"' class='color_type' style='background-color:#"+sColor+"'>";
	tag += "<a class='remove' href='#'></a>";
	tag += "<input type='hidden' name='color[]' value='"+sColor+"'></li>";
	return tag;
}
function display_navi(oNavi, sNaviLink)
{
	var idx = 0;
	var sNavi = "<a class=\"home\" href=\"/main/index\">홈</a>";
	for(var i in oNavi){
		sNavi	+= "<span class=\"navi_linemap\">";
		sNavi	+= "<select name=\"navi_"+idx+"\" class=\"navi-select\" onchange=\"link_navi(this, '"+sNaviLink+"');\">";
		if(i > 0){
			sNavi	+= "<option value=\""+i+"\" selected>&nbsp;선택&nbsp;</option>";
		}
		if(oNavi[i]){
			for(var j in oNavi[i]){
				if(oNavi[i][j].selected){
					sNavi	+= "<option value=\""+oNavi[i][j]['category_code']+"\" selected>&nbsp;"+oNavi[i][j].title+"&nbsp;</option>";
				}else{
					sNavi	+= "<option value=\""+oNavi[i][j]['category_code']+"\">&nbsp;"+oNavi[i][j].title+"&nbsp;</option>";
				}
			}
		}
		sNavi	+= "</select>";
		sNavi	+= "</span>";
		idx++;
	}
	$(".search_nav").html(sNavi);
}
function displayShowAutoComplete(result){
	var sTag = '';
	for(var i in result.keywords){
		if( result.keywords[i].keyword ){
			sTag += '<li>';
			sTag += '<a class="searched_item" href="javascript:void(0)" onclick="setAutoComplete(\''+result.keywords[i].key+'\');">' + result.keywords[i].keyword + '</a>';
			sTag += '</li>';
		}
	}
	for(var i in result.events){
		if( result.events[i].keyword ){
			sTag += '<li>';
			sTag += '<a class="searched_item event" href="/link/'+result.events[i].tpl_path+'">'+result.events[i].keyword+'</a>';
			sTag += '<a class="goto_event" href="/link/'+result.events[i].tpl_path+'">기획전 &gt;</a>';
			sTag += '</li>';
		}
	}
	$("ul#autoCompleteList").html(sTag);
	sTag = '';
	for(var i in result.recomms){
		if( result.recomms[i].goods_seq ){
			sTag += '<li>';
			sTag += '<a class="item_link" href="../goods/view?no='+result.recomms[i].goods_seq+'"><img class="item_img" src="'+result.recomms[i].goods_img+'" onerror="this.src=\'/data/icon/goods/error/noimage_list.gif\';" alt="list2 썸네일" /></a>';
			sTag += '<ul class="goods_info">';
			sTag += '<li class="goods_name">'+result.recomms[i].goods_name+'</li>';
			sTag += '<li class="goods_price">'+result.recomms[i].replace_price+'</li>';
			sTag += '</ul>';
			sTag += '</li>';
		}
	}
	$("ul#autocompleteBannerList").html(sTag);
}
function displaySetRecentAuto(sAuto)
{
	$('#searchVer2 .btnRecentAuto').hide();
	if ( sAuto == 'off' ) {
		$('#searchVer2 .btnRecentAuto.on').show();
		$('#recentSearchedList').hide();
		$('#recentSearchedGuide').show();
	} else {
		$('#searchVer2 .btnRecentAuto.off').show();
		$('#recentSearchedList').show();
		$('#recentSearchedGuide').hide();
	}
}
function searchRecentList(){
	if($("#recentSearchedList .recent_search_item").length == 0){
		$("#recentSearchedList .no_data").css("display", "block");
	}else{
		$("#recentSearchedList li.no_data").css("display", "none");
	}
}
function displaySearchRecentRemove(obj, oData){
	if( oData != 'all' ){
		obj.parent().remove();
	}else{
		$("li.recent_search_item").each(function(){
			if(!$(this).hasClass("popular_search_item")){
				$(this).remove();
			}
		});
	}
}
function todayViewList(){
	if($("#recent-item-list .recent_item_list .recent_item").length == 0){
		$("#recent-item-list .recent_item_list .no_data").css("display", "block");
	}else{
		$("#recent-item-list .recent_item_list .no_data").css("display", "none");
	}
}
function filterDisplay()
{
	var pageHref = $(".paging_navigation").attr("href");
	var obj = $("input[name='filter_display']:checked");
	obj.closest('.item_display').find('.display').removeClass('active');
	obj.closest('.display').addClass('active');
	if ( obj.closest('.display').hasClass('display_lattice') ) {
		$('#searchedItemDisplay').attr('data-displaytype', 'lattice');
		if( pageHref &&  pageHref!='undefined' ){

			pageHref = pageHref.replace('filter_display=list', 'filter_display=lattice');
			$(".paging_navigation").attr("href", pageHref);
		}
	} else if ( obj.closest('.display').hasClass('display_list') ) {
		$('#searchedItemDisplay').attr('data-displaytype', 'list');
		if( pageHref &&  pageHref!='undefined' ){
			pageHref = pageHref.replace('filter_display=list', 'filter_display=lattice');
			$(".paging_navigation").attr("href", pageHref);
		}
	}
}
function colorFilter_white( selector ) {
	$('#searchFilterSelected .color_type').filter(function() {
		return ( $(this).css('background-color') == 'rgb(255, 255, 255)' );
	}).addClass('border');
}
function mobileFilterSelectedScroll() {
	var filterSelectedScrollWidth = $('#searchFilterSelected .selected_item_area').prop('scrollWidth');
	$('#searchFilterSelected .selected_item_area').animate({ scrollLeft: filterSelectedScrollWidth }, 600, 'linear' );
}