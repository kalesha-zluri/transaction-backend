import express,{Application,Request,Response} from 'express';
import {mainRouter} from './app/routes/index';
import dotenv from 'dotenv';
import multer from "multer";

dotenv.config();
const app:Application = express();
const PORT = process.env.PORT || 3000;

//middlewarre
app.use(express.json());
const upload = multer();
app.use(upload.single('file'));

//routes
app.use('/api/v1',mainRouter);



app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});
