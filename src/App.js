import { useState } from 'react';

import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {

    const [loggedIn, setLoggedIn] =
        useState(
            !!sessionStorage.getItem('access')
            
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

    onShowRegister={() =>
        setShowRegister(true)
    }

/>

                        

                    </div>

                )

            }

        </div>

    );
}

export default App;