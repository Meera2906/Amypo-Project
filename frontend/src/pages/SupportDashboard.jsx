import { useState } from 'react'

const initialTickets = [
  { id: 1, title: 'Password reset', status: 'Open', owner: 'Support team' },
  { id: 2, title: 'Enrollment issue', status: 'In progress', owner: 'Academic admin' },
  { id: 3, title: 'Mentor profile update', status: 'Resolved', owner: 'Operations' },
]

function SupportDashboard() {
  const [tickets, setTickets] = useState(initialTickets)
  const [form, setForm] = useState({ title: '', status: 'Open' })

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.title.trim()) return

    setTickets((current) => [
      { id: Date.now(), title: form.title, status: form.status, owner: 'Support agent' },
      ...current,
    ])
    setForm({ title: '', status: 'Open' })
  }

  return (
    <div className="page container">
      <div className="page-header">
        <h2>Support Dashboard</h2>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <h3>Log a case</h3>
        <div className="field">
          <label htmlFor="ticket-title">Issue</label>
          <input id="ticket-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="ticket-status">Status</label>
          <select id="ticket-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Open</option>
            <option>In progress</option>
            <option>Resolved</option>
          </select>
        </div>
        <button type="submit" className="primary-btn">Submit ticket</button>
      </form>

      <div className="card">
        <table className="list-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Status</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>
                  <span className={`badge ${ticket.status === 'Resolved' ? 'badge-approved' : ticket.status === 'In progress' ? 'badge-active' : 'badge-pending'}`}>
                    {ticket.status}
                  </span>
                </td>
                <td>{ticket.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SupportDashboard
