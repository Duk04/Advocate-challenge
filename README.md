# 🌲💼 Pinecone Advocate GraphQL Challenge - Complete Solution 🚀

## 📋 Overview

Welcome to the **Pinecone Advocate GraphQL Challenge** complete solution! 🌟

This project implements a comprehensive GraphQL API for task management with:

- 🛠️ **GraphQL Schema** - Complete type definitions and operations
- 🗄️ **MongoDB Integration** - Robust data persistence with Mongoose
- 🧪 **100% Test Coverage** - Comprehensive Jest test suite
- 🔒 **Input Validation** - Comprehensive validation and error handling
- 🛡️ **Authorization** - User-based task ownership and permissions

## ⚙️ Setup Instructions

### 1. **Install Dependencies**

```bash
# Using Yarn (recommended)
yarn install

# Or using npm
npm install
```

### 2. **Environment Configuration**

Copy the environment template and configure your MongoDB connection:

```bash
cp env.example .env
```

Edit `.env` and add your MongoDB connection string:

```env
MONGODB_URL=mongodb://localhost:27017/task-manager
```

**MongoDB Connection Examples:**
- **Local MongoDB**: `mongodb://localhost:27017/task-manager`
- **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/task-manager?retryWrites=true&w=majority`
- **MongoDB with Auth**: `mongodb://username:password@localhost:27017/task-manager`

### 3. **Run Tests**

Verify everything works with comprehensive test coverage:

```bash
# Run all tests with coverage
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests for CI
yarn test:ci
```

### 4. **Start Development Server**

```bash
yarn dev
```

The GraphQL server will be available at: `http://localhost:3000/api/graphql`

## 🚀 Implemented Features

### ✅ **Required Mutations**

#### 1. **addTask** - Create New Tasks
```graphql
mutation AddTask($input: AddTaskInput!) {
  addTask(input: $input) {
    success
    task {
      _id
      taskName
      description
      isDone
      priority
      tags
      userId
      createdAt
      updatedAt
    }
    message
  }
}
```

**Input Validation:**
- ✅ `taskName` - Required, unique per user, trimmed
- ✅ `description` - Required, minimum 10 characters, different from taskName
- ✅ `priority` - Required, range 1-5
- ✅ `tags` - Optional, maximum 5 items
- ✅ `userId` - Required, task owner

#### 2. **updateTask** - Update Existing Tasks
```graphql
mutation UpdateTask($input: UpdateTaskInput!) {
  updateTask(input: $input) {
    success
    task {
      _id
      taskName
      description
      isDone
      priority
      tags
      userId
      createdAt
      updatedAt
    }
    message
  }
}
```

**Authorization & Validation:**
- ✅ Only task owner can update
- ✅ All field validations from addTask
- ✅ Prevents duplicate task names per user
- ✅ Maintains data integrity

### ✅ **Required Queries**

#### 1. **getUserDoneTasksLists** - Get Completed Tasks
```graphql
query GetUserDoneTasks($userId: String!) {
  getUserDoneTasksLists(userId: $userId) {
    success
    tasks {
      _id
      taskName
      description
      isDone
      priority
      tags
      userId
      createdAt
      updatedAt
    }
    message
  }
}
```

**Features:**
- ✅ Returns only completed tasks (`isDone: true`)
- ✅ Sorted by most recently updated
- ✅ User-specific filtering
- ✅ Comprehensive error handling

## 🗄️ Database Schema

### Task Model
```typescript
interface ITask {
  _id: ObjectId;
  taskName: string;        // Required, unique per user
  description: string;     // Required, min 10 chars
  isDone: boolean;         // Default: false
  priority: number;        // Required, range 1-5
  tags: string[];          // Optional, max 5 items
  userId: string;          // Required, task owner
  createdAt: Date;         // Auto-generated
  updatedAt: Date;         // Auto-updated
}
```

**Database Indexes:**
- Compound index on `{taskName: 1, userId: 1}` for uniqueness
- Automatic timestamps for `createdAt` and `updatedAt`

## 🧪 Test Coverage

The test suite provides **100% coverage** with **40+ test cases**:

