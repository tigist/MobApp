/**
 * notification method consists deviceready event that fires when PhoneGap is
 * fully loaded, callback function
 */

function notification() {
	document.addEventListener('deviceready', onDeviceReady, false);
	alert("there is an update  notification");
}

/**
 * On deviceready the application create notification icon to keep the
 * application running on the mobile phone
 */
function onDeviceReady() {
	console.log("device is ready");
	if (typeof window.plugins.PaigeSystemNotification != "undefined") {
		window.plugins.PaigeSystemNotification.createStatusBarNotification(
				"Title", "Notification", "Alert");
		window.plugins.webView.sendAppToFront();
	}
}
/**
 * setupCacheAgent is a callback method to createcache for agents. 
 * It create a cache containes list of all agent detail. The cache renedere 
 * is created only once. The agent renderer callback used to retrieve current user 
 * from list of agents. 
 */
var setupCacheAgent = function() {

	if (!caches.exists("agent")) {
		console.log("Init Cache agent");
		cache = new ASKCache("agent", "agent/", null, "uuid", session, true); // cache for agents
		cache.addRenderer("all", agent_renderer);
		cache.onChangeCBs[cache.onChangeCBs.length] = function(a, b) {
			console.log(a, b);
			if (a !== null && b !== null
					&& (JSON.stringify(a) !== JSON.stringify(b))) {
				if (a.data.uuid == uuidValue && b.data.uuid == uuidValue) {
					cache.addRenderer('all', plan_renderer); //delete existing user display and reload the task with plan information
					notification();
				}
			}

		}

	}
}

/**
 * loginOkClciked method check the user input for the pin code. In the agent database 
 * we have agents with login code 1 - 5. If login code is different from the listed on
 * it display error message. If login correct the loading icon is visible. And it switch 
 * from the login tab to the incoming task tab
 */

var loginClick = function() {

	var button = document.getElementById('btnlogin').value;
	if (button == "login") {
		var pin = document.getElementById('login').value;

		if (pin == "") {

			alert("Please enter your pin code");

		} else {
			checkAgent();//compare the login code with the existing agent cache

			var loadingdiv1 = document.getElementById('loading1');
			loadingdiv1.style.visibility = "visible";

			var loadingdiv2 = document.getElementById('loading2');
			loadingdiv2.style.visibility = "visible";

			$("#tabs").tabs("select", 1);
			$("#loginTab").html("Logout");
			var pin = document.getElementById('login').value;

		}

	} else if (button == "logout") {
		cleanPage();
	}
}

/**
 * clear the HTML History and cache from localStorage in strict mode.
 */
var cleanPage = function() {
	"use strict";
	history.go(0);
	localStorage.clear();
}

/**
 * agent_renderer take json data of agents from cache, if Json data is not
 * empty, it takes user login value from user interface. Looping through the
 * agent login code to extract the corresponding uuid of that particular agent.
 * The uuid will be used to trigger task detail though setupCacheTask callback
 * method
 * 
 */

agent_renderer = function(json, oldData, cache) {
	if (json && json != "") {
		console.log(" list of gents! ");
		console.log(JSON.stringify(json));
		agent = json;
	}
}

checkAgent = function(json, lodData, cache) {

	var i = 0;
	if (document.getElementById('login').value != null) {
		login = document.getElementById('login').value
		for (i = 0; i < agent.length; i++) {
			if (agent[i].login == login) {
				document.getElementById('btnlogin').value = "logout";
				uuidValue = agent[i].uuid;
				// plans = agent[i].plan;// first time empty
				setupCacheTask();
			}
		}

	}

}


/**
 * setupCacheTask is a callback method to create task cache for particular user.
 * It create new cache for current user using ASKcache. ASKCache keep on
 * updating the cache every 10 second. The cache consists callback methods
 * my_renderer to display task detail on the application user interface. The
 * cache onChangeCBs method do comparison of the existing json data with the
 * most recent value. If there is a change it trigger the phoneGap notification
 * method to alarm users for the update.
 */

