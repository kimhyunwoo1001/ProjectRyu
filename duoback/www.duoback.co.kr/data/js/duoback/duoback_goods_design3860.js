
var goodsDesign = {
    getGoodsOption : function(goods){
        var _this = this;
        if(goods){
            $.ajax({
                type : 'get',
                url : '/duoback/getGoodsOptionInfo',
                data : {seq:goods},
                dataType : 'json',
                error: function(xhr, status, error){
                    // alert(error);
                    console.log(error);
                },
                success : function(data){
                    console.log(data);
                    // if(data.status==200){
                        if(data.data){
                            _this.drawGoodsDesign(data.data);
                        }
                    // }
                }
            });
        }
    },
    drawGoodsDesign : function(dataObj){
        var _this = this;
        var dataImage = dataObj.image;
        $(".design-image-area>img").attr("src","/data/duoback/"+dataImage);
        var datalist = dataObj.items;
        var list_html = '';
        var list_layer_html = '';
        for(var i=0;i<datalist.length;i++){
            var data = datalist[i];

            var jQueryObject = $('<div class="position" data-seq="'+data.seq+'" style="top:'+data.top+'%;left:'+data.left+'%"></div>');
            $(".design-image-area").append(jQueryObject);

            var priceInt = parseInt(data.goods.price.replace(",",""));

            list_html += '<li data-goods-seq="'+data.goods.seq+'" data-goods-price="'+priceInt+'">';
            list_html += '<input type="checkbox" value="'+data.goods.seq+'" checked=checked />';
            list_html += '<div class="fLeft">';
            list_html += '<a href="/goods/view?no='+data.goods.seq+'" class="ab_btn_pop" target="_blank">';
            list_html += '<img src="'+data.goods.image+'" />';
            list_html += '</a>';
            list_html += '</div>';
            list_html += '<div class="fRight">';
            list_html += '<div class="ritem_md">'+data.goods.name+'</div>';
            list_html += '<div class="ritem_prc">';
            list_html += '<div>'+data.goods.price+'<span class="ab_won">원</span></div>';
            list_html += '<span>'+data.goods.consumer_price+'<span class="ab_won">원</span></span>';
            list_html += '<div class="ritem_per">'+data.goods.sale_rate+'%</div>';
            list_html += '</div></div>';
            if(data.seq == gl_goods_seq){
                list_html += '<div class="ritem_tag">이 페이지 동일상품</div>';
            }
            list_html += '</li>';

            list_layer_html += '<li>';
            list_layer_html += '<input type="checkbox" id="ritem_r1" name="ritem_r" onchange="checkGoods(this);" goods_seq="'+data.goods.seq+'" provider_seq="'+data.goods.provider_seq+'" price="'+(!data.options[0]["title"] && !data.options[0]["option1"]? data.options[0].price :'0')+'"/>';
            list_layer_html += '<div class="fLeft"><img src="'+data.goods.image+'" /></div>';
            list_layer_html += '<div class="fRight">';
            list_layer_html += '<div class="ritem_md">'+data.goods.name+'</div>';
            list_layer_html += '<div class="ritem_prc">';
            list_layer_html += '<div class="ritem_per">'+data.goods.sale_rate+'%</div>';
            list_layer_html += '<div>'+data.goods.price+'<span class="ab_won">원</span></div>';
            list_layer_html += '<span>'+data.goods.consumer_price+'<span class="ab_won">원</span></span>';
            list_layer_html += '</div></div>';

            if(data["options"]){
                var options = data.options;
                var html_options = '';

                for(var j=0;j<options.length;j++){
                    if (j==0){
                        html_options += '<input type="hidden" name="optionTitle[0][0]" value="'+options[j]["title"]+'"/>';
                        html_options += '<dl class="re_option" depth="1" style="display: none;">' +
                            '<dt class="option_title" style="'+(!options[j]["title"] && !options[j]["option1"]?'display: none;':'')+'">'+ options[j]["title"]+'</dt>' +
                            '<dd style="'+(!options[j]["title"] && !options[j]["option1"]?'display: none;':'')+'"><ul class="abClear">';
                    }
                    html_options += '<li><input type="radio" id="option_'+data.goods.seq+'_1_'+j+'" name="option[0][0]_'+data.goods.seq+'_1" value="'+options[j]["option1"]+'" onchange="getGoodsSubOption(this,'+data.goods.seq+','+options[j]["max"]+');" '+(!options[j]["title"] && !options[j]["option1"]?'checked':'')+'/>';
                    html_options += '<label for="option_'+data.goods.seq+'_1_'+j+'">';
                    html_options += '<span>'+options[j]["option1"]+'</span></label></li>';
                }
                if(html_options){
                    html_options += '</ul></dd></dl>';
                    html_options += '<input type="hidden" name="option_select_provider_seq" value="2"/>';
                }else{
                    // html_options += '<p style="text-align:center;line-height:100px;">옵션이 없는 상품입니다.</p>';
                    html_options += '<input type="hidden" name="option_select_provider_seq" value="1"/>';
                    html_options += '<input type="hidden" name="option[0][0]" value=""/>';
                    html_options += '<input type="hidden" name="optionTitle[0][0]" value=""/>';
                }
                list_layer_html += html_options;
            }
            list_layer_html += '</li>';
        }
        $("#design_goods_list").html(list_html);
        $(".design-image-area .position").on("mouseover",function(){
            var seq = $(this).data("seq");
            $("#design_goods_list li").removeClass("over");
            $("#design_goods_list li[data-goods-seq='"+seq+"']").addClass("over");
        });
        $(".design-image-area .position").on("mouseleave",function(){
            $("#design_goods_list li").removeClass("over");
        });
        $("#design_goods_list input[type=checkbox]").on("change",function(){
            _this.changeTotalPrice();
        });
        _this.changeTotalPrice();

        $("#design_goods_layer_list").html(list_layer_html);

    },
    changeTotalPrice : function(){
        var totalCnt = 0;
        var totalPrice = 0;
        $("#design_goods_list li input[type=checkbox]:checked").each(function(){
            totalCnt++;
            totalPrice += parseInt($(this).parent().data("goodsPrice"));
            // console.log($(this).val());
        });
        $("#total_design_check_cnt").text(totalCnt);
        $("#total_design_check_price").text(numberWithCommas(totalPrice));
    },
    openDesignLayer : function(){
        $("#layer_re_item").fadeIn();
    }
};
$(function() {
    /* 레이어팝업 */
    $(".ab_btn_layer_close,.btn_layer_close").off("click").on("click",function() {
        $(this).closest("div.ab_layer_popup").fadeOut(100);
    });
});

