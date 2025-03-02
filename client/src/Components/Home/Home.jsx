import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Loading from '../Loading/Loading';
import Sidebar from '../Sidebar/Sidebar';
import BookItem from './BookItem';
import { motion } from 'framer-motion';
import Joi from 'joi';
// @todo add pagination
export default function Home() {
	const [allBooks, setAllBooks] = useState([]);
	const [bookName, setBookName] = useState('');
	const [loading, setLoading] = useState(true);
	const [err, setErr] = useState(null);

	async function getDataFromURL() {
		setLoading(true);
		let { data } = await axios.get(
			`${process.env.REACT_APP_SERVER_BASE_URL}/book`,
			// 'http://localhost:5000/book'
			{
				headers: {
					token: localStorage.getItem('userToken'),
				},
			}
		);

		setAllBooks(data.books);
		setLoading(false);
	}

	async function searchBooksByName() {
		setAllBooks([]);
		setLoading(true);
		let { data } = await axios.get(
			`${process.env.REACT_APP_SERVER_BASE_URL}/book/searchBooks/${bookName}`,
			// `http://localhost:5000/book/searchBooks/${bookName}`,
			{
				headers: {
					token: localStorage.getItem('userToken'),
				},
			}
		);
		setAllBooks(data.books);
		setLoading(false)
	}

	function validateSearchData() {
		let schema = Joi.object({
			name: Joi.string().required(),
		});

		return schema.validate({ name: bookName }, { abortEarly: false });
	}

	function validateAndSearch(e) {
		//setLoading(true);
		e.preventDefault();
		let validation = validateSearchData();
		if (validation.error) {
			console.log(validation.error);
		} else {
			searchBooksByName();
		}
	}

	useEffect(() => {
		getDataFromURL();
	}, []);
	return (
		<>
			<div className='overflow-hidden'>
				<div className='row'>
					<div className='col-2'>
						<div className='position-fixed col-lg-2'>
							<Sidebar />
						</div>
					</div>

					<div className='col-10 px-lg-5 px-2 my-3'>
						<motion.span
							initial={{ y: -150 }}
							animate={{ y: 0 }}
							transition={{ delay: 0.8, duration: 1 }}
							className='mx-auto pe-5 pe-lg-0 p d-flex align-items-center justify-content-center'
						>
							<input
								onChange={(e) => {
									setBookName(e.target.value);
								}}
								type='search'
								className='form-control d-inline my-4'
								placeholder='Enter Book Name ...'
								name='name'
								id='name'
							/>
							<button
								onClick={validateAndSearch}
								className='btn btn-danger text-white d-inline-block ms-3 h-50'
							>
								search
							</button>
						</motion.span>
						<div className='row'>
							{allBooks.length !== 0 ? (
								allBooks.map((book, index) => (
									<BookItem
										key={book._id.toString()}
										_id={book._id.toString()}
										name={book.name}
										category={book.category}
										author={book.author}
										cover={book.cover}
									/>
								))
							) : loading === true ? (
								<Loading />
							) : (
								<div className='text-center fs-4 fw-bold'>No Books Found</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
