import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);