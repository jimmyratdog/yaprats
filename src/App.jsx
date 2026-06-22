import { useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import './App.css'

function App() {
  const [showLogin, setShowLogin] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)

  const [signupUsername, setSignupUsername] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isOver18, setIsOver18] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  const [darkMode, setDarkMode] = useState(
  localStorage.getItem('darkMode') === 'true'
)
  const [onlineCount, setOnlineCount] = useState(1)

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [message, setMessage] = useState('')
  const commentsEndRef = useRef(null)

  const MAX_CHARS = 300

  const [yaps, setYaps] = useState([])
  const [newYap, setNewYap] = useState('')


useEffect(() => {
  localStorage.setItem('darkMode', darkMode)
}, [darkMode])

  useEffect(() => {
    checkUser()
    loadYaps()
  }, [])

  useEffect(() => {
  commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}, [yaps])

useEffect(() => {
  const channel = supabase.channel('online-rats', {
    config: {
      presence: {
        key: crypto.randomUUID(),
      },
    },
  })

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const count = Object.keys(state).length
      setOnlineCount(count)
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          online_at: new Date().toISOString(),
        })
      }
    })

  return () => {
    supabase.removeChannel(channel)
  }
}, [])


  async function checkUser() {
    const { data } = await supabase.auth.getUser()

    if (data.user) {
      setUser(data.user)
      loadProfile(data.user.id)
    }
  }

  async function loadProfile(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  setProfile(data)
}

  async function loadYaps() {
    const { data, error } = await supabase
      .from('yaps')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      setMessage(error.message)
      return
    }

    setYaps(data)
  }

  async function createAccount() {

if (!acceptedTerms || !isOver18) {
  setMessage('You must accept the terms and confirm you are over 18.')
  return
}

    const fakeEmail = `${signupUsername}@yaprats.com`

    const { data, error } = await supabase.auth.signUp({
      email: fakeEmail,
      password: signupPassword,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    await supabase.from('profiles').insert({
      id: data.user.id,
      username: signupUsername,
      role: 'user',
    })

    setMessage('Account created!')
    setUser(data.user)
    loadProfile(data.user.id)
  }

  async function login() {
    const fakeEmail = `${loginUsername}@yaproom.com`

    const { data, error } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password: loginPassword,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setUser(data.user)
    loadProfile(data.user.id)
    setMessage('Logged in!')
  }

  async function logout() {
  await supabase.auth.signOut()

  setUser(null)
  setProfile(null)
}

  async function sendYap() {

let content = newYap

content = content.replaceAll(':)', '😊')
content = content.replaceAll(':(', '☹️')
content = content.replaceAll(':D', '😃')
content = content.replaceAll('XD', '😂')
content = content.replaceAll('<3', '❤️')
content = content.replaceAll(':P', '😛')
content = content.replaceAll(':O', '😲')
content = content.replaceAll(':|', '😐')
content = content.replaceAll('rat', '🐀')
content = content.replaceAll('cheese', '🧀')

  if (!newYap.trim()) {
    return
  }

  if (newYap.length > MAX_CHARS) {
    setMessage(`Maximum ${MAX_CHARS} characters`)
    return
  }

  console.log('USER:', user)

  const { data, error } = await supabase
    .from('yaps')
    .insert({
      content: content,
      username: profile?.username || user.email.split('@')[0],
      user_id: user.id,
    })
    .select()

  console.log('DATA:', data)
  console.log('ERROR:', error)

  if (error) {
    setMessage(error.message)
    return
  }

  setNewYap('')
  loadYaps()
}


  return (
    <div className={darkMode ? 'page dark' : 'page light'}>
      <header className="topBar">
  <div className="themeToggle">
    <button onClick={() => setDarkMode(false)}>Light</button>
    <button onClick={() => setDarkMode(true)}>Dark</button>
  </div>

        <h1 className="logo">
  <span>Yap</span>Rats
</h1>

        <div className="authButtons">
          {!user && (
            <>
              <div className="loginArea">
                <button
                  className="loginButton"
                  onClick={() => {
                    setShowLogin(!showLogin)
                    setShowSignUp(false)
                  }}
                >
                  Login
                </button>

                {showLogin && (
                  <div className="loginDropdown">
                    <input
                      placeholder="Username"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                    />

                    <input
                      placeholder="Password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />

                    <button onClick={login}>Login</button>
                  </div>
                )}
              </div>

              <div className="signUpArea">
                <button
                  className="signUpButton"
                  onClick={() => {
                    setShowSignUp(!showSignUp)
                    setShowLogin(false)
                  }}
                >
                  Sign Up
                </button>

                {showSignUp && (
                  <div className="signUpDropdown">
                    <input
                      placeholder="Username"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                    />

                    <input
                      placeholder="Password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                    />

                    <label className="signupCheck">
  <input
    type="checkbox"
    checked={acceptedTerms}
    onChange={(e) => setAcceptedTerms(e.target.checked)}
  />
  <span>
  I accept the <a href="/terms">Terms and Conditions</a>
</span>
</label>

<label className="signupCheck">
  <input
    type="checkbox"
    checked={isOver18}
    onChange={(e) => setIsOver18(e.target.checked)}
  />
  <span>I confirm I am over 18</span>
</label>

                    <button onClick={createAccount}>Create Account</button>
                  </div>
                )}
              </div>
            </>
          )}

          {user && (
  <div className="userInfo">
    <button onClick={logout}>
      Logout
    </button>

    <p>Logged in as {profile?.username}</p>
  </div>
)}
        </div>
      </header>

      <div className="topicSection">
        <p className="topicLabel"></p>
        <h2 className="topicTitle">Welcome to the Dry Wall</h2>
      </div>

      <div className="commentsSection">

  <p className="onlineCount">
    🐀 {onlineCount} {onlineCount === 1 ? 'Rat' : 'Rats'} in the Dry Wall
  </p>

  <div className="commentsBox">

          {yaps.map((yap) => (
  <div
  key={yap.id}
  className={`yap ${
    user && yap.user_id === user.id
      ? 'myYap'
      : 'otherYap'
  }`}
>
    <strong>{yap.username}</strong>

    <p>{yap.content}</p>



    <div className="yapFooter">

  <small className="yapTime">
    {new Date(yap.created_at).toLocaleString('en-AU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })}
  </small>


</div>

  </div>
))}

<div ref={commentsEndRef}></div>
        </div>



        <div className="messageInput">

          <input
  placeholder={user ? 'Type a message...' : 'Login to yap'}
  value={newYap}
  onChange={(e) => {
  let text = e.target.value

  text = text.replaceAll(':)', '😊')
  text = text.replaceAll(':(', '☹️')
  text = text.replaceAll(':D', '😃')
  text = text.replaceAll('XD', '😂')
  text = text.replaceAll('<3', '❤️')
  text = text.replaceAll(':P', '😛')
  text = text.replaceAll(':O', '😲')
  text = text.replaceAll(':|', '😐')

  text = text.replaceAll('rat', '🐀')
  text = text.replaceAll('cheese', '🧀')

  setNewYap(text.slice(0, MAX_CHARS))
}}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      sendYap()
    }
  }}
  disabled={!user}
/>

          <p className="charCount">
  {newYap.length}/{MAX_CHARS}
</p>

          <button onClick={sendYap} disabled={!user}>
            Send
          </button>
        </div>

        {message.includes('error') && <p>{message}</p>}
      </div>
    </div>
  )
}

export default App