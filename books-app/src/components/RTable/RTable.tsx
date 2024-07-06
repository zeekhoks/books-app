import React from "react";
import { useState, useEffect } from "react";
import Pagination from "react-bootstrap/Pagination";
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';

interface Book {
    id: number;
    title: string;
    author_name: string;
    first_publish_year: number;
    number_of_pages_median: number;
    isbn: string[];
}


const RTable = () => {
    const [books, setBooks] = useState<Book[]>([]);


    const [state, setState] = useState({
        values: books,
        limit: 10,
        activePage: 1,
        numberOfPages: 10,
        sort: "old"

    });

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await fetchBooks(`https://openlibrary.org/search.json?title=harry+potter&sort=${state.sort}&page=1&limit=${state.limit}`);
                setState((prev) => ({
                    ...prev,
                    values: data,
                }));
                setBooks(data.slice(0, Math.min(10, data.length)));
            } catch (error) {
                console.log("Fetch books data error>>>>>>>>>");
                console.log(error);
            }
        }
        fetchData();
    }, [state.limit]);


    async function fetchBooks(url: string): Promise<Book[]> {
        try {
            const response = await fetch(url);
            const data = await response.json();
            var id = data.start + 1;
            // Extract and transform the data to match the Book[] type
            console.log("Page Number>>>" + state.activePage);
            const booksData: Book[] = data.docs.map((book: any) => ({
                id: id++,
                title: book.title,
                author_name: book.author_name ? book.author_name.join(', ') : 'Unknown',
                first_publish_year: book.first_publish_year,
                number_of_pages_median: book.number_of_pages_median,
                isbn: book.isbn ? book.isbn : []
            }));
            console.log("no of pges: ", Math.ceil(data.numFound / state.limit))
            setState((prev) => ({
                ...prev,
                numberOfPages: Math.ceil(data.numFound / state.limit)
            }));
            return booksData;
        } catch (error) {
            console.error('Some Error Occurred:', error);
            return [];
        }
    }

    const handlePageChange = (pageNumber: number) => {
        console.log("Page Number>>>" + pageNumber);
        setState((prev) => ({ ...prev, activePage: pageNumber }));
        console.log("Active page number in state after setting >>>>>" + state.activePage);
        async function fetchNextData() {
            try {
                console.log("In handle page change>>>");
                const data = await fetchBooks(`https://openlibrary.org/search.json?title=harry+potter&sort=${state.sort}&page=${pageNumber}&limit=${state.limit}`);
                setState((prev) => ({
                    ...prev,
                    values: data
                }));
                setBooks(data);
            } catch (error) {
                console.log(error);
            }
        }
        fetchNextData();
    }

    const getPaginationRange = (currActive: number, totalPages: number) => {
        const delta = 5;
        const range = [];

        let start = Math.max(2, currActive - delta);
        let end = Math.min(totalPages - 1, currActive + delta);

        // Add first page
        range.push(<Pagination.Item onClick={() => handlePageChange(1)}
            active={1 === state.activePage}>{1}</Pagination.Item>);

        // Add ellipsis if needed
        if (start > 2) {
            range.push(<Pagination.Ellipsis />);
        }

        // Add range of pages
        for (let i = start; i <= end; i++) {
            range.push(<Pagination.Item
                onClick={() => handlePageChange(i)}
                key={i}
                active={i === state.activePage}
            >
                {i}
            </Pagination.Item>);
        }

        // Add ellipsis if needed
        if (end < totalPages - 1) {
            range.push(<Pagination.Ellipsis />);
        }

        // Add last page
        if (totalPages > 1) {
            range.push(<Pagination.Item onClick={() => handlePageChange(state.numberOfPages)}
                active={state.numberOfPages === state.activePage}>{state.numberOfPages}</Pagination.Item>);
        }

        return range;
    }

    const sortByYearOfPublish = () => {

        async function fetchSortedData() {
            try {
                console.log("Sort state before clicking on toggle>>>>" + state.sort);
                const data = await fetchBooks(`https://openlibrary.org/search.json?title=harry+potter&sort=new&page=${1}&limit=${state.limit}`);
                setState((prev) => ({
                    ...prev,
                    sort: "new",
                    values: data
                }));
                setBooks(data);
            } catch (error) {
                console.log(error);
            }
        }
        fetchSortedData();
    }

    return (
        <div>
            <Form className="toggle-switch">
                <Form.Check
                    type="switch"
                    id="custom-switch"
                    label="Sort by Year of First Publish"
                    onChange={()=>sortByYearOfPublish()}
                />
            </Form>

            <Table responsive="lg" striped bordered hover>
                <thead>
                    <tr>
                        <th>Result Number</th>
                        <th>Book Title</th>
                        <th>Author</th>
                        <th>Year of First Publish</th>
                        <th>Number of Pages</th>
                        <th>ISBNs</th>

                    </tr>
                </thead>
                <tbody>
                    {books.map((book) => (
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
                    ))}
                </tbody>

            </Table>
            <Pagination className="px-4">
                <Pagination.First onClick={() => handlePageChange(1)} />
                <Pagination.Prev onClick={() => handlePageChange(state.activePage - 1)} />
                {
                    getPaginationRange(state.activePage, state.numberOfPages)
                }
                <Pagination.Next onClick={() => handlePageChange(state.activePage + 1)} />
                <Pagination.Last onClick={() => handlePageChange(state.numberOfPages)} />
            </Pagination>

        </div>



    )
}

export default RTable;