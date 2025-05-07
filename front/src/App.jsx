import './App.css'
import { Route, Routes, useLocation } from "react-router-dom";
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
import MyPage from './pages/Mypage';
import EmailVerification from "./pages/EmailVerification";
import ChangePassword from './pages/ChangePassword';

function App() {
    const location = useLocation();
    const hideLayoutRoutes = ["/login", "/register"];
    const hideLayout = hideLayoutRoutes.includes(location.pathname);

    return (
        <div>
            <ScrollTop />
            {!hideLayout && <Header />}
            {hideLayout ? (
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
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
                    </Routes>
                </div>
            )}
            {!hideLayout && <Footer />}
        </div>
    )
}

export default App
