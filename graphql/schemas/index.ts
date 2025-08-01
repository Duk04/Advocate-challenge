import { gql } from "graphql-tag";

export const typeDefs = gql`
  type Task {
    _id: ID!
    taskName: String!
    description: String!
    isDone: Boolean!
    priority: Int!
    tags: [String!]!
    userId: String!
    createdAt: String!
    updatedAt: String!
  }

  type TaskResponse {
    success: Boolean!
    task: Task
    message: String
  }

  type TasksResponse {
    success: Boolean!
    tasks: [Task!]!
    message: String
  }

  input AddTaskInput {
    taskName: String!
    description: String!
    priority: Int!
    tags: [String!]
    userId: String!
  }

  input UpdateTaskInput {
    taskId: String!
    userId: String!
    taskName: String
    description: String
    priority: Int
    isDone: Boolean
    tags: [String!]
  }

  type Query {
    helloQuery: String
    getUserDoneTasksLists(userId: String!): TasksResponse!
  }

  type Mutation {
    sayHello(name: String!): String
    addTask(input: AddTaskInput!): TaskResponse!
    updateTask(input: UpdateTaskInput!): TaskResponse!
  }
`;
