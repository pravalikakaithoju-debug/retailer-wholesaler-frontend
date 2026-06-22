import { useState } from 'react';
import API from '../services/api';
import './LoginPage.css';

function LoginPage({
    onLogin,
    onShowRegister
}) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
const [showForgotPassword,
    setShowForgotPassword] =
    useState(false);

const [email, setEmail] =
    useState('');

const [newPassword,
    setNewPassword] =
    useState('');
    const [
    showForgotUsername,
    setShowForgotUsername
] = useState(false);

const [
    forgotUsernameEmail,
    setForgotUsernameEmail
] = useState('');



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

           sessionStorage.setItem(
    'access',
    response.data.access
);

sessionStorage.setItem(
    'refresh',
    response.data.refresh
);
            sessionStorage.setItem(
    'rememberedUsername',
    username
);

            

            onLogin();

        } catch (error) {

            alert('Invalid credentials');
        }
    };
    const handleForgotPassword =
async () => {

    try {

        const response =
            await API.post(

                'accounts/forgot-password/',

                {
                    email,
                    new_password:
                        newPassword
                }
            );

        alert(
            response.data.message
        );

        setShowForgotPassword(
            false
        );

    } catch (error) {

        console.log(error.response);
alert(
    JSON.stringify(error.response?.data)
);
    }
};
   if (showForgotPassword) {

    return (

        <div
            style={{
                width: '350px',
                margin: '100px auto'
            }}
        >

            <h2>
                Forgot Password
            </h2>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                    setEmail(
                        e.target.value
                    )
                }
            />

            <br /><br />

            <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) =>
                    setNewPassword(
                        e.target.value
                    )
                }
            />

            <br /><br />

            <button
                onClick={
                    handleForgotPassword
                }
            >
                Reset Password
            </button>

            <br /><br />

            <button
                onClick={() =>
                    setShowForgotPassword(
                        false
                    )
                }
            >
                Back To Login
            </button>

        </div>
    );
}
const handleForgotUsername =
async () => {

    try {

        const response =
            await API.post(

                'accounts/forgot-username/',

                {
                    email:
                    forgotUsernameEmail
                }
            );

        alert(

            `Your username is: ${response.data.username}`

        );

    } catch (error) {

    console.log(
        "FULL ERROR:",
        error.response
    );

    console.log(
        "ERROR DATA:",
        error.response?.data
    );

    alert(
        JSON.stringify(
            error.response?.data
        )
    );
}
};
if (showForgotUsername) {

    return (

        <div
            style={{
                width: '350px',
                margin: '100px auto'
            }}
        >

            <h2>
                Forgot Username
            </h2>
            

            <input
                type="email"
                placeholder="Email"
                value={
                    forgotUsernameEmail
                }
                onChange={(e) =>
                    setForgotUsernameEmail(
                        e.target.value
                    )
                }
            />

            <br /><br />

            <button
                onClick={
                    handleForgotUsername
                }
            >
                Get Username
            </button>

            <br /><br />

            <button
                onClick={() =>
                    setShowForgotUsername(
                        false
                    )
                }
            >
                Back To Login
            </button>

        </div>
    );
}
    return (

<div className="login-container">

    <div className="branding">

    <h1>
        TRADE CONNECT
    </h1>

    <p>
        Connecting Retailers & Wholesalers
    </p>

    <h3>
        (Smart Business Procurement Platform)
    </h3>

</div>

    <div className="login-card">

            <h3>Login</h3>

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
            <br/><br/>
          <button
    onClick={() =>
        setShowForgotPassword(
            true
        )
    }
>
    Forgot Password
</button>

<br /><br />

<button
    onClick={() =>
        setShowForgotUsername(
            true
        )
    }
>
    Forgot Username
</button>
<br /><br />

<button
    className="register-btn"
    onClick={onShowRegister}
>
    Create New Account
</button>
          

        </div>

</div>

);
    
}

export default LoginPage;