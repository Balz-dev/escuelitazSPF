---
name: test-consistency-guardian
description: Guía al agente para auditar automáticamente y mantener sincronizadas las pruebas después de cualquier refactorización o adición de código.
---
# Test Consistency Guardian

This skill enforces that the test suite remains consistent, non-flaky, and structurally aligned with the actual implementation across the codebase.

## 🛡️ Core Rules
1. **Always Verify Impact**: Whenever a feature, entity, repository, or service is added or refactored, you MUST automatically locate its associated test files using `find_by_name` and verify they still compile and accurately represent the changes.
2. **Never Leave Broken Tests**: You must always test the affected components (e.g., `npx vitest run src/path/to/affected.test.ts`) immediately after your work. If you introduce a change that breaks a test mock, interface, or logic, proactively explain it to the user and fix it.
3. **Keep Architectures & Mocks Synchronized**: Ensure that `vi.mock()` factory outputs perfectly match the interfaces they are mocking to avoid 'Cannot read properties of undefined' runtime issues on mocks. Use `vi.hoisted()` when sharing variables inside `vi.mock()`.
4. **Clean Testing Patterns**: Prevent duplication of test files (e.g., having both `__tests__/foo.test.ts` and `foo.test.ts`). Consolidate them intelligently. Ensure that actions triggering React state changes are always properly wrapped in `act(...)` from `@testing-library/react`.

## 🧪 Quick Alignment Workflow
Whenever the user asks you to align tests or fix a test suite:
1. **Gain Context first**: Search for recent modifications in the domain or layer architecture.
2. **Capture Full Status**: Run `npx vitest run > test_results.txt 2>&1` behind the scenes to capture the current state.
3. **Diagnose Failures deeply**: Diagnose the actual failing reasons BEFORE rushing to change files (Are mocks hoisted properly? Are server-only functions like `cookies()` mocked correctly using `next/headers`? Are there duplications?).
4. **Apply Precise Fixes**: Use `multi_replace_file_content` block-replacements for modifying tests safely. 
5. **Verify**: Always finish by resolving all errors until the battery is fully green.
