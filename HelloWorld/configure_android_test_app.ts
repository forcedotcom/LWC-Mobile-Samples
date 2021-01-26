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

  const androidHome = process.platform === "win32" ? "%ANDROID_HOME%" : "$ANDROID_HOME";
  const sdkmanager = path.join(androidHome, "tools", "bin", "sdkmanager");

  // Allow SDKManager to determine all licenses that have not been accepted
  // and then accept them all by piping YES into STDIN of SDKManager.
  let acceptAllLicensesCommand = `yes | ${sdkmanager} --licenses`;
  if (process.platform === "win32") {
    // On Windows things are more complicated. There seems to be an issue
    // with the use of BufferedReader in Java and piping YES into STDIN.
    // The workaround is to create a temporary file with a bunch of YES
    // in it, then feed that file to SDKManager and then delete that file.
    //
    // The format of the temporary file is very important. The file should have
    // the letter y per line with no leading/trailing spaces, and the file must
    // not end with any blank lines or spaces.
    const yesFileCommand =
      `CMD /Q /C "FOR /L %G IN (1,1,49) DO (echo y)>>output-yes-file.txt" & echo|set /p="y">>output-yes-file.txt`;
    const acceptCommand = `${sdkmanager} --licenses < output-yes-file.txt`;
    const cleanupCommand = `DEL output-yes-file.txt`;
    acceptAllLicensesCommand = `${yesFileCommand} & ${acceptCommand} & ${cleanupCommand}`;
  }
  childProcess.execSync(acceptAllLicensesCommand, { stdio: ["ignore", "pipe", "pipe"] });

  const compileCommand =
    process.platform === "win32" ? "gradlew.bat build" : "./gradlew build";

  childProcess
    .execSync(`pushd ${expectedProjectPath} && ${compileCommand} && popd`, {
      stdio: ["ignore", "pipe", "pipe"]
    });

  return expectedCompiledAppPath;
};
