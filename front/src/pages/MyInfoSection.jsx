import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyInfoSection = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        axios.get('http://localhost:8921/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            setUser({
                name: res.data.uName,
                email: res.data.uEmail,
                // 필요시 닉네임, 프로필 등 추가
            });
        });
    }, []);

    if (!user) return <div>로딩 중...</div>;

    return (
        <div className="user-info-section">
            <h3>내 정보</h3>
            <div className="user-info">
                <p><strong>이름:</strong> {user.name}</p>
                <p><strong>이메일:</strong> {user.email}</p>
            </div>
            <div className="button-group">
                <button className="edit-button" onClick={() => navigate('/mypage/edit')}>정보 수정</button>            
            </div>
        </div>
    );
};

export default MyInfoSection; 