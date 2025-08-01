import { Task } from "../../../mongoose/models/Task";
import mongoose from "mongoose";

interface UpdateTaskInput {
  taskId: string;
  userId: string;
  taskName?: string;
  description?: string;
  priority?: number;
  isDone?: boolean;
  tags?: string[];
}

export const updateTask = async (
  _: any,
  { input }: { input: UpdateTaskInput }
) => {
  const { taskId, userId, taskName, description, priority, isDone, tags } =
    input;

  if (!taskId || taskId.trim().length === 0) {
    return {
      success: false,
      task: null,
      message: "Task ID is required",
    };
  }

  if (!userId || userId.trim().length === 0) {
    return {
      success: false,
      task: null,
      message: "User ID is required",
    };
  }

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return {
      success: false,
      task: null,
      message: "Invalid task ID format",
    };
  }

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return {
        success: false,
        task: null,
        message: "Task not found",
      };
    }

    if (task.userId !== userId) {
      return {
        success: false,
        task: null,
        message: "Unauthorized: You can only update your own tasks",
      };
    }

    if (priority !== undefined && (priority < 1 || priority > 5)) {
      return {
        success: false,
        task: null,
        message: "Priority must be between 1 and 5",
      };
    }

    if (tags !== undefined && tags.length > 5) {
      return {
        success: false,
        task: null,
        message: "Tags cannot exceed 5 items",
      };
    }

    if (taskName !== undefined) {
      if (!taskName || taskName.trim().length === 0) {
        return {
          success: false,
          task: null,
          message: "Task name cannot be empty",
        };
      }

      const existingTask = await Task.findOne({
        taskName: taskName.trim(),
        userId: userId.trim(),
        _id: { $ne: taskId },
      });

      if (existingTask) {
        return {
          success: false,
          task: null,
          message: "Task name already exists for this user",
        };
      }
    }

    if (description !== undefined) {
      if (!description || description.trim().length < 10) {
        return {
          success: false,
          task: null,
          message: "Description must be at least 10 characters long",
        };
      }

      const currentTaskName = taskName || task.taskName;
      if (
        description.toLowerCase().trim() ===
        currentTaskName.toLowerCase().trim()
      ) {
        return {
          success: false,
          task: null,
          message: "Description cannot be the same as task name",
        };
      }
    }

    const updateData: any = {};

    if (taskName !== undefined) {
      updateData.taskName = taskName.trim();
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    if (priority !== undefined) {
      updateData.priority = priority;
    }

    if (isDone !== undefined) {
      updateData.isDone = isDone;
    }

    if (tags !== undefined) {
      updateData.tags = tags
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedTask) {
      return {
        success: false,
        task: null,
        message: "Failed to update task",
      };
    }

    return {
      success: true,
      task: updatedTask,
      message: "Task updated successfully",
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
      message: "Failed to update task: " + error.message,
      error: error.message,
    };
  }
};
