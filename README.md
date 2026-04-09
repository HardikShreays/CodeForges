# CodeForges — Online Code Evaluation and Judging System

> **Rishihood University | Academic Year 2025–26**  
> A scalable backend platform for automated code evaluation across multiple programming languages.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Module: Execution Engine](#module-execution-engine)
- [Design Patterns](#design-patterns)
- [SOLID Principles](#solid-principles)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Team](#team)

---

## Project Overview

CodeForges is a system-design project that simulates a **competitive programming judge** backend — similar to LeetCode or Codeforces. Users submit code in multiple languages, the system executes it against predefined test cases, and returns detailed results including:

- ✅ Correctness (pass/fail per test case)
- ⏱️ Runtime (milliseconds)
- 💾 Memory usage (megabytes)
- 🔴 Error type (Compilation Error, Runtime Error, TLE, MLE, Wrong Answer)

### Core Services

| Service | Description |
|---|---|
| **Submission Service** | Receives user submissions, enqueues them to the Job Queue, exposes status & results |
| **Execution Engine** | Runs code in isolated, sandboxed environments |
| **Problem Management Service** | Manages problem sets and test cases |
| **Result Processor** | Aggregates and stores evaluation results |

---

## Architecture

```
User Submission
      │
      ▼
Submission Service ──► Job Queue
                             │
                             ▼
                    Execution Engine
                    ┌──────────────────────────────┐
                    │  ExecutionEngine (Orchestrator)│
                    │         │                     │
                    │  LanguageExecutorFactory       │
                    │    ┌────┴─────┐               │
                    │  Python  Java  C++             │
                    │  Executor│Executor│Executor    │
                    │    └─────┴───────┘             │
                    │     BaseExecutor (Template)    │
                    └──────────────────────────────-─┘
                             │
                             ▼
                    Result Processor ──► Database
```

---

## Modules

### 1. Submission Service *(Owner: Hardik Shreyas)*

- Accepts user submissions via a simple API boundary (currently `SubmissionService.submit()` in TypeScript).
- Persists in-memory `SubmissionRecord`s with `QUEUED → RUNNING → COMPLETED/FAILED` states.
- Pushes work items into an in-memory **Job Queue** to simulate horizontal scaling with workers.
- Uses `ExecutionManager` (Singleton) to delegate execution to the core Execution Engine.
- Exposes `getStatus(submissionId)` and `getResult(submissionId)` to poll from a UI / API layer.

### 2. Execution Engine *(Owner: Syed Darain Qamar)*

This module is responsible for actually running code against test cases.

#### How it works

1. `ExecutionEngine.run(code, language, testCases)` is called
2. `LanguageExecutorFactory` resolves the correct executor for the given language
3. The executor (`PythonExecutor`, `JavaExecutor`, or `CPPExecutor`) runs the code via the **Template Method** pattern: `compile → run → validate`
4. Results are aggregated and returned as an `ExecutionResult`

### Supported Languages

| Language | Executor Class |
|---|---|
| `python` | `PythonExecutor` |
| `java` | `JavaExecutor` |
| `cpp` / `c++` | `CPPExecutor` |

### Execution Status Codes

| Status | Meaning |
|---|---|
| `ACCEPTED` | All test cases passed |
| `WRONG_ANSWER` | One or more test cases failed |
| `COMPILATION_ERROR` | Code failed to compile |
| `RUNTIME_ERROR` | Program crashed during execution |
| `TIME_LIMIT_EXCEEDED` | Execution exceeded time limit |
| `MEMORY_LIMIT_EXCEEDED` | Execution exceeded memory limit |

---

## Design Patterns

### 1. Factory Pattern — `LanguageExecutorFactory`
Creates the appropriate executor instance based on a language string. Uses a **registry map** for extensibility — new languages are added via `registerExecutor()` without modifying factory code.

```typescript
const factory = new LanguageExecutorFactory();
const executor = factory.getExecutor('python'); // Returns PythonExecutor
```

### 2. Template Method Pattern — `BaseExecutor`
Defines a fixed algorithm skeleton: `compile() → run() → validate()`. Subclasses override individual steps without changing the overall flow.

```typescript
// The template method (fixed order, cannot be overridden):
public execute(code: string, testCase: TestCase): TestCaseResult {
  const compilation = this.compile(code);   // hook — subclasses may override
  const runResult   = this.run(...);         // abstract — subclasses must implement
  const passed      = this.validate(...);    // hook — subclasses may override
}
```

### 3. Singleton Pattern *(ExecutionManager — Submission Service)*
Ensures only one instance of the configuration/execution manager exists.

### 4. Strategy Pattern *(EvaluationStrategy — Problem Management Service)*
Pluggable evaluation logic: exact match, tolerance-based, or custom checker — all interchangeable at runtime.

---

## SOLID Principles

| Principle | Where Applied |
|---|---|
| **SRP** — Single Responsibility | Each class does one thing: Factory creates, Engine orchestrates, Executors run |
| **OCP** — Open/Closed | Add languages via `registerExecutor()` — no existing code modified |
| **LSP** — Liskov Substitution | `PythonExecutor`, `JavaExecutor`, `CPPExecutor` are all substitutable for `BaseExecutor` |
| **ISP** — Interface Segregation | `ExecutorInterface` exposes only what consumers need |
| **DIP** — Dependency Inversion | `ExecutionEngine` depends on `ExecutorInterface`, not concrete classes; factory is injected via constructor |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (Node.js) |
| Runtime | ts-node |
| Testing | Custom test runner (`tests/run-all.ts`) |
| Build | TypeScript Compiler (`tsc`) |
| Version Control | GitHub |
| Diagramming | draw.io / PlantUML |

---

## Project Structure

```
CodeForges/
├── src/
│   ├── main.ts                          # Demo entry point
│   └── execution-engine/
│       ├── index.ts                     # Public API barrel export
│       ├── core/
│       │   └── ExecutionEngine.ts       # Main orchestrator class
│       ├── factory/
│       │   └── LanguageExecutorFactory.ts   # Factory Pattern
│       ├── templates/
│       │   └── BaseExecutor.ts          # Template Method Pattern (abstract)
│       ├── executors/
│       │   ├── PythonExecutor.ts        # Python implementation
│       │   ├── JavaExecutor.ts          # Java implementation
│       │   └── CPPExecutor.ts           # C++ implementation
│       └── types/
│           └── interfaces.ts            # Core TypeScript interfaces
├── tests/
│   ├── run-all.ts                       # Test runner
│   ├── engine.test.ts                   # ExecutionEngine tests
│   ├── executors.test.ts                # Per-executor tests
│   └── factory.test.ts                  # Factory tests
├── package.json
├── tsconfig.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm

### Installation

```bash
git clone https://github.com/HardikShreays/CodeForges.git
cd CodeForges
npm install
```

### Run the Demo

```bash
npm start
# or
npx ts-node src/main.ts
```

Expected output includes results for Python, Java, and C++ submissions run against sample test cases, plus error scenario demos.

### Build

```bash
npm run build
```

Compiled output goes to `dist/`.

---

## Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:factory      # LanguageExecutorFactory tests
npm run test:executors    # Per-language executor tests
npm run test:engine       # ExecutionEngine integration tests
```

---

## Team

| Name | Roll No | Role |
|---|---|---|
| **Hardik Shreyas** | 2401010178 | Team Leader / System Architect |
| **Syed Darain Qamar** | 2401010472 | Backend Engineer — Core Services (Execution Engine) |
| **Saman Iqbal Ansari** | 2401010405 | OOP & Design Patterns Lead |
| **Prateek Shukla** | 2401010342 | Database & Result Processor |
| **Balajee** | 2401010123 | Documentation & UML Diagrams Lead |

**Team Leader Contact:** hardik.shreyas2024@nst.rishihood.edu.in

---

> *Rishihood University | System Design Project | 2025–26*
