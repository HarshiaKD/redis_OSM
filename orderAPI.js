const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const redis = require('ioredis');

const client = redis.createClient();

router.use(bodyParser.json());

// POST /order-operation
router.post('/api', (req, res) => {
    const { MsgType, OperationType, TenantId, OSMId, OrderType, Token, OrderPrice, OrderQty, ClientId, ClientName,OrderId } = req.body;

    switch(OperationType) {
        case 100:
            addOrder(MsgType, TenantId, OSMId, OrderType, Token, OrderPrice, OrderQty, ClientId, ClientName,OrderId, res);
            break;
        case 101:
            updateOrder(MsgType, TenantId, OSMId,OrderType, Token, OrderPrice, OrderQty, ClientId, ClientName,OrderId, res);
            break;
        case 102:
            deleteOrder(MsgType, TenantId, OSMId, Token, ClientId, res);
            break;
        case 103:
            getOrder(MsgType, TenantId, OSMId, Token, ClientId, res);
            break;
        case 104:
            getAllOrders(req, res);
            break;
        default:
            res.status(400).json({ message: 'Invalid OperationType' });
    }
});

// Function to add an order
function addOrder(MsgType, TenantId, OSMId, OrderType, Token, OrderPrice, OrderQty, ClientId, ClientName,OrderId, res) {
    // Check if ClientId is present
    client.exists(`${TenantId}_${OSMId}_${ClientId}`, (err, exists) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (!exists) {
            res.status(404).json({ message: 'Client not found' });
            return;
        }

        // Add the order
        const orderInfo = { MsgType, TenantId, OSMId, OrderType, Token, OrderPrice, OrderQty, ClientId, ClientName,OrderId };
        const key = `${TenantId}_${OSMId}_${ClientId}_${Token}`;
        client.hset(key, 'OrderInfo', JSON.stringify(orderInfo), (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(200).json({ message: 'Order added successfully' });
        });
    });
}

// Function to update an order
function updateOrder(MsgType, TenantId, OSMId,OrderType, Token, OrderPrice, OrderQty, ClientId, ClientName,OrderId, res) {
    // Check if ClientId is present
    client.exists(`${TenantId}_${OSMId}_${ClientId}`, (err, exists) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (!exists) {
            res.status(404).json({ message: 'Client not found' });
            return;
        }

        // Update the order
        const orderInfo = { MsgType, TenantId, OSMId, OrderType, Token, OrderPrice, OrderQty, ClientId, ClientName,OrderId };
        const key = `${TenantId}_${OSMId}_${ClientId}_${Token}`;
        client.hset(key, 'OrderInfo', JSON.stringify(orderInfo), (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(200).json({ message: 'Order updated successfully' });
        });
    });
}

// Function to delete an order
function deleteOrder(MsgType, TenantId, OSMId, Token, ClientId, res) {
    // Check if ClientId is present
    client.exists(`${TenantId}_${OSMId}_${ClientId}`, (err, exists) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (!exists) {
            res.status(404).json({ message: 'Client not found' });
            return;
        }

        // Delete the order
        const key = `${TenantId}_${OSMId}_${ClientId}_${Token}`;
        client.hdel(key, 'OrderInfo', (err, deletedCount) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            if (deletedCount === 0) {
                res.status(404).json({ message: 'Order not found' });
                return;
            }
            res.status(200).json({ message: 'Order deleted successfully' });
        });
    });
}

// Function to get an order for a particular ClientId
function getOrder(MsgType, TenantId, OSMId, Token, ClientId, res) {
    // Check if ClientId is present
    client.exists(`${TenantId}_${OSMId}_${ClientId}`, (err, exists) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (!exists) {
            res.status(404).json({ message: 'Client not found' });
            return;
        }

        // Get the order
        const key = `${TenantId}_${OSMId}_${ClientId}_${Token}`;
        client.hget(key, 'OrderInfo', (err, order) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            if (!order) {
                res.status(404).json({ message: 'Order not found' });
                return;
            }
            res.status(200).json(JSON.parse(order));
        });
    });
}


// Function to get all orders
function getAllOrders(req, res) {
    const { MsgType, TenantId, OSMId, ClientId } = req.body;
    const keyPattern = `[0-9]_[0-9]_[0-9]_[0-9]*`;
    client.keys(keyPattern, (err, keys) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (keys.length === 0) {
            // No orders found for the specified criteria
            res.status(404).json({ message: 'No orders found' });
            return;
        }
        // Fetch order information for each key
        const orders = [];
        let count = 0;
        keys.forEach(key => {
            client.hget(key, 'OrderInfo', (err, orderInfo) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }
                orders.push(JSON.parse(orderInfo));
                count++;
                if (count === keys.length) {
                    // All orders fetched
                    res.status(200).json(orders);
                }
            });
        });
    });
}


module.exports = router;