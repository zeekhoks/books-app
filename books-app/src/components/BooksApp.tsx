
import RTable from "./RTable/RTable";
import "./RTable/rtable.css";


interface Book {
    id: number;
    title: string;
    author_name: string;
    first_publish_year: number;
    number_of_pages_median: number;
    isbn: string[];
}

const BookApp = () => {
    

    return (
        <div>
            <h2>Books App</h2>
            <RTable />
        </div>
    )
}

export default BookApp;