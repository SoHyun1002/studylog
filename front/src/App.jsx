import './App.css'
import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess, updateUserInfo } from './store/authSlice';
import axios from 'axios';
import Home from './pages/Home';
import Login from './pages/Login';
import Header from './layout/Header';
import Footer from './layout/Footer';
import BoardPage from './pages/BoardPage';
import Register from './pages/Register';
import ScrollTop from './components/ScrollTop';
import PostDetail from './pages/PostDetail';
import BoardManagement from './pages/BoardManagement';
import PostCreate from './pages/PostCreate';
import SchedulePage from './pages/SchedulePage';
import PostEdit from './pages/PostEdit';
import MyPage from './pages/MyPage';
import EmailVerification from "./pages/EmailVerification";
import ChangePassword from './pages/ChangePassword';
import ResetPassword from './pages/ResetPassword';
import EditProfile from './pages/EditProfile';
import OpenAIPage from './pages/OpenAIPage';
import StudySearch from './pages/StudySearch';
import StudyCreate from './pages/StudyCreate';
import StudyDetail from './pages/StudyDetail';
import RestoreAccount from './pages/RestoreAccount';



function App() {
    const location = useLocation();
    const dispatch = useDispatch();
    const hideLayoutRoutes = ["/login", "/register", "/reset-password", "/restore-account"];
    const hideLayout = hideLayoutRoutes.includes(location.pathname);

    useEffect(() => {
        // localStorage에서 저장된 상태 확인
        const savedUserState = localStorage.getItem('userState');
        const savedToken = localStorage.getItem('accessToken');

        if (savedUserState && savedToken) {
            const userState = JSON.parse(savedUserState);
            if (userState.isLoggedIn) {
                // Redux 상태 복원
                dispatch(loginSuccess({
                    uName: userState.user.name,
                    uEmail: userState.user.email,
                    uRole: userState.user.role,
                    deletedAt: userState.user.deletedAt
                }));
                // axios 헤더에 토큰 설정
                axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;

                // 서버에서 최신 사용자 정보 가져오기
                axios.get('http://localhost:8921/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${savedToken}`
                    }
                })
                .then(res => {
                    // Redux store 업데이트
                    dispatch(updateUserInfo({
                        Name: res.data.uName,
                        Email: res.data.uEmail,
                        Role: res.data.uRole,
                        deletedAt: res.data.deletedAt
                    }));
                })
                .catch(error => {
                    console.error('사용자 정보 조회 실패:', error);
                });
            }
        }
    }, [dispatch]);

    return (
        <div>
            <ScrollTop />
            {!hideLayout && <Header />}
            {hideLayout ? (
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/restore-account" element={<RestoreAccount />} />
                </Routes>
            ) : (
                <div className="wrap">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/mypage" element={<MyPage />} />
                        <Route path="/board" element={<BoardPage />} />
                        <Route path="/posts/:postId" element={<PostDetail />} />
                        <Route path="/posts/create" element={<PostCreate />} />
                        <Route path="/post/edit/:postId" element={<PostEdit />} />
                        <Route path="/boards/manage" element={<BoardManagement />} />
                        <Route path="/schedule" element={<SchedulePage />} />
                        <Route path="/email-verification" element={<EmailVerification />} />
                        <Route path="/change-password" element={<ChangePassword />} />
                        <Route path="/mypage/edit" element={<EditProfile />} />
                        <Route path="/openai-test" element={<OpenAIPage />} />
                        <Route path="/study/search" element={<StudySearch />} />
                        <Route path="/study/create" element={<StudyCreate />} />
                        <Route path="/study/:id" element={<StudyDetail />} />
                    </Routes>
                </div>
            )}
            {!hideLayout && <Footer />}
        </div>
    )
}

export default App
