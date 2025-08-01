jest.mock("mongoose", () => ({
  connect: jest.fn(),
  model: jest.fn(),
  Schema: jest.fn(),
  Types: {
    ObjectId: {
      isValid: jest.fn(),
    },
  },
}));

process.env.MONGODB_URL = "mongodb://localhost:27017/test";

global.console = {
  ...console,
};
