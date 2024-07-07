
import { useState } from "react";
import RTable from "../RTable/RTable";
import SearchBar from "../Search/Search";
import Container from 'react-bootstrap/Container';
import './booksapp.css';

const BookApp = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');

    const getDataFromChild = (data: string) => {
        setSearchTerm(data);
    }

    return (

        <Container className="d-flex flex-column justify-content-center align-items-center ">
            <div className={`search-container ${searchTerm.length > 3 ? 'with-table' : ''}`}>
                <div className={`welcome-box ${searchTerm.length > 3 ? 'with-table' : ''}`}>
                    <div className={`welcome-text ${searchTerm.length > 3 ? 'with-table' : ''}`}>
                        <h2>Welcome to The Books' Nook</h2>
                        <span>Your personal corner for your favorite books!</span>
                    </div>
                    <SearchBar sendDataToParent={getDataFromChild} />
                </div>
            </div>
            {searchTerm.length > 3 ? <RTable searchTerm={searchTerm} /> : <></>}
        </Container>
    )
}

export default BookApp;