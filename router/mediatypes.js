import express from "express";
import { db } from "../app.js";

const router = express.Router() 

router.get('/', (req, res) => {
    const statement = db.prepare('SELECT * FROM media_types');
    const data = statement.all();
    res.send(data);
})

export default router;