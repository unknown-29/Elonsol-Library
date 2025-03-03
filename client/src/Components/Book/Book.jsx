import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Loading from '../Loading/Loading';
import { io } from 'socket.io-client';
import ProgressBar from 'react-bootstrap/ProgressBar';
export default function Book() {
	const navigate = useNavigate()
	let allURLParams = useParams();
	const [bookData, setBookData] = useState({});
	const [loading, setLoading] = useState(true);
	// const [uploadProgress, setUploadProgress] = useState(0);
	const [downloadProgress, setDownloadProgress] = useState(0);
	// const [isUploading, setIsUploading] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);
	const [socket, setSocket] = useState(null);
	const handleDownload = async () => {
		// setLoading(true);
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
			setDownloadProgress(0);
			setIsDownloading(true);
			const response = await axios.get(
				`${process.env.REACT_APP_SERVER_BASE_URL}/book/download/${allURLParams.id}`,
				{
					headers: {
						token: localStorage.getItem('userToken'),
						'Content-Type': 'multipart/form-data',
					},

					responseType: 'blob',
				}
			);

			const blob = response.data;
			const downloadLink = document.createElement('a');
			const objectUrl = URL.createObjectURL(blob);

			downloadLink.href = objectUrl;
			downloadLink.download = `${bookData.name}-${allURLParams.id}.pdf`;
			downloadLink.click();

			URL.revokeObjectURL(objectUrl);
			setDownloadProgress(0);
			setIsDownloading(false);
		} catch (error) {
			if (error.status === 403) navigate('/login')
			console.error('Error downloading the file:');
			const errorMessage = await error.response.data.text();
			const errorData = JSON.parse(errorMessage);
			console.error('Backend Error Message:', errorData.message);
			console.error('Status:', error.response.status);
			alert(`Error downloading the file: ${errorData.message}`);
			setDownloadProgress(0);
			setIsDownloading(false);
		}
	};
	// const handleUpload = () => {
	// 	const input = document.createElement('input');
	// 	input.setAttribute('name', 'bookfile');
	// 	input.setAttribute('type', 'file');
	// 	input.setAttribute('accept', 'application/pdf');
	// 	input.click();
	// 	input.addEventListener('change', async () => {
	// 		if (input.files.length > 0) {
	// 			const file = input.files[0];
	// 			const formData = new FormData();
	// 			formData.append(`file`, file);
	// 			// console.log(formData);
	// 			try {
	// 				setUploadProgress(0);
	// 				setIsUploading(true);
	// 				const response = await axios.post(
	// 					`${process.env.REACT_APP_SERVER_BASE_URL}/book/${allURLParams.id}`,
	// 					formData,
	// 					{
	// 						headers: {
	// 							token: localStorage.getItem('userToken'),
	// 							'Content-Type': 'multipart/form-data',
	// 						},
	// 					}
	// 				);
	// 				setUploadProgress(0);
	// 				setIsUploading(false);
	// 				console.log('Upload successful!');
	// 			} catch (error) {
	// 				alert("server is busy can't upload right now!!!");
	// 				console.error('Upload failed:', error);
	// 				setUploadProgress(0);
	// 				setIsUploading(false);
	// 			}
	// 		}
	// 	});
	// };

	async function getBookData() {
		setLoading(true);
		try {
			const { data: { book } } = await axios.get(
				`${process.env.REACT_APP_SERVER_BASE_URL}/book/${allURLParams.id}`,
				{
					headers: {
						token: localStorage.getItem('userToken'),
					},
				}
			);
			setBookData(book);
			console.log(book);
		} catch (error) {
			if (error.status === 403) navigate('/login')
			else alert('server is busy!')
		}
		finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		getBookData();
		const newSocket = io(process.env.REACT_APP_SERVER_BASE_URL);
		setSocket(newSocket);
		newSocket.on('connect', () => console.log('socket connected'));
		newSocket.on('disconnect', () => console.log('socket disconnected'));
		newSocket.on('uploadProgress', (data) => {
			// setUploadProgress(data.percent);
			console.log('Received upload progress from server:', data);
		});
		newSocket.on('downloadProgress', (data) => {
			setDownloadProgress(data.percent);
			console.log('Received download progress from server:', data);
		});
		return () => newSocket.close();
	}, [setSocket]);
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
										src={bookData.cover}
										alt=''
									/>
									<h4 className='text-center p-3 pb-0 fw-bolder'>
										{bookData.name}
									</h4>
								</div>
							</div>
							<div className='col-lg-8 my-1'>
								<div className='p-lg-5 px-5'>
									<p className='d-none d-lg-block'>
										<span className='fw-bold'>Authors</span> :{` ${bookData.author}`}
									</p>
									<p className='d-none d-lg-block fs-6'>
										<span className='fw-bold text-black'>Description : </span>
										{` ${bookData.description ?? "N/A"
											}`}
									</p>
									<p className='d-none d-lg-block text-secondary'>
										<span className='fw-bold text-black'>Category : </span>
										{bookData.category}
									</p>
									<div className='d-flex flex-row gap-3 p-3 justify-content-around'>
										<button
											variant='primary'
											onClick={handleDownload}
											className='btn btn-danger w-100'
										>
											Download this book
										</button>
									</div>
									<div className='mt-2'>
										{/* {isUploading && (
											<ProgressBar
												variant='primary'
												now={uploadProgress}
											/>
										)} */}
										{isDownloading && (
											<ProgressBar
												variant='success'
												now={downloadProgress}
											/>
										)}
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
