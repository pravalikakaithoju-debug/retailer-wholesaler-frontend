import { useState } from 'react';

import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {

    const [loggedIn, setLoggedIn] =
        useState(
            !!localStorage.getItem(
                'access'
            )
        );

    const [showRegister,
        setShowRegister] =
        useState(false);

    return (

        <div>

            {

                loggedIn ? (

                    <ChatPage />

                ) : showRegister ? (

                    <RegisterPage

                        onBackToLogin={() =>
                            setShowRegister(false)
                        }

                    />

                ) : (

                    <div>

                        <LoginPage

                            onLogin={() =>
                                setLoggedIn(true)
                            }

                        />

                        <div
                            style={{
                                textAlign: 'center',
                                marginTop: '20px'
                            }}
                        >

                            <button

                                onClick={() =>
                                    setShowRegister(
                                        true
                                    )
                                }

                            >

                                Create New Account

                            </button>

                        </div>

                    </div>

                )

            }

        </div>

    );
}

export default App;