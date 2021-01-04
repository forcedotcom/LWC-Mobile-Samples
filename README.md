**IMPORTANT!** Before running this sample Lightning Web Component project, you must configure it to use a Salesforce scratch org. If you're not familiar with this concept, we recommend completing the following trails. These trails demonstrate how to set up your development environment and configure a Lightning Web Component project with a Salesforce scratch org:

- [Quick Start: Lightning Web Components](https://trailhead.salesforce.com/content/learn/projects/quick-start-lightning-web-components?trail_id=build-lightning-web-components)
- [Set Up Your Lightning Web Components Developer Tools](https://trailhead.salesforce.com/content/learn/projects/set-up-your-lightning-web-components-developer-tools?trail_id=build-lightning-web-components)

### What's Included
- **HelloWorld**: This sample Lightning Web Component demonstrates how to preview a component locally. It contains a basic Lightning Web Component, along with `mobile-apps.json` - a configuration file that defines how to preview this component in native mobile apps. For more information, use the `--confighelp` flag with the SFDX Preview command: `sfdx force:lightning:lwc:preview  --confighelp`

- **apps/ios/LwcTestApp**: A native iOS sample app that demonstrates how to preview a Lightning Web Component in iOS.

- **apps/android/LwcTestApp**: A native Android sample app that demonstrates how to preview a Lightning Web Component in Android.

### Using the Samples
After you've set up your environment, connect the `HelloWorld` sample project to your Salesforce scratch org and preview your component.

1. In VS Code, open the `HelloWorld` folder.


2. Configure the `HelloWorld` project to use a scratch org. If you already have a scratch org, skip to step 3. If you don't have a scratch org:
    1. In VS Code, press Command+Shift P.
    2. Type in `Scratch` and select `SFDX: Create a Default Scratch Org`.
    3. Follow the onscreen steps to create a scratch org. The recommended trails provide detailed information on these steps.
    4. Ensure that a success message appears in the VS Code Output window.


3. Authorize the `HelloWorld` project to use your scratch org.
    1. In VS Code, press Command+Shift P.
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
