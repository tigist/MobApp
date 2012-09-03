session = {
		 appServices:"http://memo-app-services.appspot.com/", // agent/ added
	      sessionKey:"fooBar",
	      isSession:function(){return true},
	      addCallback:function(){},
	      authenticator:function(){}
};
/* File contains offline REST cache and cacheRegister */
var caches = new CacheRegister();


//TODO: remove JQM dependencies
//TODO: remove Session dependencies
//TODO: fix new record ID space

function ASKCache(label,url,data,idQuery,session,idLoop){
	//constructor parameters:
	this.hidden_repeat=10000;
	this.shown_repeat=10000;
	this.label=label;
	this.url=session.appServices+url;
	this.data=data;  //what is this data?
	this.idQuery=idQuery;
	this.session=session;
	
	this.renderers={};
	this.idLoop=false;
	if (idLoop) this.idLoop=idLoop;
	
	this.lastUpdate=0;
	this.outstanding_request=false;
	
	this.comparator=function(a,b){
		//console.log(a,b);
		if (JSON.stringify(a) == JSON.stringify(b)) return false;
		return true;
	}
	this.onChangeCBs=[];
	
	//init:
	if (localStorage[this.label+"_changes"] != "true"){
		localStorage[this.label+"_changes"]="false";
	}
	caches.addLabel(this.label,this);
	
	var scope=this;
	scope.sync();
	scope.restart();	
	
};

//Render functions:
ASKCache.prototype.addRenderer = function(page,renderer,doRender){
	if (typeof renderer != "function"){
		console.log("Failed to add renderer, it's not a function! ",typeof renderer);
		return;
	}
	if (this.renderers[page]){
		this.renderers[page]=this.renderers[page].concat([renderer]);
	} else {
		this.renderers[page]=[renderer];
	}
	caches.addURL(page,this);
	if (doRender) this.render();
}
/*
PaigeUser.prototype.setRenderer = function(page, renderer) {
	caches.waitForCache("getPaigeinfo", function(cacheList) {
	var cache = cacheList[0];
	cache.addRenderer(page, renderer);
	cache.sync();
	});
}
*/
ASKCache.prototype.addCB = function(callback){
	this.onChangeCBs=this.onChangeCBs.concat([callback]);
}

ASKCache.prototype.render = function(){
	var cache = this;
	//var page = $.mobile.activePage;
	var page=null;
	var render_list = this.renderers["all"];  //all functions send as request
	//alert(render_list);
	/*if (page && page != null){ //it is null now
		var page_list = this.renderers[page.jqmData("url")];
		if (page_list){
			if (render_list){
				render_list = render_list.concat(page_list);
			} else {
				render_list = page_list;
			}
		}
	} */
	if (!render_list){
		return;
	} 
	render_list.map(function (renderer){
		if (renderer && typeof renderer == "function"){
			if (new Date().getTime() - cache.lastUpdate > 5*20*100){//5*60*1000
				renderer(cache.getArray(),true,cache);
			} else {
				renderer(cache.getArray(),false,cache);
			}
		} else {
			console.log("Problem: incorrect renderer in cache, either undefined or not a function!");
		}			
	});
}

//Interval functions:
ASKCache.prototype.setInterval=function(hidden_interval,shown_interval){
	var cache = this;
	this.hidden_repeat = hidden_interval;
	if (shown_interval) {
		this.shown_repeat = shown_interval;
	} else {
		this.shown_repeat = hidden_interval;
	}
	this.restart();
}

ASKCache.prototype.stop=function(){
	var cache = this;
	clearInterval(this.interval);
}

ASKCache.prototype.restart=function(){
	var cache = this;
	this.stop();
	this.interval=setInterval(function(){ cache.sync();},this.hidden_repeat);
/*	var page = $.mobile.activePage;
	if (page){
		var renderers = this.renderers[page.jqmData("url")];
		if (!renderers) return;
		renderers.map(function (renderer){
			if (renderer && typeof renderer == "function"){
				cache.stop();
				cache.interval=setInterval(function(){ cache.sync();},cache.shown_repeat);
				cache.render();
			}			
		});
	}
*/
}

