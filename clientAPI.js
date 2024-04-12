const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const redis = require('ioredis');

const client = redis.createClient();

router.use(bodyParser.json());

// POST /client-operation
router.post('/api', (req, res) => {
    const { MsgType, OperationType, TenantId, OSMId, ClientId, ClientName } = req.body;
    switch(OperationType) {
        case 100:
            addClient(MsgType, TenantId, OSMId, ClientId, ClientName, res);
            break;
        case 101:
            updateClient(TenantId, OSMId, ClientId, ClientName, res);
            break;
        case 102:
            deleteClient(TenantId, OSMId, ClientId, res);
            break;
        case 103:
            getClient(TenantId, OSMId, ClientId, res); 
            break;
        case 104:
            getAllClients(res);
            break;
        default:
            res.status(400).json({ message: 'Invalid OperationType' });
    }
});

// Function to add a client
function addClient(MsgType, TenantId, OSMId, ClientId, ClientName, res) {
    const key = `${TenantId}_${OSMId}_${ClientId}`;
    console.log(`${TenantId}_${OSMId}_${ClientId}`);
    const clientInfo = {
        MsgType,
        OperationType: 100,
        TenantId,
        OSMId,
        ClientId,
        ClientName
    };
    client.set(key, JSON.stringify(clientInfo), (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.status(201).json({ message: 'Client added successfully' });
    });
}

// Function to update a client
function updateClient(TenantId, OSMId, ClientId, ClientName, res) {
    const key = `${TenantId}_${OSMId}_${ClientId}`;
    client.exists(key, (err, exists) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (!exists) {
            res.status(404).json({ message: 'Client not found' });
            return;
        }
        const clientInfo = {
            MsgType: 1121,
            OperationType: 102,
            TenantId,
            OSMId,
            ClientId,
            ClientName
        };
        client.set(key, JSON.stringify(clientInfo), (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.json({ message: 'Client updated successfully' });
        });
    });
}

// Function to delete a client
function deleteClient(TenantId, OSMId, ClientId, res) {
    const key = `${TenantId}_${OSMId}_${ClientId}`;
    client.del(key, (err, deletedCount) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (deletedCount === 1) {
            res.json({ message: 'Client deleted successfully' });
        } else {
            res.status(404).json({ message: 'Client not found' });
        }
    });
}

// Function to get a client
function getClient(TenantId, OSMId, ClientId, res) {
    const key = `${TenantId}_${OSMId}_${ClientId}`;
    client.get(key, (err, clientInfo) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (clientInfo) {
            res.json(JSON.parse(clientInfo));
        } else {
            res.status(404).json({ message: 'Client not found' });
        }
    });
}

// Function to get all clients
function getAllClients(res) {
    client.keys('*', (err, keys) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (keys.length === 0) {
            res.json([]);
            return;
        }
        client.mget(keys, (err, clients) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            const clientInfoList = [];
            clients.forEach(clientInfo => {
                try {
                    const parsedClientInfo = JSON.parse(clientInfo);
                    clientInfoList.push(parsedClientInfo);
                } catch (error) {
                    console.error('Error parsing client data:', error);
                    // Log the error and continue processing other clients
                }
            });
            res.json(clientInfoList);
        });
    });
}



module.exports = router;
