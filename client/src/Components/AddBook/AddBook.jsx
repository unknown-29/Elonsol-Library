import axios from 'axios';
import React, { useEffect, useRef, useState, useContext } from 'react';
import { UserContext } from '../../Context/UserContext';
import Sidebar from '../Sidebar/Sidebar';
import Lottie from 'lottie-web';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import Loading from '../Loading/Loading';
import { useNavigate } from 'react-router-dom';
import ProgressBar from 'react-bootstrap/esm/ProgressBar';

export default function AddBook() {
	const { getUserData } = useContext(UserContext);
	const navigate = useNavigate()
	const [name, setName] = useState('');
	const [category, setCategory] = useState(null);
	const [author, setAuthor] = useState(null);
	const [error, setError] = useState(false);
	const [cover, setCover] = useState(null);
	const [book, setBook] = useState(null);
	const [description, setDescription] = useState(null);
	const [loading, setLoading] = useState(false)
	const [socket, setSocket] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append('name', name);
		formData.append('category', category);
		formData.append('author', author);
		formData.append('description', description);
		formData.append("contributedBy", getUserData()?.userId)
		formData.append('cover', cover);
		try {
			setLoading(true)
			const response = await axios.post(
				`${process.env.REACT_APP_SERVER_BASE_URL}/book`,
				formData,
				{
					headers: {
						token: localStorage.getItem('userToken'),
					},
				}
			);
			console.log(response, "success upploading metadata and cover");
			const formData2 = new FormData()
			formData2.append('book', book)
			setLoading(false)
			setIsUploading(true);
			setUploadProgress(0);
			const response2 = await axios.post(
				`${process.env.REACT_APP_SERVER_BASE_URL}/book/upload/${response.data.id}`,
				formData2,
				{
					headers: {
						token: localStorage.getItem('userToken'),
					},
				}
			);
			console.log('success uploading book');

			if (response.data?.message === 'success' && response2.data?.message === 'success') {
				setError(true);
			}
			setLoading(false)
		} catch (error) {
			if (error.status === 401) navigate('/login')
			console.log(error);
		}
		finally {
			setLoading(false)
			setUploadProgress(0);
			setIsUploading(false);
			if (document.getElementById('cover')) document.getElementById('cover').value = '';
			if (document.getElementById('book')) document.getElementById('book').value = '';
			if (document.getElementById('author')) document.getElementById('author').value = '';
			if (document.getElementById('name')) document.getElementById('name').value = '';
			if (document.getElementById('category')) document.getElementById('category').value = '';
			if (document.getElementById('description')) document.getElementById('description').value = '';

		}
	};

	const imgContainer = useRef(null);

	useEffect(() => {
		console.log(getUserData())

		const container = imgContainer.current;
		if (!container) return;

		const anim = Lottie.loadAnimation({
			container: container,
			renderer: 'svg',
			loop: true,
			autoplay: true,
			animationData: require('./../../images/addBook.json'),
		});

		const newSocket = io(process.env.REACT_APP_SERVER_BASE_URL);
		setSocket(newSocket);
		newSocket.on('connect', () => console.log('socket connected'));
		newSocket.on('disconnect', () => console.log('socket disconnected'));
		newSocket.on('uploadProgress', (data) => {
			if (uploadProgress === 0) {
				setLoading(false);
				setIsUploading(true);
			}
			setUploadProgress(data.percent)
			console.log('Received upload progress from server:', data);
		});
		// newSocket.on('downloadProgress', (data) => {
		// 	console.log('Received download progress from server:', data);
		// });

		return () => {
			anim.destroy();
			newSocket.close();
		};
	}, [setSocket]);

	return (
		<>
			<div className='overflow-hidden'>
				<div className='row'>
					<div className='col-2'>
						<div className='position-fixed col-lg-2'>
							<Sidebar page="Create" />
						</div>
					</div>

					<div className='col-md-10  d-flex justify-content-center align-items-center min-vh-100'>
						<motion.div
							initial={{ y: -1000 }}
							animate={{ y: 0 }}
							transition={{ duration: 1.5, type: 'spring' }}
							className='p-5 w-75 text-center bg-white bg-opacity-25 my-2 shadow rounded-2'
						>
							<div
								className='w-25 mx-auto'
								ref={imgContainer}
							></div>
							<p className='fw-bold fs-5'>Enter Book Details Now ....</p>
							<form onSubmit={handleSubmit}>
								<input
									onChange={(e) => { if (e.target.files[0].size > 10485760) { alert('file size is too big! file size should be less than 10MB'); e.target.value = null } else { setCover(e.target.files[0]) } }}
									type='file'
									accept='image/*'
									className='form-control my-2'
									id='cover'
									name='cover'
									placeholder='Choose Your cover'
									required
								/>
								<input
									onChange={(e) => setName(e.target.value)}
									type='text'
									className='form-control my-2'
									id='name'
									name='name'
									placeholder='Enter Book Name'
									required
								/>
								<input
									onChange={(e) => setCategory(e.target.value)}
									type='text'
									className='form-control my-2'
									id='category'
									name='category'
									placeholder='Enter Book Category'
									required
								/>
								<textarea
									onChange={(e) => setDescription(e.target.value)}
									type='text'
									className='form-control my-2'
									id='description'
									name='description'
									placeholder='Enter Book Description'
									minLength={'5'}
								/>
								<input
									onChange={(e) => setAuthor(e.target.value)}
									type='text'
									className='form-control my-2'
									id='author'
									name='author'
									placeholder='Enter Book Author'
									required
								/>
								<input
									onChange={(e) => setBook(e.target.files[0])}
									type='file'
									accept='application/pdf'
									className='form-control my-2'
									id='book'
									name='book'
									placeholder='Upload Book'
									required
								/>

								{isUploading && <ProgressBar animated now={uploadProgress} />}
								<button className=' btn btn-danger w-100 rounded-2 text-light' disabled={(loading || isUploading)}>
									{(loading || isUploading) ? 'wait...' : 'Add Book'}
								</button>
							</form>
							{error ? (
								<div className='my-3 alert alert-success'>
									Book added successfully
								</div>
							) : null}
						</motion.div>
					</div>
				</div>
			</div>
		</>
	);
}
