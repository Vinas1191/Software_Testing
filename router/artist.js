import express from "express";
import { db } from "../app.js";
import { validateArtistPost, validateArtistPatch } from "../validator.js";
import { generateInsertStatement } from "../sqlGenerator.js"

const router = express.Router() 

// GET all the routes
router.get('/', (req, res) => {
    try {
        const statement = db.prepare('SELECT * FROM artists');
        const data = statement.all();
        res.send(data);
    } catch (error) {
        console.error('Error fetching artists:', error);
        res.status(500).send('Internal Server Error');
    }
});

// GET specific artist by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    const track = db.prepare('SELECT * FROM artists WHERE ArtistId = ?').get(id);
    track ? res.status(200).send(track) : res.status(404).send({ message: 'Artist not found' });
});

// DELETE specific artist
router.delete('/:id', (req, res) => {
    try {
        const statement = db.prepare("DELETE FROM artists WHERE ArtistId = ?")
        const changes  =  statement.run(req.params.id)
        res.status(204).send(changes)
    } catch (error) {
        res.status(500).send(error)
    }
})

// route for add artist
router.post('/', (req, res) => {
    try {
        const validationResult = validateArtistPost(req.body)
    
        if(validationResult){
            return res.status(422).send(validationResult)
        }
        const artistName = req.body.Name;
        const insert = db.prepare("INSERT INTO artists (Name) VALUES (?)");
        const result = insert.run(artistName);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({mesaage: "try again later"})
    }
});

//route for get artist by search
router.get('/search/:searchTerm', (req, res) => {
    const searchTerm = req.params.searchTerm;

    const search = db.prepare("SELECT * FROM artists WHERE name like ?");   
    const data = search.all(`%${searchTerm}%`)

    res.send(data)
});

//route for get specific artist
router.get('/:artistId/albums', (req, res) => {
    const artistId = req.params.artistId;

    try {
        const statement = db.prepare('SELECT * FROM albums WHERE ArtistId = ?');
        const albums = statement.all(artistId);

        if (!albums) {
            res.status(404).send({ error: "No albums found for this artist" });
        } else {
            res.send(albums); 
        }
        
    } catch (error) {
        console.error('Error fetching albums:', error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

//route for get update artist
router.patch('/:id', (req, res) => {
    try {
        const validationResult = validateArtistPatch(req.body);

        // Handle validation errors
        if (validationResult) {
            return res.status(422).json(validationResult);
        }

        const update = db.prepare('UPDATE artists SET Name = ? WHERE ArtistId = ?');

        const result = update.run(req.body.Name, req.params.id);  

        // Check if the artist was found
        if (!result) {
            return res.status(404).json({ message: 'Artist not found' });
        }

        res.status(200).json({ message: 'Artist updated successfully' });

    } catch (err) {
        console.error(err); 
        res.status(500).json({ message: 'Try again later' });
    }
});


export default router;