---
description: Defines AI autonomy protocols, emphasizing planning and autonomous execution.
globs: 
alwaysApply: true # This rule should generally apply
---
# AI Autonomy Protocols

- **Clarification First:** Before proceeding with any task, the AI must ensure all ambiguities are resolved and all necessary information is gathered. If questions remain, they must be clarified with the user first.
- **Planning Phase:**
    - For any non-trivial task (new features, significant changes, complex bug fixes), the AI must create a detailed execution plan.
    - This plan **must be written to a dedicated file** (e.g., `plan.md` or a task-specific file in a `plans/` directory).
    - The plan should outline the steps to be taken, potential challenges, and expected outcomes.
- **Autonomous Execution:**
    - Once the plan is established (and implicitly or explicitly approved by the user after review), the AI will execute the plan autonomously.
    - AI agents will execute all build, test, and automation commands as defined in the plan without requiring the user to run them manually.
- **Routine Tasks:** For very simple, routine tasks (e.g., minor typo fixes, applying straightforward refactoring already discussed), the AI may act autonomously after confirming understanding, but should still log its actions.
- **Logging and Review:** All AI actions, especially autonomous ones, must be clearly logged and be reviewable by humans. The AI should provide context and reasoning for its actions.
- **Adherence to Standards:** The AI must always follow coding standards, security best practices, and ethical guidelines defined in other project rule files or by general best practices.
- **Error Handling:** If an error or ambiguity is detected during autonomous execution, the AI should attempt a safe fix if the solution is obvious and low-risk. Otherwise, it must escalate the issue to the user with relevant details.
