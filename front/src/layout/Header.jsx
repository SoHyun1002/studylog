import "./Header.css"
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Header() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false); // 관리자 여부

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setIsLoggedIn(true);
            setIsAdmin(user.role === "admin"); // 관리자 확인
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setIsAdmin(false);
        navigate("/");
    };

    return (
        <div className="header">
            <h1 onClick={() => navigate("/")} className="logo">
                STUDYLOG
            </h1>
            <nav className="nav-menu">
                <span onClick={() => navigate("/board")}>게시판</span>
                <span onClick={() => navigate("/schedule")}>일정</span>
            </nav>
            <div className="header-buttons">
                {isAdmin && (
                    <button onClick={() => navigate("/boards/manage")}>관리자</button>
                )}
                {isLoggedIn ? (
                    <>
                        <button onClick={() => navigate("/mypage")}>마이페이지</button>
                        <button onClick={handleLogout}>로그아웃</button>
                    </>
                ) : (
                    <button onClick={() => navigate("/login")}>로그인</button>
                )}
            </div>
        </div>
    );
}

export default Header;
