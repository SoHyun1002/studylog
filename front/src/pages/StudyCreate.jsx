import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/StudyCreate.css'

function StudyCreate() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        category: 'programming',
        location: 'online',
        maxMembers: 5,
        startDate: '',
        endDate: '',
        description: '',
        meetingType: 'online',
        meetingDay: [],
        meetingTime: '',
        requirements: [''],
        curriculum: [{ week: 1, title: '', topics: [''] }],
        tools: [''],
        benefits: [''],
        tags: []
    });

    const categories = [
        { id: 'programming', name: '프로그래밍' },
        { id: 'language', name: '어학' },
        { id: 'certificate', name: '자격증' },
        { id: 'exam', name: '시험' }
    ];

    const locations = [
        { id: 'online', name: '온라인' },
        { id: 'seoul', name: '서울' },
        { id: 'gyeonggi', name: '경기' },
        { id: 'incheon', name: '인천' }
    ];

    const days = ['월', '화', '수', '목', '금', '토', '일'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMeetingDayChange = (day) => {
        setFormData(prev => {
            const meetingDay = prev.meetingDay.includes(day)
                ? prev.meetingDay.filter(d => d !== day)
                : [...prev.meetingDay, day];
            return { ...prev, meetingDay };
        });
    };

    const handleArrayInputChange = (index, value, field) => {
        setFormData(prev => {
            const newArray = [...prev[field]];
            newArray[index] = value;
            return { ...prev, [field]: newArray };
        });
    };

    const handleAddArrayItem = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const handleRemoveArrayItem = (index, field) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleCurriculumChange = (index, field, value) => {
        setFormData(prev => {
            const newCurriculum = [...prev.curriculum];
            if (field === 'topics') {
                newCurriculum[index] = {
                    ...newCurriculum[index],
                    topics: value.split(',').map(topic => topic.trim())
                };
            } else {
                newCurriculum[index] = {
                    ...newCurriculum[index],
                    [field]: value
                };
            }
            return { ...prev, curriculum: newCurriculum };
        });
    };

    const handleAddCurriculumWeek = () => {
        setFormData(prev => ({
            ...prev,
            curriculum: [...prev.curriculum, {
                week: prev.curriculum.length + 1,
                title: '',
                topics: ['']
            }]
        }));
    };

    const handleRemoveCurriculumWeek = (index) => {
        setFormData(prev => ({
            ...prev,
            curriculum: prev.curriculum.filter((_, i) => i !== index)
        }));
    };

    const handleTagInput = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            e.preventDefault();
            const newTag = e.target.value.trim();
            if (!formData.tags.includes(newTag)) {
                setFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, newTag]
                }));
            }
            e.target.value = '';
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // TODO: API 연동
            console.log('스터디 생성 데이터:', formData);
            alert('스터디가 생성되었습니다.');
            navigate('/study/search');
        } catch (error) {
            console.error('스터디 생성 실패:', error);
            alert('스터디 생성에 실패했습니다.');
        }
    };

    return (
        <div className="study-create">
            <h1>스터디 만들기</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-section">
                    <h2>기본 정보</h2>
                    <div className="form-group">
                        <label>스터디 제목</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>태그</label>
                        <div className="tag-input-container">
                            <input
                                type="text"
                                placeholder="태그를 입력하고 Enter를 누르세요"
                                onKeyPress={handleTagInput}
                            />
                            <div className="tags-container">
                                {formData.tags.map((tag, index) => (
                                    <span key={index} className="tag">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="tag-remove"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>카테고리</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>지역</label>
                        <select
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            required
                        >
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>최대 인원</label>
                        <input
                            type="number"
                            name="maxMembers"
                            value={formData.maxMembers}
                            onChange={handleInputChange}
                            min="2"
                            max="20"
                            required
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h2>스터디 소개</h2>
                    <div className="form-group">
                        <label>스터디 설명</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h2>모임 정보</h2>
                    <div className="form-group">
                        <label>모임 방식</label>
                        <select
                            name="meetingType"
                            value={formData.meetingType}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="online">온라인</option>
                            <option value="offline">오프라인</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>모임 요일</label>
                        <div className="day-selector">
                            {days.map(day => (
                                <button
                                    key={day}
                                    type="button"
                                    className={`day-button ${formData.meetingDay.includes(day) ? 'selected' : ''}`}
                                    onClick={() => handleMeetingDayChange(day)}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>모임 시간</label>
                        <input
                            type="time"
                            name="meetingTime"
                            value={formData.meetingTime}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>시작일</label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>종료일</label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h2>참여 조건</h2>
                    {formData.requirements.map((req, index) => (
                        <div key={index} className="form-group array-input">
                            <input
                                type="text"
                                value={req}
                                onChange={(e) => handleArrayInputChange(index, e.target.value, 'requirements')}
                                placeholder="참여 조건을 입력하세요"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveArrayItem(index, 'requirements')}
                                className="remove-button"
                            >
                                삭제
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => handleAddArrayItem('requirements')}
                        className="add-button"
                    >
                        참여 조건 추가
                    </button>
                </div>

                <div className="form-section">
                    <h2>커리큘럼</h2>
                    {formData.curriculum.map((week, index) => (
                        <div key={index} className="curriculum-week">
                            <div className="form-group">
                                <label>{week.week}주차 제목</label>
                                <input
                                    type="text"
                                    value={week.title}
                                    onChange={(e) => handleCurriculumChange(index, 'title', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>주제 (쉼표로 구분)</label>
                                <input
                                    type="text"
                                    value={week.topics.join(', ')}
                                    onChange={(e) => handleCurriculumChange(index, 'topics', e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveCurriculumWeek(index)}
                                className="remove-button"
                            >
                                주차 삭제
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={handleAddCurriculumWeek}
                        className="add-button"
                    >
                        주차 추가
                    </button>
                </div>

                <div className="form-section">
                    <h2>사용 도구</h2>
                    {formData.tools.map((tool, index) => (
                        <div key={index} className="form-group array-input">
                            <input
                                type="text"
                                value={tool}
                                onChange={(e) => handleArrayInputChange(index, e.target.value, 'tools')}
                                placeholder="사용할 도구를 입력하세요"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveArrayItem(index, 'tools')}
                                className="remove-button"
                            >
                                삭제
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => handleAddArrayItem('tools')}
                        className="add-button"
                    >
                        도구 추가
                    </button>
                </div>

                <div className="form-section">
                    <h2>스터디 혜택</h2>
                    {formData.benefits.map((benefit, index) => (
                        <div key={index} className="form-group array-input">
                            <input
                                type="text"
                                value={benefit}
                                onChange={(e) => handleArrayInputChange(index, e.target.value, 'benefits')}
                                placeholder="스터디 혜택을 입력하세요"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveArrayItem(index, 'benefits')}
                                className="remove-button"
                            >
                                삭제
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => handleAddArrayItem('benefits')}
                        className="add-button"
                    >
                        혜택 추가
                    </button>
                </div>

                <div className="form-buttons">
                    <button type="button" onClick={() => navigate('/study/search')}>
                        취소
                    </button>
                    <button type="submit">스터디 만들기</button>
                </div>
            </form>
        </div>
    );
}

export default StudyCreate; 