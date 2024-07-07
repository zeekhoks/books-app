import React, { useState, useEffect } from "react";
import Pagination from "react-bootstrap/Pagination";
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import "./rtable.css"

interface Book {
    id: number;
    title: string;
    author_name: string;
    first_publish_year: number;
    number_of_pages_median: number;
    isbn: string[];
}

const RTable = ({ searchTerm }: { searchTerm: string }) => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<boolean>(true); // Add loading state
    const [state, setState] = useState({
        values: books,
        limit: 10,
        activePage: 1,
        numberOfPages: 10,
        sortOrder: "new",
        sortFilter: "relevance"
    });

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const data = await fetchBooks(`https://openlibrary.org/search.json?q=${searchTerm}&page=1&limit=${state.limit}`);
                setState((prev) => ({
                    ...prev,
                    values: data,
                }));
                setBooks(data.slice(0, Math.min(10, data.length)));
            } catch (error) {
                console.log("Fetch books data error>>>>>>>>>");
                console.log(error);
            }
            setLoading(false);
        }
        fetchData();
    }, [searchTerm, state.limit]);

    async function fetchBooks(url: string): Promise<Book[]> {
        try {
            
            const response = await fetch(url);
            const data = await response.json();
            if(data.start>=0){
                var id = data.start + 1;

                const booksData: Book[] = data.docs.map((book: any) => ({
                    id: id++,
                    title: book.title,
                    author_name: book.author_name ? book.author_name.join(', ') : 'Unknown',
                    first_publish_year: book.first_publish_year,
                    number_of_pages_median: book.number_of_pages_median,
                    isbn: book.isbn ? book.isbn : []
                }));
                setState((prev) => ({
                    ...prev,
                    numberOfPages: Math.ceil(data.numFound / state.limit)
                }));
                return booksData;
            } else {
                
                const booksData: Book[] = data.docs.map((book: any) => ({
                    id: id++,
                    title: book.title,
                    author_name: book.author_name ? book.author_name.join(', ') : 'Unknown',
                    first_publish_year: book.first_publish_year,
                    number_of_pages_median: book.number_of_pages_median,
                    isbn: book.isbn ? book.isbn : []
                }));
                setState((prev) => ({
                    ...prev,
                    numberOfPages: 1
                }));
                return booksData;
            }
            
        } catch (error) {
            console.error('An error occurred:', error);
            return [];
        }
    }

    const handlePageChange = async (pageNumber: number, newSortFilter?: string, newSortOrder?: string) => {
        setLoading(true); 
        const sortFilter = newSortFilter || state.sortFilter;
        const sortOrder = newSortOrder || state.sortOrder;
        const url = sortFilter === "relevance" 
            ? `https://openlibrary.org/search.json?q=${searchTerm}&page=${pageNumber}&limit=${state.limit}`
            : `https://openlibrary.org/search.json?q=${searchTerm}&page=${pageNumber}&limit=${state.limit}&sort=${sortOrder}`;
        
        try {
            const data = await fetchBooks(url);
            setState((prev) => ({
                ...prev,
                activePage: pageNumber>0?pageNumber:1,
                values: data,
            }));
            setBooks(data);
        } catch (error) {
            console.log(error);
        }
        setLoading(false); 
    };

    const getPaginationRange = (currActive: number, totalPages: number) => {
        const delta = 5;
        const range = [];

        let start = Math.max(2, currActive - delta);
        let end = Math.min(totalPages - 1, currActive + delta);

        range.push(<Pagination.Item onClick={() => handlePageChange(1)}
            active={1 === state.activePage || 0 === state.activePage}>{1}</Pagination.Item>);

        if (start > 2) {
            range.push(<Pagination.Ellipsis key="start-ellipsis" />);
        }

        for (let i = start; i <= end; i++) {
            range.push(<Pagination.Item
                onClick={() => handlePageChange(i)}
                key={`page-${i}`}
                active={i === state.activePage}
            >
                {i}
            </Pagination.Item>);
        }

        if (end < totalPages - 1) {
            range.push(<Pagination.Ellipsis key="end-ellipsis" />);
        }

        if (totalPages > 1) {
            range.push(<Pagination.Item onClick={() => handlePageChange(state.numberOfPages)}
                active={state.numberOfPages === state.activePage}>{state.numberOfPages}</Pagination.Item>);
        }
        return range;
    };

    const changeSortType = (event: React.ChangeEvent<HTMLInputElement>) => {
        const element = event.currentTarget;
        const newSortFilter = element.checked ? "yearPublish" : "relevance";
        setState((prev) => ({ ...prev, sortFilter: newSortFilter }));
        handlePageChange(1, newSortFilter, state.sortOrder);
    };

    const changeSortOrder = (event: React.ChangeEvent<HTMLInputElement>) => {
        const element = event.currentTarget;
        const newSortOrder = element.checked ? "new" : "old";
        setState((prev) => ({ ...prev, sortOrder: newSortOrder }));
        handlePageChange(1, state.sortFilter, newSortOrder);
    };

    return (
        <div className="results-table">
            <div className="toggle-switch">
            <span className="header-titles">Sort By : </span>
            <Form>
                <div className="d-flex align-items-center">
                    <span>Relevance</span>
                    <Form.Check
                        type="switch"
                        id="sort-filter-switch"
                        onChange={changeSortType}
                        className="mx-2"
                    />
                    <span>Year of First Publish</span>
                </div>
            </Form>
            {
                state.sortFilter === "yearPublish" &&
                <Form>
                    <div className="d-flex align-items-center">
                        <span>Old</span>
                        <Form.Check
                            type="switch"
                            id="sort-order-switch"
                            checked={state.sortOrder === "new"}
                            onChange={changeSortOrder}
                            className="mx-2"
                        />
                        <span>New</span>
                    </div>
                </Form>
            }

            </div>
            

            <Table responsive="lg" striped bordered hover>
                <thead>
                    <tr className="header-titles">
                        <th>Result Number</th>
                        <th>Book Title</th>
                        <th>Author</th>
                        <th>Year of First Publish</th>
                        <th>Number of Pages</th>
                        <th>ISBNs</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        Array.from({ length: 10 }).map((_, index) => (
                            <tr key={index}>
                                <td><div className="loading-placeholder" /></td>
                                <td><div className="loading-placeholder" /></td>
                                <td><div className="loading-placeholder" /></td>
                                <td><div className="loading-placeholder" /></td>
                                <td><div className="loading-placeholder" /></td>
                                <td><div className="loading-placeholder" /></td>
                            </tr>
                        ))
                    ) : (
                        books.map((book) => (
                            <tr key={book.id}>
                                <td>{book.id}</td>
                                <td>{book.title}</td>
                                <td>{book.author_name}</td>
                                <td>{book.first_publish_year}</td>
                                <td>{book.number_of_pages_median}</td>
                                <td>
                                    {
                                        book.isbn.slice(0, Math.min(3, book.isbn.length)).map((isbn, index) => (
                                            <span key={isbn}>{isbn}{index < 3 ? ", " : ""}</span>
                                        ))
                                    }
                                    {
                                        book.isbn.length > 3 ? <span> +{book.isbn.length - Math.min(3, book.isbn.length)} more</span> : <></>
                                    }
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
            <Pagination className="px-4">
                <Pagination.First onClick={() => handlePageChange(1)} />
                {
                    state.activePage<1?<Pagination.Prev onClick={() => handlePageChange(1)} />
                    :<Pagination.Prev onClick={() => handlePageChange(state.activePage - 1)} />
                }
                
                {getPaginationRange(state.activePage, state.numberOfPages)}
                <Pagination.Next onClick={() => handlePageChange(state.activePage + 1)} />
                <Pagination.Last onClick={() => handlePageChange(state.numberOfPages)} />
            </Pagination>
        </div>
    );
};

export default RTable;
