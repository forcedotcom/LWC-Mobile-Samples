/**
Copyright (c) 2020, salesforce.com, inc. All rights reserved.
SPDX-License-Identifier: MIT
For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

package com.salesforce.mobiletooling.lwctestapp

import android.os.Bundle
import android.view.View
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private var webView: WebView? = null
    private var progressBar: ProgressBar? = null
    private var debugTextView: TextView? = null

    private val namespace = "com.salesforce.mobile-tooling"
    private val componentNameArgPrefix = "$namespace.componentname"
    private val projectDirArgPrefix = "$namespace.projectdir"
    private val serverAddressArgPrefix = "$namespace.serveraddress"
    private val serverPortArgPrefix = "$namespace.serverport"
    private val debugArgPrefix = "ShowDebugInfoToggleButton"
    private val usernameArgPrefix = "username"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val launchArguments = intent.extras
        val componentUrl: String = getComponentUrl(launchArguments)
        val isDebugEnabled: Boolean = getIsDebugEnabled(launchArguments)
        val username: String = getUsername(launchArguments)
        val requestUrl = if(username.isEmpty()) { componentUrl } else { "$componentUrl?username=$username" }
        val debugInfo = "RAW LAUNCH PARAMETERS:\n\n" +
                getDebugInfo(launchArguments) +
                "\n\n\n\nRESOLVED URL:\n\n" + requestUrl

        val toggleDebugInfoButton: Button = findViewById(R.id.toggleDebugInfoButton)
        progressBar = findViewById(R.id.progressBar)
        debugTextView = findViewById(R.id.debugTextView)
        debugTextView?.text = debugInfo

        if (!isDebugEnabled) {
            // If ShowDebugInfoToggleButton is not enabled then remove the button and text view
            toggleDebugInfoButton.visibility = View.GONE
            debugTextView?.visibility = View.GONE
        }

        webView = findViewById(R.id.webview)
        webView?.settings?.javaScriptEnabled = true
        webView?.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                return false
            }

            override fun onPageFinished(view: WebView, url: String) {
                progressBar?.visibility = View.GONE
            }
        }

        if (requestUrl.isNotEmpty()) {
            progressBar?.visibility = View.VISIBLE
            webView?.loadUrl(requestUrl)
        }
    }

    fun onToggleDebugInfoButtonClicked(v: View?) {
        val visibility = debugTextView?.visibility
        if (visibility == View.VISIBLE) {
            debugTextView?.visibility = View.INVISIBLE
        } else {
            debugTextView?.visibility = View.VISIBLE
        }
    }

    override fun onBackPressed() {
        if (webView?.canGoBack() == true) {
            webView?.goBack()
        } else {
            super.onBackPressed()
        }
    }

    /**
     * Attempts at formulating the url for previewing the component based on values of
     * Component Name, Server Address, and Server Port in app launch arguments.
     *
     * @param launchArguments an array of provided launch arguments
     * @return a string corresponding to the url for previewing the component.
     */
    private fun getComponentUrl(launchArguments: Bundle?): String {
        val compName = getComponentName(launchArguments).trim()
        var serverAddress = getServerAddress(launchArguments).trim()
        var serverPort = getServerPort(launchArguments).trim()

        if (serverAddress.isEmpty()) {
            serverAddress = "http://10.0.2.2"
        } else if (!serverAddress.startsWith("http")) {
            serverAddress = "http://$serverAddress"
        }

        if (serverPort.isEmpty()) {
            // if no custom port is provided then default to port 3333
            serverPort = "3333"
        }

        return "$serverAddress:$serverPort/lwc/preview/$compName"
    }

    /**
     * Attempts at fetching the component name from the provided custom launch arguments.
     *
     * @param launchArguments an array of provided launch arguments
     * @return a string corresponding to the value provided for the component name in the
     * launch arguments. If the component name is not provided in the launch arguments this
     * method returns an empty string.
     */
    private fun getComponentName(launchArguments: Bundle?): String {
        return launchArguments?.getString(componentNameArgPrefix) ?: ""
    }

    /**
     * Attempts at fetching the server address from the provided custom launch arguments.
     *
     * @param launchArguments an array of provided launch arguments
     * @return a string corresponding to the value provided for the server address in the
     * launch arguments. If the server address is not provided in the launch arguments this
     * method returns an empty string.
     */
    private fun getServerAddress(launchArguments: Bundle?): String {
        return launchArguments?.getString(serverAddressArgPrefix) ?: ""
    }

    /**
     * Attempts at fetching the server port from the provided custom launch arguments.
     *
     * @param launchArguments an array of provided launch arguments
     * @return a string corresponding to the value provided for the server port in the
     * launch arguments. If the server port is not provided in the launch arguments this
     * method returns an empty string.
     */
    private fun getServerPort(launchArguments: Bundle?): String {
        return launchArguments?.getString(serverPortArgPrefix) ?: ""
    }

    /**
     * Attempts at fetching the username from the provided custom launch arguments.
     *
     * @param launchArguments an array of provided launch arguments
     * @return a string corresponding to the value provided for the username in the
     * launch arguments. If the username is not provided in the launch arguments this
     * method returns an empty string.
     */
    private fun getUsername(launchArguments: Bundle?): String {
        return launchArguments?.getString(usernameArgPrefix) ?: ""
    }

    /**
     * Attempts at fetching ShowDebugInfoToggleButton from the provided custom launch arguments.
     *
     * @param launchArguments an array of provided launch arguments
     * @return a string corresponding to the value provided for ShowDebugInfoToggleButton in the
     * launch arguments. If ShowDebugInfoToggleButton is not provided in the launch arguments this
     * method returns TRUE.
     */
    private fun getIsDebugEnabled(launchArguments: Bundle?): Boolean {
        val isEnabled = launchArguments?.getString(debugArgPrefix) ?: "True"
        return java.lang.Boolean.parseBoolean(isEnabled)
    }

    /**
     * Goes through all of the provided custom launch arguments and generates a string containing
     * all of them. The result of this method will be used in showing debug info to the user.
     *
     * @param launchArguments an array of provided launch arguments
     * @return a string containing all of the provided launch arguments
     */
    private fun getDebugInfo(launchArguments: Bundle?): String {
        val debugInfo = StringBuilder()
        if (launchArguments != null) {
            val keys = launchArguments.keySet()
            for (key in keys) {
                debugInfo.append(key).append("=").append(launchArguments.getString(key))
                    .append("\n\n")
            }
        }
        return debugInfo.toString()
    }
}
