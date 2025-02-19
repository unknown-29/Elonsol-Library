import moment from 'moment';
import bookModel from '../../../database/models/bookModel.js';
import userModel from '../../../database/models/userModel.js';
import { AppError } from '../../utils/AppError.js';
import { catchAsyncError } from '../../utils/catchAsyncError.js';
import { Storage, File } from 'megajs';

/* https://gist.github.com/lanqy/5193417 */
function bytesToSize(bytes) {
	var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes == 0) return 'n/a';
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	if (i == 0) return bytes + ' ' + sizes[i];
	return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

export const uploadBook = catchAsyncError(async (req, res, next) => {
	// console.log('uploadBook', req.file, req.params);
	const storage = await new Storage({
		email: 'devgmehta1608@gmail.com',
		password: 'Dgm@29042003',
	}).ready;
	const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB per chunk (you can adjust this as needed)

	async function uploadWithProgress(req) {
		const totalBytes = req.file.buffer.length;
		let uploadedBytes = 0;
		const totalChunks = Math.ceil(totalBytes / CHUNK_SIZE);
		let file;
		// Function to upload chunks
		const uploadChunk = async (chunk, startByte, endByte) => {
			const chunkData = req.file.buffer.slice(startByte, endByte);

			// Simulate the upload (replace this with your actual upload code)
			file = await storage.upload(
				{
					name: `${req.params.bookId.toString()}.pdf`,
					allowUploadBuffering: true,
				},
				chunkData
			).complete;

			// Update progress
			uploadedBytes += chunkData.length;
			const percentage = (uploadedBytes / totalBytes) * 100;
			console.log(`Upload Progress: ${percentage.toFixed(2)}%`);
		};

		// Start uploading chunks
		for (let i = 0; i < totalChunks; i++) {
			const startByte = i * CHUNK_SIZE;
			const endByte = Math.min(startByte + CHUNK_SIZE, totalBytes);

			await uploadChunk(
				req.file.buffer.slice(startByte, endByte),
				startByte,
				endByte
			);
		}
		file.link().then(async (link) => {
			// console.log(link);
			// console.log('The file was uploaded!');
			// console.log(bookModel);
			const book = await bookModel.insertMany([
				{
					bookId: req.params.bookId.toString(),
					downloadUrl: link.toString(),
					fileSize: file.size.toString(),
				},
			]);
			book
				? res.status(200).json({ status: 200, message: 'success' })
				: next(new AppError('failed to insert book details', 400));
		});
		console.log('Upload Complete!');
	}

	// Call the function
	uploadWithProgress(req);

	// const file = await storage.upload(
	// 	{
	// 		name: `${req.params.bookId.toString()}.pdf`,
	// 		allowUploadBuffering: true,
	// 	},
	// 	req.file.buffer
	// ).complete;
	// file.link().then(async (link) => {
	// 	// console.log(link);
	// 	console.log('The file was uploaded!');
	// 	// console.log(bookModel);
	// 	const book = await bookModel.insertMany([
	// 		{
	// 			bookId: req.params.bookId.toString(),
	// 			downloadUrl: link.toString(),
	// 			fileSize: file.size.toString()
	// 		},
	// 	]);
	// 	book
	// 		? res.status(200).json({ status: 200, message: 'success' })
	// 		: next(new AppError('failed to insert book details', 400));
	// });
});

export const addBook = catchAsyncError(async (req, res, next) => {
	const { name, category, publisher } = req.body;
	const book = await bookModel.insertMany({
		name,
		category,
		publisher,
		bookPhoto: req.file.filename,
	});
	book
		? res.status(200).json({ status: 200, message: 'success' })
		: next(new AppError('failed to insert user', 400));
});

export const getAllBooks = catchAsyncError(async (req, res, next) => {
	const books = await bookModel.find().sort({ createdAt: -1 });
	res.status(200).json({ status: 200, message: 'success', books });
});

export const getAllBooksByName = catchAsyncError(async (req, res, next) => {
	let { letters } = req.params;
	const books = await bookModel
		.find({ name: { $regex: letters, $options: 'i' } })
		.sort({ createdAt: -1 })
		.exec();
	res.status(200).json({ status: 200, message: 'success', books });
});

export const getBookById = catchAsyncError(async (req, res, next) => {
	const { id } = req.params;
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
		next(new AppError('book not found or not issued', 400));
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
