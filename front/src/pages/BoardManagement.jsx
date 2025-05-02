import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../style/BoardManagement.css';

function BoardManagement() {
  const [boards, setBoards] = useState([]);
  const [editingBoard, setEditingBoard] = useState(null);
  const [boardName, setBoardName] = useState('');
  const [newBoardName, setNewBoardName] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3001/boards')
      .then(response => setBoards(response.data))
      .catch(error => console.error('보드 목록 불러오기 실패:', error));
  }, []);

  const handleEditClick = (board) => {
    setEditingBoard(board);
    setBoardName(board.name);
  };

  const handleInputChange = (e) => {
    setBoardName(e.target.value);
  };

  const handleSaveClick = (boardId) => {
    if (!boardName.trim()) {
      alert('보드 이름을 입력하세요.');
      return;
    }

    axios.put(`http://localhost:3001/boards/${boardId}`, { name: boardName })
      .then(() => {
        setBoards(prev => prev.map(b => b.id === boardId ? { ...b, name: boardName } : b));
        setEditingBoard(null);
      })
      .catch(error => console.error('보드 수정 실패:', error));
  };

  const handleDeleteClick = (boardId) => {
    if (window.confirm('정말로 이 보드를 삭제하시겠습니까?')) {
      axios.delete(`http://localhost:3001/boards/${boardId}`)
        .then(() => {
          setBoards(prev => prev.filter(b => b.id !== boardId));
        })
        .catch(error => console.error('보드 삭제 실패:', error));
    }
  };

  const handleAddBoard = () => {
    if (!newBoardName.trim()) {
      alert('보드 이름을 입력하세요.');
      return;
    }

    axios.post('http://localhost:3001/boards', { name: newBoardName })
      .then(response => {
        setBoards(prev => [...prev, response.data]);
        setNewBoardName('');
      })
      .catch(error => console.error('보드 추가 실패:', error));
  };

  return (
    <div className="board-management-container">
      <h2>보드 관리</h2>

      <div className="board-add-form">
        <input
          type="text"
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          placeholder="새로운 보드 이름"
        />
        <button onClick={handleAddBoard}>보드 추가</button>
      </div>

      <ul className="board-list">
        {boards.map(board => (
          <li key={board.id}>
            {editingBoard?.id === board.id ? (
              <>
                <input
                  type="text"
                  value={boardName}
                  onChange={handleInputChange}
                  placeholder="보드 이름"
                />
                <button onClick={() => handleSaveClick(board.id)}>저장</button>
              </>
            ) : (
              <>
                <span>{board.name}</span>
                <button onClick={() => handleEditClick(board)}>수정</button>
                <button onClick={() => handleDeleteClick(board.id)}>삭제</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BoardManagement;
