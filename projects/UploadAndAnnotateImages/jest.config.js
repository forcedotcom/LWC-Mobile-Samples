const { jestConfig } = require("@salesforce/sfdx-lwc-jest/config");

module.exports = {
  ...jestConfig,
  modulePathIgnorePatterns: ["<rootDir>/.localdevserver"],
  setupFiles: ["jest-canvas-mock"],
  moduleNameMapper: {
    "^lightning/mediaUtils$":
      "<rootDir>/force-app/test/jest-mocks/mediaUtils/mediaUtils"
  }
};
