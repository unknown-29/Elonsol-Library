import axios from 'axios';
import React, { useEffect, useState, useContext } from 'react';
import Loading from '../Loading/Loading';
import Sidebar from '../Sidebar/Sidebar';
import BookItem from '../Home/BookItem';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserContext } from '../../Context/UserContext';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import SplitButton from 'react-bootstrap/SplitButton';
// @todo add pagination if possible
export default function Contribution() {
  const { getUserData } = useContext(UserContext);
  const userData = getUserData()
  let navigate = useNavigate();
  const [allBooks, setAllBooks] = useState([]);
  const [bookName, setBookName] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name')
  const handleSearchTypeChange = (type) => setSearchType(type)
  const handleSearchQueryChange = (e) => setSearchQuery(e.target.value);
  async function getDataFromURL(userId) {
    // console.log(userId)
    setLoading(true);
    try {
      let { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_BASE_URL}/user/${userData.userId}/book`,
        // 'http://localhost:5000/book'
        {
          headers: {
            token: localStorage.getItem('userToken'),
          },
        }
      );

      setAllBooks(data.books);
    } catch (error) {
      if (error.status === 401)
        navigate('/login');
      // console.log(error)
    }
    finally {
      setLoading(false);
    }
  }

  async function searchBooks() {
    // setAllBooks([]);
    setLoading(true);
    try {
      let { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_BASE_URL}/user/${userData.userId}/searchBooks/${searchType}/${searchQuery}`,
        // `http://localhost:5000/book/searchBooks/${bookName}`,
        {
          headers: {
            token: localStorage.getItem('userToken'),
          },
        }
      );
      setAllBooks(data.books);
    } catch (error) {
      if (error.status === 401)
        navigate('/login');
    } finally {

      setLoading(false)
    }
  }

  // function validateAndSearch(e) {
  //   e.preventDefault();

  //   if (bookName !== '')
  //     searchBooksByName();
  //   else getDataFromURL()
  // }

  useEffect(() => {
    // console.log(userData);
    getDataFromURL(getUserData()?.userId);
  }, [getUserData]);

  return (
    <>
      <div className='overflow-visible overflow-x-hidden'>
        <div className='row'>
          <div className='col-2'>
            <div className='position-fixed col-lg-2'>
              <Sidebar page="Profile" />
            </div>
          </div>

          <div className='col-10 px-lg-5 px-2 my-3'>
            <InputGroup className="mb-3">
              <Form.Control
                aria-label="Search input"
                placeholder={`Search by ${searchType[0].toUpperCase() + searchType.slice(1)}`}
                value={searchQuery}
                onChange={handleSearchQueryChange}
              />
              <SplitButton
                variant="outline-warning"
                title={`Search By ${searchType[0].toUpperCase() + searchType.slice(1)}`}
                id="segmented-button-dropdown-2"
                onClick={searchBooks}
                alignRight
              >
                <Dropdown.Item onClick={() => handleSearchTypeChange('name')}>Search By Name</Dropdown.Item>
                <Dropdown.Item onClick={() => handleSearchTypeChange('author')}>Search By Author</Dropdown.Item>
                <Dropdown.Item onClick={() => handleSearchTypeChange('category')}>Search By Category</Dropdown.Item>
                <Dropdown.Item onClick={() => handleSearchTypeChange('description')}>Search By Description</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item disabled>Search</Dropdown.Item>
              </SplitButton>
            </InputGroup>
            {/* <motion.span
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

              <button type="button" className="btn btn-warning ms-3 text-white d-inline-block" data-bs-toggle="modal" data-bs-target="#exampleModal">
                Filter
              </button>

              <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="exampleModalLabel">View Available Books</h5>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      To view present books available for download, Kindly press `Okay` button.
                    </div>
                    <div className="modal-footer d-flex justify-content-center">
                      <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                      <button type="button" className="btn btn-warning text-white d-inline-block">Okay</button>
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
            </motion.span> */}
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
