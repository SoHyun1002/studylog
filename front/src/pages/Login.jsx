import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "../style/Login.css";

function Login() {
    const navigate = useNavigate();
    const [uEmail, setUEmail] = useState("");
    const [uPassword, setUPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:8921/api/users/login", {
                uEmail,
                uPassword,
            });
            const user = res.data;

            alert("로그인 성공!");
            localStorage.setItem("user", JSON.stringify(user));
            navigate("/");

        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
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
                    <p onClick={() => navigate("/")}>비밀번호 찾기</p>
                </div>
            </form>
            <p onClick={() => navigate("/register")} className="signup-link">
                계정이 없으신가요? <span>회원가입</span>
            </p>
        </div>
    );
}

export default Login;