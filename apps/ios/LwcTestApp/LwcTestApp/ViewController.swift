//
//  ViewController.swift
//  LwcTestApp
//
//  Copyright (c) 2020, salesforce.com, inc. All rights reserved.
//  SPDX-License-Identifier: MIT
//  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
//

import UIKit
import WebKit

fileprivate let NAMESPACE = "com.salesforce.mobile-tooling"
fileprivate let COMPONENT_NAME_ARG_PREFIX = "\(NAMESPACE).componentname"
fileprivate let PROJECT_DIR_ARG_PREFIX = "\(NAMESPACE).projectdir"
fileprivate let PREVIEW_URL_PREFIX = "http://localhost:3333/lwc/preview/"
fileprivate let DEBUG_ARG = "ShowDebugInfoToggleButton"
fileprivate let USERNAME_ARG = "username"

class ViewController: UIViewController, WKNavigationDelegate {
    @IBOutlet weak var webView: WKWebView!
    @IBOutlet weak var activity: UIActivityIndicatorView!
    @IBOutlet weak var toggleDebugInfoButton: UIButton!
    @IBOutlet weak var debugTextView: UITextView!
    
    fileprivate var launchArguments: [String] = []
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.launchArguments = CommandLine.arguments
        self.launchArguments.remove(at: 0) // first argument is the app name, which we don't need
        
        let componentUrl = getComponentUrl(self.launchArguments)
        let isDebugEnabled = getIsDebugEnabled(self.launchArguments)
        let username = getUsername(self.launchArguments)
        let requestUrl = username.isEmpty ? URL(string: "\(componentUrl)") : URL(string: "\(componentUrl)?username=\(username)")
        
        if (isDebugEnabled) {
            // If ShowDebugInfoToggleButton is enabled then configure the button
            // and populate the debug info content to be displayed.
            self.toggleDebugInfoButton.addTarget(self, action: #selector(ViewController.toggleDebugInfo(_:)), for: .touchUpInside)
            self.toggleDebugInfoButton.layer.borderColor = self.toggleDebugInfoButton.titleColor(for: .normal)?.cgColor
            self.toggleDebugInfoButton.layer.borderWidth = 1.0
            self.toggleDebugInfoButton.layer.cornerRadius = 4.0
            self.toggleDebugInfoButton.layer.masksToBounds = true
            
            self.debugTextView.textContainerInset = UIEdgeInsets(top: 5, left: 5, bottom: 5, right: 5)
            self.debugTextView.isHidden = true
            self.debugTextView.text =
                "RAW LAUNCH PARAMETERS:\n\n" +
                self.launchArguments.joined(separator: "\n\n") +
                "\n\n\n\nRESOLVED URL:" +
                "\n\n\(requestUrl?.absoluteString ?? "")"
        } else {
            self.toggleDebugInfoButton.isHidden = true;
            self.debugTextView.isHidden = true;
        }
        
        self.webView.navigationDelegate = self
        if (requestUrl != nil) {
            self.activity.startAnimating()
            self.webView.load(URLRequest(url: requestUrl!))
        }
    }
    
    @objc func toggleDebugInfo(_ sender:UIButton!) {
        self.debugTextView.isHidden = !self.debugTextView.isHidden
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        endNavigation(withError: nil);
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        endNavigation(withError: error);
    }
    
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        endNavigation(withError: error);
    }

    /// Attempts at fetching the component URL from the provided custom launch arguments.
    ///
    /// - Parameter launchArguments: An array of provided launch arguments
    /// - Returns: A string corresponding to the value provided for the component URL in the launch arguments.
    ///   If the component URL is not provided in the launch arguments this method returns an empty string.
    fileprivate func getComponentUrl(_ launchArguments: [String]) -> String {
        let match = launchArguments.first{$0.hasPrefix(COMPONENT_NAME_ARG_PREFIX)}
        guard var component = match else {return ""}
        component = component.replacingOccurrences(of: "\(COMPONENT_NAME_ARG_PREFIX)=", with: "")
        return "\(PREVIEW_URL_PREFIX)\(component)"
    }
    
    /// Attempts at fetching the username from the provided custom launch arguments.
    ///
    /// - Parameter launchArguments: An array of provided launch arguments
    /// - Returns: A string corresponding to the value provided for the username in the launch arguments.
    ///   If the username is not provided in the launch arguments this method returns an empty string.
    fileprivate func getUsername(_ launchArguments: [String]) -> String {
        let match = launchArguments.first{$0.hasPrefix(USERNAME_ARG)}
        guard var username = match else {return ""}
        username = username.replacingOccurrences(of: "\(USERNAME_ARG)=", with: "")
        return username
    }
    
    /// Attempts at fetching ShowDebugInfoToggleButton from the provided custom launch arguments.
    ///
    /// - Parameter launchArguments: An array of provided launch arguments
    /// - Returns: A boolean corresponding to the value provided for ShowDebugInfoToggleButton in the launch arguments.
    ///   If ShowDebugInfoToggleButton is not provided in the launch arguments this method returns TRUE.
    fileprivate func getIsDebugEnabled(_ launchArguments: [String]) -> Bool {
        let match = launchArguments.first{$0.hasPrefix(DEBUG_ARG)}
        guard var value = match else {return true}
        value = value.replacingOccurrences(of: "\(DEBUG_ARG)=", with: "")
        return Bool(value) ?? true;
    }
    
    /// Stops the animating activity indicator. This method is called the WebView completes
    /// its navigation either with or without an error. If an error has occured, this method will
    /// also present an alert view to the user.
    ///
    /// - Parameter withError: The error object (if any) or `nil`.
    fileprivate func endNavigation(withError error: Error?) {
        self.activity.stopAnimating()
        if let err = error {
            let alert = UIAlertController(title: "Error", message: err.localizedDescription, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "Ok", style: UIAlertAction.Style.default, handler: nil))
            self.present(alert, animated: true, completion: nil)
        }
    }
}
