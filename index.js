const express = require('express')
const Redis = require('ioredis')
const cors = require('cors')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
//const stripe = require('stripe')('sk_test_51NsZs5FImhX97v5dFA6IswjfcOIcBLWAoTFQDkiflXxnr99P1BwTlec0G0Y3EEkNnqvD3ekR2JzYYUCUPRLBkk4G007wHTMI92')
/*const redis = require('redis')

const host = process.env.REDIS_HOST
const client = redis.createClient({
    url: `redis://${host}:6379`
});

(async () => {
    await client.connect();
})();

client.on('connect', () => {
    console.log("Connected to redis")
})

client.on('error', (err) => {
    console.log('Error connecting to Redis:', err);
})*/

const host = process.env.REDIS_HOST
const client = new Redis(`redis://${host}:6379`)

// const client = new Redis(`redis://192.168.49.2:30001`)
///////const client = new Redis(`redis://localhost:6379`)


var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 
}
const app = express()
app.use(express.json())
app.use(cors())
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.get('/', (req, res) => {
    res.send("I'm alive and working")
})

app.get('/getValue/:key', (req, res) => {
    const k = req.params.key

    client.get(k, (err, value) => {
        if (err) res.send("Error getting value")
        else res.send(value)
    })
})

app.get('/keysPayment', (req, res) => {
    client.keys('*', (err, keys) => {
        if (err) res.send("Error getting keys")
        else res.send(keys)
    })
})


app.post('/save/:key', (req, res) => {
    const k = req.params.key
    const data = req.body

    client.set(k, JSON.stringify(data), (err, val) => {
        if (err) {
            res.status(500).send("Error saving value")
            console.error(err)
        }
        else res.send("Exito")
    })
})

function createItem(data) {
    const product = data.donation? {
        name: data.name, 
        description: `Tipo de animal: ${data.type_animal}`,
        metadata: data.metadata,
        images: ['https://animalgenetics.com/wp-content/uploads/2023/01/ANIMAL-ICONS-CANINE.png']
    } : {
        name: "Donación",
        images: ['https://cdn-icons-png.flaticon.com/512/5316/5316685.png']
    }

    const item = [
        {
            price_data: {
                currency: 'usd',
                product_data: product,
                unit_amount: data.unit_amount,
            },
            quantity: data.quantity,
        }
    ]
    return item
}

app.post('/payment',async (req, res) => {
    const data = req.body
    const item = createItem(data)

    const s = await stripe.checkout.sessions.create({
        line_items: item,
        mode: 'payment',
        success_url: 'http://localhost:3000/Registro-Pago/?success=true&session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:3000/Registro-Pago/?success=false',
    })

    //res.send(s.url)
    res.json({url: s.url})
})

function dataPayment(data) {
    const sessionPayment = {
        amount_subtotal: null,
        amount_total: null,
        created: null,
        currency: null,
        customer_details: null,
        mode: null,
        payment_intent: null,
        payment_method_types: null,
        payment_status: null,
        status: null
    }

    for (const key in sessionPayment)
        sessionPayment[key] = data[key]

    return sessionPayment
}

app.get('/order', async (req,res) => {
    const s = await stripe.checkout.sessions.retrieve(req.query.session_id)
    const paymentObj = dataPayment(s)

    client.set(s['id'], JSON.stringify(paymentObj), (err, val) => {
        if (err) 
            res.status(500).json({message: "Error saving value in redis "})
        else 
            res.json({message: "Saved"})
    })
})

app.listen(80, () => {
    console.log("Te estoy escuchando")
})