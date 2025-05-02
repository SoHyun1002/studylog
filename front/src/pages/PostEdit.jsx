import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../style/PostEdit.css'; // 새로운 스타일 파일 사용

function PostEdit() {
    const { postId } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:3001/posts/${postId}`)
            .then(response => setPost(response.data))
            .catch(error => console.error('게시글 불러오기 실패:', error));
    }, [postId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPost(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.put(`http://localhost:3001/posts/${postId}`, post)
            .then(() => {
                alert('수정이 완료되었습니다.');
                navigate('/board');
            })
            .catch(error => {
                console.error('수정 실패:', error);
                alert('수정 중 오류가 발생했습니다.');
            });
    };

    const handleDelete = () => {
        if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            axios.delete(`http://localhost:3001/posts/${postId}`)
                .then(() => {
                    alert('게시글이 삭제되었습니다.');
                    navigate('/board');
                })
                .catch(error => {
                    console.error('삭제 실패:', error);
                    alert('삭제 중 오류가 발생했습니다.');
                });
        }
    };

    if (!post) return <div>로딩 중...</div>;

    return (
        <div className="post-edit-container">
            <h2>게시글 수정</h2>
            <form onSubmit={handleSubmit} className="post-edit-form">
                <div>
                    <label htmlFor="title">제목:</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={post.title}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="content">내용:</label>
                    <textarea
                        id="content"
                        name="content"
                        value={post.content}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="author">작성자:</label>
                    <input
                        type="text"
                        id="author"
                        name="author"
                        value={post.author}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <button type="submit">수정 완료</button>
            </form>

            <button onClick={handleDelete} className="delete-button">
                삭제하기
            </button>
        </div>
    );
}

export default PostEdit;
