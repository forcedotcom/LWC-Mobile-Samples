# Samples for Previewing Lightning Web Components on Mobile
Welcome to the Mobile Preview samples repo. Here, you can find sample projects and apps that let you preview Lightning web components several ways:
- In your desktop browser
- In the mobile browser of an iOS or Android virtual device
- In a native app running on an iOS or Android virtual device

**IMPORTANT!** Before running this sample Lightning Web Component project, you must configure it to use a scratch org. If you're not familiar with this concept, we recommend completing the following trails. These trails demonstrate how to set up your development environment and configure a Lightning Web Component project with a Salesforce scratch org:

- [Quick Start: Lightning Web Components](https://trailhead.salesforce.com/content/learn/projects/quick-start-lightning-web-components?trail_id=build-lightning-web-components)
- [Set Up Your Lightning Web Components Developer Tools](https://trailhead.salesforce.com/content/learn/projects/set-up-your-lightning-web-components-developer-tools?trail_id=build-lightning-web-components)

## What's Included

Samples in this repo include Lightning Web Component projects and native mobile apps. The native apps are configured to recognize and display a component running on a local server. 

### Lightning Web Component Projects

These samples define Lightning web components and demonstrate configurations for previewing them. 
<details>
    <summary>
        <b>HelloWorld</b> 
    </summary>
This sample Lightning Web Component project demonstrates how to preview locally. It contains a basic Lightning web component, along with <code>mobile-apps.json</code> - a configuration file that defines how to preview this component in native mobile apps. 

This file points to <code>configure_android_test_app.ts</code> and <code>configure_ios_test_app.ts</code> files. Together, these files demonstrate how you can 
   
   - Configure your apps to show up in the VSCode preview dialog boxes.
   - Define the optional <code>get_app_bundle</code> parameter. You can implement it to compile the app or perform any other setup steps.

For more information on <code>mobile-apps.json</code>, see 

- “Configuring a Native Mobile App to Host Previews” in [Preview Your Components from the Command Line](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.mobile_extensions_cli_commands)
- [Preview in Custom Mobile Apps](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.mobile_extensions_integrate_custom_app)

</details>

### Native Mobile Apps
These samples let you preview Lightning web components in standalone native apps.
<details>
    <summary>
        <b>apps/ios/LwcTestApp</b>
    </summary>
    
A sample app that you can use to preview a Lightning web component in a native iOS app.
</details>

<details>
    <summary>
        <strong>apps/android/LwcTestApp</strong>
    </summary>
    
A sample app that you can use to preview a Lightning web component in a native Android app.
</details>

## Previewing the Hello World Sample

After you've set up your environment, connect the `HelloWorld` sample project to your scratch org and preview your component. You can use the following instructions as a model for previewing other Lightning web components. 

1. In VS Code, open the `HelloWorld` folder.


2. Configure the `HelloWorld` project to use a scratch org. If you already have a scratch org, skip to step 3. If you don't have a scratch org:
    1. In VS Code, press Cmd+Shift+p (macOS) or Ctrl+Shift+p (Windows).
    2. Type in `Scratch` and select `SFDX: Create a Default Scratch Org`.
    3. Follow the onscreen steps to create a scratch org. The recommended trails provide detailed information on these steps.
    4. Ensure that a success message appears in the VS Code Output window.


3. Authorize the `HelloWorld` project to use your scratch org.
    1. In VS Code, press Cmd+Shift+p (macOS) or Ctrl+Shift+p (Windows).
    2. Type in `Authorize` and select `SFDX: Authorize an Org`.
    3. Follow the onscreen steps to log into your Salesforce Org with your credentials. The recommended trails provide detailed information on these steps.
    4. Ensure that a success message appears in the VS Code Output window.


4. Now that your `HelloWorld` project is connected to your scratch org, preview it locally.
    1. In VS Code, navigate to `force-app > main > default > lwc`.
    2. Right-click `helloWorld` and select `SFDX: Preview Component Locally`.
    3. Select whether you'd like to preview it in your desktop browser or on an iOS or Android device. 
    4. If you chose iOS/Android, either
    - - Select an available virtual device from the presented list (if one appears), or 
    - - Choose to create a virtual device.
    5. Indicate whether you'd like to preview the component on your mobile browser or in the provided native LWC Test App.

Your virtual device launches, and your component preview appears.

For full documentation, see [Preview Lightning Web Components on Mobile](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.mobile_extensions). 
