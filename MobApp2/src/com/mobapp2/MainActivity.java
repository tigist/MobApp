package com.mobapp2;

import org.apache.cordova.DroidGap;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Window;
import android.view.WindowManager;

public class MainActivity extends DroidGap{


	public void onCreate(Bundle savedInstanceState) {
		//final Context context = this;
		Window window = getWindow();
	    window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);
	    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);

		setBooleanProperty("keepRunning", true);
	    super.setIntegerProperty("loadUrlTimeoutValue", 60000); 
		super.onCreate(savedInstanceState);
		super.clearCache();	
		super.loadUrl("http://bridge-demo-mob-agent.appspot.com/"); 
	 }
	//Override back button to act like home button
	public void onStart(Bundle savedInstanceState){
		Log.w("Bridge APP", "onStart called: opening screen");
		Window window = getWindow();
	    window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);
	    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
	}
	   @Override
	   public boolean onKeyDown(int keyCode, KeyEvent event) {
		   if (keyCode == KeyEvent.KEYCODE_BACK) {	   
			   onBackPressed();
		   }
		   return super.onKeyDown(keyCode, event);
	   }
	   
	   @Override
	   public void onBackPressed(){
		   Log.d("Bridge APP", "onBackPressed Called");
		   Intent intent = new Intent(Intent.ACTION_MAIN);
	       intent.addCategory(Intent.CATEGORY_HOME);
	       intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
	       startActivity(intent);
		}	 
	
  
	} 
