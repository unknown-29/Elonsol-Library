import React from 'react'
import { useEffect } from 'react';
import { Link } from 'react-router-dom'
import AppLogo from '../AppLogo/AppLogo'
import '../styles/sidebar-styles.css';
export default function Sidebar(props) {
    useEffect(() => {
        if (props.page === 'Home') {
            const links = document.getElementsByClassName("Links")[0];

            if (links) {
                links.classList.add("text-warning");
            }
        }

        else if (props.page === 'Create') {
            const links = document.getElementsByClassName("Links")[1];

            if (links) {
                links.classList.add("text-warning");
            }
        }

        else if (props.page == 'Profile') {
            const links = document.getElementsByClassName("Links")[2];

            if (links) {
                links.classList.add("text-warning");
            }
        }
        else if (props.page == 'Favorites') {
            const links = document.getElementsByClassName("Links")[3];

            if (links) {
                links.classList.add("text-warning");
            }
        }

    }, [props.page]);
    return (
        <>
            <div>
                <div className="p-0 min-vh-100 side-bar-bg-color">
                    <ul className="text-light list-unstyled">

                        <li className="p-3 pe-lg-5 d-lg-flex d-none">
                            <AppLogo />
                        </li>

                        <li className="p-3 pe-lg-5 sidebar-element hover-text-warning Links">
                            <Link to="/home" className="nav-link px-0 px-lg-2"> <i className="bi-house" /><span className="px-lg-2 ms-1 d-none d-lg-inline">Home</span> </Link>
                        </li>

                        <li className="p-3 pe-lg-5 sidebar-element hover-text-warning Links">
                            <Link to="/addBook" className="nav-link px-0 px-lg-2"> <i className="bi bi-cloud-plus" /><span className="px-lg-2 ms-1 d-none d-lg-inline">Create</span> </Link>
                        </li>

                        <li className="p-3 pe-lg-5 sidebar-element hover-text-warning Links">
                            <Link to="/profile" className="nav-link px-0 px-lg-2"> <i className="bi bi-person-circle"></i><span className="px-lg-2 ms-1 d-none d-lg-inline">Profile</span> </Link>
                        </li>

                        <li className="p-3 pe-lg-5 sidebar-element hover-text-warning Links">
                            <Link to="/favorites" className="nav-link px-0 px-lg-2"> <i className="bi bi-heart-fill"></i>
                                <span className="px-lg-2 ms-1 d-none d-lg-inline">Favorites</span> </Link>
                        </li>

                        <li className="p-3 pe-lg-5 sidebar-element hover-text-warning">
                            <Link onClick={() => localStorage.removeItem('userToken')} to="/login" className="nav-link px-0 px-lg-2"> <i className="bi bi-box-arrow-left"></i><span className="px-lg-2 ms-1 d-none d-lg-inline">Logout</span> </Link>
                        </li>

                    </ul>
                </div>
            </div>
        </>
    )
}
