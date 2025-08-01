import { updateTask } from '../../graphql/resolvers/mutations/update-task';

// Mock mongoose
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn()
    }
  }
}));

const mockTask = {
  _id: '507f1f77bcf86cd799439011',
  taskName: 'Original Task',
  description: 'This is the original task description that is long enough',
  isDone: false,
  priority: 3,
  tags: ['original'],
  userId: 'user123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUpdatedTask = {
  ...mockTask,
  taskName: 'Updated Task',
  description: 'This is the updated task description that is long enough',
  isDone: true,
  priority: 5,
  tags: ['updated', 'important'],
};

// Mock the Task model
jest.mock('../../mongoose/models/Task', () => ({
  Task: {
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn()
  }
}));

import { Task } from '../../mongoose/models/Task';
import mongoose from 'mongoose';

describe('updateTask Mutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should update task successfully with all fields', async () => {
      const input = {
        taskId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        taskName: 'Updated Task',
        description: 'This is the updated task description that is long enough',
        priority: 5,
        isDone: true,
        tags: ['updated', 'important']
      };

      (Task.findById as jest.Mock).mockResolvedValue(mockTask);
      (Task.findOne as jest.Mock).mockResolvedValue(null);
      (Task.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedTask);
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);

      const result = await updateTask(null, { input });

      expect(result.success).toBe(true);
      expect(result.task).toEqual(mockUpdatedTask);
      expect(result.message).toBe('Task updated successfully');
    });

    it('should update only provided fields', async () => {
      const input = {
        taskId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        isDone: true
      };

      const partiallyUpdatedTask = { ...mockTask, isDone: true };

      (Task.findById as jest.Mock).mockResolvedValue(mockTask);
      (Task.findByIdAndUpdate as jest.Mock).mockResolvedValue(partiallyUpdatedTask);
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);

      const result = await updateTask(null, { input });

      expect(result.success).toBe(true);
      expect(result.task).toEqual(partiallyUpdatedTask);
    });

    it('should trim whitespace from input fields', async () => {
      const input = {
        taskId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        taskName: '  Updated Task  ',
        description: '  This is the updated task description that is long enough  ',
        tags: ['  updated  ', '  important  ']
      };

      (Task.findById as jest.Mock).mockResolvedValue(mockTask);
      (Task.findOne as jest.Mock).mockResolvedValue(null);
      (Task.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedTask);
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);

      const result = await updateTask(null, { input });

      expect(result.success).toBe(true);
      expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          taskName: 'Updated Task',
          description: 'This is the updated task description that is long enough',
          tags: ['updated', 'important']
        },
        { new: true, runValidators: true }
      );
    });
  });

  describe('Validation Errors', () => {
    it('should return error for empty task ID', async () => {
      const input = {
        taskId: '',
        userId: 'user123',
        taskName: 'Updated Task'
      };

      const result = await updateTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Task ID is required');
    });

    it('should return error for empty user ID', async () => {
      const input = {
        taskId: '507f1f77bcf86cd799439011',
        userId: '',
        taskName: 'Updated Task'
      };

      const result = await updateTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('User ID is required');
    });

    it('should return error for invalid task ID format', async () => {
      const input = {
        taskId: 'invalid-id',
        userId: 'user123',
        taskName: 'Updated Task'
      };

      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

      const result = await updateTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Invalid task ID format');
    });

    it('should return error for priority less than 1', async () => {
      const input = {
        taskId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        priority: 0
      };

      (Task.findById as jest.Mock).mockResolvedValue(mockTask);
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);

      const result = await updateTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Priority must be between 1 and 5');
    });

    it('should return error for priority greater than 5', async () => {
      const input = {
        taskId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        priority: 6
      };

      (Task.findById as jest.Mock).mockResolvedValue(mockTask);
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);

      const result = await updateTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Priority must be between 1 and 5');
    });

    it('should return error for more than 5 tags', async () => {
      const input = {
        taskId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6']
      };

      (Task.findById as jest.Mock).mockResolvedValue(mockTask);
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);

      const result = await updateTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Tags cannot exceed 5 items');
    });

    it('should return error for empty task name', async () => {
      const input = {
        taskId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        taskName: ''
      };

      (Task.findById as jest.Mock).mockResolvedValue(mockTask);
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);

      const result = await updateTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Task name cannot be empty');
    });

    it('should return error for description shorter than 10 characters', async () => {
      const input = {
        taskId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        description: 'Short'
      };

      (Task.findById as jest.Mock).mockResolvedValue(mockTask);
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);

      const result = await updateTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Description must be at least 10 characters long');
    });

    it('should return error when description is same as task name', async () => {
      const input = {
        taskId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        description: 'Original Task'
      };

      (Task.findById as jest.Mock).mockResolvedValue(mockTask);
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);

      const result = await updateTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Description cannot be the same as task name');
    });
  });

  describe('Authorization Errors', () => {
    it('should return error when task is not found', async () => {
      const input = {
        taskId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        taskName: 'Updated Task'
      };

      (Task.findById as jest.Mock).mockResolvedValue(null);
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);

      const result = await updateTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Task not found');
    });

    it('should return error when user does not own the task', async () => {
      const input = {
        taskId: '507f1f77bcf86cd799439011',
        userId: 'different-user',
        taskName: 'Updated Task'
      };

      (Task.findById as jest.Mock).mockResolvedValue(mockTask);
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);

      const result = await updateTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Unauthorized: You can only update your own tasks');
    });
  });

  describe('Duplicate Task Name', () => {
    it('should return error when new task name already exists for user', async () => {
      const input = {
        taskId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        taskName: 'Existing Task'
      };

      const existingTask = { ...mockTask, _id: 'different-id' };

      (Task.findById as jest.Mock).mockResolvedValue(mockTask);
      (Task.findOne as jest.Mock).mockResolvedValue(existingTask);
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);

      const result = await updateTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Task name already exists for this user');
    });
  });

  describe('Database Errors', () => {
    it('should handle MongoDB duplicate key error', async () => {
      const input = {
        taskId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        taskName: 'Updated Task'
      };

      (Task.findById as jest.Mock).mockResolvedValue(mockTask);
      (Task.findOne as jest.Mock).mockResolvedValue(null);
      (Task.findByIdAndUpdate as jest.Mock).mockRejectedValue({ code: 11000 });
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);

      const result = await updateTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Task name already exists for this user');
    });

    it('should handle validation errors', async () => {
      const input = {
        taskId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        taskName: 'Updated Task'
      };

      (Task.findById as jest.Mock).mockResolvedValue(mockTask);
      (Task.findOne as jest.Mock).mockResolvedValue(null);
      (Task.findByIdAndUpdate as jest.Mock).mockRejectedValue({
        name: 'ValidationError',
        errors: {
          taskName: { message: 'Task name is required' },
          description: { message: 'Description is required' }
        }
      });
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);

      const result = await updateTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Task name is required, Description is required');
    });

    it('should handle general database errors', async () => {
      const input = {
        taskId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        taskName: 'Updated Task'
      };

      (Task.findById as jest.Mock).mockResolvedValue(mockTask);
      (Task.findOne as jest.Mock).mockResolvedValue(null);
      (Task.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Database connection failed'));
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);

      const result = await updateTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Failed to update task: Database connection failed');
    });

    it('should handle case when update returns null', async () => {
      const input = {
        taskId: '507f1f77bcf86cd799439011',
        userId: 'user123',
        taskName: 'Updated Task'
      };

      (Task.findById as jest.Mock).mockResolvedValue(mockTask);
      (Task.findOne as jest.Mock).mockResolvedValue(null);
      (Task.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);

      const result = await updateTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Failed to update task');
    });
  });
}); 