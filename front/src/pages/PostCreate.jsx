import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import '../style/PostCreate.css';

const PostCreate = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [boardId, setBoardId] = useState('');
  const [createdAt, setCreatedAt] = useState(new Date().toISOString());
  const [boards, setBoards] = useState([]);

  const editorRef = useRef(null); // TinyMCE editor ref
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8787/boards')
        .then(response => {
          setBoards(response.data);
        })
        .catch(error => {
          console.error('보드 목록 불러오기 실패:', error);
        });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!boardId) {
      alert('보드를 선택해주세요!');
      return;
    }

    const content = editorRef.current ? editorRef.current.getContent() : '';

    const newPost = {
      boardId,
      title,
      content,
      author,
      createdAt,
    };

    axios.post('http://localhost:8787/posts', newPost)
        .then(response => {
          alert('포스트가 생성되었습니다!');
          setTitle('');
          setAuthor('');
          setBoardId('');
          if (editorRef.current) editorRef.current.setContent('');
          navigate("/board");
        })
        .catch(error => {
          console.error('포스트 저장 실패:', error);
          alert('포스트 저장에 실패했습니다. 다시 시도해주세요.');
        });
  };

  return (
      <div className="post-create-container">
        <h2>포스트 생성</h2>
        <form onSubmit={handleSubmit} className="post-create-form">
          <div>
            <label htmlFor="title">제목:</label>
            <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
          </div>

          <div>
            <label htmlFor="content">내용:</label>
            <Editor
                apiKey="no-api-key"
                onInit={(evt, editor) => editorRef.current = editor}
                initialValue="<p>여기에 내용을 작성하세요</p>"
                init={{
                  height: 500,
                  menubar: true,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                    'preview', 'anchor', 'searchreplace', 'visualblocks',
                    'code', 'fullscreen', 'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar:
                      'undo redo | formatselect | bold italic backcolor | \
                       alignleft aligncenter alignright alignjustify | \
                       bullist numlist outdent indent | removeformat | help'
                }}
            />
          </div>

          <div>
            <label htmlFor="author">작성자:</label>
            <input
                type="text"
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
            />
          </div>

          <div>
            <label htmlFor="board">보드 선택:</label>
            <select
                id="board"
                value={boardId}
                onChange={(e) => setBoardId(e.target.value)}
                required
            >
              <option value="">-- 보드 선택 --</option>
              {boards.map(board => (
                  <option key={board.id} value={board.id}>{board.name}</option>
              ))}
            </select>
          </div>

          <button type="submit">포스트 생성</button>
        </form>
      </div>
  );
};

export default PostCreate;
