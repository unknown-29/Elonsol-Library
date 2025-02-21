import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Loading from '../Loading/Loading';

export default function Book() {
	const [bookData, setBookData] = useState({});
	const [loading, setLoading] = useState(true);
	const handleDownload = async () => {
		setLoading(true);
		// axios
		// 	.get(
		// 		`http://localhost:5000/book/${allURLParams.id}`,

		// 		{
		// 			headers: {
		// 				token: localStorage.getItem('userToken'),
		// 				'Content-Type': 'multipart/form-data',
		// 			},
		// 		}
		// 	)
		// 	.then(({ data }) => {
		// 		console.log(data);
		// 	});
		try {
			const response = await axios.get(
				`http://localhost:5000/book/${allURLParams.id}`,
				{
					headers: {
						token: localStorage.getItem('userToken'),
						'Content-Type': 'multipart/form-data',
					},

					responseType: 'blob',
					onDownloadProgress: (progressEvent) => {
						const percent = Math.round(
							(progressEvent.loaded * 100) / progressEvent.total
						);
						// console.log(`Download progress: ${percent}%`);
						// Update your progress bar here
					},
				}
			);

			const blob = response.data;
			const downloadLink = document.createElement('a');
			const objectUrl = URL.createObjectURL(blob);

			downloadLink.href = objectUrl;
			downloadLink.download = `${bookData.title}-${allURLParams.id}.pdf`;
			downloadLink.click();

			URL.revokeObjectURL(objectUrl);
			setLoading(false);
		} catch (error) {
			console.error('Error downloading the file:');
			const errorMessage = await error.response.data.text();
			const errorData = JSON.parse(errorMessage);
			console.error('Backend Error Message:', errorData.message);
			console.error('Status:', error.response.status);
			alert(`Error downloading the file: ${errorData.message}`);
			setLoading(false);
		}
	};
	const handleUpload = () => {
		const input = document.createElement('input');
		input.setAttribute('name', 'bookfile');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'application/pdf');
		input.click();
		input.addEventListener('change', async () => {
			if (input.files.length > 0) {
				const file = input.files[0];
				const formData = new FormData();
				formData.append(`file`, file);
				// console.log(formData);
				try {
					setLoading(true);
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
					setLoading(false);
					console.log('Upload successful!', response.data);
				} catch (error) {
					alert("server is busy can't upload right now!!!");
					console.error('Upload failed:', error);
					setLoading(false);
				}
			}
		});
	};
	let allURLParams = useParams();

	async function getBookData() {
		setLoading(true);
		let { data } = await axios.get(
			`${process.env.REACT_APP_OPENLIBRARY_BASE_URL}/works/${allURLParams.id}.json`
		);
		setBookData(data);
		// console.log(data);
		setLoading(false);

		const authors = [];
		for (const author of data.authors) {
			let {
				data: { name },
			} = await axios.get(
				`process.env.REACT_APP_OPENLIBRARY_BASE_URL${author.author.key}.json`
			);
			authors.push({
				name,
				link: `process.env.REACT_APP_OPENLIBRARY_BASE_URL${author.author.key}`,
			});
		}
		setBookData({ ...data, authors });
	}

	useEffect(() => {
		getBookData();
	}, []);
	return loading ? (
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
										src={`${process.env.REACT_APP_OPENLIBRARY_IMAGE_BASE_URL}/${allURLParams.bookPhoto}-M.jpg`}
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
									<div className='d-flex flex-row gap-3'>
										<button
											variant='primary'
											onClick={handleUpload}
											className='btn btn-danger w-30'
										>
											Upload this book
										</button>
										<button
											variant='primary'
											onClick={handleDownload}
											className='btn btn-danger w-30'
										>
											Download this book
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
