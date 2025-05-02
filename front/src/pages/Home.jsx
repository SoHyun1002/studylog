import { useNavigate } from "react-router-dom";
import '../style/Home.css';
import BoardTag from "../components/BoardTag";

function Home() {
    const navigate = useNavigate();

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            navigate("/board");
        }
    };

    const handleTagClick = (tag) => {
        // 태그 클릭 시, 해당 태그를 기반으로 검색을 할 수 있게 처리
        navigate("/board", { state: { tag: tag } });
    };

    return (
        <div className="home-page">
            <h1>STUDYLOG</h1>
            <div className="search-box">
                <input
                    type="text"
                    placeholder="검색어를 입력하세요"
                    onKeyDown={handleKeyDown}
                />
            </div>
            {/* TagList 컴포넌트를 사용하고, 태그 클릭 시의 처리를 위해 handleTagClick 전달 */}
            <BoardTag onTagClick={handleTagClick} />
        </div>
    );
}

export default Home;
