import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
// import db from '../db.js'
import prisma from '../prismaClient.js';

const router = express.Router();

router.post('/register', async(req, res) => {
    const {username, password} = req.body
    
    //Encrypt the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    //Save the new user and hashed password to the database
    try {
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        })

        //Now that we have a user , I want to add their first todo for them
        const defaultTodo = `Hello🙂 Add your first todo!`
        await prisma.todo.create({
            data: {
                task: defaultTodo,
                userId: user.id
            }
        })
        
        //Create a token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {expiresIn: '12h'})
        res.json({token})

    } catch (error) {
        console.log(error.message)
        res.sendStatus(503);
    }
})
router.post('/login', async(req, res) => {
    //We got their email and we look up the password associated with that email in the database
    //But we get it back and see it's encrypted, which means that we cannot compare it to the one user just user tyring to login
    // So what we can do, is again, one way encrypt the password the user just entered

    const {username, password} = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        })

        //If we cannot find a user associated with that username, return out of that function
        if(!user){
            return res.status(404).send({message: 'User Not Found!'})
        }

        const passValid = bcrypt.compareSync(password, user.password)
        //If the password not match , return out of the function
        if(!passValid){
            return res.status(401).send({message: 'Password Not Match!'})
        }

        // console.log(user)
        //Then we have a successful authentication 
        const token = jwt.sign({ id: user.id}, process.env.JWT_SECRET, {expiresIn: '12h'})
        res.json({token});
    } catch (error) {
        console.log(error.message)
        res.sendStatus(503);
    }

})

export default router;