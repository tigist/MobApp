function notification() {    				
    document.addEventListener('deviceready', onDeviceReady ,false);
    alert("there is an update  notification");
}

function onDeviceReady(){	
	console.log("device is ready");
	  
	window.plugins.PaigeSystemNotification.createStatusBarNotification("Title","Notification","Alert"); 
	//window.plugins.webView.sendAppToFront();
	navigator.geolocation.getCurrentPosition(onSuccess, onError);
	}
 function appFront(){
	 //setTimeout(function(){
		 window.plugins.PaigeSystemNotification.updateNotification("Title","Notification","Alert"); 
	
		 window.plugins.webView.sendAppToFront();
		// },10000);
		 alert("there is an update  app to front");
 }
 function onSuccess(position) {
	 var lat = position.coords.latitude;
	 var lon =  position.coords.longitude;	 
	 console.log(position.coords.latitude + "-" + position.coords.longitude);
	// alert("u r located at + (" + lat + " ,  " + lon + ")");
 }
 

function onError(error) {	
      alert('code: '    + error.code     +      
     'message: ' + error.message + '\n');  
	  }
/**
*Render agent information from the cache
*/
var agent_renderer = function(json, cache){
	 	
	 if(json && json != "") {
         console.log(" list of gents! "); 
         console.log(JSON.stringify(json));         
         agent= json; 
         var i=0;
         flag = 0;
         if (document.getElementById('login').value!=null){
        	 var login = document.getElementById('login').value
        	 
        	 for (i = 0 ; i<agent.length; i++){         		
        		if (agent[i].login == login){
        			uuidValue = agent[i].uuid;
            		code = agent[i].login;
        			//do task caching using the uuidvalue
        			setupCache();        			
        			flag = 1;
        		}
        	 }
        	
        
        	//	identifier(i,agents);
        	
         }
          
	 }
	 loginMessage();
}
var loginMessage = function(){
	 if(flag != 1){
	 		alert("Login code incorrect! Try again ok.");
	 	}
}
/**
 * Task cache and renederer
 */

var setupCache = function() { 
 	var uuid = uuidValue; //from the super agent function
    if(!caches.exists("label")) {
		 console.log("Application started loading task list..")
		 console.log("Init Cache label");	
		 cache = new ASKCache("label", "agent/" + uuid + "/tasks" ,null,"id",session,false);//for task 
		 cache.addRenderer('all', my_renderer);	
         cache.onChangeCBs[cache.onChangeCBs.length]=
        	 function(a,b){console.log(a,b);
        		 if(a !== null && b !== null && (JSON.stringify(a) !== JSON.stringify(b))){
        			notification();//repeat the notification sound         			
					appFront(); //onchange only app to front
					//alert("there is an update ");
				}
        	 };
         cache.render(); 
         
	}else{
		//cache.clear();	 
		console.log("Loading task information ...");
             cache.addRenderer('all', my_renderer);           
             cache.onChangeCBs[cache.onChangeCBs.length]=
            	 function(a,b){console.log(a,b);
            		 if(a !== null && b !== null && (JSON.stringify(a) !== JSON.stringify(b)) ){
            			notification();//repeat the notification sound         			
    					appFront(); //onchange only app to front
    					//alert("there is an update");
    			}
           };
           //  cache.render(); //???
     }
} 


/**
 *Agent identifier 
 */
/*
  
 
identifier = function(i,agents){	
	  var pin = document.getElementById('login').value;//default value should be null		
	  if (pin > agents.length){
			console.log("Please enter correct code!!!");			
		}
		else if(pin == i){	
			var agentId =  agents[i].uuid;
			console.log("agent uuid with pin  " + i + " = " + agentId);
			return agentId;
		}
	}
*/
		
/**
 * render task information from the cache
 */		