ASKCache.prototype.destroy=function(){
	this.stop();
	this.clear();
	for (var url in this.renderers){
		caches.delURL(url,this);
	}
	caches.delLabel(this.label);	
}

//BEGIN storage model:
ASKCache.prototype.list2array = function(struct){
	var result = [];
	var i=0;
	for (var key in struct){
		result[i++]=struct[key].data;
	}
	return result;
}
ASKCache.prototype.array2list = function(arr){
	var res = {};
	var cache = this;
	function add(element){
	    //eval("var id = element."+cache.idQuery); //nice in its ugliness
		//res[id]={"id":id,"state":"normal","data":element};
		eval("var id = element."+ cache.idQuery); //nice in its ugliness
		res[id]={"id":id,"state":"normal","data":element };
		return null;
	}
	if (arr == null){
		return null;
	}
	if (arr.length){
		arr.map(add);
	} else {
		if (arr != "{}" && arr != "[]" && arr != ""){
			//console.log("["+cache.label+"]: Info: Singular element converted to array element:'"+arr+"'");
			add(arr);
		}
	}
	return res;
}
ASKCache.prototype.storeList = function(myData){
	var cache = this;
	if (cache.onChangeCBs && cache.onChangeCBs.length > 0){
		function call(a,b){
			cache.onChangeCBs.map(function(item){
				if (typeof item == "function") item(a,b);
			});
		}
		var oldList = this.getList();
		if (oldList != null){
			for (var record in oldList){
				if (!myData[record]) call(oldList[record],null);
				if (cache.comparator(oldList[record],myData[record])){
					call(oldList[record],myData[record]);
				};	
			}
			for (var record in myData){
				if (!oldList[record]) call(null,myData[record]);
			}
		}
	}	
	localStorage[cache.label]=JSON.stringify(myData);
}

ASKCache.prototype.getList = function(){
	var jsonTxt = localStorage[this.label];
	if (!jsonTxt || jsonTxt == "")return null;
	return JSON.parse(jsonTxt);
}

ASKCache.prototype.storeArray = function(myData){
	var toStore = this.array2list(myData);
	this.storeList(toStore);
}
ASKCache.prototype.getArray = function(){
	var list = this.getList();
	return this.list2array(list);
}

ASKCache.prototype.getElement = function(id){
	var myData = this.getList();
	if(myData != null && typeof myData[id] != "undefined") return myData[id].data;
	return null;
}
//add or replace Element
ASKCache.prototype.addElement = function(id,element){
	var myData = this.getList();
	if (myData == null) myData={};
	if (id == null) id = createUUID();
	if (myData[id] && myData[id].state != "added"){
		myData[id]={"id":id,"state":"updated","data":element};
		//myData[id]={"data":element};
		console.log("storing (u):"+id+":",element);
	} else { 	
		myData[id]={"id":id,"state":"added","data":element};
		//myData[id]={"data":element};
		console.log("storing (a):"+id+":",JSON.stringify(element));
	}
	this.storeList(myData);
	localStorage[this.label+"_changes"]="true";
}
ASKCache.prototype.delElement = function(id){
	var myData = this.getList();
	if (myData[id]) myData[id].state = "deleted";
	this.storeList(myData);
	localStorage[this.label+"_changes"]="true";
}
ASKCache.prototype.applied = function(id){
	var myData = this.getList();
	if (myData[id]){
		if (myData[id].state == "deleted"){
			delete myData[id];
		} else {
			myData[id].state = "normal";
		}
	}
	this.storeList(myData);
}
ASKCache.prototype.count = function(){
	return this.getArray().length;
}
ASKCache.prototype.clear = function(){
	this.storeList({});
};
//END Storage Model


