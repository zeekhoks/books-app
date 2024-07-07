import { useState } from "react";
import { Form } from "react-bootstrap";
import { useDebouncedCallback } from "use-debounce";
import "./search.css";

const SearchBar = ({ sendDataToParent }: { sendDataToParent: (data: string) => void }) => {
    const [searchTerm, setSearchTerm] = useState<string>('');

    const debouncedSendDataToParent = useDebouncedCallback((value: string) => {
        sendDataToParent(value);
    }, 200); 

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const element = event.currentTarget;
        setSearchTerm(element.value);
        debouncedSendDataToParent(element.value);
    }

    return (
        <div className="search-bar-container"> 
            <Form.Control
                id="search-bar"
                size="lg"
                type="text"
                placeholder="Enter book title, author, number of pages...."
                onChange={handleInputChange}
                value={searchTerm}
            />
        </div>
    );
}

export default SearchBar;
