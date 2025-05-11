import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice'; // Adjust path as necessary
import '../style/DeleteAccountSection.css';

const DeleteAccountSection = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Assuming you're using react-router-dom
    const dispatch = useDispatch(); // Assuming you're using react-redux
    const user = useSelector(state => state.auth.user); // Assuming user is stored in Redux under auth

    const handleDelete = async (e) => {
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
                if (!user || !user.email) {
                    setError('사용자 정보가 없습니다. 다시 로그인해주세요.');
                    return;
                }
                try {
                    const deleteResponse = await axios.post(
                        `http://localhost:8921/api/users/delete/${user.email}`,
                        {},
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );

                    // Redux store 초기화
                    dispatch(logout());
                    // 로컬 상태 초기화
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('userState');

                    alert('회원 탈퇴가 신청되었습니다. 30일 후 계정이 삭제됩니다.');
                    navigate('/login');
                } catch (deleteError) {
                    console.error('회원 탈퇴 실패:', deleteError);
                    setError(deleteError.response?.data?.error || '회원 탈퇴에 실패했습니다.');
                }
            }
        } catch (error) {
            console.error('비밀번호 확인 실패:', error);
            setError(error.response?.data?.error || '비밀번호가 일치하지 않습니다.');
        }
    };

    return (
        <div className="account-danger-zone">
            <h3>회원 탈퇴</h3>
            <form className="delete-form" onSubmit={handleDelete}>
                <p>비밀번호를 입력하여 탈퇴를 확인하세요.</p>
                <p className="delete-notice">* 회원 탈퇴 신청 후 30일 동안 계정이 보관되며, 이 기간 동안 로그인하면 탈퇴를 취소할 수 있습니다.</p>
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