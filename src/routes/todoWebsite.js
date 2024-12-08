import express from 'express'
// import db from '../db.js'
import prisma from '../prismaClient.js';

const router = express.Router();

//get all todos logged-in users
router.get('/', async(req, res) => {
    const todos = await prisma.todo.findMany({
        where: {
            userId: req.userId
        }
    })
    res.json(todos);
})

//Create a new todo
router.post('/', async(req, res) => {
    const {task} = req.body
    const todos = await prisma.todo.create({
        data: {
            task,
            userId: req.userId
        }
    })

    res.json(todos)

})

//Update a todo
router.put('/:id', async(req, res) => {
    const {completed} = req.body
    const {id} = req.params
    // const {page} = req.query

    const updatedTodo = await prisma.todo.update({
        where: {
            id: parseInt(id),
            userId: req.userId
        },
        data: {
            //!! convert it to boolean
            completed: !!completed
        }
    })
    res.json(updatedTodo)
})

//Delete a todo
router.delete('/:id', async(req, res) => {
    const {id} = req.params
    const userId = req.userId
    await prisma.todo.delete({
        where: {
            id: parseInt(id),
            userId
        }
    })

    res.json({message: "Deleted Todo"})
})

export default router;