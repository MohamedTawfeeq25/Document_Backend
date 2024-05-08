const express=require('express');
const app=new express();
const mysql=require('mysql');
const dotenv=require('dotenv').config();
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const body_parser=require('body-parser');
const multer=require('multer');
const path=require('path');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
app.use(body_parser.json());
app.get('/',(req,res)=>{
    console.log(req);
    res.json({data:"done"});
});
//API for documen upload
app.post('/auth/upload', upload.single('pdf'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log(req.file);
    console.log(req.body);

    const studentId = req.body.studentId;
    const documentId = req.body.documentId;
    const university = req.body.university;

    // Directory path for the university
    const universityDir = path.join(__dirname, 'uploads', university);

    // Check if the directory for the university exists
    if (!fs.existsSync(universityDir)) {
        // If the directory doesn't exist, create it
        fs.mkdirSync(universityDir);
    }

    // Directory path for the specific studentId inside the university
    const studentDir = path.join(universityDir, studentId);

    // Check if the directory for the studentId exists inside the university
    if (!fs.existsSync(studentDir)) {
        // If the directory doesn't exist, create it
        fs.mkdirSync(studentDir);
    }

    // Construct the new path for the file
    const newFileName = req.file.originalname.slice(0, req.file.originalname.length - 4) + "_" + studentId + "_" + university + ".pdf";
    const newPath = path.join(studentDir, newFileName);

    // Check if the file already exists
    if (fs.existsSync(newPath)) {
        console.log('File already exists');
        return res.status(400).json({ error: 'Document already exists' });
    }

    // Rename and move the file
    fs.rename(req.file.path, newPath, err => {
        if (err) {
            console.error('Error moving file:', err);
            return res.status(500).json({ error: 'Failed to save the file' });
        }
        console.log('File uploaded successfully');
        /* 
        Write the code to store the data in MongoDB
        */

        res.status(200).json({ message: 'File uploaded successfully' });
    });
});
//API for fetch Document
app.post('/auth/document', (req, res) => {
    const university = req.body.university;
    const studentId = req.body.studentId;

    // Directory path for the university
    const universityDir = path.join(__dirname, 'uploads', university);

    // Check if the directory for the university exists
    if (!fs.existsSync(universityDir)) {
        // If the directory doesn't exist, send an empty response
        return res.json({ files: [] });
    }

    // Directory path for the specific studentId inside the university
    const studentDir = path.join(universityDir, studentId);

    // Check if the directory for the studentId exists inside the university
    if (!fs.existsSync(studentDir)) {
        // If the directory doesn't exist, send an empty response
        return res.json({ files: [] });
    }

    // Read the contents of the student's directory
    fs.readdir(studentDir, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Filter out only the file names
        const fileNames = files.filter(file => fs.statSync(path.join(studentDir, file)).isFile()).map(file => file);

        // Send the list of file names as a response
        res.json({ files: fileNames });
    });
});
//API for document VErification
app.post('/auth/university/verify',upload.single('pdf'), (req, res) => {
    const studentId = req.body.studentId;
    const university = req.body.university;
    
    const fileName = req.file.originalname.slice(0, req.file.originalname.length - 4) + "_" + studentId + "_" + university + ".pdf";
    console.log(fileName);

    const universityDir = path.join(__dirname, 'uploads', university);


    if (!fs.existsSync(universityDir)) {
        return res.json({ verified: false });
    }

    const studentDir = path.join(universityDir, studentId);

    if (!fs.existsSync(studentDir)) {
        return res.json({ verified: false });
    }

   
    const filePath = path.join(studentDir, fileName);

   
    if (fs.existsSync(filePath)) {
        
        console.log("verfied");
        /*
        update the status in mongodb for the file name status to verified
        */
        return res.json({ verified: true });
    } else {
       
        return res.json({ verified: false });
    }
});
app.post('/auth/company/submit',(req,res)=>{
    var cmp=req.body.cmp;
    var doc=req.body.doc;
    var uni=req.body.uni;
    var st_id=req.body.st_id;

    /*
    {
        cmpName:req.body.cmp,
        docu:req.body.doc,
        uni
    }
    */
});
app.post('/auth/company/doc',(req,res)=>{
    var cmp=req.body.cmp;
    /*
    get the list of document

    */
})
app.post('/auth/company/verify',(req,res)=>{
    var doc=req.body.doc;

})
app.listen(2000,()=>{console.log("server started")});