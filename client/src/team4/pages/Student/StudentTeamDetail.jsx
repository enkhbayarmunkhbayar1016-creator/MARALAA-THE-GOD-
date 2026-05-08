import { useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getInitials } from '../../utils/helpers';
import './StudentTeamDetail.css';

export default function StudentTeamDetail() {
  const { teamId } = useParams();
  const { teams, users } = useApp();
  const team = teams.find((item) => item.id === teamId);
  if (!team) return <div className="empty-box">Баг олдсонгүй.</div>;
  const members = users.filter((user) => team.members.includes(user.id));

  return (
    <section className="card">
      <div className="split-header"><div><h2 className="card-title">{team.name} — Гишүүд</h2><div className="team-detail-meta">{team.courseTitle} • {team.members.length} гишүүн</div></div><span className="badge badge-green">Ирц {team.attendance}%</span></div>
      <div className="member-list-grid">
        {members.map((member) => (
          <div className="member-card" key={member.id}>
            <div className="member-avatar">{getInitials(member.name)}</div>
            <div>
              <div className="member-name">{member.name}</div>
              <div className="member-code">{member.studentCode || member.teacherCode || member.email}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
