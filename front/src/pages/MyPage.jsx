import React, { useEffect, useState } from 'react';
import axios from 'axios';

import "../style/MyPage.css"
import { useNavigate } from 'react-router-dom';

const MyPage = () => {
    const [user, setUser] = useState(null);
    const [myPosts, setMyPosts] = useState([]);
    const [myComments, setMyComments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            alert("로그인이 필요합니다.");
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        const userId = parsedUser.id;

        // 유저 정보 가져오기
        axios.get(`http://localhost:3001/users/${userId}`)
            .then(res => setUser(res.data))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!user) {
            navigate("/login")
        };

        // 작성자 이름 기준으로 게시글, 댓글 필터링
        axios.get(`http://localhost:8787/posts`)
            .then(res => {
                const posts = res.data.filter(post => post.author === user.name);
                setMyPosts(posts);
            });

        axios.get(`http://localhost:8787/comments`)
            .then(res => {
                const comments = res.data.filter(comment => comment.author === user.name);
                setMyComments(comments);
            });
    }, [user]);

    if (!user) return <div>로딩 중...</div>;

    return (
        <div className="mypage-container">
            <h2 className="mypage-header">마이페이지</h2>

            <div className="user-info">
                <p><strong>이름:</strong> {user.name}</p>
                <p><strong>이메일:</strong> {user.email}</p>
                <p><strong>역할:</strong> {user.role}</p>
            </div>

            <div className="section">
                <h3>내 게시글</h3>
                <ul>
                    {myPosts.map(post => (
                        <li
                            key={post.id}
                            onClick={() => navigate(`/posts/${post.id}`)}
                        >{post.title} ({new Date(post.createdAt).toLocaleDateString()})</li>
                    ))}
                </ul>
            </div>

            <div className="section">
                <h3>내 댓글</h3>
                <ul>
                    {myComments.map(comment => (
                        <li
                            key={comment.id}
                            onClick={() => navigate(`/posts/${comment.postId}`)}
                        >{comment.content} ({new Date(comment.createdAt).toLocaleDateString()})</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default MyPage;
