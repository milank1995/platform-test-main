import express from 'express'
import cors from 'cors'
import CsvReadableStream from "csv-reader";
import fs from 'fs'
import probe from 'probe-image-size'
const app = express()

app.use(cors())
const multer =require("multer");
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "./uploads")
  },
  filename (req, file, cb) {
    cb(null , file.originalname)
  }
})

const upload = multer({ storage })
app.get('/', (req, res) => {
  res.send('This is from express.js')
})

app.post('/upload', upload.single("file"), async (req, res) => {
  const {file} = req;
  let results = [];
  let inputStream = await fs.createReadStream(`./uploads/${file.originalname}`, 'utf8');

  await inputStream
      .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true, delimiter: ';', skipHeader: true, asObject: true }))
      .on('data',  function (row) {
        results.push(row)
      }).on('end', async () => {
          const data =results.map( async item =>
              {
                  let dimension, isError = false;
                  try{
                      dimension = item.url ? await probe(item.url || '', function (err, result) {
                          console.log(err, result)
                      }) : {};
                  } catch (e) {
                      dimension = {}
                      isError = true
                  }

                  return {
                      name: item.name,
                      id: item.id || item['"id"'] || 0,
                      Error: isError,
                      picture: {
                          url: item.url,
                          width: dimension.width || 0,
                          height: dimension.height || 0
                      }
                  }

              }
          )
          const data1 =  await Promise.all(data);
          const ValidData = data1.filter(item => !item.Error)
          const ErrorData = data1.filter(item => item.Error)
          res.send({data: ValidData, error: ErrorData})
      } )

})

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`server started on port ${port}: http://localhost:${port}`)
})
