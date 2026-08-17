import React, { useState, useEffect } from 'react';
import { fetchTeam } from '../services/api';
import TeamMemberCard from '../components/TeamMemberCard';

export default function Team() {
  const [team, setTeam] = useState([
    {
      id: 1,
      name: 'Yash Prakash',
      rollNo: '1024030281',
      email: 'yprakash_be24@thapar.edu',
      role: 'Frontend Developer'
    },
    {
      id: 2,
      name: 'Pujan Patel',
      rollNo: '1024030278',
      email: 'ppatel_be24@thapar.edu',
      role: 'Backend Developer'
    },
    {
      id: 3,
      name: 'Tanishk Khandelwal',
      rollNo: '1024030274',
      email: 'tkhandelwal_be24@thapar.edu',
      role: 'Frontend Developer'
    },
    {
      id: 4,
      name: 'Rudraksh Yadav',
      rollNo: '1024030272',
      email: 'ryadav3_be24@thapar.edu',
      role: 'AI/ML Developer'
    }
  ]);

  useEffect(() => {
    async function loadTeam() {
      try {
        const res = await fetchTeam();
        if (res.success && res.team && res.team.length > 0) {
          setTeam(res.team);
        }
      } catch (err) {
        console.error('Error fetching team:', err);
      }
    }
    loadTeam();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="course-tag">UCS503 Software Engineering</div>
        <h1 className="page-title">Team Members</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Hover over a member box to view contact and role details.
        </p>
      </div>

      <div className="team-grid-flat">
        {team.map((member) => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}
