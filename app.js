import express from "express";
import Database from 'better-sqlite3';

//import routes
import artistRouter from "./router/artist.js";
import albumsRouter from "./router/album.js";
import tracksRouter from "./router/track.js";
import themesRouter from "./router/theme.js";
import mediaRouter from "./router/mediatypes.js"

const app = express()

export const db = new Database('./database/chinook.sqlite', {fileMustExist: true})

// middlewares
app.use(express.json()) //capture any payload in JSON format and assign to req.body
app.use(express.urlencoded({extended: true}))  //capture any payload in x-www-form-urlencoded and assign to req.body
app.use(express.static("_FrontendStarterFiles"))

//send all employees to the employees router
app.use('/api/artists', artistRouter);
app.use('/api/albums', albumsRouter);
app.use('/api/tracks', tracksRouter);
app.use('/api/themes', themesRouter);
app.use('/api/mediatypes', mediaRouter)

app.listen(3000, () => {
    console.log('listenning on port 3000');  
})