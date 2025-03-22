import { Router } from 'express';
import userAuth from '../../middleware/auth.js';
import { calcLateAndFine } from '../../middleware/calcLateAndFine.js';
import validation from '../../middleware/validation.js';
import { fileUpload } from '../../utils/fileUpload.js';
import * as bookController from './book.controller.js';
import * as bookValidation from './book.validation.js';

const router = Router();
router.post('/', userAuth, fileUpload('cover'), bookController.addBook).get('/', userAuth, bookController.getAllBooks).delete('/:bookId', userAuth, bookController.deleteBook)
router
	.get('/download/:bookId', userAuth, bookController.downloadBook)
	.post('/upload/:bookId', userAuth, fileUpload('book'), bookController.uploadBook);

router.get('/:id', userAuth, bookController.getBookById);
router.post(
	'/issue',
	userAuth,
	bookController.issueBook
);
router.post(
	'/return',
	userAuth,
	//validation(bookValidation.returnBookSchema),
	bookController.returnBook
);
router.get('/issue', userAuth, bookController.getIssuedBooks);
router.get('/searchBooks/:letters', userAuth, bookController.searchBooksByName);

router.get(
	'/search/:bookName',
	userAuth,
	bookController.searchIssuedBooks
);
router.get(
	'/nonreturn',
	userAuth,
	calcLateAndFine,
	bookController.getNonReturnedBooks
);

export default router;
