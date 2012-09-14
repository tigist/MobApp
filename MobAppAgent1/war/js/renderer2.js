var uuidValue = null;
var PhoneGapAvailable = false;
var agentCache = null;
var taskCache = null;
var geocoder = null;

$(document).ready(
		function() {
			if (typeof (google) != "undefined")
				geocoder = new google.maps.Geocoder();
			if (typeof (localStorage["Bridge_login"]) != "undefined"
					&& localStorage["Bridge_login"] != null) {
				setupCacheAgent();
				uuidValue = localStorage["Bridge_login"];
				setupCacheTask();

				if ($("#taskList1 .taskListItem").length == 0) {
					$("#tabs").tabs("select", 1);
				} else {
					$("#tabs").tabs("select", 2);
				}
				$("#loginTab").html("Logout");
				document.getElementById('btnlogin').value = "logout";
				document.getElementById('login').value = agentCache
						.getElement(uuidValue).login;
			}
		});
document.addEventListener('deviceready', onDeviceReady, false);

/**
 * notification method consists deviceready event that fires when PhoneGap is
 * fully loaded, callback function
 */

function notification(source) {
	console.log("Beeping!");
	if (PhoneGapAvailable) {
		window.plugins.PaigeSystemNotification.beep(1);
		try {
			window.plugins.webView.sendAppToFront();
		} catch (e) {
			console.log("Couldn't get app to front:", e);
		}
	}
	// Navigate to source page
	if (source == "incoming") {
		$("#tabs").tabs("select", 1);
	} else if (source == "operational") {
		$("#tabs").tabs("select", 2);
	}
	;

}

/**
 * On deviceready the application create notification icon to keep the
 * application running on the mobile phone
 */
function onDeviceReady() {
	console.log("device is ready");
	if (typeof window.plugins.PaigeSystemNotification != "undefined") {
		PhoneGapAvailable = true;
		window.plugins.PaigeSystemNotification.createStatusBarNotification(
				"Title", "Notification", "Alert");
	}
}

function closeApp() {
    console.log("app close 1");

    if(PhoneGapAvailable){
        console.log("app close 2");

    navigator.app.exitApp();  
    console.log("app close 3");
    }
    
}

/**
 * setupCacheAgent is a callback method to createcache for agents. It create a
 * cache containes list of all agent detail. The cache renedere is created only
 * once. The agent renderer callback used to retrieve current user from list of
 * agents.
 */
var setupCacheAgent = function() {
	if (agentCache == null) {
		if (!caches.exists("agent")) {
			console.log("Init Cache agent");
			agentCache = new ASKCache("agent", "agent/", null, "uuid", session,
					false); // cache for agents, Global!
			agentCache.addCB(plan_renderer);
		} else {
			agentCache = caches.getList("agent")[0];
			agentCache.restart();
		}
	}
}

/**
 * loginOkClciked method check the user input for the pin code. In the agent
 * database we have agents with login code 1 - 5. If login code is different
 * from the listed on it display error message. If login correct the loading
 * icon is visible. And it switch from the login tab to the incoming task tab
 */