var setupCacheTask = function() {
	var uuid = uuidValue; //uuidValue from agent login check function

	if (!caches.exists("label")) {
		console.log("Application started loading task list..")
		console.log("Init Cache label");
		cache = new ASKCache("label", "agent/" + uuid + "/tasks", null, "id",session, false);// for task
		cache.addRenderer('all', task_renderer);
		cache.onChangeCBs[cache.onChangeCBs.length] = function(a, b) {
			console.log(a, b);
			if (b != null && (a.data.state !== b.data.state)) {
				console.log("'" + a.data.state + "' and '" + b.data.state + "'");
				alert("'" + a.data.state + "' and '" + b.data.state + "'");
			}
		};
		cache.render();

	}
}

/**
 * my_renderer it take task detail of particular agent from task cache to
 * display it on the application. For each task it create HTML list container
 * and button through callback method newTAskcontainer.
 */
task_renderer = function(json, olddata, cache) {
	if (json && json != "") {
		console.log(" Task json data! ");
		console.log(JSON.stringify(json));

		task = json;
		console.log("json data lengeth = " + task.length);
		i = 0
		while (document.getElementById(i)) {
			i++;
		}
		if (task.length > i) // check if all tasks are displayed on user interface
		{
			newTaskContainer(i, task, agent);

		}
		/**
		 * once task detail displayed on the screen hide the loading status
		 */ 
		var loadingdiv1 = document.getElementById('loading1');
		loadingdiv1.style.visibility = "hidden";
		var loadingdiv2 = document.getElementById('loading2');
		loadingdiv2.style.visibility = "hidden";

	}
}

plan_renderer = function(json, olddata, cache) {
	if (json && json != "") {
		console.log(" Task json data from Plan_renderer ");
		console.log(JSON.stringify(json));

		var task = json;
		console.log("json data from  plan_renderer = " + task.length);

		tabs2 = document.getElementById('taskList');
		if (tabs2!=null) {  //childNodes.length>0 
			deleteTaskContainer();
		}

		newTaskContainer(i, task, agent);

	}

	var loadingdiv1 = document.getElementById('loading1');
	loadingdiv1.style.visibility = "hidden";
	var loadingdiv2 = document.getElementById('loading2');
	loadingdiv2.style.visibility = "hidden";

}

deleteTaskContainer = function() {
	oldLi = document.getElementById('0');
	tabs2.removeChild(oldLi);
}

/**
 * newTaskContainer it check task state, extract selected values from json data
 * and create HTML element on the appropriate tab dynamically for each task.
 * Task index i is used to retrieve each task and in html element. J is an index
 * used to retrieve sub detail of a task.
 */
