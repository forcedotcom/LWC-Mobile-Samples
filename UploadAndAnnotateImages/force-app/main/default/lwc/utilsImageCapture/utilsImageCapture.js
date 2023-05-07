export * from "./cropper.esm.js";

export const Shapes = Object.freeze({
  Rectangle: Symbol("Rectangle"),
  Oval: Symbol("Oval"),
  Line: Symbol("Line"),
  Free: Symbol("Free"),
  Text: Symbol("Text")
});

export const Colors = Object.freeze({
  Red: Symbol("#EA001E"),
  Green: Symbol("#2E844A"),
  White: Symbol("#FFFFFF"),
  Black: Symbol("#000000")
});

export const ToastTypes = Object.freeze({
  Success: Symbol("Success"),
  Error: Symbol("Error"),
  Warning: Symbol("Warning")
});

const DEBUG_LOGS = false;
export const IMAGE_EXT = "jpeg";
export const IMAGE_MIME_TYPE = "image/" + IMAGE_EXT;

export function log(msg) {
  console.log(`[${new Date().toJSON()}] - ${msg}`);
}

export function debug(msg) {
  if (DEBUG_LOGS) {
    log(`[DEBUG] - ${msg}`);
  }
}

export function isNullOrEmpty(str) {
  return str == null || str === "";
}

export function isRunningOnAndroid() {
  return /chrome|chromium|crios/i.test(window.navigator.userAgent);
}

export function getComputedPropertyFloat(element, property) {
  return parseFloat(
    getComputedStyle(element).getPropertyValue(property).replace("px", "")
  );
}

export function getComputedHeight(element) {
  return getComputedPropertyFloat(element, "height");
}

export function getComputedWidth(element) {
  return getComputedPropertyFloat(element, "width");
}

export function getComputedTop(element) {
  return getComputedPropertyFloat(element, "top");
}

export function getComputedLeft(element) {
  return getComputedPropertyFloat(element, "left");
}

export function getNetWidth(element) {
  const totalWidth = element.offsetWidth;

  const leftPadding = getComputedPropertyFloat(element, "padding-left");
  const rightPadding = getComputedPropertyFloat(element, "padding-right");
  const horizontalPadding = leftPadding + rightPadding;

  const leftBorder = getComputedPropertyFloat(element, "border-left-width");
  const rightBorder = getComputedPropertyFloat(element, "border-right-width");
  const horizontalBorder = leftBorder + rightBorder;

  return totalWidth - horizontalPadding - horizontalBorder;
}

export function dataURLtoFile(dataUrl, fileName) {
  let fileBlob = dataURLtoBlob(dataUrl);
  return new File([fileBlob], fileName, {
    type: fileBlob.type,
    lastModified: new Date().getTime()
  });
}

function dataURLtoBlob(dataURL) {
  let arr = dataURL.split(",");
  let mime = arr[0].match(/:(.*?);/)[1];
  let bstr = window.atob(arr[1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
