
// Find agent information
getAgentInfo= function(){
	url = "http://memo-app-services.appspot.com/agent";
	data ={};
	$.Read(url,data,{
	url:url,
    xhrFields:{
          withCredentials:true  
    },
    contentType: "application/json",
    encoding: "charset=utf-8",
    dataType: "json",
    //cache:false,
    success:function(res){
        console.log(res);
        //alert(res[0]);
		alert("res = " + res[0]);
		var uuid = res[0];
        url1 = "http://memo-app-services.appspot.com/agent/" + uuid;
        data = {};
        $.Read(url1,data,{
        		url:url1,
        		contentType: "application/json",
        		encoding: "charset = utf-8",
        		dataType: "json",
        		success:function(res1){
        			console.log(res1);
        			alert("agent : " + res1['name'] + "  at " + res1['lat'] +"  " + res1['lon']);
         			
        		}
        });
		
    },
   complete:function(res){
         if (res.readyState == 0 && res.status==0){
                console.log("Generic error, CORS headers not set?");
           }
   		 }
    
	});
	}
//=======================================================================================
//
testPost = function (){
	var url = "http://memo-app-services.appspot.com/agent/";
	var data = {"lat":"1.4563245","lon":"-6.324632","name":"Tigist 11"};
    $.ajax({
        type: "POST",
        xhrFields:{
            withCredentials:true  
        },
        contentType:"application/json; charset=utf-8",
        data: JSON.stringify(data), 
        url: url,
        success: function(msg){ alert("new agent id : " +  msg); },
        error: function (XMLHttpRequest, textStatus, errorThrown) {alert(textStatus);}
    });
}

//-======================================================================
//
doUpdate = function (){
	var url = "http://memo-app-services.appspot.com/agent/4d51bb20-cb36-11e1-adba-00007f000001";
	var data = {"lat":"0.40000045","lon":"-0.0004632","name":"Tigist6"};
    $.ajax(url,data,{
        type: "PUT",
        xhrFields:{
            withCredentials:true  
        },
        contentType:"application/json; charset=utf-8",
        data: JSON.stringify(data), 
        url: url,
        success: function(msg){ alert("agent " +  msg + "updated"); },
        error: function (XMLHttpRequest, textStatus, errorThrown) {alert(textStatus);}
    });
}

//===================================================================================
//

var setupCache = function() {  
	 console.log(caches);
    if(!caches.exists("lebel")) {
   	 console.log("Init Cache");
        cache = new ASKCache("label","agent/",null,"uuid",session,true);
        cache.addRenderer('all', my_renderer);
        cache.onChangeCBs[cache.onChangeCBs.length]=function(a,b){console.log(a,b);};
        cache.render(); 
        alert("new cache created");
    }else{
    	alert("cache already found");
    }                       
	} 