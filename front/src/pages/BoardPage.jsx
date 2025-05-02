import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BoardCategory from "../components/BoardCategory";
import PostList from "../components/PostList";
import '../style/BoardPage.css';

function BoardPage() {  
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const navigate = useNavigate();
  
  // useLocation 훅을 사용하여 전달된 state에서 tag 값 가져오기
  const location = useLocation();
  
  // 컴포넌트가 마운트될 때 태그 값을 가져와서 selectedBoardId에 설정
  useEffect(() => {
    if (location.state?.tag) {
      setSelectedBoardId(location.state.tag); // location.state에서 tag 값을 selectedBoardId로 설정
    }
  }, [location.state]);

  return (
    <div className="board-page-container">
      <h2 className="board-page-title">게시판</h2>
      
      <div className="board-page-actions">
        <button className="board-page-write-button" onClick={() => navigate("/posts/create")}>글쓰기</button>
      </div>
      
      <div className="board-page-content">
        <div className="board-page-category">
          <BoardCategory onBoardSelect={setSelectedBoardId} />
        </div>

        <div className="post-list-container">
          <PostList boardId={selectedBoardId || null} />
        </div>
      </div>
    </div>
  );
}

export default BoardPage;
