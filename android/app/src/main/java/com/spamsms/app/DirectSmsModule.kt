package com.spamsms.app

import android.telephony.SmsManager
import com.facebook.react.bridge.*

class DirectSmsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "DirectSms"

    @ReactMethod
    fun sendSms(phoneNumber: String, message: String, promise: Promise) {
        try {
            val smsManager = SmsManager.getDefault()
            val parts = smsManager.divideMessage(message)
            if (parts.size == 1) {
                smsManager.sendTextMessage(phoneNumber, null, message, null, null)
            } else {
                smsManager.sendMultipartTextMessage(phoneNumber, null, parts, null, null)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SMS_ERROR", e.message, e)
        }
    }
}
