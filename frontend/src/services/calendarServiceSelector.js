import { USE_MOCK_TASKS } from '../config';
import * as realService from './calendarService';
import * as mockService from './calendarService.mock'; // si haces uno

const service = USE_MOCK_TASKS ? mockService : realService;

export const createStudy = service.createStudy;
export const createClass = service.createClass;
export const createNonAcademic = service.createNonAcademic;
