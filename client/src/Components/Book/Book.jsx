import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Loading from '../Loading/Loading';

export default function Book() {
	const [bookData, setBookData] = useState({});
	const [duration, setDuaration] = useState(null);
	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);
	let allURLParams = useParams();
	// console.log(allURLParams);

	async function getBookData() {
		let { data } = await axios.get(
			// `http://localhost:5000/book/books/${allURLParams.id}`
			`https://openlibrary.org/works/${allURLParams.id}.json`
			// {
			// 	headers: {
			// 		token: localStorage.getItem('userToken'),
			// 	},
			// }
		);
		setBookData(data);
		// console.log(data);

		const authors = [];
		for (const author of data.authors) {
			let {
				data: { name },
			} = await axios.get(
				`https://openlibrary.org${author.author.key}.json`
				// {
				// 	headers: {
				// 		token: localStorage.getItem('userToken'),
				// 	},
				// }
			);
			authors.push({
				name,
				link: `https://openlibrary.org${author.author.key}`,
			});
		}
		// console.log(authors);
		setBookData({ ...data, authors });
		// console.log(data.description.value);
	}

	const issueBook = async (e) => {
		try {
			const { data } = await axios.post(
				'http://localhost:5000/book/issue',
				{ bookId: bookData._id, issuedDurationInDays: duration },
				{
					headers: {
						token: localStorage.getItem('userToken'),
					},
				}
			);
			if (data?.message === 'success') {
				getBookData();
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		getBookData();
	}, []);
	return !bookData ? (
		<Loading />
	) : (
		<>
			<Modal
				show={show}
				onHide={handleClose}
				animation={true}
				size='md'
				aria-labelledby='contained-modal-title-vcenter'
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title>Issue Book</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<form className='py-3'>
						<input
							onChange={(e) => setDuaration(e.target.value)}
							className='form-control w-100'
							name='path'
							placeholder='Enter The Duration'
							type='number'
						/>
					</form>
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant='secondary'
						onClick={handleClose}
					>
						Close
					</Button>
					<Button
						variant='danger'
						className='text-white'
						onClick={() => {
							handleClose();
							issueBook();
						}}
					>
						Save Changes
					</Button>
				</Modal.Footer>
			</Modal>
			<div className='overflow-hidden'>
				<div className='row'>
					<div className='col-2'>
						<div className='position-fixed col-lg-2'>
							<Sidebar />
						</div>
					</div>

					<div className='col-10 px-lg-5 px-2 my-3'>
						<div className='row'>
							<div className='col-lg-4'>
								<div className='p-5'>
									<img
										className='w-100 rounded-2'
										src={`https://covers.openlibrary.org/b/ID/${allURLParams.bookPhoto}-M.jpg`}
										alt=''
									/>
									<h4 className='text-center p-3 pb-0 fw-bolder'>
										{bookData.title}
									</h4>
								</div>
							</div>
							<div className='col-lg-8 my-1'>
								<div className='p-lg-5 px-5'>
									<p className='d-none d-lg-block'>
										<span className='fw-bold'>Authors</span> :{' '}
										{bookData.authors
											? bookData.authors?.map((author, i) => {
													return (
														<a
															key={i}
															target='_blank'
															href={author.link}
														>
															{author.name}
															{i === bookData.authors.length - 1 ? '' : ', '}
														</a>
													);
											  })
											: 'N/A'}
									</p>
									<p className='d-none d-lg-block fs-6'>
										<span className='fw-bold text-black'>Description</span> :
										{` ${
											typeof bookData.description === 'string'
												? bookData.description
												: bookData.description?.value ?? 'N/A'
										}`}
									</p>
									<p className='d-none d-lg-block text-secondary'>
										<span className='fw-bold text-black'>Category</span> :{' '}
										{bookData.subjects ? bookData.subjects?.join(' / ') : 'N/A'}
									</p>
									{bookData.isIssued ? null : (
										<button
											variant='primary'
											onClick={handleShow}
											className='btn btn-danger w-100 mb-3'
										>
											Issue this book now
										</button>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