// 숫자형 3자리 콤마 형식 리턴
function numberWithCommas(x) {
	var rtnVal = 0;
	if(x){
		// rtnVal = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        rtnVal = x.toString();
        rtnVal = rtnVal.split(".");
        if(rtnVal.length > 1){
            rtnVal = rtnVal[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"."+(rtnVal[1] ? rtnVal[1] :"");
        }else{
            rtnVal = rtnVal[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
	}
	return rtnVal;
}

// 210518. ry4nkim. 서브옵션 정보 조회
function getGoodsSubOption(obj, no, max) {
    var data = {
        'no': no,
        'max': max,
        'member_seq': gl_member_seq,
        'options': $(obj).val().split('|'),
    }

    $.ajax({
        type : 'get',
        url : '/goods/option',
        data : data,
        dataType : 'json',
        success : function (suboptions){
            if (data.options.length < max) {
                for (var depth=data.options.length + 1; depth<=max; depth++) {
                    $(obj).parent().parent().parent().parent().parent().find('[depth='+depth+']').remove();
                }

                var html_options = '';

                for(var i=0;i<suboptions.length;i++){
                    if(i==0){
                        if(suboptions[i]["option_title"]){
                            html_options += '<input type="hidden" name="optionTitle[0][0]" value="'+suboptions[i]["option_title"]+'"/>';
                            html_options += '<dl class="re_option" depth="'+(data.options.length + 1)+'">' +
                                '<dt class="option_title">'+ suboptions[i]["option_title"].split(',')[data.options.length]+'</dt>' +
                                '<dd><ul class="abClear">';
                        }
                    }
                    if(suboptions[i]["opt"]){
                        html_options += '<li><input type="radio" id="option_'+no+'_'+(data.options.length + 1)+'_'+i+'" name="option[0][0]_'+(data.options.length + 1)+'" value="'+$(obj).val()+'|'+suboptions[i]["opt"]+'" onchange="getGoodsSubOption(this,'+no+','+max+');"/>';
                        html_options += '<label for="option_'+no+'_'+(data.options.length + 1)+'_'+i+'">';
                        html_options += '<span>'+suboptions[i]["opt"]+'</span></label></li>';
                    }
                }

                $(obj).parent().parent().parent().parent().parent().append(html_options);
                $(obj).parent().parent().parent().parent().parent().find('[name=ritem_r]').attr('price', 0);
            } else {
                $(obj).parent().parent().parent().parent().parent().find('[name=ritem_r]').attr('price', suboptions[0].price);
            }

            calcTotalPrice();
        },
        error: function(xhr, status, error){
            console.log(error);
        },
    });
}

function checkGoods(obj) {
    if ($(obj).is(':checked')) {
        $(obj).parent().find('.re_option').show();
    } else {
        $(obj).parent().find('.re_option').hide();
    }

    calcTotalPrice();
}

function calcTotalPrice() {
    var totalEa = 0;
    var totalPrice = 0;

    $('[name=ritem_r]:checked').each(function () {
        if (parseInt($(this).attr('price')) > 0) totalEa++;
        totalPrice += parseInt($(this).attr('price'));
    });

    $('.together_goods_total_ea').text(comma(totalEa));
    $('.together_goods_total_price').text(comma(totalPrice));
}

function addCarts() {
    var checkOptionSelected = true;
    $('[name=ritem_r]:checked').each(function () {
        if ($(this).parent().find('.re_option').last().find('input[type=radio]:checked').length == 0) {
            checkOptionSelected = false;
        }
    });
    if ($('[name=ritem_r]:checked').length == 0 || !checkOptionSelected) {
        alert("장바구니에 추가할 상품 및 옵션을 선택해주세요!");
        return;
    } else {
        openDialogConfirm('장바구니에 추가하시겠습니까?','400','155',function(){
            var cnt = 0;

            $('[name=ritem_r]:checked').each(function () {
                var goodsSeq = $(this).attr('goods_seq');
                var providerSeq = $(this).attr('provider_seq');
                var options = $(this).parent().find('.re_option').last().find('input[type=radio]:checked').val().split('|');
                var optionTitles = [];
                $(this).parent().find('.option_title').each(function (){
                    optionTitles.push($(this).text().trim());
                })

                var formData = new FormData();

                formData.append('goodsSeq', goodsSeq);
                formData.append('shipping_method', '50');
                formData.append('shipping_prepay_info', 'delivery');
                formData.append('option_select_goods_seq', goodsSeq);
                formData.append('option_select_provider_seq', providerSeq);
                formData.append('gl_option_select_ver', "0.1");
                formData.append('use_add_action_button', "n");
                for (var i = 0; i < options.length; i++) {
                    formData.append('option[0]['+i+']', options[i]);
                    formData.append('optionTitle[0]['+i+']', optionTitles[i]);
                }
                formData.append('optionEa[0]', "1");

                $.ajax({
                    url: "/order/add",
                    type: "POST",
                    enctype: 'multipart/form-data',
                    data: formData,
                    async: false,
                    processData: false,
                    contentType: false,
                    cache: false,
                    timeout: 600000,
                    success: function (response) {
                        if (response.indexOf('상품이 장바구니에 담겼습니다.') > -1) {
                            cnt++;
                        }
                    }
                });
            });

            if (cnt == 0) {
                alert("알 수 없는 오류가 발생하였습니다.");
            } else if (cnt > $('[name=ritem_r]:checked').length) {
                openDialogConfirm('일부 상품이 장바구니에 담겼습니다.지금 확인하시겠습니까?', '400', '160', function () {
                    location.href = '../order/cart';
                }, function () {
                    hideCenterLayer('#layer_re_item');
                });
            } else if (cnt == $('[name=ritem_r]:checked').length) {
                openDialogConfirm('상품이 장바구니에 담겼습니다.지금 확인하시겠습니까?', '400', '160', function () {
                    location.href = '../order/cart';
                }, function () {
                    hideCenterLayer('#layer_re_item');
                });
            }
        });
    }
}