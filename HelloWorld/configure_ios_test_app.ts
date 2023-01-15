exports.run = function () {
  const childProcess = require("child_process");
  const path = require("path");

  const expectedProjectPath = path.resolve(
    __dirname,
    "../apps/ios/LwcTestApp/LwcTestApp.xcodeproj"
  );

  const expectedCompiledAppPath = path.resolve(
    __dirname,
    "../apps/ios/LwcTestApp/build/Debug-iphonesimulator/LwcTestApp.app"
  );

  childProcess.execSync(
    `xcodebuild build -project ${expectedProjectPath} -configuration Debug -sdk iphonesimulator`,
    { stdio: ["ignore", "pipe", "pipe"] }
  );

  return expectedCompiledAppPath;
};
