// src/services/taskServiceSelector.js
import { USE_MOCK_TASKS } from '../config'; // Aquí decides qué usar

import * as realService from './taskService'; // Backend real
import * as mockService from '../services/taskService.mock'; // Mocks para pruebas

const service = USE_MOCK_TASKS ? mockService : realService;

export const getTasks = service.getTasks;
export const createTask = service.createTask;
export const updateTask = service.updateTask;
export const deleteTask = service.deleteTask;
export const updateTaskStatus = service.updateTaskStatus;
