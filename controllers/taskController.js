import Task from '../models/Task.js';
import { io } from '../index.js';

export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, assignedTo } = req.body;

    if (!title || !description || !dueDate || !priority) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      assignedTo,
      createdBy: req.user._id
    });

    // Populate created task with user info
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo createdBy', 'name email');

    // Emit socket event
    io.emit('taskCreated', populatedTask);

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        { createdBy: req.user._id },
        { assignedTo: req.user._id }
      ]
    })
      .populate('assignedTo createdBy', 'name email')
      .sort({ createdAt: -1 }); // Newest first

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user is authorized (task creator or assigned to them)
    if (
      task.createdBy.toString() !== req.user._id.toString() &&
      (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(401).json({ error: 'Not authorized to update this task' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    ).populate('assignedTo createdBy', 'name email');

    // Emit socket event
    io.emit('taskUpdated', updatedTask);

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user is authorized (only creator can delete)
    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Not authorized to delete this task' });
    }

    await task.deleteOne();

    // Emit socket event
    io.emit('taskDeleted', id);

    res.json({ id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};