import moment from 'moment';
import bookModel from '../../../database/models/bookModel.js';
import userModel from '../../../database/models/userModel.js';
import { AppError } from '../../utils/AppError.js';
import { catchAsyncError } from '../../utils/catchAsyncError.js';
import { Storage, File } from 'megajs';
import dotenv from 'dotenv'
import Datauri from 'datauri/parser.js';
import { v2 as cloudinary } from 'cloudinary'
import path from 'path'
import mongoose from 'mongoose';
/* https://gist.github.com/lanqy/5193417 */
dotenv.config()

// function bytesToSize(bytes) {
// 	var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
// 	if (bytes == 0) return 'n/a';
// 	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
// 	if (i == 0) return bytes + ' ' + sizes[i];
// 	return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
// }

export const downloadBook = catchAsyncError(async (req, res, next) => {
	try {
		const io = req.app.get('socketio');
		// console.log(req.params.bookId);
		const storage = await new Storage({
			email: 'sehirad634@payposs.com',
			password: 'sehirad634',
		}).ready;
		const { downloadUrl } = await bookModel.findOne({
			_id: new mongoose.Types.ObjectId(req.params.bookId)
		});
		// console.log(downloadUrl);
		const file = File.fromURL(downloadUrl);
		file
			.download()
			.on('progress', (ob) => {
				const percent = (ob.bytesLoaded / ob.bytesTotal) * 100;
				io.emit('downloadProgress', { percent });
			})
			.pipe(res);
	} catch (error) {
		next(new AppError('Book not uploaded by anyone yet', 404));
	}
	// console.log(file);
});

export const uploadBook = catchAsyncError(async (req, res, next) => {
	// console.log('uploadBook', req.file, req.params);
	// console.log('called ', req.params.bookId);
	console.log(req.params);

	const deleteBook = async function () {
		const book = await bookModel.deleteOne({ _id: new mongoose.Types.ObjectId(req.params.bookId) });
	}
	const io = req.app.get('socketio');
	try {
		const storage = await new Storage({
			email: 'sehirad634@payposs.com',
			password: 'sehirad634',
		}).ready;
		const file = storage.upload(
			{
				name: `${req.params.bookId.toString()}.pdf`,
				allowUploadBuffering: true,
			},
			req.file.buffer
		);
		file.on('progress', (ob) => {
			const percent = (ob.bytesUploaded / ob.bytesTotal) * 100;
			// console.log(percent, io.engine.clientsCount);
			io.emit('uploadProgress', { percent });
		});
		file.on('complete', (data) => {
			data.link().then(async (link) => {
				try {
					const book = await bookModel.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(req.params.bookId) }, {
						downloadUrl: link.toString(),
					});
					res.status(200).json({ status: 200, message: 'success' })
				} catch (error) {
					deleteBook()
					console.error(error);
					next(new AppError('failed to upload book', 500));
				}
			}).catch(() => {
				deleteBook()
				next(new AppError('failed to upload book', 500));
			});
		});
	} catch (err) {
		deleteBook()
		console.error(err);
	}

});

export const addBook = catchAsyncError(async (req, res, next) => {
	const dUri = new Datauri();
	const dataUri = req => dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);
	cloudinary.config({
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
	});
	if (req.file) {
		const file = dataUri(req).content;
		try {
			const result = await cloudinary.uploader.upload(file)
			const cover = result.url;
			const { name, category, author, description, contributedBy } = req.body;
			// console.log(contributedBy)
			const book = await bookModel.insertMany({
				name,
				category,
				author,
				cover,
				description,
				contributedBy: new mongoose.Types.ObjectId(contributedBy)
			});
			res.status(200).json({ status: 200, message: 'success', id: book[0]._id.toString() })
		} catch (error) {
			console.error(error)
			next(new AppError('failed to add book', 500));
		}
	}
});

export const updateBookFile = catchAsyncError(async (req, res, next) => {
	const storage = await new Storage({
		email: 'sehirad634@payposs.com',
		password: 'sehirad634',
	}).ready;
	const { bookId } = req.params
	const file = storage.find(`${bookId}.pdf`)
	// if (!file) { next(new AppError('File not found!', 404)); return; }
	if (file) await file.delete(true)
	return res.redirect(307, `/book/upload/${bookId}`);
})

export const updateBook = catchAsyncError(async (req, res, next) => {

	if (req.file) {
		const book = await bookModel.findOne({ _id: new mongoose.Types.ObjectId(req.params.bookId) })
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
		});
		cloudinary.uploader
			.destroy(book.cover.split('/').splice(-1)[0].split('.')[0])
			.then(async _ => {
				const dUri = new Datauri();
				const dataUri = req => dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);
				if (req.file) {
					const file = dataUri(req).content;
					try {
						const result = await cloudinary.uploader.upload(file)
						const cover = result.url;
						await bookModel.findByIdAndUpdate({ _id: new mongoose.Types.ObjectId(req.params.bookId) }, { ...req.body, cover })
						res.status(200).json({ status: 200, message: 'success', id: book._id.toString() })

					} catch (err) {
						console.error(err)
						next(new AppError('failed to update book', 500));

					}
				}
			})
	} else {
		const book = await bookModel.findByIdAndUpdate({ _id: new mongoose.Types.ObjectId(req.params.bookId) }, { ...req.body })
		res.status(200).json({ status: 200, message: 'success', id: book._id.toString() })

	}
	// console.log("success")

	// 		const { name, category, author, description, contributedBy } = req.body;
	// 		// console.log(contributedBy)
	// 		const book = await bookModel.insertMany({
	// 			name,
	// 			category,
	// 			author,
	// 			cover,
	// 			description,
	// 			contributedBy: new mongoose.Types.ObjectId(contributedBy)
	// 		});
	// 		res.status(200).json({ status: 200, message: 'success', id: book[0]._id.toString() })
	// 	} catch (error) {
	// 		console.error(error)
	// 		next(new AppError('failed to add book', 500));
	// 	}
	// }
});

