var PAYMENT = {
    onClickStep2 : function() {
        var data = $('#form-step1').serializeObject();

        $.ajax({
            type: 'POST',
            data: data,
            url: ('/admin/ajax/upgrade_plan_step1.cm'),
            dataType: 'json',
            async: false,
            cache: false,
            success:function(result)
            {
                if(result.msg == 'SUCCESS') {

                    var url = '/admin/upgrade/list/?mode=' + result.mode + '&plan=' + result.plan + '&type=' + result.type + '&step=' + result.step
                        + '&period_type=' + result.period_type;

                    if(result.monthly_type != '')
                        url += '&monthly_type=' + result.monthly_type;

                    window.parent.location.href = url;
                }
                else {
                    alert(result.msg);
                }
            }
        });
    },

    onSelectMonthlyPayment : function(basic_price, period, version) {
        $.ajax({
            type: 'POST',
            data: {'basic_price': basic_price, 'period': period, 'version': version },
            url: ('/admin/ajax/select_monthly_price.cm'),
            dataType : 'json',
            async: false,
            cache: false,
            success:function(result)
            {
                if(result.msg == 'SUCCESS') {
                    //alert(result.html);
                    $('#month_select_price').empty().html(result.html);
                }
            }
        });
    },

    onClickPaymentSubmitForm : function() {
        $('#payment_submit_form').submit();
    },

    //가상계좌 입금계좌 확인 모달출력 함수
    checkDepositAccount : function(order_number){
        $.ajax({
            type : "POST",
            data : {"order_number" : order_number},
            url : ("/admin/ajax/check_deposit_account.cm"),
            dataType : "json",
            async : false,
            cache : false,
            success : function(result){
                if(result.msg === "SUCCESS"){
                    $.cocoaDialog.open({type : "admin_check_deposit_account", custom_popup : result.html});
                }else{
                    alert(result.msg);
                }
            }
        });
    }
};

