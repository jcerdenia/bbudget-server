const express = require('express');
const mongoose = require('mongoose');
const app = express();
const userRoutes = require('./routes/user');
const cors = require('cors');

require('dotenv').config();

mongoose.connection.once('open', () => {
	console.log('Connected to MongoDB Atlas.')
});

mongoose.connect(process.env.DB_CONNECTION_STRING, { 
	useNewUrlParser: true, 
	useUnifiedTopology: true 
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/users', userRoutes);

app.get('./', () => {
	console.log("Successfully hosted online.")
});

app.listen(process.env.PORT, () => {
	console.log('API is up and running.')
});