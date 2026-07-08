# SEO Audit AI Pro — Architecture Design Document

This document outlines the software engineering layers, folder mappings, and future extensibility blueprints for SEO Audit AI Pro.

## 1. System Layers Diagram

```text
       +---------------------------------------------+
       |                  CLIENT UI                  |
       |  React 19, Vite, Tailwind CSS, Lucide Icons |
       +----------------------+----------------------+
                              |
                     HTTPS GET/POST Requests
                              |
                              v
       +----------------------+----------------------+
       |                  EXPRESS API                |
       |     Server-Side Controllers & Routing       |
       +----------------------+----------------------+
                              |
            +-----------------+-----------------+
            |                                   |
            v                                   v
+-----------+-----------+           +-----------+-----------+
|      SEO SCRAPER      |           |      GEMINI AI SDK    |
|   Local RegEx Crawler |           |   gemini-3.5-flash    |
+-----------+-----------+           +-----------+-----------+
            |                                   |
            +-----------------+-----------------+
                              |
                              v
       +----------------------+----------------------+
       |                PERSISTENCE DB               |
       |    Node File System (JSON Report Vault)     |
       +---------------------------------------------+
```

## 2. Directory Map (Step 1 Mapping)

- `/backend/src/config`:Centralized environmental parameters loader.
- `/backend/src/controllers`: Request parsers and HTTP JSON formatters.
- `/backend/src/routes`: Express endpoints.
- `/backend/src/services/seoEngine.ts`: Fast local on-page crawler.
- `/backend/src/services/geminiService.ts`: Contextual LLM prompt pipeline.
- `/database/index.ts`: Persistent storage mapping JSON sheets.
- `/shared/types.ts`: TypeScript contract definitions.
- `/reports/`: Saved report files.
- `/exports/`: Downloadable spreadsheet outputs.
- `/logs/`: Diagnostic running traces.
