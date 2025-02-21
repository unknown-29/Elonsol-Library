// process.on('uncaughtException', () => {
// 	console.log('uncaughtExceptionError');
// });

import express from 'express';
import dbConnection from './database/dbConnection.js';
import userRouter from './src/modules/User/user.router.js';
import bookRouter from './src/modules/Book/book.router.js';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { AppError } from './src/utils/AppError.js';
import { globalErrorHandling } from './src/utils/globalErrorHandling.js';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		allowedHeaders: ['Content-Type'],
		credentials: true,
	},
});
const port = 5000;

app.use(
	cors({
		origin: '*',
		credentials: true,
	})
);
app.use(express.json());
app.use(express.static('uploads'));

dbConnection();

app.use('/user', userRouter);
app.use('/book', bookRouter);

app.all('*', (req, res, next) => {
	next(new AppError('Invalid url. Page not found', 404));
});

app.use(globalErrorHandling);

app.set('socketio', io);
// export { io };
// const io = require('socket.io')(server); // assuming `server` is your HTTP server

server.listen(process.env.PORT || port, () => {
	io.on('connection', (socket) => {
		console.log('connected', socket.id);
		socket.on('disconnect', () => {
			console.log(`Socket ${socket.id} disconnected`);
			// Perform additional cleanup logic here if necessary
		});
	});
	console.log(`Server is running on port: ${process.env.PORT} .......`);
});

// process.on('unhandledRejection', () => {
// 	console.log('unhandledRejectionError');
// });
