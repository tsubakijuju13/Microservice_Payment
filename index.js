const express = require('express')
const Redis = require('ioredis')
const cors = require('cors')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
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
app.use(cors(corsOptions))

app.get('/', (req, res) => {
    res.send("I'm alive and working")
})

app.get('/:key', (req, res) => {
    const k = req.params.key

    client.get(k, (err, value) => {
        if (err) res.send("Error getting value")
        else res.send(value)
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
        success_url: 'http://localhost:3000/Registro-Pago/?success=true',
        cancel_url: 'http://localhost:3000/Registro-Pago/?success=false',
    })

    //res.send(s.url)
    res.json({url: s.url})
})

app.listen(6800, () => {
    console.log("Te estoy escuchando")
})