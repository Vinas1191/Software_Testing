import express from "express";
import multer from "multer";
import { db } from "../app.js";
import { validateAlbumPost, validateAlbumPatch } from "../validator.js";
import {generateInsertStatement} from "../sqlGenerator.js"

const storage = multer.diskStorage({
    destination: './_FrontendStarterFiles/albumart',
    filename: function(req, file, callback) {
        const albumArt = `albumart_${file.originalname}`
        callback(null, albumArt);
    }
})

const upload = multer({storage: storage})

const router = express.Router() 

//route for get all the albums
router.get('/', (req, res) => {
    try {
        const statement = db.prepare('SELECT * FROM albums');
        const data = statement.all();
        res.send(data);
    } catch (error) {
        console.error('Error fetching artists:', error);
        res.status(500).send('Internal Server Error');
    }
});

// GET specific album by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    const track = db.prepare('SELECT * FROM albums WHERE AlbumId = ?').get(id);
    track ? res.status(200).send(track) : res.status(404).send({ message: 'Album not found' });
});

// Route to get all tracks for a specific album
router.get('/:albumId/tracks', (req, res) => {
    const albumId = req.params.albumId;
    
    try {
        const tracks = db.prepare(`SELECT * FROM tracks WHERE AlbumId = ?`).all(albumId);
        
        if (!tracks) {
            return res.status(404).json({ message: 'No tracks found for this album.' });
        }

        // Return the list of tracks as JSON
        res.status(200).json(tracks);
    } catch (error) {
        console.error('Error fetching tracks for album:', error);
        res.status(500).json({ message: 'Failed to fetch tracks. Please try again later.' });
    }
});


//route for delete album
router.delete('/:id', (req, res) => {
    try {
        const statement = db.prepare("DELETE FROM albums WHERE AlbumId = ?")
        const changes  =  statement.run(req.params.id)
        res.status(204).send(changes)
    } catch (error) {
        res.status(500).send(error)
    }
})

// route for add album
router.post('/', (req, res) => {
    try {
        const validationResult = validateAlbumPost(req.body)
    
        if(validationResult){
            return res.status(422).send(validationResult)
        }
        const {sql , values} = generateInsertStatement("albums" , req.body)

        const statement = db.prepare(sql)
        const result = statement.run(values)
        res.status(201).json(result) // temporary send
    
    } catch (err) {
        res.status(500).json({mesaage: "try again later"})
    }
});

// route for update album
router.patch('/:id', (req, res) => {
    try {
        const validationResult = validateAlbumPatch(req.body);

        // Handle validation errors
        if (validationResult) {
            return res.status(422).json(validationResult);
        }

        const update = db.prepare('UPDATE albums SET Title = ?, ReleaseYear = ?, ArtistId = ? WHERE AlbumId = ?');

        const result = update.run(req.body.Title, req.body.ReleaseYear, req.body.ArtistId, req.params.id);  

        // Check if the artist was found
        if (!result) {
            return res.status(404).json({ message: 'Album not found' });
        }

        res.status(200).json({ message: 'Album updated successfully' });

    } catch (err) {
        console.error(err); 
        res.status(500).json({ message: 'Try again later' });
    }
});

// route for upload album image by album id
router.post('/:albumId/albumart', upload.array('albumart'), (req, res) => {
    const albumId = req.params.albumId;
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).send({ error: 'No file uploaded or invalid file type.' });
    }

    const filename = files[0].filename;  // Use the first uploaded file
    const updateStatement = `UPDATE albums SET AlbumArt = ? WHERE AlbumId = ?`;
    db.prepare(updateStatement).run(filename, albumId); 

    res.status(200).json({
        filename : files.filename,
        message: `Album art ${filename} uploaded successfully.`
    });
});


export default router;