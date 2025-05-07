import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../style/MyPage.css";
import "../style/modal.css";
import "../style/deleteAccount.css";

const MyPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [password, setPassword] = useState('');
    const [editForm, setEditForm] = useState({
        uName: '',
    });
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [restorePassword, setRestorePassword] = useState('');

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
            console.log('사용자 정보:', res.data);
            console.log('deletedAt 값:', res.data.deletedAt);
            setUser({
                ...res.data,
                deletedAt: res.data.deletedAt ? new Date(res.data.deletedAt).toLocaleString() : null
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
                setIsEditing(true);
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
        setError('');

        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.put('http://localhost:8921/api/users/update', 
                editForm,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            alert('회원정보가 수정되었습니다.');
            setIsEditing(false);
            // 수정된 정보로 상태 업데이트
            setUser(prev => ({
                ...prev,
                ...editForm
            }));
        } catch (error) {
            setError(error.response?.data?.message || '회원정보 수정에 실패했습니다.');
        }
    };

    const handleChangePassword = () => {
        navigate('/change-password');
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post('http://localhost:8921/api/users/verify-password', 
                { password: deletePassword },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.verified) {
                try {
                    const deleteResponse = await axios.post(
                        `http://localhost:8921/api/users/delete/${user.uEmail}`, 
                        {},
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );

                    localStorage.removeItem('accessToken');
                    alert(deleteResponse.data.message);
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

    const handleRestoreAccount = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post('http://localhost:8921/api/users/verify-password', 
                { password: restorePassword },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.verified) {
                try {
                    const restoreResponse = await axios.post(
                        `http://localhost:8921/api/users/restore/${user.uEmail}`,
                        {},
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );

                    alert(restoreResponse.data.message);
                    setShowRestoreModal(false);
                    setRestorePassword('');
                    // 페이지 새로고침
                    window.location.reload();
                } catch (restoreError) {
                    console.error('계정 복구 실패:', restoreError);
                    setError(restoreError.response?.data?.error || '계정 복구에 실패했습니다.');
                }
            }
        } catch (error) {
            console.error('비밀번호 확인 실패:', error);
            setError(error.response?.data?.error || '비밀번호가 일치하지 않습니다.');
        }
    };

    if (!user) return <div>로딩 중...</div>;

    return (
        <div className="mypage-container">
            <h2 className="mypage-header">마이페이지</h2>

            {!isEditing && !isVerifying && (
                <div className="user-info">
                    <p><strong>이름:</strong> {user.uName}</p>
                    <p><strong>이메일:</strong> {user.uEmail}</p>
                    <div className="button-group">
                        <button 
                            className="edit-button"
                            onClick={() => setIsVerifying(true)}
                        >
                            회원정보 수정
                        </button>
                        <button 
                            className="change-password-button"
                            onClick={handleChangePassword}
                        >
                            비밀번호 변경
                        </button>
                        {user.deletedAt ? (
                            <button 
                                className="restore-account-button"
                                onClick={() => setShowRestoreModal(true)}
                            >
                                계정 복구
                            </button>
                        ) : (
                            <button 
                                className="delete-account-button"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                회원 탈퇴
                            </button>
                        )}
                    </div>
                </div>
            )}

            {isVerifying && (
                <form onSubmit={handlePasswordVerification} className="verify-form">
                    <h3>비밀번호 확인</h3>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="현재 비밀번호를 입력하세요"
                        required
                    />
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit">확인</button>
                    <button type="button" onClick={() => setIsVerifying(false)}>취소</button>
                </form>
            )}

            {isEditing && (
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
                            value={user.uEmail}
                            disabled
                            className="disabled-input"
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="button-group">
                        <button type="submit">저장</button>
                        <button type="button" onClick={() => setIsEditing(false)}>취소</button>
                    </div>
                </form>
            )}

            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>회원 탈퇴</h3>
                            <button 
                                className="close-button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletePassword('');
                                    setError('');
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <p>정말로 탈퇴하시겠습니까? 탈퇴한 계정은 복구할 수 없습니다.</p>
                        <form onSubmit={handleDeleteAccount} className="delete-form">
                            <p>비밀번호를 입력하여 확인해주세요:</p>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                required
                            />
                            {error && <p className="error-message">{error}</p>}
                            <div className="button-group">
                                <button type="submit" className="delete-confirm-button">
                                    탈퇴하기
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeletePassword('');
                                        setError('');
                                    }}
                                >
                                    취소
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showRestoreModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>계정 복구</h3>
                        <p>계정을 복구하시려면 비밀번호를 입력해주세요:</p>
                        <form onSubmit={handleRestoreAccount} className="restore-form">
                            <input
                                type="password"
                                value={restorePassword}
                                onChange={(e) => setRestorePassword(e.target.value)}
                                required
                            />
                            {error && <p className="error-message">{error}</p>}
                            <div className="button-group">
                                <button type="submit" className="restore-confirm-button">
                                    복구하기
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowRestoreModal(false);
                                        setRestorePassword('');
                                        setError('');
                                    }}
                                >
                                    취소
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyPage;
