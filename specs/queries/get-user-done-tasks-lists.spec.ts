import { getUserDoneTasksLists } from '../../graphql/resolvers/queries/get-user-done-tasks-lists';

const mockDoneTasks = [
  {
    _id: '507f1f77bcf86cd799439011',
    taskName: 'Completed Task 1',
    description: 'This is the first completed task description that is long enough',
    isDone: true,
    priority: 3,
    tags: ['completed', 'important'],
    userId: 'user123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02')
  },
  {
    _id: '507f1f77bcf86cd799439012',
    taskName: 'Completed Task 2',
    description: 'This is the second completed task description that is long enough',
    isDone: true,
    priority: 5,
    tags: ['completed', 'urgent'],
    userId: 'user123',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-04')
  }
];

// Mock the Task model
jest.mock('../../mongoose/models/Task', () => ({
  Task: {
    find: jest.fn()
  }
}));

import { Task } from '../../mongoose/models/Task';

describe('getUserDoneTasksLists Query', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should return completed tasks for a valid user ID', async () => {
      const userId = 'user123';

      (Task.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockDoneTasks)
      });

      const result = await getUserDoneTasksLists(null, { userId });

      expect(result.success).toBe(true);
      expect(result.tasks).toEqual(mockDoneTasks);
      expect(result.message).toBe('Found 2 completed tasks for user user123');
      expect(Task.find).toHaveBeenCalledWith({
        userId: 'user123',
        isDone: true
      });
    });

    it('should return empty array when user has no completed tasks', async () => {
      const userId = 'user123';

      (Task.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      const result = await getUserDoneTasksLists(null, { userId });

      expect(result.success).toBe(true);
      expect(result.tasks).toEqual([]);
      expect(result.message).toBe('Found 0 completed tasks for user user123');
    });

    it('should trim whitespace from user ID', async () => {
      const userId = '  user123  ';

      (Task.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockDoneTasks)
      });

      const result = await getUserDoneTasksLists(null, { userId });

      expect(result.success).toBe(true);
      expect(Task.find).toHaveBeenCalledWith({
        userId: 'user123',
        isDone: true
      });
    });

    it('should sort tasks by updatedAt in descending order', async () => {
      const userId = 'user123';

      const sortMock = jest.fn().mockResolvedValue(mockDoneTasks);
      (Task.find as jest.Mock).mockReturnValue({
        sort: sortMock
      });

      await getUserDoneTasksLists(null, { userId });

      expect(sortMock).toHaveBeenCalledWith({ updatedAt: -1 });
    });
  });

  describe('Validation Errors', () => {
    it('should return error for empty user ID', async () => {
      const userId = '';

      const result = await getUserDoneTasksLists(null, { userId });

      expect(result.success).toBe(false);
      expect(result.tasks).toEqual([]);
      expect(result.message).toBe('User ID is required');
    });

    it('should return error for whitespace-only user ID', async () => {
      const userId = '   ';

      const result = await getUserDoneTasksLists(null, { userId });

      expect(result.success).toBe(false);
      expect(result.tasks).toEqual([]);
      expect(result.message).toBe('User ID is required');
    });
  });

  describe('Database Errors', () => {
    it('should handle database connection errors', async () => {
      const userId = 'user123';

      (Task.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      });

      const result = await getUserDoneTasksLists(null, { userId });

      expect(result.success).toBe(false);
      expect(result.tasks).toEqual([]);
      expect(result.message).toBe('Failed to fetch completed tasks: Database connection failed');
    });

    it('should handle query execution errors', async () => {
      const userId = 'user123';

      (Task.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Query timeout'))
      });

      const result = await getUserDoneTasksLists(null, { userId });

      expect(result.success).toBe(false);
      expect(result.tasks).toEqual([]);
      expect(result.message).toBe('Failed to fetch completed tasks: Query timeout');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null user ID', async () => {
      const userId = null as any;

      const result = await getUserDoneTasksLists(null, { userId });

      expect(result.success).toBe(false);
      expect(result.tasks).toEqual([]);
      expect(result.message).toBe('User ID is required');
    });

    it('should handle undefined user ID', async () => {
      const userId = undefined as any;

      const result = await getUserDoneTasksLists(null, { userId });

      expect(result.success).toBe(false);
      expect(result.tasks).toEqual([]);
      expect(result.message).toBe('User ID is required');
    });

    it('should handle very long user ID', async () => {
      const userId = 'a'.repeat(1000);

      (Task.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      const result = await getUserDoneTasksLists(null, { userId });

      expect(result.success).toBe(true);
      expect(Task.find).toHaveBeenCalledWith({
        userId: 'a'.repeat(1000),
        isDone: true
      });
    });

    it('should handle special characters in user ID', async () => {
      const userId = 'user@123!#$%';

      (Task.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      const result = await getUserDoneTasksLists(null, { userId });

      expect(result.success).toBe(true);
      expect(Task.find).toHaveBeenCalledWith({
        userId: 'user@123!#$%',
        isDone: true
      });
    });
  });
}); 