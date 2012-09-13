package com.mobapp2;

import org.apache.cordova.DroidGap;

import android.os.Bundle;
import android.app.Activity;
import android.content.Intent;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.support.v4.app.NavUtils;

public class MainActivity extends DroidGap{
	 
	private Button button;

	public void onCreate(Bundle savedInstanceState) {
		//final Context context = this;
		
		Window window = getWindow();
	    window.addFlags(WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);
	    window.addFlags(WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
	    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
	    setBooleanProperty("keepRunning", true);
	    super.setIntegerProperty("loadUrlTimeoutValue", 60000); 
		super.onCreate(savedInstanceState);
		super.clearCache();	
		super.loadUrl("http://bridge-demo-mob-agent.appspot.com/"); 
	 }
	//Override back button to act like home button
	
	   @Override
	   public boolean onKeyDown(int keyCode, KeyEvent event) {
		   if (keyCode == KeyEvent.KEYCODE_BACK) {	   
			   onBackPressed();
		   }
		   return super.onKeyDown(keyCode, event);
	   }
	   
	   @Override
	   public void onBackPressed(){
		   Log.d("CDA", "onBackPressed Called");
		   Intent intent = new Intent(Intent.ACTION_MAIN);
	       intent.addCategory(Intent.CATEGORY_HOME);
	       intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
	       startActivity(intent);
		}	 
	
  
	} 
