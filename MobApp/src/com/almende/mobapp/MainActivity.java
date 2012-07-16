package com.almende.mobapp;


import android.app.Activity;
import org.apache.cordova.DroidGap;
import android.os.Bundle;

public class MainActivity extends DroidGap {

	 @Override
	    public void onCreate(Bundle savedInstanceState) {
	        super.onCreate(savedInstanceState);
	       // super.setIntegerProperty("loadUrlTimeoutValue", 60000);
	        super.loadUrl("http://mobappagent.appspot.com/");
	    }

    
}
