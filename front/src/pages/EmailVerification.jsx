import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "../style/Register.css";

function EmailVerification() {
    const navigate = useNavigate();
    const [verificationCode, setVerificationCode] = useState("");
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        // 로컬 스토리지에서 임시 저장된 데이터 확인
        const tempData = localStorage.getItem('tempRegisterData');
        if (!tempData) {
            navigate('/register');
            return;
        }
        const { uEmail } = JSON.parse(tempData);
        setEmail(uEmail);
    }, [navigate]);

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8921/api/users/verify-code", {
                email: email,
                code: verificationCode
            });
            setIsVerified(true);
            setError("");
        } catch (error) {
            if (error.response && error.response.data) {
                setError(error.response.data.message || "인증 코드 확인 실패");
            } else {
                setError("인증 코드 확인 중 오류가 발생했습니다.");
            }
        }
    };

    const handleResendCode = async () => {
        try {
            await axios.post("http://localhost:8921/api/users/send-verification", {
                email: email
            });
            setError("");
            alert("인증 코드가 재전송되었습니다.");
        } catch (error) {
            if (error.response && error.response.data) {
                setError(error.response.data.message || "이메일 전송 실패");
            } else {
                setError("이메일 전송 중 오류가 발생했습니다.");
            }
        }
    };

    const handleCompleteRegistration = async () => {
        try {
            const tempData = JSON.parse(localStorage.getItem('tempRegisterData'));
            const { confirmPassword, ...userData } = tempData;
            
            await axios.post("http://localhost:8921/api/users/register", userData);
            localStorage.removeItem('tempRegisterData');
            alert("회원가입 성공!");
            navigate("/login");
        } catch (error) {
            if (error.response && error.response.data) {
                setError(error.response.data.message || "회원가입 실패");
            } else {
                setError("회원가입 중 오류가 발생했습니다.");
            }
        }
    };

    return (
        <div className="register-page">
            <h2 className="logo" onClick={() => navigate("/")}>STUDYLOG</h2>
            <form onSubmit={handleVerifyCode} className="register-form">
                <h3>이메일 인증</h3>
                <p className="email-info">{email}로 전송된 인증 코드를 입력해주세요.</p>
                
                <label htmlFor="verificationCode">인증 코드</label>
                <input
                    type="text"
                    id="verificationCode"
                    name="verificationCode"
                    placeholder="인증 코드 입력"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                />

                {error && <p className="error-message">{error}</p>}
                
                {!isVerified ? (
                    <>
                        <button type="submit">인증 코드 확인</button>
                        <button type="button" onClick={handleResendCode} className="resend-button">
                            인증 코드 재전송
                        </button>
                    </>
                ) : (
                    <button type="button" onClick={handleCompleteRegistration} className="complete-button">
                        회원가입 완료
                    </button>
                )}
                
                <p onClick={() => navigate("/register")} className="back-link">
                    회원가입으로 돌아가기
                </p>
            </form>
        </div>
    );
}

export default EmailVerification; 