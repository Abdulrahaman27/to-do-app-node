const express = require('express');
const {Low} = require('lowdb');
const {JSONFile} = require('lowdb/node');
const {nanoid} = require('nanoid'); 
const cors = require('cors'); 


const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

const adapter = new JSONFile('db.json');
const db = new Low(adapter, { tasks : [] });

async function  initDB() {
    try {
        await db.read();
    }catch(err){
        console.error("Failed to Read DB:", err);
    }

    if(!db.data) {  
        db.data = {tasks : []};
        await db.write();
    }
}

initDB();


// Get all tasks
app.get('/tasks', async(req, res) => {
    await db.read();
    res.json(db.data.tasks);
});


// Add new task
app.post('/tasks', async (req, res) => {
    await db.read();
    const {name} = req.body;
    const newTask = {id: nanoid(), name, completed:false};
    db.data.tasks.push(newTask);
    await db.write();
    res.status(201).json(newTask);
});

// Toggle Task Completion
app.put('/tasks/:id', async (req, res) => {
    await db.read();
    const {id} = req.params;
    const task = db.data.tasks.find(t => t.id === id);
    if(task) {
        task.completed =  !task.completed;
        await db.write();
        res.json(task);
    }else {
    res.status(404).send('Task not found!');
    }
});

// Delete task
app.delete('/tasks/:id', async (req, res) => {
    await db.read();
    const {id} = req.params;
    db.data.tasks = db.data.tasks.filter(t => t.id !== id);
    await db.write();
    res.status(204).send();
});

// Edit Task 
app.put('/tasks/:id/edit', async (req, res) => {
    await db.read();
    const {id} = req.params;
    const {name} = req.body;
    const task = db.data.tasks.find(t => t.id === id);
    if(task) {
        task.name = name;
        await db.write();
        res.json(task);
    }else {
    res.status(404).send('Task not found!');
    }
});
app.listen(3000, () => console.log('✅Server running on http://localhost:3000'))