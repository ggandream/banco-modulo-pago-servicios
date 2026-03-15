import { Controller, Get } from '@nestjs/common';

@Controller({})
export class TasksController {
  @Get('/tasks')
  getAllTasks() {
    return [
      {
        'Obteniendo todas las tareas':
          'Aquí puedes obtener todas las tareas disponibles.',
      },
      { id: 1, title: 'Task 1', description: 'Description of Task 1' },
      { id: 2, title: 'Task 2', description: 'Description of Task 2' },
    ];
  }
}
