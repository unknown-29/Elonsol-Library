import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Loading from '../Loading/Loading';

export default function Book() {
	const [bookData, setBookData] = useState({});
	const formRef = useRef(null);
	const handleUpload = () => {
		formRef.current.innerHTML = '';
		const input = document.createElement('input');
		input.setAttribute('name', 'bookfile');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'application/pdf');
		formRef.current.appendChild(input);
		input.click();
		input.addEventListener('change', async () => {
			if (input.files.length > 0) {
				const file = input.files[0];
				const formData = new FormData();
				formData.append(`file`, file);
				// console.log(formData);
				try {
					const response = await axios.post(
						`http://localhost:5000/book/${allURLParams.id}`,
						formData,
						{
							headers: {
								token: localStorage.getItem('userToken'),
								'Content-Type': 'multipart/form-data',
							},
						}
					);

					console.log('Upload successful!', response.data);
				} catch (error) {
					console.error('Upload failed:', error);
				}
			}
		});
	};
	let allURLParams = useParams();

	async function getBookData() {
		let { data } = await axios.get(
			`https://openlibrary.org/works/${allURLParams.id}.json`
		);
		setBookData(data);
		// console.log(data);

		const authors = [];
		for (const author of data.authors) {
			let {
				data: { name },
			} = await axios.get(`https://openlibrary.org${author.author.key}.json`);
			authors.push({
				name,
				link: `https://openlibrary.org${author.author.key}`,
			});
		}
		setBookData({ ...data, authors });
	}

	useEffect(() => {
		getBookData();
	}, []);
	return !bookData ? (
		<Loading />
	) : (
		<>
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
										<span className='fw-bold text-black'>Description : </span>
										{` ${
											typeof bookData.description === 'string'
												? bookData.description
												: bookData.description?.value ?? 'N/A'
										}`}
									</p>
									<p className='d-none d-lg-block text-secondary'>
										<span className='fw-bold text-black'>Category : </span>
										{bookData.subjects ? bookData.subjects?.join(' / ') : 'N/A'}
									</p>
									<button
										variant='primary'
										onClick={handleUpload}
										className='btn btn-danger w-50 mb-3'
									>
										Upload this book
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<form
				hidden='true'
				encType='multipart/form-data'
				action='/xyz'
				ref={formRef}
			></form>
		</>
	);
}
