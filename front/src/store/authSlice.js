import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// localStorage에서 초기 상태를 가져오는 함수
const loadState = () => {
    try {
        const serializedState = localStorage.getItem('userState');
        if (serializedState === null) {
            return {
                user: null,
                isLoggedIn: false,
                loading: false,
                error: null
            };
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return {
            user: null,
            isLoggedIn: false,
            loading: false,
            error: null
        };
    }
};

const initialState = loadState();

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.isLoggedIn = true;
            state.user = {
                name: action.payload.uName,
                email: action.payload.uEmail,
                role: action.payload.uRole,
                deletedAt: action.payload.deletedAt
            };
            state.error = null;
            
            // localStorage에 상태 저장
            const currentState = {
                ...state,
                user: {
                    name: action.payload.uName,
                    email: action.payload.uEmail,
                    role: action.payload.uRole,
                    deletedAt: action.payload.deletedAt
                },
                isLoggedIn: true,
                loading: false,
                error: null 
            };
            localStorage.setItem('userState', JSON.stringify(currentState));
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.isLoggedIn = false;
            state.user = null;
            localStorage.removeItem('userState');
            localStorage.removeItem('accessToken');
        },
        logout: (state) => {
            state.user = null;
            state.isLoggedIn = false;
            state.loading = false;
            state.error = null;
            localStorage.removeItem('userState');
            localStorage.removeItem('accessToken');
            delete axios.defaults.headers.common['Authorization'];
        },
        updateUserInfo: (state, action) => {
            state.user = {
                ...state.user,
                name: action.payload.Name,
                email: action.payload.Email,
                role: action.payload.Role,
                deletedAt: action.payload.deletedAt
            };
            
            // localStorage 업데이트
            const currentState = {
                ...state,
                user: {
                    ...state.user,
                    name: action.payload.Name,
                    email: action.payload.Email,
                    role: action.payload.Role,
                    deletedAt: action.payload.deletedAt
                },
                isLoggedIn: true,
                loading: false,
                error: null
            };
            localStorage.setItem('userState', JSON.stringify(currentState));
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        // 비밀번호 변경 성공 시 처리
        passwordChangeSuccess: (state) => {
            state.error = null;
            state.loading = false;
        },
        // 비밀번호 변경 실패 시 처리
        passwordChangeFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        }
    }
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUserInfo, setLoading, passwordChangeSuccess, passwordChangeFailure } = authSlice.actions;
export default authSlice.reducer;