//Sync function
ASKCache.prototype.sync =	function(){
	if (!session.isSession()){
		console.log("No session, skipping sync.");
		return;
	} 
	
	var cache=this;
	
	var oldKey=session.sessionKey;
	if (cache.outstanding_request){
		console.log("Already there is an outstanding change request, skipping sync.");
		return;
	} 
	
	function forbidden(){
		if (cache.session.sessionKey != oldKey && session.isSession()){
			console.log("["+cache.label+"]: Info: New session available, resyncing");
			cache.sync();
		} else {
			console.log("["+cache.label+"]: Info: Need to login at server");
			cache.session.authenticator(cache);
		}
	}
	function store(jsonTxt){
		if (jsonTxt == null || jsonTxt == ""){
			console.log("["+cache.label+"]: Warning: zero size data received from server.");
			return;
		}
		if (jsonTxt.substring(0,1)=="<"){
			console.log("["+cache.label+"]: Warning: server side error: "+ jsonTxt);
			return;
		}
		if (localStorage[cache.label+"_changes"]!="true"){
			var success = true;
			try {
				var json=JSON.parse(jsonTxt);
				cache.storeArray(json);
				cache.lastUpdate=new Date().getTime();
			} catch (e){
				console.log("["+cache.label+"]: Error: failed to parse server data: '"+jsonTxt+"' ",e);
				success = false;
			}
			if ( success ) {
				cache.render();
			}
			
		} else {
			console.log("["+cache.label+"]: Warning: local changes detected, dropping server data");
		}
	}
	function store_element(id,jsonTxt){
		if (jsonTxt == null || jsonTxt == ""){
			console.log("["+cache.label+"]("+id+"): Warning: zero size data received from server.");
			return;
		}
		if (jsonTxt.substring(0,1)=="<"){
			console.log("["+cache.label+"]("+id+"): Warning: server side error: "+ jsonTxt);
			return;
		}
		if (localStorage[cache.label+"_changes"]!="true"){
			try {
				var json=JSON.parse(jsonTxt);
				var arr = cache.getList();
				if (!arr) arr={};
				arr[id]={"id":id,"state":"normal","data":json};
				cache.storeList(arr);
				cache.lastUpdate=new Date().getTime();
			} catch (e){
				console.log("["+cache.label+"]("+id+"): Error: failed to parse server data: '"+jsonTxt+"' "+e);
			}
		} else {
			console.log("["+cache.label+"]("+id+"): Warning: local changes detected, dropping server data");
		}		
	}
	//get outstanding changes from localStorage
	function applyChanges(){
		var list=cache.getList();
		function applyChange(func,item){
			cache.outstanding_request=true;
			func(cache.url+item.id,cache.data,{
				url:cache.url+item.id,
				data:item.data,
				headers:{'X-SESSION_ID':cache.session.sessionKey},
				xhrFields: {
				      withCredentials: true
				},
				cache: false,
				200:function(res){
					console.log("["+cache.label+"]:Successfull serverside change:"+item.id);
					cache.applied(item.id);
					cache.outstanding_request=false;
					cache.sync();
				},
				403:function(res){
					cache.outstanding_request=false;
					forbidden();
				},
				complete:function(res){
					cache.outstanding_request=false;
					if (res.readyState == 0 && res.status==0){
						console.log("Generic error, CORS headers not set?");
					}
				}
			});
		}
		var changesFound = false;
		for (var i in list){
			if (list[i].state != "normal"){
				changesFound=true;
				switch (list[i].state){
					case "added":
						applyChange($.Create,list[i]);
						break;
					case "updated":
						applyChange($.Update,list[i]);
						break;
					case "deleted":
						list[i].data = null;
						applyChange($.Delete,list[i]);
						break;
				}
			}
		}
		localStorage[cache.label+"_changes"]=changesFound;
		return !changesFound;
	}
	
	if (applyChanges()){
		$.Read(this.url,this.data,{
			url:this.url,
			headers:{'X-SESSION_ID':cache.session.sessionKey},
			xhrFields: {
			      withCredentials: true
			},
			cache: false,
			200:function(res){
				if (cache.idLoop){
					//loop through response and get all subqueries
					var idList=JSON.parse(res.responseText);
					if (idList && idList.length){
						var len=idList.length;
						for (var i=0; i<len; i++){
							var id=idList[i];
							var callback_wrapper = function(local_id){
								return function callback(res){
									store_element(local_id,res.responseText);
									cache.render();
								}
							}
							$.Read(cache.url+id,cache.data,{
								url:cache.url+id,
								headers:{'X-SESSION_ID':cache.session.sessionKey},
								xhrFields: {
								      withCredentials: true
								},
								cache: false,
								200:callback_wrapper(id),
								403:function callback(res){
									forbidden();
								},
								complete:function(res){
										if (res.readyState == 0 && res.status==0){
											console.log("Generic error, CORS headers not set?");
										}
								}
							});
						}
					} else {
						if (res.responseText == "[]"){
							cache.clear();
							cache.render();
						} else {
							console.log("["+cache.label+"]: Error: expected idList, but got:"+res.responseText,idList,len);
						}
					}
				} else {
					store(res.responseText);
				}
			},
			403:function(res){
				forbidden();
			},
			complete:function(res){
					if (res.readyState == 0 && res.status==0){
						console.log("Generic error, CORS headers not set?");
					}
			}
		});
	}
	cache.render();
};



