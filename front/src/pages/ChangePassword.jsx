import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../style/MyPage.css";

const ChangePassword = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: '',
        verificationCode: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSendVerificationCode = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8921/api/users/send-verification-code', {
                email: form.email
            });
            setIsCodeSent(true);
            alert('인증 코드가 이메일로 전송되었습니다.');
        } catch (error) {
            setError(error.response?.data?.message || '인증 코드 전송 중 오류가 발생했습니다.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) {
            setError('새 비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            await axios.post('http://localhost:8921/api/users/reset-password', {
                email: form.email,
                verificationCode: form.verificationCode,
                newPassword: form.newPassword
            });
            alert('비밀번호가 성공적으로 변경되었습니다.');
            navigate('/login');
        } catch (error) {
            setError(error.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="mypage-container">
            <h2 className="mypage-header">비밀번호 재설정</h2>
            <form onSubmit={handleSubmit} className="edit-form">
                <div className="form-group">
                    <label>이메일</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <button type="button" onClick={handleSendVerificationCode}>
                        인증 코드 받기
                    </button>
                </div>
                {isCodeSent && (
                    <>
                        <div className="form-group">
                            <label>인증 코드</label>
                            <input
                                type="text"
                                name="verificationCode"
                                value={form.verificationCode}
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
                    </>
                )}
                {error && <p className="error-message">{error}</p>}
                <div className="button-group">
                    {isCodeSent && <button type="submit">변경</button>}
                    <button type="button" onClick={() => navigate('/login')}>취소</button>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword; 