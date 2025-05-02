import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../style/BoardCategory.css';

function BoardCategory({ onBoardSelect }) {
  const [boards, setBoards] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState(null);  // 선택된 보드의 ID 관리

  useEffect(() => {
    axios.get('http://localhost:8787/api/boards')
      .then(response => setBoards(response.data))
      .catch(error => console.error('보드 목록 불러오기 실패:', error));
  }, []);

  const handleBoardClick = (boardId) => {
    setSelectedBoardId(boardId);  // 보드 선택 시 해당 보드 ID로 상태 업데이트
    onBoardSelect(boardId);  // 상위 컴포넌트에 선택된 보드 ID 전달
  };

  return (
    <div className="board-category">
      <ul className="board-list">
        {/* "전체" 선택지 추가 */}
        <li
          key="all"
          onClick={() => handleBoardClick(null)}  // "전체" 선택 시 null을 전달하여 모든 보드 보기
          className={`board-item ${selectedBoardId === null ? 'selected' : ''}`}  // 선택된 상태에 스타일 추가
        >
          전체
        </li>
        {boards.map(board => (
          <li
            key={board.bid}
            onClick={() => handleBoardClick(board.bid)}
            className={`board-item ${selectedBoardId === board.bid ? 'selected' : ''}`}  // 선택된 보드에 스타일 추가
          >
            {board.category}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BoardCategory;
