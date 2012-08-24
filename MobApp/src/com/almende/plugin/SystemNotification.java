package com.almende.plugin;

import java.io.IOException;

//import nl.ask.paige.R;
//import nl.ask.paige.app.Paige;
import com.mobapp2.MainActivity;
import com.mobapp2.R;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.apache.cordova.api.PluginResult.Status;
import org.json.JSONArray;
import org.json.JSONException;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

public class SystemNotification extends Plugin {

    private static final String TAG = "SystemNotification Plugin";
    private static final int NOTIFICATION_ID = 1234;

    private int numb = 0;
    private NotificationCompat.Builder builder;

    private void beep(final Integer count) throws IllegalArgumentException, SecurityException,
	    IllegalStateException, IOException {
	Log.v(TAG, "Beep");

	Uri soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
	Log.e(TAG, "couldn't work with uri:" + soundUri);
	MediaPlayer mMediaPlayer = new MediaPlayer();
	mMediaPlayer.setDataSource(this.ctx.getContext(), soundUri);
	final AudioManager audioManager = (AudioManager) this.ctx
		.getSystemService(Context.AUDIO_SERVICE);
	if (audioManager.getStreamVolume(AudioManager.STREAM_ALARM) != 0) {
	    mMediaPlayer.setAudioStreamType(AudioManager.STREAM_ALARM);
	    mMediaPlayer.setLooping(false);
	    mMediaPlayer.prepare();
	    mMediaPlayer.start();
	    mMediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
		int cnt = count;

		@Override
		public void onCompletion(MediaPlayer mp) {
		    if (cnt-- > 1) {
			mp.seekTo(0);
			mp.start();
		    }
		}
	    });
	}
    }

    /**
     * Delete the notification without user interaction
     */
    private void cancelNotification() {
	Log.v(TAG, "Cancel status bar notification");

	NotificationManager nm = (NotificationManager) ctx
		.getSystemService(Context.NOTIFICATION_SERVICE);
	nm.cancel(NOTIFICATION_ID);
	numb = 0;
    }

    /**
     * Create a statusbar notification with activity and two text rows --------- Headertext Subtext
     * ---------
     */
    private void createStatusBarNotification(String contentTitle, String contentText,
	    String tickerText) {
	Log.v(TAG, "Create status bar notification");

	builder = new NotificationCompat.Builder(ctx.getContext());

	// flags
	builder.setAutoCancel(false);
	builder.setOngoing(true);
	builder.setDefaults(Notification.DEFAULT_VIBRATE | Notification.DEFAULT_SOUND);
	builder.setLights(Color.GREEN, 300, 300);

	// content
	//builder.setSmallIcon(R.drawable.ic_stat_notify_alert);//component need to be created
	builder.setSmallIcon(R.drawable.ic_launcher);
	builder.setContentText(contentText);
	builder.setContentTitle(contentTitle);
	builder.setTicker(tickerText);

	// intent
	Intent notificationIntent = new Intent(this.ctx.getContext(), MainActivity.class);
	notificationIntent.setAction(Intent.ACTION_MAIN);
	notificationIntent = notificationIntent.setFlags(Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);
	PendingIntent operation = PendingIntent.getActivity(this.ctx.getContext(), 0,
		notificationIntent, 0);
	builder.setContentIntent(operation);

	builder.setWhen(System.currentTimeMillis());
	builder.setNumber(++numb);

	Notification note = builder.getNotification();

	NotificationManager nm = (NotificationManager) ctx
		.getSystemService(Context.NOTIFICATION_SERVICE);
	nm.notify(NOTIFICATION_ID, note);
    }

    @Override
    public PluginResult execute(String action, JSONArray args, String callbackId) {
	PluginResult.Status status = PluginResult.Status.OK;
	String result = "";

	try {
	    if (action.equals("createStatusBarNotification")) {
		createStatusBarNotification(args.getString(0), args.getString(1), args.getString(2));
	    } else if (action.equals("updateNotification")) {
		updateNotification(args.getString(0), args.getString(1), args.getString(2));
	    } else if (action.equals("cancelNotification")) {
		cancelNotification();
	    } else if (action.equals("showTickerText")) {
		showTickerText(args.getString(0));
	    } else if (action.equals("touch")) {
		// empty
	    } else if (action.equals("beep")) {
		beep(args.getInt(0));
	    }

	    return new PluginResult(status, result);

	} catch (JSONException e) {
	    return new PluginResult(Status.JSON_EXCEPTION, e.getMessage());
	} catch (Exception e) {
	    return new PluginResult(Status.ERROR, e.getMessage());
	}
    }

    private void showTickerText(String tickerText) {
	Log.v(TAG, "Set ticker text");

	builder.setTicker(tickerText);

	NotificationManager nm = (NotificationManager) ctx
		.getSystemService(Context.NOTIFICATION_SERVICE);
	nm.notify(NOTIFICATION_ID, builder.getNotification());
    }

    /**
     * Update the existing notification (possible with a number to say there are 2 messages for
     * example)
     * 
     * @param contentTitle
     * @param contentText
     * @param tickerText
     */
    private void updateNotification(String contentTitle, String contentText, String tickerText) {
	Log.v(TAG, "Update status bar notification");

	builder.setContentTitle(contentTitle);
	builder.setContentText(contentText);
	builder.setTicker(tickerText);

	NotificationManager nm = (NotificationManager) ctx
		.getSystemService(Context.NOTIFICATION_SERVICE);
	nm.notify(NOTIFICATION_ID, builder.getNotification());
    }
}