export const getAllBooks = catchAsyncError(async (req, res, next) => {
	const books = await bookModel.find().sort({ createdAt: -1 });
	res.status(200).json({ status: 200, message: 'success', books });
});

export const searchBooks = catchAsyncError(async (req, res, next) => {
	let searchQuery = null
	if (req.params.searchQuery) {
		searchQuery = req.params.searchQuery
	}
	let { searchType } = req.params;
	const query = {};
	query[searchType] = { $regex: searchQuery ?? /./, $options: 'i' };
	const books = await bookModel
		.find(query)
		.sort({ createdAt: -1 });
	console.log(books);

	res.status(200).json({ status: 200, message: 'success', books });
});

export const getBookById = catchAsyncError(async (req, res, next) => {
	const { id } = req.params;
	// console.log(id);

	const book = await bookModel.findById(id);
	res.status(200).json({ status: 200, message: 'success', book });
});

export const issueBook = catchAsyncError(async (req, res, next) => {
	const { bookId, issuedDurationInDays } = req.body;
	let issuedBookUser = req.userId;
	const book = await bookModel.findById(bookId);
	if (book && !book.isIssued) {
		// it should be like this but to test return book I can't do that.
		// const issuedBook = await bookModel.findByIdAndUpdate({_id:bookId},{issuedBookUser,isIssued:true,issueDate:moment(),
		//     returnDate:moment().add(issuedDurationInDays,'days')},{new:true})
		const issuedBook = await bookModel.findByIdAndUpdate(
			{ _id: bookId },
			{
				issuedBookUser,
				isIssued: true,
				issueDate: moment(),
				returnDate: moment().add(issuedDurationInDays, 'days'),
			},
			{ new: true }
		);
		if (issuedBook) {
			res.status(200).json({ status: 200, message: 'success' });
		} else {
			next(new AppError('failed', 400));
		}
	} else {
		next(new AppError('failed', 400));
	}
});

export const returnBook = catchAsyncError(async (req, res, next) => {
	const { bookId } = req.body;
	const issuedBookUser = req.userId;
	const issuedBook = await bookModel.findOne({ _id: bookId, issuedBookUser });
	if (issuedBook) {
		let late = moment().diff(issuedBook.returnDate, 'days');
		if (late < 0) {
			late = 0;
		}
		const fine = late * 50;
		let returnedBook = await bookModel.findByIdAndUpdate(
			bookId,
			{ isIssued: false, late, fine },
			{ new: true }
		);
		if (returnedBook) {
			await userModel.findByIdAndUpdate(
				{ _id: issuedBookUser },
				{ $push: { issuedBooks: returnedBook } }
			);
			await bookModel.updateOne(
				{ _id: bookId },
				{
					$unset: {
						issueDate: 1,
						returnDate: 1,
						late: 1,
						fine: 1,
						issuedBookUser: 1,
					},
				}
			);
			res.status(200).json({ status: 200, message: 'success' });
		} else {
			next(new AppError('failed', 400));
		}
	} else {
		next(new AppError('book not found or not issued', 404));
	}
});

export const getIssuedBooks = catchAsyncError(async (req, res, next) => {
	let _id = req.userId;
	const user = await userModel.findById(_id);
	const issuedBooks = user.issuedBooks;

	user
		? res.status(200).json({ status: 200, message: 'success', issuedBooks })
		: next(new AppError('failed', 400));
});

export const getNonReturnedBooks = catchAsyncError(async (req, res, next) => {
	const issuedBookUser = req.userId;
	let nonReturnedBooks = await bookModel
		.find({ issuedBookUser })
		.sort({ returnDate: 1 });
	res.status(200).json({ status: 200, message: 'success', nonReturnedBooks });
});

export const searchIssuedBooks = catchAsyncError(async (req, res, next) => {
	const { bookName } = req.params;
	let _id = req.userId;
	const user = await userModel.findById(_id).sort({ returnDate: 1 });
	const issuedBooks = user.issuedBooks.filter((book) =>
		book.name.toLowerCase().includes(bookName.toLowerCase())
	);
	user
		? res.status(200).json({ status: 200, message: 'success', issuedBooks })
		: next(new AppError('failed', 400));
});

export const deleteBook = catchAsyncError(async (req, res, next) => {
	const { bookId } = req.params;
	let _id = req.userId;
	const storage = await new Storage({
		email: 'sehirad634@payposs.com',
		password: 'sehirad634',
	}).ready;
	const book = await bookModel.findOne({ _id: new mongoose.Types.ObjectId(bookId) })
	await bookModel.deleteOne({ _id: new mongoose.Types.ObjectId(bookId) });

	cloudinary.config({
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
	});

	await cloudinary.uploader
		.destroy(book.cover.split('/').splice(-1)[0].split('.')[0])


	const file = storage.find(`${bookId}.pdf`)
	if (!file) { next(new AppError('File not found!', 404)); return; }
	await file.delete(true)
	res.status(200).json({ status: 200, message: 'success' })
});
