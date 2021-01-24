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

  const result = childProcess
    .execSync(
      `xcodebuild build CODE_SIGNING_ALLOWED=NO -project ${expectedProjectPath} -configuration Debug -sdk iphonesimulator`,
      { stdio: ["ignore", "pipe", "ignore"] }
    )
    .toString();

  return expectedCompiledAppPath;
};
