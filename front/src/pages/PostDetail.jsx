import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../style/PostDetail.css';

function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ author: '', content: '' });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role === 'admin') {
      setIsAdmin(true);
    }

    axios.get(`http://localhost:3001/posts/${postId}`)
      .then(response => setPost(response.data))
      .catch(error => console.error('게시글 불러오기 오류:', error));

    fetchComments();
  }, [postId]);

  const fetchComments = () => {
    axios.get(`http://localhost:3001/comments?postId=${postId}`)
      .then(response => setComments(response.data))
      .catch(error => console.error('댓글 불러오기 오류:', error));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewComment(prev => ({ ...prev, [name]: value }));
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!newComment.author.trim() || !newComment.content.trim()) {
      alert('작성자와 내용을 모두 입력해주세요.');
      return;
    }

    const commentData = {
      postId: Number(postId),
      author: newComment.author,
      content: newComment.content,
      createdAt: new Date().toISOString()
    };

    try {
      await axios.post('http://localhost:3001/comments', commentData);
      setNewComment({ author: '', content: '' });
      fetchComments();
    } catch (error) {
      console.error('댓글 등록 오류:', error);
    }
  };

  const handleEditClick = () => {
    navigate(`/post/edit/${postId}`);
  };

  if (!post) return <div className="post-detail-container">게시글을 불러오는 중입니다...</div>;

  return (
    <div className="post-detail-container">
      <h2 className="post-detail-title">{post.title}</h2>
      <p className="post-detail-author">작성자: {post.author}</p>
      <div className="post-detail-content">{post.content}</div>

      {/* 로컬스토리지에서 role이 admin일 때만 수정 버튼 보이기 */}
      {isAdmin && (
        <button onClick={handleEditClick} className="edit-button">
          수정
        </button>
      )}

      <hr />
      <div className="comment-section">
        <h3>댓글</h3>
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <input
            type="text"
            name="author"
            placeholder="작성자"
            value={newComment.author}
            onChange={handleInputChange}
          />
          <textarea
            name="content"
            placeholder="댓글 내용을 입력하세요"
            value={newComment.content}
            onChange={handleInputChange}
          />
          <button type="submit">댓글 등록</button>
        </form>

        <ul className="comment-list">
          {comments.length === 0 ? (
            <li className="comment-item">댓글이 없습니다.</li>
          ) : (
            comments.map(comment => (
              <li key={comment.id} className="comment-item">
                <strong>{comment.author}</strong>{comment.content}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default PostDetail;
  