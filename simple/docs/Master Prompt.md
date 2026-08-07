
```text
You are a senior frontend engineer and frontend architect.

Build a React + TypeScript + Tailwind CSS application that allows users to transform a transaction JSON into a coded API payload and send it to an external API.

Main requirements:
1. User can paste and edit source transaction JSON.
2. User can paste and edit mapping JSON.
3. Both JSON inputs must be validated.
4. User clicks a button to generate final payload.
5. Final payload is displayed as formatted JSON.
6. User can copy final payload.
7. User can send final payload using POST request to http://ip/transaction.
8. Unmapped fields must be shown as warnings and excluded from payload.

Source transaction JSON shape:
{
  mainTransaction: {
    fraudMessageId: string;
    sysName: string;
    businessId: string;
    attrsList: Array<Record<string, string | string[]>>
  }
}

Mapping JSON shape:
Record<string, string>

Important mapping rule:
- mapping key is the output payload code
- mapping value is the exact source field name inside attrsList

Example mapping:
{
  "1000": "AcquireBankCode",
  "1001": "SrcNationalCode"
}

Example source attrsList item:
{
  "AcquireBankCode": "57",
  "SrcNationalCode": [
    "hash1",
    "hash2"
  ]
}

Expected transformed attrsList item:
{
  "1000": "57",
  "1001": [
    "hash1",
    "hash2"
  ]
}

Transformation rules:
1. output root fields must be copied from mainTransaction:
   - fraudMessageId
   - sysName
   - businessId

2. only mainTransaction.attrsList items must be transformed.

3. for each field in each attrsList item:
   - if field name exists in mapping values, replace field name with related mapping key
   - if field name does not exist in mapping values, skip it and create warning

4. preserve value types:
   - string stays string
   - string[] stays string[]

5. output payload shape:
{
  fraudMessageId: string;
  sysName: string;
  businessId: string;
  attrsList: Array<Record<string, string | string[]>>
}

Technical requirements:
- latest React
- TypeScript strict mode
- latest Tailwind CSS
- Vite
- clean modular architecture
- reusable JSON editor components
- validation utilities
- pure transformation engine
- warning panel
- payload preview with copy button
- API service using fetch
- API endpoint configurable
- loading/success/error states
- RTL-friendly Persian UI
- JSON/code blocks should be LTR
- unit tests using Vitest

Architecture:
src/
  components/
  features/
    transaction-payload-builder/
      components/
      hooks/
      services/
      types/
      utils/
  lib/
  styles/

Deliver implementation in phases:
1. setup and architecture
2. TypeScript types
3. JSON editor
4. validation utilities
5. mapping utilities
6. transformation engine
7. warning panel
8. payload preview
9. API submit service
10. main page
11. UX improvements
12. unit tests
13. refactor notes
```

