import React, { useEffect, useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import BookItem from '../Home/BookItem';

export default function Favorites() {
  const [favoriteBooks, setFavoriteBooks] = useState([]);

  useEffect(() => {
    const storedBooks = JSON.parse(localStorage.getItem('favoriteBooks')) || [];
    setFavoriteBooks(storedBooks);
  }, []);

  return (
    <div className='overflow-visible overflow-x-hidden'>
      <div className='row'>
        <div className='col-2'>
          <div className='position-fixed col-lg-2'>
            <Sidebar page="Favorites" />
          </div>
        </div>

        <div className='col-10 px-lg-5 px-2 my-3'>
          <h2 className='fw-bold text-center my-4'>Your Favorite Books</h2>

          <div className='row'>
            {favoriteBooks.length > 0 ? (
              favoriteBooks.map((book) => (
                <BookItem
                  key={book._id}
                  _id={book._id}
                  name={book.name}
                  category={book.category}
                  author={book.author}
                  cover={book.cover}
                />
              ))
            ) : (
              <div className='text-center fs-4 fw-bold'>No Favorites Yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
