import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('새 비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.put('http://localhost:8921/api/users/change-password',
                { newPassword },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            alert('비밀번호가 성공적으로 변경되었습니다.');
            navigate('/mypage');
        } catch (error) {
            setError(error.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다.');
        }
    };

    return (
        <div>
            {/* 폼 부분을 여기에 추가해야 합니다. */}
        </div>
    );
};

export default ChangePassword; 