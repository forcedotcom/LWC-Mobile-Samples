exports.run = function () {
  const childProcess = require("child_process");
  const path = require("path");

  const expectedProjectPath = path.resolve(
    __dirname,
    "../apps/android/LwcTestApp"
  );

  const expectedCompiledAppPath = path.resolve(
    __dirname,
    "../apps/android/LwcTestApp/app/build/outputs/apk/debug/app-debug.apk"
  );

  const compileCommand =
    process.platform === "win32" ? "gradlew.bat build" : "./gradlew build";

  childProcess.execSync(
    `pushd ${expectedProjectPath} && ${compileCommand} && popd`,
    {
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  return expectedCompiledAppPath;
};
