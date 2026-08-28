import { useState } from 'react'

function Support() {
  const [email, setEmail] = useState('support@loomlearn.edu')
  const [message, setMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    setMessage('Your support request has been submitted. Our team will contact you shortly.')
  }

  return (
    <div className="page container support-page">
      <div className="page-header">
        <h2>Support Center</h2>
      </div>

      <div className="support-grid">
        <div className="card support-card">
          <h3>Need help?</h3>
          <p>Email: {email}</p>
          <p>Office hours: Mon–Fri, 9:00 AM – 5:00 PM</p>
        </div>

        <form className="card support-form" onSubmit={handleSubmit}>
          <h3>Send a request</h3>
          <div className="field">
            <label htmlFor="support-email">Email</label>
            <input id="support-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="support-message">Message</label>
            <textarea id="support-message" rows="5" value={message ? 'Submitted' : ''} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <button className="primary-btn" type="submit">Submit</button>
          {message && <p className="success-box">{message}</p>}
        </form>
      </div>
    </div>
  )
}

export default Support
