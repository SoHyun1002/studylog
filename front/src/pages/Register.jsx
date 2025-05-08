import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "../style/Register.css";

function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        uEmail: "",
        uPassword: "",
        confirmPassword: "",
        uName: "",
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        if (name === "confirmPassword" || name === "uPassword") {
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.uPassword !== form.confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            // 임시로 회원가입 정보를 로컬 스토리지에 저장
            localStorage.setItem('tempRegisterData', JSON.stringify(form));
            
            // 이메일 인증 요청
            await axios.post("http://localhost:8921/api/mail/send-verification", null, {
                params: {
                    email: form.uEmail
                }
            });
            
            // 이메일 인증 페이지로 이동
            navigate("/email-verification");
        } catch (error) {
            if (error.response && error.response.data) {
                setError(error.response.data.message || "이메일 전송 실패");
            } else {
                setError("이메일 전송 중 오류가 발생했습니다.");
            }
        }
    };

    return (
        <div className="register-page">
            <h2 className="logo" onClick={() => navigate("/")}>STUDYLOG</h2>
            <form onSubmit={handleSubmit} className="register-form">
                <label htmlFor="uEmail">이메일</label>
                <input
                    type="text"
                    id="uEmail"
                    name="uEmail"
                    placeholder="이메일 입력"
                    value={form.uEmail}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="uPassword">비밀번호</label>
                <input
                    type="password"
                    id="uPassword"
                    name="uPassword"
                    placeholder="비밀번호 입력"
                    value={form.uPassword}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="confirmPassword">비밀번호 확인</label>
                <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="비밀번호 재입력"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="uName">이름</label>
                <input
                    type="text"
                    id="uName"
                    name="uName"
                    placeholder="이름 입력"
                    value={form.uName}
                    onChange={handleChange}
                    required
                />
                {error && <p className="error-message">{error}</p>}
                <button type="submit">회원가입</button>
                <p onClick={() => navigate("/login")} className="login-link">
                    이미 계정이 있으신가요? <span>로그인</span>
                </p>
            </form>
        </div>
    );
}

export default Register;
