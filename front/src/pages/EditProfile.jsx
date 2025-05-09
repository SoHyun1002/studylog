import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateUserInfo } from '../store/authSlice';
import "../style/MyPage.css";

const EditProfile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [user, setUser] = useState(null);
    const [isVerifying, setIsVerifying] = useState(true);
    const [password, setPassword] = useState('');
    const [editForm, setEditForm] = useState({
        uName: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        // 유저 정보 가져오기
        axios.get('http://localhost:8921/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => {
            setUser({
                name: res.data.uName,
                email: res.data.uEmail,
                role: res.data.uRole
            });
            setEditForm({
                uName: res.data.uName,
            });
        })
        .catch(error => {
            console.error('사용자 정보 조회 실패:', error);
            if (error.response?.status === 401) {
                alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
                navigate("/login");
            }
        });
    }, [navigate]);

    const handlePasswordVerification = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post('http://localhost:8921/api/users/verify-password', 
                { password },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.verified) {
                setIsVerifying(false);
            }
        } catch (error) {
            setError('비밀번호가 일치하지 않습니다.');
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.put('http://localhost:8921/api/users/update', 
                {
                    uName: editForm.uName
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Redux store 업데이트
            dispatch(updateUserInfo({
                Name: editForm.uName,
                Email: user.email,
                Role: user.role
            }));

            alert('회원정보가 수정되었습니다.');
            navigate('/mypage');
        } catch (error) {
            console.error('사용자 정보 업데이트 실패:', error);
            setError('사용자 정보 업데이트에 실패했습니다.');
        }
    };

    if (!user) return <div>로딩 중...</div>;

    return (
        <div className="mypage-container">
            <h2 className="mypage-header">회원정보 수정</h2>

            {isVerifying ? (
                <form onSubmit={handlePasswordVerification} className="verify-form">
                    <h3>비밀번호 확인</h3>
                    <p>회원정보를 수정하기 위해 현재 비밀번호를 입력해주세요.</p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="현재 비밀번호를 입력하세요"
                        required
                    />
                    {error && <p className="error-message">{error}</p>}
                    <div className="button-group">
                        <button type="submit">확인</button>
                        <button type="button" onClick={() => navigate('/mypage')}>취소</button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleEditSubmit} className="edit-form">
                    <h3>회원정보 수정</h3>
                    <div className="form-group">
                        <label>이름</label>
                        <input
                            type="text"
                            name="uName"
                            value={editForm.uName}
                            onChange={handleEditChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>이메일</label>
                        <input
                            type="email"
                            value={user.email}
                            disabled
                            className="disabled-input"
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="button-group">
                        <button type="submit">저장</button>
                        <button type="button" onClick={() => navigate('/mypage')}>취소</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default EditProfile; 