import { TasksController } from './tasks.controller';

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(() => {
    controller = new TasksController();
  });

  it('should return an array of tasks', () => {
    const result = controller.getAllTasks();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);
  });

  it('should contain tasks with id, title, and description', () => {
    const result = controller.getAllTasks();

    expect(result[1]).toEqual({
      id: 1,
      title: 'Task 1',
      description: 'Description of Task 1',
    });
    expect(result[2]).toEqual({
      id: 2,
      title: 'Task 2',
      description: 'Description of Task 2',
    });
  });
});