var loginClick = function() {

	var button = document.getElementById('btnlogin').value;
	if (button == "login") {
		var pin = document.getElementById('login').value;

		if (pin == "") {

			$("#message").html("Please enter your pin code");

		} else {
			checkAgent();// compare the login code with the existing agent
							// cache
			
			var loadingdiv1 = document.getElementById('loading1');
			loadingdiv1.style.visibility = "visible";

			var loadingdiv2 = document.getElementById('loading2');
			loadingdiv2.style.visibility = "visible";
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

incorrectLogin = 0;
checkAgent = function() {
	if (document.getElementById('login').value != null) {
		login = document.getElementById('login').value;
		var agents = agentCache.getArray();
		for ( var i = 0; i < agents.length; i++) {
			if (agents[i].login == login) {				
				$("#loginTab").html("Logout");
				$("#message").empty();
				document.getElementById('btnlogin').value = "logout";
				uuidValue = agents[i].uuid;
				localStorage["Bridge_login"] = uuidValue;
				setupCacheTask();
				incorrectLogin = 1;
				if ($("#taskList1 .taskListItem").length == 0) {
					$("#tabs").tabs("select", 1);
				} else {
					$("#tabs").tabs("select", 2);
				}
			}
		}
		invalidLogin();
	}
}

var invalidLogin = function(){
	if(incorrectLogin==0){
		$("#message").html("login incorrect");
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
	var uuid = uuidValue;

	if (!caches.exists("task")) {
		console.log("Application started loading task list..")
		taskCache = new ASKCache("task", "agent/" + uuid + "/tasks", null,
				"id", session, false);// for task
		taskCache.addRenderer('all', task_renderer);
		taskCache.addCB(task_alert);
		taskCache.render();
	}
}

task_alert = function(oldVal, newVal) {
	if (oldVal == null && newVal != null) {
		if (newVal.data.state == "operational") {
			notification("operational");
		} else {
			notification("incoming");
		}
	}
	$("#message").empty();
}

/**
 * my_renderer it take task detail of particular agent from task cache to
 * display it on the application. For each task it create HTML list container
 * and button through callback method newTAskcontainer.
 */
task_renderer = function(json, olddata, cache) {
	if (json && typeof (uuidValue) != "undefined") {
		tasks = json;
		newTaskContainer(tasks);

		/**
		 * once task detail displayed on the screen hide the loading status
		 */
		var loadingdiv1 = document.getElementById('loading1');
		loadingdiv1.style.visibility = "hidden";
		var loadingdiv2 = document.getElementById('loading2');
		loadingdiv2.style.visibility = "hidden";
		if ($('#taskList .taskListItem').length == 0) {
			$('#taskList').html(
					"<span class='noTasks'>No tasks to display!</span>");
		} else {
			$('#taskList .noTasks').hide();
		}
		;
		if ($('#taskList1 .taskListItem').length == 0) {
			$('#taskList1').html(
					"<span class='noTasks'>No tasks to display!</span>");
		} else {
			$('#taskList1 .noTasks').hide();
		}
		;
		$("#tabs").tabs();
	}
}

plan_renderer = function(oldVal, newVal) {
	if (newVal != null) {
		if (typeof (uuidValue) == "undefined" || newVal.id != uuidValue)
			return;
		if (oldVal == null || oldVal.data.plan != newVal.data.plan) {
			console.log("plan changed");
			setTimeout(function() {
				taskCache.render();
			}, 100);
			notification("operational");
		}
	}

	var loadingdiv1 = document.getElementById('loading1');
	loadingdiv1.style.visibility = "hidden";
	var loadingdiv2 = document.getElementById('loading2');
	loadingdiv2.style.visibility = "hidden";

}

/**
 * newTaskContainer it check task state, extract selected values from json data
 * and create HTML element on the appropriate tab dynamically for each task.
 * Task index i is used to retrieve each task and in html element. J is an index
 * used to retrieve sub detail of a task.
 */
newTaskContainer = function(tasks) {
	$("#taskList, #taskList1").empty();
	for ( var i = 0; i < tasks.length; i++) {
		taskState = tasks[i].state;
		var resourceList = "<ul>";
		var myState = "";
		var agentStateOf = "";
		var skipPlan = true;
		var agentPlan = agentCache.getElement(uuidValue).plan;
		var agentPlanLoc = null;
		var toLocation = agentCache.getElement(uuidValue).toLocation;
		if (toLocation != "") {
			agentPlanLoc = {
				"lat" : toLocation.split(" ")[0],
				"lon" : toLocation.split(" ")[1]
			};
		}
		for ( var j = 0; j < tasks[i].resources.length; j++) {
			var type = tasks[i].resources[j].type;
			if (type == "human") {
				agentStateOf = tasks[i].resources[j].details.state;
				if (tasks[i].state == "operational") {
					if (agentStateOf == "accepted") {
						resourceList += "<li>"
								+ tasks[i].resources[j].details.name + '</li>';// loop
																				// in
																				// resources
					}
				} else {
					if (tasks[i].resources[j].id == uuidValue) {
						myState = agentStateOf;
					}
					resourceList += "<li>" + tasks[i].resources[j].details.name
							+ " (" + agentStateOf + ")</li>";// loop in
																// resources

				}
			} else if (type == "car") {
				resourceList += "<li>Vehicle: "
						+ tasks[i].resources[j].details.name + '</li>';
			}
		}
		resourceList += "</ul>";
		if (tasks[i].state == "operational"
				&& $("#taskList1 .taskListItem").length == 0) {
			skipPlan = false;
		}

		if (geocoder != null) {
			var latLon = new google.maps.LatLng(tasks[i].lat, tasks[i].lon);
			geocoder.geocode({
				location : latLon
			}, function(i) {
				return function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						$('.loc_' + i).html(results[0].formatted_address);
					}
				}
			}(i));
			if (agentPlanLoc != null) {
				latLon = new google.maps.LatLng(agentPlanLoc.lat,
						agentPlanLoc.lon);
				geocoder.geocode({
					location : latLon
				}, function(i) {
					return function(results, status) {
						if (status == google.maps.GeocoderStatus.OK) {
							$('.planLoc_' + i).html(
									results[0].formatted_address);
						}
					}
				}(i));
			}
		}
		var newTaskDetail = (skipPlan || agentPlan == "" ? ""
				: "Plan: <br> <b>" + agentPlan
						+ "</b><br>(<span class='planLoc_" + i + "'>("
						+ agentPlanLoc + ")</span>)<hr>")
				+ "Description:<br>"
				+ tasks[i].description
				+ '<br>'
				+ "(<span class='loc_"
				+ i
				+ "'>"
				+ tasks[i].lat.substring(0, 6)
				+ ' , '
				+ tasks[i].lon.substring(0, 5)
				+ '</span>)<br>'
				+ "Team: "
				+ '<br>' + resourceList + "<br><hr>";

		/**
		 * new accept button created and appended to the corresponding list html
		 * element
		 */
		var accept = document.createElement('input');
		accept.type = "button";
		accept.id = "btnAccept" + i;
		accept.name = "accept";
		accept.value = "Accept"
		accept.title = "Accept";
		accept.onclick = function(i) {
			return function() {
				postAccept(tasks[i].id); // accept i-th task and post
											// acceptance to the server
				change(i); // disable button in i-th task
			}
		}(i);
		if (myState == 'accepted') {
			accept.disabled = true;
			accept.title = "you have already accepted this task";
		}
		/**
		 * new reject button created and appended to the corresponding list html
		 * element
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
		 * new started button created and appended to the corresponding html li
		 * element
		 */

		var start = document.createElement('input');
		start.type = "button";
		start.id = "btnStart" + i;
		start.name = "Started";
		start.value = "Started";
		start.title = "Started";
		start.disabled = true;

		/**
		 * new withdraw button created and appended to the corresponding html li
		 * element
		 */

		var withdraw = document.createElement('input');
		withdraw.type = "button";
		withdraw.id = "btnwithdraw" + i;
		withdraw.name = "withdraw";
		withdraw.style.cursor = 'pointer';
		withdraw.value = "withdraw";
		withdraw.title = "withdraw";
		withdraw.disabled = true;

		/**
		 * attache the button to the current html list element in the same
		 * execution
		 */
		if (taskState == 'pending') {
			$("<div class='taskListItem'>").html(newTaskDetail).append(
					$(accept)).append($(reject)).appendTo($("#taskList"));
		} else {
			$("<div class='taskListItem'>").html(newTaskDetail)
					.append($(start)).append($(withdraw)).appendTo(
							$("#taskList1"));
		}
	}
}

/**
 * change function used to detect the value of dynamically created button for
 * particular task and disable it. And detect the reject button and change it to
 * withdraw title. Yet the functionality of reject and withdraw is not defined
 */
var change = function(i) {
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

postAccept = function(taskId) {
	var agentId = uuidValue;
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
			if (typeof (msg) == "string") {
				msg = JSON.parse(msg);
			}
			task_renderer(msg);
			$("#message").html("you have accepted the task");
		},
		error : function(a, b, c) {
			console.log("HttpRequest: " + a + " textStatus: " + b
					+ "errorThrown: " + c);
			alert("HttpRequest: " + a + "<br>" + " textStatus: " + b + "<br>"
					+ "errorThrown: " + c);
		}
	});
}