var my_renderer = function(json, cache) {  
        if(json && json != "") {
            console.log(" Task json data! "); 
            console.log(JSON.stringify(json));
           
            var task = json; 
            console.log("json data lengeth = " + task.length);
            i = 0
            while(document.getElementById(i)){ 
            	i++;             	
            }            
            if(task.length > i)  
            {
            newTask(i, task); 
            
            }
            var loadingdiv1 = document.getElementById('loading1');
        	loadingdiv1.style.visibility = "hidden";
        	var loadingdiv2 = document.getElementById('loading2');
        	loadingdiv2.style.visibility = "hidden";

            
       }
          
} 

/**
 * Create HTML elements dynamically for each task 
 */
newTask = function(i, task){
	var taskState = task[i].state;
	if (taskState == 'pending'){
		
		var resourceList ="";
		for(var j=0 ; j<task[i].resources.length; j++){
			var type = task[i].resources[j].type;
			if(type == "human"){
				resourceList +=	"personnel: " + task[i].resources[j].details.role + '<br>';
			}else if(type=="car"){
				resourceList +=	"CarType: " + task[i].resources[j].details.carType + '<br>';
			}					 
		}
		var newTaskDetail =  "Task : "+ task[i].description + '<br>' +"location:  ("+ task[i].lat +' , '+ task[i].lon +' )<br>'
		 					+ "resources: "  + '<br>' + resourceList 
		 					+"state: "+ task[i].state +'<br>';
		
		console.log("pending task detail = " + newTaskDetail);
	    var myli = document.createElement('li'); 
	        myli.id =  i;
	        myli.value = i;
	        myli.innerHTML= newTaskDetail;			       
	  /*      myli.onclick = function(){
	    	     divObjHide(i,task);
	        }  
		 var mydivD = document.createElement('div');	 
			 mydivD.id = "div" + i;
			 mydivD.value = newTaskDetail;
			 mydivD.name = "TaskContent"
			 mydivD.innerHTML = newTaskDetail;  //selected information about the task			
    */		
		 var accept = document.createElement('input');
	       	 accept.type ="button";
	       	 accept.id = "btnAccept" + i;
	         accept.name = "accept";
	         accept.value = "Accept" 
	       	 accept.title = "Accept";
	       	 accept.onclick = function() {
	       		 	postAccept(i, task); //post to the server
	       		 	change(i, task); // change button 
	       	 	};
	    
		 var reject = document.createElement('input');
	         reject.type ="button";
	         reject.id = "btnreject" + i;
	         reject.name = "reject";
	         reject.style.cursor = 'pointer';
	         reject.value = "Reject"; 
	         reject.title = "Reject";
			        
			 myli.appendChild(accept);
			 myli.appendChild(reject);
		/*	 mydivD.style.display = "none"; //hide detail of task for first  time
			 mydivD.style.width = "400px";
		*/		
	  	 var selectable = document.getElementById('selectable');		     
		     selectable.appendChild(myli);
		     //selectable.appendChild(mydivD);  
		     
	 }else if (taskState =='operational'){
		 var resourceList ="";
			for(var j=0 ; j<task[i].resources.length; j++){
				var type = task[i].resources[j].type;
				if(type == "human"){
					resourceList +=	"personnel " + task[i].resources[j].details.role + '<br>';
				}else if(type=="car"){
					resourceList +=	"Car type " + task[i].resources[j].details.carType + '<br>';
				}					 
			}
			var operationalTask =  "Task " + task[i].description + '<br>'+"location:  ("+ task[i].lat +' , '+ task[i].lon +' )<br>'
			 						+ "resources: "  + '<br>' + resourceList  +'<br>'
			 						+ "state: "+ task[i].state +'<br>';
		 console.log("operational task " + i + " detail is "+ operationalTask); 
		
		var myli = document.createElement('li'); 
	       	myli.id =  i;
	       	myli.value = i;
	       	myli.innerHTML= operationalTask; 		       
	       	myli.onclick = function(){	       		
	       		divObjHide(i,task);
	       		};
	       	
	/*	var mydivD = document.createElement('div');	 
			mydivD.id = "div" + i;
			mydivD.value = operationalTask;
			mydivD.name = "TaskContent";		
			mydivD.innerHTML = operationalTask;  
		*/ var start = document.createElement('input');
			start.type ="button";
			start.id = "btnStart" + i;
			start.name = "Started";
			start.value = "Started";
			start.title = "Started";
			/*Start.onclick = function() {
	       		postAccept(i, task); //post acceptance of task
	       		change(i, task); // change button  
		      	};*/
			start.disabled = true;	
		var withdraw = document.createElement('input');
			withdraw.type ="button";
			withdraw.id = "btnwithdraw" + i;
			withdraw.name = "withdraw";
			withdraw.style.cursor = 'pointer';
			withdraw.value = "withdraw";
			withdraw.title = "withdraw";
		        
			myli.appendChild(start);
			myli.appendChild(withdraw);
			//myli.style.display = "none"; //hide detail of task for first  time
			//myli.style.width = "400px";
			
   	   var selectable = document.getElementById('selectable1');		     
   	   	   selectable.appendChild(myli);
   	   	  // selectable.appendChild(mydivD);   
	}  
}

