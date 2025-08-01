import { Task } from "../../../mongoose/models/Task";

export const getUserDoneTasksLists = async (
  _: any,
  { userId }: { userId: string }
) => {
  try {
    if (!userId || userId.trim().length === 0) {
      return {
        success: false,
        tasks: [],
        message: "User ID is required",
      };
    }

    const doneTasks = await Task.find({
      userId: userId.trim(),
      isDone: true,
    }).sort({ updatedAt: -1 });

    return {
      success: true,
      tasks: doneTasks,
      message: `Found ${doneTasks.length} completed tasks for user ${userId}`,
    };
  } catch (error: any) {
    return {
      success: false,
      tasks: [],
      message: "Failed to fetch completed tasks: " + error.message,
    };
  }
};
