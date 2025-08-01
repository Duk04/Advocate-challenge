import { sayHello } from "./mutations/say-hello";
import { addTask } from "./mutations/add-task";
import { updateTask } from "./mutations/update-task";
import { helloQuery } from "./queries/hello-query";
import { getUserDoneTasksLists } from "./queries/get-user-done-tasks-lists";

export const resolvers = {
  Query: {
    helloQuery,
    getUserDoneTasksLists,
  },
  Mutation: {
    sayHello,
    addTask,
    updateTask,
  },
};