### Test Categories:
- ✅ **Success Scenarios** - All happy path operations
- ✅ **Validation Errors** - Input validation edge cases
- ✅ **Authorization Errors** - User permission checks
- ✅ **Database Errors** - Connection and query failures
- ✅ **Edge Cases** - Null/undefined inputs, special characters

### Test Files:
- `specs/mutations/add-task.spec.ts` - 15+ test cases
- `specs/mutations/update-task.spec.ts` - 20+ test cases  
- `specs/queries/get-user-done-tasks-lists.spec.ts` - 10+ test cases

## 🔧 Project Structure

```
pinecone-advocate-graphql-challenge/
├── graphql/
│   ├── schemas/
│   │   └── index.ts              # GraphQL type definitions
│   └── resolvers/
│       ├── index.ts              # Resolver exports
│       ├── mutations/
│       │   ├── add-task.ts       # addTask mutation
│       │   └── update-task.ts    # updateTask mutation
│       └── queries/
│           └── get-user-done-tasks-lists.ts
├── mongoose/
│   ├── models/
│   │   └── Task.ts               # Task model with validation
│   └── mongoose-connection.ts    # Database connection
├── pages/
│   └── api/
│       └── graphql.ts            # Apollo Server setup
├── specs/                        # Test files
├── env.example                   # Environment template
└── package.json                  # Dependencies and scripts
```

## 🎯 Example Usage

### Create a New Task
```graphql
mutation {
  addTask(input: {
    taskName: "Complete GraphQL Challenge"
    description: "Implement all required mutations and queries with comprehensive testing"
    priority: 5
    tags: ["urgent", "important", "challenge"]
    userId: "user123"
  }) {
    success
    task {
      _id
      taskName
      description
      priority
      tags
      isDone
    }
    message
  }
}
```

### Update a Task
```graphql
mutation {
  updateTask(input: {
    taskId: "507f1f77bcf86cd799439011"
    userId: "user123"
    isDone: true
    priority: 4
  }) {
    success
    task {
      _id
      taskName
      isDone
      priority
      updatedAt
    }
    message
  }
}
```

### Get User's Completed Tasks
```graphql
query {
  getUserDoneTasksLists(userId: "user123") {
    success
    tasks {
      _id
      taskName
      description
      priority
      tags
      completedAt: updatedAt
    }
    message
  }
}
```

## 🚀 Testing in GraphQL Playground

1. Start the development server: `yarn dev`
2. Open [Apollo Studio Sandbox](https://studio.apollographql.com/sandbox/explorer)
3. Enter your endpoint: `http://localhost:3000/api/graphql`
4. Test all mutations and queries with the examples above

## 📊 Performance Features

- **Database Indexing** - Optimized queries with compound indexes
- **Input Validation** - Early validation prevents unnecessary database calls
- **Error Handling** - Comprehensive error messages for debugging
- **Data Trimming** - Automatic whitespace removal for clean data

## 🔒 Security Features

- **User Authorization** - Tasks are user-scoped and protected
- **Input Sanitization** - All inputs are validated and sanitized
- **Duplicate Prevention** - Unique constraints prevent data conflicts
- **Error Information** - Safe error messages without exposing internals

## 🎉 Ready for Submission

This solution includes:

✅ **Complete GraphQL Schema** - All required types and operations  
✅ **MongoDB Integration** - Robust data persistence  
✅ **100% Test Coverage** - Comprehensive test suite  
✅ **Input Validation** - All required validations implemented  
✅ **Error Handling** - Comprehensive error scenarios covered  
✅ **Documentation** - Complete setup and usage instructions  
✅ **Production Ready** - Proper error handling and security  

## 🚀 Next Steps

1. **Set up your environment** with MongoDB connection
2. **Run tests** to verify 100% coverage: `yarn test`
3. **Start the server**: `yarn dev`
4. **Test in GraphQL Playground** at `http://localhost:3000/api/graphql`
5. **Submit your solution** with the PR link

Good luck on the challenge! 🍀

We look forward to seeing you in the **final interview**! 🎉
