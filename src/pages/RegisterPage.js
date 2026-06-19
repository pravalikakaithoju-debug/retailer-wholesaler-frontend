import { useState } from 'react';
import API from '../services/api';

function RegisterPage({ onBackToLogin }) {

    const [username, setUsername] =
        useState('');

    const [password, setPassword] =
        useState('');

    const [role, setRole] =
        useState('retailer');

    const [avatar, setAvatar] =
        useState(null);
    
    const [email, setEmail] =
    useState('');
    

    const handleRegister = async () => {

        const formData =
            new FormData();

        formData.append(
            'username',
            username
        );

        formData.append(
            'password',
            password
        );

        formData.append(
            'role',
            role
        );
        formData.append(
    'email',
    email
);

        if (avatar) {

            formData.append(
                'avatar',
                avatar
            );
        }
        console.log("Username:", username);
console.log("Password:", password);
console.log("Role:", role);
console.log("Avatar:", avatar);

        try {

            await API.post(
                'accounts/register/',
                formData,
                {
                    headers: {
                        'Content-Type':
                            'multipart/form-data'
                    }
                }
            );

            alert(
                'Registration Successful'
            );

            onBackToLogin();

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

    return (

        <div
            style={{
                width: '350px',
                margin: '100px auto'
            }}
        >

            <h2>
                Register
            </h2>
            

            <input
                type="text"
                placeholder="Username"
                onChange={(e)=>
                    setUsername(
                        e.target.value
                    )
                }
            />

            <br /><br />
                    <input
    type="email"
    placeholder="Email"
    value={email}
    onChange={(e) =>
        setEmail(e.target.value)
    }
    
/>
<br/><br/>

            <input
                type="password"
                placeholder="Password"
                onChange={(e)=>
                    setPassword(
                        e.target.value
                    )
                }
            />

            <br /><br />

            <select
                onChange={(e)=>
                    setRole(
                        e.target.value
                    )
                }
            >

                <option value="retailer">
                    Retailer
                </option>

                <option value="wholesaler">
                    Wholesaler
                </option>

            </select>

            <br /><br />
    

            <input
                type="file"
                onChange={(e)=>
                    setAvatar(
                        e.target.files[0]
                    )
                }
            />

            <br /><br />

            <button
                onClick={
                    handleRegister
                }
            >
                Register
            </button>

            <br /><br />

            <button
                onClick={
                    onBackToLogin
                }
            >
                Back To Login
            </button>

        </div>
    );
}

export default RegisterPage;