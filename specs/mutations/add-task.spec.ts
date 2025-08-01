import { addTask } from '../../graphql/resolvers/mutations/add-task';

// Mock the Task model
const mockTask = {
  _id: '507f1f77bcf86cd799439011',
  taskName: 'Test Task',
  description: 'This is a test task description that is long enough',
  isDone: false,
  priority: 3,
  tags: ['test', 'important'],
  userId: 'user123',
  createdAt: new Date(),
  updatedAt: new Date(),
  save: jest.fn().mockResolvedValue({
    _id: '507f1f77bcf86cd799439011',
    taskName: 'Test Task',
    description: 'This is a test task description that is long enough',
    isDone: false,
    priority: 3,
    tags: ['test', 'important'],
    userId: 'user123',
    createdAt: new Date(),
    updatedAt: new Date(),
  })
};

// Mock the Task model
jest.mock('../../mongoose/models/Task', () => ({
  Task: jest.fn().mockImplementation(() => mockTask)
}));

import { Task } from '../../mongoose/models/Task';

describe('addTask Mutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should create a task successfully with all required fields', async () => {
      const input = {
        taskName: 'Test Task',
        description: 'This is a test task description that is long enough',
        priority: 3,
        userId: 'user123'
      };

      // Mock the static methods
      (Task as any).findOne = jest.fn().mockResolvedValue(null);

      const result = await addTask(null, { input });

      expect(result.success).toBe(true);
      expect(result.task).toBeDefined();
      expect(result.message).toBe('Task created successfully');
      expect((Task as any).findOne).toHaveBeenCalledWith({
        taskName: 'Test Task',
        userId: 'user123'
      });
    });

    it('should create a task with optional tags', async () => {
      const input = {
        taskName: 'Test Task',
        description: 'This is a test task description that is long enough',
        priority: 3,
        tags: ['test', 'important'],
        userId: 'user123'
      };

      (Task as any).findOne = jest.fn().mockResolvedValue(null);

      const result = await addTask(null, { input });

      expect(result.success).toBe(true);
      expect(result.task).toBeDefined();
    });

    it('should trim whitespace from input fields', async () => {
      const input = {
        taskName: '  Test Task  ',
        description: '  This is a test task description that is long enough  ',
        priority: 3,
        tags: ['  test  ', '  important  '],
        userId: '  user123  '
      };

      (Task as any).findOne = jest.fn().mockResolvedValue(null);

      const result = await addTask(null, { input });

      expect(result.success).toBe(true);
      expect((Task as any).findOne).toHaveBeenCalledWith({
        taskName: 'Test Task',
        userId: 'user123'
      });
    });
  });

  describe('Validation Errors', () => {
    it('should return error for empty task name', async () => {
      const input = {
        taskName: '',
        description: 'This is a test task description that is long enough',
        priority: 3,
        userId: 'user123'
      };

      const result = await addTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Task name is required and cannot be empty');
    });

    it('should return error for whitespace-only task name', async () => {
      const input = {
        taskName: '   ',
        description: 'This is a test task description that is long enough',
        priority: 3,
        userId: 'user123'
      };

      const result = await addTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Task name is required and cannot be empty');
    });

    it('should return error for description shorter than 10 characters', async () => {
      const input = {
        taskName: 'Test Task',
        description: 'Short',
        priority: 3,
        userId: 'user123'
      };

      const result = await addTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Description is required and must be at least 10 characters long');
    });

    it('should return error for priority less than 1', async () => {
      const input = {
        taskName: 'Test Task',
        description: 'This is a test task description that is long enough',
        priority: 0,
        userId: 'user123'
      };

      const result = await addTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Priority must be between 1 and 5');
    });

    it('should return error for priority greater than 5', async () => {
      const input = {
        taskName: 'Test Task',
        description: 'This is a test task description that is long enough',
        priority: 6,
        userId: 'user123'
      };

      const result = await addTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Priority must be between 1 and 5');
    });

    it('should return error for more than 5 tags', async () => {
      const input = {
        taskName: 'Test Task',
        description: 'This is a test task description that is long enough',
        priority: 3,
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'],
        userId: 'user123'
      };

      const result = await addTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Tags cannot exceed 5 items');
    });

    it('should return error when description is same as task name', async () => {
      const input = {
        taskName: 'Test Task',
        description: 'Test Task',
        priority: 3,
        userId: 'user123'
      };

      const result = await addTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Description is required and must be at least 10 characters long');
    });

    it('should return error for empty user ID', async () => {
      const input = {
        taskName: 'Test Task',
        description: 'This is a test task description that is long enough',
        priority: 3,
        userId: ''
      };

      const result = await addTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('User ID is required');
    });
  });

  describe('Duplicate Task Name', () => {
    it('should return error when task name already exists for user', async () => {
      const input = {
        taskName: 'Test Task',
        description: 'This is a test task description that is long enough',
        priority: 3,
        userId: 'user123'
      };

      (Task as any).findOne = jest.fn().mockResolvedValue(mockTask);

      const result = await addTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Task name already exists for this user');
    });
  });

  describe('Database Errors', () => {
    it('should handle MongoDB duplicate key error', async () => {
      const input = {
        taskName: 'Test Task',
        description: 'This is a test task description that is long enough',
        priority: 3,
        userId: 'user123'
      };

      (Task as any).findOne = jest.fn().mockResolvedValue(null);
      (Task as any).mockImplementation(() => ({
        ...mockTask,
        save: jest.fn().mockRejectedValue({ code: 11000 })
      }));

      const result = await addTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Task name already exists for this user');
    });

    it('should handle validation errors', async () => {
      const input = {
        taskName: 'Test Task',
        description: 'This is a test task description that is long enough',
        priority: 3,
        userId: 'user123'
      };

      (Task as any).findOne = jest.fn().mockResolvedValue(null);
      (Task as any).mockImplementation(() => ({
        ...mockTask,
        save: jest.fn().mockRejectedValue({
          name: 'ValidationError',
          errors: {
            taskName: { message: 'Task name is required' },
            description: { message: 'Description is required' }
          }
        })
      }));

      const result = await addTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Task name is required, Description is required');
    });

    it('should handle general database errors', async () => {
      const input = {
        taskName: 'Test Task',
        description: 'This is a test task description that is long enough',
        priority: 3,
        userId: 'user123'
      };

      (Task as any).findOne = jest.fn().mockResolvedValue(null);
      (Task as any).mockImplementation(() => ({
        ...mockTask,
        save: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      }));

      const result = await addTask(null, { input });

      expect(result.success).toBe(false);
      expect(result.task).toBeNull();
      expect(result.message).toBe('Failed to create task: Database connection failed');
    });
  });
});
