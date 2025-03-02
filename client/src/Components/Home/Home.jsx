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
			`${process.env.REACT_APP_OPENLIBRARY_BASE_URL}/trending/weekly.json?limit=50`,
			// 'http://localhost:5000/book'
			{
				// headers: {
				// 	token: localStorage.getItem('userToken'),
				// },
			}
		);

		setAllBooks(data.works);
		setLoading(false);
	}

	async function searchBooksByName() {
		setAllBooks([]);
		setLoading(true);
		let { data } = await axios.get(
			`${process.env.REACT_APP_OPENLIBRARY_BASE_URL}/search.json?q=${bookName}`
			// `http://localhost:5000/book/searchBooks/${bookName}`,
			// {
			// 	headers: {
			// 		token: localStorage.getItem('userToken'),
			// 	},
			// }
		);
		setAllBooks(data.docs);
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
							<Sidebar page = "Home"/>
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
								placeholder='Search book name'
								name='name'
								id='name'
							/>

							<button type="button" class="btn btn-warning ms-3 text-white d-inline-block" data-bs-toggle="modal" data-bs-target="#exampleModal">
								Filter
							</button>

							<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
								<div class="modal-dialog">
									<div class="modal-content">
										<div class="modal-header">
											<h5 class="modal-title" id="exampleModalLabel">View Available Books</h5>
											<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
										</div>
										<div class="modal-body">
											To view present books available for download, Kindly press `Okay` button.
										</div>
										<div class="modal-footer d-flex justify-content-center">
											<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
											<button type="button" class="btn btn-warning text-white d-inline-block">Okay</button>
										</div>
									</div>
								</div>
							</div>

							<button
								onClick={validateAndSearch}
								className='btn btn-warning text-white d-inline-block ms-3 h-50'
							>
								search
							</button>
						</motion.span>
						<div className='row'>
							{allBooks.length !== 0 ? (
								allBooks.map((book, index) => (
									<BookItem
										key={index}
										_id={book.key.split('/')[2]}
										name={book.title}
										category={book.category}
										publisher={book.publisher}
										bookPhoto={`${book.cover_i}`}
										isIssued={book.isIssued}
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
