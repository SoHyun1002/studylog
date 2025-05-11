import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import axios from "axios";

import "../style/Login.css";

// JWT 토큰 디코딩 함수
const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Token decode error:', error);
        return null;
    }
};

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [uEmail, setUEmail] = useState("");
    const [uPassword, setUPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            console.log('로그인 시도:', { uEmail, uPassword });
            const res = await axios.post("http://localhost:8921/api/users/login", {
                uEmail,
                uPassword
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('로그인 응답:', res.data);

            // 소프트 딜리트된 계정 체크
            if (res.data.deletedAt) {
                alert(res.data.message);
                navigate('/restore-account', { state: { email: uEmail } });
                return;
            }

            const { accessToken } = res.data;
            
            // 토큰을 localStorage에 저장
            localStorage.setItem('accessToken', accessToken);
            
            // axios 기본 헤더에 토큰 설정
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            // 사용자 정보 조회
            const userResponse = await axios.get('http://localhost:8921/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            // Redux에는 사용자 정보만 저장
            dispatch(loginSuccess({
                uName: userResponse.data.uName,
                uEmail: userResponse.data.uEmail,
                uRole: userResponse.data.uRole,
                deletedAt: userResponse.data.deletedAt
            }));

            // 로컬 스토리지에 사용자 정보 저장
            localStorage.setItem('userState', JSON.stringify({
                isLoggedIn: true,
                user: {
                    uName: userResponse.data.uName,
                    uEmail: userResponse.data.uEmail,
                    uRole: userResponse.data.uRole,
                    deletedAt: userResponse.data.deletedAt
                }
            }));
            
            alert("로그인 성공!");
            navigate("/");

        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError("로그인 중 오류가 발생했습니다.");
            }
        }
    };

    return (
        <div className="login-page">
            <h2 className="logo" onClick={() => navigate("/")}>STUDYLOG</h2>
            <form onSubmit={handleLogin} className="login-form">
                <div>
                    <label htmlFor="uEmail">이메일</label>
                    <input
                        type="text"
                        id="uEmail"
                        placeholder="이메일"
                        value={uEmail}
                        onChange={(e) => setUEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="uPassword">비밀번호</label>
                    <input
                        type="password"
                        id="uPassword"
                        placeholder="비밀번호"
                        value={uPassword}
                        onChange={(e) => setUPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit">로그인</button>
                <div className="login-links">
                    <p onClick={() => navigate("/")}>아이디(이메일) 찾기</p>
                    <p onClick={() => navigate("/reset-password")}>비밀번호 변경</p>
                </div>
            </form>
            <p onClick={() => navigate("/register")} className="signup-link">
                계정이 없으신가요? <span>회원가입</span>
            </p>
        </div>
    );
}

export default Login;