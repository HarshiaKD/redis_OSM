const express = require('express');
const bodyParser = require('body-parser');
const clientAPI = require('./clientAPI');
const orderAPI = require('./orderAPI');
const app = express();

// Configure body-parser middleware to parse JSON
app.use(bodyParser.json());

// Mount API routers
app.post('/api', (req, res) => {
    const { MsgType } = req.body;

    // Check MsgType and route accordingly
    if (MsgType === 1121) {
        // Route to clientAPI
        clientAPI(req, res);
    } else if (MsgType === 1120) {
        // Route to orderAPI
        orderAPI(req, res);
    } else {
        res.status(400).json({ message: 'Invalid MsgType' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