/*
 * Cache Register, Provides a lookup structure for caches, either by Label or
 * URL.
 */
function CacheRegister() {
	var caches=this;
	// Provides a lookup structure for caches, either by Label or URL.
	session.addCallback("authenticator",function(){caches.stopAll();});
	session.addCallback("logoff",function(){caches.stopAll();});
	session.addCallback("login",function(){caches.startAll();});
	
}

CacheRegister.prototype.addURL = function(url,cache){
	if (this[url]){
		this[url]=this[url].concat([cache]);
	} else {
		this[url]=[cache];
	}
}
CacheRegister.prototype.addLabel = function(label,cache){
	if (this[label]){
		this[label]=this[label].concat([cache]);
	} else {
		this[label]=[cache];
	}
}
CacheRegister.prototype.delURL = function(url,cache){
	if (this[url]){
		var arr=this[url];
		for (var i=arr.length-1; i>=0; i--){
			if (arr[i] === cache){
				arr.splice(i,1);
			}
		};
	}
}

CacheRegister.prototype.delLabel = function(label){
	if (this[label]){
		delete this[label];
	}
}

CacheRegister.prototype.exists = function (key){
	return (this[key] != null && typeof this[key] != "undefined");
}

CacheRegister.prototype.getList = function (key){
	if (this[key]){
		return this[key];// returns a list!
	} else 
		return null;
}

CacheRegister.prototype.waitForCache = function (key,success,failure,interval,count){
	if (typeof count == "undefined") count=5;
	if (typeof interval == "undefined") interval=10000;
	if (!this[key]){
		if (count-- <= 0){
			return (typeof failure == "function")?failure():null;
		}
		reg=this;
		setTimeout(function(){
			reg.waitForCache(key, success,failure,interval,count); //recursive wait loop
		},interval);
		return;
	}
	success(this[key]);//returns a list;
}

CacheRegister.prototype.showList = function(key){
	if (!session.isSession()) return; // early out when no login available
	var myCaches = this.getList(key);
	if (myCaches){
		myCaches.map(function(cache){
			cache.sync();
			cache.restart();
		});
	}
}
CacheRegister.prototype.hideList = function(key){
	if (!session.isSession()) return; // early out when no login available
	var myCaches = caches.getList(key);
	if (myCaches){
		myCaches.map(function(cache){ cache.restart()});
	}
}

CacheRegister.prototype.stopAll = function(){
	var seen = {};
	for (var item in this){
		if (typeof caches[item] == "object"){
			for (var inner in caches[item]){
				inner=caches[item][inner];
				if (typeof inner.stop == "function" && typeof seen[inner.label] == "undefined"){
					seen[inner.label]=true;
					inner.stop();
				}
			}
		}
	}
}
CacheRegister.prototype.startAll = function(){
	var seen = {};
	for (var item in this){
		if (typeof caches[item] == "object"){
			for (var inner in caches[item]){
				inner=caches[item][inner];
				if (typeof inner.stop == "function" && typeof seen[inner.label] == "undefined"){
					seen[inner.label]=true;
					inner.restart();
					inner.sync();
				}
			}
		}
	}
}


//======================================================