newTaskContainer = function(i, task, agent) {
	taskState = task[i].state;

	if (taskState == 'pending') {

		var resourceList = "";
		agentState = "";
		agentStateOf = "";
		for ( var j = 0; j < task[i].resources.length; j++) {
			var type = task[i].resources[j].type;
			if (type == "human") {
				resourceList += "person: " + task[i].resources[j].details.role + '<br>';//loop in resources
				agentUuid = task[i].resources[j].id;
				if (agentUuid == uuidValue) {
					agentStateOf = task[i].resources[j].details.state;
				}
			} else if (type == "car") {
				resourceList += "CarType: "
						+ task[i].resources[j].details.carType + '<br>';
			}
		}
		var newTaskDetail = "Task : " + task[i].description + '<br>'
				+ "location:  (" + task[i].lat + ' , ' + task[i].lon + ' )<br>'
				+ "resources: " + '<br>' + resourceList + "state: "
				+ task[i].state + '<br>';

		console.log("pending task detail = " + newTaskDetail);

		/**
		 * new html list element created with id and value as i to contain task detail in Incoming tab
		 */ 	
		var myli = document.createElement('li');
		myli.id = i;
		myli.value = i;
		myli.innerHTML = newTaskDetail;

		/**
		 * new accept button created and appended to the corresponding list html element
		 */ 
		var accept = document.createElement('input');
		accept.type = "button";
		accept.id = "btnAccept" + i;
		accept.name = "accept";
		accept.value = "Accept"
		accept.title = "Accept";
		accept.onclick = function() {
			postAccept(i, task); // accept i-th task and post acceptance to the server
			change(i, task); // disable button in i-th task
		};
		if (agentStateOf == 'accepted') {
			accept.disabled = true;
			accept.title = "you have already accepted this task";

		}
		/**
		 * new reject button created and appended to the corresponding list html element
		 */ 
		var reject = document.createElement('input');
		reject.type = "button";
		reject.id = "btnreject" + i;
		reject.name = "reject";
		reject.style.cursor = 'pointer';
		reject.value = "Reject";
		reject.title = "Reject";
		reject.disabled = true;

		/**
		 * attache the button to the current html list element in the same execution
		 */ 
		myli.appendChild(accept);
		myli.appendChild(reject);

		var taskList = document.getElementById('taskList');
		taskList.appendChild(myli);

	} else if (taskState == 'operational') {

		var resourceList = "";
		var agentPlan = "";
		for ( var j = 0; j < task[i].resources.length; j++) {
			var type = task[i].resources[j].type;
			if (type == "human") {
				resourceList += "person " + task[i].resources[j].details.role
						+ '<br>';
				agentUuid = task[i].resources[j].id;
				if (agentUuid == uuidValue) {
					for ( var n = 0; n < agent.length; n++) {
						if (agent[n].uuid == uuidValue) {
							agentPlan = agent[n].plan;
							alert("agent plan is  '  " + agentPlan + "    '  ");
						}
					}
				}
			} else if (type == "car") {
				resourceList += "Car type "
						+ task[i].resources[j].details.carType + '<br>';
			}
		}
		var operationalTask = "Task " + task[i].description + " at " + "<br>"
				+ "location:  (" + task[i].lat + ' , ' + task[i].lon + ' )<br>'
				+ "plan: " + agentPlan + "<br>" +

				"resources: " + '<br>' + resourceList + '<br>' + "state: "
				+ task[i].state + '<br>'

		console.log("operational task detail =  " + operationalTask);

		/** new html list element created with id and value name called as i to
		 * contain in operational tab task detail
		 */
		var myli = document.createElement('li');
		myli.id = i;
		myli.value = i;
		myli.innerHTML = operationalTask;

		/**
		 *  new started button created and appended to the corresponding html li element
		 */

		var start = document.createElement('input');
		start.type = "button";
		start.id = "btnStart" + i;
		start.name = "Started";
		start.value = "Started";
		start.title = "Started";
		start.disabled = true;

		/**
		 * new withdraw button created and appended to the corresponding html li element
		 */ 

		var withdraw = document.createElement('input');
		withdraw.type = "button";
		withdraw.id = "btnwithdraw" + i;
		withdraw.name = "withdraw";
		withdraw.style.cursor = 'pointer';
		withdraw.value = "withdraw";
		withdraw.title = "withdraw";
		withdraw.disabled = true;

		myli.appendChild(start);
		myli.appendChild(withdraw);
		var taskList = document.getElementById('taskList1');
		taskList.appendChild(myli);
	}

}

/**
 * change function used to detect the value of dynamically created button for
 * particular task and disable it. And detect the reject button and change it to
 * withdraw title. Yet the functionality of reject and withdraw is not defined
 */
var change = function(i, task) {
	var val = 'btnAccept' + i;
	var valString = val.toString();
	var accept = document.getElementById(valString);
	var acceptValue = document.getElementById(valString).value;

	if (acceptValue == 'Accept') {
		var valRej = 'btnreject' + i;
		var valStrng = valRej.toString();
		var rejectbtn = document.getElementById(valStrng);
		rejectbtn.title = "withdraw";
		rejectbtn.value = "withdraw";
		rejectbtn.name = "withdraw";
		accept.title = "you have already accepted this task";
		accept.disabled = true;
	}
}

/**
 * PostAccept is method used to send ajax request to do POST on memo server, For
 * the ith task, task id and current user uuid are used to form the url. On post
 * the same structure of json data of task returned as a response with change of
 * agent state and optionally task state.
 */

postAccept = function(i, task) {
	var j = document.getElementById('login').value;
	var agentId = uuidValue;
	taskId = task[i].id;
	console.log("agentId is = " + agentId);
	console.log("task id extracted is = " + taskId);
	var url = "http://memo-app-services.appspot.com/agent/" + agentId
			+ "/tasks/" + taskId + "/accept";
	$.ajax({
		type : "POST",
		xhrFields : {
			withCredentials : true
		},
		contentType : "application/json; charset=utf-8",
		url : url,
		success : function(msg) {
			alert("you have accepted the task")
		},
		error : function(a, b, c) {
			console.log("XMLHttpRequest: " + a + " textStatus: " + b
					+ "errorThrown: " + c);
			alert("XMLHttpRequest: " + a + "<br>" + " textStatus:  " + b
					+ "<br>" + "errorThrown: " + c);
		}
	});
}
