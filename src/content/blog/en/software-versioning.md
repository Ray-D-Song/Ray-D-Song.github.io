---
title: 'Detailed Explanation of npm Versioning and Version Control'
date: '2024-08-14'
cover: ''
tag: ['frontend', 'Other']
---

## Semantic Versioning
Recently, while splitting the company's MonoRepo repository and creating a new npm package, it was discovered that the company's previous version control was not very standardized.

npm follows [Semantic Versioning](https://semver.org/), which has the following structure:

`major.minor.patch`

The definitions of the three version numbers are:
* Major: incompatible changes
* Minor: backward-compatible feature additions
* Patch: backward-compatible bug fixes

Additionally, you can append a pre-release tag (connected by `-`) and build metadata (connected by `+`) after the patch version.
For example, `1.0.3-rc.1+exp.sha.5114f85` represents:
* Major version 1
* Minor version 0
* Patch version 3
* Pre-release tag rc.1
* Build metadata exp.sha.5114f85

## Pre-release Tags
Pre-release versions are essentially test versions and typically come in three types: `a`, `b`, `rc`, representing `alpha (preview)`, `beta (testing)`, and `release candidate (final testing)`, respectively.

A pre-release tag can be followed by a number to indicate the iteration of the pre-release version. For example, `-rc.1` denotes the first release candidate.

## Build Metadata
Build metadata is mainly used to track and manage different build versions, serving as internal conventions within a team without strict standards. However, it usually includes the following types:
* Timestamp, e.g., `1.0.0+20130313144700` indicates the build time as March 13, 2013, 14:47:00.
* Experimental build hash, e.g., `exp.sha.5114f85`, consisting of `exp` for experimental and `sha.5114f85` for a git commit hash. These components help locate the source code of the build.

## Notes for npm Packages
In addition to the above points, there are some conventions to consider.

### Build Metadata Does Not Affect Versions
Even if the build metadata differs, versions like `1.0.0+exp.sha.5114f85` and `1.0.0+exp.sha.7822af2` are considered the same version. Therefore, build metadata cannot be used to release a special version.

To provide a custom version for a specific client or project, it is best to use a pre-release tag, such as `1.0.0-customer.1`, which will be recognized as a new version.

### Initial Version for New Projects
The initial version for a new project should be `0.1.0`, not `0.0.1`, as the third digit represents the patch version from a semantic perspective.

### Version Ranges in package.json Dependencies
In `package.json`, dependencies can be controlled using `version ranges`.

* Patch releases: 1.0 or 1.0.x or ~1.0.4
* Minor versions: 1 or 1.x or ^1.0.4
* Major releases: * or x

For example:
```json
"dependencies": {
  "lodash": "^1.0.0"
}
```

With this configuration, if lodash releases version 1.1.0, npm will fetch this latest minor version.

> Since some open-source projects do not adhere to the above standards and introduce breaking changes in minor versions, it is recommended for JavaScript projects to lock versions after stable operation. 
