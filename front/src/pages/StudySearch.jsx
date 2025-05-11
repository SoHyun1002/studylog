import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/StudySearch.css'

function StudySearch() {
    const navigate = useNavigate();
    const [studies, setStudies] = useState([]);
    const [filteredStudies, setFilteredStudies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('all');
    const [location, setLocation] = useState('all');
    const [sortBy, setSortBy] = useState('latest'); // latest, members, startDate
    const [isLoading, setIsLoading] = useState(true);

    const categories = [
        { id: 'all', name: '전체' },
        { id: 'programming', name: '프로그래밍' },
        { id: 'language', name: '어학' },
        { id: 'certificate', name: '자격증' },
        { id: 'exam', name: '시험' }
    ];

    const locations = [
        { id: 'all', name: '전체' },
        { id: 'online', name: '온라인' },
        { id: 'seoul', name: '서울' },
        { id: 'gyeonggi', name: '경기' },
        { id: 'incheon', name: '인천' }
    ];

    // 임시 데이터 생성 함수
    const generateMockData = () => {
        const mockStudies = [
            {
                id: 1,
                title: 'React 스터디',
                category: 'programming',
                location: 'online',
                members: 5,
                maxMembers: 8,
                startDate: '2024-04-01',
                description: 'React와 관련 라이브러리를 함께 공부하는 스터디입니다.',
                leader: '김개발',
                meetingType: 'online',
                meetingDay: ['월', '수', '금'],
                meetingTime: '19:00'
            },
            {
                id: 2,
                title: 'TOEIC 스터디',
                category: 'language',
                location: 'seoul',
                members: 3,
                maxMembers: 6,
                startDate: '2024-04-15',
                description: 'TOEIC 900점 목표 스터디입니다.',
                leader: '이영어',
                meetingType: 'offline',
                meetingDay: ['화', '목'],
                meetingTime: '18:30'
            },
            {
                id: 3,
                title: '정보처리기사 스터디',
                category: 'certificate',
                location: 'online',
                members: 4,
                maxMembers: 5,
                startDate: '2024-04-10',
                description: '정보처리기사 실기 준비 스터디입니다.',
                leader: '박자격',
                meetingType: 'online',
                meetingDay: ['월', '수'],
                meetingTime: '20:00'
            }
        ];
        return mockStudies;
    };

    useEffect(() => {
        // TODO: API 연동
        const fetchStudies = async () => {
            setIsLoading(true);
            try {
                // 임시 데이터 사용
                const data = generateMockData();
                setStudies(data);
                setFilteredStudies(data);
            } catch (error) {
                console.error('스터디 데이터 로딩 실패:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudies();
    }, []);

    useEffect(() => {
        // 검색어, 카테고리, 지역에 따른 필터링
        let filtered = studies;

        if (searchTerm) {
            filtered = filtered.filter(study =>
                study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                study.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (category !== 'all') {
            filtered = filtered.filter(study => study.category === category);
        }

        if (location !== 'all') {
            filtered = filtered.filter(study => study.location === location);
        }

        // 정렬 적용
        switch (sortBy) {
            case 'members':
                filtered.sort((a, b) => b.members - a.members);
                break;
            case 'startDate':
                filtered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
                break;
            default: // latest
                filtered.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        }

        setFilteredStudies(filtered);
    }, [searchTerm, category, location, sortBy, studies]);

    const handleStudyClick = (studyId) => {
        navigate(`/study/${studyId}`);
    };

    if (isLoading) {
        return <div className="loading">로딩 중...</div>;
    }

    return (
        <div className="study-search">
            <div className="search-filters">
                <input
                    type="text"
                    placeholder="스터디 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <select value={location} onChange={(e) => setLocation(e.target.value)}>
                    {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="latest">최신순</option>
                    <option value="members">인원순</option>
                    <option value="startDate">시작일순</option>
                </select>
            </div>

            <div className="study-list">
                {filteredStudies.length === 0 ? (
                    <div className="no-results">검색 결과가 없습니다.</div>
                ) : (
                    filteredStudies.map(study => (
                        <div 
                            key={study.id} 
                            className="study-card"
                            onClick={() => handleStudyClick(study.id)}
                        >
                            <div className="study-card-header">
                                <h3>{study.title}</h3>
                                <span className="study-leader">스터디장: {study.leader}</span>
                            </div>
                            <div className="study-info">
                                <span>카테고리: {categories.find(c => c.id === study.category)?.name}</span>
                                <span>지역: {locations.find(l => l.id === study.location)?.name}</span>
                                <span>인원: {study.members}/{study.maxMembers}</span>
                                <span>시작일: {study.startDate}</span>
                                <span>모임: {study.meetingDay.join(', ')} {study.meetingTime}</span>
                            </div>
                            <p className="study-description">{study.description}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default StudySearch; 