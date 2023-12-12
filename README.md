# Sample Lightning Web Components Projects for Mobile
Welcome to the Mobile samples repo. You can browse the samples under the [projects](./projects) folder.

## Contribution Guidelines

### Contributing

1. Familiarize yourself with the codebase.
1. Create your standalone SFDX project and add all of your code to it.
1. Fork this repository.
1. Copy your SFDX project into `projects` folder in your fork.
1. Modify your project and align it with the requirements of this monorepo (follow the example of any of the existing projects):
    1. Update the `name` and `description` in your `package.json` to something meaningful.
    1. Ensure that your `dependencies` and `devDependencies` are not too old. They should be same as other projects in this repo or newer.
    1. `DO NOT` include a `package-lock.json` file. We use Yarn in this repo. After copying over your project, delete its `package-lock.json` and `node_modules` and then run `yarn install` at the root of the repo. This will update the existing `yarn.lock` file in the repo and generate a new `node_modules` for your project.
    1. Ensure that running `yarn precommit` at the root of the repo passes all of the checks and address any failures.
1. Ensure that you've set up GPG signing to sign your commits.
1. Once ready, send us a pull request. We'll review your code, suggest any changes needed, and merge it in when ready.

### Branches

- We work directly in `main`. This means that every PR that goes in `main` should be self contained and complete. For feature work that is done via multiple PRs, please create a feature branch in your fork first and once all of the work is done then create a PR to `main` for review.

### Pull Requests

- This repo is open to public so `DO NOT` include internal info in PRs (such as GUS work item number) and in your code. 
