---
description: Guidelines for using Nix shell in this project.
globs: 
alwaysApply: true # These rules should always apply when working with Nix.
---

# Nix Shell Usage Protocols

## General Principle
All development, build, test, and script execution tasks **must** be performed within the project's `nix-shell` environment to ensure consistency and reproducibility.

## Entering the Shell
To enter the development environment, use:
```sh
nix-shell
```
Once inside the shell, you can use the custom functions defined in `shell.nix` directly.

## Running Specific Commands/Functions via `--run`
If you need to run a single custom function or command from `shell.nix` without entering an interactive shell session, use the `nix-shell --run "your_function_name"` syntax.

### Key Project Operations (using custom shell functions)
Your `shell.nix` provides several custom functions. For autonomous operations, the following are prioritized:

- **Full Rebuild and Startup:** This is the primary command for ensuring a clean environment and starting all services. It includes steps similar to `quick-startup`.
  ```sh
  nix-shell --run "rebuild-all"
  ```
- **Stopping All Services and Cleaning:** For a complete stop and cleanup.
  ```sh
  nix-shell --run "close-kill-clean-all"
  ```
- **Linting and Fixing:** To maintain code quality.
  ```sh
  nix-shell --run "lint-fix"
  ```
- **Running Tests:**
  ```sh
  nix-shell --run "pytest" 
  # To pass arguments to your pytest function:
  # nix-shell --run "pytest --your-pytest-args"
  ```

### Other Useful Functions
While the above are key for autonomous workflows, other functions like `quick-startup` (for a faster start if a full rebuild isn't needed), `clean-all`, `clean-caches`, and `clean-frontend` are also available.

Refer to the `shellHook` in your `shell.nix` for a full list of available custom functions and their descriptions.

## Important Notes
- Ensure your `shell.nix` file is kept up-to-date with all necessary dependencies and custom functions.
- If you encounter issues, first ensure you are operating within the `nix-shell`.
- For tasks not covered by a custom function, you can still run standard commands (e.g., `black backend`, `pylint backend`) within the `nix-shell`, or via `nix-shell --run "your_command"`.
