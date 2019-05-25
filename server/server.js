
//using express to create servert
const express  = require('express');
const app = express();
//install cors and require express to use it to allow request to pass browser authentication
const cors = require('cors');
app.use(cors())

//install body parser and require express to use it to allow body requests in json format to be understood
const bodyParser = require('body-parser')
app.use(bodyParser.json());

const port = process.env.PORT || 5000;

var knex = require('knex');
const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: true,
         //host: '127.0.0.1',
        /* user: 'postgres',
        password: 'postgres',
        database: 'lbdb' */
    }
});

//dev:
//app.listen(port, () => console.log(`Listening on port ${port}`));
//prod:
app.listen(port, () => console.log(`Listening on port ${port}`));



//GET route
/* app.get('http://localhost:5000/?stage=clock', (req, res) => {
    res.text("hello" );
});  */
app.get('/clock', (req, res) => {
    let subbedQr = req.query.qr;
    db('contractors').select('*').where('qrcode', subbedQr).then(response => res.json(response))
}); 

app.post('/api/contractor', (req, res) => {   
    console.log(req.body.QrCode)
    db('contractors').select('*').where('qrcode', req.body.QrCode).then(response => res.json(response))
});
        
    //console.log(activeContractor.length);
    //(activeContractor.length > 0) ? res.json(activeContractor) : 

app.post('/api/express0', (req, res) => {
    const { ClockID, Comment, QrCode, Stage } = req.body;
    const { id } = req.body.Contractor;
    const { Type, BrowserTime } = req.body.Clocking;
    let newClockData = {
        clockid: ClockID,
        contractorid: id,
        qrcodeused: QrCode,
        clockcomment: Comment,
        clocktype: Type,
        date: BrowserTime,
        stage: Stage
    }

    const newContractor = {
        firstname: req.body.Contractor.FirstName,
        lastname: req.body.Contractor.LastName,
        phonenumber: req.body.Contractor.PhoneNumber,
        active: true,
        qrcode: QrCode
    }

    async function addNewContractor() {
        let insertNewContractorResponse = await db('contractors').insert(newContractor, ['id']);
        let updatedClockAction = Object.assign(newClockData, {
            contractorid: insertNewContractorResponse[0].id
        })
        console.log(updatedClockAction);
        return newClockAction()
    }

    async function newClockAction() {
        let newClockResponse = await db('clock').insert(newClockData, ['*']);
        let confirmedUpdate = await res.json(newClockResponse);
        console.log(confirmedUpdate);

        return confirmedUpdate;
    }

    (req.body.Stage === 'New') ? addNewContractor() : newClockAction()
    
})


/* app.post('/api/express0new', (req, res, err) => {
    if (req.body.Stage === 'New') {
        console.log(req.body);
        const newContractor = {
            firstname: req.body.Contractor.FirstName,
            lastname: req.body.Contractor.LastName,
            phonenumber: req.body.Contractor.PhoneNumber,
            active: true,
            qrcode: Math.random().toString(36).substring(2, 7).toUpperCase()
        }
        console.log("newContractor:")
        console.log(newContractor);
        db('contractors').insert(newContractor)
            .then(console.log)
            .then(newContractor => {
                return res.json(newContractor)
            })
            .catch(err => res.status(400).json('unable to save'))
        }
    clockActions.push(req.body);
    res.json(clockActions);
        })
    

app.post('/api/express0', (req, res, err) => {
    
    console.log(req.body);
    const { ClockID, Comment, QrCode, Stage } = req.body;
    const { id, } = req.body.Contractor;
    const { Type, BrowserTime} = req.body.Clocking;
    const newClockAction = {
        clockid: ClockID,
        contractorid: id,
        qrcodeused: QrCode,
        clockcomment: Comment,
        clocktype: Type,
        date: BrowserTime,
        stage: Stage
    }
    console.log("newClockAction[0]:")
    console.log(newClockAction);
    db('clock').insert(newClockAction, ['*'])
        .then(console.log)
        .then(response => res.json(response))
        .catch(err => {
            console.log(err);
            res.status(400).json('unable to register')})

    
    
    //res.send({ contractors })
    //console.log(req);
    
}); */

app.get('/api/status', (req, res ) => {
    //console.log("fullreq:");
    //console.log(req);
    //console.log("params:");
    //console.log(req.params);
    console.log("headers:");
    console.log(req.headers);
    //console.log("body:");
    //console.log(req.body)
    const id  = req.headers.id;
    const qr = req.headers.qr;

    console.log("id:");
    console.log(id);
    if (id !== '*') {
    db('contractors')
        .select(['contractors.id', 'contractors.firstname', 'contractors.lastname', 'clock.clocktype', 'clock.date', 'clock.clockcomment', 'clock.clockid'])
        .innerJoin('clock', 'contractors.id', 'clock.contractorid')
        .where(db.raw(`date_trunc('day', date) = current_date`))
        .andWhere('contractors.id', id).orWhere('contractors.qrcode', qr)
        .orderBy(['contractors.id', { column: 'clock.clocktype', order: 'asc' }])
            .then(data => {
            console.log(data);
             if (data.length) {
                console.log("Today sent OK") 
                return res.json(data);

            } else {
                return res.status(400).json("Not Clocked in/out Today")
            }
        })
         .catch(err => {
            console.log(err);
            res.status(400).json("Tech problems")
        }) 
    } else {
        db('contractors')
            .select(['contractors.id', 'contractors.firstname', 'contractors.lastname', 'clock.clocktype', 'clock.date', 'clock.clockcomment', 'clock.clockid'])
            .innerJoin('clock', 'contractors.id', 'clock.contractorid')
            .where(db.raw(`date_trunc('day', date) = current_date`))
            //.andWhere('contractors.id', id)
            .orderBy(['contractors.id', { column: 'clock.clocktype', order: 'asc' }])
            .then(data => {
                console.log(data);
                if (data.length) {
                    console.log("Today sent OK")
                    return res.json(data);

                } else {
                    return res.status(400).json("Not Clocked in/out Today")
                }
            })
            .catch(err => {
                console.log(err);
                res.status(400).json("Tech problems")
            })
    }
})

app.get('/api/active', (req, res) => {
    console.log("fullreq:");
    console.log(req);
    console.log("params:");
    console.log(req.params);
    console.log("headers:");
    console.log(req.headers);
    console.log("body:");
    console.log(req.body)
    const id = req.headers.id;
    console.log("id:");
    console.log(id);
    db.select('*').from('contractors').where('active', true)
    .then(data => {
            console.log(data);
            if (data.length) {
                console.log("Active sent OK")
                return res.json(data);
            } else {
                return res.status(400).json("No active")
            }
        })
        .catch(err => {
            console.log(err);
            res.status(400).json("Tech problems - no data retrieved")
        })
})


