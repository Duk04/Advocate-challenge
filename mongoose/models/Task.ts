import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  taskName: string;
  description: string;
  isDone: boolean;
  priority: number;
  tags: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    taskName: {
      type: String,
      required: [true, "Task name is required"],
      trim: true,
      minlength: [1, "Task name cannot be empty"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
    },
    isDone: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: Number,
      required: [true, "Priority is required"],
      min: [1, "Priority must be between 1 and 5"],
      max: [5, "Priority must be between 1 and 5"],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 5;
        },
        message: "Tags cannot exceed 5 items",
      },
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ taskName: 1, userId: 1 }, { unique: true });

TaskSchema.pre("save", function (next) {
  const task = this as any;
  if (
    task.description.toLowerCase().trim() === task.taskName.toLowerCase().trim()
  ) {
    return next(new Error("Description cannot be the same as task name"));
  }
  next();
});

export const Task = mongoose.model<ITask>("Task", TaskSchema);
