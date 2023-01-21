const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

function checksExistsTodo(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  return next();
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;

  const userAlreadyExists = users.some(
    (user) => user.username === username
  );

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const newUser = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const index = user.todos.findIndex((todo) => todo.id === id);

  user.todos[index].title = title;
  user.todos[index].deadline = deadline;

  return response.status(201).json(user.todos[index]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex((todo) => todo.id === id);

  user.todos[index].done = true;

  return response.status(201).json(user.todos[index]);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex((todo) => todo.id === id);

  user.todos.splice(index, 1);

  return response.status(204).end();
});

module.exports = app;