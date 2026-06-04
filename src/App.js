import { useState } from 'react';

import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';

function App() {

    const [loggedIn, setLoggedIn] =
        useState(
            !!localStorage.getItem(
                'access'
            )
        );

    return (

        <div>

            {
                loggedIn

                    ? <ChatPage />

                    : <LoginPage
                        onLogin={() =>
                            setLoggedIn(true)
                        }
                    />
            }

        </div>
    );
}

export default App;