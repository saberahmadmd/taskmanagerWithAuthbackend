import express from 'express';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all task routes
router.use(protect);

router.route('/')
  .post(createTask)
  .get(getTasks);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

export default router;