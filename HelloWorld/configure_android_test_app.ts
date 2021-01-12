import childProcess from "child_process";
import path from "path";

exports.run = function () {
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

  const result = childProcess
    .execSync(`pushd ${expectedProjectPath} && ${compileCommand} && popd`, {
      stdio: ["ignore", "pipe", "ignore"]
    })
    .toString();

  return expectedCompiledAppPath;
};
