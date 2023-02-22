# nestjs-prisma-pagination

## Description

A tool for easily generate pagination query for prisma

## Installation

```bash
npm i nestjs-prisma-pagination
```

or

```bash
yarn add nestjs-prisma-pagination
```

## Usage

To generate a query object for any prisma **findMany** clause, you can just do this:

```ts
import { paginate } from 'nestjs-prisma-pagination';

// Generate the query with `paginate` function
const query = paginate(
  {
    page: 1,
    limit: 10,
    from: '2023-01-01T00:00:00.000Z',
    to: '2023-12-31T22:59:59.000Z',
    search: 'foo',
  },
  {
    dateAttr: 'at',
    enabled: false,
    includes: ['post', 'user.agent.auth'],
    search: ['fullname', 'reference'],
    orderBy: { fullname: 'asc' },
  },
);

// Use your query in any findMany clause
const result = await prisma.user.findMany(query);
```

In this example, the value return by query is

```ts
{
  "where": {
    "OR": [
      {
        "fullname": {
          "contains": "foo",
          "mode": "insensitive"
        }
      },
      {
        "reference": {
          "contains": "foo",
          "mode": "insensitive"
        }
      }
    ],
    "at": {
      "gte": "2022-12-31T23:00:00.000Z",
      "lte": "2023-12-31T22:59:59.000Z"
    }
  },
  "take": 10,
  "skip": 0,
  "orderBy": {
    "fullname": "asc"
  },
  "include": {
    "post": true,
    "user": {
      "include": {
        "agent": {
          "include": {
            "auth": true
          }
        }
      }
    }
  }
}
```

### **paginate([args], [options])**

**Parameters**

- `args`: `<PaginationArgs>`
- `options`: `<PaginationOptions>`

**PaginationArgs**

```ts
interface PaginationArgs {
  page?: number; // The number of the page you want to retrieve (start counting with 1)
  limit?: number; // The maximum number of rows you want to take
  search?: string; // The value you want to search in your table (string | number | enum)
  from?: string; // ISOString value that indicates the starting date for the query
  to?: string; // ISOString value that indicates the end date for the query
}
```

**PaginationOptions**

```ts
interface PaginationOptions {
  includes?: string[];
  search?: string[];
  equals?: string[];
  enums?: string[];
  orderBy?: Record<string, 'asc' | 'desc'>;
  enabled?: boolean;
  dateAttr?: string;
}
```
