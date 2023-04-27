# Set Up the Upload and Annotate Images Lightning Web Component (LWC)

Let your mobile workers add images to their work orders or service appointments. The mobile workers can then crop or draw on the image to emphasize certain areas. For example, the mobile worker can add an image of a part that must be fixed and draw an arrow to emphasize the broken area. You can set the size of the images in your configuration.

## Before You Begin

We recommend taking the [Quick Start: Lightning Web Components](https://trailhead.salesforce.com/content/learn/projects/quick-start-lightning-web-components) Trailhead to learn how to:

- Set up your Salesforce DX environment
- Set up Visual Studio Code
- Make sure your org is updated to version 244 and higher
- Authorize your org

## Set Up the LWC

1. Get the source code:
   1. From [LWC-Mobile-Samples](https://github.com/forcedotcom/LWC-Mobile-Samples), click **Code**.
   2. Clone the code or download the zip file.
2. Configure the LWC:
   1. Open the `UploadAndAnnotateImages` folder in Visual Studio Code.
   2. Under `force-app/main/default/lwc/image-capture/`, open the `imageCapture.js` file.
   3. In the `compressionOptions` dictionary, you can disable compression using the `compressionEnabled` parameter. If compression is enabled, you can control additional compression values.
      1. `resizeMode`: Determines how the image will be resized:
         - `fill` (default): The image is resized to fill the target dimension.
         - `contain`: The image keeps the original ratio between its width and height and is resized accordingly to fit inside the given `targetWidth` and `targetHeight`.
         - `none`: The image isn't resized and retains its original dimension.
      2. `resizeStrategy`: Determines how to resize the image. If `resizeMode` is set to `none` this flag is ignored.
         - `reduce`: Only resize if the image is larger than the target size.
         - `enlarge`: Only resize if the image is smaller than the target size.
         - `always` (default): Always resize the image to the target size regardless of the original image dimensions.
      3. `targetWidth`: The target width when resizing an image. If omitted, defaults to the original image width. If `resizeMode` is set to `none` this flag is ignored.
      4. `targetHeight`: The target height when resizing an image. If omitted, defaults to the original image height. If `resizeMode` is set to `none` this flag is ignored.
      5. `compressionQuality`: A number between 0-1 that determines the compression quality. If omitted, the browser/webview picks a default value as it sees fit. Note that this parameter is considered as a suggested compression quality, however the browser/webview can choose to override this value if it deems it necessary.
      6. `imageSmoothingEnabled`: Determines whether scaled images are smoothed or not. Defaults to `true`.
      7. `preserveTransparency`: Determines whether the transparency info of the input image (if any) should be preserved or not. Defaults to `true`. If the input image is a GIF/PNG and this flag is set to true the output image is a PNG. For all other cases, the output is a JPEG.
      8. `backgroundColor`: Defines a CSS color as described [here](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value). Defaults to white. When `preserveTransparency` is set to `false`, the output image's background is set to this color before the input image is resized and drawn on top.
3. Authorize your org and deploy the code to your org. See [Quick Start: Lightning Web Components](https://trailhead.salesforce.com/content/learn/projects/quick-start-lightning-web-components).
4. Grant access to the LWC's users.
   1. From Setup, in the Quick Find box, enter `Users`, and then select **Profiles**.
   2. Open the required profile.
   3. Under Enabled Apex Class Access, click **Edit** and add ImageCaptureController.
   4. Give the users access to the records you want them to see.
5. Connect the LWC to a quick action on any object that's supported by a [ContentDocumentLink](https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_contentdocumentlink.htm#:~:text=Account%2C%20Accreditation%2C%20ActivationTarget,WorkType%2C%20WorkTypeGroup%2C%20WorkTypeGroupMember) object. See [Create Quick Actions for the Field Service Mobile App](https://help.salesforce.com/s/articleView?id=sf.mfs_quick_actions.htm&type=5).
   1. For Action Type, select **Lightning Web Components**.
   2. For Lightning Web Component, select **c:imageCapture**.
