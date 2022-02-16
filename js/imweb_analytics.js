var IMWEB_ANALYTICS = function() {
	var residence_storage_key = 'RSK';
	var residence_time_invterval = 1;

	/***
	 * 잔류시간 체크
	 */
	var runResidenceChecker = function(){

		setInterval(function(){
			saveResidenceTime();
		},residence_time_invterval * 1000);

	};

	function saveResidenceTime(){
		var page_type = getPageType();
		var key = getResidenceKey();
		var storage_key = key+"_"+page_type;

		var time = IMWEB_SESSIONSTORAGE.get(storage_key);
		time = Number(time);
		IMWEB_SESSIONSTORAGE.set(storage_key,time+residence_time_invterval,60);


		//5초에 한번씩 잔류데이터 저장
		if(time > 5){
			IMWEB_SESSIONSTORAGE.remove(storage_key);
			$.ajax({
				type : "POST",
				url : ("/admin/ajax/imweb_analytics/update_residence_time.cm"),
				data : {'page_type' : page_type, 'key' : key, 'time' : time},
				dataType : "json",
				async : false,
				cache : false,
				success : function(res){
				}
			});
		}

	}




	function getResidenceKey(){
		var res = IMWEB_SESSIONSTORAGE.get(residence_storage_key);
		if(!res) res = createResidenceKey();

		return res;
	}

	function createResidenceKey(){
		var key = '';

		$.ajax({
			type : "POST",
			url : ("/admin/ajax/imweb_analytics/create_residence_key.cm"),
			dataType : "json",
			async : false,
			cache : false,
			success : function(res){
				key = res.key;
				IMWEB_SESSIONSTORAGE.set(residence_storage_key,key,86000*7);

			}
		});
		return key;
	}



	function getPageType(){
		var page_type = '';
		var path = location.pathname;
		if(path.indexOf('/admin/design') > -1){
			page_type = 'DESIGN_MODE';
		}else{
			page_type = 'DASHBOARD';
		}

		return page_type;
	}


	return{
		runResidenceChecker : function(){
			runResidenceChecker();
		}
	}
}();