import express from "express";
import { db } from "../app.js";
import { validateTrackPost, validateTrackPatch } from '../validator.js'; 
import { generateInsertStatement } from '../sqlGenerator.js';

const router = express.Router() 

// Get all the tracks
router.get('/', (req, res) => {
    try {
        const statement = db.prepare('SELECT * FROM tracks');
        const data = statement.all();
        res.send(data);
    } catch (error) {
        console.error('Error fetching artists:', error);
        res.status(500).send('Internal Server Error');
    }
});

// GET specific track by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    const track = db.prepare('SELECT * FROM tracks WHERE TrackId = ?').get(id);
    track ? res.status(200).send(track) : res.status(404).send({ message: 'Track not found' });
});

// // POST a new track
router.post('/', (req, res) => {
    try {
        const validationResult = validateTrackPost(req.body)
    
        if(validationResult){
            return res.status(422).send(validationResult)
        }
        const {sql , values} = generateInsertStatement("tracks" , req.body)

        const statement = db.prepare(sql)
        const result = statement.run(values)
        res.status(201).json(result) // temporary send
    
    } catch (err) {
        res.status(500).json({mesaage: "try again later"})
    }
});

// PATCH an existing track
router.patch('/:id', (req, res) => {
    try {
        const validationResult = validateTrackPatch(req.body);

        // Handle validation errors
        if (validationResult) {
            return res.status(422).json(validationResult);
        }

        const update = db.prepare('UPDATE tracks SET Name = ?, UnitPrice = ?, AlbumId = ?, MediaTypeId = ?, GenreId = ?, Milliseconds = ?, Bytes = ?, Composer = ? WHERE AlbumId = ?');

        const result = update.run(req.body.Name, req.body.UnitPrice, req.body.AlbumId, req.body.MediaTypeId, req.body.GenreId, req.body.Milliseconds, req.body.Bytes, req.body.Composer, req.params.id);  

        // Check if the artist was found
        if (!result) {
            return res.status(404).json({ message: 'Track not found' });
        }

        res.status(200).json({ message: 'Track updated successfully' });

    } catch (err) {
        console.error(err); 
        res.status(500).json({ message: 'Try again later' });
    }
});

// DELETE a track by ID
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM tracks WHERE TrackId = ?').run(id);
    result.changes ? res.status(200).send({ message: 'Track deleted' }) : res.status(404).send({ message: 'Track not found' });
});

export default router;