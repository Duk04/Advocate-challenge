import { Task } from "../../../mongoose/models/Task";

interface AddTaskInput {
  taskName: string;
  description: string;
  priority: number;
  tags?: string[];
  userId: string;
}

export const addTask = async (_: any, { input }: { input: AddTaskInput }) => {
  try {
    const { taskName, description, priority, tags = [], userId } = input;

    if (!taskName || taskName.trim().length === 0) {
      return {
        success: false,
        task: null,
        message: "Task name is required and cannot be empty",
      };
    }

    if (!description || description.trim().length < 10) {
      return {
        success: false,
        task: null,
        message:
          "Description is required and must be at least 10 characters long",
      };
    }

    if (priority < 1 || priority > 5) {
      return {
        success: false,
        task: null,
        message: "Priority must be between 1 and 5",
      };
    }

    if (tags.length > 5) {
      return {
        success: false,
        task: null,
        message: "Tags cannot exceed 5 items",
      };
    }

    if (description.toLowerCase().trim() === taskName.toLowerCase().trim()) {
      return {
        success: false,
        task: null,
        message: "Description cannot be the same as task name",
      };
    }

    if (!userId || userId.trim().length === 0) {
      return {
        success: false,
        task: null,
        message: "User ID is required",
      };
    }

    const existingTask = await Task.findOne({
      taskName: taskName.trim(),
      userId: userId.trim(),
    });

    if (existingTask) {
      return {
        success: false,
        task: null,
        message: "Task name already exists for this user",
      };
    }

    const newTask = new Task({
      taskName: taskName.trim(),
      description: description.trim(),
      priority,
      tags: tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0),
      userId: userId.trim(),
    });

    const savedTask = await newTask.save();

    return {
      success: true,
      task: savedTask,
      message: "Task created successfully",
    };
  } catch (error: any) {
    if (error.code === 11000) {
      return {
        success: false,
        task: null,
        message: "Task name already exists for this user",
      };
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return {
        success: false,
        task: null,
        message: messages.join(", "),
      };
    }

    return {
      success: false,
      task: null,
      message: "Failed to create task: " + error.message,
      error: error.message,
    };
  }
};
