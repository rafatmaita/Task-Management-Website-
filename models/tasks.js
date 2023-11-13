const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  dueDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
