package com.spamsms.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.provider.Telephony
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class SmsReceiverModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var receiver: BroadcastReceiver? = null

    override fun getName() = "SmsReceiver"

    @ReactMethod
    fun startListening(promise: Promise) {
        try {
            receiver = object : BroadcastReceiver() {
                override fun onReceive(context: Context, intent: Intent) {
                    val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
                    for (msg in messages) {
                        val params = Arguments.createMap().apply {
                            putString("body", msg.messageBody)
                            putString("sender", msg.originatingAddress ?: "")
                        }
                        reactContext
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                            .emit("onSmsReceived", params)
                    }
                }
            }
            val filter = IntentFilter(Telephony.Sms.Intents.SMS_RECEIVED_ACTION)
            filter.priority = 999
            reactContext.registerReceiver(receiver, filter)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SMS_LISTEN_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stopListening(promise: Promise) {
        try {
            receiver?.let { reactContext.unregisterReceiver(it) }
            receiver = null
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SMS_STOP_ERROR", e.message, e)
        }
    }
}
