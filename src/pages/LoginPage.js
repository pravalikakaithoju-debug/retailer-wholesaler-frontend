import { useState } from 'react';
import API from '../services/api';

function LoginPage({ onLogin }) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        console.log("Login button clicked");

        try {

            const response = await API.post(
                '/token/',
                {
                    username,
                    password
                }
            );

            localStorage.setItem(
                'access',
                response.data.access
            );

            localStorage.setItem(
                'refresh',
                response.data.refresh
            );

            onLogin();

        } catch (error) {

            alert('Invalid credentials');
        }
    };

    return (

        <div
            style={{
                width: '300px',
                margin: '100px auto'
            }}
        >

            <h2>Login</h2>

            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) =>
                    setUsername(e.target.value)
                }
            />

            <br /><br />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                    setPassword(e.target.value)
                }
            />

            <br /><br />

            <button
                onClick={handleLogin}
            >
                Login
            </button>

        </div>
    );
}

export default LoginPage;