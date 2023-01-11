export * from './cropper.esm.js';

export const Shapes = Object.freeze({
    Rectangle: Symbol("Rectangle"),
    Oval: Symbol("Oval"),
    Line: Symbol("Line"),
    Free: Symbol("Free"),
});

export const Colors = Object.freeze({
    Red: Symbol("#EA001E"),
    Green: Symbol("#45C65A"),
    White: Symbol("#FFFFFF"),
    Black: Symbol("#000000"),
});

export const ToastTypes = Object.freeze({
    Success: Symbol("Success"),
    Error: Symbol("Error"),
    Warning: Symbol("Warning"),
});

export const IMAGE_EXT = "jpeg";
export const IMAGE_MIME_TYPE = "image/" + IMAGE_EXT;

export function log(msg) {
    console.log(`[${new Date().toJSON()}] - ${msg}`);
}

export function isNullOrEmpty(str) {
    return str == null || str === "";
}

export function waitMillis(ms) {
    return new Promise((resolve) => {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            resolve(ms)
        }, ms )
    });
}
