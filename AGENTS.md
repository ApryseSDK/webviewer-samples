# Agent Instructions

## Repository overview

This repository contains a collection of samples designed to demonstrate the capabilities of the Apryse WebViewer SDK. Each folder in this repository contains a sample project that showcases a specific feature or functionality of the WebViewer SDK.

Each sample is designed to be as minimal as possible, focusing on a single feature or functionality. This allows developers to easily understand and integrate the desired feature into their own projects.

## Repository structure

This repository is a monorepo managed by Lerna. The lerna configuration file is located at `lerna.json`. Lerna is used to manage the dependencies and versioning of the sample projects in this repository.

Each sample is a standalone project that can be run independently. Users are expected to clone the repository and run the samples locally to explore the features of the WebViewer SDK.

Each sample may be in a different language, framework, build system, etc. Users should refer to the README file in each sample folder for specific instructions on how to run that sample.

## General Coding Guidance

- Treat each folder in this project as a standalone project. When working on a specific sample, focus only on the files within that folder.
- When working on a specific sample, use the general coding style and conventions of that sample. Do not introduce new coding styles or conventions that are not already present in the sample.
- Keep edits scoped to the requested behavior. Do not reformat unrelated files or make opportunistic cleanup unless it is necessary to complete the change safely.
- Code should be written in a clear and concise manner, following best practices for readability and maintainability.

## Adding new samples

If you are adding a new sample to the repository, please follow these guidelines:

- Create a new folder for the sample in the root of the repository. The folder name should be descriptive of the feature or functionality being demonstrated.
- Include a README file in the sample folder that provides instructions on how to run the sample, as well as any necessary setup or configuration steps.
- Ensure that the sample is self-contained and does not rely on any external dependencies or configurations that are not included in the sample folder.
- Follow the general coding guidance outlined above when creating the sample.
- Ensure the sample is added to `lerna.json`
- Any files or folders that should be ignored by Git should be added to the `.gitignore` file in the root of the repository or in the sample folder as appropriate.

## Pull Request Guidelines

- Keep pull requests focused and reasonably small. We aim for pull requests to be less than 500 LOC.
- PR descriptions should explain what changed and why.
- Include the validation performed.
- Do not mix unrelated refactors with feature or bug fix work.

## Additional resources

- The main Apryse WebViewer SDK documentation can be found at [https://docs.apryse.com/web/guides](https://docs.apryse.com/web/guides)
- The NPM package for the Apryse WebViewer SDK can be found at [https://www.npmjs.com/package/@pdftron/webviewer](https://www.npmjs.com/package/@pdftron/webviewer)
