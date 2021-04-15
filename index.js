const express = require('express');
const mongoose = require('mongoose');
const app = express();

require('dotenv').config();

mongoose.connection.once('open', () => console.log('Connected to MongoDB Atlas.'));
mongoose.connect(process.env.DB_CONNECTION_STRING, { 
	useNewUrlParser: true, 
	useUnifiedTopology: true 
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(process.env.PORT, () => {
	console.log('API is up and running.')
})