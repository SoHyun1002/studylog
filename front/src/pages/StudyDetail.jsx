import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import '../style/StudyDetail.css'

function StudyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [study, setStudy] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoined, setIsJoined] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinMessage, setJoinMessage] = useState('');

    // 임시 데이터 생성 함수
    const generateMockData = (studyId) => {
        const mockStudies = {
            1: {
                id: 1,
                title: 'React 스터디',
                category: 'programming',
                location: 'online',
                members: 5,
                maxMembers: 8,
                startDate: '2024-04-01',
                endDate: '2024-06-30',
                description: 'React와 관련 라이브러리를 함께 공부하는 스터디입니다. 주 3회 온라인으로 진행되며, 실무에서 자주 사용되는 기술들을 중심으로 학습합니다. 각 주차별로 실습 과제가 있으며, 마지막 주차에는 팀 프로젝트를 진행합니다.',
                leader: {
                    id: 1,
                    name: '김개발',
                    profile: 'https://placehold.co/50',
                    introduction: '3년차 프론트엔드 개발자입니다. React와 TypeScript를 주로 사용하며, 현재 스타트업에서 웹 서비스를 개발하고 있습니다.'
                },
                meetingType: 'online',
                meetingDay: ['월', '수', '금'],
                meetingTime: '19:00',
                currentMembers: [
                    { id: 1, name: '김개발', role: 'leader', profile: 'https://placehold.co/50' },
                    { id: 2, name: '이리액트', role: 'member', profile: 'https://placehold.co/50' },
                    { id: 3, name: '박자바', role: 'member', profile: 'https://placehold.co/50' },
                    { id: 4, name: '최스크립트', role: 'member', profile: 'https://placehold.co/50' },
                    { id: 5, name: '정타입', role: 'member', profile: 'https://placehold.co/50' }
                ],
                requirements: [
                    'React 기본 개념 이해',
                    'JavaScript ES6+ 문법 숙지',
                    'Git 기본 사용법 숙지',
                    '주 3회 온라인 미팅 참여 가능',
                    '주간 과제 수행 가능'
                ],
                curriculum: [
                    {
                        week: 1,
                        title: 'React 기초',
                        topics: ['컴포넌트', 'Props', 'State', '이벤트 핸들링']
                    },
                    {
                        week: 2,
                        title: 'React Hooks',
                        topics: ['useState', 'useEffect', 'useContext', 'Custom Hooks']
                    },
                    {
                        week: 3,
                        title: '상태관리',
                        topics: ['Redux', 'Recoil', 'Context API']
                    },
                    {
                        week: 4,
                        title: '성능 최적화',
                        topics: ['메모이제이션', '코드 스플리팅', '렌더링 최적화']
                    },
                    {
                        week: 5,
                        title: '테스트',
                        topics: ['Jest', 'React Testing Library', 'E2E 테스트']
                    },
                    {
                        week: 6,
                        title: '프로젝트',
                        topics: ['팀 프로젝트 기획', '개발', '배포']
                    }
                ],
                tools: ['VS Code', 'Git', 'Slack', 'Notion'],
                benefits: [
                    '실무에서 바로 적용 가능한 실습 중심 학습',
                    '다양한 프로젝트 경험',
                    '스터디원들과의 네트워킹',
                    '포트폴리오 제작 지원'
                ]
            },
            2: {
                id: 2,
                title: 'TOEIC 스터디',
                category: 'language',
                location: 'seoul',
                members: 3,
                maxMembers: 6,
                startDate: '2024-04-15',
                endDate: '2024-07-15',
                description: 'TOEIC 900점 목표 스터디입니다. 주 2회 오프라인으로 진행되며, 체계적인 학습 계획과 함께 목표 점수 달성을 도와드립니다. 각 파트별 전문 강사님의 지도가 있으며, 정기적인 모의고사로 실력을 점검합니다.',
                leader: {
                    id: 2,
                    name: '이영어',
                    profile: 'https://placehold.co/50',
                    introduction: 'TOEIC 990점 보유, 5년간 영어 강의 경력이 있습니다.'
                },
                meetingType: 'offline',
                meetingDay: ['화', '목'],
                meetingTime: '18:30',
                currentMembers: [
                    { id: 2, name: '이영어', role: 'leader', profile: 'https://placehold.co/50' },
                    { id: 6, name: '김영어', role: 'member', profile: 'https://placehold.co/50' },
                    { id: 7, name: '박토익', role: 'member', profile: 'https://placehold.co/50' }
                ],
                requirements: [
                    '현재 TOEIC 700점 이상',
                    '주 2회 오프라인 미팅 참여 가능',
                    '일일 학습 시간 2시간 이상 확보',
                    '정기적인 모의고사 참여'
                ],
                curriculum: [
                    {
                        week: 1,
                        title: 'LC Part 1,2',
                        topics: ['사진 묘사', '질문 응답']
                    },
                    {
                        week: 2,
                        title: 'LC Part 3,4',
                        topics: ['대화문', '설명문']
                    },
                    {
                        week: 3,
                        title: 'RC Part 5,6',
                        topics: ['문법', '어휘']
                    },
                    {
                        week: 4,
                        title: 'RC Part 7',
                        topics: ['독해', '속독']
                    }
                ],
                tools: ['TOEIC 교재', '온라인 학습 플랫폼', '카카오톡'],
                benefits: [
                    '전문 강사님의 1:1 피드백',
                    '체계적인 학습 자료 제공',
                    '정기적인 모의고사',
                    '학습 진도 관리'
                ]
            },
            3: {
                id: 3,
                title: '정보처리기사 스터디',
                category: 'certificate',
                location: 'online',
                members: 4,
                maxMembers: 5,
                startDate: '2024-04-10',
                endDate: '2024-07-10',
                description: '정보처리기사 실기 준비 스터디입니다. 주 2회 온라인으로 진행되며, 실기 시험에 필요한 실습과 이론을 함께 학습합니다. 각 주차별로 실습 과제가 있으며, 정기적인 모의고사로 실력을 점검합니다. 합격률 90% 이상의 전문 강사님의 지도가 있습니다.',
                leader: {
                    id: 3,
                    name: '박자격',
                    profile: 'https://placehold.co/50',
                    introduction: '정보처리기사 보유, 8년차 개발자입니다. 현재 IT 교육기관에서 정보처리기사 강의를 진행하고 있으며, 다수의 합격생을 배출했습니다.'
                },
                meetingType: 'online',
                meetingDay: ['월', '수'],
                meetingTime: '20:00',
                currentMembers: [
                    { id: 3, name: '박자격', role: 'leader', profile: 'https://placehold.co/50' },
                    { id: 8, name: '김정보', role: 'member', profile: 'https://placehold.co/50' },
                    { id: 9, name: '이처리', role: 'member', profile: 'https://placehold.co/50' },
                    { id: 10, name: '최기사', role: 'member', profile: 'https://placehold.co/50' }
                ],
                requirements: [
                    '정보처리기사 필기 합격자',
                    '주 2회 온라인 미팅 참여 가능',
                    '일일 학습 시간 3시간 이상 확보',
                    '정기적인 실습 과제 수행',
                    '모의고사 참여 필수'
                ],
                curriculum: [
                    {
                        week: 1,
                        title: '데이터베이스 기초',
                        topics: ['ERD 설계', '정규화', 'SQL 기초']
                    },
                    {
                        week: 2,
                        title: '데이터베이스 심화',
                        topics: ['트랜잭션', '인덱스', '뷰', '프로시저']
                    },
                    {
                        week: 3,
                        title: '알고리즘 기초',
                        topics: ['정렬 알고리즘', '검색 알고리즘', '자료구조']
                    },
                    {
                        week: 4,
                        title: '알고리즘 심화',
                        topics: ['그래프', '동적 프로그래밍', '그리디 알고리즘']
                    },
                    {
                        week: 5,
                        title: 'UML',
                        topics: ['클래스 다이어그램', '시퀀스 다이어그램', '유스케이스 다이어그램']
                    },
                    {
                        week: 6,
                        title: '실습 및 모의고사',
                        topics: ['실기 문제 풀이', '모의고사 1회차', '피드백']
                    },
                    {
                        week: 7,
                        title: '최종 점검',
                        topics: ['모의고사 2회차', '실전 문제 풀이', '합격 전략']
                    }
                ],
                tools: [
                    'MySQL Workbench',
                    'Visual Studio Code',
                    'Eclipse',
                    'Draw.io (UML)',
                    'Zoom'
                ],
                benefits: [
                    '실기 시험 합격률 90% 이상',
                    '1:1 코드 리뷰',
                    '실습 환경 제공',
                    '합격자 특별 멘토링',
                    '취업 연계 지원'
                ]
            }
        };
        return mockStudies[studyId];
    };

    useEffect(() => {
        const fetchStudyDetail = async () => {
            setIsLoading(true);
            try {
                // TODO: API 연동
                const data = generateMockData(parseInt(id));
                setStudy(data);
            } catch (error) {
                console.error('스터디 상세 정보 로딩 실패:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudyDetail();
    }, [id]);

    const handleJoinClick = () => {
        setShowJoinModal(true);
    };

    const handleJoinSubmit = (e) => {
        e.preventDefault();
        // TODO: API 연동
        setIsJoined(true);
        setShowJoinModal(false);
        alert('스터디 참여 신청이 완료되었습니다.');
    };

    if (isLoading) {
        return <div className="loading">로딩 중...</div>;
    }

    if (!study) {
        return <div className="not-found">스터디를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="study-detail">
            <div className="study-header">
                <h1>{study.title}</h1>
                <div className="study-meta">
                    <span className="category">{study.category}</span>
                    <span className="location">{study.location}</span>
                    <span className="members">{study.members}/{study.maxMembers}명</span>
                </div>
            </div>

            <div className="study-content">
                <div className="study-main">
                    <section className="study-info">
                        <h2>스터디 소개</h2>
                        <p>{study.description}</p>
                    </section>

                    <section className="study-schedule">
                        <h2>모임 일정</h2>
                        <div className="schedule-info">
                            <p>모임 방식: {study.meetingType === 'online' ? '온라인' : '오프라인'}</p>
                            <p>모임 요일: {study.meetingDay.join(', ')}</p>
                            <p>모임 시간: {study.meetingTime}</p>
                            <p>기간: {study.startDate} ~ {study.endDate}</p>
                        </div>
                    </section>

                    <section className="study-curriculum">
                        <h2>커리큘럼</h2>
                        <div className="curriculum-list">
                            {study.curriculum.map((week, index) => (
                                <div key={index} className="curriculum-week">
                                    <h3>{week.week}주차: {week.title}</h3>
                                    <ul>
                                        {week.topics.map((topic, topicIndex) => (
                                            <li key={topicIndex}>{topic}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="study-requirements">
                        <h2>참여 조건</h2>
                        <ul>
                            {study.requirements.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="study-tools">
                        <h2>사용 도구</h2>
                        <ul>
                            {study.tools.map((tool, index) => (
                                <li key={index}>{tool}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="study-benefits">
                        <h2>스터디 혜택</h2>
                        <ul>
                            {study.benefits.map((benefit, index) => (
                                <li key={index}>{benefit}</li>
                            ))}
                        </ul>
                    </section>
                </div>

                <div className="study-sidebar">
                    <div className="leader-info">
                        <h2>스터디장</h2>
                        <div className="leader-profile">
                            <img src={study.leader.profile} alt={study.leader.name} />
                            <div>
                                <h3>{study.leader.name}</h3>
                                <p>{study.leader.introduction}</p>
                            </div>
                        </div>
                    </div>

                    <div className="member-list">
                        <h2>참여 멤버</h2>
                        <ul>
                            {study.currentMembers.map(member => (
                                <li key={member.id}>
                                    <img src={member.profile} alt={member.name} />
                                    <div>
                                        <span className="member-name">{member.name}</span>
                                        {member.role === 'leader' && <span className="member-role">(스터디장)</span>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {!isJoined && study.members < study.maxMembers && (
                        <button 
                            className="join-button"
                            onClick={handleJoinClick}
                        >
                            참여하기
                        </button>
                    )}
                </div>
            </div>

            {showJoinModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>스터디 참여 신청</h2>
                        <form onSubmit={handleJoinSubmit}>
                            <div className="form-group">
                                <label>자기소개</label>
                                <textarea
                                    value={joinMessage}
                                    onChange={(e) => setJoinMessage(e.target.value)}
                                    placeholder="스터디 참여 동기와 자기소개를 작성해주세요."
                                    required
                                />
                            </div>
                            <div className="modal-buttons">
                                <button type="button" onClick={() => setShowJoinModal(false)}>
                                    취소
                                </button>
                                <button type="submit">신청하기</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudyDetail; 