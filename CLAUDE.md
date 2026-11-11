@AGENTS.md

## Architecture Preferences

- Always use the **MVCS** (Model–View–Controller–Service) design pattern.
- Always use the **repository** design pattern for data access: repositories handle persistence and retrieval only, and services call them.
- **All business logic goes in the service layer.** Views only render, controllers only coordinate between views and services, and models and repositories contain no business rules.