var PRICE = {
    country: "",
    start : function(country){
        this.country = country;
        var $payment_type = $("#div_payment_type");
        var type = $('#type').val();

        //기간연장/업그레이드
        if(type === "upgrade") {
            PRICE.setVersion();
            PRICE.setPeriod();
            $("#coupon_value").on("focus",function(){
                var $radio_term_item = $("._day_ck").find("[name='rdo_term_kind']");
                if($("._day_ck").find("[name='rdo_term_kind']:radio:checked").val() !== "coupon"){
                    $radio_term_item.each(function(){
                        if($(this).val() === "coupon"){
                            $(this).prop("checked", true);
                        }
                    });
                }
                PRICE.setPeriod();
            });

        }
        //부가 서비스
        else {
            var proc_file = "./payment/proc_ajax.cm";
            var param = {};
            param.mode = "get_site_infomation";
            param.country = this.country;
            param.site_code = $("#sel_site").val();
            param.version = $("#value_version").val();
            param.site_changed = "N";

            $.ajax({
                type: 'POST',
                url: proc_file,
                data: param,
                async: false,
                success: function(data) {
                    service_info = $.parseJSON(data);
                }
            });
            PRICE.setExtraService(type);
        }

        // 결제방식 제어
        $payment_type.find('.item-wrap').find('a.item').on('click', function(){
            if ( $(this).hasClass('text-gray-bright') ) {
                var disabled_msg = $(this).data('disabled_msg');
                if ( disabled_msg.trim() != '' )    alert(disabled_msg);
            } else {
                $('#div_payment_type').find('.item-wrap').find('a.item.active').removeClass('active');
                $(this).addClass('active');
                $('input[name=sel_payment_type]').val($(this).data('paymethod'));
            }
        });


        $("#prev_version_price").val(service_info.version_price);
        $("#request_site_version").val(service_info["site_version"]);
        $("#request_price").val(service_info["price"]);
        $('#btn_payment').on('click', function(e){
            e.stopPropagation();
            PRICE.submit();
            return false;
        });
        this.paymentInit();

        switch(this.country){
            case KOREA_COUNTRY_CODE:
                this.initKR();
                break;
            case TAIWAN_COUNTRY_CODE:
                this.initTW();
                break;
        }
    },

    initKR: function(){
        // 정기결제 관련 제어
        var $payment_type = $('#div_payment_type');
        $('input[name="rdo_term_kind"]:radio').on('change', function(){
            $payment_type.find('.item-wrap').find('a.item').each(function(){
                $(this).toggleClass('text-gray-bright', !$(this).data('default'));
            });

            if ($(this).val() === 'one_month') {
                $payment_type.find('.item-wrap').find('a.item').each(function(){
                    var _pay_method = $(this).data('paymethod');
                    if (_pay_method === "card") {
                        $(this).toggleClass('disabled', false);
                        if ( !$(this).hasClass('active') ) {
                            $payment_type.find('.item-wrap').find('a.item').removeClass('active');
                            $(this).addClass('active');
                            $('input[name=sel_payment_type]').val(_pay_method);
                        }
                    } else {
                        $(this).toggleClass('text-gray-bright', true);
                    }
                });
            }
        });
    },

    initTW: function(){
        var $invoice_wrapper = $('._invoice_wrapper');
        $invoice_wrapper.find('select').on('change', function(){
            $invoice_wrapper.find('._invoice_data_wrapper').toggle( ($(this).val().trim()!= '') );
            var invoice_type = $(this).val();
            $invoice_wrapper.find('._invoice_data').each(function(){
                var target = $(this).data('target');
                $(this).toggle(target.indexOf(invoice_type) != -1);
            });
        });

        $invoice_wrapper.find('._invoice_love_code').on('keyup', function(){
            $(this).data('checked', false);
            $invoice_wrapper.find('._love_code_chk_btn').addClass('btn-primary');
        });
    },

    checkLoveCode: function(){
        var love_code = $('._invoice_love_code').val();
        if ( love_code.length > 0 ) {
            $.ajax({
                "type": "POST",
                "url": "/admin/ajax/check_invoice_donation_code.cm",
                "data": {"love_code": love_code},
                "dataType": "JSON",
                "success": function(res){
                    if ( res.msg == 'SUCCESS' ) {
                        $('._invoice_love_code').data('checked', true);
                        $('._love_code_chk_btn').removeClass('btn-primary');
                    } else {
                        alert(res.msg);
                    }
                }
            });
        }
        return false;
    },

    //요금 티어 선택
    setVersion : function(){
        var select_version;
        select_version = $("input[name='value_version']:checked").val();
        if(select_version !== "free") {
            $("._extend_list").show();
        } else {
            $("._extend_list").hide();
        }

        var proc_file = "./payment/proc_ajax.cm";
        var param = {};

        param.country = this.country;
        param.mode = "get_site_infomation";
        param.site_code = $("#sel_site").val();
        param.version = select_version;
        param.site_changed = "N";
        param.term_kind = $("._day_ck").find("[name='rdo_term_kind']:checked").val();

        $.ajax({
            type: 'POST',
            url: proc_file,
            data: param,
            async: false,
            success: function(data) {
                service_info = $.parseJSON(data);
            }
        });

        if(service_info.site_version !== "free") {
            var current_version_span_id = "#div_upgrade_"+service_info.site_version+"_price_sub";

            $("#div_upgrade_starter_price_sub").html(this.makePriceStr(service_info.starter_price_upgrade));
            $("#div_upgrade_pro_price_sub").html(this.makePriceStr(service_info.pro_price_upgrade));
            $("#div_upgrade_global_price_sub").html(this.makePriceStr(service_info.global_price_upgrade));
            $(current_version_span_id).html("");

            $("#div_upgrade_pay").show();

        } else {
            $(".not_extend").empty();
            $("#div_upgrade_pay").hide();
            $("#div_upgrade_price").html("");
        }
        if(service_info.upgrade_version && service_info.upgrade_version !== "free") {
            var event_discount = 1;
            var discount = 1;
            var site_version_price = service_info['default_price'] * discount * event_discount;
            var is_event = false;

            if ( typeof service_info['event_discount'] != 'undefined') {
                service_info['event_discount'] = parseFloat(service_info['event_discount']);
                if ( !isNaN(service_info['event_discount']) && service_info['event_discount'] !== 0 ) {
                    event_discount = 1 - (service_info['event_discount'] / 100);
                }
            }

            var price_str_per_month = "/" + getLocalizeString('타이틀_월', '', '월');
            var price_wrapper = {1: "price_one_month", 3: "price_three_month", 6: "price_six_month", 12: "price_one_year", 24: "price_two_year"};
            for ( var _period in price_wrapper ) {
                _period = parseInt(_period);
                if ( typeof service_info['discount'][_period] != "undefined" )  discount = 1 - (service_info['discount'][_period] / 100);
                site_version_price = service_info['default_price'] * discount * event_discount;

                $("#"+price_wrapper[_period]).html(this.makePriceStr(service_info["default_price"]) + price_str_per_month);
                $("#"+price_wrapper[_period]).toggle(service_info['default_price'] > site_version_price);
                $("#discount_" + price_wrapper[_period]).html(this.makePriceStr(site_version_price) + price_str_per_month);
                $("#discount_" + price_wrapper[_period]).toggleClass('text-primary', (service_info['price'] > site_version_price));

                if(service_info['discount_str'][service_info.upgrade_version][_period] !== ''){
                    $(".discount_" + price_wrapper[_period] + "_str").text( " (" + getLocalizeString('설명_n프로할인', service_info['discount_str'][service_info.upgrade_version][_period], service_info['discount_str'][service_info.upgrade_version][_period] + '%') + ")");
                }
            }
        }
        $("#prev_version_price").val(service_info.version_price);
        $("#request_extend_price").val(service_info.price_extend);
        $("#request_upgrade_price").val(service_info.price_upgrade);

        service_info.total_price = parseInt(service_info.price_extend, 10);service_info.total_price = parseInt(service_info.price_extend, 10);

        this.drawPriceSection();
    },

    //기간 선택
    setPeriod : function(){
        var proc_file = "./payment/proc_ajax.cm";
        var param = {};

        param.country = this.country;
        param.mode = "get_site_infomation";
        param.site_code = $("#sel_site").val();
        param.version = service_info.upgrade_version;
        param.site_changed = "N";
        param.term_kind = $("._day_ck").find("[name='rdo_term_kind']:checked").val();

        $.ajax({
            type: "POST",
            url: proc_file,
            data: param,
            async: false,
            success: function(data) {
                service_info = $.parseJSON(data);
            }
        });

        $("#prev_version_price").val(service_info.version_price);
        $("#request_extend_price").val(service_info.price_extend);
        $("#request_upgrade_price").val(service_info.price_upgrade);

        service_info.total_price = parseInt(service_info.price_extend, 10);
        this.paymentInit();
        this.drawPriceSection();
    },

    setExtraService : function(type) {
        service_info.price_extend = 0;
        service_info.price_upgrade = 0;

        if(type === 'ios') {
            $('#ios_price_list').toggle(service_info["is_ios_infinite"] !== 'Y');
            if((service_info["is_ios_infinite"] !== 'Y') && $('#ios_price_list').find(':radio:checked').length > 0){
                var ios_price_selected = $('#ios_price_list').find(':radio:checked').val();
                if(service_info["ios_price"][ios_price_selected] !== undefined && service_info.is_ios_infinite !== 'Y'){
                    $("#request_ios").val(service_info['ios_price'][ios_price_selected]);
                    service_info.total_price = parseInt(service_info['ios_price'][ios_price_selected]);
                }
            }
        } else if(type === 'android') {
            if($("#chk_android").is(":checked") && service_info.app_android === 'N'){
                $("#request_android").val(parseInt(service_info.android_price));
                service_info.total_price = parseInt(service_info.android_price);
            }
            $("#div_android_price_wrapper").find(".text-line-through").html(this.makePriceStr(service_info.android_price * 2));
            $("#div_android_price_wrapper").find(".text-primary").html(this.makePriceStr(service_info.android_price));
        } else if(type === 'adult') {
            $("#auth_service_price_dream_security").html(this.makePriceStr(service_info.auth_service_price_dream_security));
            $("#auth_service_price_mobilians").html(this.makePriceStr(service_info.auth_service_price_mobilians));
            $("#auth_service_price_inicis").html(this.makePriceStr(service_info.auth_service_price_inicis));

            var auth_comobination_price_html = this.makePriceStr(service_info.auth_service_price_combination);
            if(service_info.auth_service_price_combination === 0) auth_comobination_price_html = "<del class='text-gray-bright'>30,000원</del>"+"<span class='text-danger'> "+auth_comobination_price_html+"</span>";
            
            $("#auth_service_price_combination").html(auth_comobination_price_html);
            
            service_info.total_price = 0;

            $("#chk_auth_service_dream_security").change(function(){
                if($("#chk_auth_service_dream_security").prop("checked")){
                    service_info.total_price += parseInt(service_info.auth_service_price_dream_security);
                    $("#request_auth_service_dream_security").val(service_info.auth_service_price_dream_security);
                }else{
                    service_info.total_price -= parseInt(service_info.auth_service_price_dream_security);
                    $("#request_auth_service_dream_security").val(0);
                }
                PRICE.drawPriceSection();
            });
            $("#chk_auth_service_mobilians").change(function(){
                if($("#chk_auth_service_mobilians").prop("checked")){
                    $("._auth_mobilians_description").show();

                    service_info.total_price += parseInt(service_info.auth_service_price_mobilians);
                    $("#request_auth_service_mobilians").val(service_info.auth_service_price_mobilians);
                }else{
                    $("._auth_mobilians_description").hide();

                    service_info.total_price -= parseInt(service_info.auth_service_price_mobilians);
                    $("#request_auth_service_mobilians").val(0);
                }
                PRICE.drawPriceSection();
            });
            $("#chk_auth_service_inicis").change(function(){
                if($("#chk_auth_service_inicis").prop("checked")){
                    service_info.total_price += parseInt(service_info.auth_service_price_inicis);
                    $("#request_auth_service_inicis").val(service_info.auth_service_price_inicis);
                }else{
                    service_info.total_price -= parseInt(service_info.auth_service_price_inicis);
                    $("#request_auth_service_inicis").val(0);
                }
                PRICE.drawPriceSection();
            });
            $("#chk_auth_service_combination").change(function(){
                if($("#chk_auth_service_combination").prop("checked")){
                    service_info.total_price += parseInt(service_info.auth_service_price_combination);
                    $("#request_auth_service_combination").val(service_info.auth_service_price_combination);
                }else{
                    service_info.total_price -= parseInt(service_info.auth_service_price_combination);
                    $("#request_auth_service_combination").val(0);
                }
                PRICE.drawPriceSection();
            });
        }
        PRICE.drawPriceSection();

    },

    drawPriceSection : function() {
        var total_price = parseInt(service_info.total_price);
        var upgrage_price = parseInt(service_info.price_upgrade);
        var price_tax = 0;
        var sum_data = total_price + upgrage_price;

        switch ( this.country ) {
            default:
            case KOREA_COUNTRY_CODE:
                price_tax = parseInt(sum_data * service_info.vat, 10);
                sum_data += price_tax;
                break;
            case TAIWAN_COUNTRY_CODE:
                total_price = Math.round(total_price / (1 + service_info.vat));
                upgrage_price = Math.round((upgrage_price / (1 + service_info.vat)));
                price_tax = sum_data - (total_price + upgrage_price);
                break;

        }

        $("#div_total_price").html(this.makePriceStr(total_price));
        $("#div_upgrade_price").html(this.makePriceStr(upgrage_price));
        $("#div_total_tax").html(this.makePriceStr(price_tax));
        $("#div_total").html(this.makePriceStr(sum_data));

        if ( this.country == 'tw' ) {
            this.checkLimit(sum_data);
        }
    },

    checkLimit: function(total_price){
        // 일단은 임시 처리 개념.. (결제 수단 별로 결제 한도가 다름)
        var _PAYMENT_LIMIT = {
            "card": 	{"min": 1, "max": 200000},
            "webatm": 	{"min": 11, "max": 30000},
            "atm": 		{"min": 11, "max": 30000},
            "cvs": 		{"min": 31, "max": 20000},
            "barcode": 	{"min": 16, "max": 30000},
        };

        var disabled_list = [];
        disabled_list.push("android");
        for ( var key in _PAYMENT_LIMIT ) {
            //if ( _PAYMENT_LIMIT[key]['min'] > total_price ) disabled_list.push(key);
            if ( _PAYMENT_LIMIT[key]['max'] < total_price ) disabled_list.push(key);
        }

        if ( disabled_list.length > 0 ) {
            var $payment_type = $('#div_payment_type');
            $payment_type.find('.item-wrap').find('a.item').each(function(){
                if ( disabled_list.indexOf($(this).data('paymethod')) !== -1 )	{
                    $(this).addClass('disabled');
                } else {
                    $(this).removeClass('disabled');
                }
            });

            if ( $payment_type.find('.item-wrap').find('a.item.active').hasClass('disabled') ) {
                $payment_type.find('.item-wrap').find('a.item.active').removeClass('active');
                if ( $payment_type.find('.item-wrap').find('a.item:not(.disabled)').length > 0 ) {
                    var $new_paymethod = $payment_type.find('.item-wrap').find('a.item:not(.disabled)').first();
                    $new_paymethod.addClass('active');
                    $('input[name=sel_payment_type]').val($new_paymethod.data('paymethod'));

                }
            }
        }
    },

    submit : function(){
        // 아직 로딩이 완료되지 않은 상태
        if ( typeof service_info == 'undefined' ) return false;

        var is_error = false;
        var $form = $('#payment_submit_form');
        var form_data = $form.serializeObject();

        if ( this.country == KOREA_COUNTRY_CODE ) {
            var is_regular_payment = (form_data["rdo_term_kind"] === "one_month");
            if ( is_regular_payment && !confirm(getLocalizeString("설명_정기결제등록확인", '', "해당 사이트를 정기 결제 사이트로 등록하시겠습니까?"))) {
                is_error = true;
                return false;
            }

            if($("#chk_ios").is(":checked")&& !$('#ios_price_list').find(':radio:checked').length){
                if (service_info.is_ios_infinite !== 'Y') {
                    is_error = true;
                    alert(getLocalizeString("설명_Ios사용기간선택", '', "IOS APP의 사용 기간을 선택해주세요."));
                    return false;
                }
            }
        }

        if ( this.country == TAIWAN_COUNTRY_CODE ) {
            var invoice_type = form_data['invoice[type]'];
            if ( invoice_type.trim() == '' ) {
                is_error = true;
                alert(getLocalizeString('설명_통일영수증정보를입력해주세요', '', '통일영수증 정보를 입력해주세요.'));
                return false;
            }
            $form.find('._invoice_data_wrapper').find('._invoice_data').each(function(){
                var target = $(this).data('target');
                if ( ['all', invoice_type].indexOf(target) != -1 ) {
                    if ( $(this).find('input').val().trim() == '' ) is_error = true;
                }
            });

            if ( is_error ) {
                alert(getLocalizeString('설명_통일영수증정보를모두입력해주세요', '', '통일 영수증 정보를 모두 입력해 주세요.'));
                return false;
            }

            if ( invoice_type == 'donation' ) {
                if ( !$('._invoice_love_code').data('checked') ) {
                    is_error = true;
                    alert(getLocalizeString('설명_기부코드를체크해주세요', '', '기부코드를 체크 해 주세요.'));
                    return false;
                }
            }
        }


        if( form_data['type'] === 'upgrade' && form_data['rdo_term_kind'] === 'coupon' ){ // 쿠폰일때는 결제 금액이 없어서 결제금액 확인 패스
        }else{
            if ( ! (this.checkTotalPrice(form_data) > 0) && service_info.auth_service_combination === 0 && parseInt(form_data.request_auth_service_combination) === 0) {
                is_error = true;
                alert(getLocalizeString('설명_결제금액을확인해주세요', '', '결제 금액을 확인해주세요.'));
                return false;
            }
        }

        if (!is_error) {
            $form.submit();
        }
        return false;
    },

    checkTotalPrice: function(form_data){
        var total_price = 0;
        var check_list = ['1','request_upgrade_price', 'request_extend_price', 'request_android', 'request_ios', 'request_auth_service_dream_security', 'request_auth_service_mobilians', 'request_auth_service_inicis', 'request_auth_service_combination'];
        for (var _key in check_list ) {
            if ( typeof form_data[check_list[_key]] != "undefined" ) {
                total_price += isNaN( parseInt(form_data[check_list[_key]]) ) ? 0 : parseInt(form_data[check_list[_key]]);
            }
        }
        return total_price;
    },

    paymentInit : function(){
        if($("._day_ck").find("[name='rdo_term_kind']:checked").val() === 'coupon'){
            $("._total_price_wrap").hide();
            $("#div_payment_type").hide();
            $("#btn_payment").hide();
            $("#btn_coupon").show();
            $('#payment_mode').val('price_page_coupon');
        }else{
            $("._total_price_wrap").show();
            $("._payment_type_wrap").show();
            $("#btn_payment").show();
            $("#btn_coupon").hide();
            $('#payment_mode').val('price_page');
        }
    },

    updateRegularPayment : function(id){
        var url = "/payment/index.cm";

        var form = document.createElement("form");
        form.setAttribute("method", "post");
        form.setAttribute("action", url);

        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", "site_idx");
        hiddenField.setAttribute("value", id);
        form.appendChild(hiddenField);
        document.body.appendChild(form);

        var hiddenField2 = document.createElement("input");
        hiddenField2.setAttribute("type", "hidden");
        hiddenField2.setAttribute("name", "payment_mode");
        hiddenField2.setAttribute("value", "regular_payment_update");
        form.appendChild(hiddenField2);
        document.body.appendChild(form);

        var hiddenField3 = document.createElement("input");
        hiddenField3.setAttribute("type", "hidden");
        hiddenField3.setAttribute("name", "pg_back_url");
        hiddenField3.setAttribute("value", "/admin/payment");
        form.appendChild(hiddenField3);
        document.body.appendChild(form);

        var hiddenField4 = document.createElement("input");
        hiddenField4.setAttribute("type", "hidden");
        hiddenField4.setAttribute("name", "is_admin");
        hiddenField4.setAttribute("value", "Y");
        form.appendChild(hiddenField4);
        document.body.appendChild(form);

        var hiddenField5 = document.createElement("input");
        hiddenField5.setAttribute("type", "hidden");
        hiddenField5.setAttribute("name", "is_regular_change");
        hiddenField5.setAttribute("value", "Y");
        form.appendChild(hiddenField5);
        document.body.appendChild(form);

        form.submit();
    },

    unsetRegularPayment : function(id, next_pay_date){
        if ( confirm(getLocalizeString("설명_정기결제해지알림", next_pay_date, "정기결제 해지시 다음 결제일부터 자동 결제 처리되지 않습니다.\n지금 해지해도 %1까지는 사용이 가능합니다.\n정기결제를 해지하시겠습니까?")) ) {
            $.ajax({
                "url": "./payment/update_regular_payment_ajax.cm",
                "data": {"mode": "off", "idx": id},
                "type": "POST",
                "dataType": "json",
                "success": function(res){
                    if ( res['msg'] === 'SUCCESS' ) {
                        alert(getLocalizeString("설명_정기결제해지완료",'', "정기결제 해지가 완료 되었습니다."));
                        location.reload();
                    } else {
                        alert(res['msg']);
                    }
                    console.log(res);
                }
            });
        }
    },

    makePriceStr: function(price){
        var price_str = price;
        switch ( this.country ) {
            case KOREA_COUNTRY_CODE:
                price_str = getLocalizeString("설명_n원", money_format(price), "%1원");
                break;
            case TAIWAN_COUNTRY_CODE:
                price_str = "$" + money_format(price);
                break;
        }
        return price_str;
    }
};