import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StudyGroupSection = () => {
    const [managedGroups, setManagedGroups] = useState([]);
    const [joinedGroups, setJoinedGroups] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        Promise.all([
            axios.get('http://localhost:8921/api/study-groups/managed', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            axios.get('http://localhost:8921/api/study-groups/joined', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]).then(([managedRes, joinedRes]) => {
            setManagedGroups(managedRes.data);
            setJoinedGroups(joinedRes.data);
        });
    }, []);

    return (
        <div className="study-groups-section">
            <h3>내가 관리하는 스터디 그룹</h3>
            <div className="group-list">
                {managedGroups.map(group => (
                    <div className="group-card" key={group.id}>{group.name}</div>
                ))}
            </div>
            <h3>내가 소속된 스터디 그룹</h3>
            <div className="group-list">
                {joinedGroups.map(group => (
                    <div className="group-card" key={group.id}>{group.name}</div>
                ))}
            </div>
        </div>
    );
};

export default StudyGroupSection; 