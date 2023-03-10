const Jimp = require('jimp');
const { Pool } = require('pg');
require("dotenv").config();
const processing = require('./app.js'); 


const credentials  = {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE
}

async function loadImage(car_id, image){
    try{
        query = 'INSERT INTO images(car_id, image) VALUES ($1, $2);'
        values =[car_id, image]
        await pool.query(query, values)
        .then(()=>{console.log("Updated ", car_id)})
        .catch((err) => console.error('Error executing query', err.stack))
    }
    catch(err){
        console.log(err)
    }
}
  

async function deleteImage(car_id){
    try{
        query = 'DELETE FROM images WHERE car_id=$1;'
        values =[car_id]
        await pool.query(query, values)
        .then(()=>{console.log("deleted ", car_id)})
        .catch((err) => console.error('Error executing query', err.stack))
    }
    catch(err){
        console.log(err)
    }
}
    

  
async function addwatermark(img){
    try{
        if(img === null){
            console.log("image is null")
            return null
        }
        console.log("adding watermark")
        img =  Buffer.from(img.split(',')[1], 'base64');
        var image = await Jimp.read(img)
        font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)
        image = await image.print(font, 10, 10, 'solncar.com')
        .getBufferAsync('image/jpeg')
        // .write('org.jpeg');
        return "data:image/jpeg;base64," + image.toString('base64')
    }catch(err){
        console.log(err)
    }
   
}

offset =47330-2-1000
limit  = 10000
var pool = new Pool(credentials)


async function loading(){
    for (i=offset; i>offset-limit ;i--){
        console.log("started for ", i)
        query = `
        select car_id, image from images 
        where car_id = $1 
        `
        res = await pool.query(query,[i])
        res = res.rows
        await deleteImage(i)
        console.log("started loading images")
        for(j=0;j<20;j++){
            r = res[j]
            if(r && r.image !== null && r.image !== undefined && r.image!==''){
                var img = await addwatermark(r.image)
                await loadImage(r.car_id, img)
            }
        }
        console.log("Done adding images")
    }
}

loading()

