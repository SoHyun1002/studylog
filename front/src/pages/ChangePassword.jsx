import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { passwordChangeSuccess, passwordChangeFailure } from '../store/authSlice';
import "../style/MyPage.css";

const ChangePassword = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.newPassword !== form.confirmPassword) {
            setError('새 비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post('http://localhost:8921/api/users/verify-password', 
                { password: form.currentPassword },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.verified) {
                // 비밀번호 검증 성공 후 새 비밀번호로 변경
                await axios.put('http://localhost:8921/api/users/change-password',
                    { newPassword: form.newPassword },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                // Redux store 업데이트
                dispatch(passwordChangeSuccess());
                alert('비밀번호가 변경되었습니다.');
                navigate('/mypage');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || '비밀번호 변경에 실패했습니다.';
            setError(errorMessage);
            dispatch(passwordChangeFailure(errorMessage));
        }
    };

    return (
        <div className="mypage-container">
            <h2 className="mypage-header">비밀번호 변경</h2>
            <form onSubmit={handleSubmit} className="edit-form">
                <div className="form-group">
                    <label>현재 비밀번호</label>
                    <input
                        type="password"
                        name="currentPassword"
                        value={form.currentPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>새 비밀번호</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>새 비밀번호 확인</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <div className="button-group">
                    <button type="submit">변경</button>
                    <button type="button" onClick={() => navigate('/mypage')}>취소</button>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword; 