import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateUserInfo, logout } from '../store/authSlice';
import "../style/MyPage.css";
import "../style/modal.css";
import "../style/deleteAccount.css";
import MyInfoSection from './MyInfoSection';
import DeleteAccountSection from './DeleteAccountSection';
import StudyGroupSection from './StudyGroupSection';

const MyPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
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
    const [userInfo, setUserInfo] = useState({
        email: '',
        nickname: '',
        profileImage: null
    });
    const [managedGroups, setManagedGroups] = useState([]);
    const [joinedGroups, setJoinedGroups] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState('info');

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
            
            // Redux store 업데이트
            dispatch(updateUserInfo({
                Name: res.data.uName,
                Email: res.data.uEmail,
                Role: res.data.uRole
            }));

            // 로컬 상태 업데이트
            setUser({
                name: res.data.uName,
                email: res.data.uEmail,
                role: res.data.uRole,
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

        fetchUserInfo();
        fetchStudyGroups();
    }, [navigate]);

    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get('http://localhost:8921/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setUserInfo(response.data);
        } catch (error) {
            setError('사용자 정보를 불러오는데 실패했습니다.');
        }
    };

    const fetchStudyGroups = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const [managedResponse, joinedResponse] = await Promise.all([
                axios.get('http://localhost:8921/api/study-groups/managed', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get('http://localhost:8921/api/study-groups/joined', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);
            setManagedGroups(managedResponse.data);
            setJoinedGroups(joinedResponse.data);
        } catch (error) {
            setError('스터디그룹 정보를 불러오는데 실패했습니다.');
        }
    };

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
        try {
            const token = localStorage.getItem('accessToken');
            console.log('변경할 이름:', editForm.uName);
            
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

            console.log('서버 응답:', response.data);

            // Redux store 업데이트
            dispatch(updateUserInfo({
                Name: editForm.uName,
                Email: user.email,
                Role: user.role
            }));

            // 로컬 상태 업데이트
            setUser(prevUser => ({
                ...prevUser,
                name: editForm.uName
            }));
            
            alert('회원정보가 수정되었습니다.');
            setIsEditing(false);

            // 변경 후 즉시 사용자 정보 다시 가져오기
            const userResponse = await axios.get('http://localhost:8921/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('변경 후 사용자 정보:', userResponse.data);
            
            // Redux store 다시 업데이트
            dispatch(updateUserInfo({
                Name: userResponse.data.uName,
                Email: userResponse.data.uEmail,
                Role: userResponse.data.uRole
            }));

            // 로컬 상태 다시 업데이트
            setUser({
                name: userResponse.data.uName,
                email: userResponse.data.uEmail,
                role: userResponse.data.uRole,
                deletedAt: userResponse.data.deletedAt ? new Date(userResponse.data.deletedAt).toLocaleString() : null
            });
        } catch (error) {
            console.error('사용자 정보 업데이트 실패:', error);
            alert('사용자 정보 업데이트에 실패했습니다.');
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
                    setUser(null);
                    // localStorage 정리
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('userState');
                    
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
                        `http://localhost:8921/api/users/restore/${user.email}`,
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
        <div className="mypage-wrapper">
            <nav className="sidebar">
                <h2>마이페이지</h2>
                <ul>
                    <li className={selectedMenu === 'info' ? 'active' : ''} onClick={() => setSelectedMenu('info')}>내 정보</li>
                    <li className={selectedMenu === 'study' ? 'active' : ''} onClick={() => setSelectedMenu('study')}>스터디 그룹</li>
                    <li className={selectedMenu === 'delete' ? 'active' : ''} onClick={() => setSelectedMenu('delete')}>회원 탈퇴</li>
                </ul>
            </nav>
            <main className="main-content">
                {selectedMenu === 'info' && <MyInfoSection />}
                {selectedMenu === 'study' && <StudyGroupSection />}
                {selectedMenu === 'delete' && <DeleteAccountSection />}
            </main>
        </div>
    );
};

export default MyPage;