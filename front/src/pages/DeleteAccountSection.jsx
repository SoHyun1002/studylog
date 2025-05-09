import React, { useState } from 'react';
import axios from 'axios';

const DeleteAccountSection = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleDelete = async (e) => {
        e.preventDefault();
        setError('');
        const token = localStorage.getItem('accessToken');
        try {
            // 비밀번호 검증 및 탈퇴 API 호출
            await axios.post('http://localhost:8921/api/users/verify-password', { password }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // 실제 탈퇴 API 호출 등 추가
            alert('탈퇴 처리 완료');
        } catch (err) {
            setError('비밀번호가 일치하지 않습니다.');
        }
    };

    return (
        <div className="account-danger-zone">
            <h3>회원 탈퇴</h3>
            <form className="delete-form" onSubmit={handleDelete}>
                <p>비밀번호를 입력하여 탈퇴를 확인하세요.</p>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                {error && <div className="error-message">{error}</div>}
                <div className="button-group">
                    <button type="submit" className="delete-confirm-button">탈퇴하기</button>
                </div>
            </form>
        </div>
    );
};

export default DeleteAccountSection; 