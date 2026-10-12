package com.example.pace

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        // Plaid SANDBOX keys from android/local.properties, compiled into BuildConfig by Gradle.
        // Read on the Dart side by PlaidConfig (lib/services/plaid_config.dart).
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "pace/plaid_config")
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "sandboxKeys" -> result.success(
                        mapOf(
                            "clientId" to BuildConfig.PLAID_CLIENT_ID,
                            "sandboxSecret" to BuildConfig.PLAID_SANDBOX_SECRET,
                        )
                    )
                    else -> result.notImplemented()
                }
            }
    }
}
