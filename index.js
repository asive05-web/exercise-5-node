

import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import express from 'express';

config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
});

app.get('/products', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM products');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error getting products');
    }
});

app.post('/products', async (req, res) => {
    const { product_code, name, price, product_quantity } = req.body;

    if (!product_code || !name || !price || !product_quantity) {
        return res.status(400).send('Missing required fields');
    }

    try {
        const [rows] = await pool.execute('SELECT * FROM products WHERE product_code = ?', [product_code]);
        
        if (rows.length > 0) {
            return res.status(400).send('Product with this product_code already exists');
        }

        const [result] = await pool.execute(
            'INSERT INTO products (product_code, name, price, product_quantity) VALUES (?, ?, ?, ?)',
            [product_code, name, price, product_quantity]
        );

        res.status(201).json({
            message: 'Product created successfully',
            product: {
                product_code,
                name,
                product_quantity,
                id: result.insertId,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error inserting product');
    }
});

app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Product not found');
        }

        res.status(200).send('Product deleted successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting product');
    }
});

app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const { product_code, name, price, product_quantity } = req.body;

    if (!product_code || !name || !price || !product_quantity) {
        return res.status(400).send('Missing required fields');
    }

    try {
        const [result] = await pool.execute(
            'UPDATE products SET product_code = ?, name = ?, price = ?, product_quantity = ? WHERE id = ?',
            [product_code, name, price, product_quantity, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send('Product not found');
        }

        res.status(200).json({
            message: 'Product updated successfully',
            product: { id, product_code, name, product_quantity }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating product');
    }
});

app.get('/users', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM users');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error getting users');
    }
});

app.get('/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).send('User not found');
        }

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error getting user');
    }
});

app.post('/users', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send('Missing required fields');
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password]
        );

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: result.insertId,
                username,
                email
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error inserting user');
    }
});

app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).send('User not found');
        }

        res.status(200).send('User deleted successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting user');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
g
