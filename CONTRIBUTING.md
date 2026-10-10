## Contributing to Prism2D.js

First of all, thank you for your interest in contributing to Prism2D.js!

Prism2D.js is an open-source JavaScript 2D game engine, and contributions from the community can help improve its quality, stability, documentation, and features.

This guide explains how to contribute, report bugs, suggest features, submit changes, and collaborate with the project owner and other contributors.

By participating in this project, you agree to follow these guidelines and help maintain a respectful, constructive, and professional community.

## Table of Contents

- **Getting Started** (#getting-started)
- **Ways to Contribute** (#ways-to-contribute)
- **Reporting Bugs** (#reporting-bugs)
- **Suggesting New Features** (#suggesting-new-features)
- **Working on Changes** (#working-on-changes)
- **Forks and Branches** (#forks-and-branches)
- **Testing Your Changes** (#testing-your-changes)
- **Submitting a Pull Request** (#submitting-a-pull-request)
- **Code Review and Approval** (#code-review-and-approval)
- **Communication and Community Respect** (#communication-and-community-respect)
- **Project Owner and Maintainer Responsibilities** (#project-owner-and-maintainer-responsibilities)
- **Final Notes** (#final-notes)

## Getting Started

Before contributing, take some time to explore the repository and understand the project.

1. Read the project's "README.md" to learn about Prism2D.js.
2. Review the existing source code and documentation.
3. Check existing GitHub Issues to see whether the problem or idea has already been discussed.
4. Read this guide before submitting changes.
5. Join the official Prism2D.js Discord community to ask questions, discuss ideas, and connect with other contributors.

If you are unsure where to start, feel free to ask questions in the appropriate Discord channel or open a GitHub Issue when necessary.

You do not need to be an official repository collaborator to contribute.

Ways to Contribute

There are several ways to help improve Prism2D.js:

- Fix bugs and improve stability.
- Suggest new features and improvements.
- Improve documentation and examples.
- Improve code readability and maintainability.
- Help investigate reported problems.
- Review existing issues and contribute to technical discussions.

All contributions are appreciated, but changes must follow the project's guidelines and review process.

## Reporting Bugs

If you discover a bug, please report it through GitHub Issues whenever appropriate.

A useful bug report should include:

- A clear and descriptive title.
- A description of the problem.
- Steps to reproduce the issue.
- The expected behavior.
- The actual behavior.
- Relevant error messages or screenshots, when useful.
- Any additional information that may help investigate the problem.

Before opening a new Issue, check whether someone has already reported the same problem.

**Simple Bugs**

For straightforward bugs, contributors may investigate and prepare a fix without receiving prior approval for the implementation approach.

Examples include:

- A typo in an error message.
- An obvious incorrect condition.
- A small, isolated logic error.
- A minor documentation mistake.

If the change is small and well understood, you may submit a Pull Request directly.

**Complex Bugs**

Complex bugs must be discussed before implementation begins.

Examples include:

- Problems affecting core engine architecture.
- Bugs involving several interconnected systems.
- Issues requiring significant changes to existing behavior.
- Fixes that may introduce compatibility problems or regressions.

For complex bugs, create a GitHub Issue describing the problem, its impact, and your proposed approach.

Wait for approval from the project owner or an authorized maintainer before beginning implementation.

Contributors may initially judge whether a bug is simple or complex, but the project owner or an authorized maintainer may reclassify it and request discussion before work continues.

Suggesting New Features

New features can significantly affect the engine's architecture, API, compatibility, and long-term direction. For this reason, feature proposals must be discussed and approved before implementation begins.

To propose a feature:

1. Open a GitHub Issue describing the idea, or discuss it in the appropriate Discord channel.
2. Explain the problem the feature would solve.
3. Describe the proposed behavior and potential benefits.
4. Include examples or use cases when helpful.
5. Wait for approval from the project owner or an authorized maintainer before implementing it.

The project owner may request clarification, suggest a different approach, postpone the proposal, or decline it if it does not fit the project's goals.

Please do not begin implementing a new feature before receiving approval.

This process helps prevent duplicated work, incompatible designs, unnecessary complexity, and features that do not align with the project's direction.

## Working on Changes

Before starting work, make sure you understand the scope of the task and any relevant discussion.

When making changes:

- Keep your changes focused on the issue or approved feature.
- Avoid unrelated modifications in the same Pull Request.
- Follow the existing coding style and conventions.
- Use clear names and write maintainable code.
- Avoid introducing unnecessary dependencies.
- Consider compatibility with existing functionality.
- Update relevant documentation when your changes affect public behavior or usage.

If you discover that the task requires a substantially different approach than originally discussed, stop and ask for feedback before proceeding.

## Forks and Branches

Contributors are encouraged to use the standard fork-based GitHub workflow.

A Fork is a copy of the repository under your own GitHub account. It allows you to work independently without needing direct write access to the original repository.

A typical workflow is:

1. Fork the Prism2D.js repository.
2. Clone your fork to your local machine.
3. Create a separate branch for your changes.
4. Implement and test your changes.
5. Push your branch to your fork.
6. Open a Pull Request against the original repository.

Use descriptive branch names when possible, such as:

- "fix/collision-detection"
- "docs/installation-guide"
- "feature/approved-feature-name"

You do not need to request direct repository access to contribute through a Fork and Pull Request.

Testing Your Changes

Testing is important because changes to a game engine can affect other systems and existing projects.

Contributors should test their changes whenever reasonably possible.

Depending on the change, this may include:

- Running the existing test suite, if available.
- Reproducing the original bug before applying the fix.
- Verifying that the problem is resolved afterward.
- Checking that existing functionality still works.
- Testing relevant examples or demos.
- Adding or updating tests when appropriate.

When You Cannot Add or Run Tests

We understand that not every contributor has the experience or resources to write automated tests.

For small bug fixes, a Pull Request may still be submitted without new tests if the contributor explains the situation and provides any available verification.

For complex fixes and substantial changes, stronger testing is expected. Discuss any testing limitations with the project owner or an authorized maintainer.

Never claim that a change has been tested if it has not been tested.

Submitting a Pull Request

When your changes are ready, open a Pull Request on GitHub against the original Prism2D.js repository.

Your Pull Request should include:

- A clear title.
- A description of what changed.
- The problem being solved or the approved feature being implemented.
- Relevant Issue links, when applicable.
- Tests performed and their results.
- Any known limitations or testing that remains incomplete.

Keep Pull Requests focused and reasonably sized whenever possible.

Before Submitting

Make sure that:

- Your changes follow the relevant contribution guidelines.
- Required prior approval was obtained for new features and complex bug fixes.
- You have tested your changes as thoroughly as reasonably possible.
- You have reviewed your own changes for mistakes.
- You have not included unrelated changes or unnecessary files.

Submitting a Pull Request does not guarantee that it will be accepted.

The project owner or an authorized maintainer will review the proposed changes before deciding whether they can be merged.

Code Review and Approval

All Pull Requests are subject to review.

During the review process, the project owner or an authorized maintainer may:

- Approve the changes.
- Request modifications.
- Ask questions or request clarification.
- Suggest an alternative implementation.
- Close the Pull Request if the changes are unsuitable for the project.

Contributors are expected to respond constructively to review feedback and make reasonable requested changes.

Technical disagreements should be handled through respectful discussion, with the project's stability, maintainability, and long-term goals in mind.

Review Times

Prism2D.js is maintained alongside other commitments, and the project owner may not always be available.

There is no guaranteed review or response time for Issues, feature proposals, messages, or Pull Requests.

Please be patient and avoid repeatedly demanding immediate responses. Contributors may continue working on other tasks while waiting for feedback, provided the work does not depend on pending approval.

Communication and Community Respect

A healthy open-source project depends on respectful communication and cooperation.

These expectations apply to interactions across the project's Discord server, GitHub Issues, Pull Requests, and other official project spaces.

All contributors are expected to:

- Communicate respectfully and professionally with the project owner, maintainers, and other community members.
- Discuss disagreements calmly and focus on technical reasoning.
- Provide constructive criticism instead of personal attacks.
- Respect the time and availability of the project owner and other contributors.
- Follow the project's guidelines and decisions regarding accepted changes.
- Avoid harassment, insults, threats, discrimination, and deliberate disruption.
- Help maintain an environment where people can ask questions, learn, and collaborate.

Constructive disagreement is welcome. Contributors may question technical decisions, suggest alternatives, and explain why they believe another approach would work better.

However, disagreements must remain respectful and focused on the project rather than becoming personal conflicts.

Repeated or serious violations of these expectations may result in moderation action, including removal from the Discord community or other appropriate restrictions.

Project Owner and Maintainer Responsibilities

The project owner is responsible for the overall direction, quality, and long-term development of Prism2D.js.

The project owner retains final authority over:

- The project's direction and priorities.
- Feature acceptance and implementation approval.
- Decisions about the project's architecture and public APIs.
- Pull Request acceptance and merging, subject to repository permissions.
- The contribution guidelines and project policies.

Authorized maintainers may assist with reviewing code, discussing technical proposals, investigating bugs, and helping coordinate contributions.

Maintainer permissions and responsibilities may be assigned as the project grows.

Contributors should not assume they have permission to approve new features, merge changes, or make decisions on behalf of the project unless that authority has been explicitly granted.

Final Notes

Thank you for taking the time to contribute to Prism2D.js.

Every useful contribution, whether it is a bug fix, a documentation improvement, or an approved new feature, can help make the engine better.

By working together, communicating respectfully, and following a clear review process, we can build a more reliable and useful open-source project.

If you have questions about contributing, feel free to reach out through the official Prism2D.js Discord community or the appropriate GitHub discussion channel.

Thank you for being part of Prism2D.js!
