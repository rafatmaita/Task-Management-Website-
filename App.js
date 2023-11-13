const express = require('express');
const Mongoose = require("mongoose");
const { Users } = require("./models/Article");
const Task = require('./models/tasks');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const uuid = require("uuid");

const app = express();
app.use(express.json());
const port = 5001;
//TODO: wXYDFX5fQhRoKQc5
/*

jhuohkljk;j
kjlkj;lk
ikj;ll?lnkm;
*/

Mongoose.connect("mongodb+srv://rafatmaita:wXYDFX5fQhRoKQc5@myfirstnodejscluster.zcjq63q.mongodb.net/?retryWrites=true&w=majority")
  .then(() => {
    console.log("Rafat you are a hero");
  }).catch(() => {
    console.log("Error With connect To The DataBase");
  });

const generateUserId = () => {
  return uuid.v4();
};


//====>TODO: THIS IS SIGNUP API
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const schema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  const validate = schema.validate({ username, email, password });

  if (validate.error) {
    return res.status(400).json({ message: "Validation error" });
  }

  const existingUser = await Users.findOne({ email });
  if (existingUser) return res.status(400).send("User already exists");

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = new Users({
    id: generateUserId(),
    username,
    email,
    password: hashedPassword
  });

  try {
    const savedUser = await user.save();
    res.send({ user: savedUser._id });
  } catch (error) {
    res.status(400).send(error);
  }
});

//====>TODO: THIS IS LOGIN API

app.post("/login", async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await Users.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("User not found");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid password");

  const token = jwt.sign({ _id: user._id }, "your-secret-key");

  res.json({ userId: user._id, authToken: token });
});



app.use(express.json());


//====>TODO: THIS IS ADD TASKS WITH USER ID  API
app.post('/add/tasks', async (req, res) => {
  try {
    const { title, description, dueDate, priority, userId } = req.body;

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newTask = new Task({
      title,
      description,
      dueDate,
      priority,
      user: userId, 
    });

    const savedTask = await newTask.save();

    res.status(201).json(savedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});







//====>TODO: THIS IS GET ALL TASKS WITH USER ID  API
app.get('/tasks/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const tasks = await Task.find({ user: userId, isDeleted: false });

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



//====>TODO: THIS IS EDIT THE TASK WITH TASK ID  API
app.put('/edit/tasks/:taskId', async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { title, description, dueDate, priority, userId } = req.body;

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (existingTask.user.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized - Task does not belong to the user' });
    }

    existingTask.title = title;
    existingTask.description = description;
    existingTask.dueDate = dueDate;
    existingTask.priority = priority;

    const updatedTask = await existingTask.save();

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//====>TODO: THIS IS EDIT THE STATUS FOR TASK WITH TASKID  API
app.put('/edit/status/:taskId', async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { status, userId } = req.body;

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (existingTask.user.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized - Task does not belong to the user' });
    }

    existingTask.status = status;

    const updatedTask = await existingTask.save();

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//====>TODO: THIS IS DELETE TASK WITH TASK ID  API
app.put('/delete/tasks/:taskId', async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { userId } = req.body;

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (existingTask.user.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized - Task does not belong to the user' });
    }

    existingTask.isDeleted = true;

    const updatedTask = await existingTask.save();

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
