# How to Add Events with Automatic Duplicate Checking

To ensure no duplicate events are added to the pool, use the provided script:

## Usage

1. Open a terminal in the `src/data` directory.
2. Run the following command, replacing the JSON with your new event:

```
node add-event.cjs '{
  "year": "2024",
  "title": "Sample Event Title",
  "description": "A description of the event, at least 10 characters.",
  "explanation": "A longer explanation of the event, at least 20 characters."
}'
```

- If the event is a duplicate (same year, title, and description as an existing event), it will NOT be added.
- If required fields are missing or too short, the script will show an error.
- If the event is unique and valid, it will be added to `events.json`.

## Batch Addition
For batch imports, use this script's logic to check each event before adding.

## Requirements
- Node.js v22+ (uses native fetch in other scripts)
- Run from the `src/data` directory for correct file paths.

---

This workflow ensures all new events are automatically checked for duplicates before being added to the main pool.
