const express = require('express')
const Redis = require('ioredis')
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


const app = express()
app.use(express.json())


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


app.post('/payment', async (req, res) => {
    const data = req.body
    const s = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: data.name,
                    },
                    unit_amount: data.unit_amount,
                },
                quantity: data.quantity,
            }
        ],
        mode: 'payment',
        success_url: 'https://learn.microsoft.com/en-us/azure/devops/cli/?view=azure-devops',
        cancel_url: 'https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/',
    })
    //res.redirect(303, s.url)
    res.send(s.url)
})

app.listen(6800, () => {
    console.log("Te estoy escuchando")
})