var change = function(i, task){	
		var val = 'btnAccept'+ i;
		var valString = val.toString();
		var accept = document.getElementById(valString);
		var acceptValue = document.getElementById(valString).value;	
		
			if(acceptValue == 'Accept'){
				var valRej = 'btnreject'+i;
				var valStrng = valRej.toString();		
				var rejectbtn = document.getElementById(valStrng);			
					rejectbtn.title = "withdraw";
					rejectbtn.value = "withdraw";
					rejectbtn.name = "withdraw";
					accept.title = "you have already accepted this task";					
					accept.disabled = true;			
			}
	}

divObjHide = function(i, task){	
		var myid = i.toString();
		var getLi = document.getElementById(myid);
		getLi.onclick = function() {
			var idString = 'div'+ myid;
			var id = idString.toString();
			hideshow(document.getElementById(id)); //this should be replaced by i and j when we have more task
	  }
}
/**
 * Hide and Unhide the task detail
 */
 hideshow = function (which){
			if (!document.getElementById)
				return
			if (which.style.display=="block")
				which.style.display="none"
			else
				which.style.display="block"
		}


/**
 * Post accept for selected task
 */

 postAccept = function(i, task){
	 	var j = document.getElementById('login').value;
	 	var agentId = uuidValue;//identifier(j,agents);
	    taskId =  task[i].id;	
	    console.log("agentId is = " +agentId);
	    console.log("task id extracted is = " + taskId);
		var url = "http://memo-app-services.appspot.com/agent/" + agentId + "/tasks/" +  taskId + "/accept" ;
				 $.ajax({
			 type: "POST",
				 xhrFields:{
	     			withCredentials:true  
	 			},
	 				 contentType:"application/json; charset=utf-8",
					// data: JSON.stringify(data), 
	 				 url: url,
					 success: function(msg){ alert("you have accepted the task")},
					 error: function(a,b,c) {
      					 console.log("XMLHttpRequest: " + a +"textStatus: " + b + "errorThrown: " + c);
      					 alert("XMLHttpRequest: " + a +"textStatus:  " + b + "errorThrown: " + c);
       					 }
				});
		}

 postWithdraw = function(i, task){
	 	var j = document.getElementById('login').value;
	 	var agentId = identifier(j,agents);
	    taskId =  task[i].id;	
	    console.log("agentId is = " +agentId);
	    console.log("task id extracted is = " + taskId);
		var url = "http://memo-app-services.appspot.com/agent/" + agentId + "/tasks/" +  taskId + "/withdraw" ;
				 $.ajax({
				 type: "POST",
				 xhrFields:{
	     			withCredentials:true  
	 			},
	 				 contentType:"application/json; charset=utf-8",
	 				 url: url,
					 success: function(msg){ alert("you have accepted task")},
					 error: function(a,b,c) {
   					 console.log("XMLHttpRequest: " + a +"textStatus: " + b + "errorThrown: " + c);
   					 alert("XMLHttpRequest: " + a +"textStatus: " + b + "errorThrown: " + c);
    					 }
				});
		}
