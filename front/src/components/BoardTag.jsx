import React, { useEffect, useState } from 'react';
import axios from 'axios';

function BoardTag({ onTagClick }) {
  const [boards, setBoards] = useState([]);

  useEffect(() => {
    // 서버에서 보드 목록을 가져와 태그 추출
    axios.get('http://localhost:3001/boards')
      .then(response => {
        // 서버에서 보드 이름과 id를 가져온 뒤, 랜덤하게 5개를 선택하여 태그로 설정
        const randomBoards = shuffleArray(response.data).slice(0, 5);
        setBoards(randomBoards);
      })
      .catch(error => console.error('보드 목록 불러오기 실패:', error));
  }, []);

  // 배열 섞기 함수 (랜덤으로 배열을 섞기 위해)
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap
    }
    return shuffled;
  };

  return (
    <div className="tags">
      {boards.map((board) => (
        <span 
          key={board.id} 
          className="tag" 
          onClick={() => onTagClick(board.id)}  // 클릭 시 해당 board의 id 전달
        >
          #{board.name}  {/* 태그 이름을 표시 */}
        </span>
      ))}
    </div>
  );
}

export default BoardTag;
