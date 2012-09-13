package com.almende.plugin;

import org.json.JSONArray;

import android.content.Context;
import android.content.Intent;
import android.util.Log;


import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;

/*
 * If anything needs to be done with the webview or the activity the WebViewPG Class can be used. 
 * 
 * In the Javascript plugin code the action variable can be set. 
 * One of the actions is "sendAppToFront", with this action the main activity is started and the will be showed in front
 * 
 * Other option to do as action is to set the webview visibility (View.VISIBLE, View.GONE, View.INVISIBLE)
 */
public class WebViewPG extends Plugin {
    static final String TAG = "Paige WebView Plugin";

    @Override
    public PluginResult execute(String action, JSONArray jsonarray, String callbackId) {
    	
        Log.i("WebViewPG", "called with action " + action);
        
        if (action.equals("sendAppToFront")) {

            ctx.runOnUiThread(new RunIntent(ctx.getBaseContext()));

            return new PluginResult(com.phonegap.api.PluginResult.Status.OK);
        }
        return new PluginResult(PluginResult.Status.OK);
    }

    class RunIntent implements Runnable {
        private Context ctx;

        public RunIntent(Context ctx) {
            this.ctx = ctx;
        }

      
	   @Override 
       public void run() {
        	   Log.i(TAG, "Trying to get screen to front");
        	   Intent i = new Intent("com.mobapp2.MainActivity");             
               i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
               ctx.startActivity(i); 
               
         }
	   
	   public void onBackPressed(){
		   	  Log.d("CDA", "onBackPressed Called");
		      Intent setIntent = new Intent(Intent.ACTION_MAIN);
		      setIntent.addCategory(Intent.CATEGORY_HOME);
		      setIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
		      ctx.startActivity(setIntent);
	  }  

    	}
	}

